import { SQLa_orch_duckdb as ddbo } from "./deps.ts";

/**
 * CommonAssuranceRules class provides common assurance rules applicable for all classes.
 * It extends DuckDbOrchTableAssuranceRules for additional functionality.
 */
export class CommonAssuranceRules<
  TableName extends string,
  ColumnName extends string,
> extends ddbo.DuckDbOrchTableAssuranceRules<TableName, ColumnName> {
  // if there are any custom business logic rules put them here and if they can
  // be further generalized we can move them into the upstream SQLa library

  // any rules defined here will be available as car.rule() in the
  onlyAllowValidZipInAllRows(columnName: ColumnName) {
    return this.tableRules.patternValueInAllRows(
      columnName,
      "^\\d{5}(\\d{4})?$",
    );
  }

  onlyAllowAlphabetsAndNumbersInAllRows(columnName: ColumnName) {
    return this.tableRules.patternValueInAllRows(columnName, "^[a-zA-Z0-9]+$");
  }

  onlyAllowAlphabetsWithSpacesInAllRows(columnName: ColumnName) {
    return this.tableRules.patternValueInAllRows(columnName, "^[a-zA-Z\\s]+$");
  }

  onlyAllowAlphabetsAndNumbersWithSpaceInAllRows(columnName: ColumnName) {
    return this.tableRules.patternValueInAllRows(
      columnName,
      "^[a-zA-Z0-9\\s]+$",
    );
  }

  onlyAllowValidMedicaidCinFormatInAllRows(columnName: ColumnName) {
    return this.tableRules.patternValueInAllRows(
      columnName,
      "^[A-Za-z]{2}\\d{5}[A-Za-z]$",
    );
  }
}

/**
 * Represents assurance rules specific to screening data, extending from DuckDbOrchTableAssuranceRules.
 * Provides methods for enforcing screening-specific business logic.
 */
export class ScreeningAssuranceRules<
  TableName extends string,
  ColumnName extends string,
