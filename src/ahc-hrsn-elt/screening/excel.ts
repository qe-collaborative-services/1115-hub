import { path, SQLa_orch as o, SQLa_orch_duckdb as ddbo } from "./deps.ts";
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
  "CONSENT ",
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

const qeAdminDataColumnNames = [
  "PAT_MRN_ID",
  "FACILITY ID (Assigning authority)",
  "FACILITY_LONG_NAME",
  "ORGANIZATION_TYPE",
  "FACILITY ADDRESS1",
  "FACILITY ADDRESS2",
  "FACILITY CITY",
  "FACILITY STATE",
  "FACILITY ZIP",
  "VISIT_PART_2_FLAG",
  "VISIT_OMH_FLAG",
  "VISIT_OPWDD_FLAG",
] as const;

const questionReferenceColumnNames = [
  "SCREENING_CODE",
  "QUESTION_CODE",
  "QUESTION",
  "SDOH_DOMAIN",
] as const;

const answerReferenceColumnNames = [
  "QUESTION_CODE",
  "ANSWER_CODE",
  "MEAS_VALUE",
] as const;

type ScreeningColumnName = typeof screeningColumnNames[number];

type AdminDemographicColumnName = typeof adminDemographicColumnNames[number];

type QeAdminDataColumnName = typeof qeAdminDataColumnNames[number];

type QuestionReferenceColumnName = typeof questionReferenceColumnNames[number];

type AnswerReferenceColumnName = typeof answerReferenceColumnNames[number];

class ScreeningStructureRules<TableName extends string>
  extends ddbo.DuckDbOrchTableAssuranceRules<TableName, ScreeningColumnName> {
  requiredColumnNames() {
    return this.tableRules.requiredColumnNamesStrict([...screeningColumnNames]);
  }
}

class AdminDemographicStructureRules<TableName extends string>
  extends ddbo.DuckDbOrchTableAssuranceRules<
    TableName,
    AdminDemographicColumnName
  > {
  requiredColumnNames() {
    return this.tableRules.requiredColumnNamesStrict([
      ...adminDemographicColumnNames,
    ]);
  }
}

class QeAdminDataStructureRules<TableName extends string>
  extends ddbo.DuckDbOrchTableAssuranceRules<
    TableName,
    QeAdminDataColumnName
  > {
  requiredColumnNames() {
    return this.tableRules.requiredColumnNamesStrict([
      ...qeAdminDataColumnNames,
    ]);
  }
}

class QuestionReferenceStructureRules<TableName extends string>
  extends ddbo.DuckDbOrchTableAssuranceRules<
    TableName,
    QuestionReferenceColumnName
  > {
  requiredColumnNames() {
    return this.tableRules.requiredColumnNamesStrict([
      ...questionReferenceColumnNames,
    ]);
  }
}

class AnswerReferenceStructureRules<TableName extends string>
  extends ddbo.DuckDbOrchTableAssuranceRules<
    TableName,
    AnswerReferenceColumnName
  > {
  requiredColumnNames() {
    return this.tableRules.requiredColumnNamesStrict([
      ...answerReferenceColumnNames,
    ]);
  }
}

