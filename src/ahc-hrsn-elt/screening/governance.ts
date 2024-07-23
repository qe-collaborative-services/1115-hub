import { SQLa_orch_duckdb as ddbo } from "./deps.ts";

const escapedSqlLiteral = (literal: string) => literal.replaceAll("'", "''");

export class GroupCsvStructureRules<
  TableName extends string,
  ColumnName extends string,
> extends ddbo.DuckDbOrchTableAssuranceRules<TableName, ColumnName> {
  checkAllTablesAreIngestedInAGroup(groupName: string, tableName: string) {
    return this.govn.SQL`
      WITH check_all_tables_are_ingested_in_a_group AS (
        WITH required_tables AS (
            SELECT '${this.govn.toSnakeCase("screening" + groupName)}'
              AS table_name,
              'SCREENING' AS table_name_suffix
            UNION ALL
            SELECT '${this.govn.toSnakeCase("admin_demographics" + groupName)}'
              AS table_name,
              'DEMOGRAPHIC_DATA' AS table_name_suffix
            UNION ALL
            SELECT '${this.govn.toSnakeCase("qe_admin_data" + groupName)}'
              AS table_name,
              'QE_ADMIN_DATA' AS table_name_suffix
        )
        SELECT rt.table_name as table_name, rt.table_name_suffix as table_name_suffix
        FROM required_tables rt
        LEFT JOIN ${this.tableName} ist ON rt.table_name = ist.table_name
        WHERE
          '${tableName}' IN (
            '${this.govn.toSnakeCase("screening" + groupName)}',
            '${this.govn.toSnakeCase("admin_demographics" + groupName)}',
            '${this.govn.toSnakeCase("qe_admin_data" + groupName)}'
            )
        AND ist.table_name IS NULL
      )
      ${
      this.insertRowValueIssueCtePartial(
        "check_all_tables_are_ingested_in_a_group",
        `CSV File Missing`,
        `NULL`,
        `NULL`,
        "table_name",
        `'CSV file ' || table_name_suffix || '${groupName} not found under the group (${groupName})'`,
        `'Please make sure there are 3 files within the group ${groupName}'`,
      )
    }
    `;
  }
}
/**
 * CommonAssuranceRules class provides common assurance rules applicable for all classes.
 * It extends DuckDbOrchTableAssuranceRules for additional functionality.
 */
export class CommonAssuranceRules<
  TableName extends string,
  ColumnName extends string,
> extends ddbo.DuckDbOrchTableAssuranceRules<TableName, ColumnName> {
  // if there are any custom business logic rules put them here and if they can
  // be further geenralized we can move them into the upstream SQLa library
  matchPatternWithRemediation(
    columnName: ColumnName,
    pattern: string,
    remediation: string,
  ) {
    const cteName = "pattern";
    const escapedHumanMsgFragment = escapedSqlLiteral(pattern);
    const patternSql =
      `CAST("${columnName}" AS VARCHAR) NOT SIMILAR TO '${pattern}'`;
    return this.govn.SQL`
      WITH ${cteName} AS (
          SELECT '${columnName}' AS issue_column,
                 "${columnName}" AS invalid_value,
                 src_file_row_number AS issue_row
            FROM "${this.tableName}"
           WHERE ${patternSql}
      )
      ${
      this.insertRowValueIssueCtePartial(
        cteName,
        "Pattern Mismatch",
        "issue_row",
        "issue_column",
        "invalid_value",
        `'Value ' || invalid_value || ' in ' || issue_column || ' does not match the pattern ${escapedHumanMsgFragment}'`,
        `'${remediation}'`,
      )
    }`;
  }

  onlyAllowAlphabetsInAllRows(columnName: ColumnName) {
    return this.matchPatternWithRemediation(
      columnName,
      "^[A-Za-z]+$",
      columnName + "should be alphabetical",
    );
  }

  // any rules defined here will be available as car.rule() in the
  onlyAllowValidZipInAllRows(columnName: ColumnName) {
    return this.matchPatternWithRemediation(
      columnName,
      "^\\d{5}(\\d{4})?$",
      "Zip code should be having 5 or 9 digits which are all numbers",
    );
  }

  onlyAllowAlphabetsAndNumbersInAllRows(columnName: ColumnName) {
    return this.matchPatternWithRemediation(
      columnName,
      "^[a-zA-Z0-9]+$",
      columnName + " should contain only alphabets and numbers",
    );
  }

  onlyAllowAlphabetsWithSpacesInAllRows(columnName: ColumnName) {
    return this.matchPatternWithRemediation(
      columnName,
      "^[a-zA-Z\\s]+$",
      columnName + " should contain only alphabets with spaces",
    );
  }

  onlyAllowAlphabetsAndNumbersWithSpaceInAllRows(columnName: ColumnName) {
    return this.matchPatternWithRemediation(
      columnName,
      "^[a-zA-Z0-9\\s]+$",
      columnName + " should contain only alphabets and numbers with spaces",
    );
  }

  onlyAllowValidMedicaidCinFormatInAllRows(columnName: ColumnName) {
    return this.matchPatternWithRemediation(
      columnName,
      "^[A-Za-z]{2}\\d{5}[A-Za-z]$",
      columnName + " should follow the format 2 letters, 5 numbers, 1 letter",
    );
  }

  onlyAllowValidIntegerAlphaNumericStringInAllRows(
    columnName: ColumnName,
  ) {
    const cteName = "valid_integer_alphanumeric_string_in_all_rows";

    // Construct the SQL query using tagged template literals
    return this.govn.SQL`
      WITH ${cteName} AS (
        SELECT '${columnName}' AS issue_column,
          t."${columnName}" AS invalid_value,
          t.src_file_row_number AS issue_row
        FROM ${this.tableName} t
        WHERE t."${columnName}" SIMILAR TO '[0-9]+'
      )
      ${
      this.insertRowValueIssueCtePartial(
        cteName,
        `Data Type Mismatch`,
        "issue_row",
        "issue_column",
        "invalid_value",
        `'Invalid value "' || invalid_value || '" found in ' || issue_column`,
        `'Make sure the column ' || issue_column || 'has not only numbers.'`,
      )
    }`;
  }

  onlyAllowValidFieldCombinationsInAllRows(
    columnName1: ColumnName,
    columnName2: ColumnName,
  ) {
    const cteName = "valid_field_combination_in_all_rows";
    const columnReference = {
      "ENCOUNTER_CLASS_CODE": {
        referenceTableName: "encounter_class_reference",
        referenceFieldName: "Code",
      },
      "ENCOUNTER_CLASS_CODE_DESCRIPTION": {
        referenceTableName: "encounter_class_reference",
        referenceFieldName: "Display",
      },
      "ENCOUNTER_STATUS_CODE": {
        referenceTableName: "encounter_status_code_reference",
        referenceFieldName: "Code",
      },
      "ENCOUNTER_STATUS_CODE_DESCRIPTION": {
        referenceTableName: "encounter_status_code_reference",
        referenceFieldName: "Display",
      },
      "ENCOUNTER_TYPE_CODE": {
        referenceTableName: "encounter_type_code_reference",
        referenceFieldName: "Code",
      },
      "ENCOUNTER_TYPE_CODE_DESCRIPTION": {
        referenceTableName: "encounter_type_code_reference",
        referenceFieldName: "Display",
      },
      "SCREENING_CODE": {
        referenceTableName: "ahc_cross_walk",
        referenceFieldName: "SCREENING_CODE",
      },
      "SCREENING_CODE_DESCRIPTION": {
        referenceTableName: "ahc_cross_walk",
        referenceFieldName: "SCREENING_CODE_DESCRIPTION",
      },
      "QUESTION_CODE": {
        referenceTableName: "ahc_cross_walk",
        referenceFieldName: "QUESTION_CODE",
      },
      "QUESTION_CODE_DESCRIPTION": {
        referenceTableName: "ahc_cross_walk",
        referenceFieldName: "QUESTION",
      },

      "ANSWER_CODE": {
        referenceTableName: "ahc_cross_walk",
        referenceFieldName: "ANSWER_CODE",
      },
      "ANSWER_CODE_DESCRIPTION": {
        referenceTableName: "ahc_cross_walk",
        referenceFieldName: "ANSWER_VALUE",
      },
      "SCREENING_STATUS_CODE": {
        referenceTableName: "screening_status_code_reference",
        referenceFieldName: "Code",
      },
      "SCREENING_STATUS_CODE_DESCRIPTION": {
        referenceTableName: "screening_status_code_reference",
        referenceFieldName: "Display",
      },
      "ADMINISTRATIVE_SEX_CODE": {
        referenceTableName: "administrative_sex_reference",
        referenceFieldName: "ADMINISTRATIVE_SEX_CODE",
      },
      "ADMINISTRATIVE_SEX_CODE_DESCRIPTION": {
        referenceTableName: "administrative_sex_reference",
        referenceFieldName: "ADMINISTRATIVE_SEX_CODE_DESCRIPTION",
      },
      "SEX_AT_BIRTH_CODE": {
        referenceTableName: "sex_at_birth_reference",
        referenceFieldName: "SEX_AT_BIRTH_CODE",
      },
      "SEX_AT_BIRTH_CODE_DESCRIPTION": {
        referenceTableName: "sex_at_birth_reference",
        referenceFieldName: "SEX_AT_BIRTH_CODE_DESCRIPTION",
      },
      "SEXUAL_ORIENTATION_CODE": {
        referenceTableName: "sexual_orientation_reference",
        referenceFieldName: "SEXUAL_ORIENTATION_CODE",
      },
      "SEXUAL_ORIENTATION_CODE_DESCRIPTION": {
        referenceTableName: "sexual_orientation_reference",
        referenceFieldName: "SEXUAL_ORIENTATION_CODE_DESCRIPTION",
      },
      "RACE_CODE": {
        referenceTableName: "race_reference",
        referenceFieldName: "Concept Code",
      },
      "RACE_CODE_DESCRIPTION": {
        referenceTableName: "race_reference",
        referenceFieldName: "Concept Name",
      },
      "ETHNICITY_CODE": {
        referenceTableName: "ethnicity_reference",
        referenceFieldName: "Concept Code",
      },
      "ETHNICITY_CODE_DESCRIPTION": {
        referenceTableName: "ethnicity_reference",
        referenceFieldName: "Concept Name",
      },
      "GENDER_IDENTITY_CODE": {
        referenceTableName: "gender_identity_reference",
        referenceFieldName: "GENDER_IDENTITY_CODE",
      },
      "GENDER_IDENTITY_CODE_DESCRIPTION": {
        referenceTableName: "gender_identity_reference",
        referenceFieldName: "GENDER_IDENTITY_CODE_DESCRIPTION",
      },
      "PREFERRED_LANGUAGE_CODE": {
        referenceTableName: "preferred_language_reference",
        referenceFieldName: "ISO 639-2 Code",
      },
      "PREFERRED_LANGUAGE_CODE_DESCRIPTION": {
        referenceTableName: "preferred_language_reference",
        referenceFieldName: "English name of Language",
      },
    };
    // Construct the SQL query using tagged template literals
    return this.govn.SQL`
      WITH ${cteName} AS (
        SELECT 	'${columnName1}' AS issue_column,
            tbl."${columnName1}" AS invalid_value,
            tbl."${columnName2}" AS dependent_value,
            tbl.src_file_row_number AS issue_row
        FROM ${this.tableName}  tbl
        WHERE tbl."${columnName1}" is not null
        and tbl."${columnName2}" is not null
        and NOT EXISTS ( SELECT "${
      columnReference[columnName2 as keyof typeof columnReference]
        .referenceFieldName
    }" FROM ${
      columnReference[columnName1 as keyof typeof columnReference]
        .referenceTableName
    } WHERE UPPER(CAST(tbl."${columnName2}" AS VARCHAR)) = UPPER(CAST("${
      columnReference[columnName2 as keyof typeof columnReference]
        .referenceFieldName
    }" AS VARCHAR)) AND UPPER(CAST(tbl."${columnName1}" AS VARCHAR)) = UPPER(CAST("${
      columnReference[columnName1 as keyof typeof columnReference]
        .referenceFieldName
    }" AS VARCHAR)))
      )
      ${
      this.insertRowValueIssueCtePartial(
        cteName,
        `Combination Not Matching`,
        "issue_row",
        "issue_column",
        "invalid_value",
        `'Invalid value "' || invalid_value || '" found in ' || issue_column`,
        `'The ${columnName1} "' || invalid_value || '" of ${columnName2} "' || dependent_value || '" is not matching with the ${columnName1} of ${columnName2} in reference data'`,
      )
    }`;
  }
}