> extends ddbo.DuckDbOrchTableAssuranceRules<TableName, ColumnName> {
  readonly car: CommonAssuranceRules<TableName, ColumnName>;

  constructor(
    readonly tableName: TableName,
    readonly sessionID: string,
    readonly sessionEntryID: string,
    readonly govn: ddbo.DuckDbOrchGovernance,
  ) {
    super(tableName, sessionID, sessionEntryID, govn);
    this.car = new CommonAssuranceRules<TableName, ColumnName>(
      tableName,
      sessionID,
      sessionEntryID,
      govn,
    );
  }

  // if there are any screening-specific business logic rules put them here;
  onlyAllowValidScreeningQuestionsInAllRows(
    columnName: ColumnName,
    baseName: string,
  ) {
    const cteName = "valid_screening_questions_in_all_rows";
    // Construct the name of the question reference table based on the provided parameter 'baseName'
    const questionReferenceTable = baseName + "_question_reference";

    // Construct the SQL query using tagged template literals
    return this.govn.SQL`
      WITH ${cteName} AS (
          SELECT '${columnName}' AS issue_column,
                 sr."${columnName}" AS invalid_value,
                 sr.src_file_row_number AS issue_row
            FROM ${this.tableName} sr
            LEFT JOIN ${questionReferenceTable} qr
            ON sr.QUESTION_CODE = qr.QUESTION_CODE AND sr.SCREENING_CODE = qr.SCREENING_CODE
           WHERE sr.${columnName} IS NOT NULL
            AND qr.QUESTION_CODE IS NULL
      )
      ${
      this.insertRowValueIssueCtePartial(
        cteName,
        "Invalid Screening Question",
        "issue_row",
        "issue_column",
        "invalid_value",
        `'Invalid Screening Question "' || invalid_value || '" found in ' || issue_column`,
        `'Validate screening questions with question reference data'`,
      )
    }`;
  }

  onlyAllowValidEncounterClassSystemInAllRows(
    columnName: ColumnName,
  ) {
    const cteName = "valid_encounter_class_in_all_rows";
    const encounterClassReferenceTable = "encounter_class_reference";
    // Construct the SQL query using tagged template literals
    return this.govn.SQL`
      WITH ${cteName} AS (
          SELECT '${columnName}' AS issue_column,
                 sr."${columnName}" AS invalid_value,
                 sr.src_file_row_number AS issue_row
            FROM ${this.tableName} sr
            LEFT JOIN ${encounterClassReferenceTable} ecr
            ON sr.${columnName} = ecr.System
           WHERE sr.${columnName} IS NOT NULL
            AND ecr.System IS NULL
      )
      ${
      this.insertRowValueIssueCtePartial(
        cteName,
        `Invalid ENCOUNTER CLASS CODE SYSTEM`,
        "issue_row",
        "issue_column",
        "invalid_value",
        `'Invalid ENCOUNTER CLASS CODE SYSTEM "' || invalid_value || '" found in ' || issue_column`,
        `'Validate ENCOUNTER CLASS CODE SYSTEM with encounter class reference data'`,
      )
    }`;
  }

  onlyAllowValidEncounterClassDiscriptionInAllRows(
    columnName: ColumnName,
  ) {
    const cteName = "valid_encounter_class_in_all_rows";
    const encounterClassReferenceTable = "encounter_class_reference";
    // Construct the SQL query using tagged template literals
    return this.govn.SQL`
      WITH ${cteName} AS (
          SELECT '${columnName}' AS issue_column,
                 sr."${columnName}" AS invalid_value,
                 sr.src_file_row_number AS issue_row
            FROM ${this.tableName} sr
            LEFT JOIN ${encounterClassReferenceTable} ecr
            ON sr.${columnName} = ecr.Display
           WHERE sr.${columnName} IS NOT NULL
            AND ecr.Display IS NULL
      )
      ${
      this.insertRowValueIssueCtePartial(
        cteName,
        `Invalid ENCOUNTER CLASS CODE DESCRIPTION`,
        "issue_row",
        "issue_column",
        "invalid_value",
        `'Invalid ENCOUNTER CLASS CODE DESCRIPTION "' || invalid_value || '" found in ' || issue_column`,
        `'Validate ENCOUNTER CLASS CODE DESCRIPTION with encounter class reference data'`,
      )
    }`;
  }

  onlyAllowValidEncounterClassCodeInAllRows(
    columnName: ColumnName,
  ) {
    const cteName = "valid_encounter_class_in_all_rows";
    const encounterClassReferenceTable = "encounter_class_reference";
    // Construct the SQL query using tagged template literals
    return this.govn.SQL`
      WITH ${cteName} AS (
          SELECT '${columnName}' AS issue_column,
                 sr."${columnName}" AS invalid_value,
                 sr.src_file_row_number AS issue_row
            FROM ${this.tableName} sr
            LEFT JOIN ${encounterClassReferenceTable} ecr
            ON sr.${columnName} = ecr.Code
           WHERE sr.${columnName} IS NOT NULL
            AND ecr.Code IS NULL
      )
      ${
      this.insertRowValueIssueCtePartial(
        cteName,
        `Invalid ENCOUNTER CLASS CODE`,
        "issue_row",
        "issue_column",
        "invalid_value",
        `'Invalid ENCOUNTER CLASS CODE "' || invalid_value || '" found in ' || issue_column`,
        `'Validate ENCOUNTER CLASS CODE with encounter class reference data'`,
      )
    }`;
  }

  onlyAllowValidAnswerCodeForQuestionCodeInAllRows(
    columnName1: ColumnName,
    columnName2: ColumnName,
  ) {
    const cteName = "valid_answer_code_in_all_rows";
    const ahcCrossWalkReferenceTable = "ahc_cross_walk";

    // Construct the SQL query using tagged template literals
    return this.govn.SQL`
      WITH ${cteName} AS (
        SELECT '${columnName2}' AS issue_column,
          scr."${columnName2}" AS invalid_value,
          scr.src_file_row_number AS issue_row
          FROM ${this.tableName} scr
          LEFT OUTER JOIN ${ahcCrossWalkReferenceTable} crw
            ON scr.SCREENING_CODE = crw.SCREENING_CODE
            AND scr.${columnName1} = crw.${columnName1}
            AND scr.ANSWER_CODE = crw.ANSWER_CODE
          WHERE scr.SCREENING_CODE IS NOT NULL
            AND scr.${columnName1} IS NOT NULL
            AND scr.${columnName2} IS NOT NULL
            AND crw.${columnName2} IS NULL
      )

      ${
      this.insertRowValueIssueCtePartial(
        cteName,
        "Invalid Answer Code",
        "issue_row",
        "issue_column",
        "invalid_value",
        `'Invalid Answer Code "' || invalid_value || '" found in ' || issue_column`,
        `'Validate Answer Code with ahc cross walk reference data'`,
      )
    }`;
  }

  onlyAllowValidEncounterStatusCodeInAllRows(
    columnName: ColumnName,
  ) {
    const cteName = "valid_encounter_status_code_in_all_rows";
    const encounterStatusCodeReferenceTable = "encounter_status_code_reference";
    // Construct the SQL query using tagged template literals
    return this.govn.SQL`
      WITH ${cteName} AS (
          SELECT '${columnName}' AS issue_column,
                 sr."${columnName}" AS invalid_value,
                 sr.src_file_row_number AS issue_row
            FROM ${this.tableName} sr
            LEFT JOIN ${encounterStatusCodeReferenceTable} ecr
            ON sr.${columnName} = ecr.Code
           WHERE sr.${columnName} IS NOT NULL
            AND ecr.Code IS NULL
      )
      ${
      this.insertRowValueIssueCtePartial(
        cteName,
        `Invalid ENCOUNTER STATUS CODE`,
        "issue_row",
        "issue_column",
        "invalid_value",
        `'Invalid ENCOUNTER STATUS CODE "' || invalid_value || '" found in ' || issue_column`,
        `'Validate ENCOUNTER STATUS CODE with encounter status reference data'`,
      )
    }`;
  }

  onlyAllowValidEncounterStatusCodeDescriptionInAllRows(
    columnName: ColumnName,
  ) {
    const cteName = "valid_encounter_status_code_in_all_rows";
    const encounterStatusCodeReferenceTable = "encounter_status_code_reference";
    // Construct the SQL query using tagged template literals
    return this.govn.SQL`
      WITH ${cteName} AS (
          SELECT '${columnName}' AS issue_column,
                 sr."${columnName}" AS invalid_value,
                 sr.src_file_row_number AS issue_row
            FROM ${this.tableName} sr
            LEFT JOIN ${encounterStatusCodeReferenceTable} ecr
            ON sr.${columnName} = ecr.Display
           WHERE sr.${columnName} IS NOT NULL
            AND ecr.Display IS NULL
      )
      ${
      this.insertRowValueIssueCtePartial(
        cteName,
        `Invalid ENCOUNTER STATUS CODE DESCRIPTION`,
        "issue_row",
        "issue_column",
        "invalid_value",
        `'Invalid ENCOUNTER STATUS CODE DESCRIPTION "' || invalid_value || '" found in ' || issue_column`,
        `'Validate ENCOUNTER STATUS CODE DESCRIPTION with encounter status reference data'`,
      )
    }`;
  }

  onlyAllowValidEncounterTypeCodeInAllRows(
    columnName: ColumnName,
  ) {
    const cteName = "valid_encounter_type_code_in_all_rows";
    const encounterTypeCodeReferenceTable = "encounter_type_code_reference";

    // Construct the SQL query using tagged template literals
    return this.govn.SQL`
      WITH ${cteName} AS (
          SELECT '${columnName}' AS issue_column,
                 sr."${columnName}" AS invalid_value,
                 sr.src_file_row_number AS issue_row
            FROM ${this.tableName} sr
            LEFT JOIN ${encounterTypeCodeReferenceTable} ecr
            ON sr.${columnName} = ecr.Code
           WHERE sr.${columnName} IS NOT NULL
            AND ecr.Code IS NULL
      )
      ${
      this.insertRowValueIssueCtePartial(
        cteName,
        `Invalid ENCOUNTER TYPE CODE`,
        "issue_row",
        "issue_column",
        "invalid_value",
        `'Invalid ENCOUNTER TYPE CODE "' || invalid_value || '" found in ' || issue_column`,
        `'Validate ENCOUNTER TYPE CODE with encounter type reference data'`,
      )
    }`;
  }

  onlyAllowValidEncounterTypeDescriptionInAllRows(
    columnName: ColumnName,
  ) {
    const cteName = "valid_encounter_type_code_in_all_rows";
    const encounterTypeCodeReferenceTable = "encounter_type_code_reference";

    // Construct the SQL query using tagged template literals
    return this.govn.SQL`
      WITH ${cteName} AS (
          SELECT '${columnName}' AS issue_column,
                 sr."${columnName}" AS invalid_value,
                 sr.src_file_row_number AS issue_row
            FROM ${this.tableName} sr
            LEFT JOIN ${encounterTypeCodeReferenceTable} ecr
            ON sr.${columnName} = ecr.Display
           WHERE sr.${columnName} IS NOT NULL
            AND ecr.Display IS NULL
      )
      ${
      this.insertRowValueIssueCtePartial(
        cteName,
        `Invalid ENCOUNTER TYPE CODE DESCRIPTION`,
        "issue_row",
        "issue_column",
        "invalid_value",
        `'Invalid ENCOUNTER TYPE CODE DESCRIPTION "' || invalid_value || '" found in ' || issue_column`,
        `'Validate ENCOUNTER TYPE CODE DESCRIPTION with encounter type reference data'`,
      )
    }`;
  }

  onlyAllowValidScreeningStatusCodeInAllRows(
    columnName: ColumnName,
  ) {
    const cteName = "valid_screening_status_code_in_all_rows";
    const screeningStatusCodeReferenceTable = "screening_status_code_reference";

    // Construct the SQL query using tagged template literals
    return this.govn.SQL`
      WITH ${cteName} AS (
          SELECT '${columnName}' AS issue_column,
                 sr."${columnName}" AS invalid_value,
                 sr.src_file_row_number AS issue_row
            FROM ${this.tableName} sr
            LEFT JOIN ${screeningStatusCodeReferenceTable} ecr
            ON sr.${columnName} = ecr.Code
           WHERE sr.${columnName} IS NOT NULL
            AND ecr.Code IS NULL
      )
      ${
      this.insertRowValueIssueCtePartial(
        cteName,
        `Invalid SCREENING STATUS CODE`,
        "issue_row",
        "issue_column",
        "invalid_value",
        `'Invalid SCREENING STATUS CODE "' || invalid_value || '" found in ' || issue_column`,
        `'Validate SCREENING STATUS CODE with screening status code reference data'`,
      )
    }`;
  }

  onlyAllowValidScreeningStatusDescriptionInAllRows(
    columnName: ColumnName,
  ) {
    const cteName = "valid_screening_status_code_in_all_rows";
    const screeningStatusCodeReferenceTable = "screening_status_code_reference";

    // Construct the SQL query using tagged template literals
    return this.govn.SQL`
      WITH ${cteName} AS (
          SELECT '${columnName}' AS issue_column,
                 sr."${columnName}" AS invalid_value,
                 sr.src_file_row_number AS issue_row
            FROM ${this.tableName} sr
            LEFT JOIN ${screeningStatusCodeReferenceTable} ecr
            ON sr.${columnName} = ecr.Display
           WHERE sr.${columnName} IS NOT NULL
            AND ecr.Display IS NULL
      )
      ${
      this.insertRowValueIssueCtePartial(
        cteName,
        `Invalid SCREENING STATUS CODE`,
        "issue_row",
        "issue_column",
        "invalid_value",
        `'Invalid SCREENING STATUS CODE "' || invalid_value || '" found in ' || issue_column`,
        `'Validate SCREENING STATUS CODE with screening status code reference data'`,
      )
    }`;
  }

  onlyAllowValidRecordedTimeInAllRows(
    columnName: ColumnName,
  ) {
    // SELECT strptime('2023027  4:08:01 PM', '%Y%m%d %-I:%-M:%S %p')
    // Construct the SQL query using tagged template literals
    const cteName = "valid_date_time_in_all_rows";

    // deno-fmt-ignore
    return this.govn.SQL`
      WITH ${cteName} AS (
          SELECT '${columnName}' AS issue_column,
                 "${columnName}" AS invalid_value,
                 src_file_row_number AS issue_row
            FROM "${this.tableName}"
           WHERE "${columnName}" IS NOT NULL
             AND strptime("${columnName}", '%Y%m%d %-I:%-M:%S %p') IS NULL
      )
      ${this.insertRowValueIssueCtePartial(
        cteName,
        "Invalid Date",
        "issue_row",
        "issue_column",
        "invalid_value",
        `'Invalid timestamp "' || invalid_value || '" found in ' || issue_column`,
        `'Please be sure to provide both a valid date and time.'`,
      )}`;
  }
}