export const excelWorkbookSheetNames = [
  "Admin_Demographic",
  "Screening",
  "QE_Admin_Data",
  "Question_Reference",
  "Answer_Reference",
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

/**
 * The class ScreeningExcelSheetIngestSource that implements the o.ExcelSheetIngestSource interface.
 * The purpose of this class is to handle the ingestion of data from an Excel sheet into DuckDb database, specifically for the "Screening" sheet.
 *
 * The class is defined with generic type parameters for the table name (TableName) and initial state (InitState).
 * It implements the o.ExcelSheetIngestSource interface with specific types.
 */
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

  // deno-lint-ignore require-await
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
    const ssr = new ScreeningStructureRules(
      this.tableName,
      session.sessionID,
      sessionEntryID,
      this.govn,
    );
    const sar = new sg.ScreeningAssuranceRules(
      this.tableName,
      session.sessionID,
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
      ${tr.mandatoryValueInAllRows("FACILITY ID (Assigning authority)")}      
      ${tr.mandatoryValueInAllRows("SCREENING_NAME")}
      ${tr.mandatoryValueInAllRows("SCREENING_CODE_SYSTEM_NAME")}
      ${tr.onlyAllowedValuesInAllRows("SCREENING_CODE_SYSTEM_NAME", "'LN', 'LOINC'")}
      ${tr.mandatoryValueInAllRows("SCREENING_CODE")}
      ${tr.onlyAllowedValuesInAllRows("SCREENING_METHOD", "'In-Person', 'Phone', 'Website'")}
      ${tr.mandatoryValueInAllRows("RECORDED_TIME")} 
      ${tr.onlyAllowValidDateTimeInAllRows("RECORDED_TIME")}
      ${tr.mandatoryValueInAllRows("QUESTION")}
      ${tr.mandatoryValueInAllRows("MEAS_VALUE")}            
      ${tr.mandatoryValueInAllRows("QUESTION_CODE")}
      ${tr.mandatoryValueInAllRows("QUESTION_CODE_SYSTEM_NAME")}
      ${tr.onlyAllowedValuesInAllRows("QUESTION_CODE_SYSTEM_NAME", "'LN','LOIN'")}
      ${tr.mandatoryValueInAllRows("ANSWER_CODE")}
      ${tr.mandatoryValueInAllRows("ANSWER_CODE_SYSTEM_NAME")}
      ${tr.onlyAllowedValuesInAllRows("ANSWER_CODE_SYSTEM_NAME", "'LN','LOIN'")}
      ${tr.mandatoryValueInAllRows("SDOH_DOMAIN")}
      ${tr.mandatoryValueInAllRows("POTENTIAL_NEED_INDICATED")}
      ${tr.onlyAllowedValuesInAllRows("POTENTIAL_NEED_INDICATED", "'Yes','No','NA'")}
      ${tr.onlyAllowedValuesInAllRows("ASSISTANCE_REQUESTED", "'Yes','No','NA'")}
      ${sar.onlyAllowValidScreeningQuestionsInAllRows("QUESTION_CODE", this.govn.toSnakeCase(path.basename(this.uri, ".xlsx")))}
          
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
    const { govn, tableName } = this;

    // deno-fmt-ignore
    return govn.SQL`
      ${await session.entryStateDML(sessionEntryID, "ASSURED_EXCEL_WORKBOOK_SHEET", "ATTEMPT_EXCEL_WORKBOOK_SHEET_EXPORT", "ScreeningExcelSheetIngestSource.exportResourceSQL", this.govn.emitCtx.sqlEngineNow)}

      CREATE TABLE ${targetSchema}.${tableName} AS SELECT * FROM ${tableName};

      ${await session.entryStateDML(sessionEntryID, "ATTEMPT_EXCEL_WORKBOOK_SHEET_EXPORT", SCREENING_SHEET_TERMINAL_STATE, "ScreeningExcelSheetIngestSource.exportResourceSQL", this.govn.emitCtx.sqlEngineNow)}
    `;
  }
}

const ADMIN_DEMO_SHEET_TERMINAL_STATE =
  "EXIT(AdminDemographicExcelSheetIngestSource)" as const;

