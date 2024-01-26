import { fs, path, SQLa_orch as o, SQLa_orch_duckdb as ddbo } from "./deps.ts";
import * as sg from "./governance.ts";

// @deno-types="https://cdn.sheetjs.com/xlsx-0.20.1/package/types/index.d.ts"
import * as xlsx from "https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs";

const screeningColumnNames = [
  "ANSWER_CODE_SYSTEM_NAME",
  "ANSWER_CODE",
  "ASSISTANCE_REQUESTED",
  "FACILITY ID (Assigning authority)",
  "MEAS_VALUE",
  "PARENT_QUESTION_CODE",
  "PAT_MRN_ID",
  "POTENTIAL_NEED_INDICATED",
  "QUESTION_CODE_SYSTEM_NAME",
  "QUESTION_CODE",
  "QUESTION",
  "RECORDED_TIME",
  "SCREENING_CODE_SYSTEM_NAME",
  "SCREENING_CODE",
  "SCREENING_METHOD",
  "SCREENING_NAME",
  "SDOH_DOMAIN",
  "UCUM_UNITS",
] as const;

const adminDemographicColumnNames = [
  "ADDRESS1",
  "ADDRESS2",
  "ADMINISTRATIVE_SEX",
  "CITY",
  "CONSENT",
  "ENCOUNTER_ID",
  "ETHNICITY_CODE",
  "ETHNICITY_CODE_DESCRIPTION",
  "ETHNICITY_CODE_SYSTEM_NAME",
  "FACILITY ID (Assigning authority)",
  "FIRST_NAME",
  "GENDER_IDENTITY_CODE",
  "GENDER_IDENTITY_CODE_SYSTEM_NAME",
  "GENDER_IDENTITY_DESCRIPTION",
  "LAST_NAME",
  "MEDICAID_CIN",
  "MIDDLE_NAME",
  "MPI_ID",
  "PAT_BIRTH_DATE",
  "PAT_MRN_ID",
  "PREFERRED_LANGUAGE_CODE",
  "PREFERRED_LANGUAGE_CODE_SYSTEM_NAME",
  "PREFERRED_LANGUAGE_DESCRIPTION",
  "RACE_CODE",
  "RACE_CODE_DESCRIPTION",
  "RACE_CODE_SYSTEM_NAME",
  "SEX_AT_BIRTH",
  "SEXUAL_ORIENTATION_CODE",
  "SEXUAL_ORIENTATION_CODE_SYSTEM_NAME",
  "SEXUAL_ORIENTATION_DESCRIPTION",
  "STATE",
  "ZIP",
] as const;

type ScreeningColumnName = typeof screeningColumnNames[number];

type AdminDemographicColumnName = typeof adminDemographicColumnNames[number];

class ScreeningStructureRules<TableName extends string>
  extends ddbo.DuckDbOrchTableAssuranceRules<TableName, ScreeningColumnName> {
  requiredColumnNames() {
    return this.tableRules.requiredColumnNames([...screeningColumnNames]);
  }
}

class AdminDemographicStructureRules<TableName extends string>
  extends ddbo.DuckDbOrchTableAssuranceRules<
    TableName,
    AdminDemographicColumnName
  > {
  requiredColumnNames() {
    return this.tableRules.requiredColumnNames([
      ...adminDemographicColumnNames,
    ]);
  }
}

export const excelWorkbookSheetNames = [
  "Admin_Demographic",
  "Screening",
  "QE_Admin_Data",
] as const;
export type ExcelWorkbookSheetName = typeof excelWorkbookSheetNames[number];

const TODO_SHEET_TERMINAL_STATE = "EXIT(ExcelSheetTodoIngestSource)" as const;

export class ExcelSheetTodoIngestSource<
  SheetName extends string,
  InitState extends o.State,
