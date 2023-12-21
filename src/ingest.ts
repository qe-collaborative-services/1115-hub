import {
  chainNB,
  dax,
  fs,
  path,
  qualitySys as qs,
  SQLa,
  SQLa_duckdb as SQLa_ddb,
  SQLa_tp as tp,
  whitespace as ws,
} from "../deps.ts";

// deno-lint-ignore no-explicit-any
type Any = any;

export type DomainQS = tp.TypicalDomainQS;
export type DomainsQS = tp.TypicalDomainsQS;

export const markdown = qs.qsMarkdown;

export class EmitContext implements SQLa.SqlEmitContext {
  readonly embeddedSQL = SQLa.SQL;
  readonly sqlNamingStrategy = SQLa.typicalSqlNamingStrategy();
  readonly sqlTextEmitOptions = SQLa.typicalSqlTextEmitOptions();
  readonly sqlDialect = SQLa.duckDbDialect();

  resolve(fsPath: string) {
    return fsPath;
  }

  // ULID generator when the value is needed by the SQLite engine runtime
  get sqlEngineNewUUID(): SQLa.SqlTextSupplier<EmitContext> {
    return { SQL: () => `uuid()` };
  }

  get onConflictDoNothing(): SQLa.SqlTextSupplier<EmitContext> {
    return { SQL: () => `ON CONFLICT DO NOTHING` };
  }

  get sqlEngineNow(): SQLa.SqlTextSupplier<EmitContext> {
    return { SQL: () => `CURRENT_TIMESTAMP` };
  }
}

export class Governance {
  readonly emitCtx = new EmitContext();
  readonly gk = tp.governedKeys<DomainQS, DomainsQS, EmitContext>();
  readonly gd = tp.governedDomains<DomainQS, DomainsQS, EmitContext>();
  readonly gts = tp.governedTemplateState<DomainQS, DomainsQS, EmitContext>();
  readonly gm = tp.governedModel<DomainQS, DomainsQS, EmitContext>(
    this.gts.ddlOptions,
  );
  readonly stsOptions = SQLa.typicalSqlTextSupplierOptions<EmitContext>();

  readonly ingestSession = SQLa.tableDefinition("ingest_session", {
    ingest_session_id: this.gk.uuidPrimaryKey(),
    ingest_src: this.gd.text(),
    ingest_table_name: this.gd.text().optional(),
    elaboration: this.gd.jsonTextNullable(),
  }, {
    isIdempotent: true,
    populateQS: (t, c, _, tableName) => {
      t.description = markdown`
        An ingestion session is an ingestion event in which we can record the ingestion supply chain`;
      c.ingest_session_id.description =
        `${tableName} primary key and internal label (UUID)`;
      c.ingest_src.description =
        `The name of the file or URI of the source of the ingestion`;
      c.ingest_table_name.description =
        `If the ingestion was done into a temp or actual table, this is the table name`;
      c.elaboration.description =
        `JSON governance data (description, documentation, usage, etc. in JSON)`;
    },

    qualitySystem: {
      description: markdown`
          An ingestion session is an ingestion event in which we can record the ingestion supply chain.`,
    },
  });

