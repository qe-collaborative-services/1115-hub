import { fs, path, SQLa_ingest_duckdb as ddbi } from "./deps.ts";
import * as sg from "./governance.ts";

export class ScreeningCsvFileIngestSource<TableName extends string>
  implements ddbi.CsvFileIngestSource<TableName> {
  readonly nature = "CSV";
  constructor(
    readonly uri: string,
    readonly tableName: TableName,
    readonly govn: ddbi.IngestGovernance,
  ) {
  }

  workflow(
    sessionID: string,
    sessionEntryID: string,
  ): ReturnType<ddbi.CsvFileIngestSource<TableName>["workflow"]> {
    const sar = new sg.ScreeningAssuranceRules(
      this.tableName,
      sessionID,
      sessionEntryID,
      this.govn,
    );

    return {
      ingestSQL: async (issac) => await this.ingestSQL(issac, sar),
      assuranceSQL: async () => await this.assuranceSQL(sar),
      exportResourceSQL: async (targetSchema) =>
        await this.exportResourceSQL(targetSchema),
    };
  }

  async ingestSQL(
    issac: ddbi.IngestSourceStructAssuranceContext,
    sar: sg.ScreeningAssuranceRules<TableName>,
  ) {
    const { tableName, uri } = this;
    const { sessionID, sessionEntryID } = sar;

    // deno-fmt-ignore
    return this.govn.SQL`
      -- required by IngestEngine, setup the ingestion entry for logging
      ${await issac.sessionEntryInsertDML()}

      -- be sure to add src_file_row_number and session_id columns to each row
      -- because assurance CTEs require them
      CREATE TABLE ${tableName} AS
        SELECT *, row_number() OVER () as src_file_row_number, '${sessionID}' as session_id, '${sessionEntryID}' as session_entry_id
          FROM read_csv_auto('${uri}');

      ${sar.requiredColumnNames()}`
  }

  // deno-lint-ignore require-await
  async assuranceSQL(sar: sg.ScreeningAssuranceRules<TableName>) {
    const { govn } = this;

    // deno-fmt-ignore
    return govn.SQL`
      ${sar.tableRules.intValueInAllRows('SURVEY_ID')}`
  }

  // deno-lint-ignore require-await
  async exportResourceSQL(targetSchema: string) {
    const { govn: { SQL }, tableName } = this;
    return SQL`CREATE TABLE ${targetSchema}.${tableName} AS SELECT * FROM ${tableName}`;
  }
}

export function ingestCsvFilesSourcesSupplier(
  govn: ddbi.IngestGovernance,
): ddbi.IngestFsPatternSourcesSupplier<ScreeningCsvFileIngestSource<string>> {
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
