import { SQLa_orch as o, SQLa_orch_duckdb as ddbo } from "./deps.ts";
import * as sg from "./governance.ts";

export const referenceCsvFileNames = [
  "ahc-cross-walk",
] as const;
export type ReferenceCsvFileName = (typeof referenceCsvFileNames)[number];
export const referenceCsvTableNames = [
  "ahc_cross_walk",
] as const;

export const [
  aggrAhcCrossWalkTableName,
] = referenceCsvTableNames;

const ahcCrossWalkCsvColumnNames = [
  "SCREENING_CODE",
  "SCREENING_CODE_DESCRIPTION",
  "QUESTION",
  "QUESTION_CODE",
  "ANSWER_VALUE",
  "ANSWER_CODE",
  "SCORE",
  "UCUM Units",
  "SDOH_DOMAIN",
  "POTENTIAL_NEED_INDICATED",
] as const;

type AhcCrossWalkCsvColumnName = (typeof ahcCrossWalkCsvColumnNames)[number];
export class AhcCrossWalkCsvStructureRules<
  TableName extends string,
> extends ddbo.DuckDbOrchTableAssuranceRules<
  TableName,
  AhcCrossWalkCsvColumnName
> {
  requiredColumnNames() {
    return this.tableRules.requiredColumnNamesStrict([
      ...ahcCrossWalkCsvColumnNames,
    ]);
  }
}

const TERMINAL_STATE = "EXIT(AhcCrossWalkCsvFileIngestSource)" as const;

export class AhcCrossWalkCsvFileIngestSource<
  TableName extends "ahc_cross_walk",
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
    readonly dataHome: string,
    readonly govn: ddbo.DuckDbOrchGovernance,
    readonly tableName = "ahc_cross_walk" as TableName,
    readonly uri = `${dataHome}/ahc-cross-walk.csv`,
  ) {
  }

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
    const ssr = new AhcCrossWalkCsvStructureRules(
      this.tableName,
      session.sessionID,
      sessionEntryID,
      this.govn,
    );
    const sar = new sg.AhcCrossWalkAssuranceRules(
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
    ssr: AhcCrossWalkCsvStructureRules<TableName>,
    sar: sg.AhcCrossWalkAssuranceRules<TableName, AhcCrossWalkCsvColumnName>,
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
          "AhcCrossWalkCsvFileIngestSource.ingestSQL",
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
          "AhcCrossWalkCsvFileIngestSource.ingestSQL",
          this.govn.emitCtx.sqlEngineNow
        )}
      `;
  }

  async assuranceSQL(
    session: o.OrchSession<
      ddbo.DuckDbOrchGovernance,
      ddbo.DuckDbOrchEmitContext
    >,
    sar: sg.AhcCrossWalkAssuranceRules<TableName, AhcCrossWalkCsvColumnName>,
  ) {
    const { govn } = this;
    const { sessionEntryID, tableRules: tr } = sar;

    // deno-fmt-ignore
    return govn.SQL`
        ${await session.entryStateDML(
          sessionEntryID,
          "INGESTED_CSV",
          "ATTEMPT_CSV_ASSURANCE",
          "AhcCrossWalkCsvFileIngestSource.assuranceSQL",
          this.govn.emitCtx.sqlEngineNow
        )}

        -- add field validation

        ${await session.entryStateDML(
          sessionEntryID,
          "ATTEMPT_CSV_ASSURANCE",
          "ASSURED_CSV",
          "AhcCrossWalkCsvFileIngestSource.assuranceSQL",
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
          "EXIT(AhcCrossWalkCsvFileIngestSource)",
          "AhcCrossWalkCsvFileIngestSource.exportResourceSQL",
          this.govn.emitCtx.sqlEngineNow
        )}

        CREATE TABLE IF NOT EXISTS ${aggrAhcCrossWalkTableName} AS SELECT * FROM ${tableName} WHERE 0=1;
        INSERT INTO ${aggrAhcCrossWalkTableName} SELECT * FROM ${tableName};

        CREATE TABLE ${targetSchema}.${tableName} AS SELECT * FROM ${tableName};

        CREATE TABLE IF NOT EXISTS ${targetSchema}.${aggrAhcCrossWalkTableName} AS SELECT * FROM ${tableName} WHERE 0=1;
        INSERT INTO ${targetSchema}.${aggrAhcCrossWalkTableName} SELECT * FROM ${tableName};

          ${await session.entryStateDML(
            sessionEntryID,
            "ATTEMPT_CSV_EXPORT",
            TERMINAL_STATE,
            "AhcCrossWalkCsvFileIngestSource.exportResourceSQL",
            this.govn.emitCtx.sqlEngineNow
          )}
          `;
  }
}