  readonly ingestIssueTabular = SQLa.tableDefinition("ingest_issue_tabular", {
    ingest_issue_tabular_id: this.gk.uuidPrimaryKey(),
    session_id: this.ingestSession.references.ingest_session_id(),
    issue_type: this.gd.text(),
    issue_message: this.gd.text(),
    issue_row: this.gd.integerNullable(),
    issue_column: this.gd.textNullable(),
    invalid_value: this.gd.textNullable(),
    remediation: this.gd.textNullable(),
    elaboration: this.gd.jsonTextNullable(),
  }, {
    isIdempotent: true,
    populateQS: (t, c, _, tableName) => {
      t.description = markdown`
        A tabular ingestion issue is generated when an error or warning needs to
        be created during the ingestion of a CSV or other "tabular" source.`;
      c.ingest_issue_tabular_id.description =
        `${tableName} primary key and internal label (UUID)`;
      c.issue_type.description = `The category of an issue`;
      c.issue_message.description = `The human-friendly message for an issue`;
      c.issue_row.description =
        `The row number in which the issue occurred (may be NULL if not applicable)`;
      c.issue_column.description =
        `The name of the column in which the issue occurred (may be NULL if not applicable)`;
      c.invalid_value.description =
        `The invalid value which caused the issue (may be NULL if not applicable)`;
      c.remediation.description =
        `If the issue is correctable, explain how to correct it.`;
      c.elaboration.description =
        `isse-specific attributes/properties in JSON ("custom data")`;
    },

    qualitySystem: {
      description: markdown`
        A tabular ingestion issue is generated when an error or warning needs to
        be created during the ingestion of a CSV or other "tabular" source.`,
    },
  });

  readonly informationSchema = {
    tables: [
      this.ingestSession,
      this.ingestIssueTabular,
    ],
    tableIndexes: [
      ...this.ingestSession.indexes,
      ...this.ingestIssueTabular.indexes,
    ],
  };

  // type-safe wrapper for all SQL text generated in this library;
  // we call it `SQL` so that VS code extensions like frigus02.vscode-sql-tagged-template-literals
  // properly syntax-highlight code inside SQL`xyz` strings.
  get SQL() {
    return SQLa.SQL<EmitContext>(this.stsOptions);
  }

  // type-safe wrapper for all SQL that should not be treated as SQL statements
  // but as arbitrary text to send to the SQL stream
  sqlBehavior(
    sts: SQLa.SqlTextSupplier<EmitContext>,
  ): SQLa.SqlTextBehaviorSupplier<EmitContext> {
    return {
      executeSqlBehavior: () => sts,
    };
  }

  viewDefn<ViewName extends string, DomainQS extends SQLa.SqlDomainQS>(
    viewName: ViewName,
  ) {
    return SQLa.viewDefinition<ViewName, EmitContext, DomainQS>(viewName, {
      isIdempotent: true,
      embeddedStsOptions: this.gts.ddlOptions,
      before: (viewName) => SQLa.dropView(viewName),
    });
  }

  toSnakeCase(str: string) {
    return str
      .replace(/\.([a-zA-Z0-9])/g, "_$1") // Replace dots with underscores
      .replace(/\-/g, "_") // Replace hyphens with underscores
      .replace(/([A-Z])/g, "_$1") // Add underscores before capital letters
      .toLowerCase() // Convert to lower case
      .replace(/^_+|_+$/g, "") // Remove leading and trailing underscores
      .replace(/__+/g, "_"); // Replace multiple underscores with a single one
  }

  walkEntryToTableName(entry: fs.WalkEntry): string {
    const fileName = entry.name;
    const baseName = fileName.split(".")[0]; // Removes file extension
    return this.toSnakeCase(baseName);
  }
}

export class AssuranceRules extends SQLa_ddb.AssuranceRules<EmitContext> {
  constructor(
    readonly sessionID: string,
    readonly govn: {
      readonly SQL: ReturnType<typeof SQLa.SQL<EmitContext>>;
    },
  ) {
    super(govn);
  }

  insertIssue(
    from: string,
    typeText: string,
    messageSql: string,
    remediationSql?: string,
  ) {
    return ws.unindentWhitespace(
      `INSERT INTO ingest_issue_tabular (ingest_issue_tabular_id, session_id, issue_type, issue_message, remediation)
          SELECT uuid(),
                 '${this.sessionID}', 
                 '${typeText}',
                 ${messageSql},
                 ${remediationSql ?? "NULL"}
            FROM ${from}`,
    );
  }

