import { path, SQLa_orch as o, SQLa_orch_duckdb as ddbo } from "./deps.ts";
import * as sg from "./governance.ts";

export const csvFileNames = [
  "SCREENING",
  "QE_ADMIN_DATA",
  "DEMOGRAPHIC_DATA",
] as const;
export type CsvFileName = (typeof csvFileNames)[number];

export const csvTableNames = [
  "screening",
  "qe_admin_data",
  "demographic_data",
] as const;

export const [
  aggrScreeningTableName,
  aggrQeAdminData,
  aggrPatientDemogrTableName,
] = csvTableNames;

const screeningCsvColumnNames = [
  "PAT_MRN_ID",
  "FACILITY_ID",
  "ENCOUNTER_ID",
  "ENCOUNTER_CLASS_CODE_SYSTEM",
  "ENCOUNTER_CLASS_CODE",
  "ENCOUNTER_CLASS_CODE_DESCRIPTION",
  "ENCOUNTER_STATUS_CODE_SYSTEM",
  "ENCOUNTER_STATUS_CODE",
  "ENCOUNTER_STATUS_CODE_DESCRIPTION",
  "ENCOUNTER_TYPE_CODE_SYSTEM",
  "ENCOUNTER_TYPE_CODE",
  "ENCOUNTER_TYPE_CODE_DESCRIPTION",
  "SCREENING_CODE_DESCRIPTION",
  "SCREENING_CODE_SYSTEM_NAME",
  "SCREENING_CODE",
  "SCREENING_STATUS_CODE_DESCRIPTION",
  "SCREENING_STATUS_CODE",
  "SCREENING_STATUS_CODE_SYSTEM",
  "RECORDED_TIME",
  "QUESTION_CODE_DESCRIPTION",
  "ANSWER_CODE_DESCRIPTION",
  "UCUM_UNITS",
  "QUESTION_CODE",
  "QUESTION_CODE_SYSTEM_NAME",
  "ANSWER_CODE",
  "ANSWER_CODE_SYSTEM_NAME",
  "PARENT_QUESTION_CODE",
  "SDOH_DOMAIN",
  "POTENTIAL_NEED_INDICATED",
] as const;

const adminDemographicCsvColumnNames = [
  "MPI_ID",
  "PAT_MRN_ID",
  "FACILITY_ID",
  "CONSENT",
  "FIRST_NAME",
  "MIDDLE_NAME",
  "LAST_NAME",
  "ADMINISTRATIVE_SEX_CODE",
  "ADMINISTRATIVE_SEX_CODE_DESCRIPTION",
  "ADMINISTRATIVE_SEX_CODE_SYSTEM",
  "SEX_AT_BIRTH_CODE",
  "SEX_AT_BIRTH_CODE_DESCRIPTION",
  "SEX_AT_BIRTH_CODE_SYSTEM",
  "PAT_BIRTH_DATE",
  "ADDRESS1",
  "ADDRESS2",
  "CITY",
  "STATE",
  "ZIP",
  "GENDER_IDENTITY_CODE_SYSTEM_NAME",
  "GENDER_IDENTITY_CODE",
  "GENDER_IDENTITY_CODE_DESCRIPTION",
  "SEXUAL_ORIENTATION_CODE_SYSTEM_NAME",
  "SEXUAL_ORIENTATION_CODE",
  "SEXUAL_ORIENTATION_DESCRIPTION",
  "PREFERRED_LANGUAGE_CODE_SYSTEM_NAME",
  "PREFERRED_LANGUAGE_CODE",
  "PREFERRED_LANGUAGE_DESCRIPTION",
  "RACE_CODE_SYSTEM_NAME",
  "RACE_CODE",
  "RACE_CODE_DESCRIPTION",
  "ETHNICITY_CODE_SYSTEM_NAME",
  "ETHNICITY_CODE",
  "ETHNICITY_CODE_DESCRIPTION",
  "MEDICAID_CIN",
] as const;

const qeAdminDataCsvColumnNames = [
  "PAT_MRN_ID",
  "FACILITY_ID",
  "FACILITY_LONG_NAME",
  "ORGANIZATION_TYPE",
  "FACILITY_ADDRESS1",
  "FACILITY_ADDRESS2",
  "FACILITY_CITY",
  "FACILITY_STATE",
  "FACILITY_ZIP",
  "VISIT_PART_2_FLAG",
  "VISIT_OMH_FLAG",
  "VISIT_OPWDD_FLAG",
] as const;

type ScreeningCsvColumnName = (typeof screeningCsvColumnNames)[number];

type AdminDemographicCsvColumnName =
  (typeof adminDemographicCsvColumnNames)[number];

type QeAdminDataCsvColumnName = (typeof qeAdminDataCsvColumnNames)[number];

export class ScreeningCsvStructureRules<
  TableName extends string,
> extends ddbo.DuckDbOrchTableAssuranceRules<
  TableName,
  ScreeningCsvColumnName
> {
  requiredColumnNames() {
    return this.tableRules.requiredColumnNamesStrict([
      ...screeningCsvColumnNames,
    ]);
  }
}

export class AdminDemographicCsvStructureRules<
  TableName extends string,
> extends ddbo.DuckDbOrchTableAssuranceRules<
  TableName,
  AdminDemographicCsvColumnName
> {
  requiredColumnNames() {
    return this.tableRules.requiredColumnNamesStrict([
      ...adminDemographicCsvColumnNames,
    ]);
  }
}

export class QeAdminDataCsvStructureRules<
  TableName extends string,
> extends ddbo.DuckDbOrchTableAssuranceRules<
  TableName,
  QeAdminDataCsvColumnName
> {
  requiredColumnNames() {
    return this.tableRules.requiredColumnNamesStrict([
      ...qeAdminDataCsvColumnNames,
    ]);
  }
}

const TERMINAL_STATE = "EXIT(ScreeningCsvFileIngestSource)" as const;

