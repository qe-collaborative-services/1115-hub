import {
  path,
  SQLa,
  SQLa_ddb_dialect as ddbd,
  SQLa_ddb_ingest as ddbi,
} from "../deps.ts";

// @deno-types="https://cdn.sheetjs.com/xlsx-0.20.1/package/types/index.d.ts"
import * as xlsx from "https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs";

export interface CsvFileIngestSource extends ddbi.IngestableResource {
  readonly nature: "CSV";
  readonly tableName: string;
}

export interface ExcelSheetIngestSource extends ddbi.IngestableResource {
  readonly nature: "Excel Workbook Sheet";
  readonly sheetName: string;
  readonly tableName: string;
  readonly sheetNameFound: boolean;
}

export class CsvAssuranceSupplier implements ddbi.IngestAssuranceSqlSupplier {
  constructor(
    readonly govn: ddbi.IngestGovernance,
    readonly iar: ddbi.IngestAssuranceRules,
    readonly source: CsvFileIngestSource,
  ) {
  }

  /**
   * Prepare SQL which when executed will prepare a DuckDB table to ingest a
   * CSV file.
   *
   * Also supplies SQL that will ensure that the structure of the table, such
   * as required columns, matches our expections. This SQL should be kept
   * minimal and only focus on assurance of structure not content.
   * @returns SQLa.SqlTextSupplier<EmitContext> instance with sessionID
   */
  // deno-lint-ignore require-await
  async ensureStructure() {
    const { govn, iar, source: { uri, tableName } } = this;
    const { ingestSessionIssue: isi } = govn;

    // deno-fmt-ignore
    const code = govn.SQL`
        ${govn.ingestSessionEntryCRF.insertDML({
          ingest_session_entry_id: iar.sessionEntryID,
          session_id: iar.sessionID,
          ingest_src: uri,
          ingest_table_name: tableName,
        })}
        
        ${ddbd.csvTableIntegration({
          csvSrcFsPath: () => uri, 
          tableName: tableName,
          extraColumnsSql: [
            "row_number() OVER () as src_file_row_number",
            `'${this.iar.sessionID}'`,
          ]
        })}
  
        ${iar.requiredColumnNamesInTable(tableName,
          ['PAT_MRN_ID', 'FACILITY', 'FIRST_NAME',
          'LAST_NAME', 'PAT_BIRTH_DATE', 'MEDICAID_CIN',
          'ENCOUNTER_ID', 'SURVEY', 'SURVEY_ID',
          'RECORDED_TIME', 'QUESTION', 'MEAS_VALUE',
          'QUESTION_CODE', 'QUESTION_CODE_SYSTEM_NAME', 'ANSWER_CODE',
          'ANSWER_CODE_SYSTEM_NAME', 'SDOH_DOMAIN', 'NEED_INDICATED',
          'VISIT_PART_2_FLAG', 'VISIT_OMH_FLAG', 'VISIT_OPWDD_FLAG'])}
        
        -- emit the errors for the given session (file) so it can be picked up
        SELECT * FROM ${isi.tableName} WHERE ${isi.columns.session_id.columnName} = '${iar.sessionID}' and ${isi.columns.session_entry_id.columnName} = '${iar.sessionEntryID}';`;

    return code;
  }

  // deno-lint-ignore require-await
  async ensureContent() {
    const { govn, iar, source: { tableName } } = this;

    // deno-fmt-ignore
    const code = govn.SQL`
      ${iar.intValueInAllTableRows(tableName, 'SURVEY_ID')}`;

    return code;
  }
}

export class ExcelAssuranceSupplier implements ddbi.IngestAssuranceSqlSupplier {
  constructor(
    readonly govn: ddbi.IngestGovernance,
    readonly iar: ddbi.IngestAssuranceRules,
    readonly source: ExcelSheetIngestSource,
  ) {
  }

