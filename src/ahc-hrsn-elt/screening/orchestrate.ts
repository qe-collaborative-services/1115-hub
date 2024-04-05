import {
  array,
  chainNB,
  dax,
  fs,
  path,
  safety,
  SQLa_orch as o,
  SQLa_orch_duckdb as ddbo,
  uuid,
  ws,
  yaml,
} from "./deps.ts";
import * as sp from "./sqlpage.ts";
import * as ref from "./reference.ts";
import * as csv from "./csv.ts";
import * as excel from "./excel.ts";
import * as gov from "./governance.ts";

export const ORCHESTRATE_VERSION = "0.12.0";

export interface FhirRecord {
  PAT_MRN_ID: string;
  ENCOUNTER_ID: string;
  FHIR: object;
}
export interface TableCountRecord {
  table_count: number;
}
export let fhirGeneratorCheck = false;

export type PotentialIngestSource =
  | excel.ScreeningExcelSheetIngestSource<string, o.State>
  | excel.AdminDemographicExcelSheetIngestSource<string, o.State>
  | excel.QeAdminDataExcelSheetIngestSource<string, o.State>
  | excel.QuestionReferenceExcelSheetIngestSource<string, o.State>
  | excel.AnswerReferenceExcelSheetIngestSource<string, o.State>
  | excel.ExcelSheetTodoIngestSource<string, o.State>
  | csv.ScreeningCsvFileIngestSource<string, o.State, string>
  | csv.AdminDemographicCsvFileIngestSource<string, o.State, string>
  | csv.QeAdminDataCsvFileIngestSource<string, o.State, string>
  | ref.AhcCrossWalkCsvFileIngestSource<"ahc_cross_walk", o.State>
  | ref.EncounterTypeCodeReferenceCsvFileIngestSource<
    "encounter_type_code_reference",
    o.State
  >
  | ref.EncounterClassReferenceCsvFileIngestSource<
    "encounter_class_reference",
    o.State
  >
  | ref.EncounterStatusCodeReferenceCsvFileIngestSource<
    "encounter_status_code_reference",
    o.State
  >
  | ref.ScreeningStatusCodeReferenceCsvFileIngestSource<
    "screening_status_code_reference",
    o.State
  >
  | ref.GenderIdentityReferenceCsvFileIngestSource<
    "gender_identity_reference",
    o.State
  >
  | ref.AdministrativeSexReferenceCsvFileIngestSource<
    "administrative_sex_reference",
    o.State
  >
  | ref.SexAtBirthReferenceCsvFileIngestSource<
    "sex_at_birth_reference",
    o.State
  >
  | ref.SexualOrientationReferenceCsvFileIngestSource<
    "sexual_orientation_reference",
    o.State
  >
  | ref.BusinessRulesReferenceCsvFileIngestSource<
    "business_rules",
    o.State
  >
  | ref.RaceReferenceCsvFileIngestSource<
    "race_reference",
    o.State
  >
  | ref.EthnicityReferenceCsvFileIngestSource<
    "ethnicity_reference",
    o.State
  >
  | ref.PreferredLanguageReferenceCsvFileIngestSource<
    "preferred_language_reference",
    o.State
  >
  | ref.SdohDomainReferenceCsvFileIngestSource<
    "sdoh_domain_reference",
    o.State
  >
  | o.ErrorIngestSource<
    ddbo.DuckDbOrchGovernance,
    o.State,
    ddbo.DuckDbOrchEmitContext
  >;

export function removeNullsFromObject(
  obj: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  Object.entries(obj).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      const cleanedArray = removeNullsFromArray(value);
      if (cleanedArray.length > 0) {
        result[key] = cleanedArray;
      }
    } else if (value && typeof value === "object") {
      const cleanedValue = removeNullsFromObject(
        value as Record<string, unknown>,
      );
      if (Object.keys(cleanedValue).length > 0) {
        result[key] = cleanedValue;
      }
    } else if (value !== null) {
      result[key] = value;
    }
  });
  return result;
}

export function removeNullsFromArray(arr: unknown[]): unknown[] {
  return arr.map((item) => {
    if (Array.isArray(item)) {
      return removeNullsFromArray(item);
    } else if (item && typeof item === "object") {
      return removeNullsFromObject(item as Record<string, unknown>);
    } else if (item !== null) {
      return item;
    }
  }).filter((item) => item !== undefined && item !== null);
}

export function removeNulls(value: unknown): unknown {
  if (typeof value === "string") {
    value = JSON.parse(value);
  }

  if (Array.isArray(value)) {
    return removeNullsFromArray(value);
  } else if (value && typeof value === "object") {
    return removeNullsFromObject(value as Record<string, unknown>);
  }
  return value;
}