/**
 * Represents assurance rules specific to screening data, extending from DuckDbOrchTableAssuranceRules.
 * Provides methods for enforcing screening-specific business logic.
 */

export class AhcCrossWalkAssuranceRules<
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
}

export class PreferredLanguageReferenceAssuranceRules<
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
}

export class SdohDomainReferenceAssuranceRules<
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
}

export class EncounterClassReferenceAssuranceRules<
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
}

export class EncounterStatusCodeReferenceAssuranceRules<
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
}

export class EncounterTypeCodeReferenceAssuranceRules<
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
}

export class ScreeningStatusCodeReferenceAssuranceRules<
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
}

export class AdministrativeSexReferenceAssuranceRules<
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
}

export class GenderIdentityReferenceAssuranceRules<
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
}

export class SexAtBirthReferenceAssuranceRules<
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
}

export class SexualOrientationReferenceAssuranceRules<
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
}

export class BusinessRulesReferenceAssuranceRules<
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
}

export class RaceReferenceAssuranceRules<
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
}

export class EthnicityReferenceAssuranceRules<
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
}

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
            ON UPPER(sr.${columnName}) = UPPER(ecr.System)
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
            ON UPPER(sr.${columnName}) = UPPER(ecr.Display)
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
            ON UPPER(sr.${columnName}) = UPPER(ecr.Code)
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
          scr."${columnName1}" AS invalid_question_value,
          scr.SCREENING_CODE AS invalid_screening_value,
          scr.src_file_row_number AS issue_row
          FROM ${this.tableName} scr
          LEFT OUTER JOIN ${ahcCrossWalkReferenceTable} crw
            ON UPPER(scr.SCREENING_CODE) = UPPER(crw.SCREENING_CODE)
            AND UPPER(scr.${columnName1}) = UPPER(crw.${columnName1})
            AND UPPER(scr.${columnName2}) = UPPER(crw.${columnName2})
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
        `'Provided Screening Code "' || invalid_screening_value || '", Question Code "' || invalid_question_value || '" and Answer Code "' || invalid_value || '" are not matching with the reference data found in ' || issue_column`,
        `'Validate Screening Code, Question Code and Answer Code with ahc cross walk reference data'`,
      )
    }`;
  }

  onlyAllowValidTotalSafetyScoreInAllRows() {
    const cteName = "valid_total_safety_score_in_all_rows";
    const ahcCrossWalkReferenceTable = "ahc_cross_walk";
    // Construct the SQL query using tagged template literals
    return this.govn.SQL`
      WITH ${cteName} AS (
        WITH cte_score AS (
          SELECT
              SUM(crw.Score) AS cross_walk_Score,
              SUM(
                  CASE
                      WHEN UPPER(TRIM(scr.QUESTION_CODE_DESCRIPTION)) LIKE '%TOTAL SAFETY SCORE%' AND TRY_CAST(scr.ANSWER_CODE_DESCRIPTION AS INTEGER) IS NOT NULL THEN CAST(scr.ANSWER_CODE_DESCRIPTION AS INTEGER)
                      ELSE 0
                  END
              ) AS screening_score
          FROM
              ${this.tableName} scr
          LEFT OUTER JOIN (
              SELECT 	acw.SCREENING_CODE,
                    acw.QUESTION_CODE,
                    acw.ANSWER_CODE,
                    acw.QUESTION_SLNO,
                    acw.Score AS Score
              FROM ${ahcCrossWalkReferenceTable} acw
              Where QUESTION_SLNO_REFERENCE In(
              SELECT QUESTION_SLNO
                  FROM ${ahcCrossWalkReferenceTable}
                  WHERE UPPER(TRIM(QUESTION)) LIKE '%TOTAL SAFETY SCORE%'
                  )
              AND acw.QUESTION_CODE = scr.QUESTION_CODE
              AND acw.ANSWER_CODE = scr.ANSWER_CODE
          ) AS crw ON crw.SCREENING_CODE = scr.SCREENING_CODE
      )
      SELECT 	cross_walk_Score,
          screening_score AS invalid_value,
          (SELECT src_file_row_number FROM ${this.tableName} WHERE UPPER(TRIM(QUESTION_CODE_DESCRIPTION)) LIKE '%TOTAL SAFETY SCORE%') AS issue_row,
        'ANSWER_CODE_DESCRIPTION' AS issue_column
      FROM cte_score
      WHERE screening_score <> cross_walk_Score
      )
      ${
      this.insertRowValueIssueCtePartial(
        cteName,
        `Invalid ANSWER_CODE_DESCRIPTION`,
        "issue_row",
        "issue_column",
        "invalid_value",
        `'Invalid ANSWER_CODE_DESCRIPTION for TOTAL SAFETY SCORE "' || invalid_value || '" found in ' || issue_column`,
        `'Validate ANSWER_CODE_DESCRIPTION for TOTAL SAFETY SCORE (Calculated Score)'`,
      )
    }`;
  }

  onlyAllowValidCalculatedMentalHealthScoreInAllRows() {
    const cteName = "valid_calculated_mental_health_score_in_all_rows";
    const ahcCrossWalkReferenceTable = "ahc_cross_walk";
    // Construct the SQL query using tagged template literals
    return this.govn.SQL`
      WITH ${cteName} AS (
        SELECT ANSWER_CODE_DESCRIPTION AS issue_column,
        SCREENING_CALCULATED_SCORE AS invalid_value,
        SRC_FILE_ROW_NUMBER AS issue_row
        FROM
        (
        SELECT Sum(crw.score) As CROSSWALK_ANSWER_SCORE,
            (SELECT CASE WHEN TRY_CAST(ANSWER_CODE_DESCRIPTION AS INTEGER) IS NOT NULL THEN CAST(ANSWER_CODE_DESCRIPTION AS INTEGER) ELSE 0 END AS SCREENING_CALC_SCORE
              FROM ${this.tableName} scr2
              WHERE UPPER(scr2.QUESTION_CODE_DESCRIPTION) LIKE '%CALCULATED MENTAL HEALTH SCORE%'
          ) AS SCREENING_CALCULATED_SCORE,
          (SELECT src_file_row_number FROM ${this.tableName} WHERE UPPER(QUESTION_CODE_DESCRIPTION) LIKE '%CALCULATED MENTAL HEALTH SCORE%') AS SRC_FILE_ROW_NUMBER,
          'ANSWER_CODE_DESCRIPTION' AS ANSWER_CODE_DESCRIPTION
            FROM ${this.tableName} scr
            INNER JOIN (
                SELECT 	acw.score As SCORE
                FROM ${ahcCrossWalkReferenceTable} acw
                Where QUESTION_SLNO_REFERENCE In(
                SELECT QUESTION_SLNO
                    FROM ${ahcCrossWalkReferenceTable}
                    WHERE UPPER(QUESTION) LIKE '%CALCULATED MENTAL HEALTH SCORE%'
                    )
                AND acw.QUESTION_CODE = scr.QUESTION_CODE
                AND acw.ANSWER_CODE  = scr.ANSWER_CODE
            ) AS crw ON 1 = 1
        ) As calc_fld_val
        Where calc_fld_val.CROSSWALK_ANSWER_SCORE <> calc_fld_val.SCREENING_CALCULATED_SCORE
      )
      ${
      this.insertRowValueIssueCtePartial(
        cteName,
        `Invalid ANSWER_CODE_DESCRIPTION`,
        "issue_row",
        "issue_column",
        "invalid_value",
        `'Invalid ANSWER_CODE_DESCRIPTION for CALCULATED MENTAL HEALTH SCORE "' || invalid_value || '" found in ' || issue_column`,
        `'Validate ANSWER_CODE_DESCRIPTION for CALCULATED MENTAL HEALTH SCORE (Calculated Score)'`,
      )
    }`;
  }

  onlyAllowValidCalculatedWeeklyPhysicalActivityScoreInAllRows() {
    const cteName =
      "valid_calculated_weekly_physical_activity_score_in_all_rows";
    const ahcCrossWalkReferenceTable = "ahc_cross_walk";
    // Construct the SQL query using tagged template literals
    return this.govn.SQL`
      WITH ${cteName} AS (
        WITH cte_physical_activity AS (
          SELECT
            scr.SCREENING_CODE,
            scr.QUESTION_CODE,
            scr.ANSWER_CODE,
            crw.ANSWER_VALUE,
            scr.ANSWER_CODE_DESCRIPTION,
            ROW_NUMBER() OVER (
            ORDER BY scr.SCREENING_CODE) AS sequence_number
          FROM
            ${this.tableName} scr
          INNER JOIN (
            SELECT
              acw.SCREENING_CODE,
              acw.QUESTION_CODE,
              acw.ANSWER_CODE,
              acw.QUESTION_SLNO,
              CASE
                WHEN TRY_CAST(acw.ANSWER_VALUE AS INTEGER) IS NOT NULL THEN CAST(acw.ANSWER_VALUE AS INTEGER)
                ELSE CASE WHEN acw.ANSWER_CODE='LA32060-8' THEN 150 ELSE 0 END
              END AS ANSWER_VALUE
            FROM
              ${ahcCrossWalkReferenceTable} acw
            Where
              QUESTION_SLNO_REFERENCE In(
              SELECT
                QUESTION_SLNO
              FROM
                ${ahcCrossWalkReferenceTable}
              WHERE
                UPPER(QUESTION) LIKE '%CALCULATED PHYSICAL ACTIVITY SCORE%'
                      )
              AND acw.QUESTION_CODE = scr.QUESTION_CODE
              AND acw.ANSWER_CODE = scr.ANSWER_CODE
              ) AS crw ON
            crw.SCREENING_CODE = scr.SCREENING_CODE
          )
          Select 	ANSWER_CODE_DESCRIPTION AS issue_column,
              CROSSWALK_ANSWER_VALUE AS CROSSWALK_ANSWER_VALUE,
              SCREENING_CALCULATED_VALUE AS invalid_value,
              SRC_FILE_ROW_NUMBER AS issue_row
          FROM
            (
            Select
              t1.ANSWER_VALUE * t2.ANSWER_VALUE As CROSSWALK_ANSWER_VALUE,
              CASE
                WHEN TRY_CAST(t1.ANSWER_CODE_DESCRIPTION AS INTEGER) IS NOT NULL
                  AND TRY_CAST(t2.ANSWER_CODE_DESCRIPTION AS INTEGER) IS NOT NULL THEN
              CAST(t1.ANSWER_CODE_DESCRIPTION AS INTEGER) * CAST(t2.ANSWER_CODE_DESCRIPTION AS INTEGER)
                ELSE CASE WHEN t2.ANSWER_CODE='LA32060-8' THEN 150 * CAST(t1.ANSWER_CODE_DESCRIPTION AS INTEGER) ELSE 0 END
                END AS SCREENING_ANSWER_VALUE,
                Scrn_Phycical_Act_Score.SCRN_PHYSICAL_ACTIVITY_VALUE AS SCREENING_CALCULATED_VALUE,
                (SELECT src_file_row_number FROM ${this.tableName} WHERE UPPER(QUESTION_CODE_DESCRIPTION) LIKE '%CALCULATED PHYSICAL ACTIVITY SCORE%') AS SRC_FILE_ROW_NUMBER,
                'ANSWER_CODE_DESCRIPTION' AS ANSWER_CODE_DESCRIPTION

              from
                cte_physical_activity t1
              Inner Join cte_physical_activity t2
          On
                t1.sequence_number = 1
                and t2.sequence_number = 2
              Left Outer Join (
                Select
                  CASE
                    WHEN TRY_CAST(ANSWER_CODE_DESCRIPTION AS INTEGER) IS NOT NULL THEN CAST(ANSWER_CODE_DESCRIPTION AS INTEGER)
                    ELSE 0
                  END SCRN_PHYSICAL_ACTIVITY_VALUE
                From
                ${this.tableName} scr
                Where
                  UPPER(scr.QUESTION_CODE_DESCRIPTION) LIKE '%CALCULATED PHYSICAL ACTIVITY SCORE%') AS Scrn_Phycical_Act_Score
                      On
                1 = 1
          ) As calc_fld
          Where
            (calc_fld.CROSSWALK_ANSWER_VALUE <> calc_fld.SCREENING_ANSWER_VALUE)
            OR (calc_fld.SCREENING_ANSWER_VALUE <> calc_fld.SCREENING_CALCULATED_VALUE)
            OR (calc_fld.CROSSWALK_ANSWER_VALUE <> calc_fld.SCREENING_CALCULATED_VALUE)
      )
      ${
      this.insertRowValueIssueCtePartial(
        cteName,
        `Invalid ANSWER_CODE_DESCRIPTION`,
        "issue_row",
        "issue_column",
        "invalid_value",
        `'Invalid ANSWER_CODE_DESCRIPTION for CALCULATED PHYSICAL ACTIVITY SCORE "' || invalid_value || '" found in ' || issue_column`,
        `'Validate ANSWER_CODE_DESCRIPTION for CALCULATED PHYSICAL ACTIVITY SCORE (Calculated Score)'`,
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
            ON UPPER(sr.${columnName}) = UPPER(ecr.Code)
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
            ON UPPER(sr.${columnName}) = UPPER(ecr.Display)
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
            ON UPPER(CAST(sr.${columnName} AS VARCHAR)) = UPPER(CAST(ecr.Code AS VARCHAR))
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
            ON UPPER(CAST(sr.${columnName} AS VARCHAR)) = UPPER(CAST(ecr.Display AS VARCHAR))
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

  onlyAllowValidEncounterTypeSystemInAllRows(
    columnName: ColumnName,
  ) {
    const cteName = "valid_encounter_type_code_system_in_all_rows";
    const encounterTypeCodeReferenceTable = "encounter_type_code_reference";

    // Construct the SQL query using tagged template literals
    return this.govn.SQL`
      WITH ${cteName} AS (
          SELECT '${columnName}' AS issue_column,
                 sr."${columnName}" AS invalid_value,
                 sr.src_file_row_number AS issue_row
            FROM ${this.tableName} sr
            LEFT JOIN ${encounterTypeCodeReferenceTable} ecr
            ON UPPER(sr.${columnName}) = UPPER(ecr.System)
           WHERE sr.${columnName} IS NOT NULL
            AND ecr.System IS NULL
      )
      ${
      this.insertRowValueIssueCtePartial(
        cteName,
        `Invalid ENCOUNTER TYPE CODE SYSTEM`,
        "issue_row",
        "issue_column",
        "invalid_value",
        `'Invalid ENCOUNTER TYPE CODE SYSTEM "' || invalid_value || '" found in ' || issue_column`,
        `'Validate ENCOUNTER TYPE CODE SYSTEM with encounter type reference data'`,
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
            LEFT JOIN ${screeningStatusCodeReferenceTable} ref
            ON UPPER(sr.${columnName}) = UPPER(ref.Code)
           WHERE sr.${columnName} IS NOT NULL
            AND ref.Code IS NULL
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
            ON UPPER(sr.${columnName}) = UPPER(ecr.Display)
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
    // Construct the SQL query using tagged template literals
    const cteName = "valid_date_time_in_all_rows";

    // deno-fmt-ignore
    return this.govn.SQL`
      WITH ${cteName} AS (
              SELECT  '${columnName}' AS issue_column,
                    "${columnName}" AS invalid_value,
                    src_file_row_number AS issue_row
              FROM "${this.tableName}"
              WHERE "${columnName}" IS NOT NULL
              AND "${columnName}" NOT SIMILAR TO '([0-9]([0-9]([0-9][1-9]|[1-9]0)|[1-9]00)|[1-9]000)-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])T([01][0-9]|2[0-3]):[0-5][0-9]:([0-5][0-9]|60)(\\.[0-9]+)?(Z|(\\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00))$'
              OR TRY_CAST("${columnName}" AS TIMESTAMP) IS NULL
        )
      ${this.insertRowValueIssueCtePartial(
        cteName,
        "Invalid Date",
        "issue_row",
        "issue_column",
        "invalid_value",
        `'Invalid timestamp "' || invalid_value || '" found in ' || issue_column`,
        `'Please follow the format YYYY-MM-DDTHH:MM:SS.000Z.'`,
      )}`;
  }

  matchesPatMrnIdAcrossScreeningQeAdminDemographics(
    patMrnIdcolumnName: ColumnName,
    facilityIdcolumnName: ColumnName,
    relatedTableNames: {
      adminDemographicsTableName: string;
      qeAdminDataTableName: string;
    },
  ) {
    const cteName = "valid_pat_mrn_id_across_all_three_tables";
    // Construct the SQL query using tagged template literals
    return this.govn.SQL`
      WITH ${cteName} AS (
        WITH cte_qe_demographic_unmatched AS (
            SELECT DISTINCT COALESCE(ad.PAT_MRN_ID, qe.PAT_MRN_ID) AS PAT_MRN_ID,
                    COALESCE(ad.FACILITY_ID, qe.FACILITY_ID) AS FACILITY_ID,
                          CASE
                              WHEN ad.PAT_MRN_ID IS NULL THEN 'QE_ADMIN_DATA'
                              ELSE 'ADMIN_DEMOGRAPHIC'
                          END AS unmatched_source,
                          COALESCE(ad.src_file_row_number, qe.src_file_row_number) AS src_file_row_number,
            FROM  ${relatedTableNames.adminDemographicsTableName} ad
            FULL OUTER JOIN ${relatedTableNames.qeAdminDataTableName} qe
                ON ad.PAT_MRN_ID = qe.PAT_MRN_ID
                AND ad.FACILITY_ID = qe.FACILITY_ID
            WHERE ad.PAT_MRN_ID IS NULL OR qe.PAT_MRN_ID IS NULL
        )
        Select '${patMrnIdcolumnName}' AS issue_column, pat_mrn_id AS invalid_pat_value, FACILITY_ID AS invalid_facility_value, unmatched_source, src_file_row_number  AS issue_row,
        case when unmatched_source = 'ADMIN_DEMOGRAPHIC' then '${relatedTableNames.adminDemographicsTableName}'
        when unmatched_source = 'QE_ADMIN_DATA' then '${relatedTableNames.qeAdminDataTableName}'
        Else '' End As issue_table_name
        from cte_qe_demographic_unmatched
        UNION
        Select DISTINCT '${patMrnIdcolumnName}' AS issue_column, s.PAT_MRN_ID AS invalid_pat_value,s.FACILITY_ID AS invalid_facility_value,'SCREENING' As unmatched_source, src_file_row_number  AS issue_row,
        '${this.tableName}' as issue_table_name
        FROM ${this.tableName} s
          Left Outer Join (
            SELECT  DISTINCT a.PAT_MRN_ID,a.FACILITY_ID From ${relatedTableNames.adminDemographicsTableName} a
            Inner Join ${relatedTableNames.qeAdminDataTableName} q
            ON a.PAT_MRN_ID = q.PAT_MRN_ID
            AND a.FACILITY_ID = q.FACILITY_ID
            WHERE a.PAT_MRN_ID IS NOT NULL AND q.PAT_MRN_ID IS NOT NULL
          ) aq
          ON s.PAT_MRN_ID = aq.PAT_MRN_ID
        AND aq.FACILITY_ID = s.FACILITY_ID
        Where aq.PAT_MRN_ID IS  NULL
      )
      ${
      this.insertRowValueIssueCtePartial(
        cteName,
        `${patMrnIdcolumnName} that does not match the ${facilityIdcolumnName}`,
        "issue_row",
        "issue_column",
        "invalid_pat_value",
        `'${patMrnIdcolumnName} ("' || invalid_pat_value || '") that does not match the ${facilityIdcolumnName} ("' || invalid_facility_value || '") across the files was found in "' || issue_table_name || '".'`,
        `'Validate ${patMrnIdcolumnName} that matches the ${facilityIdcolumnName} across the files'`,
      )
    }`;
  }

  onlyAllowValidSdohDomainInAllRows(
    columnName: ColumnName,
  ) {
    const cteName = "valid_sdoh_domain_in_all_rows";
    const ahcCrossWalkReferenceTable = "ahc_cross_walk";

    // Construct the SQL query using tagged template literals
    return this.govn.SQL`
      WITH ${cteName} AS (
        SELECT DISTINCT scr.${columnName} AS invalid_value,
          '${columnName}' AS issue_column,
          scr.src_file_row_number AS issue_row
        FROM ${this.tableName} scr
        LEFT JOIN ${ahcCrossWalkReferenceTable} cw
        ON UPPER(scr.${columnName}) = UPPER(cw.${columnName})
        WHERE cw.${columnName} IS NULL
      )
      ${
      this.insertRowValueIssueCtePartial(
        cteName,
        "Invalid SDOH DOMAIN",
        "issue_row",
        "issue_column",
        "invalid_value",
        `'Invalid SDOH DOMAIN "' || invalid_value || '" found in ' || issue_column`,
        `'Validate SDOH DOMAIN with ahc cross walk reference data'`,
      )
    }`;
  }

  onlyAllowValidQuestionCodeForScreeningCodeInAllRows(
    columnName: ColumnName,
  ) {
    const cteName = "valid_question_code_for_screening_code_in_all_rows";
    const ahcCrossWalkReferenceTable = "ahc_cross_walk";

    // Construct the SQL query using tagged template literals
    return this.govn.SQL`
      WITH ${cteName} AS (
        SELECT DISTINCT scr.SCREENING_CODE AS issue_screening_value, scr.${columnName} AS invalid_value, '${columnName}' AS issue_column, scr.src_file_row_number AS issue_row
        FROM ${this.tableName} scr
        LEFT JOIN ${ahcCrossWalkReferenceTable} cw ON UPPER(scr.${columnName}) = UPPER(cw.${columnName})
        AND UPPER(scr.SCREENING_CODE) = UPPER(cw.SCREENING_CODE)
        WHERE cw.${columnName} IS NULL
        AND cw.SCREENING_CODE IS NOT NULL
      )
      ${
      this.insertRowValueIssueCtePartial(
        cteName,
        "Invalid Question Code",
        "issue_row",
        "issue_column",
        "invalid_value",
        `'Invalid Question Code "' || invalid_value || '" found in ' || issue_column`,
        `'Validate Question Code with ahc cross walk reference data'`,
      )
    }`;
  }

  onlyAllowValidScreeningQuestionAnswerMandatoryValuesInAllRows(
    columnName: ColumnName,
  ) {
    const cteName =
      "valid_screening_question_answer_mandatory_values_in_all_rows";
    // Construct the name of the question reference table based on the provided parameter 'baseName'

    // Construct the SQL query using tagged template literals
    return this.govn.SQL`
      WITH ${cteName} AS (
            SELECT  '${columnName}' AS issue_column,
                    "${columnName}" AS invalid_value,
                    src_file_row_number AS issue_row
              FROM ${this.tableName}
              WHERE (${columnName} IS NULL OR TRIM("${columnName}") = '')
              AND src_file_row_number
              NOT IN(
                Select src_file_row_number
                  FROM ${this.tableName}
                  Where UPPER(QUESTION_CODE_DESCRIPTION)
                  IN ('TOTAL SAFETY SCORE',
                  'CALCULATED PHYSICAL ACTIVITY SCORE',
                  'CALCULATED MENTAL HEALTH SCORE')
              )
      )
      ${
      this.insertRowValueIssueCtePartial(
        cteName,
        `Invalid value in ${columnName}`,
        "issue_row",
        "issue_column",
        "invalid_value",
        `'Mandatory field "' || issue_column || '" is empty'`,
        `'The required field value ${columnName} is missing'`,
      )
    }`;
  }

  onlyAllowValidScreeningPotentialNeedIndicatedQuestionAnswerValuesInAllRows(
    columnName: ColumnName,
  ) {
    const cteName =
      "valid_screening_potential_need_indicated_question_answer_values_in_all_rows";
    // Construct the name of the question reference table based on the provided parameter 'baseName'
    const ahcCrossWalkReferenceTable = "ahc_cross_walk";
    // Construct the SQL query using tagged template literals
    return this.govn.SQL`
      WITH ${cteName} AS (
        SELECT  '${columnName}' AS issue_column,
                coalesce(scr."${columnName}",'NULL') AS invalid_value,
                scr.ANSWER_CODE AS invalid_answer_value,
                scr.QUESTION_CODE AS invalid_question_value,
                scr.SCREENING_CODE AS invalid_screening_value,
                scr.src_file_row_number AS issue_row
        FROM ${this.tableName} scr
        LEFT JOIN ${ahcCrossWalkReferenceTable} acw
          ON UPPER(scr.SCREENING_CODE) = UPPER(acw.SCREENING_CODE)
          AND UPPER(scr.QUESTION_CODE) = UPPER(acw.QUESTION_CODE)
          AND UPPER(scr.ANSWER_CODE) = UPPER(acw.ANSWER_CODE)
          AND UPPER(scr."${columnName}") = UPPER(acw."${columnName}")
        WHERE acw."${columnName}" IS NULL
        AND  UPPER(scr.QUESTION_CODE_DESCRIPTION)
        NOT IN(
          'TOTAL SAFETY SCORE',
          'CALCULATED PHYSICAL ACTIVITY SCORE',
          'CALCULATED MENTAL HEALTH SCORE'
        )
      )
      ${
      this.insertRowValueIssueCtePartial(
        cteName,
        `Invalid value in ${columnName}`,
        "issue_row",
        "issue_column",
        "invalid_value",
        `'Provided Potential Need Indicated "' || invalid_value || '", Screening Code "' || invalid_screening_value || '", Question Code "' || invalid_question_value || '" and Answer Code "' || invalid_answer_value || '" are not matching with the reference data found in ' || issue_column`,
        `'Validate Potential Need Indicated, Screening Code, Question Code and Answer Code with ahc cross walk reference data'`,
      )
    }`;
  }

  onlyAllowValidCalculatedAnswerValuesInAllRows(
    columnName: ColumnName,
  ) {
    const cteName =
      "valid_screening_question_answer_mandatory_values_in_all_rows";
    // Construct the name of the question reference table based on the provided parameter 'baseName'

    // Construct the SQL query using tagged template literals
    return this.govn.SQL`
      WITH ${cteName} AS (
            SELECT  '${columnName}' AS issue_column,
                    "${columnName}" AS invalid_value,
                    src_file_row_number AS issue_row
              FROM ${this.tableName}
              WHERE (${columnName} IS NULL OR TRIM("${columnName}") = '')
              AND src_file_row_number
              NOT IN(
                Select src_file_row_number
                  FROM ${this.tableName}
                  Where UPPER(QUESTION_CODE_DESCRIPTION)
                  IN ('TOTAL SAFETY SCORE',
                  'CALCULATED PHYSICAL ACTIVITY SCORE',
                  'CALCULATED MENTAL HEALTH SCORE')
              )
      )
      ${
      this.insertRowValueIssueCtePartial(
        cteName,
        `Invalid value in ${columnName}`,
        "issue_row",
        "issue_column",
        "invalid_value",
        `'Mandatory field "' || issue_column || '" is empty'`,
        `'The required field value ${columnName} is missing'`,
      )
    }`;
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
        WHERE MEDICAID_CIN IS NOT NULL
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

  onlyAllowValidSexualOrientationDescriptionInAllRows(
    columnName: ColumnName,
  ) {
    const cteName = "valid_SEXUAL_ORIENTATION_CODE_DESCRIPTION_in_all_rows";
    const sexualOrientationReferenceTable = "sexual_orientation_reference";

    // Construct the SQL query using tagged template literals
    return this.govn.SQL`
      WITH ${cteName} AS (
          SELECT '${columnName}' AS issue_column,
                 sr."${columnName}" AS invalid_value,
                 sr.src_file_row_number AS issue_row
            FROM ${this.tableName} sr
            LEFT JOIN ${sexualOrientationReferenceTable} ref
            ON UPPER(sr.${columnName}) = UPPER(ref.SEXUAL_ORIENTATION_CODE_DESCRIPTION)
           WHERE sr.${columnName} IS NOT NULL
            AND ref.SEXUAL_ORIENTATION_CODE_DESCRIPTION IS NULL
      )
      ${
      this.insertRowValueIssueCtePartial(
        cteName,
        `Invalid SEXUAL ORIENTATION CODE DESCRIPTION`,
        "issue_row",
        "issue_column",
        "invalid_value",
        `'Invalid SEXUAL ORIENTATION CODE DESCRIPTION "' || invalid_value || '" found in ' || issue_column`,
        `'Validate SEXUAL ORIENTATION CODE DESCRIPTION with sexual orientation reference data'`,
      )
    }`;
  }

  onlyAllowValidGenderIdentityCodeInAllRows(
    columnName: ColumnName,
  ) {
    const cteName = "valid_gender_identity_code_in_all_rows";
    const genderIdentityReferenceTable = "gender_identity_reference";

    // Construct the SQL query using tagged template literals
    return this.govn.SQL`
      WITH ${cteName} AS (
          SELECT '${columnName}' AS issue_column,
                 sr."${columnName}" AS invalid_value,
                 sr.src_file_row_number AS issue_row
            FROM ${this.tableName} sr
            LEFT JOIN ${genderIdentityReferenceTable} ref
            ON UPPER(sr.${columnName}) = UPPER(ref.GENDER_IDENTITY_CODE)
           WHERE sr.${columnName} IS NOT NULL
            AND ref.GENDER_IDENTITY_CODE IS NULL
      )
      ${
      this.insertRowValueIssueCtePartial(
        cteName,
        `Invalid GENDER IDENTITY CODE`,
        "issue_row",
        "issue_column",
        "invalid_value",
        `'Invalid GENDER IDENTITY CODE "' || invalid_value || '" found in ' || issue_column`,
        `'Validate GENDER IDENTITY CODE with gender identity reference data'`,
      )
    }`;
  }

  onlyAllowValidSexualOrientationCodeInAllRows(
    columnName: ColumnName,
  ) {
    const cteName = "valid_sexual_orientation_code_in_all_rows";
    const sexualOrientationReferenceTable = "sexual_orientation_reference";

    // Construct the SQL query using tagged template literals
    return this.govn.SQL`
      WITH ${cteName} AS (
          SELECT '${columnName}' AS issue_column,
                 sr."${columnName}" AS invalid_value,
                 sr.src_file_row_number AS issue_row
            FROM ${this.tableName} sr
            LEFT JOIN ${sexualOrientationReferenceTable} ref
            ON UPPER(sr.${columnName}) = UPPER(ref.SEXUAL_ORIENTATION_CODE)
           WHERE sr.${columnName} IS NOT NULL
            AND ref.SEXUAL_ORIENTATION_CODE IS NULL
      )
      ${
      this.insertRowValueIssueCtePartial(
        cteName,
        `Invalid SEXUAL ORIENTATION CODE`,
        "issue_row",
        "issue_column",
        "invalid_value",
        `'Invalid SEXUAL ORIENTATION CODE "' || invalid_value || '" found in ' || issue_column`,
        `'Validate SEXUAL ORIENTATION CODE with sexual orientation reference data'`,
      )
    }`;
  }

  onlyAllowValidSexualOrientationCodeSystemInAllRows(
    columnName: ColumnName,
  ) {
    const cteName = "valid_sexual_orientation_code_system_in_all_rows";
    const sexualOrientationReferenceTable = "sexual_orientation_reference";

    // Construct the SQL query using tagged template literals
    return this.govn.SQL`
      WITH ${cteName} AS (
          SELECT '${columnName}' AS issue_column,
                 sr."${columnName}" AS invalid_value,
                 sr.src_file_row_number AS issue_row
            FROM ${this.tableName} sr
            LEFT JOIN ${sexualOrientationReferenceTable} ref
            ON UPPER(sr.${columnName}) = UPPER(ref.SEXUAL_ORIENTATION_CODE_SYSTEM_NAME)
           WHERE sr.${columnName} IS NOT NULL
            AND ref.SEXUAL_ORIENTATION_CODE_SYSTEM_NAME IS NULL
      )
      ${
      this.insertRowValueIssueCtePartial(
        cteName,
        `Invalid SEXUAL ORIENTATION CODE SYSTEM NAME`,
        "issue_row",
        "issue_column",
        "invalid_value",
        `'Invalid SEXUAL ORIENTATION CODE SYSTEM NAME "' || invalid_value || '" found in ' || issue_column`,
        `'Validate SEXUAL ORIENTATION CODE SYSTEM NAME with sexual orientation reference data'`,
      )
    }`;
  }

  onlyAllowValidSexAtBirthCodeInAllRows(
    columnName: ColumnName,
  ) {
    const cteName = "valid_sex_at_birth_code_in_all_rows";
    const sexAtBirthReferenceTable = "sex_at_birth_reference";

    // Construct the SQL query using tagged template literals
    return this.govn.SQL`
      WITH ${cteName} AS (
          SELECT '${columnName}' AS issue_column,
                 sr."${columnName}" AS invalid_value,
                 sr.src_file_row_number AS issue_row
            FROM ${this.tableName} sr
            LEFT JOIN ${sexAtBirthReferenceTable} ref
            ON UPPER(sr.${columnName}) = UPPER(ref.SEX_AT_BIRTH_CODE)
           WHERE sr.${columnName} IS NOT NULL
            AND ref.SEX_AT_BIRTH_CODE IS NULL
      )
      ${
      this.insertRowValueIssueCtePartial(
        cteName,
        `Invalid SEX AT BIRTH CODE`,
        "issue_row",
        "issue_column",
        "invalid_value",
        `'Invalid SEX AT BIRTH CODE "' || invalid_value || '" found in ' || issue_column`,
        `'Validate SEX AT BIRTH CODE with sex at birth reference data'`,
      )
    }`;
  }

  onlyAllowValidSexAtBirthCodeDescriptionInAllRows(
    columnName: ColumnName,
  ) {
    const cteName = "valid_sex_at_birth_code_description_in_all_rows";
    const sexAtBirthReferenceTable = "sex_at_birth_reference";

    // Construct the SQL query using tagged template literals
    return this.govn.SQL`
      WITH ${cteName} AS (
          SELECT '${columnName}' AS issue_column,
                 sr."${columnName}" AS invalid_value,
                 sr.src_file_row_number AS issue_row
            FROM ${this.tableName} sr
            LEFT JOIN ${sexAtBirthReferenceTable} ref
            ON UPPER(sr.${columnName}) = UPPER(ref.SEX_AT_BIRTH_CODE_DESCRIPTION)
           WHERE sr.${columnName} IS NOT NULL
            AND ref.SEX_AT_BIRTH_CODE_DESCRIPTION IS NULL
      )
      ${
      this.insertRowValueIssueCtePartial(
        cteName,
        `Invalid SEX_AT_BIRTH_CODE_DESCRIPTION`,
        "issue_row",
        "issue_column",
        "invalid_value",
        `'Invalid SEX_AT_BIRTH_CODE_DESCRIPTION "' || invalid_value || '" found in ' || issue_column`,
        `'Validate SEX_AT_BIRTH_CODE_DESCRIPTION with sex at birth reference data'`,
      )
    }`;
  }

  onlyAllowValidSexAtBirthCodeSystemInAllRows(
    columnName: ColumnName,
  ) {
    const cteName = "valid_sex_at_birth_code_system_in_all_rows";
    const sexAtBirthReferenceTable = "sex_at_birth_reference";

    // Construct the SQL query using tagged template literals
    return this.govn.SQL`
      WITH ${cteName} AS (
          SELECT '${columnName}' AS issue_column,
                 sr."${columnName}" AS invalid_value,
                 sr.src_file_row_number AS issue_row
            FROM ${this.tableName} sr
            LEFT JOIN ${sexAtBirthReferenceTable} ref
            ON UPPER(sr.${columnName}) = UPPER(ref.SEX_AT_BIRTH_CODE_SYSTEM)
           WHERE sr.${columnName} IS NOT NULL
            AND ref.SEX_AT_BIRTH_CODE_SYSTEM IS NULL
      )
      ${
      this.insertRowValueIssueCtePartial(
        cteName,
        `Invalid SEX AT BIRTH CODE SYSTEM`,
        "issue_row",
        "issue_column",
        "invalid_value",
        `'Invalid SEX AT BIRTH CODE SYSTEM "' || invalid_value || '" found in ' || issue_column`,
        `'Validate SEX AT BIRTH CODE SYSTEM with sex at birth reference data'`,
      )
    }`;
  }

  onlyAllowValidAdministrativeSexCodeInAllRows(
    columnName: ColumnName,
  ) {
    const cteName = "valid_administrative_sex_code_in_all_rows";
    const administrativeSexReferenceTable = "administrative_sex_reference";

    // Construct the SQL query using tagged template literals
    return this.govn.SQL`
      WITH ${cteName} AS (
          SELECT '${columnName}' AS issue_column,
                 sr."${columnName}" AS invalid_value,
                 sr.src_file_row_number AS issue_row
            FROM ${this.tableName} sr
            LEFT JOIN ${administrativeSexReferenceTable} ref
            ON UPPER(sr."${columnName}") = UPPER(ref.ADMINISTRATIVE_SEX_CODE)
           WHERE sr."${columnName}" IS NOT NULL
            AND ref.ADMINISTRATIVE_SEX_CODE IS NULL
      )
      ${
      this.insertRowValueIssueCtePartial(
        cteName,
        `Invalid ADMINISTRATIVE SEX CODE`,
        "issue_row",
        "issue_column",
        "invalid_value",
        `'Invalid ADMINISTRATIVE SEX CODE "' || invalid_value || '" found in ' || issue_column`,
        `'Validate ADMINISTRATIVE SEX CODE with administrative sex reference data'`,
      )
    }`;
  }

  onlyAllowValidAdministrativeSexCodeDescriptionInAllRows(
    columnName: ColumnName,
  ) {
    const cteName = "valid_administrative_sex_code_description_in_all_rows";
    const administrativeSexReferenceTable = "administrative_sex_reference";

    // Construct the SQL query using tagged template literals
    return this.govn.SQL`
      WITH ${cteName} AS (
          SELECT '${columnName}' AS issue_column,
                 sr."${columnName}" AS invalid_value,
                 sr.src_file_row_number AS issue_row
            FROM ${this.tableName} sr
            LEFT JOIN ${administrativeSexReferenceTable} ref
            ON UPPER(sr."${columnName}") = UPPER(ref.ADMINISTRATIVE_SEX_CODE_DESCRIPTION)
           WHERE sr."${columnName}" IS NOT NULL
            AND ref.ADMINISTRATIVE_SEX_CODE_DESCRIPTION IS NULL
      )
      ${
      this.insertRowValueIssueCtePartial(
        cteName,
        `Invalid ADMINISTRATIVE SEX CODE DESCRIPTION`,
        "issue_row",
        "issue_column",
        "invalid_value",
        `'Invalid ADMINISTRATIVE SEX CODE DESCRIPTION "' || invalid_value || '" found in ' || issue_column`,
        `'Validate ADMINISTRATIVE SEX CODE DESCRIPTION with administrative sex reference data'`,
      )
    }`;
  }

  onlyAllowValidAdministrativeSexCodeSystemInAllRows(
    columnName: ColumnName,
  ) {
    const cteName = "valid_administrative_sex_code_system_in_all_rows";
    const administrativeSexReferenceTable = "administrative_sex_reference";

    // Construct the SQL query using tagged template literals
    return this.govn.SQL`
      WITH ${cteName} AS (
          SELECT '${columnName}' AS issue_column,
                 sr."${columnName}" AS invalid_value,
                 sr.src_file_row_number AS issue_row
            FROM ${this.tableName} sr
            LEFT JOIN ${administrativeSexReferenceTable} ref
            ON UPPER(sr."${columnName}") = UPPER(ref.ADMINISTRATIVE_SEX_CODE_SYSTEM)
           WHERE sr."${columnName}" IS NOT NULL
            AND ref.ADMINISTRATIVE_SEX_CODE_SYSTEM IS NULL
      )
      ${
      this.insertRowValueIssueCtePartial(
        cteName,
        `Invalid ADMINISTRATIVE SEX CODE SYSTEM`,
        "issue_row",
        "issue_column",
        "invalid_value",
        `'Invalid ADMINISTRATIVE SEX CODE SYSTEM "' || invalid_value || '" found in ' || issue_column`,
        `'Validate ADMINISTRATIVE SEX CODE SYSTEM with administrative sex reference data'`,
      )
    }`;
  }

  onlyAllowValidEthnicityCodeInAllRows(
    columnName: ColumnName,
  ) {
    const cteName = "valid_ethnicity_code_in_all_rows";
    const ethnicityReferenceTable = "ethnicity_reference";

    // Construct the SQL query using tagged template literals
    return this.govn.SQL`
      WITH ${cteName} AS (
          SELECT '${columnName}' AS issue_column,
                 ad."${columnName}" AS invalid_value,
                 ad.src_file_row_number AS issue_row
            FROM ${this.tableName} ad
            LEFT JOIN ${ethnicityReferenceTable} ref
            ON UPPER(CAST(ad."${columnName}" AS VARCHAR)) = UPPER(CAST(ref."Concept Code" AS VARCHAR))
           WHERE ad."${columnName}" IS NOT NULL
            AND ref."Concept Code" IS NULL
      )
      ${
      this.insertRowValueIssueCtePartial(
        cteName,
        `Invalid ETHNICITY CODE`,
        "issue_row",
        "issue_column",
        "invalid_value",
        `'Invalid ETHNICITY CODE "' || invalid_value || '" found in ' || issue_column`,
        `'Validate ETHNICITY CODE with ethnicity reference data'`,
      )
    }`;
  }

  onlyAllowValidEthnicityCodeDescriptionInAllRows(
    columnName: ColumnName,
  ) {
    const cteName = "valid_ethnicity_code_description_in_all_rows";
    const ethnicityReferenceTable = "ethnicity_reference";

    // Construct the SQL query using tagged template literals
    return this.govn.SQL`
      WITH ${cteName} AS (
          SELECT '${columnName}' AS issue_column,
                 ad."${columnName}" AS invalid_value,
                 ad.src_file_row_number AS issue_row
            FROM ${this.tableName} ad
            LEFT JOIN ${ethnicityReferenceTable} ref
            ON UPPER(CAST(ad."${columnName}" AS VARCHAR)) = UPPER(CAST(ref."Concept Name" AS VARCHAR))
           WHERE ad."${columnName}" IS NOT NULL
            AND ref."Concept Name" IS NULL
      )
      ${
      this.insertRowValueIssueCtePartial(
        cteName,
        `Invalid ETHNICITY CODE DESCRIPTION`,
        "issue_row",
        "issue_column",
        "invalid_value",
        `'Invalid ETHNICITY CODE DESCRIPTION "' || invalid_value || '" found in ' || issue_column`,
        `'Validate ETHNICITY CODE DESCRIPTION with ethnicity reference data'`,
      )
    }`;
  }

  onlyAllowValidPreferredLanguageCodeInAllRows(
    columnName: ColumnName,
  ) {
    const cteName = "valid_preferred_language_code_in_all_rows";
    const preferredLanguageReferenceTable = "preferred_language_reference";

    // Construct the SQL query using tagged template literals
    return this.govn.SQL`
      WITH ${cteName} AS (
          SELECT '${columnName}' AS issue_column,
                 ad."${columnName}" AS invalid_value,
                 ad.src_file_row_number AS issue_row
            FROM ${this.tableName} ad
            LEFT JOIN ${preferredLanguageReferenceTable} ref
            ON UPPER(CAST(ad."${columnName}" AS VARCHAR)) = UPPER(CAST(ref."ISO 639-2 Code" AS VARCHAR))
           WHERE ad."${columnName}" IS NOT NULL
            AND ref."ISO 639-2 Code" IS NULL
      )
      ${
      this.insertRowValueIssueCtePartial(
        cteName,
        `Invalid PREFERRED LANGUAGE CODE`,
        "issue_row",
        "issue_column",
        "invalid_value",
        `'Invalid PREFERRED LANGUAGE CODE "' || invalid_value || '" found in ' || issue_column`,
        `'Validate PREFERRED LANGUAGE CODE with preferred language reference data'`,
      )
    }`;
  }

  onlyAllowValidPreferredLanguageCodeDescriptionInAllRows(
    columnName: ColumnName,
  ) {
    const cteName = "valid_preferred_language_code_description_in_all_rows";
    const preferredLanguageReferenceTable = "preferred_language_reference";

    // Construct the SQL query using tagged template literals
    return this.govn.SQL`
      WITH ${cteName} AS (
          SELECT '${columnName}' AS issue_column,
                 ad."${columnName}" AS invalid_value,
                 ad.src_file_row_number AS issue_row
            FROM ${this.tableName} ad
            LEFT JOIN ${preferredLanguageReferenceTable} ref
            ON UPPER(CAST(ad."${columnName}" AS VARCHAR)) = UPPER(CAST(ref."English name of Language" AS VARCHAR))
           WHERE ad."${columnName}" IS NOT NULL
            AND ref."English name of Language" IS NULL
      )
      ${
      this.insertRowValueIssueCtePartial(
        cteName,
        `Invalid PREFERRED LANGUAGE CODE DESCRIPTION`,
        "issue_row",
        "issue_column",
        "invalid_value",
        `'Invalid PREFERRED LANGUAGE CODE DESCRIPTION "' || invalid_value || '" found in ' || issue_column`,
        `'Validate PREFERRED LANGUAGE CODE DESCRIPTION with preferred language reference data'`,
      )
    }`;
  }

  onlyAllowValidRaceCodeInAllRows(
    columnName: ColumnName,
  ) {
    const cteName = "valid_race_code_in_all_rows";
    const raceReferenceTable = "race_reference";

    // Construct the SQL query using tagged template literals
    return this.govn.SQL`
      WITH ${cteName} AS (
          SELECT '${columnName}' AS issue_column,
                 ad."${columnName}" AS invalid_value,
                 ad.src_file_row_number AS issue_row
            FROM ${this.tableName} ad
            LEFT JOIN ${raceReferenceTable} ref
            ON UPPER(CAST(ad."${columnName}" AS VARCHAR)) = UPPER(CAST(ref."Concept Code" AS VARCHAR))
           WHERE ad."${columnName}" IS NOT NULL
            AND ref."Concept Code" IS NULL
      )
      ${
      this.insertRowValueIssueCtePartial(
        cteName,
        `Invalid RACE CODE`,
        "issue_row",
        "issue_column",
        "invalid_value",
        `'Invalid RACE CODE "' || invalid_value || '" found in ' || issue_column`,
        `'Validate RACE CODE with race reference data'`,
      )
    }`;
  }

  onlyAllowValidRaceCodeDescriptionInAllRows(
    columnName: ColumnName,
  ) {
    const cteName = "valid_race_code_description_in_all_rows";
    const raceReferenceTable = "race_reference";

    // Construct the SQL query using tagged template literals
    return this.govn.SQL`
      WITH ${cteName} AS (
          SELECT '${columnName}' AS issue_column,
                 ad."${columnName}" AS invalid_value,
                 ad.src_file_row_number AS issue_row
            FROM ${this.tableName} ad
            LEFT JOIN ${raceReferenceTable} ref
            ON UPPER(CAST(ad."${columnName}" AS VARCHAR)) = UPPER(CAST(ref."Concept Name" AS VARCHAR))
           WHERE ad."${columnName}" IS NOT NULL
            AND ref."Concept Name" IS NULL
      )
      ${
      this.insertRowValueIssueCtePartial(
        cteName,
        `Invalid RACE CODE DESCRIPTION`,
        "issue_row",
        "issue_column",
        "invalid_value",
        `'Invalid RACE CODE DESCRIPTION "' || invalid_value || '" found in ' || issue_column`,
        `'Validate RACE CODE DESCRIPTION with race reference data'`,
      )
    }`;
  }

  onlyAllowValidAddress1OrMedicaidCinInAllRows(
    columnName1: ColumnName,
    columnName2: ColumnName,
  ) {
    const cteName = "valid_address1_or_medicaid_cin_in_all_rows";
    // Construct the SQL query using tagged template literals
    return this.govn.SQL`
      WITH ${cteName} AS (
          SELECT '${columnName1}' AS issue_column,
                 ${columnName1} AS invalid_value,
                 src_file_row_number AS issue_row
            FROM ${this.tableName}
            WHERE (${columnName1} IS NULL OR TRIM("${columnName1}") = '') AND (${columnName2} IS NULL OR TRIM("${columnName2}") = '')
      )
      ${
      this.insertRowValueIssueCtePartial(
        cteName,
        `Invalid ${columnName1}`,
        "issue_row",
        "issue_column",
        "invalid_value",
        `'Mandatory field "' || issue_column || '" is empty'`,
        `'The required field value ${columnName1} is missing. This is required due to the absence of the ${columnName2}.'`,
      )
    }`;
  }

  onlyAllowValidMpiIdPerPatMrnIdInAllRows(
    columnName: ColumnName,
  ) {
    const cteName = "valid_mpi_id_per_pat_mrn_id_in_all_rows";
    // Construct the SQL query using tagged template literals
    return this.govn.SQL`
      WITH ${cteName} AS (
          SELECT '${columnName}' AS issue_column,
            ${columnName} AS invalid_value,
            min(src_file_row_number) AS issue_row
          FROM ${this.tableName}
          GROUP BY MPI_ID
          HAVING COUNT(DISTINCT PAT_MRN_ID) > 1
      )
      ${
      this.insertRowValueIssueCtePartial(
        cteName,
        `Invalid ${columnName}`,
        "issue_row",
        "issue_column",
        "invalid_value",
        `'The unique field "' || issue_column || '" "' || invalid_value || '"is not unique per PAT MRN ID'`,
        `'${columnName} is not unique per PAT MRN ID.'`,
      )
    }`;
  }
  // if there are any admin-demographic-specific business logic rules put them here;

  onlyAllowValidPatBirthDateDateInAllTableRows(
    columnName: ColumnName,
  ) {
    // Construct the SQL query using tagged template literals
    const cteName = "valid_date_in_all_rows";
    // deno-fmt-ignore
    return this.govn.SQL`
      WITH ${cteName} AS (
          SELECT '${columnName}' AS issue_column,
                 "${columnName}" AS invalid_value,
                 src_file_row_number AS issue_row
            FROM "${this.tableName}"
           WHERE "${columnName}" IS NOT NULL
             AND (TRY_CAST("${columnName}" AS DATE) IS NULL
         		OR "${columnName}"::TEXT ~ '^\d{4}-\\d{2}-\\d{2}$')
      )
      ${this.insertRowValueIssueCtePartial(
        cteName,
        "Invalid Date",
        "issue_row",
        "issue_column",
        "invalid_value",
        `'Invalid date "' || invalid_value || '" found in ' || issue_column`,
        `'Please follow the format YYYY-MM-DD for a valid ${columnName} .'`,
      )}`;
  }
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
  onlyAllowValidUniqueFacilityAddress1PerFacilityInAllRows(
    columnName: ColumnName,
  ) {
    const cteName = "valid_unique_facility_address1_per_facility_in_all_rows";
    // Construct the SQL query using tagged template literals
    return this.govn.SQL`
      WITH ${cteName} AS (
        SELECT '${columnName}' AS issue_column,
          ${columnName} AS invalid_value,
          min(src_file_row_number) AS issue_row
        FROM ${this.tableName}
        GROUP BY ${columnName}
        HAVING COUNT(DISTINCT FACILITY_LONG_NAME) > 1
      )
      ${
      this.insertRowValueIssueCtePartial(
        cteName,
        `Invalid ${columnName}`,
        "issue_row",
        "issue_column",
        "invalid_value",
        `'The unique field "' || issue_column || '" "' || invalid_value || '"is not unique per facility'`,
        `'${columnName} is not unique per facility.'`,
      )
    }`;
  }

  onlyAllowValidUniqueFacilityIdPerFacilityInAllRows(
    columnName: ColumnName,
  ) {
    const cteName = "valid_unique_facility_id_per_facility_in_all_rows";
    // Construct the SQL query using tagged template literals
    return this.govn.SQL`
      WITH ${cteName} AS (
        SELECT '${columnName}' AS issue_column,
          ${columnName} AS invalid_value,
          min(src_file_row_number) AS issue_row
        FROM ${this.tableName}
        GROUP BY ${columnName}
        HAVING COUNT(DISTINCT FACILITY_LONG_NAME) > 1
      )
      ${
      this.insertRowValueIssueCtePartial(
        cteName,
        `Invalid ${columnName}`,
        "issue_row",
        "issue_column",
        "invalid_value",
        `'The unique field "' || issue_column || '" "' || invalid_value || '"is not unique per facility'`,
        `'${columnName} is not unique per facility.'`,
      )
    }`;
  }
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