  /**
   * Prepare SQL which when executed will prepare DuckDB tables to ingest a
   * an Excel workbook sheet.
   *
   * Also supplies SQL that will ensure that the structure of the tables, such
   * as required columns, matches our expections. This SQL should be kept
   * minimal and only focus on assurance of structure not content.
   * @returns SQLa.SqlTextSupplier<EmitContext> instance with sessionID
   */
  async ensureStructure() {
    const { govn, iar, source: { tableName, uri, sheetName } } = this;
    const { ingestSessionIssue: isi } = govn;

    const issueDML = async (message: string) =>
      govn.ingestSessionIssueCRF.insertDML({
        ingest_session_issue_id: await govn.emitCtx.newUUID(
          govn.deterministicPKs,
        ),
        session_id: iar.sessionID,
        session_entry_id: iar.sessionEntryID,
        issue_type: "Structural",
        issue_message: message,
        invalid_value: uri,
      });

    const isEntry = govn.ingestSessionEntryCRF.insertDML({
      ingest_session_entry_id: iar.sessionEntryID,
      session_id: iar.sessionID,
      ingest_src: uri,
      ingest_table_name: tableName,
    });

    if (!this.source.sheetNameFound) {
      // deno-fmt-ignore
      return govn.SQL`
        ${isEntry}  
        ${await issueDML(`Sheet '${sheetName}' not found in Excel workbook '${path.basename(uri)}'`)};

        -- emit the errors for the given session (sheet) so it can be picked up
        SELECT * FROM ${isi.tableName} WHERE ${isi.columns.session_id.columnName} = '${iar.sessionID}' and ${isi.columns.session_entry_id.columnName} = '${iar.sessionEntryID}';`;
    }

    // deno-fmt-ignore
    return govn.SQL`
      ${isEntry}  
      -- ingest '${sheetName}' into ${tableName}

      -- emit the errors for the given session (sheet) so it can be picked up
      SELECT * FROM ${isi.tableName} WHERE ${isi.columns.session_id.columnName} = '${iar.sessionID}' and ${isi.columns.session_entry_id.columnName} = '${iar.sessionEntryID}';`;
  }

  // deno-lint-ignore require-await
  async ensureContent() {
    const { govn, source: { tableName } } = this;

    // deno-fmt-ignore
    const code = govn.SQL`
      -- excel workbook content assurance ${tableName}`;

    return code;
  }
}

export function ingestSqlSuppliers(govn: ddbi.IngestGovernance) {
  return async (
    fsPath: string,
    iarSupplier: (tableName: string) => Promise<ddbi.IngestAssuranceRules>,
  ): Promise<Iterable<ddbi.IngestAssuranceSqlSupplier> | undefined> => {
    if (fsPath.toLocaleLowerCase().endsWith("csv")) {
      const csvSrc: CsvFileIngestSource = {
        nature: "CSV",
        uri: fsPath,
        tableName: govn.toSnakeCase(path.basename(fsPath, ".csv")),
      };
      const iar = await iarSupplier(csvSrc.tableName);
      return [new CsvAssuranceSupplier(govn, iar, csvSrc)];
    }

    if (fsPath.toLocaleLowerCase().endsWith("xlsx")) {
      try {
        const wb = xlsx.readFile(fsPath);
        const sheets = [{ name: "Admin_Demographic" }, { name: "Screening" }, {
          name: "QE_Admin_Data",
        }];
        const sources: ExcelSheetIngestSource[] = [];
        for (const sh of sheets) {
          const sheetSrc: ExcelSheetIngestSource = {
            nature: "Excel Workbook Sheet",
            uri: fsPath,
            sheetName: sh.name,
            tableName: govn.toSnakeCase(
              path.basename(fsPath, ".xlsx") + "_" + sh.name,
            ),
            sheetNameFound: wb.SheetNames.find((sn) => sn == sh.name)
              ? true
              : false,
          };
          sources.push(sheetSrc);
        }
        const excelSuppliers: ExcelAssuranceSupplier[] = [];
        for (const src of sources) {
          const sheetIAR = await iarSupplier(src.tableName);
          excelSuppliers.push(
            new ExcelAssuranceSupplier(govn, sheetIAR, src),
          );
        }
        return excelSuppliers;
      } catch (err) {
        console.error(err);
      }
    }

    return undefined;
  };
}