> implements
  o.ExcelSheetIngestSource<
    SheetName,
    string,
    ddbo.DuckDbOrchGovernance,
    InitState,
    typeof TODO_SHEET_TERMINAL_STATE,
    ddbo.DuckDbOrchEmitContext
  > {
  readonly nature = "Excel Workbook Sheet";
  readonly tableName: string;
  constructor(
    readonly uri: string,
    readonly sheetName: SheetName,
    readonly govn: ddbo.DuckDbOrchGovernance,
  ) {
    this.tableName = govn.toSnakeCase(
      path.basename(uri, ".xlsx") + "_" + sheetName,
    );
  }

  // deno-lint-ignore require-await
  async workflow(): ReturnType<
    o.ExcelSheetIngestSource<
      string,
      string,
      ddbo.DuckDbOrchGovernance,
      InitState,
      typeof TODO_SHEET_TERMINAL_STATE,
      ddbo.DuckDbOrchEmitContext
    >["workflow"]
  > {
    return {
      ingestSQL: async (issac) =>
        // deno-fmt-ignore
        this.govn.SQL`
          -- required by IngestEngine, setup the ingestion entry for logging
          ${await issac.sessionEntryInsertDML()}
        
          ${await issac.issueInsertDML(`Excel workbook '${path.basename(this.uri)}' sheet '${this.sheetName}' has not been implemented yet.`, "TODO")}`,

      assuranceSQL: () =>
        this.govn.SQL`
          -- Sheet '${this.sheetName}' ingestion not implemented.
        `,

      exportResourceSQL: (targetSchema: string) =>
        this.govn.SQL`
          --  Sheet '${this.sheetName}' exportResourceSQL(${targetSchema})
        `,

      terminalState: () => TODO_SHEET_TERMINAL_STATE,
    };
  }
}

const SCREENING_SHEET_TERMINAL_STATE =
  "EXIT(ScreeningExcelSheetIngestSource)" as const;

export class ScreeningExcelSheetIngestSource<
  TableName extends string,
  InitState extends o.State,