  insertRowValueIssue(
    from: string,
    typeText: string,
    rowNumSql: string,
    columnNameSql: string,
    valueSql: string,
    messageSql: string,
    remediationSql?: string,
  ) {
    return ws.unindentWhitespace(
      `INSERT INTO ingest_issue_tabular (ingest_issue_tabular_id, session_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
          SELECT uuid(),
                 '${this.sessionID}', 
                 '${typeText}',
                 ${rowNumSql},
                 ${columnNameSql},
                 ${valueSql},
                 ${messageSql},
                 ${remediationSql ?? "NULL"}
            FROM ${from}`,
    );
  }
}

/**
 * Responsible for preparing SQL that will be executed by other classes. The
 * methods in this class are stateless and generate deterministic SQL.
 */
export class IngestSqlNotebook {
  constructor(
    readonly govn = new Governance(),
  ) {
  }

  /**
   * Prepare the SQL which will construct tables, indexes, and other SQL DDL.
   * @returns SQLa.SqlTextSupplier instance
   */
  initDDL() {
    const { govn, govn: { informationSchema: is } } = this;
    return govn.SQL`
      ${is.tables}
      ${is.tableIndexes}`;
  }

  /**
   * Prepare SQL which will prepare the DuckDB table and ingest a CSV file.
   * Also supplies SQL that will ensure that the structure of the table, such
   * as required columns, matches our expections. This SQL should be kept
   * minimal and only focus on assurance of structure not content.
   * @param fsPath the file system path of the CSV source
   * @param tableName the name of the table which will hold the CSV content
   * @returns SQLa.SqlTextSupplier<EmitContext> instance with sessionID
   */
  ensureStructCode(fsPath: string, tableName: string) {
    const { govn } = this;

    // TODO: to support unit testing, crypto.randomUUID should be replaced
    // by a deterministic UUID so that fixture comparisons are possible.
    const sessionID = crypto.randomUUID();
    const ar = new AssuranceRules(sessionID, govn);

    // deno-fmt-ignore
    const code = govn.SQL`
      INSERT INTO ingest_session (ingest_session_id, ingest_src, ingest_table_name) 
                          VALUES ('${sessionID}', '${fsPath}', '${tableName}');
      
      ${SQLa_ddb.csvTableIntegration({
        csvSrcFsPath: () => fsPath, 
        tableName,
        extraColumnsSql: [
          "row_number() OVER () as src_file_row_number",
          `'${sessionID}'`,
        ]
      })}

      ${ar.requiredColumnNamesInTable(tableName,
        ['PAT_MRN_ID', 'FACILITY', 'FIRST_NAME',
        'LAST_NAME', 'PAT_BIRTH_DATE', 'MEDICAID_CIN',
        'ENCOUNTER_ID', 'SURVEY', 'SURVEY_ID',
        'RECORDED_TIME', 'QUESTION', 'MEAS_VALUE',
        'QUESTION_CODE', 'QUESTION_CODE_SYSTEM_NAME', 'ANSWER_CODE',
        'ANSWER_CODE_SYSTEM_NAME', 'SDOH_DOMAIN', 'NEED_INDICATED',
        'VISIT_PART_2_FLAG', 'VISIT_OMH_FLAG', 'VISIT_OPWDD_FLAG'])}`;

    return { ...code, sessionID };
  }

  /**
   * Prepare the SQL that will ensure the content of a table matches our
   * expectations. We separate the content SQL from the structural SQL since
   * content SQL assumes specific column names which will be syntax errors if
   * the structure doesn't match our expectations.
   * @param sessionID a unique identifier for the assurance session
   * @param tableName the name of the table which holds the CSV content
   * @returns SQLa.SqlTextSupplier<EmitContext> instance with sessionID
   */
  ensureContentCode(sessionID: string, tableName: string) {
    const { govn } = this;

    const ar = new AssuranceRules(sessionID, govn);
    // deno-fmt-ignore
    const code = govn.SQL`
      ${ar.intValueInAllTableRows(tableName, 'SURVEY_ID')}`;

    return { sessionID, ...code };
  }
}

