import {
  array,
  chainNB,
  fs,
  SQLa_orch as o,
  SQLa_orch_duckdb as ddbo,
  ws,
} from "./deps.ts";
import * as sp from "./sqlpage.ts";

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
  | o.ErrorIngestSource<
    ddbo.DuckDbOrchGovernance,
    ddbo.DuckDbOrchEmitContext
  >;

export function fsPatternIngestSourcesSupplier(
  govn: ddbo.DuckDbOrchGovernance,
): o.IngestSourcesSupplier<PotentialIngestSource, [string[] | undefined]> {
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

export type OrchStep = chainNB.NotebookCell<
  OrchEngine,
  chainNB.NotebookCellID<OrchEngine>
>;
export type OrchStepContext = chainNB.NotebookCellContext<OrchEngine, OrchStep>;
export const oeDescr = new chainNB.NotebookDescriptor<OrchEngine, OrchStep>();

export interface OrchEngineArgs extends
  o.OrchArgs<
    ddbo.DuckDbOrchGovernance,
    OrchEngine,
    ddbo.DuckDbOrchEmitContext
  > {
  readonly duckDbDestFsPathSupplier: (identity?: string) => string;
  readonly prepareDuckDbFsPath?: (duckDbDestFsPath: string) => Promise<void>;
  readonly walkRootPaths?: string[];
  readonly diagsJson?: string;
  readonly diagsXlsx?: string;
  readonly diagsMd?: string;
  readonly resourceDb?: string;
}

/**
 * Use OrchEngine to prepare SQL for orchestration steps and execute them
 * using DuckDB CLI engine. Each method that does not have a @ieDescr.disregard()
 * attribute is considered a "step" and each step is executed in the order it is
 * declared. As each step is executed, its error or results are passed to the
 * next method.
 *
 * This Engine assumes that the Kernel observer will abort on Errors. If you want
 * to continue after an error, throw a OrchResumableError and use the second
 * cell argument (result) to test for it.
 *
 * This class is introspected and run using SQLa's Notebook infrastructure.
 * See: https://github.com/netspective-labs/sql-aide/tree/main/lib/notebook
 */
export class OrchEngine {
  protected potentialSources?: PotentialIngestSource[];
  protected ingestables?: {
    readonly psIndex: number; // the index in #potentialSources
    readonly source: PotentialIngestSource;
    readonly workflow: ReturnType<PotentialIngestSource["workflow"]>;
    readonly sessionEntryID: string;
    readonly sql: string;
    readonly issues: {
      readonly session_entry_id: string;
      readonly orch_session_issue_id: string;
      readonly issue_type: string;
      readonly issue_message: string;
      readonly invalid_value: string;
    }[];
  }[];
  readonly duckdb: ddbo.DuckDbShell;

  constructor(
    readonly iss: o.IngestSourcesSupplier<
      PotentialIngestSource,
      [string[] | undefined] // optional root paths
    >,
    readonly govn: ddbo.DuckDbOrchGovernance,
    readonly args: OrchEngineArgs,
  ) {
    this.duckdb = new ddbo.DuckDbShell(args.session, {
      duckdbCmd: "duckdb",
      dbDestFsPathSupplier: args.duckDbDestFsPathSupplier,
      preambleSQL: () =>
        `-- preambleSQL\nSET autoinstall_known_extensions=true;\nSET autoload_known_extensions=true;\n-- end preambleSQL\n`,
    });
  }

  /**
   * Prepare the DuckDB path/database for initialization. Typically this gives
   * a chance for the path to the database to be created or removing the existing
   * database in case we want to initialize from scratch.
   * @param osc the type-safe notebook cell context for diagnostics or business rules
   */
  async prepareInit(osc: OrchStepContext) {
    const duckDbFsPath = this.duckdb.args.dbDestFsPathSupplier(
      osc.current.nbCellID,
    );
    await this.args.prepareDuckDbFsPath?.(duckDbFsPath);
  }

  /**
   * Initialize the DuckDB database by ensuring the admin tables such as tracking
   * orchestration events (states), activities (which files are being loaded), ingest
   * issues (errors, etc.), and related  entities are created. If there are any
   * errors during this process all other processing should stop and no other steps
   * are executed.
   * @param osc the type-safe notebook cell context for diagnostics or business rules
   */
  async init(osc: OrchStepContext) {
    const { govn, govn: { informationSchema: is }, args: { session } } = this;
    const beforeInit = Array.from(
      session.sqlCatalogSqlSuppliers("before-init"),
    );
    const afterInit = Array.from(session.sqlCatalogSqlSuppliers("after-init"));

    const initDDL = govn.SQL`      
      ${beforeInit.length > 0 ? beforeInit : "-- no before-init SQL found"}
      ${is.adminTables}
      ${is.adminTableIndexes}

      ${session.diagnosticsView()}

      -- register the current device and session and use the identifiers for all logging
      ${await session.deviceSqlDML()}
      ${await session.orchSessionSqlDML()}
      
      ${afterInit.length > 0 ? afterInit : "-- no after-init SQL found"}`
      .SQL(this.govn.emitCtx);

    const execResult = await this.duckdb.execute(initDDL, osc.current.nbCellID);
    if (execResult.status.code != 0) {
      const diagsTmpFile = await this.duckdb.writeDiagnosticsSqlMD(
        initDDL,
        execResult.status,
      );
      // the kernel stops processing if it's not a OrchResumableError instance
      throw new Error(
        `duckdb.execute status in ${osc.current.nbCellID}() did not return zero, see ${diagsTmpFile}`,
      );
    }
  }

  /**
   * Walk the root paths, find all types of files we can handle, generate
   * ingestion SQL ("loading" part of ELT/ETL) and execute the SQL in a single
   * DuckDB call. Then, for each successful execution (any ingestions that do
   * not create issues in the issue table) prepare the list of subsequent steps
   * for further cleansing, validation, transformations, etc.
   *
   * The reason why we separate initial ingestion and structural validation from
   * content validation, cleansing, and transformations is because content
   * SQL relies on table names and table column names in CTEs and other SQL
   * which must exist otherwise they cause syntax errors. Once we validate the
   * structure and columns of ingested data, then the remainder of the SQL for
   * cleansing, validation, or transformations will not cause syntax errors.
   *
   * @param osc the type-safe notebook cell context for diagnostics or business rules
   * @returns list of "assurables" that did not generate any ingestion issues
   */
  async ingest(osc: OrchStepContext) {
    const { govn, govn: { emitCtx: ctx }, args: { session } } = this;
    const { sessionID } = await session.orchSessionSqlDML();

    let psIndex = 0;
    this.potentialSources = Array.from(
      await this.iss.sources(this.args.walkRootPaths),
    );
    this.ingestables = [];
    for (const ps of this.potentialSources) {
      const { uri, tableName } = ps;

      const sessionEntryID = await govn.emitCtx.newUUID(
        govn.deterministicPKs,
      );
      const workflow = ps.workflow(sessionID, sessionEntryID);
      const checkStruct = await workflow.ingestSQL({
        sessionEntryInsertDML: () => {
          return govn.orchSessionEntryCRF.insertDML({
            orch_session_entry_id: sessionEntryID,
            session_id: sessionID,
            ingest_src: uri,
            ingest_table_name: tableName,
          });
        },
        issueInsertDML: async (message, type = "Structural") => {
          return govn.orchSessionIssueCRF.insertDML({
            orch_session_issue_id: await govn.emitCtx.newUUID(
              govn.deterministicPKs,
            ),
            session_id: sessionID,
            session_entry_id: sessionEntryID,
            issue_type: type,
            issue_message: message,
            invalid_value: uri,
          });
        },
      });

      this.ingestables.push({
        psIndex,
        sessionEntryID,
        sql: `-- ${osc.current.nbCellID} ${uri} (${tableName})\n` +
          checkStruct.SQL(ctx),
        source: ps,
        workflow,
        issues: [],
      });
      psIndex++;
    }

    // run the SQL and then emit the errors to STDOUT in JSON
    const ingestSQL = this.ingestables.map((ic) => ic.sql);
    ingestSQL.push(
      `SELECT session_entry_id, orch_session_issue_id, issue_type, issue_message, invalid_value FROM orch_session_issue WHERE session_id = '${sessionID}'`,
    );
    const ingestResult = await this.duckdb.jsonResult<
      (typeof this.ingestables[number]["issues"])[number]
    >(
      ingestSQL.join("\n"),
      osc.current.nbCellID,
    );
    if (ingestResult.json) {
      // if errors were found, put the problems into the proper ingestable issues
      for (const row of ingestResult.json) {
        const ingestable = this.ingestables.find((i) =>
          i.sessionEntryID == row.session_entry_id
        );
        if (ingestable) ingestable.issues.push(row);
      }
    }

    // for the next step (ensureContent) we only want to pursue remainder of
    // ingestion for those ingestables that didn't have errors during construction
    return this.ingestables.filter((i) => i.issues.length == 0);
  }

  /**
   * For all ingestions from the previous step that did not create any issues
   * (meaning they were successfully ingested), prepare all cleansing,
   * validation, transformation and other SQL and then execute entire SQL as a
   * single DuckDB instance call.
   *
   * The content SQL is separated from structural SQL to avoid syntax errors
   * when a table or table column does not exist (which can happen if the format
   * or structure of an ingested CSV, Excel, Parquet, or other source does not
   * match our expectations).
   *
   * @param osc the type-safe notebook cell context for diagnostics or business rules
   * @param ingestResult the list of successful ingestions from the previous step
   */
  async ensureContent(
    osc: OrchStepContext,
    ingestResult: Awaited<ReturnType<typeof OrchEngine.prototype.ingest>>,
  ) {
    const { govn: { emitCtx: ctx } } = this;

    // any ingestions that did not produce structural errors will have SQL
    const assurableSQL = await Promise.all(
      ingestResult.map(async (sr) =>
        (await sr.workflow.assuranceSQL()).SQL(ctx)
      ),
    );

    await this.duckdb.execute(assurableSQL.join("\n"), osc.current.nbCellID);
    return ingestResult;
  }

  async emitResources(
    isc: OrchStepContext,
    ensureResult: Awaited<
      ReturnType<typeof OrchEngine.prototype.ensureContent>
    >,
  ) {
    const { args: { resourceDb, session }, govn: { emitCtx: ctx } } = this;
    if (resourceDb) {
      try {
        Deno.removeSync(resourceDb);
      } catch (_err) {
        // ignore errors if file does not exist
      }

      const spc = sp.SQLPageNotebook.create(this.govn);
      const adminTables = [
        this.govn.device,
        this.govn.orchSession,
        this.govn.orchSessionEntry,
        this.govn.orchSessionState,
        this.govn.orchSessionExec,
        this.govn.orchSessionIssue,
        spc.table,
      ];

      const beforeFinalize = session.sqlCatalogSqlText("before-finalize");
      const afterFinalize = session.sqlCatalogSqlText("after-finalize");
      const rdbSchemaName = "resource_db";

      const exportsSQL = await Promise.all(
        ensureResult.map(async (sr) =>
          (await sr.workflow.exportResourceSQL(rdbSchemaName)).SQL(ctx)
        ),
      );

      // `beforeFinalize` SQL includes state management SQL that log all the
      // state changes between this notebooks' cells; however, the "exit" state
      // for this method will not be stored since this is the last step in the
      // process and the exit state will not be encountered before writing to
      // the database.

      // deno-fmt-ignore
      await this.duckdb.execute(ws.unindentWhitespace(`
        ${beforeFinalize.length > 0 ? `${beforeFinalize.join(";\n        ")};` : "-- no before-finalize SQL provided"}

        -- emit all the SQLPage content
        ${((await spc.sqlCells()).map(sc => sc.SQL(ctx))).join(";\n\n")};
        
        -- emit all the execution diagnostics
        ${this.duckdb.diagnostics.map(d => d.SQL(this.govn.emitCtx)).join(";\n        ")};

        ATTACH '${resourceDb}' AS ${rdbSchemaName} (TYPE SQLITE);

        ${adminTables.map(t => `CREATE TABLE ${rdbSchemaName}.${t.tableName} AS SELECT * FROM ${t.tableName}`).join(";\n        ")};

        ${exportsSQL.join(";\n        ")};

        DETACH DATABASE ${rdbSchemaName};
        ${afterFinalize.length > 0 ? `${afterFinalize.join(";\n        ")};` : "-- no after-finalize SQL provided"}`), isc.current.nbCellID);
    }
  }

  // `finalize` means always run this even if errors abort the above methods
  @oeDescr.finalize()
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
        -- TODO: join with orch_session table to give all the results in one sheet
        COPY (SELECT * FROM orch_session_diagnostic_text) TO '${diagsXlsx}' WITH (FORMAT GDAL, DRIVER 'xlsx');`),
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
                      ingestionIssues: this.ingestables?.find((i) =>
                        i.psIndex == psIndex
                      )?.issues.length,
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
