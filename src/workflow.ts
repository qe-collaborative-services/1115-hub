import {
  chainNB,
  duckdb_shell as ddbs,
  fs,
  path,
  SQLa_ingest_duckdb as ddbi,
  ws,
} from "./deps.ts";

// @deno-types="https://cdn.sheetjs.com/xlsx-0.20.1/package/types/index.d.ts"
import * as xlsx from "https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs";

function uniqueEntries<T extends Record<string, unknown>>(
  objectsArray: T[],
): T[] {
  const seen = new Set<string>();
  return objectsArray.filter((obj) => {
    const signature = JSON.stringify(
      Object.entries(obj).sort((a, b) => a[0].localeCompare(b[0])),
    );
    if (seen.has(signature)) {
      return false;
    } else {
      seen.add(signature);
      return true;
    }
  });
}

export class ScreeningAssuranceRules<TableName extends string>
  extends ddbi.IngestTableAssuranceRules<TableName> {
  requiredColumnNames() {
    return this.tableRules.requiredColumnNames(
      [
        "PAT_MRN_ID",
        "FACILITY",
        "FIRST_NAME",
        "LAST_NAME",
        "PAT_BIRTH_DATE",
        "MEDICAID_CIN",
        "ENCOUNTER_ID",
        "SURVEY",
        "SURVEY_ID",
        "RECORDED_TIME",
        "QUESTION",
        "MEAS_VALUE",
        "QUESTION_CODE",
        "QUESTION_CODE_SYSTEM_NAME",
        "ANSWER_CODE",
        "ANSWER_CODE_SYSTEM_NAME",
        "SDOH_DOMAIN",
        "NEED_INDICATED",
        "VISIT_PART_2_FLAG",
        "VISIT_OMH_FLAG",
        "VISIT_OPWDD_FLAG",
      ],
    );
  }
}

export class ScreeningCsvFileIngestSource<TableName extends string>
  implements ddbi.CsvFileIngestSource<TableName> {
  readonly nature = "CSV";
  constructor(
    readonly uri: string,
    readonly tableName: TableName,
    readonly govn: ddbi.IngestGovernance,
  ) {
  }

  workflow(
    sessionID: string,
    sessionEntryID: string,
  ): ReturnType<ddbi.CsvFileIngestSource<TableName>["workflow"]> {
    const sar = new ScreeningAssuranceRules(
      this.tableName,
      sessionID,
      sessionEntryID,
      this.govn,
    );

    return {
      ingestSQL: async (issac) => await this.ingestSQL(issac, sar),
      assuranceSQL: async () => await this.assuranceSQL(sar),
    };
  }

  async ingestSQL(
    issac: ddbi.IngestSourceStructAssuranceContext,
    sar: ScreeningAssuranceRules<TableName>,
  ) {
    const { tableName, uri } = this;
    const { sessionID, sessionEntryID } = sar;

    // deno-fmt-ignore
    return this.govn.SQL`
      -- required by IngestEngine, setup the ingestion entry for logging
      ${await issac.sessionEntryDML()}

      -- be sure to add src_file_row_number and session_id columns to each row
      -- because assurance CTEs require them
      CREATE TABLE ${tableName} AS
        SELECT *, row_number() OVER () as src_file_row_number, '${sessionID}' as session_id, '${sessionEntryID}' as session_entry_id
          FROM read_csv_auto('${uri}');

      ${sar.requiredColumnNames()}
      
      -- required by IngestEngine, emit the errors for the given session (file) so it can be picked up
      ${issac.selectEntryIssues()}`
  }

  // deno-lint-ignore require-await
  async assuranceSQL(sar: ScreeningAssuranceRules<TableName>) {
    const { govn } = this;

    // deno-fmt-ignore
    return govn.SQL`
      ${sar.tableRules.intValueInAllRows('SURVEY_ID')}`
  }
}

export const excelWorkbookSheetNames = [
  "Admin_Demographic",
  "Screening",
  "QE_Admin_Data",
] as const;
export type ExcelWorkbookSheetName = typeof excelWorkbookSheetNames[number];

