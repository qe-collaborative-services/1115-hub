import {
  chainNB,
  dax,
  fs,
  path,
  qualitySys as qs,
  SQLa,
  SQLa_duckdb as SQLa_ddb,
  SQLa_tp as tp,
  uuid,
  whitespace as ws,
  yaml,
} from "../deps.ts";

// deno-lint-ignore no-explicit-any
type Any = any;

export type DomainQS = tp.TypicalDomainQS;
export type DomainsQS = tp.TypicalDomainsQS;

export const markdown = qs.qsMarkdown;

export const DETERMINISTIC_UUID_NAMESPACE =
  "b6c7390a-69ea-4814-ae3e-c0c6ed3a913f";
export let deterministicUuidCounter = 0;

export class EmitContext implements SQLa.SqlEmitContext {
  readonly embeddedSQL = SQLa.SQL;
  readonly sqlNamingStrategy = SQLa.typicalSqlNamingStrategy();
  readonly sqlTextEmitOptions = SQLa.typicalSqlTextEmitOptions();
  readonly sqlDialect = SQLa.duckDbDialect();

  resolve(fsPath: string) {
    return fsPath;
  }

  /**
   * UUID generator when the value is needed by the Javascript runtime
   * @param deterministic true if running this in a test or other synthetic environment
   * @returns either a unique deterministic or random string
   */
  async newUUID(deterministic: boolean) {
    if (deterministic) {
      deterministicUuidCounter++;
      const data = new TextEncoder().encode(
        deterministicUuidCounter.toString(),
      );
      return await uuid.v5.generate(DETERMINISTIC_UUID_NAMESPACE, data);
    }
    return crypto.randomUUID();
  }

  /**
   * Compute the current timestamp and prepare DuckDB SQL
   * @returns SQL supplier of the Javascript runtime's current time
   */
  get newCurrentTimestamp(): SQLa.SqlTextSupplier<EmitContext> {
    return {
      SQL: () => {
        const now = new Date();
        return `make_timestamp(${now.getFullYear()}, ${now.getMonth()}, ${now.getDay()}, ${now.getHours()}, ${now.getMinutes()}, ${`${now.getSeconds()}.${now.getMilliseconds()}`})`;
      },
    };
  }

  // UUID generator when the value is needed by the SQLite engine runtime
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
  readonly primaryKey = this.gk.uuidPrimaryKey;

  readonly ingestSession = SQLa.tableDefinition("ingest_session", {
    ingest_session_id: this.primaryKey(),
    ingest_started_at: this.gd.createdAt(),
    ingest_finished_at: this.gd.dateTimeNullable(),
    elaboration: this.gd.jsonTextNullable(),
  }, {
    isIdempotent: true,
    populateQS: (t, c, _, tableName) => {
      t.description = markdown`
        An ingestion session is an ingestion event in which we can record the ingestion supply chain`;
      c.ingest_session_id.description =
        `${tableName} primary key and internal label (UUID)`;
      c.elaboration.description =
        `JSON governance data (description, documentation, usage, etc. in JSON)`;
    },

    qualitySystem: {
      description: markdown`
          An ingestion session is an ingestion event in which we can record the ingestion supply chain.`,
    },
  });

