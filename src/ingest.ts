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

// the following types are for convenience and type-safety allowing introspection
// of the notebook cells
type IngestCell = chainNB.NotebookCell<
  IngestNotebook,
  chainNB.NotebookCellID<IngestNotebook>
>;
type IngestCellContext = chainNB.NotebookCellContext<
  IngestNotebook,
  IngestCell
>;

export class IngestNotebook {
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
    },
    readonly govn = new Governance(),
  ) {
  }

  async initDDL(icc: IngestCellContext) {
    const {
      govn,
      govn: { emitCtx: ctx, informationSchema: is },
      args: { duckdbCmd, icDb },
    } = this;
    const sql = govn.SQL`
      ${is.tables}
      ${is.tableIndexes}`.SQL(ctx);
    const status = await dax.$`${duckdbCmd} ${icDb}`
      .stdout("piped")
      .stdinText(sql);
    this.diagnostics.push({
      cell: icc.current.nbCellID,
      sql,
      status: status.code,
    });
    return status.code;
  }

  async structuralSQL(
    icc: IngestCellContext,
    initResult:
      | Error
      | Awaited<ReturnType<typeof IngestNotebook.prototype.initDDL>>,
  ) {
    if (initResult != 0) {
      console.error(`${icc.previous?.current.nbCellID} did not return zero`);
      return undefined;
    }

    const { govn, govn: { emitCtx: ctx }, args: { duckdbCmd, icDb } } = this;

    const csvStructure = (fsPath: string, tableName: string) => {
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
          'VISIT_PART_2_FLAG', 'VISIT_OMH_FLAG', 'VISIT_OPWDD_FLAG'])}
        
        -- emit the errors for the given session (file) so it can be picked up
        SELECT * FROM ${govn.ingestIssueTabular.tableName} WHERE ${govn.ingestIssueTabular.columns.session_id.columnName} = '${sessionID}';`;

      return { sessionID, code, sql: code.SQL(ctx) };
    };

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
            const checkStruct = csvStructure(entry.path, tableName);
            const status = await dax.$`${duckdbCmd} ${icDb} --json`
              .stdout("piped")
              .stdinText(checkStruct.sql);
            const stdout = status.stdout;
            this.diagnostics.push({
              cell: icc.current.nbCellID,
              sql: checkStruct.sql,
              status: status.code,
              result: stdout ? JSON.parse(stdout) : stdout,
            });
            if (!stdout) {
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
    icc: IngestCellContext,
    structResult:
      | Error
      | Awaited<ReturnType<typeof IngestNotebook.prototype.structuralSQL>>,
  ) {
    if (!Array.isArray(structResult)) {
      console.error(
        `${icc.previous?.current.nbCellID} did not return any structurally valid tables`,
      );
      return;
    }

    const { govn, govn: { emitCtx: ctx }, args: { duckdbCmd, icDb } } = this;

    const csvContent = (sessionID: string, tableName: string) => {
      const ar = new AssuranceRules(sessionID, govn);
      // deno-fmt-ignore
      const code = govn.SQL`
        ${ar.intValueInAllTableRows(tableName, 'SURVEY_ID')}`;

      return { sessionID, code, sql: code.SQL(ctx) };
    };

    for (const entry of structResult) {
      try {
        const checkContent = csvContent(entry.sessionID, entry.tableName);
        const status = await dax.$`${duckdbCmd} ${icDb}`
          .stdout("piped")
          .stdinText(checkContent.sql);
        const stdout = status.stdout;
        this.diagnostics.push({
          cell: icc.current.nbCellID,
          sql: checkContent.sql,
          status: status.code,
          result: stdout ? JSON.parse(stdout) : stdout,
        });
      } catch (err) {
        console.dir(err);
      }
    }

    return structResult;
  }

  async emitDiagnostics() {
    const { args: { duckdbCmd, icDb, diagsXlsx, diagsJson } } = this;
    if (diagsXlsx) {
      await dax.$`${duckdbCmd} ${icDb}`
        .stdout("piped")
        .stdinText(`
          INSTALL spatial; -- Only needed once per DuckDB connection
          LOAD spatial; -- Only needed once per DuckDB connection
          -- TODO: join with ingest_session table to give all the results in one sheet
          COPY (SELECT * FROM ingest_issue_tabular) TO '${diagsXlsx}' WITH (FORMAT GDAL, DRIVER 'xlsx');
        `);
    }

    if (diagsJson) {
      await Deno.writeTextFile(
        diagsJson,
        JSON.stringify(this.diagnostics, null, "  "),
      );
    }
  }

  static async run(
    args: ConstructorParameters<typeof IngestNotebook>[0],
    govn = new Governance(),
  ) {
    const kernel = chainNB.ObservableKernel.create(IngestNotebook.prototype);
    if (!kernel.isValid() || kernel.lintResults.length > 0) {
      const pe = await import("npm:plantuml-encoder");
      const diagram = kernel.introspectedNB.dagOps.diagram(
        kernel.introspectedNB.graph,
      );
      console.log(`http://www.plantuml.com/plantuml/svg/${pe.encode(diagram)}`);
      return;
    }

    try {
      Deno.removeSync(args.icDb);
      if (args.diagsXlsx) Deno.removeSync(args.diagsXlsx);
    } catch (_err) {
      // ignore errors if file does not exist
    }
    const workflow = new IngestNotebook(args, govn);
    await kernel.run(workflow, await kernel.initRunState());
  }
}