export class NoExcelSheetWorkflowIngestSource<SheetName extends string>
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
          ${await issac.sessionEntryDML()}
        
          ${await issac.structuralIssueDML(`Excel workbook '${path.basename(this.uri)}' sheet '${this.sheetName}' has no workflow`)};
          
          -- required by IngestEngine, emit the errors for the given session (file) so it can be picked up
          ${issac.selectEntryIssues()}`,
      assuranceSQL: () =>
        this.govn
          .SQL`-- Sheet '${this.sheetName}' not found in Excel workbook '${
          path.basename(this.uri)
        }'`,
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
    const sar = new ScreeningAssuranceRules(
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
    sar: ScreeningAssuranceRules<string>,
  ) {
    const { sheetName, tableName, uri } = this;
    const { sessionID, sessionEntryID } = sar;

    // deno-fmt-ignore
    return this.govn.SQL`
      -- required by IngestEngine, setup the ingestion entry for logging
      ${await issac.sessionEntryDML()}
     
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

export type PotentialIngestSource =
  | ScreeningCsvFileIngestSource<string>
  | ScreeningExcelSheetIngestSource<string>
  | NoExcelSheetWorkflowIngestSource<string>
  | ddbi.ErrorIngestSource;

export interface IngestSourceFactory {
  readonly pattern: RegExp;
  readonly sources: (entry: fs.WalkEntry) => Iterable<PotentialIngestSource>;
}

export function csvFileIngestSourceFactory(
  govn: ddbi.IngestGovernance,
): IngestSourceFactory {
  return {
    pattern: path.globToRegExp("**/*.csv", {
      extended: true,
      globstar: true,
    }),
    sources: (entry: fs.WalkEntry) => {
      const tableName = govn.toSnakeCase(path.basename(entry.path, ".csv"));
      return [new ScreeningCsvFileIngestSource(entry.path, tableName, govn)];
    },
  };
}

export function excelSheetIngestSourceFactory(
  govn: ddbi.IngestGovernance,
): IngestSourceFactory {
  return {
    pattern: path.globToRegExp("**/*.xlsx", {
      extended: true,
      globstar: true,
    }),
    sources: (entry: fs.WalkEntry) => {
      const uri = entry.path;
      const sources: (
        | ScreeningExcelSheetIngestSource<string>
        | NoExcelSheetWorkflowIngestSource<string>
        | ddbi.ErrorIngestSource
      )[] = [];

      const sheetsExpected: Record<
        ExcelWorkbookSheetName,
        () =>
          | NoExcelSheetWorkflowIngestSource<string>
          | ScreeningExcelSheetIngestSource<string>
      > = {
        "Admin_Demographic": () =>
          new NoExcelSheetWorkflowIngestSource(
            uri,
            "Admin_Demographic",
            govn,
          ),
        "Screening": () => new ScreeningExcelSheetIngestSource(uri, govn),
        "QE_Admin_Data": () =>
          new NoExcelSheetWorkflowIngestSource(uri, "QE_Admin_Data", govn),
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

export function potentialSources(
  govn: ddbi.IngestGovernance,
  suggestedRootPaths?: string[],
) {
  const sources: PotentialIngestSource[] = [];
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
  readonly diagnostics: {
    sources: {
      uri: string;
      nature: string;
      tableName: string;
      valid: boolean;
    }[];
  } = { sources: [] };
  readonly duckdb: ddbs.DuckDbShell;

  constructor(
    readonly govn: ddbi.IngestGovernance,
    readonly args: IngestEngineArgs,
  ) {
    this.duckdb = new ddbs.DuckDbShell({
      duckdbCmd: "duckdb",
      dbDestFsPath: args.icDb,
    });
  }

  async init(isc: IngestStepContext) {
    const { govn, govn: { informationSchema: is }, args } = this;
    const sessionDML = await govn.ingestSessionSqlDML();
    const beforeInit = Array.from(args.sqlRegister.catalog["before-init"]);
    const afterInit = Array.from(args.sqlRegister.catalog["after-init"]);

    const initDDL = govn.SQL`      
      ${beforeInit.length > 0 ? beforeInit : "-- no before-init SQL found"}
      ${is.adminTables}
      ${is.adminTableIndexes}

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
    const { govn, govn: { emitCtx: ctx } } = this;
    const { sessionID } = await govn.ingestSessionSqlDML();
    const assurable: {
      readonly psIndex: number; // the index in #potentialSources
      readonly source: PotentialIngestSource;
      readonly assurance: ReturnType<PotentialIngestSource["workflow"]>;
    }[] = [];

    let psIndex = 0;
    for (const ps of potentialSources(this.govn, this.args.rootPaths)) {
      const { uri, tableName } = ps;

      const sessionEntryID = await govn.emitCtx.newUUID(
        govn.deterministicPKs,
      );
      const assurance = ps.workflow(sessionID, sessionEntryID);
      const checkStruct = await assurance.ingestSQL({
        sessionEntryDML: () => {
          return govn.ingestSessionEntryCRF.insertDML({
            ingest_session_entry_id: sessionEntryID,
            session_id: sessionID,
            ingest_src: uri,
            ingest_table_name: tableName,
          });
        },
        structuralIssueDML: async (message, type = "Structural") => {
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
      const diagnostics = {
        uri: ps.uri,
        nature: ps.nature,
        tableName: ps.tableName,
      };
      if (!status.stdout) {
        assurable.push({ psIndex, source: ps, assurance });
        this.diagnostics.sources.push({ ...diagnostics, valid: true });
      } else {
        this.diagnostics.sources.push({ ...diagnostics, valid: false });
      }

      psIndex++;
    }

    return assurable;
  }

  async ensureContent(
    isc: IngestStepContext,
    ingestResult: Awaited<ReturnType<typeof IngestEngine.prototype.ingest>>,
  ) {
    const { govn: { emitCtx: ctx } } = this;
    await this.duckdb.execute(
      (await Promise.all(
        ingestResult.map(async (sr) =>
          (await sr.assurance.assuranceSQL()).SQL(ctx)
        ),
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
          frontmatter: JSON.parse(
            JSON.stringify(
              {
                ...this.args,
                sources: uniqueEntries(this.diagnostics.sources),
              },
              (key, value) => key == "sqlRegister" ? undefined : value,
            ),
          ), // deep copy only string-frienly properties
        }
        : undefined,
    });
  }
}

if (import.meta.main) {
  const govn = new ddbi.IngestGovernance(true);
  const args: IngestEngineArgs = {
    sqlRegister: ddbi.ingestSqlRegister(),
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
  await ddbi.ingest(IngestEngine.prototype, ieDescr, {
    govn,
    newInstance: () => new IngestEngine(govn, args),
  }, args);
}
