import { SQLa_ingest_duckdb as ddbi } from "./deps.ts";

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