  readonly ingestSessionEntry = SQLa.tableDefinition("ingest_session_entry", {
    ingest_session_entry_id: this.primaryKey(),
    session_id: this.ingestSession.references.ingest_session_id(),
    ingest_src: this.gd.text(),
    ingest_table_name: this.gd.text().optional(),
    elaboration: this.gd.jsonTextNullable(),
  }, {
    isIdempotent: true,
    populateQS: (t, c, _, tableName) => {
      t.description = markdown`
        An ingestion session is an ingestion event in which we can record the ingestion supply chain`;
      c.ingest_session_entry_id.description =
        `${tableName} primary key and internal label (UUID)`;
      c.session_id.description =
        `${this.ingestSession.tableName} row this entry describes`;
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

  readonly ingestSessionState = SQLa.tableDefinition("ingest_session_state", {
    ingest_session_state_id: this.primaryKey(),
    session_id: this.ingestSession.references.ingest_session_id(),
    session_entry_id: this.ingestSessionEntry.references
      .ingest_session_entry_id().optional(),
    from_state: this.gd.text(),
    to_state: this.gd.text(),
    transition_result: this.gd.jsonTextNullable(),
    transition_reason: this.gd.textNullable(),
    transitioned_at: this.gd.createdAt(),
    elaboration: this.gd.jsonTextNullable(),
  }, {
    isIdempotent: true,
    constraints: (props, tableName) => {
      const c = SQLa.tableConstraints(tableName, props);
      return [
        c.unique("ingest_session_state_id", "from_state", "to_state"),
      ];
    },
    populateQS: (t, c, _, tableName) => {
      t.description = markdown`
        Records the state of an ingestion session, computations, and results for Kernels that are stateful.
        For example, a SQL Notebook Cell that creates tables should only be run once (meaning it's statefule).
        Other Kernels might store results for functions and output defined in one cell can be used in later cells.`;
      c.ingest_session_state_id.description = `${tableName} primary key`;
      c.session_id.description =
        `${this.ingestSession.tableName} row this state describes`;
      c.session_entry_id.description =
        `${this.ingestSessionEntry.tableName} row this state describes (optional)`;
      c.from_state.description =
        `the previous state (set to "INITIAL" when it's the first transition)`;
      c.to_state.description =
        `the current state; if no rows exist it means no state transition occurred`;
      c.transition_result.description =
        `if the result of state change is necessary for future use`;
      c.transition_reason.description =
        `short text or code explaining why the transition occurred`;
      c.transitioned_at.description = `when the transition occurred`;
      c.elaboration.description =
        `any elaboration needed for the state transition`;
    },
  });

  readonly ingestSessionIssue = SQLa.tableDefinition(
    "ingest_session_issue",
    {
      ingest_session_issue_id: this.gk.uuidPrimaryKey(),
      session_id: this.ingestSession.references.ingest_session_id(),
      session_entry_id: this.ingestSessionEntry.references
        .ingest_session_entry_id().optional(),
      issue_type: this.gd.text(),
      issue_message: this.gd.text(),
      issue_row: this.gd.integerNullable(),
      issue_column: this.gd.textNullable(),
      invalid_value: this.gd.textNullable(),
      remediation: this.gd.textNullable(),
      elaboration: this.gd.jsonTextNullable(),
    },
    {
      isIdempotent: true,
      populateQS: (t, c, _, tableName) => {
        t.description = markdown`
        A tabular ingestion issue is generated when an error or warning needs to
        be created during the ingestion of a CSV or other "tabular" source.`;
        c.ingest_session_issue_id.description =
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
    },
  );

  readonly informationSchema = {
    tables: [
      this.ingestSession,
      this.ingestSessionEntry,
      this.ingestSessionState,
      this.ingestSessionIssue,
    ],
    tableIndexes: [
      ...this.ingestSession.indexes,
      ...this.ingestSessionEntry.indexes,
      ...this.ingestSessionState.indexes,
      ...this.ingestSessionIssue.indexes,
    ],
  };

  readonly ingestSessionCRF = SQLa.tableColumnsRowFactory<
    typeof this.ingestSession.tableName,
    typeof this.ingestSession.zoSchema.shape,
    EmitContext,
    DomainQS,
    DomainsQS
  >(
    this.ingestSession.tableName,
    this.ingestSession.zoSchema.shape,
  );
  readonly ingestSessionEntryCRF = SQLa.tableColumnsRowFactory<
    typeof this.ingestSessionEntry.tableName,
    typeof this.ingestSessionEntry.zoSchema.shape,
    EmitContext,
    DomainQS,
    DomainsQS
  >(
    this.ingestSessionEntry.tableName,
    this.ingestSessionEntry.zoSchema.shape,
  );
  readonly ingestSessionStateCRF = SQLa.tableColumnsRowFactory<
    typeof this.ingestSessionState.tableName,
    typeof this.ingestSessionState.zoSchema.shape,
    EmitContext,
    DomainQS,
    DomainsQS
  >(
    this.ingestSessionState.tableName,
    this.ingestSessionState.zoSchema.shape,
  );
  readonly ingestSessionIssueCRF = SQLa.tableColumnsRowFactory<
    typeof this.ingestSessionIssue.tableName,
    typeof this.ingestSessionIssue.zoSchema.shape,
    EmitContext,
    DomainQS,
    DomainsQS
  >(
    this.ingestSessionIssue.tableName,
    this.ingestSessionIssue.zoSchema.shape,
  );

  constructor(readonly deterministicPKs: boolean) {
  }

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

  async ingestSessionSqlDML(): Promise<
    & { readonly sessionID: string }
    & SQLa.SqlTextSupplier<EmitContext>
  > {
    const sessionID = await this.emitCtx.newUUID(this.deterministicPKs);
    return {
      sessionID,
      ...this.ingestSessionCRF.insertDML({ ingest_session_id: sessionID }),
    };
  }

  async writeDiagnosticsSqlMD(
    frontmatter: Record<string, unknown>,
    sql: string,
  ) {
    const diagsTmpFile = await Deno.makeTempFile({
      dir: Deno.cwd(),
      prefix: "ingest-diags-initDDL-",
      suffix: ".sql.md",
    });
    // deno-fmt-ignore
    await Deno.writeTextFile(diagsTmpFile, ws.unindentWhitespace(`---\n${yaml.stringify(frontmatter)}---\n\`\`\`sql\n${sql}\n\`\`\``));
    return diagsTmpFile;
  }
}

export class AssuranceRules extends SQLa_ddb.AssuranceRules<EmitContext> {
  constructor(
    readonly sessionID: string,
    readonly sessionEntryID: string,
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
    return ws.unindentWhitespace(`
      INSERT INTO ingest_session_issue (ingest_session_issue_id, session_id, session_entry_id, issue_type, issue_message, remediation)
          SELECT uuid(),
                 '${this.sessionID}', 
                 '${this.sessionEntryID}', 
                 '${typeText}',
                 ${messageSql},
                 ${remediationSql ?? "NULL"}
            FROM ${from}`);
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
    return ws.unindentWhitespace(`
      INSERT INTO ingest_session_issue (ingest_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
          SELECT uuid(),
                 '${this.sessionID}', 
                 '${this.sessionEntryID}', 
                 '${typeText}',
                 ${rowNumSql},
                 ${columnNameSql},
                 ${valueSql},
                 ${messageSql},
                 ${remediationSql ?? "NULL"}
            FROM ${from}`);
  }
}

/**
 * Responsible for preparing SQL that will be executed by other classes. The
 * methods in this class are stateless and generate deterministic SQL.
 */
export class IngestSqlNotebook {
  constructor(
    readonly govn: Governance,
    readonly sessionDML: Awaited<ReturnType<Governance["ingestSessionSqlDML"]>>,
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
      ${is.tableIndexes}
      
      ${this.sessionDML}`;
  }

  /**
   * Prepare SQL which when executed will prepare a DuckDB table to ingest a
   * CSV file.
   *
   * Also supplies SQL that will ensure that the structure of the table, such
   * as required columns, matches our expections. This SQL should be kept
   * minimal and only focus on assurance of structure not content.
   * @param fsPath the file system path of the CSV source
   * @param tableName the name of the table which will hold the CSV content
   * @returns SQLa.SqlTextSupplier<EmitContext> instance with sessionID
   */
  ensureCsvStructure(
    fsPath: string,
    tableName: string,
    ar: AssuranceRules,
  ) {
    const { govn } = this;

    // deno-fmt-ignore
    const code = govn.SQL`
      ${govn.ingestSessionEntryCRF.insertDML({
        ingest_session_entry_id: ar.sessionEntryID,
        session_id: ar.sessionID,
        ingest_src: fsPath,
        ingest_table_name: tableName,
      })}
      
      ${SQLa_ddb.csvTableIntegration({
        csvSrcFsPath: () => fsPath, 
        tableName,
        extraColumnsSql: [
          "row_number() OVER () as src_file_row_number",
          `'${ar.sessionID}'`,
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

    return {
      ...code,
      fsPath,
      tableName,
      format: "CSV",
      sessionEntryID: ar.sessionEntryID,
      sessionID: ar.sessionID,
    };
  }

  /**
   * Prepare SQL which will prepare DuckDB table(s) for known file formats.
   * @param fsPath the file system path of the source
   * @param tableName the name of the table (or prefix of multiple tables) which will hold the content
   * @returns SQLa.SqlTextSupplier<EmitContext> instance with sessionID
   */
  async ensureStructure(fsPath: string, tableName: string) {
    const { govn } = this;
    const sessionEntryID = await govn.emitCtx.newUUID(govn.deterministicPKs);
    const ar = new AssuranceRules(
      this.sessionDML.sessionID,
      sessionEntryID,
      govn,
    );

    if (fsPath.toLocaleLowerCase().endsWith("csv")) {
      return this.ensureCsvStructure(fsPath, tableName, ar);
    }

    // deno-fmt-ignore
    const code = govn.SQL`
      ${govn.ingestSessionEntryCRF.insertDML({
        ingest_session_entry_id: ar.sessionEntryID,
        session_id: ar.sessionID,
        ingest_src: fsPath,
        ingest_table_name: tableName,
      })}
      
      ${govn.ingestSessionIssueCRF.insertDML({
        ingest_session_issue_id: await govn.emitCtx.newUUID(govn.deterministicPKs),
        session_id: this.sessionDML.sessionID,
        session_entry_id: ar.sessionEntryID,
        issue_type: "Structural",
        issue_message: `Unknown file type`,
        invalid_value: fsPath,
      })}`;

    return {
      ...code,
      fsPath,
      tableName,
      format: undefined,
      sessionEntryID: ar.sessionEntryID,
      sessionID: ar.sessionID,
    };
  }

  /**
   * Prepare the SQL that will ensure content of a table matches our
   * expectations. We separate the content SQL from the structural SQL since
   * content SQL assumes specific column names which will be syntax errors if
   * the structure doesn't match our expectations.
   * @param sessionID a unique identifier for the assurance session
   * @param tableName the name of the table which holds the CSV content
   * @returns SQLa.SqlTextSupplier<EmitContext> instance with sessionID
   */
  ensureContent(
    session: { sessionEntryID: string; sessionID: string },
    tableName: string,
  ) {
    const { govn } = this;

    const ar = new AssuranceRules(
      session.sessionID,
      session.sessionEntryID,
      govn,
    );
    // deno-fmt-ignore
    const code = govn.SQL`
      ${ar.intValueInAllTableRows(tableName, 'SURVEY_ID')}`;

    return { ...session, ...code };
  }
}

export class DuckDbCLI {
  readonly diagnostics: {
    identity: string;
    sql: string;
    status: number;
    result?: Any;
    markdown: string;
  }[] = [];
  constructor(
    readonly args: {
      readonly duckdbCmd: string;
      readonly dbDestFsPath: string;
    } = {
      duckdbCmd: "duckdb",
      dbDestFsPath: ":memory:",
    },
  ) {
  }

  sqlMarkdownPartial(
    sql: string,
    status: dax.CommandResult,
    stdoutFmt?: (stdout: string) => { fmt: string; content: string },
  ) {
    const markdown: string[] = [`\`\`\`sql\n${sql}\n\`\`\`\n`];
    if (status.stdout) {
      markdown.push("### stdout");
      const stdout = stdoutFmt?.(status.stdout) ??
        ({ fmt: "sh", content: status.stdout });
      markdown.push(
        `\`\`\`${stdout.fmt}\n${stdout.content}\n\`\`\``,
      );
    }
    if (status.stderr) {
      markdown.push("### stderr");
      markdown.push(`\`\`\`sh\n${status.stderr}\n\`\`\``);
    }
    return markdown;
  }

  async execute(sql: string, identity?: string) {
    const { args: { duckdbCmd, dbDestFsPath } } = this;
    const status = await dax.$`${duckdbCmd} ${dbDestFsPath}`
      .stdout("piped")
      .stderr("piped")
      .stdinText(sql)
      .noThrow();
    this.diagnostics.push({
      identity: identity ? identity : "unknown",
      sql,
      status: status.code,
      markdown: this.sqlMarkdownPartial(sql, status).join("\n"),
    });
    return status;
  }

  async jsonResult(
    sql: string,
    identity: string,
  ) {
    const { args: { duckdbCmd, dbDestFsPath } } = this;
    const status = await dax.$`${duckdbCmd} ${dbDestFsPath} --json`
      .stdout("piped")
      .stderr("piped")
      .stdinText(sql)
      .noThrow();
    const stdout = status.stdout;
    this.diagnostics.push({
      identity: identity ? identity : "unknown",
      sql,
      status: status.code,
      result: stdout ? JSON.parse(stdout) : stdout,
      markdown: this.sqlMarkdownPartial(sql, status).join("\n"),
    });
    return status;
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
  readonly duckdb: DuckDbCLI;
  readonly emitWithResourcesSQL: SQLa.SqlTextSupplier<EmitContext>[] = [];
  constructor(
    readonly isn: IngestSqlNotebook,
    readonly args: {
      readonly duckdbCmd: string;
      readonly icDb: string;
      readonly icDeterministicPk: boolean;
      readonly rootPath: string;
      readonly src: string[];
      readonly diagsJson?: string;
      readonly diagsXlsx?: string;
      readonly diagsMd?: string;
      readonly resourceDb?: string;
    },
    readonly govn: Governance,
  ) {
    this.duckdb = new DuckDbCLI({
      duckdbCmd: args.duckdbCmd,
      dbDestFsPath: args.icDb,
    });
  }

  async init(isc: IngestStepContext) {
    const sql = this.isn.initDDL().SQL(this.govn.emitCtx);
    const status = await this.duckdb.execute(sql, isc.current.nbCellID);
    if (status.code != 0) {
      const diagsTmpFile = await this.govn.writeDiagnosticsSqlMD({
        duckdb: {
          code: status.code,
          stdout: status.stdout,
          stderr: status.stderr,
        },
      }, sql);
      return { status, sql, diagsTmpFile };
    }
    return { status, sql };
  }

  async ensureStructure(
    isc: IngestStepContext,
    initResult:
      | Error
      | Awaited<ReturnType<typeof IngestEngine.prototype.init>>,
  ) {
    if (initResult instanceof Error) {
      console.error(
        `${isc.previous?.current.nbCellID} was not successful`,
        initResult,
      );
      return initResult;
    }
    if (initResult.status.code != 0) {
      console.error(
        `${isc.previous?.current.nbCellID} did not return zero, see ${initResult.diagsTmpFile}`,
      );
      return [];
    }

    const { isn, govn, govn: { emitCtx: ctx, ingestSessionIssue: ist } } = this;
    const result: {
      sessionID: string;
      sessionEntryID: string;
      tableName: string;
    }[] = [];

    // Convert each glob pattern to a RegExp
    const patterns = this.args.src.map((pattern) =>
      path.globToRegExp(pattern, { extended: true, globstar: true })
    );

    let index = -1;
    for (const entry of fs.walkSync(this.args.rootPath)) {
      if (entry.isFile) {
        const relativePath = path.relative(this.args.rootPath, entry.path);
        // Check if the relative path matches any of the patterns
        if (patterns.some((pattern) => pattern.test(relativePath))) {
          try {
            const tableName = govn.walkEntryToTableName(entry);
            const checkStruct = await isn.ensureStructure(
              entry.path,
              tableName,
            );

            // run the SQL and then emit the errors to STDOUT in JSON
            const status = await this.duckdb.jsonResult(
              checkStruct.SQL(ctx) + ws.unindentWhitespace(`
              
              -- emit the errors for the given session (file) so it can be picked up
              SELECT * FROM ${ist.tableName} WHERE ${ist.columns.session_id.columnName} = '${checkStruct.sessionID}' and ${ist.columns.session_entry_id.columnName} = '${checkStruct.sessionEntryID}';`),
              `${isc.current.nbCellID}-${++index}`,
            );

            // if there were no errors, then add it to our list of CSV tables
            // whose content will be tested; if the structural validation fails
            // then no content checks will be performed.
            if (!status.stdout) {
              result.push({
                sessionID: checkStruct.sessionID,
                sessionEntryID: checkStruct.sessionEntryID,
                tableName,
              });
            }
          } catch (err) {
            console.dir(err);
          }
        }
      }
    }

    return result;
  }

  async ensureContent(
    isc: IngestStepContext,
    structResult:
      | Error
      | Awaited<ReturnType<typeof IngestEngine.prototype.ensureStructure>>,
  ) {
    if (structResult instanceof Error) {
      console.error(
        `${isc.previous?.current.nbCellID} was not successful`,
        structResult,
      );
      return structResult;
    }
    if (structResult.length == 0) {
      console.error(
        `${isc.previous?.current.nbCellID} did not return any structurally valid tables`,
      );
      return structResult;
    }

    const { isn, govn: { emitCtx: ctx } } = this;
    await this.duckdb.execute(
      structResult.map((sr) => isn.ensureContent(sr, sr.tableName).SQL(ctx))
        .join("\n"),
      isc.current.nbCellID,
    );
    return structResult;
  }

  async emitResources(
    isc: IngestStepContext,
    contentResult:
      | Error
      | Awaited<ReturnType<typeof IngestEngine.prototype.ensureContent>>,
  ) {
    const { args: { resourceDb } } = this;
    if (resourceDb && Array.isArray(contentResult)) {
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

      // deno-fmt-ignore
      await this.duckdb.execute(ws.unindentWhitespace(`
        ${this.emitWithResourcesSQL.map(dml => dml.SQL(this.govn.emitCtx)).join(";\n        ")};

        ATTACH '${resourceDb}' AS resource_db (TYPE SQLITE);

        ${adminTables.map(t => `CREATE TABLE resource_db.${t.tableName} AS SELECT * FROM ${t.tableName}`).join(";\n        ")};

        ${contentResult.map(cr => `CREATE TABLE resource_db.${cr.tableName} AS SELECT * FROM ${cr.tableName};`)}

        DETACH DATABASE resource_db;`), isc.current.nbCellID);
    }
  }

  @ieDescr.finalize()
  async emitDiagnostics() {
    const { args: { diagsXlsx, diagsJson, diagsMd } } = this;
    if (diagsXlsx) {
      // if Excel workbook already exists, GDAL xlsx driver will error
      try {
        Deno.removeSync(diagsXlsx);
      } catch (_err) {
        // ignore errors if file does not exist
      }

      // deno-fmt-ignore
      await this.duckdb.execute(ws.unindentWhitespace(`
        INSTALL spatial; -- Only needed once per DuckDB connection
        LOAD spatial; -- Only needed once per DuckDB connection
        -- TODO: join with ingest_session table to give all the results in one sheet
        COPY (SELECT * FROM ingest_session_issue) TO '${diagsXlsx}' WITH (FORMAT GDAL, DRIVER 'xlsx');`)        
      );
    }

    if (diagsJson) {
      await Deno.writeTextFile(
        diagsJson,
        JSON.stringify(this.duckdb.diagnostics, null, "  "),
      );
    }

    if (diagsMd) {
      const md: string[] = [
        "---",
        yaml.stringify(this.args),
        "---",
        "# Ingest Diagnostics",
      ];
      for (const d of this.duckdb.diagnostics) {
        md.push(`\n## ${d.identity}`);
        md.push(`${d.markdown}`);
      }
      await Deno.writeTextFile(diagsMd, md.join("\n"));
    }
  }

  static async run(
    args: ConstructorParameters<typeof IngestEngine>[1] & {
      diagsDagPuml?: string;
    },
    govn: Governance,
  ) {
    const kernel = chainNB.ObservableKernel.create(
      IngestEngine.prototype,
      ieDescr,
    );
    if (
      args.diagsDagPuml || !kernel.isValid() || kernel.lintResults.length > 0
    ) {
      // In case the ingestion engine created circular or other invalid states
      // show the state diagram as a PlantUML URL to visualize the error(s).
      const pe = await import("npm:plantuml-encoder");
      const diagram = kernel.introspectedNB.dagOps.diagram(
        kernel.introspectedNB.graph,
      );

      if (args.diagsDagPuml) {
        await Deno.writeTextFile(args.diagsDagPuml, diagram);
      }

      if (!kernel.isValid() || kernel.lintResults.length > 0) {
        console.error("Invalid Kernel, inspect the DAG:");
        console.log(
          `http://www.plantuml.com/plantuml/svg/${pe.encode(diagram)}`,
        );
        return;
      }
    }

    try {
      // TODO: make this removal optional?
      Deno.removeSync(args.icDb);
    } catch (_err) {
      // ignore errors if file does not exist
    }
    const workflow = new IngestEngine(
      new IngestSqlNotebook(govn, await govn.ingestSessionSqlDML()),
      args,
      govn,
    );
    const initRunState = await kernel.initRunState();
    const { runState: { eventEmitter: rsEE } } = initRunState;

    const registerStateChange = async (
      fromState: string,
      toState: string,
      elaboration?: string,
    ) => {
      workflow.emitWithResourcesSQL.push(
        govn.ingestSessionStateCRF.insertDML({
          ingest_session_state_id: await govn.emitCtx.newUUID(
            govn.deterministicPKs,
          ),
          session_id: workflow.isn.sessionDML.sessionID,
          from_state: fromState,
          to_state: toState,
          transitioned_at: govn.emitCtx.newCurrentTimestamp,
          elaboration,
        }),
      );
    };

    rsEE.initNotebook = (_ctx) => {
      registerStateChange("NONE", "INIT");
    };
    rsEE.beforeCell = (cell, ctx) => {
      registerStateChange(
        ctx.previous ? `EXIT(${ctx.previous.current.nbCellID})` : "INIT",
        `ENTER(${cell})`,
      );
    };
    rsEE.afterInterrupt = (cell, _ctx) => {
      registerStateChange(`ENTER(${cell})`, `INTERRUPTED(${cell})`);
    };
    rsEE.afterError = (cell, _error, _ctx) => {
      registerStateChange(`ENTER(${cell})`, `ERROR(${cell})`);
    };
    rsEE.afterCell = (cell, _result, _ctx) => {
      registerStateChange(`ENTER(${cell})`, `EXIT(${cell})`);
    };
    rsEE.finalizeNotebook = (_ctx) => {
      // TODO: add final state change?
    };

    // now that everything is setup, execute
    await kernel.run(workflow, initRunState);
  }
}