> implements
  o.ExcelSheetIngestSource<
    "Screening",
    TableName,
    ddbo.DuckDbOrchGovernance,
    InitState,
    typeof SCREENING_SHEET_TERMINAL_STATE,
    ddbo.DuckDbOrchEmitContext
  > {
  readonly nature = "Excel Workbook Sheet";
  readonly sheetName = "Screening";
  readonly tableName: TableName;
  constructor(
    readonly uri: string,
    readonly govn: ddbo.DuckDbOrchGovernance,
  ) {
    this.tableName = govn.toSnakeCase(
      path.basename(uri, ".xlsx") + "_" + this.sheetName,
    ) as TableName;
  }

  async workflow(
    session: o.OrchSession<
      ddbo.DuckDbOrchGovernance,
      ddbo.DuckDbOrchEmitContext
    >,
    sessionEntryID: string,
  ): ReturnType<
    o.ExcelSheetIngestSource<
      "Screening",
      TableName,
      ddbo.DuckDbOrchGovernance,
      InitState,
      typeof SCREENING_SHEET_TERMINAL_STATE,
      ddbo.DuckDbOrchEmitContext
    >["workflow"]
  > {
    const sessionDML = await session.orchSessionSqlDML();
    const ssr = new ScreeningStructureRules(
      this.tableName,
      sessionDML.sessionID,
      sessionEntryID,
      this.govn,
    );
    const sar = new sg.ScreeningAssuranceRules(
      this.tableName,
      sessionDML.sessionID,
      sessionEntryID,
      this.govn,
    );

    return {
      ingestSQL: async (issac) =>
        await this.ingestSQL(session, issac, ssr, sar),
      assuranceSQL: async () => await this.assuranceSQL(session, sar),
      exportResourceSQL: async (targetSchema) =>
        await this.exportResourceSQL(session, sar.sessionEntryID, targetSchema),
      terminalState: () => SCREENING_SHEET_TERMINAL_STATE,
    };
  }

  async ingestSQL(
    session: o.OrchSession<
      ddbo.DuckDbOrchGovernance,
      ddbo.DuckDbOrchEmitContext
    >,
    issac: o.IngestSourceStructAssuranceContext<
      InitState,
      ddbo.DuckDbOrchEmitContext
    >,
    ssr: ScreeningStructureRules<TableName>,
    sar: sg.ScreeningAssuranceRules<TableName, ScreeningColumnName>,
  ) {
    const { sheetName, tableName, uri } = this;
    const { sessionID, sessionEntryID } = sar;

    // deno-fmt-ignore
    return this.govn.SQL`
      -- required by IngestEngine, setup the ingestion entry for logging
      ${await issac.sessionEntryInsertDML()}
     
      -- state management diagnostics 
      ${await session.entryStateDML(sessionEntryID, issac.initState(), "ATTEMPT_EXCEL_INGEST", "ScreeningExcelSheetIngestSource.ingestSQL", this.govn.emitCtx.sqlEngineNow)}

      -- ingest Excel workbook sheet '${sheetName}' into ${tableName} using spatial plugin
      INSTALL spatial; LOAD spatial;

      -- be sure to add src_file_row_number and session_id columns to each row
      -- because assurance CTEs require them
      CREATE TABLE ${tableName} AS
        SELECT *, row_number() OVER () as src_file_row_number, '${sessionID}' as session_id, '${sessionEntryID}' as session_entry_id
          FROM st_read('${uri}', layer='${sheetName}', open_options=['HEADERS=FORCE', 'FIELD_TYPES=AUTO']);          
      
      ${ssr.requiredColumnNames()}
      ${await session.entryStateDML(sessionEntryID, "ATTEMPT_EXCEL_INGEST", "INGESTED_EXCEL_WORKBOOK_SHEET", "ScreeningExcelSheetIngestSource.ingestSQL", this.govn.emitCtx.sqlEngineNow)}
      `
  }

  async assuranceSQL(
    session: o.OrchSession<
      ddbo.DuckDbOrchGovernance,
      ddbo.DuckDbOrchEmitContext
    >,
    sar: sg.ScreeningAssuranceRules<TableName, ScreeningColumnName>,
  ) {
    const { sessionEntryID, tableRules: tr } = sar;

    // deno-fmt-ignore
    return this.govn.SQL`
      ${await session.entryStateDML(sessionEntryID, "INGESTED_EXCEL_WORKBOOK_SHEET", "ATTEMPT_EXCEL_WORKBOOK_SHEET_ASSURANCE", "ScreeningExcelSheetIngestSource.assuranceSQL", this.govn.emitCtx.sqlEngineNow)}

      ${tr.mandatoryValueInAllRows("PAT_MRN_ID")}
      ${tr.intValueInAllRows("PAT_MRN_ID")}
      ${tr.mandatoryValueInAllRows("SCREENING_NAME")}
      ${tr.mandatoryValueInAllRows("SCREENING_CODE_SYSTEM_NAME")}
      ${tr.mandatoryValueInAllRows("SCREENING_CODE")}
      ${tr.onlyAllowedValuesInAllRows("SCREENING_METHOD", "'In-Person', 'Phone', 'Website'")}
      ${tr.mandatoryValueInAllRows("RECORDED_TIME")} 
      ${tr.onlyAllowValidDateTimeInAllRows("RECORDED_TIME")}
      ${tr.mandatoryValueInAllRows("QUESTION")}
      ${tr.mandatoryValueInAllRows("MEAS_VALUE")}            
      ${tr.mandatoryValueInAllRows("QUESTION_CODE")}
      ${tr.onlyAllowedValuesInAllRows("QUESTION_CODE", "'71802-3', '96778-6'")}
      ${tr.mandatoryValueInAllRows("QUESTION_CODE_SYSTEM_NAME")}
      ${tr.onlyAllowedValuesInAllRows("QUESTION_CODE_SYSTEM_NAME", "'LN','LOIN'")}
      ${tr.mandatoryValueInAllRows("ANSWER_CODE")}
      ${tr.mandatoryValueInAllRows("ANSWER_CODE_SYSTEM_NAME")}
      ${tr.onlyAllowedValuesInAllRows("ANSWER_CODE_SYSTEM_NAME", "'LN','LOIN'")}
      ${tr.mandatoryValueInAllRows("PARENT_QUESTION_CODE")}
      ${tr.onlyAllowedValuesInAllRows("PARENT_QUESTION_CODE", "'88122-7','88123-5'")}
      ${tr.mandatoryValueInAllRows("SDOH_DOMAIN")}
      ${tr.mandatoryValueInAllRows("POTENTIAL_NEED_INDICATED")}
      ${tr.onlyAllowedValuesInAllRows("POTENTIAL_NEED_INDICATED", "'TRUE','FALSE'")}
      ${tr.onlyAllowedValuesInAllRows("ASSISTANCE_REQUESTED", "'YES','NO'")}
          
      ${await session.entryStateDML(sessionEntryID, "ATTEMPT_EXCEL_WORKBOOK_SHEET_ASSURANCE", "ASSURED_EXCEL_WORKBOOK_SHEET", "ScreeningExcelSheetIngestSource.assuranceSQL", this.govn.emitCtx.sqlEngineNow)}
    `;
  }

  async exportResourceSQL(
    session: o.OrchSession<
      ddbo.DuckDbOrchGovernance,
      ddbo.DuckDbOrchEmitContext
    >,
    sessionEntryID: string,
    targetSchema: string,
  ) {
    const { govn } = this;

    // deno-fmt-ignore
    return govn.SQL`
      ${await session.entryStateDML(sessionEntryID, "ASSURED_EXCEL_WORKBOOK_SHEET", "ATTEMPT_EXCEL_WORKBOOK_SHEET_EXPORT", "ScreeningExcelSheetIngestSource.exportResourceSQL", this.govn.emitCtx.sqlEngineNow)}
      -- Sheet '${this.sheetName}' exportResourceSQL(${targetSchema})
      ${await session.entryStateDML(sessionEntryID, "ATTEMPT_EXCEL_WORKBOOK_SHEET_EXPORT", SCREENING_SHEET_TERMINAL_STATE, "ScreeningExcelSheetIngestSource.exportResourceSQL", this.govn.emitCtx.sqlEngineNow)}
    `;
  }
}