type IngestStep = chainNB.NotebookCell<
  IngestEngine,
  chainNB.NotebookCellID<IngestEngine>
>;
type IngestStepContext = chainNB.NotebookCellContext<
  IngestEngine,
  IngestStep
>;
const ieDescr = new chainNB.NotebookDescriptor<IngestEngine, IngestStep>();

/**
 * Use IngestSqlNotebook to prepare SQL for ingestion steps and execute them
 * using DuckDB CLI engine. Each method that does not have a @ieDescr.disregard()
 * attribute is considered a "step" and each step is executed in the order it is
 * declared. As each step is executed, its error or results are passed to the
 * next method.
 *
 * This class is introspected and run using SQLa's Notebook infrastructure.
 * See: https://github.com/netspective-labs/sql-aide/tree/main/lib/notebook
 */
export class IngestEngine {
  readonly isn = new IngestSqlNotebook();
  readonly diagnostics: {
    cell: string;
    sql: string;
    status: number;
    result?: Any;
  }[] = [];
  constructor(
    readonly args: {
      readonly duckdbCmd: string;
      readonly icDb: string;
      readonly rootPath: string;
      readonly src: string[];
      readonly diagsJson?: string;
      readonly diagsXlsx?: string;
      readonly resourceDb?: string;
    },
    readonly govn = new Governance(),
  ) {
  }

  @ieDescr.disregard()
  async duckdb(sql: string, icc: IngestStepContext) {
    const { args: { duckdbCmd, icDb } } = this;
    const status = await dax.$`${duckdbCmd} ${icDb}`
      .stdout("piped")
      .stdinText(sql);
    this.diagnostics.push({
      cell: icc ? icc.current.nbCellID : "unknown",
      sql,
      status: status.code,
    });
    return status;
  }

  @ieDescr.disregard()
  async duckdbResult(sql: string, icc: IngestStepContext) {
    const { args: { duckdbCmd, icDb } } = this;
    const status = await dax.$`${duckdbCmd} ${icDb} --json`
      .stdout("piped")
      .stdinText(sql);
    const stdout = status.stdout;
    this.diagnostics.push({
      cell: icc ? icc.current.nbCellID : "unknown",
      sql,
      status: status.code,
      result: stdout ? JSON.parse(stdout) : stdout,
    });
    return status;
  }

  async initDDL(icc: IngestStepContext) {
    const status = await this.duckdb(
      this.isn.initDDL().SQL(this.govn.emitCtx),
      icc,
    );
    return status.code;
  }

  async structuralSQL(
    icc: IngestStepContext,
    initResult:
      | Error
      | Awaited<ReturnType<typeof IngestEngine.prototype.initDDL>>,
  ) {
    if (initResult != 0) {
      console.error(`${icc.previous?.current.nbCellID} did not return zero`);
      return undefined;
    }

    const { isn, govn, govn: { emitCtx: ctx, ingestIssueTabular: ist } } = this;
    const result: { sessionID: string; tableName: string }[] = [];

    // Convert each glob pattern to a RegExp
    const patterns = this.args.src.map((pattern) =>
      path.globToRegExp(pattern, { extended: true, globstar: true })
    );

    for (const entry of fs.walkSync(Deno.cwd())) {
      if (entry.isFile) {
        const relativePath = path.relative(this.args.rootPath, entry.path);
        // Check if the relative path matches any of the patterns
        if (patterns.some((pattern) => pattern.test(relativePath))) {
          try {
            const tableName = govn.walkEntryToTableName(entry);
            const checkStruct = isn.ensureStructCode(entry.path, tableName);

            // run the SQL and then emit the errors to STDOUT in JSON
            const status = await this.duckdbResult(
              checkStruct.SQL(ctx) + `
              -- emit the errors for the given session (file) so it can be picked up
              SELECT * FROM ${ist.tableName} WHERE ${ist.columns.session_id.columnName} = '${checkStruct.sessionID}';`,
              icc,
            );

            // if there were no errors, then add it to our list of CSV tables
            // whose content will be tested; if the structural validation fails
            // then no content checks will be performed.
            if (!status.stdout) {
              result.push({ sessionID: checkStruct.sessionID, tableName });
            }
          } catch (err) {
            console.dir(err);
          }
        }
      }
    }

    return result;
  }