/**
 * AdminDemographicAssuranceRules class represents a set of assurance rules
 * specific to admin demographics, extending DuckDbOrchTableAssuranceRules.
 */
export class AdminDemographicAssuranceRules<
  TableName extends string,
  ColumnName extends string,
> extends ddbo.DuckDbOrchTableAssuranceRules<TableName, ColumnName> {
  readonly car: CommonAssuranceRules<TableName, ColumnName>;

  constructor(
    readonly tableName: TableName,
    readonly sessionID: string,
    readonly sessionEntryID: string,
    readonly govn: ddbo.DuckDbOrchGovernance,
  ) {
    super(tableName, sessionID, sessionEntryID, govn);
    this.car = new CommonAssuranceRules<TableName, ColumnName>(
      tableName,
      sessionID,
      sessionEntryID,
      govn,
    );
  }

  onlyAllowUniqueMedicaidCinPerMrnInAllRows(
    columnName: ColumnName,
  ) {
    const cteName = "valid_unique_medicaid_cin_per_mrn_in_all_rows";
    return this.govn.SQL`
    WITH ${cteName} AS (
      SELECT '${columnName}' AS issue_column,
              "${columnName}" AS invalid_value,
              min(src_file_row_number) AS issue_row
        FROM ${this.tableName}
        GROUP BY pat_mrn_id, MEDICAID_CIN
        HAVING COUNT(*) > 1
    )
    ${
      this.insertRowValueIssueCtePartial(
        cteName,
        "Invalid Unique Medicaid Cin Per Mrn",
        "issue_row",
        "issue_column",
        "invalid_value",
        `'Invalid Unique Medicaid Cin Per Mrn "' || invalid_value || '" found in ' || issue_column`,
        `'Validate Unique Medicaid Cin Per Mrn'`,
      )
    }`;
  }
  // if there are any admin-demographic-specific business logic rules put them here;
}

