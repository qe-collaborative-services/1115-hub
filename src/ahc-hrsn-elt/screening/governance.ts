import { SQLa_orch_duckdb as ddbo } from "./deps.ts";

/**
 * Define common rules for data validation.
 */
export class CommonAssuranceRules<
  TableName extends string,
  ColumnName extends string,
> extends ddbo.DuckDbOrchTableAssuranceRules<TableName, ColumnName> {
  // if there are any custom business logic rules put them here and if they can
  // be further generalized we can move them into the upstream SQLa library

  // any rules defined here will be available as car.rule() in the
  onlyAllowValidZipInAllRows(columnName: ColumnName) {
    return this.tableRules.patternValueInAllRows(columnName, "^\d{5}(\d{4})?$");
  }

  onlyAllowAlphabetsAndNumbersInAllRows(columnName: ColumnName) {
    return this.tableRules.patternValueInAllRows(columnName, "^(?=.*[a-zA-Z])(?=.*\d).+$");
  }

  onlyAllowAlphabetsWithSpacesInAllRows(columnName: ColumnName) {
    return this.tableRules.patternValueInAllRows(columnName, "^[a-zA-Z\s]+$");
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
  // if you want to use the rules from CommonAssuranceRules use car.X()  
}

/**
 * Define custom rules for Admin Demigrapic data validation
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

  // if there are any admin-demographic-specific business logic rules put them here;

  // if you want to use the rules from CommonAssuranceRules use car.X()

  onlyAllowValidZipInAllRows(columnName: ColumnName) {
    return this.car.onlyAllowValidZipInAllRows(columnName);
  }

  onlyAllowAlphabetsAndNumbersInAllRows(columnName: ColumnName) {
    return this.car.onlyAllowAlphabetsAndNumbersInAllRows(columnName);
  }
  onlyAllowAlphabetsWithSpacesInAllRows(columnName: ColumnName) {
    return this.car.onlyAllowAlphabetsWithSpacesInAllRows(columnName);
  }
}

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

  // if you want to use the rules from CommonAssuranceRules use car.X()
  onlyAllowValidZipCode(columnName: ColumnName) {
    return this.car.onlyAllowValidZipInAllRows(columnName);
  }
  onlyAllowAlphabetsAndNumbersInAllRows(columnName: ColumnName) {
    return this.car.onlyAllowAlphabetsAndNumbersInAllRows(columnName);
  }
  onlyAllowAlphabetsWithSpacesInAllRows(columnName: ColumnName) {
    return this.car.onlyAllowAlphabetsWithSpacesInAllRows(columnName);
  }
}