const ADMIN_DEMO_SHEET_TERMINAL_STATE =
  "EXIT(AdminDemographicExcelSheetIngestSource)" as const;

export class AdminDemographicExcelSheetIngestSource<
  TableName extends string,
  InitState extends o.State,
> implements
  o.ExcelSheetIngestSource<
    "Admin_Demographic",
    TableName,
    ddbo.DuckDbOrchGovernance,
    InitState,
    typeof ADMIN_DEMO_SHEET_TERMINAL_STATE,
    ddbo.DuckDbOrchEmitContext
  > {
  readonly nature = "Excel Workbook Sheet";
  readonly sheetName = "Admin_Demographic";
  readonly tableName: TableName;
  constructor(
    readonly uri: string,
    readonly govn: ddbo.DuckDbOrchGovernance,
  ) {
    this.tableName = govn.toSnakeCase(
      path.basename(uri, ".xlsx") + "_" + this.sheetName,
    ) as TableName;
  }

  async workflow(
    session: o.OrchSession<
      ddbo.DuckDbOrchGovernance,
      ddbo.DuckDbOrchEmitContext
    >,
    sessionEntryID: string,
  ): ReturnType<
    o.ExcelSheetIngestSource<
      "Admin_Demographic",
      TableName,
      ddbo.DuckDbOrchGovernance,
      InitState,
      typeof ADMIN_DEMO_SHEET_TERMINAL_STATE,
      ddbo.DuckDbOrchEmitContext
    >["workflow"]
  > {
    const sessionDML = await session.orchSessionSqlDML();
    const ssr = new AdminDemographicStructureRules(
      this.tableName,
      sessionDML.sessionID,
      sessionEntryID,
      this.govn,
    );
    const sar = new sg.AdminDemographicAssuranceRules(
      this.tableName,
      sessionDML.sessionID,
      sessionEntryID,
      this.govn,
    );

    return {
      ingestSQL: async (issac) =>
        await this.ingestSQL(session, issac, ssr, sar),
      assuranceSQL: async () => await this.assuranceSQL(session, sar),
      exportResourceSQL: async (targetSchema) =>
        await this.exportResourceSQL(session, sar.sessionEntryID, targetSchema),
      terminalState: () => ADMIN_DEMO_SHEET_TERMINAL_STATE,
    };
  }

  async ingestSQL(
    session: o.OrchSession<
      ddbo.DuckDbOrchGovernance,
      ddbo.DuckDbOrchEmitContext
    >,
    issac: o.IngestSourceStructAssuranceContext<
      InitState,
      ddbo.DuckDbOrchEmitContext
    >,
    ssr: AdminDemographicStructureRules<TableName>,
    sar: sg.AdminDemographicAssuranceRules<
      TableName,
      AdminDemographicColumnName
    >,
  ) {
    const { sheetName, tableName, uri } = this;
    const { sessionID, sessionEntryID } = sar;

    // deno-fmt-ignore
    return this.govn.SQL`
      -- required by IngestEngine, setup the ingestion entry for logging
      ${await issac.sessionEntryInsertDML()}
     
      -- state management diagnostics 
      ${await session.entryStateDML(sessionEntryID, issac.initState(), "ATTEMPT_EXCEL_INGEST", "AdminDemographicExcelSheetIngestSource.ingestSQL", this.govn.emitCtx.sqlEngineNow)}

      -- ingest Excel workbook sheet '${sheetName}' into ${tableName} using spatial plugin
      INSTALL spatial; LOAD spatial;

      -- be sure to add src_file_row_number and session_id columns to each row
      -- because assurance CTEs require them
      CREATE TABLE ${tableName} AS
        SELECT *, row_number() OVER () as src_file_row_number, '${sessionID}' as session_id, '${sessionEntryID}' as session_entry_id
          FROM st_read('${uri}', layer='${sheetName}', open_options=['HEADERS=FORCE', 'FIELD_TYPES=AUTO']);          
      
      ${ssr.requiredColumnNames()}
      ${await session.entryStateDML(sessionEntryID, "ATTEMPT_EXCEL_INGEST", "INGESTED_EXCEL_WORKBOOK_SHEET", "AdminDemographicExcelSheetIngestSource.ingestSQL", this.govn.emitCtx.sqlEngineNow)}
      `
  }

  async assuranceSQL(
    session: o.OrchSession<
      ddbo.DuckDbOrchGovernance,
      ddbo.DuckDbOrchEmitContext
    >,
    sar: sg.AdminDemographicAssuranceRules<
      TableName,
      AdminDemographicColumnName
    >,
  ) {
    const { sessionEntryID, tableRules: tr } = sar;

    // deno-fmt-ignore
    return this.govn.SQL`
      ${await session.entryStateDML(sessionEntryID, "INGESTED_EXCEL_WORKBOOK_SHEET", "ATTEMPT_EXCEL_WORKBOOK_SHEET_ASSURANCE", "AdminDemographicExcelSheetIngestSource.assuranceSQL", this.govn.emitCtx.sqlEngineNow)}

      ${tr.onlyAllowAlphabetsInAllRows("FIRST_NAME")}
      ${tr.onlyAllowAlphabetsInAllRows("MIDDLE_NAME")}
      ${tr.onlyAllowAlphabetsInAllRows("LAST_NAME")}       
          
      ${await session.entryStateDML(sessionEntryID, "ATTEMPT_EXCEL_WORKBOOK_SHEET_ASSURANCE", "ASSURED_EXCEL_WORKBOOK_SHEET", "AdminDemographicExcelSheetIngestSource.assuranceSQL", this.govn.emitCtx.sqlEngineNow)}
    `;
  }

  async exportResourceSQL(
    session: o.OrchSession<
      ddbo.DuckDbOrchGovernance,
      ddbo.DuckDbOrchEmitContext
    >,
    sessionEntryID: string,
    targetSchema: string,
  ) {
    const { govn } = this;

    // deno-fmt-ignore
    return govn.SQL`
      ${await session.entryStateDML(sessionEntryID, "ASSURED_EXCEL_WORKBOOK_SHEET", "ATTEMPT_EXCEL_WORKBOOK_SHEET_EXPORT", "AdminDemographicExcelSheetIngestSource.exportResourceSQL", this.govn.emitCtx.sqlEngineNow)}
      -- Sheet '${this.sheetName}' exportResourceSQL(${targetSchema})
      ${await session.entryStateDML(sessionEntryID, "ATTEMPT_EXCEL_WORKBOOK_SHEET_EXPORT", ADMIN_DEMO_SHEET_TERMINAL_STATE, "AdminDemographicExcelSheetIngestSource.exportResourceSQL", this.govn.emitCtx.sqlEngineNow)}
    `;
  }
}

