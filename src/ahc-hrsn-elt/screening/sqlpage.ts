import {
  chainNB,
  SQLa_orch_duckdb as ddbo,
  SQLa_sqlpage as sp,
} from "./deps.ts";

// deno-lint-ignore no-explicit-any
type Any = any;

type SQLPageFile = chainNB.NotebookCell<
  SQLPageNotebook,
  chainNB.NotebookCellID<SQLPageNotebook>
>;

const nbDescr = new chainNB.NotebookDescriptor<
  SQLPageNotebook,
  SQLPageFile
>();

const customComponent = {
  session_entries: "session_entries",
} as const;
type CustomComponentName = keyof typeof customComponent;

function sessionEntries(
  govn: ddbo.OrchGovernance,
  customCB: sp.ComponentBuilder<CustomComponentName, ddbo.OrchEmitContext>,
): sp.CustomTemplateSupplier<
  ddbo.OrchEmitContext,
  typeof customComponent.session_entries,
  { readonly title: string },
  {
    readonly orch_session_entry_id: string;
    readonly ingest_src: string;
    readonly ingest_table_name: string;
  },
  { readonly session_entry_id: string }
> {
  return {
    templatePath: customCB.customTemplatePath(customComponent.session_entries),
    handlebarsCode: ({ tla: a, pn, row: c }) => ({
      SQL: () =>
        sp.text`
          <h1>${a.title}</h1>
  
          <ul>
          {{#each_row}}
              <li><a href="?${pn.session_entry_id}=${c.orch_session_entry_id}">${c.ingest_src}</a> (${c.ingest_table_name})</li>
          {{/each_row}}
          </ul>`,
    }),
    component: (tlaArg) => {
      const { tableNames: tn, columnNames: { orch_session_entry: c } } = govn;
      const tla = tlaArg ?? { title: "Choose Session Entry" };
      return {
        ...tla,
        ...customCB.custom(
          customComponent.session_entries,
          tla,
          (topLevel) =>
            govn.SQL`
              ${topLevel}
              SELECT ${c.orch_session_entry_id}, ${c.ingest_src}, ${c.ingest_table_name} 
                FROM ${tn.orch_session_entry}`,
        ),
      };
    },
  };
}

/**
 * Encapsulates [SQLPage](https://sql.ophir.dev/) content. SqlPageNotebook has
 * methods with the name of each SQLPage content that we want in the database.
 * The SQLPageNotebook.create method "reads" the cells in SqlPageNotebook (each
 * method's result) and generates SQL to insert the content of the page in the
 * database in the format and table expected by SQLPage `sqlpage_files` table.
 *
 * See: https://github.com/lovasoa/SQLpage/tree/main#hosting-sql-files-directly-inside-the-database
 *
 * If you want to store customizations (e.g. handlebar templates, etc.) see:
 * - https://sql.ophir.dev/custom_components.sql
 * - https://github.com/lovasoa/SQLpage/discussions/174
 *
 * If you want to create JSON APIs:
 * https://sql.ophir.dev/documentation.sql?component=json#component
 *
 * If you want to execute commands (assuming appropriate security) in SQLPage:
 * https://sql.ophir.dev/functions.sql?function=exec#function
 *
 * NOTE: we break our PascalCase convention for the name of the class since SQLPage
 *       is a proper noun (product name).
 */
export class SQLPageNotebook {
  readonly tc: ReturnType<typeof sp.typicalContent<ddbo.OrchEmitContext>>;
  readonly comps = sp.typicalComponents<string, ddbo.OrchEmitContext>();
  readonly customCB = new sp.ComponentBuilder<
    CustomComponentName,
    ddbo.OrchEmitContext
  >();
  readonly sessionEntries: ReturnType<typeof sessionEntries>;

  constructor(
    readonly govn: ddbo.OrchGovernance,
    registerCTS: (
      cc: sp.CustomTemplateSupplier<
        ddbo.OrchEmitContext,
        CustomComponentName,
        Any,
        Any,
        Any
      >,
    ) => void,
  ) {
    this.tc = sp.typicalContent(govn.SQL);
    this.sessionEntries = sessionEntries(govn, this.customCB);
    registerCTS(this.sessionEntries);
  }

  @nbDescr.disregard()
  shell() {
    // deno-fmt-ignore
    return this.govn.SQL`
      ${this.comps.shell({ 
          title: "QCS Orchestration Engine",
          icon: "book",
          link: "/",
          menuItems: [{ caption: "sessions" }, { caption: "schema" }]
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
                li({ title: "Orchestration Sessions", link: "sessions.sql" }),
                li({ title: "Orchestration Issues", link: "issues.sql" }),
                li({ title: "Orchestration State Schema", link: "schema.sql" }),
               ]})}`;
  }

  "sessions.sql"() {
    const { comps: { table }, govn, govn: { SQL } } = this;
    const { tableNames: tn, columnNames: { orch_session_entry: c } } = govn;

    // deno-fmt-ignore
    return SQL`
      ${this.shell()}

      ${table({ rows: [{SQL: () => `SELECT * FROM ${tn.device}`}] })}

      ${table({ rows: [
        { SQL: () => `SELECT * FROM ${tn.orch_session}`}]})}

      ${table({ search: true, columns: { ingest_src: { markdown: true }}, rows: [
        { SQL: () => `SELECT '[' || ${c.ingest_src} || '](issues.sql?session_entry_id='|| ${c.orch_session_entry_id} ||')' as ${c.ingest_src}, ${c.ingest_table_name} FROM "${tn.orch_session_entry}"`}]})}
    `;
  }

  "issues.sql"() {
    const { comps: { table }, govn, govn: { SQL } } = this;
    const { tableNames: tn, columnNames: { orch_session_issue: c } } = govn;

    // ${breadcrumbs({ items: [
    //   { caption: "Home", href: "/" },
    //   { caption: { SQL: () => `(SELECT ingest_src FROM orch_session_entry WHERE orch_session_entry_id = $session_entry_id)` }, active: true } ]})}

    // deno-fmt-ignore
    return SQL`
      ${this.shell()}

      ${this.sessionEntries.component()}

      ${table({ search: true, rows: [
        { SQL: () => `
            SELECT ${c.issue_type}, ${c.issue_message}, ${c.invalid_value}, ${c.remediation}
              FROM ${tn.orch_session_issue}
             WHERE ${c.session_entry_id} = $${c.session_entry_id}`}]})}
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
      (registerCTS) => new SQLPageNotebook(govn, registerCTS),
      () => govn.emitCtx,
      nbDescr,
    );
  }
}
