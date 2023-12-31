import {
  array,
  chainNB,
  duckdb_shell as ddbs,
  fs,
  SQLa_ingest_duckdb as ddbi,
  ws,
} from "./deps.ts";

import {
  ingestCsvFilesSourcesSupplier,
  ScreeningCsvFileIngestSource,
} from "./csv.ts";

import {
  ExcelSheetTodoIngestSource,
  ingestExcelSourcesSupplier,
  ScreeningExcelSheetIngestSource,
} from "./excel.ts";

export type PotentialIngestSource =
  | ScreeningCsvFileIngestSource<string>
  | ScreeningExcelSheetIngestSource<string>
  | ExcelSheetTodoIngestSource<string>
  | ddbi.ErrorIngestSource;

export function fsPatternIngestSourcesSupplier(
  govn: ddbi.IngestGovernance,
): ddbi.IngestSourcesSupplier<PotentialIngestSource, [string[] | undefined]> {
  return {
    sources: async (suggestedRootPaths?: string[]) => {
      const sources: PotentialIngestSource[] = [];
      const iss = [
        ingestCsvFilesSourcesSupplier(govn),
        ingestExcelSourcesSupplier(govn),
      ];
      const rootPaths = suggestedRootPaths ?? [Deno.cwd()];

      // loop through all the root paths and find patterns such as **/*.csv,
      // **/*.xlsx, etc. supplied in the `iss` array. For each file that
      // matches, obtain the source and put it into the result
      for (const rp of rootPaths) {
        for await (const entry of fs.walk(rp)) {
          if (entry.isFile) {
            for (const p of iss.filter((p) => p.pattern.test(entry.path))) {
              for (const s of await p.sources(entry)) {
                sources.push(s);
              }
            }
          }
        }
      }

      return sources;
    },
  };
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
  extends ddbi.IngestArgs<ddbi.IngestGovernance, IngestEngine> {
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
 * This Engine assumes that the Kernel observer will abort on Errors. If you want
 * to continue after an error, throw a IngestResumableError and use the second
 * cell argument (result) to test for it.
 *
 * This class is introspected and run using SQLa's Notebook infrastructure.
 * See: https://github.com/netspective-labs/sql-aide/tree/main/lib/notebook
 */
export class IngestEngine {
  protected potentialSources?: PotentialIngestSource[];
  protected sourcesStates: { assurable: boolean }[] = [];
  readonly duckdb: ddbs.DuckDbShell;

  constructor(
    readonly iss: ddbi.IngestSourcesSupplier<
      PotentialIngestSource,
      [string[] | undefined] // optional root paths
    >,
    readonly govn: ddbi.IngestGovernance,
    readonly args: IngestEngineArgs,
  ) {
    this.duckdb = new ddbs.DuckDbShell({
      duckdbCmd: "duckdb",
      dbDestFsPath: args.icDb,
    });
  }

  async init(isc: IngestStepContext) {
    const { govn, govn: { informationSchema: is }, args: { session } } = this;
    const sessionDML = await session.ingestSessionSqlDML();
    const beforeInit = Array.from(
      session.sqlCatalogSqlSuppliers("before-init"),
    );
    const afterInit = Array.from(session.sqlCatalogSqlSuppliers("after-init"));

    const initDDL = govn.SQL`      
      ${beforeInit.length > 0 ? beforeInit : "-- no before-init SQL found"}
      ${is.adminTables}
      ${is.adminTableIndexes}

      ${session.diagnosticsView()}

      -- register the current session and use the identifier for all logging
      ${sessionDML}
      
      ${afterInit.length > 0 ? afterInit : "-- no after-init SQL found"}`
      .SQL(this.govn.emitCtx);

    try {
      Deno.removeSync(this.args.icDb);
    } catch (_err) {
      // ignore errors if file does not exist
    }

    const status = await this.duckdb.execute(initDDL, isc.current.nbCellID);
    if (status.code != 0) {
      const diagsTmpFile = await this.duckdb.writeDiagnosticsSqlMD(
        initDDL,
        status,
      );
      // the kernel stops processing if it's not a IngestResumableError instance
      throw new Error(
        `duckdb.execute status in ${isc.current.nbCellID}() did not return zero, see ${diagsTmpFile}`,
      );
    }
  }

  async ingest(isc: IngestStepContext) {
    const { govn, govn: { emitCtx: ctx }, args: { session } } = this;
    const { sessionID } = await session.ingestSessionSqlDML();
    const assurables: {
      readonly psIndex: number; // the index in #potentialSources
      readonly source: PotentialIngestSource;
      readonly workflow: ReturnType<PotentialIngestSource["workflow"]>;
    }[] = [];

    let psIndex = 0;
    this.potentialSources = Array.from(
      await this.iss.sources(this.args.rootPaths),
    );
    for (const ps of this.potentialSources) {
      const { uri, tableName } = ps;

      const sessionEntryID = await govn.emitCtx.newUUID(
        govn.deterministicPKs,
      );
      const workflow = ps.workflow(sessionID, sessionEntryID);
      const checkStruct = await workflow.ingestSQL({
        sessionEntryInsertDML: () => {
          return govn.ingestSessionEntryCRF.insertDML({
            ingest_session_entry_id: sessionEntryID,
            session_id: sessionID,
            ingest_src: uri,
            ingest_table_name: tableName,
          });
        },
        issueInsertDML: async (message, type = "Structural") => {
          return govn.ingestSessionIssueCRF.insertDML({
            ingest_session_issue_id: await govn.emitCtx.newUUID(
              govn.deterministicPKs,
            ),
            session_id: sessionID,
            session_entry_id: sessionEntryID,
            issue_type: type,
            issue_message: message,
            invalid_value: uri,
          });
        },
        selectEntryIssues: () => ({
          SQL: () =>
            `SELECT * FROM ingest_session_issue WHERE session_id = '${sessionID}' and session_entry_id = '${sessionEntryID}'`,
        }),
      });

      // run the SQL and then emit the errors to STDOUT in JSON
      const status = await this.duckdb.jsonResult(
        checkStruct.SQL(ctx),
        `${isc.current.nbCellID}-${psIndex}`,
      );

      // if there were no errors, then add it to our list of content tables
      // whose content will be tested; if the structural validation fails
      // then no content checks will be performed.
      if (!status.stdout) {
        assurables.push({ psIndex, source: ps, workflow });
        this.sourcesStates[psIndex] = { assurable: true };
      } else {
        this.sourcesStates[psIndex] = { assurable: false };
      }

      psIndex++;
    }

    return assurables;
  }

  async ensureContent(
    isc: IngestStepContext,
    ingestResult: Awaited<ReturnType<typeof IngestEngine.prototype.ingest>>,
  ) {
    const { govn: { emitCtx: ctx } } = this;

    // any ingestions that did not produce structural errors will have SQL
    const assurableSQL = await Promise.all(
      ingestResult.map(async (sr) =>
        (await sr.workflow.assuranceSQL()).SQL(ctx)
      ),
    );

    await this.duckdb.execute(assurableSQL.join("\n"), isc.current.nbCellID);
  }

  async emitResources(isc: IngestStepContext) {
    const { args: { resourceDb, session } } = this;
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

      const beforeFinalize = session.sqlCatalogSqlText("before-finalize");
      const afterFinalize = session.sqlCatalogSqlText("after-finalize");

      // `beforeFinalize` SQL includes state management SQL that log all the
      // state changes between this notebooks' cells; however, the "exit" state
      // for this method will not be stored since this is the last step in the
      // process and the exit state will not be encountered before writing to
      // the database.

      // deno-fmt-ignore
      await this.duckdb.execute(ws.unindentWhitespace(`
        ${beforeFinalize.length > 0 ? `${beforeFinalize.join(";\n        ")};` : "-- no before-finalize SQL provided"}

        ATTACH '${resourceDb}' AS resource_db (TYPE SQLITE);

        ${adminTables.map(t => `CREATE TABLE resource_db.${t.tableName} AS SELECT * FROM ${t.tableName}`).join(";\n        ")};

        -- {contentResult.map(cr => \`CREATE TABLE resource_db.\${cr.iaSqlSupplier.tableName} AS SELECT * FROM \${cr.tableName}\`).join(";")};

        DETACH DATABASE resource_db;
        ${afterFinalize.length > 0 ? `${afterFinalize.join(";\n        ")};` : "-- no after-finalize SQL provided"}`), isc.current.nbCellID);
    }
  }

  // `finalize` means always run this even if errors abort
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
        COPY (SELECT * FROM ingest_session_diagnostic_text) TO '${diagsXlsx}' WITH (FORMAT GDAL, DRIVER 'xlsx');`),
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
          frontmatter: JSON.parse(
            JSON.stringify(
              {
                ...this.args,
                sources: this.potentialSources
                  ? array.distinctEntries(
                    this.potentialSources.map((ps, psIndex) => ({
                      uri: ps.uri,
                      nature: ps.nature,
                      tableName: ps.tableName,
                      assurable: this.sourcesStates[psIndex].assurable,
                    })),
                  )
                  : undefined,
              },
              (key, value) => key == "session" ? undefined : value,
            ),
          ), // deep copy only string-frienly properties
        }
        : undefined,
    });
  }
}
