import {
  chainNB,
  duckdb_shell as ddbs,
  fs,
  path,
  SQLa,
  SQLa_ddb_dialect as ddbd,
  SQLa_ddb_ingestnb as ddbinb,
  ws,
} from "../deps.ts";

// @deno-types="https://cdn.sheetjs.com/xlsx-0.20.1/package/types/index.d.ts"
import * as xlsx from "https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs";

export interface CsvFileIngestSource extends ddbinb.IngestableResource {
  readonly nature: "CSV";
  readonly tableName: string;
  readonly iaRules: (sessionID: string, sessionEntryID: string, govn: {
    readonly SQL: ReturnType<typeof SQLa.SQL<ddbinb.IngestEmitContext>>;
  }) => ddbinb.IngestAssuranceRules;
}

export interface ExcelSheetIngestSource extends ddbinb.IngestableResource {
  readonly nature: "Excel Workbook Sheet";
  readonly sheetName: string;
  readonly tableName: string;
  readonly sheetNameFound: boolean;
  readonly iaRules: (sessionID: string, sessionEntryID: string, govn: {
    readonly SQL: ReturnType<typeof SQLa.SQL<ddbinb.IngestEmitContext>>;
  }) => ddbinb.IngestAssuranceRules;
}

export interface IngestSourceFactory {
  readonly pattern: RegExp;
  readonly sources: (
    entry: fs.WalkEntry,
  ) => Iterable<CsvFileIngestSource | ExcelSheetIngestSource>;
}

export function csvFileIngestSourceFactory(
  govn: ddbinb.IngestGovernance,
): IngestSourceFactory {
  return {
    pattern: path.globToRegExp("**/*.csv", {
      extended: true,
      globstar: true,
    }),
    sources: (entry: fs.WalkEntry) => {
      const csvSrc: CsvFileIngestSource = {
        nature: "CSV",
        uri: entry.path,
        tableName: govn.toSnakeCase(path.basename(entry.path, ".csv")),
        iaRules: (sessionID, sessionEntryID, govn) =>
          new ddbinb.IngestAssuranceRules(sessionID, sessionEntryID, govn),
      };
      return [csvSrc];
    },
  };
}

export function excelSheetIngestSourceFactory(
  govn: ddbinb.IngestGovernance,
): IngestSourceFactory {
  return {
    pattern: path.globToRegExp("**/*.xlsx", {
      extended: true,
      globstar: true,
    }),
    sources: (entry: fs.WalkEntry) => {
      const sources: ExcelSheetIngestSource[] = [];
      try {
        const wb = xlsx.readFile(entry.path);
        const sheets = [
          { name: "Admin_Demographic" },
          { name: "Screening" },
          { name: "QE_Admin_Data" },
        ];
        for (const sh of sheets) {
          const sheetSrc: ExcelSheetIngestSource = {
            nature: "Excel Workbook Sheet",
            uri: entry.path,
            sheetName: sh.name,
            tableName: govn.toSnakeCase(
              path.basename(entry.path, ".xlsx") + "_" + sh.name,
            ),
            sheetNameFound: wb.SheetNames.find((sn) => sn == sh.name)
              ? true
              : false,
            iaRules: (sessionID, sessionEntryID, govn) =>
              new ddbinb.IngestAssuranceRules(sessionID, sessionEntryID, govn),
          };
          sources.push(sheetSrc);
        }
      } catch (err) {
        console.error(err);
      }
      return sources;
    },
  };
}

export function potentialSources(
  govn: ddbinb.IngestGovernance,
  suggestedRootPaths?: string[],
) {
  const sources: (CsvFileIngestSource | ExcelSheetIngestSource)[] = [];
  const patterns = [
    csvFileIngestSourceFactory(govn),
    excelSheetIngestSourceFactory(govn),
  ];
  const rootPaths = suggestedRootPaths ?? [Deno.cwd()];

  for (const rp of rootPaths) {
    for (const entry of fs.walkSync(rp)) {
      if (entry.isFile) {
        for (const p of patterns.filter((p) => p.pattern.test(entry.path))) {
          sources.push(...Array.from(p.sources(entry)));
        }
      }
    }
  }

  return sources;
}