/**
 * The class AdminDemographicExcelSheetIngestSource that implements the o.ExcelSheetIngestSource interface.
 * The purpose of this class is to handle the ingestion of data from an Excel sheet into DuckDb database, specifically for the "Admin_Demographic" sheet.
 *
 * The class is defined with generic type parameters for the table name (TableName) and initial state (InitState).
 * It implements the o.ExcelSheetIngestSource interface with specific types.
 */
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

  // deno-lint-ignore require-await
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
    const ssr = new AdminDemographicStructureRules(
      this.tableName,
      session.sessionID,
      sessionEntryID,
      this.govn,
    );
    const sar = new sg.AdminDemographicAssuranceRules(
      this.tableName,
      session.sessionID,
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
    adar: sg.AdminDemographicAssuranceRules<
      TableName,
      AdminDemographicColumnName
    >,
  ) {
    const { sessionEntryID, tableRules: tr } = adar;

    // deno-fmt-ignore
    return this.govn.SQL`
      ${await session.entryStateDML(sessionEntryID, "INGESTED_EXCEL_WORKBOOK_SHEET", "ATTEMPT_EXCEL_WORKBOOK_SHEET_ASSURANCE", "AdminDemographicExcelSheetIngestSource.assuranceSQL", this.govn.emitCtx.sqlEngineNow)}

      ${tr.mandatoryValueInAllRows("FIRST_NAME")}
      ${tr.onlyAllowAlphabetsInAllRows("FIRST_NAME")}
      ${tr.onlyAllowAlphabetsInAllRows("MIDDLE_NAME")}
      ${tr.mandatoryValueInAllRows("LAST_NAME")}
      ${tr.onlyAllowAlphabetsInAllRows("LAST_NAME")} 
      ${tr.mandatoryValueInAllRows("ADMINISTRATIVE_SEX")} 
      ${tr.onlyAllowedValuesInAllRows("ADMINISTRATIVE_SEX", "'M','F','X'")}   
      ${tr.onlyAllowedValuesInAllRows("SEX_AT_BIRTH", "'M','F','X'")} 
      ${tr.mandatoryValueInAllRows("PAT_BIRTH_DATE")}
      ${tr.onlyAllowValidBirthDateInAllRows("PAT_BIRTH_DATE")}
      ${tr.mandatoryValueInAllRows("CITY")}
      ${tr.mandatoryValueInAllRows("STATE")}
      ${tr.onlyAllowedValuesInAllRows("STATE", "'NY', 'New York'")}
      ${tr.mandatoryValueInAllRows("ZIP")}
      ${adar.car.onlyAllowValidZipInAllRows("ZIP")}
      ${adar.car.onlyAllowAlphabetsAndNumbersWithSpaceInAllRows("ADDRESS1")}
      ${tr.onlyAllowedValuesInAllRows("GENDER_IDENTITY_CODE", "'407377005','446141000124107','446151000124109','446131000124102','407376001','ASKU','OTH','UNK'")}
      ${tr.onlyAllowedValuesInAllRows("GENDER_IDENTITY_DESCRIPTION", "'Female-to-Male (FTM)','Transgender Male','Trans Man','Female','Male','Genderqueer','Male-to-Female (MTF)', 'Transgender Female','Trans Woman','Asked but unknown','Other','Unknown'")}      
      ${tr.onlyAllowedValuesInAllRows("GENDER_IDENTITY_CODE_SYSTEM_NAME", "'SNOMED-CT','SNOMED'")}
      ${tr.onlyAllowedValuesInAllRows("SEXUAL_ORIENTATION_CODE", "'42035005','20430005','38628009','OTH','UNK'")}
      ${tr.onlyAllowedValuesInAllRows("SEXUAL_ORIENTATION_CODE_SYSTEM_NAME", "'SNOMED-CT','SNOMED'")}
      ${tr.onlyAllowedValuesInAllRows("SEXUAL_ORIENTATION_DESCRIPTION", "'Bisexual','Straight','Gay or lesbian','other','unknown'")}
      ${tr.onlyAllowedValuesInAllRows("RACE_CODE_SYSTEM_NAME", "'CDC','CDCRE'")}
      ${tr.onlyAllowedValuesInAllRows("ETHNICITY_CODE_SYSTEM_NAME", "'CDC','CDCRE'")}
      ${tr.mandatoryValueInAllRows("MPI_ID")} 
      ${tr.mandatoryValueInAllRows("PAT_MRN_ID")}
      ${tr.mandatoryValueInAllRows("FACILITY ID (Assigning authority)")}   
      ${adar.car.onlyAllowValidMedicaidCinFormatInAllRows("MEDICAID_CIN")} 
      ${tr.mandatoryValueInAllRows("CONSENT ")} 
      ${tr.onlyAllowedValuesInAllRows("CONSENT ", "'Yes', 'No'")}
          
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
    const { govn, tableName } = this;

    // deno-fmt-ignore
    return govn.SQL`
      ${await session.entryStateDML(sessionEntryID, "ASSURED_EXCEL_WORKBOOK_SHEET", "ATTEMPT_EXCEL_WORKBOOK_SHEET_EXPORT", "AdminDemographicExcelSheetIngestSource.exportResourceSQL", this.govn.emitCtx.sqlEngineNow)}

      CREATE TABLE ${targetSchema}.${tableName} AS SELECT * FROM ${tableName};

      ${await session.entryStateDML(sessionEntryID, "ATTEMPT_EXCEL_WORKBOOK_SHEET_EXPORT", ADMIN_DEMO_SHEET_TERMINAL_STATE, "AdminDemographicExcelSheetIngestSource.exportResourceSQL", this.govn.emitCtx.sqlEngineNow)}
    `;
  }
}

const QE_ADMIN_DATA_SHEET_TERMINAL_STATE =
  "EXIT(QeAdminDataExcelSheetIngestSource)" as const;

/**
 * The class QeAdminDataExcelSheetIngestSource that implements the o.ExcelSheetIngestSource interface.
 * The purpose of this class is to handle the ingestion of data from an Excel sheet into DuckDb database, specifically for the "QE_Admin_Data" sheet.
 *
 * The class is defined with generic type parameters for the table name (TableName) and initial state (InitState).
 * It implements the o.ExcelSheetIngestSource interface with specific types.
 */
export class QeAdminDataExcelSheetIngestSource<
  TableName extends string,
  InitState extends o.State,
> implements
  o.ExcelSheetIngestSource<
    "QE_Admin_Data",
    TableName,
    ddbo.DuckDbOrchGovernance,
    InitState,
    typeof QE_ADMIN_DATA_SHEET_TERMINAL_STATE,
    ddbo.DuckDbOrchEmitContext
  > {
  readonly nature = "Excel Workbook Sheet";
  readonly sheetName = "QE_Admin_Data";
  readonly tableName: TableName;
  constructor(
    readonly uri: string,
    readonly govn: ddbo.DuckDbOrchGovernance,
  ) {
    this.tableName = govn.toSnakeCase(
      path.basename(uri, ".xlsx") + "_" + this.sheetName,
    ) as TableName;
  }

  // deno-lint-ignore require-await
  async workflow(
    session: o.OrchSession<
      ddbo.DuckDbOrchGovernance,
      ddbo.DuckDbOrchEmitContext
    >,
    sessionEntryID: string,
  ): ReturnType<
    o.ExcelSheetIngestSource<
      "QE_Admin_Data",
      TableName,
      ddbo.DuckDbOrchGovernance,
      InitState,
      typeof QE_ADMIN_DATA_SHEET_TERMINAL_STATE,
      ddbo.DuckDbOrchEmitContext
    >["workflow"]
  > {
    const ssr = new QeAdminDataStructureRules(
      this.tableName,
      session.sessionID,
      sessionEntryID,
      this.govn,
    );
    const sar = new sg.QeAdminDataAssuranceRules(
      this.tableName,
      session.sessionID,
      sessionEntryID,
      this.govn,
    );

    return {
      ingestSQL: async (issac) =>
        await this.ingestSQL(session, issac, ssr, sar),
      assuranceSQL: async () => await this.assuranceSQL(session, sar),
      exportResourceSQL: async (targetSchema) =>
        await this.exportResourceSQL(session, sar.sessionEntryID, targetSchema),
      terminalState: () => QE_ADMIN_DATA_SHEET_TERMINAL_STATE,
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
    ssr: QeAdminDataStructureRules<TableName>,
    sar: sg.QeAdminDataAssuranceRules<
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
      ${await session.entryStateDML(sessionEntryID, issac.initState(), "ATTEMPT_EXCEL_INGEST", "QeAdminDataExcelSheetIngestSource.ingestSQL", this.govn.emitCtx.sqlEngineNow)}

      -- ingest Excel workbook sheet '${sheetName}' into ${tableName} using spatial plugin
      INSTALL spatial; LOAD spatial;

      -- be sure to add src_file_row_number and session_id columns to each row
      -- because assurance CTEs require them
      CREATE TABLE ${tableName} AS
        SELECT *, row_number() OVER () as src_file_row_number, '${sessionID}' as session_id, '${sessionEntryID}' as session_entry_id
          FROM st_read('${uri}', layer='${sheetName}', open_options=['HEADERS=FORCE', 'FIELD_TYPES=AUTO']);          
      
      ${ssr.requiredColumnNames()}
      ${await session.entryStateDML(sessionEntryID, "ATTEMPT_EXCEL_INGEST", "INGESTED_EXCEL_WORKBOOK_SHEET", "QeAdminDataExcelSheetIngestSource.ingestSQL", this.govn.emitCtx.sqlEngineNow)}
      `
  }

  async assuranceSQL(
    session: o.OrchSession<
      ddbo.DuckDbOrchGovernance,
      ddbo.DuckDbOrchEmitContext
    >,
    qedar: sg.QeAdminDataAssuranceRules<
      TableName,
      QeAdminDataColumnName
    >,
  ) {
    const { sessionEntryID, tableRules: tr } = qedar;

    // deno-fmt-ignore
    return this.govn.SQL`
      ${await session.entryStateDML(sessionEntryID, "INGESTED_EXCEL_WORKBOOK_SHEET", "ATTEMPT_EXCEL_WORKBOOK_SHEET_ASSURANCE", "QeAdminDataExcelSheetIngestSource.assuranceSQL", this.govn.emitCtx.sqlEngineNow)}

      ${tr.mandatoryValueInAllRows("PAT_MRN_ID")}
      ${tr.mandatoryValueInAllRows("FACILITY ID (Assigning authority)")}
      ${tr.uniqueValueInAllRows("FACILITY ID (Assigning authority)")}
      ${tr.mandatoryValueInAllRows("FACILITY_LONG_NAME")}
      ${tr.mandatoryValueInAllRows("ORGANIZATION_TYPE")}
      ${tr.onlyAllowedValuesInAllRows("ORGANIZATION_TYPE", "'Hospital', 'DTC', 'SNF', 'SCN', 'CBO', 'OMH', 'OASAS', 'Practice', 'Article 36', 'Article 40', 'MCO'")}
      ${tr.mandatoryValueInAllRows("FACILITY ADDRESS1")}
      ${tr.uniqueValueInAllRows("FACILITY ADDRESS1")}   
      ${qedar.car.onlyAllowAlphabetsAndNumbersWithSpaceInAllRows("FACILITY ADDRESS1")} 
      ${tr.uniqueValueInAllRows("FACILITY ADDRESS2")}
      ${qedar.car.onlyAllowAlphabetsAndNumbersWithSpaceInAllRows("FACILITY ADDRESS2")}    
      ${tr.mandatoryValueInAllRows("FACILITY STATE")}
      ${tr.onlyAllowedValuesInAllRows("FACILITY STATE", "'NY', 'New York'")}
      ${tr.mandatoryValueInAllRows("FACILITY ZIP")}
      ${qedar.car.onlyAllowValidZipInAllRows("FACILITY ZIP")}
      ${tr.mandatoryValueInAllRows("VISIT_PART_2_FLAG")}
      ${tr.onlyAllowedValuesInAllRows("VISIT_PART_2_FLAG", "'Yes', 'No'")}
      ${tr.mandatoryValueInAllRows("VISIT_OMH_FLAG")}
      ${tr.onlyAllowedValuesInAllRows("VISIT_OMH_FLAG", "'Yes', 'No'")}
      ${tr.mandatoryValueInAllRows("VISIT_OPWDD_FLAG")}
      ${tr.onlyAllowedValuesInAllRows("VISIT_OPWDD_FLAG", "'Yes', 'No'")}
      ${qedar.car.onlyAllowAlphabetsWithSpacesInAllRows("FACILITY_LONG_NAME")}
          
      ${await session.entryStateDML(sessionEntryID, "ATTEMPT_EXCEL_WORKBOOK_SHEET_ASSURANCE", "ASSURED_EXCEL_WORKBOOK_SHEET", "QeAdminDataExcelSheetIngestSource.assuranceSQL", this.govn.emitCtx.sqlEngineNow)}
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
    const { govn, tableName } = this;

    // deno-fmt-ignore
    return govn.SQL`
      ${await session.entryStateDML(sessionEntryID, "ASSURED_EXCEL_WORKBOOK_SHEET", "ATTEMPT_EXCEL_WORKBOOK_SHEET_EXPORT", "QeAdminDataExcelSheetIngestSource.exportResourceSQL", this.govn.emitCtx.sqlEngineNow)}

      CREATE TABLE ${targetSchema}.${tableName} AS SELECT * FROM ${tableName};

      ${await session.entryStateDML(sessionEntryID, "ATTEMPT_EXCEL_WORKBOOK_SHEET_EXPORT", ADMIN_DEMO_SHEET_TERMINAL_STATE, "QeAdminDataExcelSheetIngestSource.exportResourceSQL", this.govn.emitCtx.sqlEngineNow)}
    `;
  }
}

const QUESTION_REFERENCE_SHEET_TERMINAL_STATE =
  "EXIT(QuestionReferenceExcelSheetIngestSource)" as const;

/**
 * The class QuestionReferenceExcelSheetIngestSource that implements the o.ExcelSheetIngestSource interface.
 * The purpose of this class is to handle the ingestion of data from an Excel sheet into DuckDb database, specifically for the "Question_Reference" sheet.
 *
 * The class is defined with generic type parameters for the table name (TableName) and initial state (InitState).
 * It implements the o.ExcelSheetIngestSource interface with specific types.
 */
export class QuestionReferenceExcelSheetIngestSource<
  TableName extends string,
  InitState extends o.State,
> implements
  o.ExcelSheetIngestSource<
    "Question_Reference",
    TableName,
    ddbo.DuckDbOrchGovernance,
    InitState,
    typeof QUESTION_REFERENCE_SHEET_TERMINAL_STATE,
    ddbo.DuckDbOrchEmitContext
  > {
  readonly nature = "Excel Workbook Sheet";
  readonly sheetName = "Question_Reference";
  readonly tableName: TableName;
  constructor(
    readonly uri: string,
    readonly govn: ddbo.DuckDbOrchGovernance,
  ) {
    this.tableName = govn.toSnakeCase(
      path.basename(uri, ".xlsx") + "_" + this.sheetName,
    ) as TableName;
  }

  // deno-lint-ignore require-await
  async workflow(
    session: o.OrchSession<
      ddbo.DuckDbOrchGovernance,
      ddbo.DuckDbOrchEmitContext
    >,
    sessionEntryID: string,
  ): ReturnType<
    o.ExcelSheetIngestSource<
      "Question_Reference",
      TableName,
      ddbo.DuckDbOrchGovernance,
      InitState,
      typeof QUESTION_REFERENCE_SHEET_TERMINAL_STATE,
      ddbo.DuckDbOrchEmitContext
    >["workflow"]
  > {
    const ssr = new QuestionReferenceStructureRules(
      this.tableName,
      session.sessionID,
      sessionEntryID,
      this.govn,
    );
    const sar = new sg.QuestionReferenceAssuranceRules(
      this.tableName,
      session.sessionID,
      sessionEntryID,
      this.govn,
    );

    return {
      ingestSQL: async (issac) =>
        await this.ingestSQL(session, issac, ssr, sar),
      assuranceSQL: async () => await this.assuranceSQL(session, sar),
      exportResourceSQL: async (targetSchema) =>
        await this.exportResourceSQL(session, sar.sessionEntryID, targetSchema),
      terminalState: () => QUESTION_REFERENCE_SHEET_TERMINAL_STATE,
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
    ssr: QuestionReferenceStructureRules<TableName>,
    sar: sg.QuestionReferenceAssuranceRules<
      TableName,
      QuestionReferenceColumnName
    >,
  ) {
    const { sheetName, tableName, uri } = this;
    const { sessionID, sessionEntryID } = sar;

    // deno-fmt-ignore
    return this.govn.SQL`
      -- required by IngestEngine, setup the ingestion entry for logging
      ${await issac.sessionEntryInsertDML()}
     
      -- state management diagnostics 
      ${await session.entryStateDML(sessionEntryID, issac.initState(), "ATTEMPT_EXCEL_INGEST", "QuestionReferenceExcelSheetIngestSource.ingestSQL", this.govn.emitCtx.sqlEngineNow)}

      -- ingest Excel workbook sheet '${sheetName}' into ${tableName} using spatial plugin
      INSTALL spatial; LOAD spatial;

      -- be sure to add src_file_row_number and session_id columns to each row
      -- because assurance CTEs require them
      CREATE TABLE ${tableName} AS
        SELECT *, row_number() OVER () as src_file_row_number, '${sessionID}' as session_id, '${sessionEntryID}' as session_entry_id
          FROM st_read('${uri}', layer='${sheetName}', open_options=['HEADERS=FORCE', 'FIELD_TYPES=AUTO']);          
      
      ${ssr.requiredColumnNames()}
      ${await session.entryStateDML(sessionEntryID, "ATTEMPT_EXCEL_INGEST", "INGESTED_EXCEL_WORKBOOK_SHEET", "QuestionReferenceExcelSheetIngestSource.ingestSQL", this.govn.emitCtx.sqlEngineNow)}
      `
  }

  async assuranceSQL(
    session: o.OrchSession<
      ddbo.DuckDbOrchGovernance,
      ddbo.DuckDbOrchEmitContext
    >,
    sar: sg.QuestionReferenceAssuranceRules<
      TableName,
      QuestionReferenceColumnName
    >,
  ) {
    const { sessionEntryID } = sar;

    // deno-fmt-ignore
    return this.govn.SQL`
      ${await session.entryStateDML(sessionEntryID, "INGESTED_EXCEL_WORKBOOK_SHEET", "ATTEMPT_EXCEL_WORKBOOK_SHEET_ASSURANCE", "QuestionReferenceExcelSheetIngestSource.assuranceSQL", this.govn.emitCtx.sqlEngineNow)}
                      
      ${await session.entryStateDML(sessionEntryID, "ATTEMPT_EXCEL_WORKBOOK_SHEET_ASSURANCE", "ASSURED_EXCEL_WORKBOOK_SHEET", "QuestionReferenceExcelSheetIngestSource.assuranceSQL", this.govn.emitCtx.sqlEngineNow)}
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
    const { govn, tableName } = this;

    // deno-fmt-ignore
    return govn.SQL`
      ${await session.entryStateDML(sessionEntryID, "ASSURED_EXCEL_WORKBOOK_SHEET", "ATTEMPT_EXCEL_WORKBOOK_SHEET_EXPORT", "QuestionReferenceExcelSheetIngestSource.exportResourceSQL", this.govn.emitCtx.sqlEngineNow)}

      CREATE TABLE ${targetSchema}.${tableName} AS SELECT * FROM ${tableName};

      ${await session.entryStateDML(sessionEntryID, "ATTEMPT_EXCEL_WORKBOOK_SHEET_EXPORT", QUESTION_REFERENCE_SHEET_TERMINAL_STATE, "QuestionReferenceExcelSheetIngestSource.exportResourceSQL", this.govn.emitCtx.sqlEngineNow)}
    `;
  }
}