/**
 * QeAdminDataAssuranceRules class represents a set of assurance rules
 * specific to QE-Admin-Data, extending DuckDbOrchTableAssuranceRules.
 */
export class QeAdminDataAssuranceRules<
  TableName extends string,
  ColumnName extends string,
> extends ddbo.DuckDbOrchTableAssuranceRules<TableName, ColumnName> {
  readonly car: CommonAssuranceRules<TableName, ColumnName>;

  constructor(
    readonly tableName: TableName,
    readonly sessionID: string,
    readonly sessionEntryID: string,
    readonly govn: ddbo.DuckDbOrchGovernance,
  ) {
    super(tableName, sessionID, sessionEntryID, govn);
    this.car = new CommonAssuranceRules<TableName, ColumnName>(
      tableName,
      sessionID,
      sessionEntryID,
      govn,
    );
  }

  // if there are any admin-demographic-specific business logic rules put them here;
}

/**
 * QuestionReferenceAssuranceRules extends DuckDbOrchTableAssuranceRules
 * to provide assurance rules specific to question references.
 */
export class QuestionReferenceAssuranceRules<
  TableName extends string,
  ColumnName extends string,
> extends ddbo.DuckDbOrchTableAssuranceRules<TableName, ColumnName> {
  readonly car: CommonAssuranceRules<TableName, ColumnName>;

  constructor(
    readonly tableName: TableName,
    readonly sessionID: string,
    readonly sessionEntryID: string,
    readonly govn: ddbo.DuckDbOrchGovernance,
  ) {
    super(tableName, sessionID, sessionEntryID, govn);
    this.car = new CommonAssuranceRules<TableName, ColumnName>(
      tableName,
      sessionID,
      sessionEntryID,
      govn,
    );
  }

  // if there are any screening-specific business logic rules put them here;
  // if you want to use the rules from CommonAssuranceRules use car.X()
}

/**
 * AnswerReferenceAssuranceRules extends DuckDbOrchTableAssuranceRules
 * to provide assurance rules specific to answer references.
 */
export class AnswerReferenceAssuranceRules<
  TableName extends string,
  ColumnName extends string,
> extends ddbo.DuckDbOrchTableAssuranceRules<TableName, ColumnName> {
  readonly car: CommonAssuranceRules<TableName, ColumnName>;

  constructor(
    readonly tableName: TableName,
    readonly sessionID: string,
    readonly sessionEntryID: string,
    readonly govn: ddbo.DuckDbOrchGovernance,
  ) {
    super(tableName, sessionID, sessionEntryID, govn);
    this.car = new CommonAssuranceRules<TableName, ColumnName>(
      tableName,
      sessionID,
      sessionEntryID,
      govn,
    );
  }
  // if there are any screening-specific business logic rules put them here;
  // if you want to use the rules from CommonAssuranceRules use car.X()
}