export type IngestStep = chainNB.NotebookCell<
  IngestEngine,
  chainNB.NotebookCellID<IngestEngine>
>;
export type IngestStepContext = chainNB.NotebookCellContext<
  IngestEngine,
  IngestStep
>;
export const ieDescr = new chainNB.NotebookDescriptor<
  IngestEngine,
  IngestStep
>();

export interface IngestEngineArgs
  extends ddbinb.IngestArgs<ddbinb.IngestGovernance, IngestEngine> {
  readonly icDb: string;
  readonly rootPaths?: string[];
  readonly diagsJson?: string;
  readonly diagsXlsx?: string;
  readonly diagsMd?: string;
  readonly resourceDb?: string;
}

/**
 * Use IngestEngine to prepare SQL for ingestion steps and execute them
 * using DuckDB CLI engine. Each method that does not have a @ieDescr.disregard()
 * attribute is considered a "step" and each step is executed in the order it is
 * declared. As each step is executed, its error or results are passed to the
 * next method.
 *
 * This class is introspected and run using SQLa's Notebook infrastructure.
 * See: https://github.com/netspective-labs/sql-aide/tree/main/lib/notebook
 */
export class IngestEngine {
  #potentialSources?: {
    readonly potential: CsvFileIngestSource | ExcelSheetIngestSource;
    consumed: boolean;
  }[];
  #ingested: {
    readonly psIndex: number; // the index in #potentialSources
    readonly source: CsvFileIngestSource | ExcelSheetIngestSource;
    readonly iaRules: ddbinb.IngestAssuranceRules;
    readonly ensureContent: () =>
      | SQLa.SqlTextSupplier<ddbinb.IngestEmitContext>
      | Promise<
        SQLa.SqlTextSupplier<ddbinb.IngestEmitContext>
      >;
  }[] = [];
  readonly duckdb: ddbs.DuckDbShell;

  constructor(
    readonly govn: ddbinb.IngestGovernance,
    readonly args: IngestEngineArgs,
  ) {
    this.duckdb = new ddbs.DuckDbShell({
      duckdbCmd: "duckdb",
      dbDestFsPath: args.icDb,
    });
  }

  potentialSources<IS extends CsvFileIngestSource | ExcelSheetIngestSource>(
    nature: "CSV" | "Excel Workbook Sheet",
  ) {
    if (this.#potentialSources) {
      return this.#potentialSources.filter((ps) =>
        ps.potential.nature == nature
      ) as {
        readonly potential: IS;
        consumed: boolean;
      }[];
    }
    return [];
  }

  async prepareAdminInfra(isc: IngestStepContext) {
    const { govn, govn: { informationSchema: is }, args } = this;
    const sessionDML = await govn.ingestSessionSqlDML();
    const beforeInit = Array.from(args.sqlRegister.catalog["before-init"]);
    const afterInit = Array.from(args.sqlRegister.catalog["after-init"]);

    const initDDL = govn.SQL`      
      ${beforeInit.length > 0 ? beforeInit : "-- no before-init SQL found"}
      ${is.adminTables}
      ${is.adminTableIndexes}

      ${sessionDML}
      
      ${afterInit.length > 0 ? afterInit : "-- no after-init SQL found"}`.SQL(
      this.govn.emitCtx,
    );

    try {
      Deno.removeSync(this.args.icDb);
    } catch (_err) {
      // ignore errors if file does not exist
    }

    const status = await this.duckdb.execute(initDDL, isc.current.nbCellID);
    return { status, initDDL };
  }

  async walkSources(
    isc: IngestStepContext,
    initResult:
      | Error
      | Awaited<ReturnType<typeof IngestEngine.prototype.prepareAdminInfra>>,
  ) {
    if (initResult instanceof Error) {
      console.error(
        `${isc.previous?.current.nbCellID} was not successful`,
        initResult,
      );
      return initResult;
    }

    if (initResult.status.code != 0) {
      const diagsTmpFile = await this.duckdb.writeDiagnosticsSqlMD(
        initResult.initDDL,
        initResult.status,
      );
      console.error(
        `${isc.previous?.current.nbCellID} did not return zero, see ${diagsTmpFile}`,
      );
      return undefined;
    }

    this.#potentialSources = potentialSources(this.govn, this.args.rootPaths)
      .map((ps) => ({
        potential: ps,
        consumed: false,
      }));
  }

  async ingestCsvSources(isc: IngestStepContext) {
    const { govn, govn: { emitCtx: ctx } } = this;
    const { sessionID } = await govn.ingestSessionSqlDML();
    let psIndex = 0;
    for (const ps of this.potentialSources<CsvFileIngestSource>("CSV")) {
      const { potential: { uri, tableName } } = ps;

      const sessionEntryID = await govn.emitCtx.newUUID(
        govn.deterministicPKs,
      );
      const iar = ps.potential.iaRules(sessionID, sessionEntryID, govn);

      // deno-fmt-ignore
      const checkStruct = govn.SQL`
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
            `'${sessionID}'`,
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
        ${iar.selectEntryIssues()}`;

      // run the SQL and then emit the errors to STDOUT in JSON
      const status = await this.duckdb.jsonResult(
        checkStruct.SQL(ctx),
        `${isc.current.nbCellID}-${psIndex}`,
      );

      // if there were no errors, then add it to our list of content tables
      // whose content will be tested; if the structural validation fails
      // then no content checks will be performed.
      if (!status.stdout) {
        ps.consumed = true;
        this.#ingested.push({
          psIndex,
          source: ps.potential,
          iaRules: iar,
          ensureContent: () => {
            // deno-fmt-ignore
            return govn.SQL`
              ${iar.intValueInAllTableRows(tableName, 'SURVEY_ID')}`;
          },
        });
      }

      psIndex++;
    }
  }

  async ingestExcelSources(isc: IngestStepContext) {
    const { govn, govn: { emitCtx: ctx } } = this;
    const { sessionID } = await govn.ingestSessionSqlDML();
    let psIndex = 0;
    for (
      const ps of this.potentialSources<ExcelSheetIngestSource>(
        "Excel Workbook Sheet",
      )
    ) {
      const { potential: { uri, tableName, sheetName, sheetNameFound } } = ps;

      const sessionEntryID = await govn.emitCtx.newUUID(
        govn.deterministicPKs,
      );
      const iar = ps.potential.iaRules(sessionID, sessionEntryID, govn);

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

      // deno-fmt-ignore
      const checkStruct = sheetNameFound 
        ? govn.SQL`
            ${isEntry}
            
            -- ingest '${sheetName}' into ${tableName}
            
            -- emit the errors for the given session (file) so it can be picked up
            ${iar.selectEntryIssues()}` 
        : govn.SQL`
            ${isEntry}
            ${await issueDML(`Sheet '${sheetName}' not found in Excel workbook '${path.basename(uri)}'`)};
    
            -- emit the errors for the given session (file) so it can be picked up
            ${iar.selectEntryIssues()}`;

      // run the SQL and then emit the errors to STDOUT in JSON
      const status = await this.duckdb.jsonResult(
        checkStruct.SQL(ctx),
        `${isc.current.nbCellID}-${psIndex}`,
      );

      // if there were no errors, then add it to our list of content tables
      // whose content will be tested; if the structural validation fails
      // then no content checks will be performed.
      if (!status.stdout) {
        ps.consumed = true;
        this.#ingested.push({
          psIndex,
          source: ps.potential,
          iaRules: iar,
          ensureContent: () => {
            // deno-fmt-ignore
            return govn.SQL`
              -- ensure Excel Workbook Sheet content '${tableName}'`;
          },
        });
      }

      psIndex++;
    }
  }

  async ensureContent(isc: IngestStepContext) {
    const { govn: { emitCtx: ctx } } = this;
    await this.duckdb.execute(
      (await Promise.all(
        this.#ingested.map(async (sr) => (await sr.ensureContent()).SQL(ctx)),
      )).join("\n"),
      isc.current.nbCellID,
    );
  }

  async emitResources(isc: IngestStepContext) {
    const { args: { resourceDb } } = this;
    if (resourceDb) {
      try {
        Deno.removeSync(resourceDb);
      } catch (_err) {
        // ignore errors if file does not exist
      }

      const adminTables = [
        this.govn.ingestSession,
        this.govn.ingestSessionEntry,
        this.govn.ingestSessionState,
        this.govn.ingestSessionIssue,
      ];

      const beforeFinalize = Array.from(
        this.args.sqlRegister.catalog["before-finalize"],
      ).map((dml) => dml.SQL(this.govn.emitCtx)).join(";\n        ");
      const afterFinalize = Array.from(
        this.args.sqlRegister.catalog["after-finalize"],
      ).map((dml) => dml.SQL(this.govn.emitCtx)).join(";\n        ");

      // deno-fmt-ignore
      await this.duckdb.execute(ws.unindentWhitespace(`
        ${beforeFinalize.length > 0 ? `${beforeFinalize};` : "-- no before-finalize SQL provided"}

        ATTACH '${resourceDb}' AS resource_db (TYPE SQLITE);

        ${adminTables.map(t => `CREATE TABLE resource_db.${t.tableName} AS SELECT * FROM ${t.tableName}`).join(";\n        ")};

        -- {contentResult.map(cr => \`CREATE TABLE resource_db.\${cr.iaSqlSupplier.tableName} AS SELECT * FROM \${cr.tableName}\`).join(";")};

        DETACH DATABASE resource_db;
        ${afterFinalize.length > 0 ? `${afterFinalize};` : "-- no after-finalize SQL provided"}`), isc.current.nbCellID);
    }
  }

  @ieDescr.finalize()
  async emitDiagnostics() {
    const { args: { diagsXlsx } } = this;
    if (diagsXlsx) {
      // if Excel workbook already exists, GDAL xlsx driver will error
      try {
        Deno.removeSync(diagsXlsx);
      } catch (_err) {
        // ignore errors if file does not exist
      }

      // deno-fmt-ignore
      await this.duckdb.execute(ws.unindentWhitespace(`
        INSTALL spatial; LOAD spatial;
        -- TODO: join with ingest_session table to give all the results in one sheet
        COPY (SELECT * FROM ingest_session_issue) TO '${diagsXlsx}' WITH (FORMAT GDAL, DRIVER 'xlsx');`),
        'emitDiagnostics'
      );
    }

    this.duckdb.emitDiagnostics({
      emitJson: this.args.diagsJson
        ? async (json) => await Deno.writeTextFile(this.args.diagsJson!, json)
        : undefined,
      diagsMd: this.args.diagsMd
        ? {
          emit: async (md) => await Deno.writeTextFile(this.args.diagsMd!, md),
          frontmatter: JSON.parse(JSON.stringify(this.args, (key, value) =>
            key == "sqlRegister" ? undefined : value)), // deep copy only string-frienly properties
        }
        : undefined,
    });
  }
}

if (import.meta.main) {
  const govn = new ddbinb.IngestGovernance(true);
  const args: IngestEngineArgs = {
    sqlRegister: ddbinb.ingestSqlRegister(),
    rootPaths: ["support/assurance/synthetic-content"],
    icDb: "support/assurance/results-test-e2e/ingestion-center.duckdb",
    // diagsJson: "support/assurance/results-test-e2e/diagnostics.json",
    diagsMd: "support/assurance/results-test-e2e/diagnostics.md",
    diagsXlsx: "support/assurance/results-test-e2e/diagnostics.xlsx",
    resourceDb: "support/assurance/results-test-e2e/resource.sqlite.db",
    emitDagPuml: async (puml, _previewUrl) => {
      await Deno.writeTextFile(
        "support/assurance/results-test-e2e/dag.puml",
        puml,
      );
    },
  };
  await ddbinb.ingest(IngestEngine.prototype, ieDescr, {
    govn,
    newInstance: () => new IngestEngine(govn, args),
  }, args);
}
