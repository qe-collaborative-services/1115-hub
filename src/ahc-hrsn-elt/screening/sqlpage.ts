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

const nbDescr = new chainNB.NotebookDescriptor<SQLPageNotebook, SQLPageFile>();

const customComponents = {
  session_entries: "session_entries",
} as const;
type CustomComponentName = keyof typeof customComponents;

function sessionEntries(
  govn: ddbo.DuckDbOrchGovernance,
  customCB: sp.ComponentBuilder<
    CustomComponentName,
    ddbo.DuckDbOrchEmitContext
  >,
) {
  type TopLevelArgs = { readonly title: string };
  type Row = Record<
    keyof Pick<
      typeof govn.columnNames.orch_session_entry,
      "orch_session_entry_id" | "ingest_src" | "ingest_table_name"
    >,
    string
  >;
  type PageParams = { readonly session_entry_id: string };
  const [tla, pp, rc] = [
    sp.safeHandlebars<TopLevelArgs>(),
    sp.safePropNames<PageParams>(),
    sp.safeHandlebars<Row>(),
  ];
  const customComp: sp.CustomTemplateSupplier<
    ddbo.DuckDbOrchEmitContext,
    typeof customComponents.session_entries,
    TopLevelArgs,
    Row
  > = {
    templatePath: customCB.customTemplatePath(customComponents.session_entries),
    handlebarsCode: () => ({
      SQL: () =>
        sp.text`
          <h1>${tla.title}</h1>

          <ul>
          {{#each_row}}
              <li><a href="?${pp.session_entry_id}=${rc.orch_session_entry_id}">${rc.ingest_src}</a> (${rc.ingest_table_name})</li>
          {{/each_row}}
          </ul>`,
    }),
    component: (tlaArg) => {
      const {
        tableNames: tn,
        columnNames: { orch_session_entry: c },
      } = govn;
      const tla = tlaArg ?? { title: "Choose Session Entry" };
      return {
        ...tla,
        ...customCB.custom(
          customComponents.session_entries,
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
  return customComp;
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
  readonly sc: ReturnType<typeof sp.sqliteContent<ddbo.DuckDbOrchEmitContext>>;
  readonly comps = sp.typicalComponents<string, ddbo.DuckDbOrchEmitContext>();
  readonly customCB = new sp.ComponentBuilder<
    CustomComponentName,
    ddbo.DuckDbOrchEmitContext
  >();
  readonly sessionEntries: ReturnType<typeof sessionEntries>;
  readonly imsTables: ReturnType<
    typeof this.sc.components.infoModelSchemaTables
  >;

  constructor(
    readonly govn: ddbo.DuckDbOrchGovernance,
    registerCTS: (
      ...cc: sp.CustomTemplateSupplier<
        ddbo.DuckDbOrchEmitContext,
        Any,
        Any,
        Any
      >[]
    ) => void,
  ) {
    this.sc = sp.sqliteContent(govn.SQL);
    this.sessionEntries = sessionEntries(govn, this.customCB);
    this.imsTables = this.sc.components.infoModelSchemaTables();
    registerCTS(this.sessionEntries, this.imsTables);
  }

  @nbDescr.disregard()
  assetPagePath(path: string, sessionID?: string) {
    return sessionID ? `asset/session/${sessionID}/${path}` : `asset/${path}`;
  }

  @nbDescr.disregard()
  shellStatic() {
    // deno-fmt-ignore
    return this.govn.SQL`
      ${this.comps.shell({
        title: "QCS Orchestration Engine",
        icon: "book",
        link: "/",
        menuItems: [
          { caption: "screenings" },
          { caption: "sessions" },
          { caption: "schema" },
        ],
      })}
    `;
  }

  @nbDescr.disregard()
  shell() {
    // SQLite does not have a native JSON type so use 'dynamic' component
    // for menu_item; see https://sql.ophir.dev/documentation.sql?component=dynamic#component
    const shell = {
      component: "shell",
      title: "QCS Orchestration Engine",
      link: "/",
      icon: "book",
      menu_item: [
        { title: "Screenings", link: "/1115-waiver-screenings.sql" },
        { title: "Sessions", link: "/sessions.sql" },
        { title: "Schema", link: "/schema.sql" },
        { title: "Reference", link: "/reference.sql" },
      ],
      javascript: [
        "https://cdn.jsdelivr.net/npm/prismjs@1/prism.min.js",
        "https://cdn.jsdelivr.net/npm/prismjs@1/plugins/autoloader/prism-autoloader.min.js",
        "https://cdn.jsdelivr.net/npm/prismjs@1/plugins/line-numbers/prism-line-numbers.min.js",
        "/scripts/shell.js",
      ],
      css: [
        "https://cdn.jsdelivr.net/npm/prismjs@1/themes/prism-tomorrow.css",
        "https://cdn.jsdelivr.net/npm/prismjs@1/plugins/line-numbers/prism-line-numbers.css",
      ],
    };

    // deno-fmt-ignore
    return this.govn.SQL`SELECT 'dynamic' AS component, '${JSON.stringify(
      shell
    ).replace("'", "''")}' AS properties`;
  }

  "scripts/shell.js"() {
    return this.govn.SQL`
      function wrapSTDOUTInDetails() {
          // Find all heading elements that could contain the STDOUT text
          const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');

          headings.forEach(function(heading) {
              if (heading.textContent.includes('STDOUT')) {
                  // Find the next <pre><code> block
                  var nextEl = heading.nextElementSibling;
                  while (nextEl) {
                      if (nextEl.matches('pre') && nextEl.querySelector('code')) {
                          // Create the <details> and <summary> elements
                          const details = document.createElement('details');
                          const summary = document.createElement('summary');
                          summary.textContent = heading.textContent;

                          // Wrap the <pre><code> block in <details>
                          nextEl.parentNode.insertBefore(details, nextEl);
                          details.appendChild(summary);
                          details.appendChild(nextEl);
                          break;
                      }
                      nextEl = nextEl.nextElementSibling;
                  }
              }
          });

          headings.forEach(function(heading) {
              if (heading.textContent.includes('STDOUT')) {
                heading.remove();
              }
          });
      }

      document.addEventListener('DOMContentLoaded', function() {
        // find all code elements on the current page with the class 'language-sql' and add the class 'line-numbers' to each of them
        document.querySelectorAll('code.language-sql').forEach(function(codeEl) {
            var parentPre = codeEl.parentElement;
            if (parentPre && parentPre.tagName === 'PRE') {
                parentPre.classList.add('line-numbers');
            }
        });
        wrapSTDOUTInDetails();
      });
    `;
  }

  "index.sql"() {
    // passing in `chainNB.NotebookCellID<SQLPageNotebook>` allows us to restrict
    // menu hrefs to this notebook's cell names (the pages in SQLPage) for type
    // safety
    const { list, listItem: li } = sp.typicalComponents<
      chainNB.NotebookCellID<SQLPageNotebook>,
      ddbo.DuckDbOrchEmitContext
    >();

    // deno-fmt-ignore
    return this.govn.SQL`
      ${this.shell()}
      ${list({
        items: [
          li({
            title: "1115 Waiver Screenings",
            link: "1115-waiver-screenings.sql",
          }),
          li({ title: "Orchestration Sessions", link: "sessions.sql" }),
          li({ title: "Orchestration Issues", link: "issues.sql" }),
          li({ title: "Orchestration State Schema", link: "schema.sql" }),
        ],
      })}`;
  }

  "sessions.sql"() {
    const {
      comps: { table },
      govn,
      govn: { SQL },
    } = this;
    const {
      tableNames: tn,
      columnNames: { orch_session: os_c, orch_session_entry: ose_c },
    } = govn;

    // NOTE: this page assumes that /asset/session/<orch_session_id>/diagnostics.sql
    // is inserted by the orchestration engine (it's not in the SQLPageNotebook).

    // deno-fmt-ignore
    return SQL`
      ${this.shell()}

      ${table({ rows: [{ SQL: () => `SELECT * FROM ${tn.device}` }] })}

      ${table({
        columns: { [os_c.orch_session_id]: { markdown: true },['SUMMARY']: { markdown: true } },
        rows: [
          {
            SQL: () =>
              `SELECT '[' || ${os_c.orch_session_id} || '](session-diagnostics.sql?session_id='|| ${os_c.orch_session_id} ||')' as ${os_c.orch_session_id},'[' || 'Summary' || '](session-summary.sql?session_id='|| ${os_c.orch_session_id} ||')' as SUMMARY, ${os_c.device_id}, ${os_c.orch_started_at}, ${os_c.orch_finished_at} FROM ${tn.orch_session}`,
          },
        ],
      })}

      ${table({
        search: true,
        columns: { [ose_c.ingest_src]: { markdown: true } },
        rows: [
          {
            SQL: () =>
              `SELECT '[' || ${ose_c.ingest_src} || '](issues.sql?session_entry_id='|| ${ose_c.orch_session_entry_id} ||')' as ${ose_c.ingest_src}, ${ose_c.ingest_table_name} FROM "${tn.orch_session_entry}"`,
          },
        ],
      })}
    `;
  }

  "reference.sql"() {
    const {
      comps: { table, text },
      govn: { SQL },
    } = this;

    // deno-fmt-ignore
    return SQL`
      ${this.shell()}

      ${text({
        title: 'Encounter Class Reference',
      })}

      ${table({
        columns: { },
        rows: [
          {
            SQL: () =>
              `SELECT * FROM encounter_class_reference`,
          },
        ],
      })}

      ${text({
        title: 'Encounter Status Code Reference',
      })}

      ${table({
        columns: { },
        rows: [
          {
            SQL: () =>
              `SELECT * FROM encounter_status_code_reference`,
          },
        ],
      })}

      ${text({
        title: 'Encounter Type Code Reference',
      })}

      ${table({
        columns: { },
        rows: [
          {
            SQL: () =>
              `SELECT * FROM encounter_type_code_reference`,
          },
        ],
      })}

      ${text({
        title: 'Screening Status Code Reference',
      })}

      ${table({
        columns: { },
        rows: [
          {
            SQL: () =>
              `SELECT * FROM screening_status_code_reference`,
          },
        ],
      })}

      ${text({
        title: 'Business Rules',
      })}

      ${table({
        columns: { },
        rows: [
          {
            SQL: () =>
              `SELECT * FROM business_rules`,
          },
        ],
      })}

      ${text({
        title: 'AHC Cross Walk',
      })}

      ${table({
        columns: { },
        rows: [
          {
            SQL: () =>
              `SELECT * FROM ahc_cross_walk`,
          },
        ],
      })}

    `;
  }

  "session-diagnostics.sql"() {
    const {
      comps: { text },
      govn,
      govn: { SQL },
    } = this;
    const {
      tableNames: tn,
      columnNames: { orch_session: c },
    } = govn;

    // NOTE: this page assumes that /asset/session/<orch_session_id>/diagnostics.sql
    // is inserted by the orchestration engine (it's not in the SQLPageNotebook).

    // deno-fmt-ignore
    return SQL`
      ${this.shell()}

      ${text({
        title: { SQL: () => `('Session ' || $session_id || ' Arguments ')` },
        content: {
          markdown: {
            SQL: () =>
              `(SELECT '\`\`\`json\n' || ${c.args_json} || '\n\`\`\`' FROM ${tn.orch_session} WHERE ${c.orch_session_id} = $session_id)`,
          },
        },
      })}

      ${text({
        title: { SQL: () => `('Session ' || $session_id || ' Diagnostics ')` },
        content: {
          markdown: {
            SQL: () =>
              `(SELECT ${c.diagnostics_md} FROM ${tn.orch_session} WHERE ${c.orch_session_id} = $session_id)`,
          },
        },
      })}`;
  }

  "session-summary.sql"() {
    const {
      comps: { table, text },
      govn,
      govn: { SQL },
    } = this;
    const {
      tableNames: tn,
      columnNames: { orch_session_issue: c },
    } = govn;

    // NOTE: this page assumes that /asset/session/<orch_session_id>/diagnostics.sql
    // is inserted by the orchestration engine (it's not in the SQLPageNotebook).

    // deno-fmt-ignore
    return SQL`
      ${this.shell()}
      ${text({
        title: 'Summary',
      })}
      ${table({
        search: true,
        columns: {  },
        rows: [
          {
            SQL: () =>
              `SELECT ${c.issue_type},COUNT(${c.orch_session_issue_id}) as issue_count from ${tn.orch_session_issue} group by ${c.issue_type}`,
          },
        ],
      })}

      `;
  }

  "issues.sql"() {
    const {
      comps: { table },
      govn,
      govn: { SQL },
    } = this;
    const {
      tableNames: tn,
      columnNames: { orch_session_issue: c },
    } = govn;

    // ${breadcrumbs({ items: [
    //   { caption: "Home", href: "/" },
    //   { caption: { SQL: () => `(SELECT ingest_src FROM orch_session_entry WHERE orch_session_entry_id = $session_entry_id)` }, active: true } ]})}

    // deno-fmt-ignore
    return SQL`
      ${this.shell()}

      ${this.sessionEntries.component()}

      ${table({
        search: true,
        rows: [
          {
            SQL: () => `
            SELECT ${c.issue_type}, ${c.issue_message}, ${c.invalid_value}, ${c.remediation}
              FROM ${tn.orch_session_issue}
             WHERE ${c.session_entry_id} = $${c.session_entry_id}`,
          },
        ],
      })}
      `;
  }

  // TODO: do not hard-code screening_2_01hpkty3hctk826tvx5tasga55 since the table name is driven by the file name
  "1115-waiver-screenings.sql"() {
    const {
      comps: { text, table },
      govn: { SQL },
    } = this;

    // deno-fmt-ignore
    return SQL`
      ${this.shell()}

      ${table({
        search: true,
        sort: true,
        rows: [
          {
            SQL: () => `
              SELECT format('[%s](?pat_mrn_id=%s)', pat_mrn_id, pat_mrn_id) as pat_mrn_id, facility_id
                FROM screening_2_01hpkty3hctk826tvx5tasga55
            GROUP BY pat_mrn_id, facility_id
            ORDER BY facility_id`,
          },
        ],
        columns: { pat_mrn_id: { markdown: true } },
      })}

      ${text({
        title: {
          SQL: () =>
            `(select format('%s %s Answers') from screening_2_01hpkty3hctk826tvx5tasga55 where pat_mrn_id = $pat_mrn_id)`,
        },
      })}
      ${table({
        search: true,
        sort: true,
        rows: [
          {
            SQL: () => `
            SELECT question, meas_value
              FROM "screening_2_01hpkty3hctk826tvx5tasga55"
             WHERE pat_mrn_id = $pat_mrn_id`,
          },
        ],
        condition: { anyExists: "$pat_mrn_id" },
      })}
      ${text({
        title: {
          SQL: () =>
            `(select format('%s %s FHIR Patient', first_name, last_name) from admin_demographics_2_01hpkty3hctk826tvx5tasga55 where pat_mrn_id = $pat_mrn_id)`,
        },
      })}
      ${table({
        search: true,
        sort: true,
        rows: [
          {
            SQL: () => `
            SELECT *
              FROM "admin_demographics_2_01hpkty3hctk826tvx5tasga55_fhir_patient"
             WHERE pat_mrn_id = $pat_mrn_id`,
          },
        ],
        condition: { allExist: "$pat_mrn_id is not null" },
      })}
      ${text({
        title: {
          SQL: () =>
            `(select format('%s FHIR Observations', display_name) from screening_2_01hpkty3hctk826tvx5tasga55_fhir where pat_mrn_id = $pat_mrn_id)`,
        },
      })}
      ${table({
        search: true,
        sort: true,
        rows: [
          {
            SQL: () => `
            SELECT *
              FROM "screening_2_01hpkty3hctk826tvx5tasga55_fhir"
             WHERE pat_mrn_id = $pat_mrn_id`,
          },
        ],
        condition: { allExist: "$pat_mrn_id is not null" },
      })}
      ${text({
        title: {
          SQL: () =>
            `(select format('%s FHIR Questionnaire', display_name) from screening_2_01hpkty3hctk826tvx5tasga55_fhir_questionnaire where pat_mrn_id = $pat_mrn_id)`,
        },
      })}
      ${table({
        search: true,
        sort: true,
        rows: [
          {
            SQL: () => `
            SELECT *
              FROM "screening_2_01hpkty3hctk826tvx5tasga55_fhir_questionnaire"
             WHERE pat_mrn_id = $pat_mrn_id`,
          },
        ],
        condition: { allExist: "$pat_mrn_id is not null" },
      })}
    `;
  }

  "schema.sql"() {
    const {
      govn: { SQL },
    } = this;
    return SQL`
      ${this.shell()}
      ${this.sc.infoSchemaSQL()}
    `;
  }

  static create(govn: ddbo.DuckDbOrchGovernance) {
    return sp.sqlPageNotebook(
      SQLPageNotebook.prototype,
      (registerCTS) => new SQLPageNotebook(govn, registerCTS),
      () => govn.emitCtx,
      nbDescr,
    );
  }
}