export class ScreeningCsvFileIngestSource<
  TableName extends string,
  InitState extends o.State,
> implements
  o.CsvFileIngestSource<
    TableName,
    ddbo.DuckDbOrchGovernance,
    InitState,
    typeof TERMINAL_STATE,
    ddbo.DuckDbOrchEmitContext
  > {
  readonly nature = "CSV";
  constructor(
    readonly uri: string,
    readonly tableName: TableName,
    readonly relatedTableNames: {
      readonly adminDemographicsTableName: string;
      readonly qeAdminDataTableName: string;
    },
    readonly govn: ddbo.DuckDbOrchGovernance,
  ) {}

  // deno-lint-ignore require-await
  async workflow(
    session: o.OrchSession<
      ddbo.DuckDbOrchGovernance,
      ddbo.DuckDbOrchEmitContext
    >,
    sessionEntryID: string,
  ): ReturnType<
    o.CsvFileIngestSource<
      TableName,
      ddbo.DuckDbOrchGovernance,
      InitState,
      typeof TERMINAL_STATE,
      ddbo.DuckDbOrchEmitContext
    >["workflow"]
  > {
    const ssr = new ScreeningCsvStructureRules(
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
      terminalState: () => TERMINAL_STATE,
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
    ssr: ScreeningCsvStructureRules<TableName>,
    sar: sg.ScreeningAssuranceRules<TableName, ScreeningCsvColumnName>,
  ) {
    const { tableName, uri } = this;
    const { sessionID, sessionEntryID } = sar;

    // deno-fmt-ignore
    return this.govn.SQL`
      -- required by IngestEngine, setup the ingestion entry for logging
      ${await issac.sessionEntryInsertDML()}

      -- state management diagnostics
      ${await session.entryStateDML(
        sessionEntryID,
        issac.initState(),
        "ATTEMPT_CSV_INGEST",
        "ScreeningCsvFileIngestSource.ingestSQL",
        this.govn.emitCtx.sqlEngineNow
      )}

      -- be sure to add src_file_row_number and session_id columns to each row
      -- because assurance CTEs require them
      CREATE TABLE ${tableName} AS
        SELECT *, row_number() OVER () as src_file_row_number, '${sessionID}' as session_id, '${sessionEntryID}' as session_entry_id
          FROM read_csv_auto('${uri}', types={'RECORDED_TIME': 'VARCHAR', 'ENCOUNTER_TYPE_CODE': 'VARCHAR'});

      ${ssr.requiredColumnNames()}

      ${await session.entryStateDML(
        sessionEntryID,
        "ATTEMPT_CSV_INGEST",
        "INGESTED_CSV",
        "ScreeningCsvFileIngestSource.ingestSQL",
        this.govn.emitCtx.sqlEngineNow
      )}
    `;
  }

  async assuranceSQL(
    session: o.OrchSession<
      ddbo.DuckDbOrchGovernance,
      ddbo.DuckDbOrchEmitContext
    >,
    sar: sg.ScreeningAssuranceRules<TableName, ScreeningCsvColumnName>,
  ) {
    const { govn, relatedTableNames } = this;
    const { sessionEntryID, tableRules: tr } = sar;

    // deno-fmt-ignore
    return govn.SQL`
      ${await session.entryStateDML(
        sessionEntryID,
        "INGESTED_CSV",
        "ATTEMPT_CSV_ASSURANCE",
        "ScreeningCsvFileIngestSource.assuranceSQL",
        this.govn.emitCtx.sqlEngineNow
      )}


      ${tr.mandatoryValueInAllRows("PAT_MRN_ID")}
      ${tr.mandatoryValueInAllRows("FACILITY_ID")}
      ${sar.matchesPatMrnIdAcrossScreeningQeAdminDemographics("PAT_MRN_ID", "FACILITY_ID", relatedTableNames)}
      ${tr.mandatoryValueInAllRows("ENCOUNTER_CLASS_CODE")}
      ${sar.onlyAllowValidEncounterClassCodeInAllRows("ENCOUNTER_CLASS_CODE")}
      ${sar.car.onlyAllowValidFieldCombinationsInAllRows("ENCOUNTER_CLASS_CODE","ENCOUNTER_CLASS_CODE_DESCRIPTION")}
      ${sar.car.onlyAllowValidFieldCombinationsInAllRows("ENCOUNTER_CLASS_CODE_DESCRIPTION","ENCOUNTER_CLASS_CODE")}
      ${tr.mandatoryValueInAllRows("ENCOUNTER_CLASS_CODE_SYSTEM")}
      ${tr.onlyAllowedValuesInAllRows(
        "ENCOUNTER_CLASS_CODE_SYSTEM",
        "'http://terminology.hl7.org/CodeSystem/v3-ActCode'"
      )}
      ${sar.onlyAllowValidEncounterClassDiscriptionInAllRows("ENCOUNTER_CLASS_CODE_DESCRIPTION")}
      ${tr.mandatoryValueInAllRows("ENCOUNTER_STATUS_CODE")}
      ${sar.onlyAllowValidEncounterStatusCodeInAllRows("ENCOUNTER_STATUS_CODE")}
      ${sar.onlyAllowValidEncounterStatusCodeDescriptionInAllRows("ENCOUNTER_STATUS_CODE_DESCRIPTION")}
      ${sar.car.onlyAllowValidFieldCombinationsInAllRows("ENCOUNTER_STATUS_CODE","ENCOUNTER_STATUS_CODE_DESCRIPTION")}
      ${sar.car.onlyAllowValidFieldCombinationsInAllRows("ENCOUNTER_STATUS_CODE_DESCRIPTION","ENCOUNTER_STATUS_CODE")}
      ${tr.mandatoryValueInAllRows("ENCOUNTER_STATUS_CODE_SYSTEM")}
      ${tr.onlyAllowedValuesInAllRows(
        "ENCOUNTER_STATUS_CODE_SYSTEM",
        "'http://hl7.org/fhir/encounter-status'"
      )}
      ${sar.onlyAllowValidEncounterTypeCodeInAllRows("ENCOUNTER_TYPE_CODE")}
      ${tr.onlyAllowedValuesInAllRows(
        "ENCOUNTER_TYPE_CODE_SYSTEM",
        "'SNOMED-CT', 'SNOMED', 'http://snomed.info/sct'"
      )}
      ${sar.onlyAllowValidEncounterTypeDescriptionInAllRows("ENCOUNTER_TYPE_CODE_DESCRIPTION")}
      ${sar.car.onlyAllowValidFieldCombinationsInAllRows("ENCOUNTER_TYPE_CODE","ENCOUNTER_TYPE_CODE_DESCRIPTION")}
      ${sar.car.onlyAllowValidFieldCombinationsInAllRows("ENCOUNTER_TYPE_CODE_DESCRIPTION","ENCOUNTER_TYPE_CODE")}
      ${tr.mandatoryValueInAllRows("SCREENING_STATUS_CODE")}
      ${sar.onlyAllowValidScreeningStatusCodeInAllRows("SCREENING_STATUS_CODE")}
      ${sar.onlyAllowValidScreeningStatusDescriptionInAllRows("SCREENING_STATUS_CODE_DESCRIPTION")}
      ${sar.car.onlyAllowValidFieldCombinationsInAllRows("SCREENING_STATUS_CODE","SCREENING_STATUS_CODE_DESCRIPTION")}
      ${sar.car.onlyAllowValidFieldCombinationsInAllRows("SCREENING_STATUS_CODE_DESCRIPTION","SCREENING_STATUS_CODE")}
      ${tr.mandatoryValueInAllRows("SCREENING_STATUS_CODE_SYSTEM")}
      ${tr.onlyAllowedValuesInAllRows(
        "SCREENING_STATUS_CODE_SYSTEM",
        "'http://hl7.org/fhir/observation-status'"
      )}
      ${sar.onlyAllowValidScreeningQuestionAnswerMandatoryValuesInAllRows("ANSWER_CODE")}
      ${sar.onlyAllowValidScreeningQuestionAnswerMandatoryValuesInAllRows("ANSWER_CODE_SYSTEM_NAME")}
      ${sar.onlyAllowValidScreeningQuestionAnswerMandatoryValuesInAllRows("QUESTION_CODE")}
      ${sar.onlyAllowValidScreeningQuestionAnswerMandatoryValuesInAllRows("QUESTION_CODE_SYSTEM_NAME")}
      ${sar.onlyAllowValidScreeningQuestionAnswerMandatoryValuesInAllRows("SCREENING_CODE_DESCRIPTION")}
      ${sar.onlyAllowValidScreeningQuestionAnswerMandatoryValuesInAllRows("SCREENING_CODE_SYSTEM_NAME")}
      ${sar.onlyAllowValidScreeningQuestionAnswerMandatoryValuesInAllRows("SCREENING_CODE")}
      ${tr.mandatoryValueInAllRows("QUESTION_CODE_DESCRIPTION")}
      ${sar.onlyAllowValidAnswerCodeForQuestionCodeInAllRows("QUESTION_CODE","ANSWER_CODE")}
      ${tr.onlyAllowedValuesInAllRows(
        "SCREENING_CODE",
        "'96777-8', '97023-6'"
      )}
      ${tr.onlyAllowedValuesInAllRows(
        "SCREENING_CODE_SYSTEM_NAME",
        "'LN', 'LOINC', 'http://loinc.org'"
      )}
      ${tr.mandatoryValueInAllRows("RECORDED_TIME")}
      ${sar.onlyAllowValidRecordedTimeInAllRows("RECORDED_TIME")}
      ${tr.mandatoryValueInAllRows("SDOH_DOMAIN")}
      ${sar.onlyAllowValidSdohDomainInAllRows("SDOH_DOMAIN")}
      ${sar.onlyAllowValidQuestionCodeForScreeningCodeInAllRows("QUESTION_CODE")}
      ${tr.mandatoryValueInAllRows("ANSWER_CODE_DESCRIPTION")}
      ${tr.onlyAllowedValuesInAllRows(
        "QUESTION_CODE_SYSTEM_NAME",
        "'LN','LOINC','http://loinc.org'"
      )}
      ${tr.onlyAllowedValuesInAllRows("ANSWER_CODE_SYSTEM_NAME", "'LN','LOINC','http://loinc.org'")}
      ${tr.mandatoryValueInAllRows("POTENTIAL_NEED_INDICATED")}
      ${tr.onlyAllowedValuesInAllRows(
        "POTENTIAL_NEED_INDICATED",
        "'Yes','No','NA','yes','no','na'"
      )}
      ${sar.onlyAllowValidScreeningPotentialNeedIndicatedQuestionAnswerValuesInAllRows("POTENTIAL_NEED_INDICATED")}
      ${await session.entryStateDML(
        sessionEntryID,
        "ATTEMPT_CSV_ASSURANCE",
        "ASSURED_CSV",
        "ScreeningCsvFileIngestSource.assuranceSQL",
        this.govn.emitCtx.sqlEngineNow
      )}
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
    const {
      govn: { SQL },
      tableName,
      relatedTableNames,
    } = this;

    // deno-fmt-ignore
    return SQL`
      ${await session.entryStateDML(
        sessionEntryID,
        "ASSURED_CSV",
        "EXIT(ScreeningCsvFileIngestSource)",
        "ScreeningCsvFileIngestSource.exportResourceSQL",
        this.govn.emitCtx.sqlEngineNow
      )}

      CREATE TABLE IF NOT EXISTS ${aggrScreeningTableName} AS SELECT * FROM ${tableName} WHERE 0=1;
      INSERT INTO ${aggrScreeningTableName} SELECT * FROM ${tableName};

      CREATE TABLE ${targetSchema}.${tableName} AS SELECT * FROM ${tableName};

      CREATE TABLE IF NOT EXISTS ${targetSchema}.${aggrScreeningTableName} AS SELECT * FROM ${tableName} WHERE 0=1;
      INSERT INTO ${targetSchema}.${aggrScreeningTableName} SELECT * FROM ${tableName};

      -- try sqltofhir Visual Studio Code extension for writing FHIR resources with SQL.
      -- see https://marketplace.visualstudio.com/items?itemName=arkhn.sqltofhir-vscode
      CREATE VIEW IF NOT EXISTS screening_fhir AS
        SELECT tab_screening.PAT_MRN_ID, CONCAT(tab_demograph.FIRST_NAME,' ', tab_demograph.LAST_NAME) as display_name, json_object(
              'resourceType', 'Observation',
              'id', tab_screening.ENCOUNTER_ID,
              'status', 'final',
              'code', json_object(
                  'coding', json_array(
                      json_object(
                          'system', tab_screening.QUESTION_CODE_SYSTEM_NAME,
                          'code', tab_screening.QUESTION_CODE,
                          'display', tab_screening.QUESTION_CODE_DESCRIPTION
                      )
                  )
              ),
              'subject', json_object(
                  'reference', 'Patient/' || tab_screening.PAT_MRN_ID,
                  'display',  CONCAT(tab_demograph.FIRST_NAME,' ', tab_demograph.LAST_NAME)
              ),
              'effectiveDateTime', tab_screening.RECORDED_TIME,
              'valueString', tab_screening.ANSWER_CODE_DESCRIPTION,
              'performer', json_array(
                  json_object(
                      'reference', 'Practitioner/' || tab_screening.session_id
                  )
              ),
              'context', json_object(
                  'reference', 'Encounter/' || tab_screening.ENCOUNTER_ID
              )
          ) AS FHIR_Observation
        FROM ${tableName} as tab_screening LEFT JOIN ${relatedTableNames.adminDemographicsTableName} as tab_demograph
        ON tab_screening.PAT_MRN_ID = tab_demograph.PAT_MRN_ID;

      CREATE VIEW IF NOT EXISTS ${targetSchema}.${aggrScreeningTableName}_fhir AS
        SELECT tab_screening.PAT_MRN_ID, CONCAT(tab_demograph.FIRST_NAME,' ', tab_demograph.LAST_NAME) as display_name, json_object(
              'resourceType', 'Observation',
              'id', tab_screening.ENCOUNTER_ID,
              'status', 'final',
              'code', json_object(
                  'coding', json_array(
                      json_object(
                          'system', tab_screening.QUESTION_CODE_SYSTEM_NAME,
                          'code', tab_screening.QUESTION_CODE,
                          'display', tab_screening.QUESTION_CODE_DESCRIPTION
                      )
                  )
              ),
              'subject', json_object(
                  'reference', 'Patient/' || tab_screening.PAT_MRN_ID,
                  'display',  CONCAT(tab_demograph.FIRST_NAME,' ', tab_demograph.LAST_NAME)
              ),
              'effectiveDateTime', tab_screening.RECORDED_TIME,
              'valueString', tab_screening.ANSWER_CODE_DESCRIPTION,
              'performer', json_array(
                  json_object(
                      'reference', 'Practitioner/' || tab_screening.session_id
                  )
              ),
              'context', json_object(
                  'reference', 'Encounter/' || tab_screening.ENCOUNTER_ID
              )
          ) AS FHIR_Observation
        FROM ${tableName} as tab_screening LEFT JOIN ${relatedTableNames.adminDemographicsTableName} as tab_demograph
        ON tab_screening.PAT_MRN_ID = tab_demograph.PAT_MRN_ID;

              -- TODO: Need to fill out subject->display, source->display, questionnaire
      CREATE VIEW IF NOT EXISTS ${targetSchema}.${aggrScreeningTableName}_fhir_questionnaire AS
        SELECT tab_screening.PAT_MRN_ID, CONCAT(tab_demograph.FIRST_NAME,' ', tab_demograph.LAST_NAME) as display_name, json_object(
              'resourceType', 'QuestionnaireResponse',
              'id', tab_screening.ENCOUNTER_ID,
              'status', 'completed',
              'questionnaire', '',
              '_questionnaire', json_object(
                  'extension', json_array(
                      json_object(
                          'url', tab_screening.QUESTION_CODE_SYSTEM_NAME,
                          'valueString', tab_screening.QUESTION_CODE
                      )
                  )
              ),
              'subject', json_object(
                  'reference', 'Patient/' || tab_screening.PAT_MRN_ID,
                  'display',  CONCAT(tab_demograph.FIRST_NAME,' ', tab_demograph.LAST_NAME)
              ),
              'authored', tab_screening.RECORDED_TIME,
              'source', json_object(
                  'reference', 'Patient/' || tab_screening.PAT_MRN_ID,
                  'display',  CONCAT(tab_demograph.FIRST_NAME,' ', tab_demograph.LAST_NAME)
              ),
              'item', json_array(
                  json_object(
                      'linkId', tab_screening.QUESTION_CODE,
                      'text', tab_screening.QUESTION_CODE_DESCRIPTION,
                      'answer',  json_array(
                        json_object(
                            'valueCoding', json_object(
                              'system', 'http://loinc.org',
                              'code', tab_screening.ANSWER_CODE,
                              'display', tab_screening.ANSWER_CODE_DESCRIPTION
                            )
                        )
                      )
                  )
              )
          ) AS FHIR_Questionnaire
        FROM ${tableName} as tab_screening LEFT JOIN ${relatedTableNames.adminDemographicsTableName} as tab_demograph
        ON tab_screening.PAT_MRN_ID = tab_demograph.PAT_MRN_ID;

        ${await session.entryStateDML(
          sessionEntryID,
          "ATTEMPT_CSV_EXPORT",
          TERMINAL_STATE,
          "ScreeningCsvFileIngestSource.exportResourceSQL",
          this.govn.emitCtx.sqlEngineNow
        )}
        `;
  }
}

const ADMIN_DEMO_CSV_TERMINAL_STATE =
  "EXIT(AdminDemographicCsvFileIngestSource)" as const;

export class AdminDemographicCsvFileIngestSource<
  TableName extends string,
  InitState extends o.State,
> implements
  o.CsvFileIngestSource<
    TableName,
    ddbo.DuckDbOrchGovernance,
    InitState,
    typeof ADMIN_DEMO_CSV_TERMINAL_STATE,
    ddbo.DuckDbOrchEmitContext
  > {
  readonly nature = "CSV";
  constructor(
    readonly uri: string,
    readonly tableName: TableName,
    readonly relatedTableNames: {
      readonly screeningTableName: string;
      readonly qeAdminDataTableName: string;
    },
    readonly govn: ddbo.DuckDbOrchGovernance,
  ) {}

  // deno-lint-ignore require-await
  async workflow(
    session: o.OrchSession<
      ddbo.DuckDbOrchGovernance,
      ddbo.DuckDbOrchEmitContext
    >,
    sessionEntryID: string,
  ): ReturnType<
    o.CsvFileIngestSource<
      TableName,
      ddbo.DuckDbOrchGovernance,
      InitState,
      typeof ADMIN_DEMO_CSV_TERMINAL_STATE,
      ddbo.DuckDbOrchEmitContext
    >["workflow"]
  > {
    const ssr = new AdminDemographicCsvStructureRules(
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
      terminalState: () => ADMIN_DEMO_CSV_TERMINAL_STATE,
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
    ssr: AdminDemographicCsvStructureRules<TableName>,
    sar: sg.AdminDemographicAssuranceRules<
      TableName,
      AdminDemographicCsvColumnName
    >,
  ) {
    const { tableName, uri } = this;
    const { sessionID, sessionEntryID } = sar;

    // deno-fmt-ignore
    return this.govn.SQL`
      -- required by IngestEngine, setup the ingestion entry for logging
      ${await issac.sessionEntryInsertDML()}

      -- state management diagnostics
      ${await session.entryStateDML(
        sessionEntryID,
        issac.initState(),
        "ATTEMPT_CSV_INGEST",
        "AdminDemographicCsvFileIngestSource.ingestSQL",
        this.govn.emitCtx.sqlEngineNow
      )}

      -- be sure to add src_file_row_number and session_id columns to each row
      -- because assurance CTEs require them
      CREATE TABLE ${tableName} AS
        SELECT *, row_number() OVER () as src_file_row_number, '${sessionID}' as session_id, '${sessionEntryID}' as session_entry_id
          FROM read_csv_auto('${uri}', types={'SEX_AT_BIRTH_CODE': 'VARCHAR', 'ADMINISTRATIVE_SEX_CODE': 'VARCHAR', 'SEXUAL_ORIENTATION_CODE': 'VARCHAR', 'GENDER_IDENTITY_CODE': 'VARCHAR'});

      ${ssr.requiredColumnNames()}

      ${await session.entryStateDML(
        sessionEntryID,
        "ATTEMPT_CSV_INGEST",
        "INGESTED_CSV",
        "AdminDemographicCsvFileIngestSource.ingestSQL",
        this.govn.emitCtx.sqlEngineNow
      )}
    `;
  }

  async assuranceSQL(
    session: o.OrchSession<
      ddbo.DuckDbOrchGovernance,
      ddbo.DuckDbOrchEmitContext
    >,
    adar: sg.AdminDemographicAssuranceRules<
      TableName,
      AdminDemographicCsvColumnName
    >,
  ) {
    const { govn } = this;
    const { sessionEntryID, tableRules: tr } = adar;

    // deno-fmt-ignore
    return govn.SQL`
      ${await session.entryStateDML(
        sessionEntryID,
        "INGESTED_CSV",
        "ATTEMPT_CSV_ASSURANCE",
        "AdminDemographicCsvFileIngestSource.assuranceSQL",
        this.govn.emitCtx.sqlEngineNow
      )}

      ${tr.mandatoryValueInAllRows("FIRST_NAME")}
      ${tr.onlyAllowAlphabetsInAllRows("FIRST_NAME")}
      ${tr.onlyAllowAlphabetsInAllRows("MIDDLE_NAME")}
      ${tr.mandatoryValueInAllRows("LAST_NAME")}
      ${tr.onlyAllowAlphabetsInAllRows("LAST_NAME")}
      ${tr.mandatoryValueInAllRows("ADMINISTRATIVE_SEX_CODE")}
      ${adar.onlyAllowValidAdministrativeSexCodeInAllRows("ADMINISTRATIVE_SEX_CODE")}
      ${adar.onlyAllowValidAdministrativeSexCodeDescriptionInAllRows("ADMINISTRATIVE_SEX_CODE_DESCRIPTION")}
      ${adar.onlyAllowValidAdministrativeSexCodeSystemInAllRows("ADMINISTRATIVE_SEX_CODE_SYSTEM")}
      ${adar.car.onlyAllowValidFieldCombinationsInAllRows("ADMINISTRATIVE_SEX_CODE","ADMINISTRATIVE_SEX_CODE_DESCRIPTION")}
      ${adar.car.onlyAllowValidFieldCombinationsInAllRows("ADMINISTRATIVE_SEX_CODE_DESCRIPTION","ADMINISTRATIVE_SEX_CODE")}
      ${adar.onlyAllowValidSexAtBirthCodeInAllRows("SEX_AT_BIRTH_CODE")}
      ${adar.onlyAllowValidSexAtBirthCodeDescriptionInAllRows("SEX_AT_BIRTH_CODE_DESCRIPTION")}
      ${adar.onlyAllowValidSexAtBirthCodeSystemInAllRows("SEX_AT_BIRTH_CODE_SYSTEM")}
      ${adar.car.onlyAllowValidFieldCombinationsInAllRows("SEX_AT_BIRTH_CODE","SEX_AT_BIRTH_CODE_DESCRIPTION")}
      ${adar.car.onlyAllowValidFieldCombinationsInAllRows("SEX_AT_BIRTH_CODE_DESCRIPTION","SEX_AT_BIRTH_CODE")}
      ${tr.mandatoryValueInAllRows("PAT_BIRTH_DATE")}
      ${tr.onlyAllowValidDateTimeInAllRows("PAT_BIRTH_DATE")}
      ${tr.mandatoryValueInAllRows("CITY")}
      ${tr.mandatoryValueInAllRows("STATE")}
      ${tr.onlyAllowedValuesInAllRows("STATE", "'NY', 'New York'")}
      ${tr.mandatoryValueInAllRows("ZIP")}
      ${adar.car.onlyAllowValidZipInAllRows("ZIP")}
      ${adar.car.onlyAllowValidIntegerAlphaNumericStringInAllRows("ADDRESS1")}
      ${adar.onlyAllowValidAddress1OrMedicaidCinInAllRows("ADDRESS1","MEDICAID_CIN")}
      ${adar.onlyAllowValidGenderIdentityCodeInAllRows("GENDER_IDENTITY_CODE")}
      ${tr.onlyAllowedValuesInAllRows(
        "GENDER_IDENTITY_CODE_SYSTEM_NAME",
        "'SNOMED-CT','SNOMED','http://snomed.info/sct'"
      )}
      ${adar.car.onlyAllowValidFieldCombinationsInAllRows("GENDER_IDENTITY_CODE","GENDER_IDENTITY_CODE_DESCRIPTION")}
      ${adar.car.onlyAllowValidFieldCombinationsInAllRows("GENDER_IDENTITY_CODE_DESCRIPTION","GENDER_IDENTITY_CODE")}
      ${adar.onlyAllowValidSexualOrientationCodeInAllRows("SEXUAL_ORIENTATION_CODE")}
      ${adar.onlyAllowValidSexualOrientationDescriptionInAllRows("SEXUAL_ORIENTATION_DESCRIPTION")}
      ${adar.car.onlyAllowValidFieldCombinationsInAllRows("SEXUAL_ORIENTATION_CODE","SEXUAL_ORIENTATION_DESCRIPTION")}
      ${adar.car.onlyAllowValidFieldCombinationsInAllRows("SEXUAL_ORIENTATION_DESCRIPTION","SEXUAL_ORIENTATION_CODE")}
      ${tr.onlyAllowedValuesInAllRows(
        "SEXUAL_ORIENTATION_CODE_SYSTEM_NAME",
        "'SNOMED-CT','SNOMED','http://snomed.info/sct'"
      )}
      ${adar.onlyAllowValidEthnicityCodeInAllRows("ETHNICITY_CODE")}
      ${adar.onlyAllowValidEthnicityCodeDescriptionInAllRows("ETHNICITY_CODE_DESCRIPTION")}
      ${adar.car.onlyAllowValidFieldCombinationsInAllRows("ETHNICITY_CODE","ETHNICITY_CODE_DESCRIPTION")}
      ${adar.car.onlyAllowValidFieldCombinationsInAllRows("ETHNICITY_CODE_DESCRIPTION","ETHNICITY_CODE")}
      ${adar.onlyAllowValidRaceCodeInAllRows("RACE_CODE")}
      ${adar.onlyAllowValidRaceCodeDescriptionInAllRows("RACE_CODE_DESCRIPTION")}
      ${adar.car.onlyAllowValidFieldCombinationsInAllRows("RACE_CODE","RACE_CODE_DESCRIPTION")}
      ${adar.car.onlyAllowValidFieldCombinationsInAllRows("RACE_CODE_DESCRIPTION","RACE_CODE")}
      ${tr.onlyAllowedValuesInAllRows("RACE_CODE_SYSTEM_NAME", "'CDC','CDCRE','urn:oid:2.16.840.1.113883.6.238'")}
      ${tr.onlyAllowedValuesInAllRows(
        "ETHNICITY_CODE_SYSTEM_NAME",
        "'CDC','CDCRE','urn:oid:2.16.840.1.113883.6.238'"
      )}
      ${tr.mandatoryValueInAllRows("MPI_ID")}
      ${tr.mandatoryValueInAllRows("PAT_MRN_ID")}
      ${adar.onlyAllowValidMpiIdPerPatMrnIdInAllRows("MPI_ID")}
      ${tr.mandatoryValueInAllRows("FACILITY_ID")}
      ${adar.car.onlyAllowValidMedicaidCinFormatInAllRows("MEDICAID_CIN")}
      ${adar.onlyAllowUniqueMedicaidCinPerMrnInAllRows("MEDICAID_CIN")}
      ${adar.onlyAllowValidAddress1OrMedicaidCinInAllRows("MEDICAID_CIN","ADDRESS1")}
      ${tr.mandatoryValueInAllRows("CONSENT")}
      ${tr.onlyAllowedValuesInAllRows("CONSENT", "'Yes', 'YES', 'yes', 'Y', 'y', 'No', 'NO', 'no','N', 'n','Unknown', 'UNKNOWN', 'unknown','UNK', 'Unk', 'unk'")}

      ${await session.entryStateDML(
        sessionEntryID,
        "ATTEMPT_CSV_ASSURANCE",
        "ASSURED_CSV",
        "AdminDemographicCsvFileIngestSource.assuranceSQL",
        this.govn.emitCtx.sqlEngineNow
      )}
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
    const {
      govn: { SQL },
      tableName,
    } = this;

    // deno-fmt-ignore
    return SQL`
      ${await session.entryStateDML(
        sessionEntryID,
        "ASSURED_CSV",
        "EXIT(AdminDemographicCsvFileIngestSource)",
        "AdminDemographicCsvFileIngestSource.exportResourceSQL",
        this.govn.emitCtx.sqlEngineNow
      )}

      CREATE TABLE IF NOT EXISTS ${aggrPatientDemogrTableName} AS SELECT * FROM ${tableName} WHERE 0=1;
      INSERT INTO ${aggrPatientDemogrTableName} SELECT * FROM ${tableName};

      CREATE TABLE ${targetSchema}.${tableName} AS SELECT * FROM ${tableName};

      CREATE TABLE IF NOT EXISTS ${targetSchema}.${aggrPatientDemogrTableName} AS SELECT * FROM ${tableName} WHERE 0=1;
      INSERT INTO ${targetSchema}.${aggrPatientDemogrTableName} SELECT * FROM ${tableName};



        ${await session.entryStateDML(
          sessionEntryID,
          "ATTEMPT_CSV_EXPORT",
          TERMINAL_STATE,
          "AdminDemographicCsvFileIngestSource.exportResourceSQL",
          this.govn.emitCtx.sqlEngineNow
        )}
        `;
  }
}

const QE_ADMIN_DATA_SHEET_TERMINAL_STATE =
  "EXIT(QeAdminDataCsvFileIngestSource)" as const;

export class QeAdminDataCsvFileIngestSource<
  TableName extends string,
  InitState extends o.State,
> implements
  o.CsvFileIngestSource<
    TableName,
    ddbo.DuckDbOrchGovernance,
    InitState,
    typeof QE_ADMIN_DATA_SHEET_TERMINAL_STATE,
    ddbo.DuckDbOrchEmitContext
  > {
  readonly nature = "CSV";
  constructor(
    readonly uri: string,
    readonly tableName: TableName,
    readonly relatedTableNames: {
      readonly adminDemographicsTableName: string;
      readonly screeningTableName: string;
    },
    readonly govn: ddbo.DuckDbOrchGovernance,
  ) {}

  // deno-lint-ignore require-await
  async workflow(
    session: o.OrchSession<
      ddbo.DuckDbOrchGovernance,
      ddbo.DuckDbOrchEmitContext
    >,
    sessionEntryID: string,
  ): ReturnType<
    o.CsvFileIngestSource<
      TableName,
      ddbo.DuckDbOrchGovernance,
      InitState,
      typeof QE_ADMIN_DATA_SHEET_TERMINAL_STATE,
      ddbo.DuckDbOrchEmitContext
    >["workflow"]
  > {
    const ssr = new QeAdminDataCsvStructureRules(
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
    ssr: QeAdminDataCsvStructureRules<TableName>,
    sar: sg.QeAdminDataAssuranceRules<TableName, QeAdminDataCsvColumnName>,
  ) {
    const { tableName, uri } = this;
    const { sessionID, sessionEntryID } = sar;

    // deno-fmt-ignore
    return this.govn.SQL`
      -- required by IngestEngine, setup the ingestion entry for logging
      ${await issac.sessionEntryInsertDML()}

      -- state management diagnostics
      ${await session.entryStateDML(
        sessionEntryID,
        issac.initState(),
        "ATTEMPT_CSV_INGEST",
        "QeAdminDataCsvFileIngestSource.ingestSQL",
        this.govn.emitCtx.sqlEngineNow
      )}

      -- be sure to add src_file_row_number and session_id columns to each row
      -- because assurance CTEs require them
      CREATE TABLE ${tableName} AS
        SELECT *, row_number() OVER () as src_file_row_number, '${sessionID}' as session_id, '${sessionEntryID}' as session_entry_id
          FROM read_csv_auto('${uri}');

      ${ssr.requiredColumnNames()}

      ${await session.entryStateDML(
        sessionEntryID,
        "ATTEMPT_CSV_INGEST",
        "INGESTED_CSV",
        "QeAdminDataCsvFileIngestSource.ingestSQL",
        this.govn.emitCtx.sqlEngineNow
      )}
    `;
  }

  async assuranceSQL(
    session: o.OrchSession<
      ddbo.DuckDbOrchGovernance,
      ddbo.DuckDbOrchEmitContext
    >,
    qedar: sg.QeAdminDataAssuranceRules<TableName, QeAdminDataCsvColumnName>,
  ) {
    const { govn } = this;
    const { sessionEntryID, tableRules: tr } = qedar;

    // deno-fmt-ignore
    return govn.SQL`
      ${await session.entryStateDML(
        sessionEntryID,
        "INGESTED_CSV",
        "ATTEMPT_CSV_ASSURANCE",
        "QeAdminDataCsvFileIngestSource.assuranceSQL",
        this.govn.emitCtx.sqlEngineNow
      )}

      ${tr.mandatoryValueInAllRows("PAT_MRN_ID")}
      ${tr.mandatoryValueInAllRows("FACILITY_ID")}
      ${qedar.onlyAllowValidUniqueFacilityIdPerFacilityInAllRows("FACILITY_ID")}
      ${tr.mandatoryValueInAllRows("FACILITY_LONG_NAME")}
      ${tr.mandatoryValueInAllRows("ORGANIZATION_TYPE")}
      ${tr.onlyAllowedValuesInAllRows(
        "ORGANIZATION_TYPE",
        "'Hospital', 'DTC', 'SNF', 'SCN', 'CBO', 'OMH', 'OASAS', 'Practice', 'Article 36', 'Article 40', 'MCO'"
      )}
      ${tr.mandatoryValueInAllRows("FACILITY_ADDRESS1")}
      ${qedar.onlyAllowValidUniqueFacilityAddress1PerFacilityInAllRows("FACILITY_ADDRESS1")}
      ${qedar.car.onlyAllowValidIntegerAlphaNumericStringInAllRows("FACILITY_ADDRESS1")}
      ${tr.mandatoryValueInAllRows("FACILITY_STATE")}
      ${tr.onlyAllowedValuesInAllRows("FACILITY_STATE", "'NY', 'New York'")}
      ${tr.mandatoryValueInAllRows("FACILITY_ZIP")}
      ${qedar.car.onlyAllowValidZipInAllRows("FACILITY_ZIP")}
      ${tr.mandatoryValueInAllRows("VISIT_PART_2_FLAG")}
      ${tr.onlyAllowedValuesInAllRows("VISIT_PART_2_FLAG", "'Yes', 'No'")}
      ${tr.mandatoryValueInAllRows("VISIT_OMH_FLAG")}
      ${tr.onlyAllowedValuesInAllRows("VISIT_OMH_FLAG", "'Yes', 'No'")}
      ${tr.mandatoryValueInAllRows("VISIT_OPWDD_FLAG")}
      ${tr.onlyAllowedValuesInAllRows("VISIT_OPWDD_FLAG", "'Yes', 'No'")}
      ${qedar.car.onlyAllowAlphabetsWithSpacesInAllRows("FACILITY_LONG_NAME")}

      ${await session.entryStateDML(
        sessionEntryID,
        "ATTEMPT_CSV_ASSURANCE",
        "ASSURED_CSV",
        "QeAdminDataCsvFileIngestSource.assuranceSQL",
        this.govn.emitCtx.sqlEngineNow
      )}
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
    const {
      govn: { SQL },
      tableName,
    } = this;

    // deno-fmt-ignore
    return SQL`
      ${await session.entryStateDML(
        sessionEntryID,
        "ASSURED_CSV",
        "EXIT(QeAdminDataCsvFileIngestSource)",
        "QeAdminDataCsvFileIngestSource.exportResourceSQL",
        this.govn.emitCtx.sqlEngineNow
      )}

      CREATE TABLE IF NOT EXISTS ${aggrQeAdminData} AS SELECT * FROM ${tableName} WHERE 0=1;
      INSERT INTO ${aggrQeAdminData} SELECT * FROM ${tableName};

      CREATE TABLE ${targetSchema}.${tableName} AS SELECT * FROM ${tableName};

      CREATE TABLE IF NOT EXISTS ${targetSchema}.${aggrQeAdminData} AS SELECT * FROM ${tableName} WHERE 0=1;
      INSERT INTO ${targetSchema}.${aggrQeAdminData} SELECT * FROM ${tableName};

        ${await session.entryStateDML(
          sessionEntryID,
          "ATTEMPT_CSV_EXPORT",
          TERMINAL_STATE,
          "QeAdminDataCsvFileIngestSource.exportResourceSQL",
          this.govn.emitCtx.sqlEngineNow
        )}
        `;
  }
}

export function ingestCsvFilesSourcesSupplier(
  govn: ddbo.DuckDbOrchGovernance,
): o.IngestFsPatternSourcesSupplier<
  | ScreeningCsvFileIngestSource<string, o.State>
  | AdminDemographicCsvFileIngestSource<string, o.State>
  | QeAdminDataCsvFileIngestSource<string, o.State>
  | o.ErrorIngestSource<
    ddbo.DuckDbOrchGovernance,
    o.State,
    ddbo.DuckDbOrchEmitContext
  >
> {
  return {
    pattern: path.globToRegExp("**/*.csv", {
      extended: true,
      globstar: true,
    }),
    sources: (entry) => {
      const filePath = String(entry.path);
      const sources: (
        | ScreeningCsvFileIngestSource<string, o.State>
        | AdminDemographicCsvFileIngestSource<string, o.State>
        | QeAdminDataCsvFileIngestSource<string, o.State>
        | o.ErrorIngestSource<
          ddbo.DuckDbOrchGovernance,
          o.State,
          ddbo.DuckDbOrchEmitContext
        >
      )[] = [];
      const fileName = path.basename(filePath);
      const patterns = /.*(SCREENING|QE_ADMIN_DATA|DEMOGRAPHIC_DATA)(.*)?.csv/i;
      const groupMatch = filePath.match(patterns);

      if (groupMatch) {
        const suffix = groupMatch[2];
        const screeningTableName = govn.toSnakeCase(
          `screening${suffix}`.toLowerCase(),
        );
        const adminDemographicsTableName = govn.toSnakeCase(
          `admin_demographics${suffix}`.toLowerCase(),
        );
        const qeAdminDataTableName = govn.toSnakeCase(
          `qe_admin_data${suffix}`.toLowerCase(),
        );

        const csvFileName: CsvFileName = groupMatch[1] as CsvFileName;
        const csvExpected: Record<
          CsvFileName,
          () =>
            | ScreeningCsvFileIngestSource<string, o.State>
            | AdminDemographicCsvFileIngestSource<string, o.State>
            | QeAdminDataCsvFileIngestSource<string, o.State>
        > = {
          SCREENING: () =>
            new ScreeningCsvFileIngestSource(
              String(entry.path),
              screeningTableName,
              {
                adminDemographicsTableName,
                qeAdminDataTableName,
              },
              govn,
            ),
          QE_ADMIN_DATA: () =>
            new QeAdminDataCsvFileIngestSource(
              String(entry.path),
              qeAdminDataTableName,
              {
                adminDemographicsTableName,
                screeningTableName,
              },
              govn,
            ),
          DEMOGRAPHIC_DATA: () =>
            new AdminDemographicCsvFileIngestSource(
              String(entry.path),
              adminDemographicsTableName,
              {
                qeAdminDataTableName,
                screeningTableName,
              },
              govn,
            ),
        };
        if (csvFileName in csvExpected) {
          sources.push(csvExpected?.[csvFileName]());
        }
      } else {
        sources.push(
          new o.ErrorIngestSource(
            filePath,
            Error(
              `CSV file '${fileName}' not found in '${
                path.basename(
                  filePath,
                )
              }'`,
            ),
            "Unknown CSV File Type",
            govn,
          ),
        );
      }
      return sources;
    },
  };
}
