import { fs, path, SQLa_orch as o, SQLa_orch_duckdb as ddbo } from "./deps.ts";
import * as sg from "./governance.ts";

const screeningCsvColumnNames = [
  "ANSWER_CODE_SYSTEM_NAME",
  "ANSWER_CODE",
  "ENCOUNTER_ID",
  "FACILITY",
  "FIRST_NAME",
  "LAST_NAME",
  "MEAS_VALUE",
  "MEDICAID_CIN",
  "NEED_INDICATED",
  "PAT_BIRTH_DATE",
  "PAT_MRN_ID",
  "QUESTION_CODE_SYSTEM_NAME",
  "QUESTION_CODE",
  "QUESTION",
  "RECORDED_TIME",
  "SDOH_DOMAIN",
  "SURVEY_ID",
  "SURVEY",
  "VISIT_OMH_FLAG",
  "VISIT_OPWDD_FLAG",
  "VISIT_PART_2_FLAG",
] as const;
type ScreeningCsvColumnName = typeof screeningCsvColumnNames[number];

export class ScreeningCsvStructureRules<TableName extends string>
  extends ddbo.DuckDbOrchTableAssuranceRules<
    TableName,
    ScreeningCsvColumnName
  > {
  requiredColumnNames() {
    return this.tableRules.requiredColumnNames([...screeningCsvColumnNames]);
  }
}

