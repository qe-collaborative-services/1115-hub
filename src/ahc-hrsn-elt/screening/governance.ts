import { SQLa_orch_duckdb as ddbo } from "./deps.ts";

export class ScreeningAssuranceRules<TableName extends string>
  extends ddbo.DuckDbOrchTableAssuranceRules<TableName> {
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

  onlyAllowValidDateInAllRows(columnName: string) {
    const cteName = "valid_date_in_all_rows";
    return this.govn.SQL`
      WITH ${cteName} AS (
          SELECT '${columnName}' AS issue_column,
                 ${columnName} AS invalid_value,
                 src_file_row_number AS issue_row
            FROM ${this.tableName}
           WHERE ${columnName} IS NOT NULL
            AND TRY_CAST(${columnName} AS DATE) IS NULL
      )
      ${this.insertRowValueIssueCtePartial(
      cteName,
      "Invalid Date",
      "issue_row",
      "issue_column",
      "invalid_value",
      `'Invalid Date "' || invalid_value || '" found in ' || issue_column`,
      `'Convert non-date values to valid dates'`,
    )
      }`;
  }

  onlyAllowValidBirthDateInAllRows(columnName: string, maxAgeYear = 1915) {
    const cteName = "valid_birth_date_in_all_rows";
    return this.govn.SQL`
      WITH ${cteName} AS (
          SELECT '${columnName}' AS issue_column,
                 ${columnName} AS invalid_value,
                 src_file_row_number AS issue_row
          FROM ${this.tableName}
          WHERE ${columnName} IS NOT NULL
          AND TRY_CAST(${columnName} AS DATE) IS NOT NULL
          AND NOT (
            EXTRACT(YEAR FROM ${columnName}) >= ${maxAgeYear} 
            AND EXTRACT(YEAR FROM ${columnName}) <= EXTRACT(YEAR FROM CURRENT_DATE)
            AND EXTRACT(MONTH FROM ${columnName}) BETWEEN 1 AND 12
            AND (
               (EXTRACT(MONTH FROM ${columnName}) IN (1, 3, 5, 7, 8, 10, 12) AND EXTRACT(DAY FROM ${columnName}) BETWEEN 1 AND 31)
               OR (EXTRACT(MONTH FROM ${columnName}) IN (4, 6, 9, 11) AND EXTRACT(DAY FROM ${columnName}) BETWEEN 1 AND 30)
               OR (EXTRACT(MONTH FROM ${columnName}) = 2
                   AND (
                      (EXTRACT(YEAR FROM ${columnName}) % 4 = 0 AND EXTRACT(YEAR FROM ${columnName}) % 100 != 0)
                      OR EXTRACT(YEAR FROM ${columnName}) % 400 = 0
                   )
                   AND EXTRACT(DAY FROM ${columnName}) BETWEEN 1 AND 29
               )
               OR (EXTRACT(MONTH FROM ${columnName}) = 2 AND EXTRACT(DAY FROM ${columnName}) BETWEEN 1 AND 28)
            )
         )
      )
      ${this.insertRowValueIssueCtePartial(
      cteName,
      "Invalid Date",
      "issue_row",
      "issue_column",
      "invalid_value",
      `'Invalid Birth Date "' || invalid_value || '" found in ' || issue_column`,
      `'Is complete across all rows. · Date of Birth is numeric and follows YYYY-MM-DD. · YYYY is not before ${maxAgeYear}  or after current date. · MM is between 1 and 12. · DD is between 1 and 31 for MM- 01, 03, 05, 07, 08, 10, 12. · DD is between 1 and 30 for MM- 04, 06, 09, 11 · DD is between 1 and 27 for MM- 02 unless YYYY is 1916x every 4 years, DD is between 1 and 29.'`,
    )
      }`;
  }

  onlyAllowAlphabetsInAllRows(columnName: string) {
    return this.tableRules.patternValueInAllRows(columnName, "^[A-Za-z]+$");
  }

  onlyAllowAlphabetsAndNumbersInAllRows(columnName: string) {
    return this.tableRules.patternValueInAllRows(columnName, "^[0-9A-Za-z]+$");
  }

  onlyAllowValidTimeInAllRows(columnName: string, minYear = 2023) {
    const cteName = "valid_time_in_all_rows";
    return this.govn.SQL`
      WITH ${cteName} AS (
          SELECT '${columnName}' AS issue_column,
                 ${columnName} AS invalid_value,
                 src_file_row_number AS issue_row
          FROM ${this.tableName}
          WHERE ${columnName} IS NOT NULL
          AND TRY_CAST(${columnName} AS DATE) IS NOT NULL
          AND NOT (
            EXTRACT(year FROM ${columnName}) >=  ${minYear}
            AND EXTRACT(month FROM ${columnName}) BETWEEN 1 AND 12
            AND (
                (EXTRACT(month FROM ${columnName}) IN (01, 03, 05, 07, 08, 10, 12) AND EXTRACT(day FROM ${columnName}) BETWEEN 1 AND 31)
                OR
                (EXTRACT(month FROM ${columnName}) IN (04, 06, 09, 11) AND EXTRACT(day FROM ${columnName}) BETWEEN 1 AND 30)
                OR
                (EXTRACT(month FROM ${columnName}) = 02 AND (
                    (EXTRACT(year FROM ${columnName}) % 4 = 0 AND EXTRACT(day FROM ${columnName}) BETWEEN 1 AND 29)
                    OR
                    (EXTRACT(year FROM RECORDED_TIME) % 4 != 0 AND EXTRACT(day FROM ${columnName}) BETWEEN 1 AND 27)
                ))
            )
            AND EXTRACT(hour FROM ${columnName}) BETWEEN 0 AND 23
            AND EXTRACT(minute FROM ${columnName}) BETWEEN 0 AND 59
            AND EXTRACT(second FROM ${columnName}) BETWEEN 0 AND 59
        )
      )
      ${this.insertRowValueIssueCtePartial(
      cteName,
      "Invalid Date",
      "issue_row",
      "issue_column",
      "invalid_value",
      `'Invalid time "' || invalid_value || '" found in ' || issue_column`,
      `'Year must be greater than ${minYear} and · MM is between 1 and 12. · DD is between 1 and 31 for MM- 01, 03, 05, 07, 08, 10, 12. · DD is between 1 and 30 for MM- 04, 06, 09, 11 · DD is between 1 and 27 for MM- 02 unless YYYY is 2024x every 4 years, DD is between 1 and 29. · HH is between 1 and 24. · MM is between 1 and 59. · SS is between 1 and 59.'`,
    )
      }`;
  }
}