const ANSWER_REFERENCE_SHEET_TERMINAL_STATE =
  "EXIT(AnswerReferenceExcelSheetIngestSource)" as const;

/**
 * The class AnswerReferenceExcelSheetIngestSource that implements the o.ExcelSheetIngestSource interface.
 * The purpose of this class is to handle the ingestion of data from an Excel sheet into DuckDb database, specifically for the "Answer_Reference" sheet.
 *
 * The class is defined with generic type parameters for the table name (TableName) and initial state (InitState).
 * It implements the o.ExcelSheetIngestSource interface with specific types.
 */
export class AnswerReferenceExcelSheetIngestSource<
  TableName extends string,
  InitState extends o.State,
> implements
  o.ExcelSheetIngestSource<
    "Answer_Reference",
    TableName,
    ddbo.DuckDbOrchGovernance,
    InitState,
    typeof ANSWER_REFERENCE_SHEET_TERMINAL_STATE,
    ddbo.DuckDbOrchEmitContext
  > {
  readonly nature = "Excel Workbook Sheet";
  readonly sheetName = "Answer_Reference";
  readonly tableName: TableName;
  constructor(
    readonly uri: string,
    readonly govn: ddbo.DuckDbOrchGovernance,
  ) {
    this.tableName = govn.toSnakeCase(
      path.basename(uri, ".xlsx") + "_" + this.sheetName,
    ) as TableName;
  }

  // deno-lint-ignore require-await
  async workflow(
    session: o.OrchSession<
      ddbo.DuckDbOrchGovernance,
      ddbo.DuckDbOrchEmitContext
    >,
    sessionEntryID: string,
  ): ReturnType<
    o.ExcelSheetIngestSource<
      "Answer_Reference",
      TableName,
      ddbo.DuckDbOrchGovernance,
      InitState,
      typeof ANSWER_REFERENCE_SHEET_TERMINAL_STATE,
      ddbo.DuckDbOrchEmitContext
    >["workflow"]
  > {
    const ssr = new AnswerReferenceStructureRules(
      this.tableName,
      session.sessionID,
      sessionEntryID,
      this.govn,
    );
    const sar = new sg.AnswerReferenceAssuranceRules(
      this.tableName,
      session.sessionID,
      sessionEntryID,
      this.govn,
    );

    return {
      ingestSQL: async (issac) =>
        await this.ingestSQL(session, issac, ssr, sar),
      assuranceSQL: async () => await this.assuranceSQL(session, sar),
      exportResourceSQL: async (targetSchema) =>
        await this.exportResourceSQL(session, sar.sessionEntryID, targetSchema),
      terminalState: () => ANSWER_REFERENCE_SHEET_TERMINAL_STATE,
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
    ssr: AnswerReferenceStructureRules<TableName>,
    sar: sg.AnswerReferenceAssuranceRules<
      TableName,
      AnswerReferenceColumnName
    >,
  ) {
    const { sheetName, tableName, uri } = this;
    const { sessionID, sessionEntryID } = sar;

    // deno-fmt-ignore
    return this.govn.SQL`
      -- required by IngestEngine, setup the ingestion entry for logging
      ${await issac.sessionEntryInsertDML()}
     
      -- state management diagnostics 
      ${await session.entryStateDML(sessionEntryID, issac.initState(), "ATTEMPT_EXCEL_INGEST", "AnswerReferenceExcelSheetIngestSource.ingestSQL", this.govn.emitCtx.sqlEngineNow)}

      -- ingest Excel workbook sheet '${sheetName}' into ${tableName} using spatial plugin
      INSTALL spatial; LOAD spatial;

      -- be sure to add src_file_row_number and session_id columns to each row
      -- because assurance CTEs require them
      CREATE TABLE ${tableName} AS
        SELECT *, row_number() OVER () as src_file_row_number, '${sessionID}' as session_id, '${sessionEntryID}' as session_entry_id
          FROM st_read('${uri}', layer='${sheetName}', open_options=['HEADERS=FORCE', 'FIELD_TYPES=AUTO']);          
      
      ${ssr.requiredColumnNames()}
      ${await session.entryStateDML(sessionEntryID, "ATTEMPT_EXCEL_INGEST", "INGESTED_EXCEL_WORKBOOK_SHEET", "AnswerReferenceExcelSheetIngestSource.ingestSQL", this.govn.emitCtx.sqlEngineNow)}
      `
  }

  async assuranceSQL(
    session: o.OrchSession<
      ddbo.DuckDbOrchGovernance,
      ddbo.DuckDbOrchEmitContext
    >,
    sar: sg.AnswerReferenceAssuranceRules<
      TableName,
      AnswerReferenceColumnName
    >,
  ) {
    const { sessionEntryID } = sar;

    // deno-fmt-ignore
    return this.govn.SQL`
      ${await session.entryStateDML(sessionEntryID, "INGESTED_EXCEL_WORKBOOK_SHEET", "ATTEMPT_EXCEL_WORKBOOK_SHEET_ASSURANCE", "AnswerReferenceExcelSheetIngestSource.assuranceSQL", this.govn.emitCtx.sqlEngineNow)}
                      
      ${await session.entryStateDML(sessionEntryID, "ATTEMPT_EXCEL_WORKBOOK_SHEET_ASSURANCE", "ASSURED_EXCEL_WORKBOOK_SHEET", "AnswerReferenceExcelSheetIngestSource.assuranceSQL", this.govn.emitCtx.sqlEngineNow)}
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
    const { govn, tableName } = this;

    // deno-fmt-ignore
    return govn.SQL`
      ${await session.entryStateDML(sessionEntryID, "ASSURED_EXCEL_WORKBOOK_SHEET", "ATTEMPT_EXCEL_WORKBOOK_SHEET_EXPORT", "AnswerReferenceExcelSheetIngestSource.exportResourceSQL", this.govn.emitCtx.sqlEngineNow)}

      CREATE TABLE ${targetSchema}.${tableName} AS SELECT * FROM ${tableName};

      ${await session.entryStateDML(sessionEntryID, "ATTEMPT_EXCEL_WORKBOOK_SHEET_EXPORT", ANSWER_REFERENCE_SHEET_TERMINAL_STATE, "AnswerReferenceExcelSheetIngestSource.exportResourceSQL", this.govn.emitCtx.sqlEngineNow)}
    `;
  }
}

export function ingestExcelSourcesSupplier(
  govn: ddbo.DuckDbOrchGovernance,
): o.IngestFsPatternSourcesSupplier<
  | ScreeningExcelSheetIngestSource<string, o.State>
  | AdminDemographicExcelSheetIngestSource<string, o.State>
  | QeAdminDataExcelSheetIngestSource<string, o.State>
  | QuestionReferenceExcelSheetIngestSource<string, o.State>
  | AnswerReferenceExcelSheetIngestSource<string, o.State>
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
    sources: (entry) => {
      const uri = String(entry.path);
      const sources: (
        | ScreeningExcelSheetIngestSource<string, o.State>
        | AdminDemographicExcelSheetIngestSource<string, o.State>
        | QeAdminDataExcelSheetIngestSource<string, o.State>
        | QuestionReferenceExcelSheetIngestSource<string, o.State>
        | AnswerReferenceExcelSheetIngestSource<string, o.State>
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
          | QeAdminDataExcelSheetIngestSource<string, o.State>
          | QuestionReferenceExcelSheetIngestSource<string, o.State>
          | AnswerReferenceExcelSheetIngestSource<string, o.State>
      > = {
        "Admin_Demographic": () =>
          new AdminDemographicExcelSheetIngestSource(uri, govn),
        "Screening": () => new ScreeningExcelSheetIngestSource(uri, govn),
        "QE_Admin_Data": () => new QeAdminDataExcelSheetIngestSource(uri, govn),
        "Question_Reference": () =>
          new QuestionReferenceExcelSheetIngestSource(uri, govn),
        "Answer_Reference": () =>
          new AnswerReferenceExcelSheetIngestSource(uri, govn),
      };

      try {
        const wb = xlsx.readFile(uri);

        // deno-fmt-ignore
        const sheetNotFound = (name: string) =>
          Error(`Excel workbook sheet '${name}' not found in '${path.basename(uri)}' (available: ${wb.SheetNames.join(", ")})`);

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
        sources.push(new o.ErrorIngestSource(uri, err, "ERROR", govn));
      }
      return sources;
    },
  };
}
