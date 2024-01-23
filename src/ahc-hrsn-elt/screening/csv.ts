import { fs, path, SQLa_orch as o, SQLa_orch_duckdb as ddbo } from "./deps.ts";
import * as sg from "./governance.ts";

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
  ) {
  }

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
    const sar = new sg.ScreeningAssuranceRules(
      this.tableName,
      sessionDML.sessionID,
      sessionEntryID,
      this.govn,
    );

    return {
      ingestSQL: async (issac) => await this.ingestSQL(session, issac, sar),
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
    sar: sg.ScreeningAssuranceRules<TableName>,
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

      ${sar.requiredColumnNames()}
      
      ${await session.entryStateDML(sessionEntryID, "ATTEMPT_CSV_INGEST", "INGESTED_CSV", "ScreeningCsvFileIngestSource.ingestSQL", this.govn.emitCtx.sqlEngineNow)}
      `
  }

  async assuranceSQL(
    session: o.OrchSession<
      ddbo.DuckDbOrchGovernance,
      ddbo.DuckDbOrchEmitContext
    >,
    sar: sg.ScreeningAssuranceRules<TableName>,
  ) {
    const { govn } = this;
    const { sessionEntryID } = sar;

    // deno-fmt-ignore
    return govn.SQL`
      ${await session.entryStateDML(sessionEntryID, "INGESTED_CSV", "ATTEMPT_CSV_ASSURANCE", "ScreeningCsvFileIngestSource.assuranceSQL", this.govn.emitCtx.sqlEngineNow)}

      ${sar.tableRules.intValueInAllRows('SURVEY_ID')}

      ${await session.entryStateDML(sessionEntryID, "ATTEMPT_CSV_ASSURANCE", "ASSURED_CSV", "ScreeningCsvFileIngestSource.assuranceSQL", this.govn.emitCtx.sqlEngineNow)}
    `
  }

  async exportResourceSQL(
    session: o.OrchSession<
      ddbo.DuckDbOrchGovernance,
      ddbo.DuckDbOrchEmitContext
    >,
    sessionEntryID: string,
    targetSchema: string,
  ) {
    const { govn: { SQL }, tableName } = this;

    // deno-fmt-ignore
    return SQL`
      ${await session.entryStateDML(sessionEntryID, "ASSURED_CSV", "ATTEMPT_CSV_EXPORT", "ScreeningCsvFileIngestSource.exportResourceSQL", this.govn.emitCtx.sqlEngineNow)}
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
        
        ${await session.entryStateDML(sessionEntryID, "ATTEMPT_CSV_EXPORT", "CSV_EXPORTED", "ScreeningCsvFileIngestSource.exportResourceSQL", this.govn.emitCtx.sqlEngineNow)}
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