export function walkFsPatternIngestSourcesSupplier(
  govn: ddbo.DuckDbOrchGovernance,
): o.IngestSourcesSupplier<PotentialIngestSource, [string[] | undefined]> {
  return {
    sources: async (suggestedRootPaths?: string[]) => {
      const sources: PotentialIngestSource[] = [];
      const iss = [
        csv.ingestCsvFilesSourcesSupplier(govn),
        excel.ingestExcelSourcesSupplier(govn),
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

export type ScreeningIngressGroup = {
  readonly groupID: string;
  readonly component: string;
  readonly entries: o.IngressEntry<string, string>[];
  readonly onIngress: (group: ScreeningIngressGroup) => Promise<void> | void;
};

export const isScreeningIngressGroup = safety.typeGuard<ScreeningIngressGroup>(
  "groupID",
  "component",
);

export class ScreeningIngressGroups {
  // entries are like `screening-<groupID>_admin.csv`, `screening-<groupID>_questions.csv`, etc.
  readonly pattern = /.*(screening)-([^_])_(.*)?.csv/i;
  readonly groups = new Map<string, ScreeningIngressGroup>();

  constructor(readonly onIngress: ScreeningIngressGroup["onIngress"]) {
  }

  potential(
    entry: o.IngressEntry<string, string>,
    onIngress?: ScreeningIngressGroup["onIngress"],
  ) {
    const groupMatch = entry.fsPath.match(this.pattern);
    if (groupMatch) {
      const [, _screening, groupID, component] = groupMatch;
      let group = this.groups.get(groupID);
      if (!group) {
        group = {
          groupID,
          component,
          entries: [entry],
          onIngress: onIngress ?? this.onIngress,
        };
        this.groups.set(groupID, group);
      } else {
        group.entries.push(entry);
      }
      if (group.entries.length == 3) {
        group.onIngress(group);
      }
    }
    return undefined;
  }
}

export function watchFsPatternIngestSourcesSupplier(
  govn: ddbo.DuckDbOrchGovernance,
  src: ScreeningIngressGroup | o.IngressEntry<string, string> | o.IngressEntry<
    string,
    string
  >[],
): o.IngestSourcesSupplier<PotentialIngestSource, [string[] | undefined]> {
  return {
    sources: async () => {
      const sources: PotentialIngestSource[] = [];
      const iss = [
        csv.ingestCsvFilesSourcesSupplier(govn),
        excel.ingestExcelSourcesSupplier(govn),
      ];

      const collect = async (path: string | URL) => {
        for (const p of iss.filter((p) => p.pattern.test(String(path)))) {
          for (const s of await p.sources({ path })) {
            sources.push(s);
          }
        }
      };

      if (isScreeningIngressGroup(src)) {
        src.entries.forEach(async (entry) => await collect(entry.fsPath));
      } else {
        if (Array.isArray(src)) {
          src.forEach(async (entry) => await collect(entry.fsPath));
        } else {
          await collect(src.fsPath);
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

export type OrchEnginePath =
  & { readonly home: string }
  & o.OrchPathSupplier
  & o.OrchPathMutator;

export type OrchEngineStorablePath = OrchEnginePath & o.OrchPathStore;

export interface OrchEngineIngressPaths {
  readonly ingress: OrchEnginePath;
  readonly initializePaths?: () => Promise<void>;
  readonly finalizePaths?: () => Promise<void>;
}

export interface OrchEngineWorkflowPaths {
  readonly ingressArchive?: OrchEngineStorablePath;
  readonly inProcess: OrchEngineStorablePath & {
    readonly duckDbFsPathSupplier: () => string;
  };
  readonly egress: OrchEngineStorablePath & {
    readonly resourceDbSupplier?: () => string;
    readonly diagsJsonSupplier?: () => string;
    readonly diagsXlsxSupplier?: () => string;
    readonly diagsMdSupplier?: () => string;
    readonly fhirJsonSupplier?: (pat_mrn_id: string) => string;
    readonly fhirHttpSupplier?: () => string;
  };

  readonly initializePaths?: () => Promise<void>;
  readonly finalizePaths?: () => Promise<void>;
}

export function orchEngineIngressPaths(
  home: string,
  init?: Partial<OrchEngineIngressPaths>,
): OrchEngineIngressPaths {
  const ingress = (): OrchEnginePath => {
    const resolvedPath = (child: string) => path.join(home, child);

    return {
      home,
      resolvedPath,
      movedPath: async (path, dest) => {
        const movedToPath = dest.resolvedPath(path);
        await Deno.rename(path, movedToPath);
        return movedToPath;
      },
    };
  };

  return { ingress: ingress(), ...init };
}

export function orchEngineWorkflowPaths(
  rootPath: string,
  sessionID: string,
): OrchEngineWorkflowPaths {
  const oePath = (childPath: string): OrchEnginePath => {
    const home = path.join(rootPath, childPath);
    const resolvedPath = (child: string) => path.join(home, child);

    return {
      home,
      resolvedPath,
      movedPath: async (path, dest) => {
        const movedToPath = dest.resolvedPath(path);
        await Deno.rename(path, movedToPath);
        return movedToPath;
      },
    };
  };

  const oeStorablePath = (childPath: string): OrchEngineStorablePath => {
    const oep = oePath(childPath);
    return {
      ...oep,
      storedContent: async (path, content) => {
        const dest = oep.resolvedPath(path);
        await Deno.writeTextFile(dest, content);
        return dest;
      },
    };
  };

  const egress: OrchEngineWorkflowPaths["egress"] = {
    ...oeStorablePath(path.join("egress", sessionID)),
    diagsJsonSupplier: () => egress.resolvedPath("diagnostics.json"),
    diagsMdSupplier: () => egress.resolvedPath("diagnostics.md"),
    diagsXlsxSupplier: () => egress.resolvedPath("diagnostics.xlsx"),
    resourceDbSupplier: () => egress.resolvedPath("resource.sqlite.db"),
    fhirJsonSupplier: (id: string) => {
      return egress.resolvedPath("fhir-" + id + ".json");
    },
    fhirHttpSupplier: () => egress.resolvedPath("fhir.http"),
  };
  const inProcess: OrchEngineWorkflowPaths["inProcess"] = {
    ...oeStorablePath(path.join("egress", sessionID, ".workflow")),
    duckDbFsPathSupplier: () =>
      inProcess.resolvedPath("ingestion-center.duckdb"),
  };
  const ingressArchive: OrchEngineWorkflowPaths["ingressArchive"] =
    oeStorablePath(path.join("egress", sessionID, ".consumed"));

  return {
    ingressArchive,
    inProcess,
    egress,

    initializePaths: async () => {
      await Deno.mkdir(ingressArchive.home, { recursive: true });
      await Deno.mkdir(inProcess.home, { recursive: true });
      await Deno.mkdir(egress.home, { recursive: true });
    },
  };
}

export interface OrchEngineArgs extends
  o.OrchArgs<
    ddbo.DuckDbOrchGovernance,
    OrchEngine,
    ddbo.DuckDbOrchEmitContext
  > {
  readonly workflowPaths: OrchEngineWorkflowPaths;
  readonly walkRootPaths?: string[];
  readonly referenceDataHome?: string;
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
    readonly workflow: Awaited<ReturnType<PotentialIngestSource["workflow"]>>;
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
  readonly sqlPageNB: ReturnType<typeof sp.SQLPageNotebook.create>;

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
      dbDestFsPathSupplier: args.workflowPaths.inProcess.duckDbFsPathSupplier,
      preambleSQL: () =>
        `-- preambleSQL\nSET autoinstall_known_extensions=true;\nSET autoload_known_extensions=true;\n-- end preambleSQL\n`,
    });
    this.sqlPageNB = sp.SQLPageNotebook.create(this.govn);
  }

  /**
   * Prepare the DuckDB path/database for initialization. Typically this gives
   * a chance for the path to the database to be created or removing the existing
   * database in case we want to initialize from scratch.
   * @param osc the type-safe notebook cell context for diagnostics or business rules
   */
  async prepareInit(_osc: OrchStepContext) {
    await this.args.workflowPaths.initializePaths?.();
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
    const {
      govn,
      govn: { informationSchema: is },
      args: {
        session,
      },
    } = this;
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

      -- Load Reference data from csvs

      ${afterInit.length > 0 ? afterInit : "-- no after-init SQL found"}`.SQL(
      this.govn.emitCtx,
    );

    const execResult = await this.duckdb.execute(initDDL, osc.current.nbCellID);
    if (execResult.status.code != 0) {
      const diagsTmpFile = await this.duckdb.writeDiagnosticsSqlMD(
        {
          exec_code: String(execResult.status.code),
          sql: initDDL,
          exec_identity: `initDDL`,
        },
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
    const {
      govn,
      govn: { emitCtx: ctx },
      args: {
        session,
        referenceDataHome =
          "https://raw.githubusercontent.com/qe-collaborative-services/1115-hub/main/src/ahc-hrsn-elt/reference-data",
      },
    } = this;
    const { sessionID } = session;
    const tableGroupCheckSql: string[] = [];
    let psIndex = 0;
    this.potentialSources = Array.from(
      await this.iss.sources(this.args.walkRootPaths),
    );

    const referenceIngestSources = [
      new ref.AhcCrossWalkCsvFileIngestSource(referenceDataHome, govn),
      new ref.EncounterClassReferenceCsvFileIngestSource(
        referenceDataHome,
        govn,
      ),
      new ref.EncounterStatusCodeReferenceCsvFileIngestSource(
        referenceDataHome,
        govn,
      ),
      new ref.EncounterTypeCodeReferenceCsvFileIngestSource(
        referenceDataHome,
        govn,
      ),
      new ref.ScreeningStatusCodeReferenceCsvFileIngestSource(
        referenceDataHome,
        govn,
      ),
      new ref.GenderIdentityReferenceCsvFileIngestSource(
        referenceDataHome,
        govn,
      ),
      new ref.AdministrativeSexReferenceCsvFileIngestSource(
        referenceDataHome,
        govn,
      ),
      new ref.SexAtBirthReferenceCsvFileIngestSource(
        referenceDataHome,
        govn,
      ),
      new ref.SexualOrientationReferenceCsvFileIngestSource(
        referenceDataHome,
        govn,
      ),
      new ref.BusinessRulesReferenceCsvFileIngestSource(
        referenceDataHome,
        govn,
      ),
      new ref.RaceReferenceCsvFileIngestSource(
        referenceDataHome,
        govn,
      ),
      new ref.EthnicityReferenceCsvFileIngestSource(
        referenceDataHome,
        govn,
      ),
      new ref.PreferredLanguageReferenceCsvFileIngestSource(
        referenceDataHome,
        govn,
      ),
      new ref.SdohDomainReferenceCsvFileIngestSource(
        referenceDataHome,
        govn,
      ),
    ];

    this.potentialSources.push(...referenceIngestSources);

    this.ingestables = [];
    const uniqueGroups = new Set<string>();
    for (const ps of this.potentialSources) {
      const { uri, tableName } = ps;
      if ("groupName" in ps) {
        uniqueGroups.add(ps.groupName);
      }
      const sessionEntryID = await govn.emitCtx.newUUID(govn.deterministicPKs);
      const workflow = await ps.workflow(session, sessionEntryID);
      const checkStruct = await workflow.ingestSQL({
        initState: () => "ENTER(ingest)",
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

      uniqueGroups.forEach((value) => {
        const gCsvStr = new gov.GroupCsvStructureRules(
          "information_schema.tables",
          sessionID,
          sessionEntryID,
          govn,
        );
        tableGroupCheckSql.push(
          gCsvStr.checkAllTablesAreIngestedInAGroup(value, tableName)
            .SQL(ctx) + ";",
        );
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
      tableGroupCheckSql.join("\n"),
    );
    ingestSQL.push(
      `SELECT session_entry_id, orch_session_issue_id, issue_type, issue_message, invalid_value FROM orch_session_issue WHERE session_id = '${sessionID}'`,
    );
    const ingestResult = await this.duckdb.jsonResult<
      (typeof this.ingestables)[number]["issues"][number]
    >(ingestSQL.join("\n"), osc.current.nbCellID);
    if (ingestResult.json) {
      // if errors were found, put the problems into the proper ingestable issues
      for (const row of ingestResult.json) {
        const ingestable = this.ingestables.find(
          (i) => i.sessionEntryID == row.session_entry_id,
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
    const {
      govn: { emitCtx: ctx },
    } = this;

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
    const {
      args: { workflowPaths: { egress }, session },
      govn: { emitCtx: ctx },
    } = this;
    if (egress.resourceDbSupplier) {
      const resourceDb = egress.resourceDbSupplier();
      try {
        Deno.removeSync(resourceDb);
      } catch (_err) {
        // ignore errors if file does not exist
      }

      const adminTables = [
        this.govn.device,
        this.govn.orchSession,
        this.govn.orchSessionEntry,
        this.govn.orchSessionState,
        this.govn.orchSessionExec,
        this.govn.orchSessionIssue,
        this.sqlPageNB.table,
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

      // Everything with the `diagnostics-md-ignore-start` and `*-finish` will be
      // executed by the orchestration engine but the SQL won't be store in the
      // diagnostics log because it's noisy and mostly infrastructure.

      const sqlPageCells = await this.sqlPageNB.sqlCells();
      await this.duckdb.execute(
        // deno-fmt-ignore
        this.govn.SQL`
          ${beforeFinalize.length > 0 ? (beforeFinalize.join(";\n") + ";") : "-- no before-finalize SQL provided"}

          -- diagnostics-md-ignore-start "SQLPage and execution diagnostics SQL DML"
          -- emit all the SQLPage content
          ${sqlPageCells};

          -- emit all the execution diagnostics
          ${this.duckdb.diagnostics};
          -- diagnostics-md-ignore-finish "SQLPage and execution diagnostics SQL DML"

          CREATE VIEW orch_session_issue_classification AS
          WITH cte_business_rule AS (
            SELECT worksheet as worksheet,
                field as field,
                required as required,
                "Resolved by QE/QCS" as resolved_by_qe_qcs,
                CONCAT(
                    CASE WHEN UPPER("True Rejection") = 'YES' THEN 'REJECTION' ELSE '' END,
                    CASE WHEN UPPER("Warning Layer") = 'YES' THEN 'WARNING' ELSE '' END
                ) AS record_action
            FROM
                "ingestion-center".main.business_rules
          )
          --select * from cte_business_rule

          SELECT
            -- Including all other columns from 'orch_session'
            ises.* EXCLUDE (orch_started_at, orch_finished_at),
            -- TODO: Casting known timestamp columns to text so emit to Excel works with GDAL (spatial)
              -- strftime(timestamptz orch_started_at, '%Y-%m-%d %H:%M:%S') AS orch_started_at,
              -- strftime(timestamptz orch_finished_at, '%Y-%m-%d %H:%M:%S') AS orch_finished_at,
            -- Including all columns from 'orch_session_entry'
            isee.* EXCLUDE (session_id),
            -- Including all other columns from 'orch_session_issue'
            isi.* EXCLUDE (session_id, session_entry_id),
            CASE
              WHEN
                  UPPER(isi.issue_type) = 'MISSING COLUMN'
                THEN
                  'STRUCTURAL ISSUE'
                ELSE
                  br.record_action
              END
            AS disposition,
            case when UPPER(br.resolved_by_qe_qcs) = 'YES' then 'Resolved By QE/QCS' else null end AS remediation
            FROM orch_session AS ises
            JOIN orch_session_entry AS isee ON ises.orch_session_id = isee.session_id
            LEFT JOIN orch_session_issue AS isi ON isee.orch_session_entry_id = isi.session_entry_id
            --LEFT JOIN business_rules br ON isi.issue_column = br.FIELD
            LEFT OUTER JOIN cte_business_rule br ON br.field = isi.issue_column
            WHERE isi.orch_session_issue_id IS NOT NULL
          ;

          ATTACH '${resourceDb}' AS ${rdbSchemaName} (TYPE SQLITE);

          -- copy relevant orchestration engine admin tables into the the attached database
          ${adminTables.map((t) => ({ SQL: () => `CREATE TABLE ${rdbSchemaName}.${t.tableName} AS SELECT * FROM ${t.tableName}` }))}

          -- export content tables from DuckDb into the attached database (nature-dependent)
          ${exportsSQL};


          DETACH DATABASE ${rdbSchemaName};

          ${afterFinalize.length > 0 ? (afterFinalize.join(";\n") + ";") : "-- no after-finalize SQL provided"}`
          .SQL(this.govn.emitCtx),
        isc.current.nbCellID,
      );
      const fhirViewMainQuery = this.createFhirViewQuery();
      const tableCount = await this.checkRequiredTables();
      if (tableCount === 3) {
        await this.duckdb.execute(fhirViewMainQuery);
        fhirGeneratorCheck = true;
      }
    }
  }

  async checkRequiredTables(): Promise<number> {
    const resultsCheck = await this.duckdb.jsonResult(
      this.govn.SQL`
        SELECT COUNT(*) AS table_count FROM information_schema.tables WHERE table_name IN ('${csv.aggrScreeningTableName}', '${csv.aggrPatientDemogrTableName}', '${csv.aggrQeAdminData}');
      `.SQL(this.govn.emitCtx),
    );

    if (resultsCheck.json) {
      for (const row of resultsCheck.json as TableCountRecord[]) {
        return row.table_count;
      }
    }
    return 0;
  }

  createFhirViewQuery(): string {
    const cteFhirPatient = this.createCteFhirPatient();
    const cteFhirConsent = this.createCteFhirConsent();
    const cteFhirOrg = this.createCteFhirOrg();
    const derivedFromCte = this.createDerivedFromCte();
    const cteFhirObservation = this.createCteFhirObservation();
    const cteFhirObservationGrouper = this.createCteFhirObservationGrouper();
    const cteFhirEncounter = this.createCteFhirEncounter();

    return `
      CREATE VIEW IF NOT EXISTS fhir_bundle AS
        ${cteFhirPatient},
        ${cteFhirConsent},
        ${cteFhirOrg},
        ${derivedFromCte},
        ${cteFhirObservation},
        ${cteFhirObservationGrouper},
        ${cteFhirEncounter}
        SELECT cte.ENCOUNTER_ID,cte.PAT_MRN_ID, json_object(
          'resourceType', 'Bundle',
              'id', CONCAT('${uuid.v1.generate()}','-',PAT_MRN_ID,'-',ENCOUNTER_ID),
              'type', 'transaction',
              'meta', JSON_OBJECT(
                  'lastUpdated', (SELECT MAX(scr.RECORDED_TIME) FROM screening scr)
              ),
              'timestamp', '${new Date().toISOString()}',
              'entry', json(json_group_array(cte.json_data))
          ) AS FHIR_Bundle
          FROM (
            SELECT ENCOUNTER_ID, PAT_MRN_ID, FHIR_Organization AS json_data FROM cte_fhir_org
            UNION ALL
            SELECT ENCOUNTER_ID, PAT_MRN_ID, FHIR_Patient AS json_data FROM cte_fhir_patient
            UNION ALL
            SELECT ENCOUNTER_ID, PAT_MRN_ID, FHIR_Observation AS json_data FROM cte_fhir_observation
            UNION ALL
            SELECT ENCOUNTER_ID, PAT_MRN_ID, FHIR_Observation_Grouper AS json_data FROM cte_fhir_observation_grouper
            UNION ALL
            SELECT ENCOUNTER_ID, PAT_MRN_ID, FHIR_Encounter AS json_data FROM cte_fhir_encounter
            UNION ALL
            SELECT ENCOUNTER_ID, PAT_MRN_ID, FHIR_Consent AS json_data FROM cte_fhir_consent
          ) AS cte
          GROUP BY cte.PAT_MRN_ID, cte.ENCOUNTER_ID;
    `;
  }

  createCteFhirPatient(): string {
    // Return the SQL string for the cte_fhir_patient common table expression
    // You can use a similar approach as in the original query
    return `WITH cte_fhir_patient AS (
      SELECT DISTINCT ON (CONCAT(scr.ENCOUNTER_ID,scr.FACILITY_ID,'_',scr.PAT_MRN_ID)) CASE WHEN scr.ENCOUNTER_ID IS NOT NULL THEN scr.ENCOUNTER_ID ELSE CONCAT('encounter_',scr.FACILITY_ID,'_',scr.PAT_MRN_ID)END AS ENCOUNTER_ID,adt.pat_mrn_id,json_object('fullUrl', CONCAT(adt.FACILITY_ID,'-',adt.PAT_MRN_ID),
        'resource', json_object(
              'resourceType', 'Patient',
              'id', CONCAT(adt.FACILITY_ID,'-',adt.PAT_MRN_ID),
              'meta', json_object(
                'lastUpdated',(SELECT MAX(scr.RECORDED_TIME) FROM screening scr WHERE adt.FACILITY_ID = scr.FACILITY_ID),
                'profile', json_array('http://shinny.org/StructureDefinition/shinny-patient')
              ),
              CASE WHEN PREFERRED_LANGUAGE_CODE IS NOT NULL THEN 'language' ELSE NULL END, PREFERRED_LANGUAGE_CODE,
              CASE WHEN (RACE_CODE_SYSTEM_NAME IS NOT NULL AND RACE_CODE IS NOT NULL AND RACE_CODE_DESCRIPTION IS NOT NULL) OR (ETHNICITY_CODE_SYSTEM_NAME IS NOT NULL AND ETHNICITY_CODE IS NOT NULL AND ETHNICITY_CODE_DESCRIPTION IS NOT NULL) OR (SEX_AT_BIRTH_CODE_SYSTEM IS NOT NULL AND SEX_AT_BIRTH_CODE IS NOT NULL AND SEX_AT_BIRTH_CODE_DESCRIPTION IS NOT NULL) THEN 'extension' ELSE NULL END, json_array(
                              CASE WHEN RACE_CODE_SYSTEM_NAME IS NOT NULL AND RACE_CODE IS NOT NULL AND RACE_CODE_DESCRIPTION IS NOT NULL THEN json_object(
                                  'extension', json_array(
                                                json_object(
                                                    'url','ombCategory',
                                                    'valueCoding',json_object(
                                                                'system',RACE_CODE_SYSTEM_NAME,
                                                                'code',CAST(RACE_CODE AS TEXT),
                                                                'display',RACE_CODE_DESCRIPTION
                                                                )
                                                            )
                                            ),
                                  'url', 'http://hl7.org/fhir/us/core/StructureDefinition/us-core-race'
                                ) END,
                                CASE WHEN ETHNICITY_CODE_SYSTEM_NAME IS NOT NULL AND ETHNICITY_CODE IS NOT NULL AND ETHNICITY_CODE_DESCRIPTION IS NOT NULL THEN json_object(
                                  'extension',json_array(
                                                json_object(
                                                    'url','ombCategory',
                                                    'valueCoding',json_object(
                                                                  'system',ETHNICITY_CODE_SYSTEM_NAME,
                                                                  'code',CAST(ETHNICITY_CODE AS TEXT),
                                                                  'display',ETHNICITY_CODE_DESCRIPTION
                                                                  )
                                                            )
                                          ),
                                    'url', 'http://hl7.org/fhir/us/core/StructureDefinition/us-core-ethnicity'
                              ) END,
                              CASE WHEN SEX_AT_BIRTH_CODE_SYSTEM IS NOT NULL AND SEX_AT_BIRTH_CODE IS NOT NULL AND SEX_AT_BIRTH_CODE_DESCRIPTION IS NOT NULL THEN json_object(
                                      'url','http://hl7.org/fhir/us/core/StructureDefinition/us-core-birthsex',
                                      'valueCode',CAST(SEX_AT_BIRTH_CODE AS TEXT)

                            ) END,
                              CASE WHEN SEXUAL_ORIENTATION_CODE_SYSTEM_NAME IS NOT NULL AND SEXUAL_ORIENTATION_CODE IS NOT NULL AND SEXUAL_ORIENTATION_DESCRIPTION IS NOT NULL THEN json_object(
                                      'url','http://shinny.org/StructureDefinition/shinny-sexual-orientation',
                                      'valueCodeableConcept',json_object('coding', json_array(json_object(
                                                    'system',SEXUAL_ORIENTATION_CODE_SYSTEM_NAME,
                                                    'code',SEXUAL_ORIENTATION_CODE,
                                                    'display',SEXUAL_ORIENTATION_DESCRIPTION
                                                    )))

                            ) END),
              'identifier', json_array(
                              json_object(
                                  'type', json_object(
                                      'coding', json_array(json_object('system', 'http://terminology.hl7.org/CodeSystem/v2-0203', 'code', 'MR')),
                                      'text', 'Medical Record Number'
                                  ),
                                  'system', CONCAT('/facility/',adt.FACILITY_ID),
                                  'value', qat.PAT_MRN_ID,
                                  'assigner', json_object('reference', 'Organization/' || qat.FACILITY_ID)
                              ),
                              CASE
                                  WHEN MEDICAID_CIN != '' THEN
                                      json_object(
                                          'type', json_object(
                                              'coding', json_array(json_object('system', 'http://terminology.hl7.org/CodeSystem/v2-0203', 'code', 'MA'))
                                          ),
                                          'system', 'http://www.medicaid.gov/',
                                          'value', MEDICAID_CIN,
                                          'assigner', json_object('reference', 'Organization/2.16.840.1.113883.3.249')
                                      )
                                  ELSE NULL
                              END,
                              CASE
                                  WHEN adt.MPI_ID IS NOT NULL THEN
                                      json_object(
                                          'type', json_object(
                                              'coding', json_array(json_object('system', 'http://terminology.hl7.org/CodeSystem/v2-0203', 'code', 'PN'))
                                          ),
                                          'system', 'http://www.acme.com/identifiers/patient',
                                          'value', CAST(adt.MPI_ID AS TEXT)
                                      )
                                  ELSE NULL
                              END
                          ),
              CASE WHEN FIRST_NAME IS NOT NULL THEN 'name' ELSE NULL END, json_array(json_object(
                CASE WHEN FIRST_NAME IS NOT NULL THEN 'text' ELSE NULL END, CONCAT(FIRST_NAME,' ', MIDDLE_NAME,' ', LAST_NAME),
                CASE WHEN LAST_NAME IS NOT NULL THEN 'family' ELSE NULL END, LAST_NAME,
                'given', json_array(FIRST_NAME,CASE WHEN MIDDLE_NAME IS NOT NULL THEN MIDDLE_NAME END))
              ),
              CASE WHEN ADMINISTRATIVE_SEX_CODE IS NOT NULL THEN 'gender' ELSE NULL END, ADMINISTRATIVE_SEX_CODE,
              CASE WHEN PAT_BIRTH_DATE IS NOT NULL THEN 'birthDate' ELSE NULL END, PAT_BIRTH_DATE,
              CASE WHEN CITY IS NOT NULL AND CITY != '' IS NOT NULL AND STATE IS NOT NULL AND STATE != '' THEN 'address' ELSE NULL END, json_array(
                  json_object(
                    CASE WHEN ADDRESS1 IS NOT NULL AND ADDRESS1 != '' IS NOT NULL THEN 'text' ELSE NULL END, CONCAT(ADDRESS1, ' ', ADDRESS2),
                    CASE WHEN ADDRESS1 IS NOT NULL AND ADDRESS1 != '' IS NOT NULL THEN 'line' ELSE NULL END, json_array(ADDRESS1, ADDRESS2),
                    'city', CITY,
                    'state', STATE,
                    CASE WHEN ZIP IS NOT NULL AND CAST(ZIP AS TEXT) != '' IS NOT NULL THEN 'postalCode' ELSE NULL END, CAST(ZIP AS TEXT)
                )
              ),
              CASE WHEN PREFERRED_LANGUAGE_CODE IS NOT NULL THEN 'communication' ELSE NULL END, json_array(
                json_object('language', json_object(
                  'coding', json_array(
                    json_object(
                      'code', PREFERRED_LANGUAGE_CODE
                    )
                  )
                ),
                  'preferred', true
              ))
        )) AS FHIR_Patient
    FROM ${csv.aggrPatientDemogrTableName} adt LEFT JOIN ${csv.aggrQeAdminData} qat
    ON adt.PAT_MRN_ID = qat.PAT_MRN_ID LEFT JOIN ${csv.aggrScreeningTableName} scr ON scr.PAT_MRN_ID = adt.PAT_MRN_ID
    )`;
  }

  createCteFhirConsent(): string {
    // Return the SQL string for the cte_fhir_consent common table expression
    return `cte_fhir_consent AS (
      SELECT DISTINCT ON (CONCAT(scr.ENCOUNTER_ID,scr.FACILITY_ID,'_',scr.PAT_MRN_ID)) CASE WHEN scr.ENCOUNTER_ID IS NOT NULL THEN scr.ENCOUNTER_ID ELSE CONCAT('encounter_',scr.FACILITY_ID,'_',scr.PAT_MRN_ID) END AS ENCOUNTER_ID,adt.pat_mrn_id,json_object('fullUrl', CONCAT('consentFor',adt.PAT_MRN_ID),
        'resource', json_object(
              'resourceType', 'Consent',
              'id', CONCAT('consentFor',adt.PAT_MRN_ID),
              'meta', json_object(
                'lastUpdated',(SELECT MAX(scr.RECORDED_TIME) FROM screening scr WHERE adt.FACILITY_ID = scr.FACILITY_ID),
                'profile', json_array('http://shinny.org/StructureDefinition/shin-ny-organization')
              ),
              'status','active',
              'scope', json_object('coding',json_array(json_object('code','treatment')),'text','treatment'),
              'category', json_array(json_object(
                'coding',json_array(
                  json_object('display', 'Patient Consent',
                  'code', '59284-0',
                  'system','http://loinc.org')
                )
              )),
              'patient', json_object(
                'reference', CONCAT('Patient/',adt.PAT_MRN_ID)
              ),
              'dateTime',(SELECT MAX(scr.RECORDED_TIME) FROM screening scr WHERE adt.FACILITY_ID = scr.FACILITY_ID),
              'organization', json_array(json_object('reference', 'Organization/' || qat.FACILITY_ID))


        )
      ) AS FHIR_Consent
    FROM ${csv.aggrPatientDemogrTableName} adt LEFT JOIN ${csv.aggrQeAdminData} qat
    ON adt.PAT_MRN_ID = qat.PAT_MRN_ID LEFT JOIN ${csv.aggrScreeningTableName} scr ON scr.PAT_MRN_ID = adt.PAT_MRN_ID
    )`;
  }

  createCteFhirOrg(): string {
    // Return the SQL string for the cte_fhir_org common table expression
    return `cte_fhir_org AS (
      SELECT DISTINCT ON (CONCAT(scr.ENCOUNTER_ID,scr.FACILITY_ID,'_',scr.PAT_MRN_ID)) CASE WHEN scr.ENCOUNTER_ID IS NOT NULL THEN scr.ENCOUNTER_ID ELSE CONCAT('encounter_',scr.FACILITY_ID,'_',scr.PAT_MRN_ID) END AS ENCOUNTER_ID,qed.PAT_MRN_ID, JSON_OBJECT(
        'fullUrl', LOWER(REPLACE(qed.FACILITY_LONG_NAME, ' ', '-')) || '-' || LOWER(REPLACE(qed.ORGANIZATION_TYPE, ' ', '-')) || '-' || LOWER(REPLACE(qed.FACILITY_ID, ' ', '-')),
        'resource', JSON_OBJECT(
            'resourceType', 'Organization',
            'id', qed.FACILITY_ID,
            'meta', JSON_OBJECT(
                'lastUpdated', (SELECT MAX(scr.RECORDED_TIME) FROM screening scr WHERE qed.FACILITY_ID = scr.FACILITY_ID),
                'profile', JSON_ARRAY('http://shinny.org/StructureDefinition/shin-ny-organization')
            ),
            'identifier', JSON_ARRAY(
                JSON_OBJECT(
                    'system', qed.FACILITY_ID,
                    'value', LOWER(REPLACE(qed.FACILITY_LONG_NAME, ' ', '-')) || '-' || LOWER(REPLACE(qed.ORGANIZATION_TYPE, ' ', '-')) || '-' || LOWER(REPLACE(qed.FACILITY_ID, ' ', '-'))
                )
            ),
            'active', true,
            CASE WHEN qed.ORGANIZATION_TYPE IS NOT NULL THEN 'type' ELSE NULL END, JSON_ARRAY(
                JSON_OBJECT(
                    'coding', JSON_ARRAY(
                        JSON_OBJECT(
                            'system', 'http://terminology.hl7.org/CodeSystem/organization-type',
                            'code', qed.ORGANIZATION_TYPE,
                            'display', qed.ORGANIZATION_TYPE
                        )
                    )
                )
            ),
            'name', qed.FACILITY_LONG_NAME,
            'address', JSON_ARRAY(
                JSON_OBJECT(
                    'text', CONCAT(qed.FACILITY_ADDRESS1,' ', qed.FACILITY_ADDRESS2),
                    'city', qed.FACILITY_CITY,
                    'state', qed.FACILITY_STATE,
                    'postalCode', CAST(qed.FACILITY_ZIP AS TEXT)
                )
            )
        )
    ) AS FHIR_Organization
    FROM ${csv.aggrQeAdminData} qed LEFT JOIN ${csv.aggrScreeningTableName} scr ON qed.PAT_MRN_ID=scr.PAT_MRN_ID WHERE qed.FACILITY_ID!='' AND qed.FACILITY_ID iS NOT NULL ORDER BY qed.FACILITY_ID)`;
  }

  createDerivedFromCte(): string {
    // Return the SQL string for the derived_from_cte common table expression
    return `derived_from_cte AS (
      SELECT
          parent_question_code,
          parent_question_sl_no,
          json_group_array(json_object('reference', derived_reference)) AS derived_from_references
      FROM (
          SELECT
              acw.QUESTION_CODE AS parent_question_code,
              acw.QUESTION_SLNO AS parent_question_sl_no,
              CONCAT('Observation/ObservationResponseQuestion_', acw_sub.QUESTION_SLNO) AS derived_reference
          FROM
              ahc_cross_walk acw
          INNER JOIN ahc_cross_walk acw_sub ON acw_sub."QUESTION_SLNO_REFERENCE" = acw.QUESTION_SLNO
          GROUP BY
              acw.QUESTION_CODE,
              acw.QUESTION_SLNO,
              acw_sub.QUESTION_SLNO
      ) AS distinct_references
      GROUP BY
          parent_question_code,
          parent_question_sl_no
    )`;
  }

  createCteFhirObservation(): string {
    // Return the SQL string for the cte_fhir_observation common table expression
    return `cte_fhir_observation AS (
      SELECT CASE WHEN scr.ENCOUNTER_ID IS NOT NULL THEN scr.ENCOUNTER_ID ELSE CONCAT('encounter_',scr.FACILITY_ID,'_',scr.PAT_MRN_ID) END AS ENCOUNTER_ID,scr.PAT_MRN_ID, JSON_OBJECT(
        'fullUrl', CONCAT('observationResponseQuestion_',acw.QUESTION_SLNO),
        'resource', JSON_OBJECT(
          'resourceType', 'Observation',
              'id', CONCAT('observationResponseQuestion_',acw.QUESTION_SLNO),
              'meta', JSON_OBJECT(
                  'lastUpdated', RECORDED_TIME,
                  'profile', JSON_ARRAY('http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse')
              ),
              'status', SCREENING_STATUS_CODE,
              'category', json_array(json_object('coding',json_array(json_object('system','http://terminology.hl7.org/CodeSystem/observation-category','code','social-history','display','Social History'))),json_object('coding',json_array(json_object('system','http://terminology.hl7.org/CodeSystem/observation-category','code','survey','display','Survey'))),json_object('coding',json_array(json_object('system','http://hl7.org/fhir/us/sdoh-clinicalcare/CodeSystem/SDOHCC-CodeSystemTemporaryCodes','code',CASE WHEN sdr.Code IS NOT NULL AND sdr.Code != '' THEN sdr.Code ELSE 'sdoh-category-unspecified' END,'display',CASE WHEN sdr.Display IS NOT NULL AND sdr.Display != '' THEN sdr.Display ELSE 'SDOH Category Unspecified' END)))),
              CASE WHEN QUESTION_CODE_DESCRIPTION IS NOT NULL THEN 'code' ELSE NULL END, json_object(
                'coding', json_array(json_object(CASE WHEN QUESTION_CODE_SYSTEM_NAME IS NOT NULL THEN 'system' ELSE NULL END,QUESTION_CODE_SYSTEM_NAME,CASE WHEN scr.QUESTION_CODE IS NOT NULL THEN 'code' ELSE NULL END,scr.QUESTION_CODE,CASE WHEN QUESTION_CODE_DESCRIPTION IS NOT NULL THEN 'display' ELSE NULL END,QUESTION_CODE_DESCRIPTION))
              ),
              'subject', json_object('reference',CONCAT('Patient/',PAT_MRN_ID)),
              'effectiveDateTime', RECORDED_TIME,
              'issued', RECORDED_TIME,
              'valueCodeableConcept',CASE WHEN acw.CALCULATED_FIELD = 1 THEN json_object('coding',json_array(json_object('system','http://unitsofmeasure.org','code',acw."UCUM_UNITS",'display',ANSWER_CODE_DESCRIPTION))) ELSE json_object('coding',json_array(json_object('system','http://loinc.org','code',scr.ANSWER_CODE,'display',ANSWER_CODE_DESCRIPTION))) END,
              CASE WHEN acw.CALCULATED_FIELD = 1 THEN 'derivedFrom' ELSE NULL END, COALESCE(df.derived_from_references, json_array()),
              'interpretation',json_array(json_object('coding',json_array(json_object('system','http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation','code','POS','display','Positive'))))
          )
      ) AS FHIR_Observation
      FROM ${csv.aggrScreeningTableName} scr LEFT JOIN sdoh_domain_reference sdr ON scr.SDOH_DOMAIN = sdr.Display LEFT JOIN (SELECT DISTINCT QUESTION_CODE, QUESTION_SLNO, "UCUM_UNITS", CALCULATED_FIELD FROM ahc_cross_walk) acw ON acw.QUESTION_SLNO = scr.src_file_row_number LEFT JOIN derived_from_cte df ON df.parent_question_sl_no = scr.src_file_row_number WHERE acw.QUESTION_SLNO IS NOT NULL ORDER BY acw.QUESTION_SLNO)`;
  }

  createCteFhirObservationGrouper(): string {
    // Return the SQL string for the cte_fhir_observation_grouper common table expression
    return `cte_fhir_observation_grouper AS (
      SELECT CASE WHEN scr.ENCOUNTER_ID IS NOT NULL THEN scr.ENCOUNTER_ID ELSE CONCAT('encounter_',scr.FACILITY_ID,'_',scr.PAT_MRN_ID) END AS ENCOUNTER_ID,scr.PAT_MRN_ID, JSON_OBJECT(
        'fullUrl', (SELECT CONCAT('ObservationResponseQuestion_', slNo, '_grouper')
                      FROM (SELECT MAX(QUESTION_SLNO) as slNo
                            FROM
                              ${csv.aggrScreeningTableName} ssub
                            LEFT JOIN
                              (SELECT DISTINCT QUESTION_SLNO FROM ahc_cross_walk) acw
                            ON acw.QUESTION_SLNO = ssub.src_file_row_number
                            WHERE ssub.SCREENING_CODE=scr.SCREENING_CODE AND acw.QUESTION_SLNO IS NOT NULL
                          ) AS sub1),
        'resource', JSON_OBJECT(
          'resourceType', 'Observation',
              'id', (SELECT CONCAT('ObservationResponseQuestion_', slNo, '_grouper')
                      FROM (SELECT MAX(QUESTION_SLNO) as slNo
                            FROM
                              ${csv.aggrScreeningTableName} ssub
                            LEFT JOIN
                              (SELECT DISTINCT QUESTION_SLNO FROM ahc_cross_walk) acw
                            ON acw.QUESTION_SLNO = ssub.src_file_row_number
                            WHERE ssub.SCREENING_CODE=scr.SCREENING_CODE AND acw.QUESTION_SLNO IS NOT NULL
                          ) AS sub1),
              'meta', JSON_OBJECT(
                  'lastUpdated', MAX(RECORDED_TIME),
                  'profile', JSON_ARRAY('http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse')
              ),
              'status', SCREENING_STATUS_CODE,
              'category', json_array(json_object('coding',json_array(json_object('system','http://terminology.hl7.org/CodeSystem/observation-category','code','social-history','display','Social History'))),json_object('coding',json_array(json_object('system','http://terminology.hl7.org/CodeSystem/observation-category','code','survey','display','Survey'))),json_object('coding',(SELECT json_group_array(JSON_OBJECT(
                            'system', 'http://hl7.org/fhir/us/sdoh-clinicalcare/CodeSystem/SDOHCC-CodeSystemTemporaryCodes',
                            'display', sub.display,
                            'code', sub.code
                        )) FROM (
                            SELECT DISTINCT
                                CASE WHEN sdr.Display IS NOT NULL AND sdr.Display != '' THEN sdr.Display ELSE 'SDOH Category Unspecified' END AS display,
                                CASE WHEN sdr.Code IS NOT NULL AND sdr.Code != '' THEN sdr.Code ELSE 'sdoh-category-unspecified' END AS code
                            FROM
                              ${csv.aggrScreeningTableName} sub
                            LEFT JOIN
                                sdoh_domain_reference sdr
                            ON
                                sub.SDOH_DOMAIN = sdr.Display
                            WHERE
                                sub.SCREENING_CODE=scr.SCREENING_CODE
                        ) AS sub ))
              ),
              CASE WHEN SCREENING_CODE_DESCRIPTION IS NOT NULL THEN 'code' ELSE NULL END, json_object(
                'coding', json_array(json_object(CASE WHEN SCREENING_CODE_SYSTEM_NAME IS NOT NULL THEN 'system' ELSE NULL END,SCREENING_CODE_SYSTEM_NAME,CASE WHEN scr.SCREENING_CODE IS NOT NULL THEN 'code' ELSE NULL END,scr.SCREENING_CODE,CASE WHEN SCREENING_CODE_DESCRIPTION IS NOT NULL THEN 'display' ELSE NULL END,SCREENING_CODE_DESCRIPTION))
              ),
              'subject', json_object('reference',CONCAT('Patient/',PAT_MRN_ID)),
              CASE WHEN ENCOUNTER_ID IS NOT NULL THEN 'encounter' ELSE NULL END, json_object('reference',CONCAT('Encounter/',ENCOUNTER_ID)),
              'effectiveDateTime', MAX(RECORDED_TIME),
              'issued', MAX(RECORDED_TIME),
              'hasMember', (SELECT json_group_array(JSON_OBJECT(
                              'reference', CONCAT('observationResponseQuestion_',sub1.QUESTION_SLNO)
                          ))
                          FROM (
                          SELECT DISTINCT
                              QUESTION_SLNO
                          FROM
                          ${csv.aggrScreeningTableName} ssub
                          LEFT JOIN
                            (SELECT DISTINCT QUESTION_SLNO FROM ahc_cross_walk) acw
                          ON acw.QUESTION_SLNO = ssub.src_file_row_number
                          WHERE ssub.SCREENING_CODE=scr.SCREENING_CODE AND acw.QUESTION_SLNO IS NOT NULL GROUP BY acw.QUESTION_SLNO
                          ORDER BY acw.QUESTION_SLNO
                      ) AS sub1
                          )
          )
      ) AS FHIR_Observation_Grouper
      FROM ${csv.aggrScreeningTableName} scr GROUP BY SCREENING_CODE, FACILITY_ID, PAT_MRN_ID, SCREENING_CODE_DESCRIPTION,SCREENING_STATUS_CODE, SCREENING_CODE_SYSTEM_NAME,ENCOUNTER_ID)`;
  }

  createCteFhirEncounter(): string {
    // Return the SQL string for the cte_fhir_encounter common table expression
    return `cte_fhir_encounter AS (
      SELECT DISTINCT ON (CONCAT(scr.ENCOUNTER_ID,scr.FACILITY_ID,'_',scr.PAT_MRN_ID)) scr.PAT_MRN_ID, CASE WHEN scr.ENCOUNTER_ID IS NOT NULL THEN scr.ENCOUNTER_ID ELSE CONCAT('encounter_',scr.FACILITY_ID,'_',scr.PAT_MRN_ID) END AS ENCOUNTER_ID, JSON_OBJECT(
        'fullUrl', CASE WHEN scr.ENCOUNTER_ID IS NOT NULL THEN scr.ENCOUNTER_ID ELSE CONCAT('encounter_',scr.FACILITY_ID,'_',scr.PAT_MRN_ID) END,
        'resource', JSON_OBJECT(
          'resourceType', 'Encounter',
          'id', CASE WHEN scr.ENCOUNTER_ID IS NOT NULL THEN scr.ENCOUNTER_ID ELSE CONCAT('encounter_',scr.FACILITY_ID,'_',scr.PAT_MRN_ID) END,
          'meta', JSON_OBJECT(
              'lastUpdated', RECORDED_TIME,
              'profile', JSON_ARRAY('http://shinny.org/StructureDefinition/shin-ny-encounter')
          ),
          'status', CASE WHEN ENCOUNTER_STATUS_CODE IS NOT NULL THEN ENCOUNTER_STATUS_CODE ELSE 'unknown' END,
          'class', json_object('system',ENCOUNTER_CLASS_CODE_SYSTEM,CASE WHEN ENCOUNTER_CLASS_CODE IS NOT NULL THEN 'code' ELSE NULL END,ENCOUNTER_CLASS_CODE),
          'type', json_array(json_object('coding',json_array(json_object('system',ENCOUNTER_TYPE_CODE_SYSTEM,CASE WHEN ENCOUNTER_TYPE_CODE IS NOT NULL THEN 'code' ELSE NULL END,  CAST(ENCOUNTER_TYPE_CODE AS TEXT),'display', ENCOUNTER_TYPE_CODE_DESCRIPTION  )),'text',ENCOUNTER_TYPE_CODE_DESCRIPTION)),
          'subject', json_object('reference',CONCAT('Patient/',scr.FACILITY_ID,'-',scr.PAT_MRN_ID))
        )
    ) AS FHIR_Encounter
    FROM ${csv.aggrScreeningTableName} scr LEFT JOIN cte_fhir_patient ON scr.PAT_MRN_ID=cte_fhir_patient.PAT_MRN_ID ORDER BY scr.ENCOUNTER_ID, scr.RECORDED_TIME DESC)`;
  }

  // `finalize` means always run this even if errors abort the above methods
  @oeDescr.finalize()
  async emitDiagnostics() {
    const { workflowPaths: { egress } } = this.args;
    if (egress.diagsXlsxSupplier) {
      const diagsXlsx = egress.diagsXlsxSupplier();
      // if Excel workbook already exists, GDAL xlsx driver will error
      try {
        Deno.removeSync(diagsXlsx);
      } catch (_err) {
        // ignore errors if file does not exist
      }

      // deno-fmt-ignore
      await this.duckdb.execute(
        ws.unindentWhitespace(`
          INSTALL spatial; LOAD spatial;
          -- TODO: join with orch_session table to give all the results in one sheet
          COPY (SELECT * FROM orch_session_issue_classification) TO '${diagsXlsx}' WITH (FORMAT GDAL, DRIVER 'xlsx');`),
        "emitDiagnostics"
      );
    }

    const stringifiableArgs = JSON.parse(
      JSON.stringify(
        {
          ...this.args,
          sources: this.potentialSources
            ? array.distinctEntries(
              this.potentialSources.map((ps, psIndex) => ({
                uri: ps.uri,
                nature: ps.nature,
                tableName: ps.tableName,
                ingestionIssues: this.ingestables?.find(
                  (i) => i.psIndex == psIndex,
                )?.issues.length,
              })),
            )
            : undefined,
        },
        // deep copy only string-frienly properties
        (key, value) => (key == "session" ? undefined : value),
        "  ",
      ),
    );

    if (egress.diagsJsonSupplier) {
      const diagsJson = egress.diagsJsonSupplier();
      await Deno.writeTextFile(
        diagsJson,
        JSON.stringify(
          { args: stringifiableArgs, diags: this.duckdb.diagnostics },
          null,
          "  ",
        ),
      );
    }

    if (egress.fhirJsonSupplier && fhirGeneratorCheck) {
      const results = await this.duckdb.jsonResult(
        this.govn.SQL`
          SELECT PAT_MRN_ID, ENCOUNTER_ID, FHIR_Bundle as FHIR FROM fhir_bundle
        `.SQL(
          this.govn.emitCtx,
        ),
      );

      if (results.json) {
        try {
          let fhirHttpContent = "";
          for (const row of results.json as FhirRecord[]) {
            const fhirJson = egress.fhirJsonSupplier(
              row.PAT_MRN_ID + "-" + row.ENCOUNTER_ID,
            );
            const refinedFhir = removeNulls(row.FHIR);
            await Deno.writeTextFile(
              fhirJson,
              JSON.stringify(refinedFhir),
            );
            if (egress.fhirHttpSupplier) {
              fhirHttpContent = fhirHttpContent +
                "### Submit FHIR Resource Bundle\n\n";
              fhirHttpContent = fhirHttpContent +
                "POST https://{{host}}/{{path}}?processingAgent=QE HTTP/1.1\n";
              fhirHttpContent = fhirHttpContent +
                "content-type: application/json\n\n";
              fhirHttpContent = fhirHttpContent + "< " + fhirJson + "\n\n";
            }
          }
          if (egress.fhirHttpSupplier) {
            const fhirHttp = egress.fhirHttpSupplier();
            await Deno.writeTextFile(
              fhirHttp,
              fhirHttpContent,
            );
          }
        } catch (error) {
          console.log(error);
        }
      }
    }

    const markdown = this.duckdb.diagnosticsMarkdown();
    if (egress.diagsMdSupplier) {
      const diagsMd = egress.diagsMdSupplier();
      await Deno.writeTextFile(
        diagsMd,
        "---\n" +
          yaml.stringify(stringifiableArgs) +
          "---\n" +
          "# Orchestration Diagnostics\n" +
          markdown,
      );
    }

    if (egress.resourceDbSupplier) {
      const {
        orchSession: sessTbl,
        orchSession: { columnNames: c },
        emitCtx: { sqlTextEmitOptions: steo },
      } = this.govn;
      const { sessionID } = this.args.session;
      const resourceDb = egress.resourceDbSupplier();
      await dax.$`sqlite3 ${resourceDb}`.stdinText(
        `UPDATE ${sessTbl.tableName} SET
            ${c.orch_finished_at} = CURRENT_TIMESTAMP,
            ${c.args_json} = ${
          steo.quotedLiteral(JSON.stringify(stringifiableArgs, null, "  "))[1]
        },
            ${c.diagnostics_json} = ${
          steo.quotedLiteral(
            JSON.stringify(this.duckdb.diagnostics, null, "  "),
          )[1]
        },
            ${c.diagnostics_md} = ${steo.quotedLiteral(markdown)[1]}
          WHERE ${c.orch_session_id} = '${sessionID}'`,
      );
    }

    await this.args.workflowPaths.finalizePaths?.();
  }
}