export class ScreeningCsvFileIngestSource<TableName extends string>
  implements
    o.CsvFileIngestSource<
      TableName,
      ddbo.DuckDbOrchGovernance,
      ddbo.DuckDbOrchEmitContext
    > {
  readonly nature = "CSV";
  constructor(
    readonly uri: string,
    readonly tableName: TableName,
    readonly govn: ddbo.DuckDbOrchGovernance,
  ) {}

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
      ddbo.DuckDbOrchEmitContext
    >["workflow"]
  > {
    const sessionDML = await session.orchSessionSqlDML();
    const ssr = new ScreeningCsvStructureRules(
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
    };
  }

  async ingestSQL(
    session: o.OrchSession<
      ddbo.DuckDbOrchGovernance,
      ddbo.DuckDbOrchEmitContext
    >,
    issac: o.IngestSourceStructAssuranceContext<ddbo.DuckDbOrchEmitContext>,
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
      ${await session.entryStateDML(sessionEntryID, "NONE", "ATTEMPT_CSV_INGEST", "ScreeningCsvFileIngestSource.ingestSQL", this.govn.emitCtx.sqlEngineNow)}

      -- be sure to add src_file_row_number and session_id columns to each row
      -- because assurance CTEs require them
      CREATE TABLE ${tableName} AS
        SELECT *, row_number() OVER () as src_file_row_number, '${sessionID}' as session_id, '${sessionEntryID}' as session_entry_id
          FROM read_csv_auto('${uri}');

      ${ssr.requiredColumnNames()}
      
      ${await session.entryStateDML( sessionEntryID, "ATTEMPT_CSV_INGEST", "INGESTED_CSV", "ScreeningCsvFileIngestSource.ingestSQL", this.govn.emitCtx.sqlEngineNow)}
    `;
  }

  async assuranceSQL(
    session: o.OrchSession<
      ddbo.DuckDbOrchGovernance,
      ddbo.DuckDbOrchEmitContext
    >,
    sar: sg.ScreeningAssuranceRules<TableName, ScreeningCsvColumnName>,
  ) {
    const { govn } = this;
    const { sessionEntryID } = sar;

    // deno-fmt-ignore
    return govn.SQL`
      ${await session.entryStateDML( sessionEntryID, "INGESTED_CSV", "ATTEMPT_CSV_ASSURANCE", "ScreeningCsvFileIngestSource.assuranceSQL", this.govn.emitCtx.sqlEngineNow)}

      ${sar.tableRules.mandatoryValueInAllRows("PAT_MRN_ID")}
      ${sar.tableRules.intValueInAllRows("PAT_MRN_ID")}      
      ${sar.tableRules.mandatoryValueInAllRows("FIRST_NAME")}
      ${sar.onlyAllowAlphabetsInAllRows("FIRST_NAME")}
      ${sar.tableRules.mandatoryValueInAllRows("LAST_NAME")}
      ${sar.onlyAllowAlphabetsInAllRows("LAST_NAME")}
      ${sar.tableRules.mandatoryValueInAllRows("PAT_BIRTH_DATE")}
      ${sar.onlyAllowValidBirthDateInAllRows("PAT_BIRTH_DATE")}
      ${sar.tableRules.mandatoryValueInAllRows("MEDICAID_CIN")}
      ${sar.tableRules.intValueInAllRows("MEDICAID_CIN")} 
      ${sar.tableRules.mandatoryValueInAllRows("ENCOUNTER_ID")}
      ${sar.tableRules.mandatoryValueInAllRows("RECORDED_TIME")} 
      ${sar.onlyAllowValidTimeInAllRows("RECORDED_TIME")}
      ${sar.tableRules.mandatoryValueInAllRows("QUESTION")}
      ${sar.tableRules.mandatoryValueInAllRows("MEAS_VALUE")} 
      ${sar.tableRules.mandatoryValueInAllRows("QUESTION_CODE")}
      ${sar.tableRules.onlyAllowedValuesInAllRows("QUESTION_CODE", "71802-3,96778-6")}
      ${sar.tableRules.mandatoryValueInAllRows("ANSWER_CODE")}
      ${sar.tableRules.mandatoryValueInAllRows("ANSWER_CODE_SYSTEM_NAME")}      
      ${sar.tableRules.mandatoryValueInAllRows("SDOH_DOMAIN")}
      ${sar.tableRules.mandatoryValueInAllRows("NEED_INDICATED")}
      ${sar.tableRules.onlyAllowedValuesInAllRows("NEED_INDICATED", "TRUE,FALSE")}
      ${sar.tableRules.mandatoryValueInAllRows("VISIT_PART_2_FLAG")}
      ${sar.tableRules.onlyAllowedValuesInAllRows("VISIT_PART_2_FLAG", "TRUE,FALSE")}
      ${sar.tableRules.mandatoryValueInAllRows("VISIT_OMH_FLAG")}
      ${sar.tableRules.onlyAllowedValuesInAllRows("VISIT_OMH_FLAG", "TRUE,FALSE")}
      ${sar.tableRules.mandatoryValueInAllRows("VISIT_OPWDD_FLAG")}
      ${sar.tableRules.onlyAllowedValuesInAllRows("VISIT_OPWDD_FLAG", "TRUE,FALSE")}

      ${await session.entryStateDML( sessionEntryID, "ATTEMPT_CSV_ASSURANCE", "ASSURED_CSV", "ScreeningCsvFileIngestSource.assuranceSQL", this.govn.emitCtx.sqlEngineNow)}
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
      ${await session.entryStateDML( sessionEntryID, "ASSURED_CSV", "ATTEMPT_CSV_EXPORT", "ScreeningCsvFileIngestSource.exportResourceSQL", this.govn.emitCtx.sqlEngineNow)}

      CREATE TABLE ${targetSchema}.${tableName} AS SELECT * FROM ${tableName};

      CREATE VIEW ${targetSchema}.${tableName}_fhir AS 
        SELECT pat_mrn_id, json_object(
              'resourceType', 'Observation',
              'id', ENCOUNTER_ID,
              'status', 'final',
              'code', json_object(
                  'coding', json_array(
                      json_object(
                          'system', QUESTION_CODE_SYSTEM_NAME,
                          'code', QUESTION_CODE,
                          'display', QUESTION
                      )
                  )
              ),
              'subject', json_object(
                  'reference', 'Patient/' || PAT_MRN_ID
              ),
              'effectiveDateTime', RECORDED_TIME,
              'valueString', MEAS_VALUE,
              'performer', json_array(
                  json_object(
                      'reference', 'Practitioner/' || session_id
                  )
              ),
              'context', json_object(
                  'reference', 'Encounter/' || ENCOUNTER_ID
              )
          ) AS FHIR_Observation
        FROM ${tableName};
        
        ${await session.entryStateDML( sessionEntryID, "ATTEMPT_CSV_EXPORT", "CSV_EXPORTED", "ScreeningCsvFileIngestSource.exportResourceSQL", this.govn.emitCtx.sqlEngineNow)}
        `;
  }
}

export function ingestCsvFilesSourcesSupplier(
  govn: ddbo.DuckDbOrchGovernance,
): o.IngestFsPatternSourcesSupplier<ScreeningCsvFileIngestSource<string>> {
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
