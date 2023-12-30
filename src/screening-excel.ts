import { fs, path, SQLa_ingest_duckdb as ddbi } from "./deps.ts";
import * as sg from "./screening-govn.ts";

// @deno-types="https://cdn.sheetjs.com/xlsx-0.20.1/package/types/index.d.ts"
import * as xlsx from "https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs";

export const excelWorkbookSheetNames = [
  "Admin_Demographic",
  "Screening",
  "QE_Admin_Data",
] as const;
export type ExcelWorkbookSheetName = typeof excelWorkbookSheetNames[number];

export class ExcelSheetTodoIngestSource<SheetName extends string>
  implements ddbi.ExcelSheetIngestSource<SheetName, string> {
  readonly nature = "Excel Workbook Sheet";
  readonly tableName: string;
  constructor(
    readonly uri: string,
    readonly sheetName: SheetName,
    readonly govn: ddbi.IngestGovernance,
  ) {
    this.tableName = govn.toSnakeCase(
      path.basename(uri, ".xlsx") + "_" + sheetName,
    );
  }

  workflow(): ReturnType<
    ddbi.ExcelSheetIngestSource<string, string>["workflow"]
  > {
    return {
      ingestSQL: async (issac) =>
        // deno-fmt-ignore
        this.govn.SQL`
          -- required by IngestEngine, setup the ingestion entry for logging
          ${await issac.sessionEntryInsertDML()}
        
          ${await issac.issueInsertDML(`Excel workbook '${path.basename(this.uri)}' sheet '${this.sheetName}' has not been implemented yet.`, "TODO")};
          
          -- required by IngestEngine, emit the errors for the given session (file) so it can be picked up
          ${issac.selectEntryIssues()}`,
      assuranceSQL: () =>
        this.govn.SQL`-- Sheet '${this.sheetName}' ingestion not implemented.`,
    };
  }
}

export class ScreeningExcelSheetIngestSource<TableName extends string>
  implements ddbi.ExcelSheetIngestSource<"Screening", TableName> {
  readonly nature = "Excel Workbook Sheet";
  readonly sheetName = "Screening";
  readonly tableName: TableName;
  constructor(
    readonly uri: string,
    readonly govn: ddbi.IngestGovernance,
  ) {
    this.tableName = govn.toSnakeCase(
      path.basename(uri, ".xlsx") + "_" + this.sheetName,
    ) as TableName;
  }

  workflow(
    sessionID: string,
    sessionEntryID: string,
  ): ReturnType<
    ddbi.ExcelSheetIngestSource<"Screening", TableName>["workflow"]
  > {
    const sar = new sg.ScreeningAssuranceRules(
      this.tableName,
      sessionID,
      sessionEntryID,
      this.govn,
    );

    return {
      ingestSQL: async (issac) => await this.ingestSQL(issac, sar),
      assuranceSQL: async () => await this.assuranceSQL(),
    };
  }

  async ingestSQL(
    issac: ddbi.IngestSourceStructAssuranceContext,
    sar: sg.ScreeningAssuranceRules<string>,
  ) {
    const { sheetName, tableName, uri } = this;
    const { sessionID, sessionEntryID } = sar;

    // deno-fmt-ignore
    return this.govn.SQL`
      -- required by IngestEngine, setup the ingestion entry for logging
      ${await issac.sessionEntryInsertDML()}
     
      -- ingest Excel workbook sheet '${sheetName}' into ${tableName} using spatial plugin
      INSTALL spatial; LOAD spatial;

      -- be sure to add src_file_row_number and session_id columns to each row
      -- because assurance CTEs require them
      CREATE TABLE ${tableName} AS
        SELECT *, row_number() OVER () as src_file_row_number, '${sessionID}' as session_id, '${sessionEntryID}' as session_entry_id
          FROM st_read('${uri}', layer='${sheetName}', open_options=['HEADERS=FORCE', 'FIELD_TYPES=AUTO']);          
      
      ${sar.requiredColumnNames()}

      -- required by IngestEngine, emit the errors for the given session (file) so it can be picked up
      ${issac.selectEntryIssues()}`
  }

  // deno-lint-ignore require-await
  async assuranceSQL() {
    // deno-fmt-ignore
    return this.govn.SQL`-- Sheet '${this.sheetName}' has no assurance SQL in Excel workbook '${path.basename(this.uri)}'`;
  }
}

export function ingestExcelSourcesSupplier(
  govn: ddbi.IngestGovernance,
): ddbi.IngestFsPatternSourcesSupplier<
  | ScreeningExcelSheetIngestSource<string>
  | ExcelSheetTodoIngestSource<string>
  | ddbi.ErrorIngestSource
> {
  return {
    pattern: path.globToRegExp("**/*.xlsx", {
      extended: true,
      globstar: true,
    }),
    sources: (entry: fs.WalkEntry) => {
      const uri = entry.path;
      const sources: (
        | ScreeningExcelSheetIngestSource<string>
        | ExcelSheetTodoIngestSource<string>
        | ddbi.ErrorIngestSource
      )[] = [];

      const sheetsExpected: Record<
        ExcelWorkbookSheetName,
        () =>
          | ExcelSheetTodoIngestSource<string>
          | ScreeningExcelSheetIngestSource<string>
      > = {
        "Admin_Demographic": () =>
          new ExcelSheetTodoIngestSource(
            uri,
            "Admin_Demographic",
            govn,
          ),
        "Screening": () => new ScreeningExcelSheetIngestSource(uri, govn),
        "QE_Admin_Data": () =>
          new ExcelSheetTodoIngestSource(uri, "QE_Admin_Data", govn),
      };

      try {
        const wb = xlsx.readFile(entry.path);

        // deno-fmt-ignore
        const sheetNotFound = (name: string) =>
          Error(`Excel workbook sheet '${name}' not found in '${path.basename(entry.path)}' (available: ${wb.SheetNames.join(", ")})`);

        let sheetsFound = 0;
        const expectedSheetNames = Object.keys(sheetsExpected);
        for (const expectedSN of expectedSheetNames) {
          if (wb.SheetNames.find((sn) => sn == expectedSN)) {
            sheetsFound++;
          } else {
            sources.push(
              new ddbi.ErrorIngestSource(
                uri,
                sheetNotFound(expectedSN),
                "Sheet Missing",
                govn,
              ),
            );
          }
        }

        if (expectedSheetNames.length == sheetsFound) {
          for (const newSourceInstance of Object.values(sheetsExpected)) {
            sources.push(newSourceInstance());
          }
        }
      } catch (err) {
        sources.push(
          new ddbi.ErrorIngestSource(entry.path, err, "ERROR", govn),
        );
      }
      return sources;
    },
  };
}