  async contentSQL(
    icc: IngestStepContext,
    structResult:
      | Error
      | Awaited<ReturnType<typeof IngestEngine.prototype.structuralSQL>>,
  ) {
    if (!Array.isArray(structResult)) {
      console.error(
        `${icc.previous?.current.nbCellID} did not return any structurally valid tables`,
      );
      return;
    }

    const { isn, govn: { emitCtx: ctx } } = this;
    await this.duckdb(
      structResult.map((sr) =>
        isn.ensureContentCode(sr.sessionID, sr.tableName).SQL(ctx)
      ).join("\n"),
      icc,
    );
    return structResult;
  }

  async emitResources(
    icc: IngestStepContext,
    contentResult:
      | Error
      | Awaited<ReturnType<typeof IngestEngine.prototype.contentSQL>>,
  ) {
    const { args: { diagsXlsx, diagsJson, resourceDb } } = this;
    if (diagsXlsx) {
      // if Excel workbook already exists, GDAL xlsx driver will error
      try {
        Deno.removeSync(diagsXlsx);
      } catch (_err) {
        // ignore errors if file does not exist
      }

      // deno-fmt-ignore
      await this.duckdb(`
        INSTALL spatial; -- Only needed once per DuckDB connection
        LOAD spatial; -- Only needed once per DuckDB connection
        -- TODO: join with ingest_session table to give all the results in one sheet
        COPY (SELECT * FROM ingest_issue_tabular) TO '${diagsXlsx}' WITH (FORMAT GDAL, DRIVER 'xlsx');`,
        icc,
      );
    }

    if (resourceDb && Array.isArray(contentResult)) {
      try {
        Deno.removeSync(resourceDb);
      } catch (_err) {
        // ignore errors if file does not exist
      }

      // deno-fmt-ignore
      await this.duckdb(`
        ATTACH '${resourceDb}' AS resource_db (TYPE SQLITE);

        CREATE TABLE resource_db.ingest_session AS 
            SELECT * FROM ingest_session;

        CREATE TABLE resource_db.ingest_issue_tabular AS 
            SELECT * FROM ingest_issue_tabular;

        ${contentResult.map(cr => `CREATE TABLE resource_db.${cr.tableName} AS SELECT * FROM ${cr.tableName};`)}

        DETACH DATABASE resource_db;`, icc);
    }

    if (diagsJson) {
      await Deno.writeTextFile(
        diagsJson,
        JSON.stringify(this.diagnostics, null, "  "),
      );
    }
  }

  static async run(
    args: ConstructorParameters<typeof IngestEngine>[0],
    govn = new Governance(),
  ) {
    const kernel = chainNB.ObservableKernel.create(
      IngestEngine.prototype,
      ieDescr,
    );
    if (!kernel.isValid() || kernel.lintResults.length > 0) {
      // In case the ingestion engine created circular or other invalid states
      // show the state diagram as a PlantUML URL to visualize the error(s).
      const pe = await import("npm:plantuml-encoder");
      const diagram = kernel.introspectedNB.dagOps.diagram(
        kernel.introspectedNB.graph,
      );
      console.log(`http://www.plantuml.com/plantuml/svg/${pe.encode(diagram)}`);
      return;
    }

    try {
      // TODO: make this removal optional?
      Deno.removeSync(args.icDb);
    } catch (_err) {
      // ignore errors if file does not exist
    }
    const workflow = new IngestEngine(args, govn);
    await kernel.run(workflow, await kernel.initRunState());
  }
}
