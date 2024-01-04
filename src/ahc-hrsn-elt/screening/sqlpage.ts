import {
  chainNB,
  SQLa_ingest_duckdb as ddbi,
  SQLa_sqlpage as sp,
} from "./deps.ts";

type SQLPageCell = chainNB.NotebookCell<
  SQLPageNotebook,
  chainNB.NotebookCellID<SQLPageNotebook>
>;

const nbDescr = new chainNB.NotebookDescriptor<
  SQLPageNotebook,
  SQLPageCell
>();

// see https://sql.ophir.dev/documentation.sql?component=debug#component

export class SQLPageNotebook {
  readonly tc: ReturnType<typeof sp.typicalContent<ddbi.IngestEmitContext>>;
  readonly comps = sp.typicalComponents<string, ddbi.IngestEmitContext>();

  constructor(readonly govn: ddbi.IngestGovernance) {
    this.tc = sp.typicalContent(govn.SQL);
  }

  @nbDescr.disregard()
  shell() {
    return this.govn.SQL`
      SELECT
        'shell'                   as component,
        'book'                    as icon,
        'QCS Ingestion Center'    as title,
        '/'                       as link,
        'issues'                  as menu_item,
        'schema'                  as menu_item`;
  }

  "index.sql"() {
    // passing in `chainNB.NotebookCellID<SQLPageNotebook>` allows us to restrict
    // menu hrefs to this notebook's cell names (the pages in SQLPage)
    const { list, listItem: li } = sp.typicalComponents<
      chainNB.NotebookCellID<SQLPageNotebook>,
      ddbi.IngestEmitContext
    >();

    // deno-fmt-ignore
    return this.govn.SQL`
      ${this.shell()}
      ${list({ items: [
                li({ title: "Ingestion Issues", link: "issues.sql" }),
                li({ title: "Ingestion State Schema", link: "schema.sql" }),
               ]})}`;
  }

  "issues.sql"() {
    // deno-fmt-ignore
    return this.govn.SQL`
      ${this.shell()}
      SELECT 'table' as component;
      SELECT issue_type, issue_message, invalid_value, remediation 
        FROM "ingest_session_issue";
    `;
  }

  "schema.sql"() {
    return this.govn.SQL`
      ${this.shell()}
      ${this.tc.infoSchemaSQL()}
    `;
  }

  static create(govn: ddbi.IngestGovernance) {
    return sp.sqlPageNotebook(
      SQLPageNotebook.prototype,
      () => new SQLPageNotebook(govn),
      () => govn.emitCtx,
      nbDescr,
    );
  }
}