export function ingestExcelSourcesSupplier(
  govn: ddbo.DuckDbOrchGovernance,
): o.IngestFsPatternSourcesSupplier<
  | ScreeningExcelSheetIngestSource<string, o.State>
  | AdminDemographicExcelSheetIngestSource<string, o.State>
  | ExcelSheetTodoIngestSource<string, o.State>
  | o.ErrorIngestSource<
    ddbo.DuckDbOrchGovernance,
    o.State,
    ddbo.DuckDbOrchEmitContext
  >
> {
  return {
    pattern: path.globToRegExp("**/*.xlsx", {
      extended: true,
      globstar: true,
    }),
    sources: (entry: fs.WalkEntry) => {
      const uri = entry.path;
      const sources: (
        | ScreeningExcelSheetIngestSource<string, o.State>
        | AdminDemographicExcelSheetIngestSource<string, o.State>
        | ExcelSheetTodoIngestSource<string, o.State>
        | o.ErrorIngestSource<
          ddbo.DuckDbOrchGovernance,
          o.State,
          ddbo.DuckDbOrchEmitContext
        >
      )[] = [];

      const sheetsExpected: Record<
        ExcelWorkbookSheetName,
        () =>
          | ExcelSheetTodoIngestSource<string, o.State>
          | ScreeningExcelSheetIngestSource<string, o.State>
          | AdminDemographicExcelSheetIngestSource<string, o.State>
      > = {
        "Admin_Demographic": () =>
          new AdminDemographicExcelSheetIngestSource(uri, govn),
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
              new o.ErrorIngestSource(
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
        sources.push(new o.ErrorIngestSource(entry.path, err, "ERROR", govn));
      }
      return sources;
    },
  };
}
