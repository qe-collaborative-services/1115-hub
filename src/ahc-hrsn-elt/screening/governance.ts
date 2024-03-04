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
    minYear = 2023,
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
              AND NOT (LENGTH("${columnName}") = 17
                    AND SUBSTR("${columnName}", 9, 1) = ' '
                    AND SUBSTR("${columnName}", 12, 1) = ':'
                    AND LENGTH(SUBSTRING("${columnName}", 13, 2)) = 2
                    AND SUBSTRING("${columnName}", 15, 1) = ':'
                    AND LENGTH(SUBSTRING("${columnName}", 16, 2)) = 2
                    )
              OR TRY_CAST(SUBSTR("${columnName}", 1, 4) || '-' || SUBSTR("${columnName}", 5, 2) || '-' || SUBSTR("${columnName}", 7, 2) AS DATE) IS NULL
              OR TRY_CAST(SUBSTRING("${columnName}", 10, 8) AS TIME) IS NULL
              OR SUBSTR("${columnName}", 1, 4) < ${minYear}
      )
      ${this.insertRowValueIssueCtePartial(
        cteName,
        "Invalid Date",
        "issue_row",
        "issue_column",
        "invalid_value",
        `'Invalid timestamp "' || invalid_value || '" found in ' || issue_column`,
        `'Please be sure to provide both a valid date and time (Format: YYYYMMDD HH:MM:SS).'`,
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
        SELECT '${patMrnIdcolumnName}' AS issue_column, '${this.tableName}' AS issue_table_name, a.${patMrnIdcolumnName} AS invalid_pat_value, a.${facilityIdcolumnName} AS invalid_facility_value, a.src_file_row_number AS issue_row
        FROM ${this.tableName} a
        LEFT JOIN ${relatedTableNames.qeAdminDataTableName} b
        ON a.${patMrnIdcolumnName} = b.${patMrnIdcolumnName}
        AND a.${facilityIdcolumnName} = b.${facilityIdcolumnName}
        LEFT JOIN ${relatedTableNames.adminDemographicsTableName} c
        ON a.${patMrnIdcolumnName} = c.${patMrnIdcolumnName}
        AND a.${facilityIdcolumnName} = c.${facilityIdcolumnName}
        WHERE b.${patMrnIdcolumnName} IS NULL OR c.${patMrnIdcolumnName} IS NULL OR b.${facilityIdcolumnName} IS NULL OR c.${facilityIdcolumnName} IS NULL
        UNION
        SELECT '${patMrnIdcolumnName}' AS issue_column, '${relatedTableNames.qeAdminDataTableName}' AS issue_table_name, b.${patMrnIdcolumnName} AS invalid_pat_value, b.${facilityIdcolumnName} AS invalid_facility_value, b.src_file_row_number AS issue_row
        FROM ${relatedTableNames.qeAdminDataTableName} b
        LEFT JOIN ${this.tableName} a
        ON a.${patMrnIdcolumnName} = b.${patMrnIdcolumnName}
        AND a.${facilityIdcolumnName} = b.${facilityIdcolumnName}
        LEFT JOIN ${relatedTableNames.adminDemographicsTableName} c
        ON b.${patMrnIdcolumnName} = c.${patMrnIdcolumnName}
        AND b.${facilityIdcolumnName} = c.${facilityIdcolumnName}
        WHERE a.${patMrnIdcolumnName} IS NULL OR c.${patMrnIdcolumnName} IS NULL OR a.${facilityIdcolumnName} IS NULL OR c.${facilityIdcolumnName} IS NULL
        UNION
        SELECT '${patMrnIdcolumnName}' AS issue_column, '${relatedTableNames.adminDemographicsTableName}' AS issue_table_name, c.${patMrnIdcolumnName} AS invalid_pat_value, c.${facilityIdcolumnName} AS invalid_facility_value, c.src_file_row_number AS issue_row
        FROM ${relatedTableNames.adminDemographicsTableName} c
        LEFT JOIN ${this.tableName} a
        ON a.${patMrnIdcolumnName} = c.${patMrnIdcolumnName}
        AND a.${facilityIdcolumnName} = c.${facilityIdcolumnName}
        LEFT JOIN ${relatedTableNames.qeAdminDataTableName} b
        ON c.${patMrnIdcolumnName} = b.${patMrnIdcolumnName}
        AND c.${facilityIdcolumnName} = b.${facilityIdcolumnName}
        WHERE a.${patMrnIdcolumnName} IS NULL OR b.${patMrnIdcolumnName} IS NULL OR a.${facilityIdcolumnName} IS NULL OR b.${facilityIdcolumnName} IS NULL
      )
      ${
      this.insertRowValueIssueCtePartial(
        cteName,
        `${patMrnIdcolumnName} that does not match the ${facilityIdcolumnName}`,
        "issue_row",
        "issue_column",
        "invalid_pat_value",
        `'${patMrnIdcolumnName} ("' || invalid_pat_value || '") that does not match the ${facilityIdcolumnName} ("' || invalid_facility_value || '") across the files was found in "' || issue_table_name || '".'`,
        `'Validate ${patMrnIdcolumnName} that maches the ${facilityIdcolumnName} across the files'`,
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
        ON scr.${columnName} = cw.${columnName}
        WHERE cw.${columnName} IS NULL
        AND cw.SCREENING_CODE IS NOT NULL
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
        LEFT JOIN ${ahcCrossWalkReferenceTable} cw ON scr.${columnName} = cw.${columnName}
        AND scr.SCREENING_CODE = cw.SCREENING_CODE
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
