import { SQLa_orch as o, SQLa_orch_duckdb as ddbo } from "./deps.ts";
import * as sg from "./governance.ts";

const ahcCrossWalkCsvColumnNames = [
  "SCREENING_CODE",
  "SCREENING_CODE_DESCRIPTION",
  "QUESTION_SLNO",
  "QUESTION",
  "QUESTION_CODE",
  "QUESTION_SLNO_REFERENCE",
  "ANSWER_VALUE",
  "ANSWER_CODE",
  "CALCULATED_FIELD",
  "SCORE",
  "UCUM_UNITS",
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
            FROM read_csv_auto('${uri}', header = true);

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

        CREATE TABLE IF NOT EXISTS ${targetSchema}.${tableName} AS SELECT * FROM ${tableName} WHERE 0=1;
        INSERT INTO ${targetSchema}.${tableName} SELECT * FROM ${tableName};

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

const encounterClassReferenceColumnNames = [
  "Code",
  "System",
  "Display",
  "Definition",
] as const;

type EncounterClassReferenceColumnName =
  (typeof encounterClassReferenceColumnNames)[number];

const ENCOUNTER_CLASS_TERMINAL_STATE =
  "EXIT(EncounterClassReferenceCsvFileIngestSource)" as const;

export class EncounterClassReferenceStructureRules<
  TableName extends string,
> extends ddbo.DuckDbOrchTableAssuranceRules<
  TableName,
  EncounterClassReferenceColumnName
> {
  requiredColumnNames() {
    return this.tableRules.requiredColumnNamesStrict([
      ...encounterClassReferenceColumnNames,
    ]);
  }
}
export class EncounterClassReferenceCsvFileIngestSource<
  TableName extends "encounter_class_reference",
  InitState extends o.State,
> implements
  o.CsvFileIngestSource<
    TableName,
    ddbo.DuckDbOrchGovernance,
    InitState,
    typeof ENCOUNTER_CLASS_TERMINAL_STATE,
    ddbo.DuckDbOrchEmitContext
  > {
  readonly nature = "CSV";
  constructor(
    readonly dataHome: string,
    readonly govn: ddbo.DuckDbOrchGovernance,
    readonly tableName = "encounter_class_reference" as TableName,
    readonly uri = `${dataHome}/encounter-class-reference.csv`,
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
      typeof ENCOUNTER_CLASS_TERMINAL_STATE,
      ddbo.DuckDbOrchEmitContext
    >["workflow"]
  > {
    const ssr = new EncounterClassReferenceStructureRules(
      this.tableName,
      session.sessionID,
      sessionEntryID,
      this.govn,
    );
    const sar = new sg.EncounterClassReferenceAssuranceRules(
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
      terminalState: () => ENCOUNTER_CLASS_TERMINAL_STATE,
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
    ssr: EncounterClassReferenceStructureRules<TableName>,
    sar: sg.EncounterClassReferenceAssuranceRules<
      TableName,
      EncounterClassReferenceColumnName
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
          "EncounterClassReferenceCsvFileIngestSource.ingestSQL",
          this.govn.emitCtx.sqlEngineNow
        )}

        -- be sure to add src_file_row_number and session_id columns to each row
        -- because assurance CTEs require them
        CREATE TABLE ${tableName} AS
          SELECT *, row_number() OVER () as src_file_row_number, '${sessionID}' as session_id, '${sessionEntryID}' as session_entry_id
            FROM read_csv_auto('${uri}',
              header = true
            );

        ${ssr.requiredColumnNames()}

        ${await session.entryStateDML(
          sessionEntryID,
          "ATTEMPT_CSV_INGEST",
          "INGESTED_CSV",
          "EncounterClassReferenceCsvFileIngestSource.ingestSQL",
          this.govn.emitCtx.sqlEngineNow
        )}
      `;
  }

  async assuranceSQL(
    session: o.OrchSession<
      ddbo.DuckDbOrchGovernance,
      ddbo.DuckDbOrchEmitContext
    >,
    sar: sg.EncounterClassReferenceAssuranceRules<
      TableName,
      EncounterClassReferenceColumnName
    >,
  ) {
    const { govn } = this;
    const { sessionEntryID, tableRules: tr } = sar;

    // deno-fmt-ignore
    return govn.SQL`
        ${await session.entryStateDML(
          sessionEntryID,
          "INGESTED_CSV",
          "ATTEMPT_CSV_ASSURANCE",
          "EncounterClassReferenceCsvFileIngestSource.assuranceSQL",
          this.govn.emitCtx.sqlEngineNow
        )}

        -- add field validation

        ${await session.entryStateDML(
          sessionEntryID,
          "ATTEMPT_CSV_ASSURANCE",
          "ASSURED_CSV",
          "EncounterClassReferenceCsvFileIngestSource.assuranceSQL",
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
          "EXIT(EncounterClassReferenceCsvFileIngestSource)",
          "EncounterClassReferenceCsvFileIngestSource.exportResourceSQL",
          this.govn.emitCtx.sqlEngineNow
        )}

        CREATE TABLE IF NOT EXISTS ${targetSchema}.${tableName} AS SELECT * FROM ${tableName} WHERE 0=1;
        INSERT INTO ${targetSchema}.${tableName} SELECT * FROM ${tableName};

          ${await session.entryStateDML(
            sessionEntryID,
            "ATTEMPT_CSV_EXPORT",
            ENCOUNTER_CLASS_TERMINAL_STATE,
            "EncounterClassReferenceCsvFileIngestSource.exportResourceSQL",
            this.govn.emitCtx.sqlEngineNow
          )}
          `;
  }
}

const encounterStatusCodeReferenceColumnNames = [
  "Code",
  "Display",
  "Definition",
] as const;

type EncounterStatusCodeReferenceColumnName =
  (typeof encounterStatusCodeReferenceColumnNames)[number];

const ENCOUNTER_STATUS_CODE_TERMINAL_STATE =
  "EXIT(EncounterStatusCodeReferenceCsvFileIngestSource)" as const;

export class EncounterStatusCodeReferenceStructureRules<
  TableName extends string,
> extends ddbo.DuckDbOrchTableAssuranceRules<
  TableName,
  EncounterStatusCodeReferenceColumnName
> {
  requiredColumnNames() {
    return this.tableRules.requiredColumnNamesStrict([
      ...encounterStatusCodeReferenceColumnNames,
    ]);
  }
}
export class EncounterStatusCodeReferenceCsvFileIngestSource<
  TableName extends "encounter_status_code_reference",
  InitState extends o.State,
> implements
  o.CsvFileIngestSource<
    TableName,
    ddbo.DuckDbOrchGovernance,
    InitState,
    typeof ENCOUNTER_STATUS_CODE_TERMINAL_STATE,
    ddbo.DuckDbOrchEmitContext
  > {
  readonly nature = "CSV";
  constructor(
    readonly dataHome: string,
    readonly govn: ddbo.DuckDbOrchGovernance,
    readonly tableName = "encounter_status_code_reference" as TableName,
    readonly uri = `${dataHome}/encounter-status-code-reference.csv`,
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
      typeof ENCOUNTER_STATUS_CODE_TERMINAL_STATE,
      ddbo.DuckDbOrchEmitContext
    >["workflow"]
  > {
    const ssr = new EncounterStatusCodeReferenceStructureRules(
      this.tableName,
      session.sessionID,
      sessionEntryID,
      this.govn,
    );
    const sar = new sg.EncounterStatusCodeReferenceAssuranceRules(
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
      terminalState: () => ENCOUNTER_STATUS_CODE_TERMINAL_STATE,
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
    ssr: EncounterStatusCodeReferenceStructureRules<TableName>,
    sar: sg.EncounterStatusCodeReferenceAssuranceRules<
      TableName,
      EncounterStatusCodeReferenceColumnName
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
          "EncounterStatusCodeReferenceCsvFileIngestSource.ingestSQL",
          this.govn.emitCtx.sqlEngineNow
        )}

        -- be sure to add src_file_row_number and session_id columns to each row
        -- because assurance CTEs require them
        CREATE TABLE ${tableName} AS
          SELECT *, row_number() OVER () as src_file_row_number, '${sessionID}' as session_id, '${sessionEntryID}' as session_entry_id
            FROM read_csv_auto('${uri}',
              header = true
            );

        ${ssr.requiredColumnNames()}

        ${await session.entryStateDML(
          sessionEntryID,
          "ATTEMPT_CSV_INGEST",
          "INGESTED_CSV",
          "EncounterStatusCodeReferenceCsvFileIngestSource.ingestSQL",
          this.govn.emitCtx.sqlEngineNow
        )}
      `;
  }

  async assuranceSQL(
    session: o.OrchSession<
      ddbo.DuckDbOrchGovernance,
      ddbo.DuckDbOrchEmitContext
    >,
    sar: sg.EncounterStatusCodeReferenceAssuranceRules<
      TableName,
      EncounterStatusCodeReferenceColumnName
    >,
  ) {
    const { govn } = this;
    const { sessionEntryID, tableRules: tr } = sar;

    // deno-fmt-ignore
    return govn.SQL`
        ${await session.entryStateDML(
          sessionEntryID,
          "INGESTED_CSV",
          "ATTEMPT_CSV_ASSURANCE",
          "EncounterStatusCodeReferenceCsvFileIngestSource.assuranceSQL",
          this.govn.emitCtx.sqlEngineNow
        )}

        -- add field validation

        ${await session.entryStateDML(
          sessionEntryID,
          "ATTEMPT_CSV_ASSURANCE",
          "ASSURED_CSV",
          "EncounterStatusCodeReferenceCsvFileIngestSource.assuranceSQL",
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
          "EXIT(EncounterStatusCodeReferenceCsvFileIngestSource)",
          "EncounterStatusCodeReferenceCsvFileIngestSource.exportResourceSQL",
          this.govn.emitCtx.sqlEngineNow
        )}

        CREATE TABLE IF NOT EXISTS ${targetSchema}.${tableName} AS SELECT * FROM ${tableName} WHERE 0=1;
        INSERT INTO ${targetSchema}.${tableName} SELECT * FROM ${tableName};

          ${await session.entryStateDML(
            sessionEntryID,
            "ATTEMPT_CSV_EXPORT",
            ENCOUNTER_STATUS_CODE_TERMINAL_STATE,
            "EncounterStatusCodeReferenceCsvFileIngestSource.exportResourceSQL",
            this.govn.emitCtx.sqlEngineNow
          )}
          `;
  }
}

const encounterTypeCodeReferenceColumnNames = [
  "Code",
  "System",
  "Display",
] as const;

type EncounterTypeCodeReferenceColumnName =
  (typeof encounterTypeCodeReferenceColumnNames)[number];

const ENCOUNTER_TYPE_CODE_TERMINAL_STATE =
  "EXIT(EncounterTypeCodeReferenceCsvFileIngestSource)" as const;

export class EncounterTypeCodeReferenceStructureRules<
  TableName extends string,
> extends ddbo.DuckDbOrchTableAssuranceRules<
  TableName,
  EncounterTypeCodeReferenceColumnName
> {
  requiredColumnNames() {
    return this.tableRules.requiredColumnNamesStrict([
      ...encounterTypeCodeReferenceColumnNames,
    ]);
  }
}
export class EncounterTypeCodeReferenceCsvFileIngestSource<
  TableName extends "encounter_type_code_reference",
  InitState extends o.State,
> implements
  o.CsvFileIngestSource<
    TableName,
    ddbo.DuckDbOrchGovernance,
    InitState,
    typeof ENCOUNTER_TYPE_CODE_TERMINAL_STATE,
    ddbo.DuckDbOrchEmitContext
  > {
  readonly nature = "CSV";
  constructor(
    readonly dataHome: string,
    readonly govn: ddbo.DuckDbOrchGovernance,
    readonly tableName = "encounter_type_code_reference" as TableName,
    readonly uri = `${dataHome}/encounter-type-code-reference.csv`,
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
      typeof ENCOUNTER_TYPE_CODE_TERMINAL_STATE,
      ddbo.DuckDbOrchEmitContext
    >["workflow"]
  > {
    const ssr = new EncounterTypeCodeReferenceStructureRules(
      this.tableName,
      session.sessionID,
      sessionEntryID,
      this.govn,
    );
    const sar = new sg.EncounterTypeCodeReferenceAssuranceRules(
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
      terminalState: () => ENCOUNTER_TYPE_CODE_TERMINAL_STATE,
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
    ssr: EncounterTypeCodeReferenceStructureRules<TableName>,
    sar: sg.EncounterTypeCodeReferenceAssuranceRules<
      TableName,
      EncounterTypeCodeReferenceColumnName
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
          "EncounterTypeCodeReferenceCsvFileIngestSource.ingestSQL",
          this.govn.emitCtx.sqlEngineNow
        )}

        -- be sure to add src_file_row_number and session_id columns to each row
        -- because assurance CTEs require them
        CREATE TABLE ${tableName} AS
          SELECT *, row_number() OVER () as src_file_row_number, '${sessionID}' as session_id, '${sessionEntryID}' as session_entry_id
            FROM read_csv_auto('${uri}',
              header = true
            );

        ${ssr.requiredColumnNames()}

        ${await session.entryStateDML(
          sessionEntryID,
          "ATTEMPT_CSV_INGEST",
          "INGESTED_CSV",
          "EncounterTypeCodeReferenceCsvFileIngestSource.ingestSQL",
          this.govn.emitCtx.sqlEngineNow
        )}
      `;
  }

  async assuranceSQL(
    session: o.OrchSession<
      ddbo.DuckDbOrchGovernance,
      ddbo.DuckDbOrchEmitContext
    >,
    sar: sg.EncounterTypeCodeReferenceAssuranceRules<
      TableName,
      EncounterTypeCodeReferenceColumnName
    >,
  ) {
    const { govn } = this;
    const { sessionEntryID, tableRules: tr } = sar;

    // deno-fmt-ignore
    return govn.SQL`
        ${await session.entryStateDML(
          sessionEntryID,
          "INGESTED_CSV",
          "ATTEMPT_CSV_ASSURANCE",
          "EncounterTypeCodeReferenceCsvFileIngestSource.assuranceSQL",
          this.govn.emitCtx.sqlEngineNow
        )}

        -- add field validation

        ${await session.entryStateDML(
          sessionEntryID,
          "ATTEMPT_CSV_ASSURANCE",
          "ASSURED_CSV",
          "EncounterTypeCodeReferenceCsvFileIngestSource.assuranceSQL",
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
          "EXIT(EncounterTypeCodeReferenceCsvFileIngestSource)",
          "EncounterTypeCodeReferenceCsvFileIngestSource.exportResourceSQL",
          this.govn.emitCtx.sqlEngineNow
        )}

        CREATE TABLE IF NOT EXISTS ${targetSchema}.${tableName} AS SELECT * FROM ${tableName} WHERE 0=1;
        INSERT INTO ${targetSchema}.${tableName} SELECT * FROM ${tableName};

          ${await session.entryStateDML(
            sessionEntryID,
            "ATTEMPT_CSV_EXPORT",
            ENCOUNTER_TYPE_CODE_TERMINAL_STATE,
            "EncounterTypeCodeReferenceCsvFileIngestSource.exportResourceSQL",
            this.govn.emitCtx.sqlEngineNow
          )}
          `;
  }
}

const screeningStatusCodeReferenceColumnNames = [
  "Lvl",
  "Code",
  "Display",
  "Definition",
] as const;

type ScreeningStatusCodeReferenceColumnName =
  (typeof screeningStatusCodeReferenceColumnNames)[number];

const SCREENING_STATUS_CODE_TERMINAL_STATE =
  "EXIT(ScreeningStatusCodeReferenceCsvFileIngestSource)" as const;

export class ScreeningStatusCodeReferenceStructureRules<
  TableName extends string,
> extends ddbo.DuckDbOrchTableAssuranceRules<
  TableName,
  ScreeningStatusCodeReferenceColumnName
> {
  requiredColumnNames() {
    return this.tableRules.requiredColumnNamesStrict([
      ...screeningStatusCodeReferenceColumnNames,
    ]);
  }
}
export class ScreeningStatusCodeReferenceCsvFileIngestSource<
  TableName extends "screening_status_code_reference",
  InitState extends o.State,
> implements
  o.CsvFileIngestSource<
    TableName,
    ddbo.DuckDbOrchGovernance,
    InitState,
    typeof SCREENING_STATUS_CODE_TERMINAL_STATE,
    ddbo.DuckDbOrchEmitContext
  > {
  readonly nature = "CSV";
  constructor(
    readonly dataHome: string,
    readonly govn: ddbo.DuckDbOrchGovernance,
    readonly tableName = "screening_status_code_reference" as TableName,
    readonly uri = `${dataHome}/screening-status-code-reference.csv`,
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
      typeof SCREENING_STATUS_CODE_TERMINAL_STATE,
      ddbo.DuckDbOrchEmitContext
    >["workflow"]
  > {
    const ssr = new ScreeningStatusCodeReferenceStructureRules(
      this.tableName,
      session.sessionID,
      sessionEntryID,
      this.govn,
    );
    const sar = new sg.ScreeningStatusCodeReferenceAssuranceRules(
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
      terminalState: () => SCREENING_STATUS_CODE_TERMINAL_STATE,
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
    ssr: ScreeningStatusCodeReferenceStructureRules<TableName>,
    sar: sg.ScreeningStatusCodeReferenceAssuranceRules<
      TableName,
      ScreeningStatusCodeReferenceColumnName
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
          "ScreeningStatusCodeReferenceCsvFileIngestSource.ingestSQL",
          this.govn.emitCtx.sqlEngineNow
        )}

        -- be sure to add src_file_row_number and session_id columns to each row
        -- because assurance CTEs require them
        CREATE TABLE ${tableName} AS
          SELECT *, row_number() OVER () as src_file_row_number, '${sessionID}' as session_id, '${sessionEntryID}' as session_entry_id
            FROM read_csv_auto('${uri}',
              header = true
            );

        ${ssr.requiredColumnNames()}

        ${await session.entryStateDML(
          sessionEntryID,
          "ATTEMPT_CSV_INGEST",
          "INGESTED_CSV",
          "ScreeningStatusCodeReferenceCsvFileIngestSource.ingestSQL",
          this.govn.emitCtx.sqlEngineNow
        )}
      `;
  }

  async assuranceSQL(
    session: o.OrchSession<
      ddbo.DuckDbOrchGovernance,
      ddbo.DuckDbOrchEmitContext
    >,
    sar: sg.ScreeningStatusCodeReferenceAssuranceRules<
      TableName,
      ScreeningStatusCodeReferenceColumnName
    >,
  ) {
    const { govn } = this;
    const { sessionEntryID, tableRules: tr } = sar;

    // deno-fmt-ignore
    return govn.SQL`
        ${await session.entryStateDML(
          sessionEntryID,
          "INGESTED_CSV",
          "ATTEMPT_CSV_ASSURANCE",
          "ScreeningStatusCodeReferenceCsvFileIngestSource.assuranceSQL",
          this.govn.emitCtx.sqlEngineNow
        )}

        -- add field validation

        ${await session.entryStateDML(
          sessionEntryID,
          "ATTEMPT_CSV_ASSURANCE",
          "ASSURED_CSV",
          "ScreeningStatusCodeReferenceCsvFileIngestSource.assuranceSQL",
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
          "EXIT(ScreeningStatusCodeReferenceCsvFileIngestSource)",
          "ScreeningStatusCodeReferenceCsvFileIngestSource.exportResourceSQL",
          this.govn.emitCtx.sqlEngineNow
        )}

        CREATE TABLE IF NOT EXISTS ${targetSchema}.${tableName} AS SELECT * FROM ${tableName} WHERE 0=1;
        INSERT INTO ${targetSchema}.${tableName} SELECT * FROM ${tableName};

          ${await session.entryStateDML(
            sessionEntryID,
            "ATTEMPT_CSV_EXPORT",
            SCREENING_STATUS_CODE_TERMINAL_STATE,
            "ScreeningStatusCodeReferenceCsvFileIngestSource.exportResourceSQL",
            this.govn.emitCtx.sqlEngineNow
          )}
          `;
  }
}

const administrativeSexReferenceColumnNames = [
  "ADMINISTRATIVE_SEX_CODE",
  "ADMINISTRATIVE_SEX_CODE_DESCRIPTION",
  "ADMINISTRATIVE_SEX_CODE_SYSTEM",
] as const;

type AdministrativeSexReferenceColumnName =
  (typeof administrativeSexReferenceColumnNames)[number];

const ADMINISTRATIVE_SEX_TERMINAL_STATE =
  "EXIT(AdministrativeSexReferenceCsvFileIngestSource)" as const;

export class AdministrativeSexReferenceStructureRules<
  TableName extends string,
> extends ddbo.DuckDbOrchTableAssuranceRules<
  TableName,
  AdministrativeSexReferenceColumnName
> {
  requiredColumnNames() {
    return this.tableRules.requiredColumnNamesStrict([
      ...administrativeSexReferenceColumnNames,
    ]);
  }
}
export class AdministrativeSexReferenceCsvFileIngestSource<
  TableName extends "administrative_sex_reference",
  InitState extends o.State,
> implements
  o.CsvFileIngestSource<
    TableName,
    ddbo.DuckDbOrchGovernance,
    InitState,
    typeof ADMINISTRATIVE_SEX_TERMINAL_STATE,
    ddbo.DuckDbOrchEmitContext
  > {
  readonly nature = "CSV";
  constructor(
    readonly dataHome: string,
    readonly govn: ddbo.DuckDbOrchGovernance,
    readonly tableName = "administrative_sex_reference" as TableName,
    readonly uri = `${dataHome}/administrative-sex-reference.csv`,
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
      typeof ADMINISTRATIVE_SEX_TERMINAL_STATE,
      ddbo.DuckDbOrchEmitContext
    >["workflow"]
  > {
    const ssr = new AdministrativeSexReferenceStructureRules(
      this.tableName,
      session.sessionID,
      sessionEntryID,
      this.govn,
    );
    const sar = new sg.AdministrativeSexReferenceAssuranceRules(
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
      terminalState: () => ADMINISTRATIVE_SEX_TERMINAL_STATE,
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
    ssr: AdministrativeSexReferenceStructureRules<TableName>,
    sar: sg.AdministrativeSexReferenceAssuranceRules<
      TableName,
      AdministrativeSexReferenceColumnName
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
          "AdministrativeSexReferenceCsvFileIngestSource.ingestSQL",
          this.govn.emitCtx.sqlEngineNow
        )}

        -- be sure to add src_file_row_number and session_id columns to each row
        -- because assurance CTEs require them
        CREATE TABLE ${tableName} AS
          SELECT *, row_number() OVER () as src_file_row_number, '${sessionID}' as session_id, '${sessionEntryID}' as session_entry_id
            FROM read_csv_auto('${uri}',
              header = true
            );

        ${ssr.requiredColumnNames()}

        ${await session.entryStateDML(
          sessionEntryID,
          "ATTEMPT_CSV_INGEST",
          "INGESTED_CSV",
          "AdministrativeSexReferenceCsvFileIngestSource.ingestSQL",
          this.govn.emitCtx.sqlEngineNow
        )}
      `;
  }

  async assuranceSQL(
    session: o.OrchSession<
      ddbo.DuckDbOrchGovernance,
      ddbo.DuckDbOrchEmitContext
    >,
    sar: sg.AdministrativeSexReferenceAssuranceRules<
      TableName,
      AdministrativeSexReferenceColumnName
    >,
  ) {
    const { govn } = this;
    const { sessionEntryID, tableRules: tr } = sar;

    // deno-fmt-ignore
    return govn.SQL`
        ${await session.entryStateDML(
          sessionEntryID,
          "INGESTED_CSV",
          "ATTEMPT_CSV_ASSURANCE",
          "AdministrativeSexReferenceCsvFileIngestSource.assuranceSQL",
          this.govn.emitCtx.sqlEngineNow
        )}

        -- add field validation

        ${await session.entryStateDML(
          sessionEntryID,
          "ATTEMPT_CSV_ASSURANCE",
          "ASSURED_CSV",
          "AdministrativeSexReferenceCsvFileIngestSource.assuranceSQL",
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
          "EXIT(AdministrativeSexReferenceCsvFileIngestSource)",
          "AdministrativeSexReferenceCsvFileIngestSource.exportResourceSQL",
          this.govn.emitCtx.sqlEngineNow
        )}

        CREATE TABLE IF NOT EXISTS ${targetSchema}.${tableName} AS SELECT * FROM ${tableName} WHERE 0=1;
        INSERT INTO ${targetSchema}.${tableName} SELECT * FROM ${tableName};

          ${await session.entryStateDML(
            sessionEntryID,
            "ATTEMPT_CSV_EXPORT",
            ADMINISTRATIVE_SEX_TERMINAL_STATE,
            "AdministrativeSexReferenceCsvFileIngestSource.exportResourceSQL",
            this.govn.emitCtx.sqlEngineNow
          )}
          `;
  }
}

const genderIdentityReferenceColumnNames = [
  "GENDER_IDENTITY_CODE",
  "GENDER_IDENTITY_CODE_DESCRIPTION",
  "GENDER_IDENTITY_CODE_SYSTEM_NAME",
] as const;

type GenderIdentityReferenceColumnName =
  (typeof genderIdentityReferenceColumnNames)[number];

const GENDER_IDENTITY_TERMINAL_STATE =
  "EXIT(GenderIdentityReferenceCsvFileIngestSource)" as const;

export class GenderIdentityReferenceStructureRules<
  TableName extends string,
> extends ddbo.DuckDbOrchTableAssuranceRules<
  TableName,
  GenderIdentityReferenceColumnName
> {
  requiredColumnNames() {
    return this.tableRules.requiredColumnNamesStrict([
      ...genderIdentityReferenceColumnNames,
    ]);
  }
}
export class GenderIdentityReferenceCsvFileIngestSource<
  TableName extends "gender_identity_reference",
  InitState extends o.State,
> implements
  o.CsvFileIngestSource<
    TableName,
    ddbo.DuckDbOrchGovernance,
    InitState,
    typeof GENDER_IDENTITY_TERMINAL_STATE,
    ddbo.DuckDbOrchEmitContext
  > {
  readonly nature = "CSV";
  constructor(
    readonly dataHome: string,
    readonly govn: ddbo.DuckDbOrchGovernance,
    readonly tableName = "gender_identity_reference" as TableName,
    readonly uri = `${dataHome}/gender-identity-reference.csv`,
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
      typeof GENDER_IDENTITY_TERMINAL_STATE,
      ddbo.DuckDbOrchEmitContext
    >["workflow"]
  > {
    const ssr = new GenderIdentityReferenceStructureRules(
      this.tableName,
      session.sessionID,
      sessionEntryID,
      this.govn,
    );
    const sar = new sg.GenderIdentityReferenceAssuranceRules(
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
      terminalState: () => GENDER_IDENTITY_TERMINAL_STATE,
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
    ssr: GenderIdentityReferenceStructureRules<TableName>,
    sar: sg.GenderIdentityReferenceAssuranceRules<
      TableName,
      GenderIdentityReferenceColumnName
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
          "GenderIdentityReferenceCsvFileIngestSource.ingestSQL",
          this.govn.emitCtx.sqlEngineNow
        )}

        -- be sure to add src_file_row_number and session_id columns to each row
        -- because assurance CTEs require them
        CREATE TABLE ${tableName} AS
          SELECT *, row_number() OVER () as src_file_row_number, '${sessionID}' as session_id, '${sessionEntryID}' as session_entry_id
            FROM read_csv_auto('${uri}',
              header = true
            );

        ${ssr.requiredColumnNames()}

        ${await session.entryStateDML(
          sessionEntryID,
          "ATTEMPT_CSV_INGEST",
          "INGESTED_CSV",
          "GenderIdentityReferenceCsvFileIngestSource.ingestSQL",
          this.govn.emitCtx.sqlEngineNow
        )}
      `;
  }

  async assuranceSQL(
    session: o.OrchSession<
      ddbo.DuckDbOrchGovernance,
      ddbo.DuckDbOrchEmitContext
    >,
    sar: sg.GenderIdentityReferenceAssuranceRules<
      TableName,
      GenderIdentityReferenceColumnName
    >,
  ) {
    const { govn } = this;
    const { sessionEntryID, tableRules: tr } = sar;

    // deno-fmt-ignore
    return govn.SQL`
        ${await session.entryStateDML(
          sessionEntryID,
          "INGESTED_CSV",
          "ATTEMPT_CSV_ASSURANCE",
          "GenderIdentityReferenceCsvFileIngestSource.assuranceSQL",
          this.govn.emitCtx.sqlEngineNow
        )}

        -- add field validation

        ${await session.entryStateDML(
          sessionEntryID,
          "ATTEMPT_CSV_ASSURANCE",
          "ASSURED_CSV",
          "GenderIdentityReferenceCsvFileIngestSource.assuranceSQL",
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
          "EXIT(GenderIdentityReferenceCsvFileIngestSource)",
          "GenderIdentityReferenceCsvFileIngestSource.exportResourceSQL",
          this.govn.emitCtx.sqlEngineNow
        )}

        CREATE TABLE IF NOT EXISTS ${targetSchema}.${tableName} AS SELECT * FROM ${tableName} WHERE 0=1;
        INSERT INTO ${targetSchema}.${tableName} SELECT * FROM ${tableName};

          ${await session.entryStateDML(
            sessionEntryID,
            "ATTEMPT_CSV_EXPORT",
            GENDER_IDENTITY_TERMINAL_STATE,
            "GenderIdentityReferenceCsvFileIngestSource.exportResourceSQL",
            this.govn.emitCtx.sqlEngineNow
          )}
          `;
  }
}

const sexAtBirthReferenceColumnNames = [
  "SEX_AT_BIRTH_CODE",
  "SEX_AT_BIRTH_CODE_DESCRIPTION",
  "SEX_AT_BIRTH_CODE_SYSTEM",
] as const;

type SexAtBirthReferenceColumnName =
  (typeof sexAtBirthReferenceColumnNames)[number];

const SEX_AT_BIRTH_TERMINAL_STATE =
  "EXIT(SexAtBirthReferenceCsvFileIngestSource)" as const;

export class SexAtBirthReferenceStructureRules<
  TableName extends string,
> extends ddbo.DuckDbOrchTableAssuranceRules<
  TableName,
  SexAtBirthReferenceColumnName
> {
  requiredColumnNames() {
    return this.tableRules.requiredColumnNamesStrict([
      ...sexAtBirthReferenceColumnNames,
    ]);
  }
}
export class SexAtBirthReferenceCsvFileIngestSource<
  TableName extends "sex_at_birth_reference",
  InitState extends o.State,
> implements
  o.CsvFileIngestSource<
    TableName,
    ddbo.DuckDbOrchGovernance,
    InitState,
    typeof SEX_AT_BIRTH_TERMINAL_STATE,
    ddbo.DuckDbOrchEmitContext
  > {
  readonly nature = "CSV";
  constructor(
    readonly dataHome: string,
    readonly govn: ddbo.DuckDbOrchGovernance,
    readonly tableName = "sex_at_birth_reference" as TableName,
    readonly uri = `${dataHome}/sex-at-birth-reference.csv`,
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
      typeof SEX_AT_BIRTH_TERMINAL_STATE,
      ddbo.DuckDbOrchEmitContext
    >["workflow"]
  > {
    const ssr = new SexAtBirthReferenceStructureRules(
      this.tableName,
      session.sessionID,
      sessionEntryID,
      this.govn,
    );
    const sar = new sg.SexAtBirthReferenceAssuranceRules(
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
      terminalState: () => SEX_AT_BIRTH_TERMINAL_STATE,
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
    ssr: SexAtBirthReferenceStructureRules<TableName>,
    sar: sg.SexAtBirthReferenceAssuranceRules<
      TableName,
      SexAtBirthReferenceColumnName
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
          "SexAtBirthReferenceCsvFileIngestSource.ingestSQL",
          this.govn.emitCtx.sqlEngineNow
        )}

        -- be sure to add src_file_row_number and session_id columns to each row
        -- because assurance CTEs require them
        CREATE TABLE ${tableName} AS
          SELECT *, row_number() OVER () as src_file_row_number, '${sessionID}' as session_id, '${sessionEntryID}' as session_entry_id
            FROM read_csv_auto('${uri}',
              header = true
            );

        ${ssr.requiredColumnNames()}

        ${await session.entryStateDML(
          sessionEntryID,
          "ATTEMPT_CSV_INGEST",
          "INGESTED_CSV",
          "SexAtBirthReferenceCsvFileIngestSource.ingestSQL",
          this.govn.emitCtx.sqlEngineNow
        )}
      `;
  }

  async assuranceSQL(
    session: o.OrchSession<
      ddbo.DuckDbOrchGovernance,
      ddbo.DuckDbOrchEmitContext
    >,
    sar: sg.SexAtBirthReferenceAssuranceRules<
      TableName,
      SexAtBirthReferenceColumnName
    >,
  ) {
    const { govn } = this;
    const { sessionEntryID, tableRules: tr } = sar;

    // deno-fmt-ignore
    return govn.SQL`
        ${await session.entryStateDML(
          sessionEntryID,
          "INGESTED_CSV",
          "ATTEMPT_CSV_ASSURANCE",
          "SexAtBirthReferenceCsvFileIngestSource.assuranceSQL",
          this.govn.emitCtx.sqlEngineNow
        )}

        -- add field validation

        ${await session.entryStateDML(
          sessionEntryID,
          "ATTEMPT_CSV_ASSURANCE",
          "ASSURED_CSV",
          "SexAtBirthReferenceCsvFileIngestSource.assuranceSQL",
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
          "EXIT(SexAtBirthReferenceCsvFileIngestSource)",
          "SexAtBirthReferenceCsvFileIngestSource.exportResourceSQL",
          this.govn.emitCtx.sqlEngineNow
        )}

        CREATE TABLE IF NOT EXISTS ${targetSchema}.${tableName} AS SELECT * FROM ${tableName} WHERE 0=1;
        INSERT INTO ${targetSchema}.${tableName} SELECT * FROM ${tableName};

          ${await session.entryStateDML(
            sessionEntryID,
            "ATTEMPT_CSV_EXPORT",
            SEX_AT_BIRTH_TERMINAL_STATE,
            "SexAtBirthReferenceCsvFileIngestSource.exportResourceSQL",
            this.govn.emitCtx.sqlEngineNow
          )}
          `;
  }
}

const sexualOrientationReferenceColumnNames = [
  "SEXUAL_ORIENTATION_CODE",
  "SEXUAL_ORIENTATION_CODE_DESCRIPTION",
  "SEXUAL_ORIENTATION_CODE_SYSTEM_NAME",
] as const;

type SexualOrientationReferenceColumnName =
  (typeof sexualOrientationReferenceColumnNames)[number];

const SEXUAL_ORIENTATION_TERMINAL_STATE =
  "EXIT(SexualOrientationReferenceCsvFileIngestSource)" as const;

export class SexualOrientationReferenceStructureRules<
  TableName extends string,
> extends ddbo.DuckDbOrchTableAssuranceRules<
  TableName,
  SexualOrientationReferenceColumnName
> {
  requiredColumnNames() {
    return this.tableRules.requiredColumnNamesStrict([
      ...sexualOrientationReferenceColumnNames,
    ]);
  }
}
export class SexualOrientationReferenceCsvFileIngestSource<
  TableName extends "sexual_orientation_reference",
  InitState extends o.State,
> implements
  o.CsvFileIngestSource<
    TableName,
    ddbo.DuckDbOrchGovernance,
    InitState,
    typeof SEXUAL_ORIENTATION_TERMINAL_STATE,
    ddbo.DuckDbOrchEmitContext
  > {
  readonly nature = "CSV";
  constructor(
    readonly dataHome: string,
    readonly govn: ddbo.DuckDbOrchGovernance,
    readonly tableName = "sexual_orientation_reference" as TableName,
    readonly uri = `${dataHome}/sexual-orientation-reference.csv`,
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
      typeof SEXUAL_ORIENTATION_TERMINAL_STATE,
      ddbo.DuckDbOrchEmitContext
    >["workflow"]
  > {
    const ssr = new SexualOrientationReferenceStructureRules(
      this.tableName,
      session.sessionID,
      sessionEntryID,
      this.govn,
    );
    const sar = new sg.SexualOrientationReferenceAssuranceRules(
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
      terminalState: () => SEXUAL_ORIENTATION_TERMINAL_STATE,
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
    ssr: SexualOrientationReferenceStructureRules<TableName>,
    sar: sg.SexualOrientationReferenceAssuranceRules<
      TableName,
      SexualOrientationReferenceColumnName
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
          "SexualOrientationReferenceCsvFileIngestSource.ingestSQL",
          this.govn.emitCtx.sqlEngineNow
        )}

        -- be sure to add src_file_row_number and session_id columns to each row
        -- because assurance CTEs require them
        CREATE TABLE ${tableName} AS
          SELECT *, row_number() OVER () as src_file_row_number, '${sessionID}' as session_id, '${sessionEntryID}' as session_entry_id
            FROM read_csv_auto('${uri}',
              header = true
            );

        ${ssr.requiredColumnNames()}

        ${await session.entryStateDML(
          sessionEntryID,
          "ATTEMPT_CSV_INGEST",
          "INGESTED_CSV",
          "SexualOrientationReferenceCsvFileIngestSource.ingestSQL",
          this.govn.emitCtx.sqlEngineNow
        )}
      `;
  }

  async assuranceSQL(
    session: o.OrchSession<
      ddbo.DuckDbOrchGovernance,
      ddbo.DuckDbOrchEmitContext
    >,
    sar: sg.SexualOrientationReferenceAssuranceRules<
      TableName,
      SexualOrientationReferenceColumnName
    >,
  ) {
    const { govn } = this;
    const { sessionEntryID, tableRules: tr } = sar;

    // deno-fmt-ignore
    return govn.SQL`
        ${await session.entryStateDML(
          sessionEntryID,
          "INGESTED_CSV",
          "ATTEMPT_CSV_ASSURANCE",
          "SexualOrientationReferenceCsvFileIngestSource.assuranceSQL",
          this.govn.emitCtx.sqlEngineNow
        )}

        -- add field validation

        ${await session.entryStateDML(
          sessionEntryID,
          "ATTEMPT_CSV_ASSURANCE",
          "ASSURED_CSV",
          "SexualOrientationReferenceCsvFileIngestSource.assuranceSQL",
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
          "EXIT(SexualOrientationReferenceCsvFileIngestSource)",
          "SexualOrientationReferenceCsvFileIngestSource.exportResourceSQL",
          this.govn.emitCtx.sqlEngineNow
        )}

        CREATE TABLE IF NOT EXISTS ${targetSchema}.${tableName} AS SELECT * FROM ${tableName} WHERE 0=1;
        INSERT INTO ${targetSchema}.${tableName} SELECT * FROM ${tableName};

          ${await session.entryStateDML(
            sessionEntryID,
            "ATTEMPT_CSV_EXPORT",
            SEXUAL_ORIENTATION_TERMINAL_STATE,
            "SexualOrientationReferenceCsvFileIngestSource.exportResourceSQL",
            this.govn.emitCtx.sqlEngineNow
          )}
          `;
  }
}

const businessRulesReferenceColumnNames = [
  "Worksheet",
  "Field",
  "Required",
  "Permissible Values",
  "True Rejection",
  "Warning Layer",
  "Resolved by QE/QCS",
] as const;

type BusinessRulesReferenceColumnName =
  (typeof businessRulesReferenceColumnNames)[number];

const BUSINESS_RULES_TERMINAL_STATE =
  "EXIT(BusinessRulesReferenceCsvFileIngestSource)" as const;

export class BusinessRulesReferenceStructureRules<
  TableName extends string,
> extends ddbo.DuckDbOrchTableAssuranceRules<
  TableName,
  BusinessRulesReferenceColumnName
> {
  requiredColumnNames() {
    return this.tableRules.requiredColumnNamesStrict([
      ...businessRulesReferenceColumnNames,
    ]);
  }
}
export class BusinessRulesReferenceCsvFileIngestSource<
  TableName extends "business_rules",
  InitState extends o.State,
> implements
  o.CsvFileIngestSource<
    TableName,
    ddbo.DuckDbOrchGovernance,
    InitState,
    typeof BUSINESS_RULES_TERMINAL_STATE,
    ddbo.DuckDbOrchEmitContext
  > {
  readonly nature = "CSV";
  constructor(
    readonly dataHome: string,
    readonly govn: ddbo.DuckDbOrchGovernance,
    readonly tableName = "business_rules" as TableName,
    readonly uri = `${dataHome}/business-rules.csv`,
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
      typeof BUSINESS_RULES_TERMINAL_STATE,
      ddbo.DuckDbOrchEmitContext
    >["workflow"]
  > {
    const ssr = new BusinessRulesReferenceStructureRules(
      this.tableName,
      session.sessionID,
      sessionEntryID,
      this.govn,
    );
    const sar = new sg.BusinessRulesReferenceAssuranceRules(
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
      terminalState: () => BUSINESS_RULES_TERMINAL_STATE,
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
    ssr: BusinessRulesReferenceStructureRules<TableName>,
    sar: sg.BusinessRulesReferenceAssuranceRules<
      TableName,
      BusinessRulesReferenceColumnName
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
          "BusinessRulesReferenceCsvFileIngestSource.ingestSQL",
          this.govn.emitCtx.sqlEngineNow
        )}

        -- be sure to add src_file_row_number and session_id columns to each row
        -- because assurance CTEs require them
        CREATE TABLE ${tableName} AS
          SELECT *, row_number() OVER () as src_file_row_number, '${sessionID}' as session_id, '${sessionEntryID}' as session_entry_id
            FROM read_csv_auto('${uri}',
              header = true
            );

        ${ssr.requiredColumnNames()}

        ${await session.entryStateDML(
          sessionEntryID,
          "ATTEMPT_CSV_INGEST",
          "INGESTED_CSV",
          "BusinessRulesReferenceCsvFileIngestSource.ingestSQL",
          this.govn.emitCtx.sqlEngineNow
        )}
      `;
  }

  async assuranceSQL(
    session: o.OrchSession<
      ddbo.DuckDbOrchGovernance,
      ddbo.DuckDbOrchEmitContext
    >,
    sar: sg.BusinessRulesReferenceAssuranceRules<
      TableName,
      BusinessRulesReferenceColumnName
    >,
  ) {
    const { govn } = this;
    const { sessionEntryID, tableRules: tr } = sar;

    // deno-fmt-ignore
    return govn.SQL`
        ${await session.entryStateDML(
          sessionEntryID,
          "INGESTED_CSV",
          "ATTEMPT_CSV_ASSURANCE",
          "BusinessRulesReferenceCsvFileIngestSource.assuranceSQL",
          this.govn.emitCtx.sqlEngineNow
        )}

        -- add field validation

        ${await session.entryStateDML(
          sessionEntryID,
          "ATTEMPT_CSV_ASSURANCE",
          "ASSURED_CSV",
          "BusinessRulesReferenceCsvFileIngestSource.assuranceSQL",
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
          "EXIT(BusinessRulesReferenceCsvFileIngestSource)",
          "BusinessRulesReferenceCsvFileIngestSource.exportResourceSQL",
          this.govn.emitCtx.sqlEngineNow
        )}

        CREATE TABLE IF NOT EXISTS ${targetSchema}.${tableName} AS SELECT * FROM ${tableName} WHERE 0=1;
        INSERT INTO ${targetSchema}.${tableName} SELECT * FROM ${tableName};

          ${await session.entryStateDML(
            sessionEntryID,
            "ATTEMPT_CSV_EXPORT",
            BUSINESS_RULES_TERMINAL_STATE,
            "BusinessRulesReferenceCsvFileIngestSource.exportResourceSQL",
            this.govn.emitCtx.sqlEngineNow
          )}
          `;
  }
}

const raceReferenceColumnNames = [
  "Concept Name",
  "Concept Code",
  "Hierarchical Code",
  "Race Category (Concept Name)",
  "Race Category (Concept Code)",
  "Hiearchical Code",
] as const;

type RaceReferenceColumnName = (typeof raceReferenceColumnNames)[number];

const RACE_TERMINAL_STATE = "EXIT(RaceReferenceCsvFileIngestSource)" as const;

export class RaceReferenceStructureRules<
  TableName extends string,
> extends ddbo.DuckDbOrchTableAssuranceRules<
  TableName,
  RaceReferenceColumnName
> {
  requiredColumnNames() {
    return this.tableRules.requiredColumnNamesStrict([
      ...raceReferenceColumnNames,
    ]);
  }
}
export class RaceReferenceCsvFileIngestSource<
  TableName extends "race_reference",
  InitState extends o.State,
> implements
  o.CsvFileIngestSource<
    TableName,
    ddbo.DuckDbOrchGovernance,
    InitState,
    typeof RACE_TERMINAL_STATE,
    ddbo.DuckDbOrchEmitContext
  > {
  readonly nature = "CSV";
  constructor(
    readonly dataHome: string,
    readonly govn: ddbo.DuckDbOrchGovernance,
    readonly tableName = "race_reference" as TableName,
    readonly uri = `${dataHome}/race-reference.csv`,
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
      typeof RACE_TERMINAL_STATE,
      ddbo.DuckDbOrchEmitContext
    >["workflow"]
  > {
    const ssr = new RaceReferenceStructureRules(
      this.tableName,
      session.sessionID,
      sessionEntryID,
      this.govn,
    );
    const sar = new sg.RaceReferenceAssuranceRules(
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
      terminalState: () => RACE_TERMINAL_STATE,
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
    ssr: RaceReferenceStructureRules<TableName>,
    sar: sg.RaceReferenceAssuranceRules<
      TableName,
      RaceReferenceColumnName
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
          "RaceReferenceCsvFileIngestSource.ingestSQL",
          this.govn.emitCtx.sqlEngineNow
        )}

        -- be sure to add src_file_row_number and session_id columns to each row
        -- because assurance CTEs require them
        CREATE TABLE ${tableName} AS
          SELECT *, row_number() OVER () as src_file_row_number, '${sessionID}' as session_id, '${sessionEntryID}' as session_entry_id
            FROM read_csv_auto('${uri}',
              header = true
            );

        ${ssr.requiredColumnNames()}

        ${await session.entryStateDML(
          sessionEntryID,
          "ATTEMPT_CSV_INGEST",
          "INGESTED_CSV",
          "RaceReferenceCsvFileIngestSource.ingestSQL",
          this.govn.emitCtx.sqlEngineNow
        )}
      `;
  }

  async assuranceSQL(
    session: o.OrchSession<
      ddbo.DuckDbOrchGovernance,
      ddbo.DuckDbOrchEmitContext
    >,
    sar: sg.RaceReferenceAssuranceRules<
      TableName,
      RaceReferenceColumnName
    >,
  ) {
    const { govn } = this;
    const { sessionEntryID, tableRules: tr } = sar;

    // deno-fmt-ignore
    return govn.SQL`
        ${await session.entryStateDML(
          sessionEntryID,
          "INGESTED_CSV",
          "ATTEMPT_CSV_ASSURANCE",
          "RaceReferenceCsvFileIngestSource.assuranceSQL",
          this.govn.emitCtx.sqlEngineNow
        )}

        -- add field validation

        ${await session.entryStateDML(
          sessionEntryID,
          "ATTEMPT_CSV_ASSURANCE",
          "ASSURED_CSV",
          "RaceReferenceCsvFileIngestSource.assuranceSQL",
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
          "EXIT(RaceReferenceCsvFileIngestSource)",
          "RaceReferenceCsvFileIngestSource.exportResourceSQL",
          this.govn.emitCtx.sqlEngineNow
        )}

        CREATE TABLE IF NOT EXISTS ${targetSchema}.${tableName} AS SELECT * FROM ${tableName} WHERE 0=1;
        INSERT INTO ${targetSchema}.${tableName} SELECT * FROM ${tableName};

          ${await session.entryStateDML(
            sessionEntryID,
            "ATTEMPT_CSV_EXPORT",
            RACE_TERMINAL_STATE,
            "RaceReferenceCsvFileIngestSource.exportResourceSQL",
            this.govn.emitCtx.sqlEngineNow
          )}
          `;
  }
}

const ethnicityReferenceColumnNames = [
  "Concept Code",
  "Concept Name",
  "Hierarchical Code",
  "Ethnicity Group (Concept Name)",
  "Ethnicity Group (Concept Code)",
] as const;

type EthnicityReferenceColumnName =
  (typeof ethnicityReferenceColumnNames)[number];

const ETHNICITY_TERMINAL_STATE =
  "EXIT(EthnicityReferenceCsvFileIngestSource)" as const;

export class EthnicityReferenceStructureRules<
  TableName extends string,
> extends ddbo.DuckDbOrchTableAssuranceRules<
  TableName,
  EthnicityReferenceColumnName
> {
  requiredColumnNames() {
    return this.tableRules.requiredColumnNamesStrict([
      ...ethnicityReferenceColumnNames,
    ]);
  }
}
export class EthnicityReferenceCsvFileIngestSource<
  TableName extends "ethnicity_reference",
  InitState extends o.State,
> implements
  o.CsvFileIngestSource<
    TableName,
    ddbo.DuckDbOrchGovernance,
    InitState,
    typeof ETHNICITY_TERMINAL_STATE,
    ddbo.DuckDbOrchEmitContext
  > {
  readonly nature = "CSV";
  constructor(
    readonly dataHome: string,
    readonly govn: ddbo.DuckDbOrchGovernance,
    readonly tableName = "ethnicity_reference" as TableName,
    readonly uri = `${dataHome}/ethnicity-reference.csv`,
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
      typeof ETHNICITY_TERMINAL_STATE,
      ddbo.DuckDbOrchEmitContext
    >["workflow"]
  > {
    const ssr = new EthnicityReferenceStructureRules(
      this.tableName,
      session.sessionID,
      sessionEntryID,
      this.govn,
    );
    const sar = new sg.EthnicityReferenceAssuranceRules(
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
      terminalState: () => ETHNICITY_TERMINAL_STATE,
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
    ssr: EthnicityReferenceStructureRules<TableName>,
    sar: sg.EthnicityReferenceAssuranceRules<
      TableName,
      EthnicityReferenceColumnName
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
          "EthnicityReferenceCsvFileIngestSource.ingestSQL",
          this.govn.emitCtx.sqlEngineNow
        )}

        -- be sure to add src_file_row_number and session_id columns to each row
        -- because assurance CTEs require them
        CREATE TABLE ${tableName} AS
          SELECT *, row_number() OVER () as src_file_row_number, '${sessionID}' as session_id, '${sessionEntryID}' as session_entry_id
            FROM read_csv_auto('${uri}',
              header = true
            );

        ${ssr.requiredColumnNames()}

        ${await session.entryStateDML(
          sessionEntryID,
          "ATTEMPT_CSV_INGEST",
          "INGESTED_CSV",
          "EthnicityReferenceCsvFileIngestSource.ingestSQL",
          this.govn.emitCtx.sqlEngineNow
        )}
      `;
  }

  async assuranceSQL(
    session: o.OrchSession<
      ddbo.DuckDbOrchGovernance,
      ddbo.DuckDbOrchEmitContext
    >,
    sar: sg.EthnicityReferenceAssuranceRules<
      TableName,
      EthnicityReferenceColumnName
    >,
  ) {
    const { govn } = this;
    const { sessionEntryID, tableRules: tr } = sar;

    // deno-fmt-ignore
    return govn.SQL`
        ${await session.entryStateDML(
          sessionEntryID,
          "INGESTED_CSV",
          "ATTEMPT_CSV_ASSURANCE",
          "EthnicityReferenceCsvFileIngestSource.assuranceSQL",
          this.govn.emitCtx.sqlEngineNow
        )}

        -- add field validation

        ${await session.entryStateDML(
          sessionEntryID,
          "ATTEMPT_CSV_ASSURANCE",
          "ASSURED_CSV",
          "EthnicityReferenceCsvFileIngestSource.assuranceSQL",
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
          "EXIT(EthnicityReferenceCsvFileIngestSource)",
          "EthnicityReferenceCsvFileIngestSource.exportResourceSQL",
          this.govn.emitCtx.sqlEngineNow
        )}

        CREATE TABLE IF NOT EXISTS ${targetSchema}.${tableName} AS SELECT * FROM ${tableName} WHERE 0=1;
        INSERT INTO ${targetSchema}.${tableName} SELECT * FROM ${tableName};

          ${await session.entryStateDML(
            sessionEntryID,
            "ATTEMPT_CSV_EXPORT",
            ETHNICITY_TERMINAL_STATE,
            "EthnicityReferenceCsvFileIngestSource.exportResourceSQL",
            this.govn.emitCtx.sqlEngineNow
          )}
          `;
  }
}

const preferredLanguageReferenceColumnNames = [
  "ISO 639-2 Code",
  "ISO 639-1 Code",
  "English name of Language",
  "French name of Language",
  "German name of Language",
] as const;

type PreferredLanguageReferenceColumnName =
  (typeof preferredLanguageReferenceColumnNames)[number];

const PREFERED_LANGUAGE_TERMINAL_STATE =
  "EXIT(PreferredLanguageReferenceCsvFileIngestSource)" as const;

export class PreferredLanguageReferenceStructureRules<
  TableName extends string,
> extends ddbo.DuckDbOrchTableAssuranceRules<
  TableName,
  PreferredLanguageReferenceColumnName
> {
  requiredColumnNames() {
    return this.tableRules.requiredColumnNamesStrict([
      ...preferredLanguageReferenceColumnNames,
    ]);
  }
}
export class PreferredLanguageReferenceCsvFileIngestSource<
  TableName extends "preferred_language_reference",
  InitState extends o.State,
> implements
  o.CsvFileIngestSource<
    TableName,
    ddbo.DuckDbOrchGovernance,
    InitState,
    typeof PREFERED_LANGUAGE_TERMINAL_STATE,
    ddbo.DuckDbOrchEmitContext
  > {
  readonly nature = "CSV";
  constructor(
    readonly dataHome: string,
    readonly govn: ddbo.DuckDbOrchGovernance,
    readonly tableName = "preferred_language_reference" as TableName,
    readonly uri = `${dataHome}/preferred-language-reference.csv`,
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
      typeof PREFERED_LANGUAGE_TERMINAL_STATE,
      ddbo.DuckDbOrchEmitContext
    >["workflow"]
  > {
    const ssr = new PreferredLanguageReferenceStructureRules(
      this.tableName,
      session.sessionID,
      sessionEntryID,
      this.govn,
    );
    const sar = new sg.PreferredLanguageReferenceAssuranceRules(
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
      terminalState: () => PREFERED_LANGUAGE_TERMINAL_STATE,
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
    ssr: PreferredLanguageReferenceStructureRules<TableName>,
    sar: sg.PreferredLanguageReferenceAssuranceRules<
      TableName,
      PreferredLanguageReferenceColumnName
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
          "PreferredLanguageReferenceCsvFileIngestSource.ingestSQL",
          this.govn.emitCtx.sqlEngineNow
        )}

        -- be sure to add src_file_row_number and session_id columns to each row
        -- because assurance CTEs require them
        CREATE TABLE ${tableName} AS
          SELECT *, row_number() OVER () as src_file_row_number, '${sessionID}' as session_id, '${sessionEntryID}' as session_entry_id
            FROM read_csv_auto('${uri}',
              header = true
            );

        ${ssr.requiredColumnNames()}

        ${await session.entryStateDML(
          sessionEntryID,
          "ATTEMPT_CSV_INGEST",
          "INGESTED_CSV",
          "PreferredLanguageReferenceCsvFileIngestSource.ingestSQL",
          this.govn.emitCtx.sqlEngineNow
        )}
      `;
  }

  async assuranceSQL(
    session: o.OrchSession<
      ddbo.DuckDbOrchGovernance,
      ddbo.DuckDbOrchEmitContext
    >,
    sar: sg.PreferredLanguageReferenceAssuranceRules<
      TableName,
      PreferredLanguageReferenceColumnName
    >,
  ) {
    const { govn } = this;
    const { sessionEntryID, tableRules: tr } = sar;

    // deno-fmt-ignore
    return govn.SQL`
        ${await session.entryStateDML(
          sessionEntryID,
          "INGESTED_CSV",
          "ATTEMPT_CSV_ASSURANCE",
          "PreferredLanguageReferenceCsvFileIngestSource.assuranceSQL",
          this.govn.emitCtx.sqlEngineNow
        )}

        -- add field validation

        ${await session.entryStateDML(
          sessionEntryID,
          "ATTEMPT_CSV_ASSURANCE",
          "ASSURED_CSV",
          "PreferredLanguageReferenceCsvFileIngestSource.assuranceSQL",
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
          "EXIT(PreferredLanguageReferenceCsvFileIngestSource)",
          "PreferredLanguageReferenceCsvFileIngestSource.exportResourceSQL",
          this.govn.emitCtx.sqlEngineNow
        )}

        CREATE TABLE IF NOT EXISTS ${targetSchema}.${tableName} AS SELECT * FROM ${tableName} WHERE 0=1;
        INSERT INTO ${targetSchema}.${tableName} SELECT * FROM ${tableName};

          ${await session.entryStateDML(
            sessionEntryID,
            "ATTEMPT_CSV_EXPORT",
            PREFERED_LANGUAGE_TERMINAL_STATE,
            "PreferredLanguageReferenceCsvFileIngestSource.exportResourceSQL",
            this.govn.emitCtx.sqlEngineNow
          )}
          `;
  }
}

const sdohDomainReferenceColumnNames = [
  "Code",
  "Display",
  "Definition",
] as const;

type SdohDomainReferenceColumnName =
  (typeof sdohDomainReferenceColumnNames)[number];

const SDOH_DOMAIN_TERMINAL_STATE =
  "EXIT(SdohDomainReferenceCsvFileIngestSource)" as const;

export class SdohDomainReferenceStructureRules<
  TableName extends string,
> extends ddbo.DuckDbOrchTableAssuranceRules<
  TableName,
  SdohDomainReferenceColumnName
> {
  requiredColumnNames() {
    return this.tableRules.requiredColumnNamesStrict([
      ...sdohDomainReferenceColumnNames,
    ]);
  }
}
export class SdohDomainReferenceCsvFileIngestSource<
  TableName extends "sdoh_domain_reference",
  InitState extends o.State,
> implements
  o.CsvFileIngestSource<
    TableName,
    ddbo.DuckDbOrchGovernance,
    InitState,
    typeof SDOH_DOMAIN_TERMINAL_STATE,
    ddbo.DuckDbOrchEmitContext
  > {
  readonly nature = "CSV";
  constructor(
    readonly dataHome: string,
    readonly govn: ddbo.DuckDbOrchGovernance,
    readonly tableName = "sdoh_domain_reference" as TableName,
    readonly uri = `${dataHome}/sdoh-domain-reference.csv`,
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
      typeof SDOH_DOMAIN_TERMINAL_STATE,
      ddbo.DuckDbOrchEmitContext
    >["workflow"]
  > {
    const ssr = new SdohDomainReferenceStructureRules(
      this.tableName,
      session.sessionID,
      sessionEntryID,
      this.govn,
    );
    const sar = new sg.SdohDomainReferenceAssuranceRules(
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
      terminalState: () => SDOH_DOMAIN_TERMINAL_STATE,
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
    ssr: SdohDomainReferenceStructureRules<TableName>,
    sar: sg.SdohDomainReferenceAssuranceRules<
      TableName,
      SdohDomainReferenceColumnName
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
          "SdohDomainReferenceCsvFileIngestSource.ingestSQL",
          this.govn.emitCtx.sqlEngineNow
        )}

        -- be sure to add src_file_row_number and session_id columns to each row
        -- because assurance CTEs require them
        CREATE TABLE ${tableName} AS
          SELECT *, row_number() OVER () as src_file_row_number, '${sessionID}' as session_id, '${sessionEntryID}' as session_entry_id
            FROM read_csv_auto('${uri}',
              header = true
            );

        ${ssr.requiredColumnNames()}

        ${await session.entryStateDML(
          sessionEntryID,
          "ATTEMPT_CSV_INGEST",
          "INGESTED_CSV",
          "SdohDomainReferenceCsvFileIngestSource.ingestSQL",
          this.govn.emitCtx.sqlEngineNow
        )}
      `;
  }

  async assuranceSQL(
    session: o.OrchSession<
      ddbo.DuckDbOrchGovernance,
      ddbo.DuckDbOrchEmitContext
    >,
    sar: sg.SdohDomainReferenceAssuranceRules<
      TableName,
      SdohDomainReferenceColumnName
    >,
  ) {
    const { govn } = this;
    const { sessionEntryID, tableRules: tr } = sar;

    // deno-fmt-ignore
    return govn.SQL`
        ${await session.entryStateDML(
          sessionEntryID,
          "INGESTED_CSV",
          "ATTEMPT_CSV_ASSURANCE",
          "SdohDomainReferenceCsvFileIngestSource.assuranceSQL",
          this.govn.emitCtx.sqlEngineNow
        )}

        -- add field validation

        ${await session.entryStateDML(
          sessionEntryID,
          "ATTEMPT_CSV_ASSURANCE",
          "ASSURED_CSV",
          "SdohDomainReferenceCsvFileIngestSource.assuranceSQL",
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
          "EXIT(SdohDomainReferenceCsvFileIngestSource)",
          "SdohDomainReferenceCsvFileIngestSource.exportResourceSQL",
          this.govn.emitCtx.sqlEngineNow
        )}

        CREATE TABLE IF NOT EXISTS ${targetSchema}.${tableName} AS SELECT * FROM ${tableName} WHERE 0=1;
        INSERT INTO ${targetSchema}.${tableName} SELECT * FROM ${tableName};

          ${await session.entryStateDML(
            sessionEntryID,
            "ATTEMPT_CSV_EXPORT",
            SDOH_DOMAIN_TERMINAL_STATE,
            "SdohDomainReferenceCsvFileIngestSource.exportResourceSQL",
            this.govn.emitCtx.sqlEngineNow
          )}
          `;
  }
}
