import {
  chainNB,
  SQLa_orch_duckdb as ddbo,
  SQLa_sqlpage as sp,
} from "./deps.ts";

type SQLPageFile = chainNB.NotebookCell<
  SQLPageNotebook,
  chainNB.NotebookCellID<SQLPageNotebook>
>;

const nbDescr = new chainNB.NotebookDescriptor<
  SQLPageNotebook,
  SQLPageFile
>();

/**
 * Encapsulates [SQLPage](https://sql.ophir.dev/) content. SqlPageNotebook has
 * methods with the name of each [SQLPage](https://sql.ophir.dev/) content that
 * we want in the database. The MutationSqlNotebook sqlPageSeedDML method
 * "reads" the cells in the SqlPageNotebook (each method's result) and
 * generates SQL to insert the content of the page in the database in the format
 * and table expected by [SQLPage](https://sql.ophir.dev/).
 * NOTE: we break our PascalCase convention for the name of the class since SQLPage
 *       is a proper noun (product name).
 */
export class SQLPageNotebook {
  readonly tc: ReturnType<typeof sp.typicalContent<ddbo.OrchEmitContext>>;
  readonly comps = sp.typicalComponents<string, ddbo.OrchEmitContext>();

  constructor(readonly govn: ddbo.OrchGovernance) {
    this.tc = sp.typicalContent(govn.SQL);
  }

  @nbDescr.disregard()
  shell() {
    // deno-fmt-ignore
    return this.govn.SQL`
      ${this.comps.shell({ 
          title: "QCS Orchestration Engine",
          icon: "book",
          link: "/",
          menuItems: [{ caption: "issues" }, { caption: "schema" }]
      })}
    `;
  }

  "index.sql"() {
    // passing in `chainNB.NotebookCellID<SQLPageNotebook>` allows us to restrict
    // menu hrefs to this notebook's cell names (the pages in SQLPage) for type
    // safety
    const { list, listItem: li } = sp.typicalComponents<
      chainNB.NotebookCellID<SQLPageNotebook>,
      ddbo.OrchEmitContext
    >();

    // deno-fmt-ignore
    return this.govn.SQL`
      ${this.shell()}
      ${list({ items: [
                li({ title: "Screenings", link: "screenings.sql" }),
                li({ title: "Jon Doe Screening", link: "jondoe.sql" }),
                li({ title: "Orchestration Issues", link: "issues.sql" }),
                li({ title: "Orchestration State Schema", link: "schema.sql" }),
               ]})}`;
  }

  "issues.sql"() {
    const { comps: { table }, govn: { SQL } } = this;

    // deno-fmt-ignore
    return SQL`
      ${this.shell()}

      ${table({ rows: [{SQL: () => `SELECT * FROM "device"`}] })}

      ${table({ rows: [
        { SQL: () => `SELECT * FROM "orch_session"`}]})}

      ${table({ search: true, rows: [
        { SQL: () => `SELECT orch_session_entry_id,	ingest_src, ingest_table_name FROM "orch_session_entry"`}]})}
  
      ${table({ search: true, rows: [
        { SQL: () => `
            SELECT issue_type, issue_message, invalid_value, remediation 
              FROM "orch_session_issue"`}]})}
    `;
  }

  "screenings.sql"() {
    const { comps: { table }, govn: { SQL } } = this;

    // deno-fmt-ignore
    return SQL`
      ${this.shell()}  
      ${table({ search: true, sort: true, rows: [
        { SQL: () => `
            SELECT * 
              FROM "ahc_hrsn_12_12_2023_valid"`}]})}
    `;
  }

  "jondoe.sql"() {
    const { comps: { text, table }, govn: { SQL } } = this;

    // deno-fmt-ignore
    return SQL`
      ${this.shell()}
      ${text({title: "Jon Doe (11223344)", content: {markdown: 'Test'}})}
      ${table({ search: true, sort: true, rows: [
        { SQL: () => `
            SELECT pat_mrn_id, question, meas_value 
              FROM "ahc_hrsn_12_12_2023_valid"
             WHERE pat_mrn_id = '11223344'`}]})}
      ${table({ search: true, rows: [
        { SQL: () => `
            SELECT *
              FROM "ahc_hrsn_12_12_2023_valid_fhir"`}]})}
    `;
  }

  "schema.sql"() {
    return this.govn.SQL`
      ${this.shell()}
      ${this.tc.infoSchemaSQL()}
    `;
  }

  static create(govn: ddbo.OrchGovernance) {
    return sp.sqlPageNotebook(
      SQLPageNotebook.prototype,
      () => new SQLPageNotebook(govn),
      () => govn.emitCtx,
      nbDescr,
    );
  }
}
