import { Command } from "https://deno.land/x/cliffy@v1.0.0-rc.3/command/mod.ts";
import JSZip from "npm:jszip";
import {
  colors as c,
  config,
  fs,
  path,
  SQLa_orch as o,
  SQLa_orch_duckdb as ddbo,
} from "./deps.ts";
import * as mod from "./mod.ts";
import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";
const env = config.config();
async function prepareIngressTxFiles(
  srcDir: string,
  workflowPaths: mod.OrchEngineWorkflowPaths,
): Promise<boolean> {
  let checkIngestionFiles = false;
  // Read the source directory contents
  let count = 0;
  const ingestFiles: string[] = [];
  for await (const dirEntry of Deno.readDir(srcDir)) {
    checkIngestionFiles = true;
    if (count == 0) {
      await workflowPaths.initializePaths?.();
    }
    // Ensure the destination directory `${rootPath}/ingress-tx/XYZ_TEMP` exists
    await fs.ensureDir(workflowPaths.ingressTx.home);
    // Construct the source and destination paths
    const srcPath = `${srcDir}/${dirEntry.name}`;
    const destPath = `${workflowPaths.ingressTx.home}/${dirEntry.name}`;

    // Move the file ingress file to the ingress tx directory
    await fs.move(srcPath, destPath);
    if (dirEntry.isFile) {
      ingestFiles.push(dirEntry.name);
    }
    count++;
  }
  if (count > 0) {
    console.log(
      `Prepared ${count} files from ${srcDir} for ingress in ${workflowPaths.ingressTx.home}`,
    );
  }
  for (let index = 0; index < ingestFiles.length; index++) {
    const fileName = ingestFiles[index];
    // Check if the file is a zip file and process it
    if (fileName.endsWith(".zip")) {
      const destPath = `${workflowPaths.ingressTx.home}/${fileName}`;
      await processZipFile(destPath, workflowPaths.ingressTx.home);
    }
  }
  return checkIngestionFiles;
}

async function processZipFile(zipFilePath: string, outputPath: string) {
  const zip = await JSZip.loadAsync(await Deno.readFile(zipFilePath));
  await Promise.all(
    Object.entries(zip.files).map(async ([fileName, file]) => {
      if (!file.dir) {
        const fileContent = await file.async("uint8array");
        let finalPath = path.join(outputPath, fileName);
        if (fileName.match(/^SCREENING.*\.csv$/i)) {
          finalPath = path.join(
            outputPath,
            fileName.split(".csv")[0] +
              `_${path.basename(zipFilePath, ".zip")}.csv`,
          );
        } else if (fileName.match(/^QE_ADMIN_DATA.*\.csv$/i)) {
          finalPath = path.join(
            outputPath,
            fileName.split(".csv")[0] +
              `_${path.basename(zipFilePath, ".zip")}.csv`,
          );
        } else if (fileName.match(/^DEMOGRAPHIC_DATA.*\.csv$/i)) {
          finalPath = path.join(
            outputPath,
            fileName.split(".csv")[0] +
              `_${path.basename(zipFilePath, ".zip")}.csv`,
          );
        }
        await Deno.writeFile(finalPath, fileContent);
        console.log(`Extracted and moved: ${finalPath}`);
      }
    }),
  );
}

async function ingressWorkflow(
  sessionID: string,
  govn: ddbo.DuckDbOrchGovernance,
  ip: mod.OrchEngineIngressPaths,
  src:
    | mod.ScreeningIngressGroup
    | o.IngressEntry<string, string>
    | o.IngressEntry<string, string>[],
  workflowPaths: mod.OrchEngineWorkflowPaths,
  referenceDataHome: string,
  fhirEndpointUrl?: string,
) {
  const sessionStart = {
    ingressPaths: ip,
    initAt: new Date(),
    sessionID,
    src,
    version: mod.ORCHESTRATE_VERSION,
  };

  const sessionLogFsPath = workflowPaths.egress.resolvedPath("session.json");
  Deno.writeTextFile(
    sessionLogFsPath,
    JSON.stringify(sessionStart, null, "  "),
  );

  const args: mod.OrchEngineArgs = {
    session: new o.OrchSession(sessionID, govn, mod.ORCHESTRATE_VERSION),
    workflowPaths,
    walkRootPaths: [ip.ingress.home],
    referenceDataHome,
    emitDagPuml: async (puml, _previewUrl) => {
      await Deno.writeTextFile(
        workflowPaths.inProcess.resolvedPath("dag.puml"),
        puml,
      );
    },
  };

  await o.orchestrate<
    ddbo.DuckDbOrchGovernance,
    mod.OrchEngine,
    mod.OrchEngineArgs,
    ddbo.DuckDbOrchEmitContext
  >(mod.OrchEngine.prototype, mod.oeDescr, {
    govn,
    newInstance: () =>
      new mod.OrchEngine(
        mod.watchFsPatternIngestSourcesSupplier(govn, src),
        govn,
        args,
      ),
  }, args);

  const { diagsMdSupplier, resourceDbSupplier } = workflowPaths.egress;
  const sessionEnd = {
    ...sessionStart,
    consumed: [] as {
      readonly activity: "delete" | "move";
      readonly fsPath: string;
    }[],
    stdErrsEncountered:
      "✅ No DuckDB orchestration SQL syntax or SQL parsing errors encountered.",
    diagsMarkdown: diagsMdSupplier
      ? `📄 Diagnostics are in ${diagsMdSupplier()}`
      : undefined,
    duckDb:
      `🦆 ${workflowPaths.inProcess.duckDbFsPathSupplier()} has the raw ingested content and \`orch_session_*\` validation tables.`,
    sqliteDB: resourceDbSupplier
      ? `📦 ${resourceDbSupplier()} has the aggregated content and \`orch_session_*\` validation tables.`
      : undefined,
    referenceDataHome: referenceDataHome,
    publishFhirURL: fhirEndpointUrl,
    publishFhirResult: [] as {
      response: string;
      fhirJsonStructValid: boolean;
      fhirFileName: string;
    }[],
    migrateUdi: false,
    migrateUdiError: "",
  };

  const archiveHome = workflowPaths.ingressArchive?.home;
  const consumeIngressed = async (fsPath: string) => {
    if (archiveHome) {
      await Deno.rename(fsPath, path.join(archiveHome, path.basename(fsPath)));
      sessionEnd.consumed.push({ activity: "move", fsPath });
    } else {
      await Deno.remove(fsPath);
      sessionEnd.consumed.push({ activity: "delete", fsPath });
    }
  };

  if (mod.isScreeningIngressGroup(src)) {
    src.entries.forEach(async (entry) => await consumeIngressed(entry.fsPath));
  } else {
    if (Array.isArray(src)) {
      src.forEach(async (entry) => await consumeIngressed(entry.fsPath));
    } else {
      await consumeIngressed(src.fsPath);
    }
  }
  if (fhirEndpointUrl) {
    // const fhirFilePath = workflowPaths.egress.resolvedPath("fhir.json");
    // const fhirContent = await Deno.readTextFile(fhirFilePath);
    const directoryPath = workflowPaths.egress.resolvedPath(".");
    for await (const entry of Deno.readDir(directoryPath)) {
      if (entry.isFile && entry.name.startsWith("fhir-")) {
        const fhirFilePath = `${directoryPath}/${entry.name}`;
        const fhirContent = await Deno.readTextFile(fhirFilePath);
        try {
          // parse the json just to make sure that a valid json is passed
          const _content = JSON.parse(fhirContent);
          const response = await fetch(fhirEndpointUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: fhirContent,
          });
          const result = await response.json();
          const fhirJson = "fhir-result-" +
            entry.name.substring(0, entry.name.lastIndexOf(".")) + ".json";
          const fhirResultFilePath = `${directoryPath}/${fhirJson}`;
          await Deno.writeTextFile(
            fhirResultFilePath,
            JSON.stringify(result, null, "  "),
          );
          sessionEnd.publishFhirResult.push({
            "response": JSON.stringify(result),
            "fhirJsonStructValid": true,
            "fhirFileName": entry.name,
          });
        } catch (error) {
          Deno.writeTextFile(fhirFilePath, error);
          sessionEnd.publishFhirResult.push({
            "response": JSON.stringify(error),
            "fhirJsonStructValid": false,
            "fhirFileName": entry.name,
          });
        }
      }
    }
  }
  const duckdb = new ddbo.DuckDbShell(args.session, {
    duckdbCmd: "duckdb",
    dbDestFsPathSupplier: args.workflowPaths.inProcess.duckDbFsPathSupplier,
    preambleSQL: () =>
      `-- preambleSQL\nSET autoinstall_known_extensions=true;\nSET autoload_known_extensions=true;\n-- end preambleSQL\n`,
  });
  const migrateTables = [
    "demographic_data",
    "qe_admin_data",
    "screening",
    "orch_session",
    "orch_session_entry",
    "orch_session_exec",
    "orch_session_issue",
    "orch_session_state",
    "device",
    "business_rules",
  ];
  try {
    const client = new Client({
      user: env.POSTGRES_USER,
      password: env.POSTGRES_PASSWORD,
      database: env.POSTGRES_DB,
      hostname: env.POSTGRES_HOST,
      port: env.POSTGRES_PORT,
    });
    await client.connect();
    console.log("Connected to the postgres database!");
    await duckdb.execute(
      govn.SQL`
          INSTALL postgres;
          LOAD postgres;

          ATTACH 'dbname=${env.POSTGRES_DB} user=${env.POSTGRES_USER} host=${env.POSTGRES_HOST} password=${env.POSTGRES_PASSWORD}' AS post_db (TYPE POSTGRES);

          ${
        migrateTables.map((tableName) => ({
          SQL: () =>
            `CREATE TABLE IF NOT EXISTS post_db.techbd_orch_ctl.${tableName} AS SELECT * FROM ${tableName} WHERE FALSE;
            INSERT INTO post_db.techbd_orch_ctl.${tableName} SELECT * FROM ${tableName};
            `,
        }))
      }
          DETACH DATABASE post_db;`.SQL(govn.emitCtx),
    );
    await client.queryObject(`
      CREATE OR REPLACE VIEW techbd_orch_ctl.orch_session_issue_classification AS
          WITH cte_business_rule AS (
              SELECT
                  field AS field,
                  required AS required,
                  "Resolved by QE/QCS" AS resolved_by_qe_qcs,
                  CONCAT(
                      CASE WHEN UPPER("True Rejection") = 'YES' THEN 'REJECTION' ELSE '' END,
                      CASE WHEN UPPER("Warning Layer") = 'YES' THEN 'WARNING' ELSE '' END
                  ) AS record_action
              FROM
              techbd_orch_ctl.business_rules
          )
          SELECT
              -- Including all other columns from 'orch_session'
              distinct on (isi.orch_session_issue_id) isi.orch_session_issue_id,
              ises.orch_session_id,
              -- Including all columns from 'orch_session_entry'
              isee.orch_session_entry_id,
              -- Extracting QE value from ingest_src
              substring(isee.ingest_src FROM '/SFTP/([^/]+)/') AS qe_value,
              isee.ingest_src,
              isee.ingest_table_name,
              -- Including all other columns from 'orch_session_issue'
              isi.issue_type,
              isi.issue_message,
              isi.issue_row,
              isi.issue_column,
              isi.invalid_value,
              isi.remediation AS remediation1,
              CASE
                  WHEN UPPER(isi.issue_type) = 'MISSING COLUMN' THEN 'STRUCTURAL ISSUE'
                  ELSE br.record_action
              END AS disposition,
              CASE
                  WHEN UPPER(br.resolved_by_qe_qcs) = 'YES' THEN 'Resolved By QE/QCS'
                  ELSE NULL
              END AS remediation2,
              ises."version",
              ises.orch_started_at,
              ises.orch_finished_at
          FROM
            techbd_orch_ctl.orch_session AS ises
          JOIN
            techbd_orch_ctl.orch_session_entry AS isee ON ises.orch_session_id = isee.session_id
          LEFT JOIN
            techbd_orch_ctl.orch_session_issue AS isi ON isee.orch_session_entry_id = isi.session_entry_id
          LEFT JOIN
              cte_business_rule br ON br.field = isi.issue_column
          WHERE
              isi.orch_session_issue_id IS NOT NULL
              AND isee.ingest_src NOT LIKE '%/reference-data/%';`);
    sessionEnd.migrateUdi = true;
    Deno.writeTextFile(
      sessionLogFsPath,
      JSON.stringify({ ...sessionEnd, finalizeAt: new Date() }, null, "  "),
    );
  } catch (error) {
    sessionEnd.migrateUdiError = JSON.stringify(error);
    Deno.writeTextFile(
      sessionLogFsPath,
      JSON.stringify({ ...sessionEnd, finalizeAt: new Date() }, null, "  "),
    );
  }
  console.info(c.dim(sessionLogFsPath));
}

await new Command()
  .name("orchctl")
  .description("A simple reverse proxy example cli.")
  .version("v1.0.0")
  .option("--qe <qe>", "Qe user name.")
  .option("--sftp-root <path>", "Qe user name.", { default: "/SFTP" })
  .option("--reference-data-home <path>", "Qe user name.", {
    default: path.join(Deno.cwd(), "src/ahc-hrsn-elt/reference-data"),
  })
  .option("--publish-fhir <fhir-api-url>", "FHIR endpoint URL.")
  .option(
    "--publish-fhir-qe-id <qe-id>",
    "Should be one of `BRONX`, `HEALTHECONN`, `GRRHIO`, `HEALTHIX`, `HEALTHELINK`, `HIXNY`",
    {
      default: "HEALTHELINK",
    },
  )
  .action(
    async (
      { qe, sftpRoot, referenceDataHome, publishFhir, publishFhirQeId },
    ) => {
      // const rootPath = `${sftpRoot}/${qe}`;
      // const ingressPaths = mod.orchEngineIngressPaths(`${rootPath}/ingress`);
      // console.dir(ingressPaths);

      const govn = new ddbo.DuckDbOrchGovernance(
        true,
        new ddbo.DuckDbOrchEmitContext(),
      );
      const sessionID = await govn.emitCtx.newUUID(false);

      const rootPath = `${sftpRoot}/${qe}`;
      const ingressPath = `${rootPath}/ingress`;
      const workflowPaths = mod.orchEngineWorkflowPaths(
        rootPath,
        sessionID,
      );

      const ingressTxPaths = mod.orchEngineIngressPaths(
        workflowPaths.ingressTx.home,
      );

      const checkIngestionFiles = await prepareIngressTxFiles(
        ingressPath,
        workflowPaths,
      );
      if (checkIngestionFiles) {
        console.dir(ingressPath, workflowPaths.ingressTx.home);

        const fhirEndpointUrl = publishFhir
          ? `https://${publishFhir}?processingAgent=${publishFhirQeId}`
          : undefined;

        const screeningGroups = new mod.ScreeningIngressGroups(
          async (group) => {
            await ingressWorkflow(
              sessionID,
              govn,
              ingressTxPaths,
              group,
              workflowPaths,
              referenceDataHome,
              fhirEndpointUrl,
            );
          },
        );

        const watchPaths: o.WatchFsPath<string, string>[] = [{
          pathID: "ingress",
          rootPath: ingressTxPaths.ingress.home,
          // note: onIngress we just return promises (not awaited) so that we can
          // allow each async workflow to work independently (better performance)
          onIngress: (entry) => {
            const group = screeningGroups.potential(entry);
            try {
              ingressWorkflow(
                sessionID,
                govn,
                ingressTxPaths,
                group ?? entry,
                workflowPaths,
                referenceDataHome,
                fhirEndpointUrl,
              );
            } catch (err) {
              // TODO: store the error in a proper log
              console.dir(entry);
              console.error(err);
            }
          },
        }];

        console.log(`Processing files in ${ingressTxPaths.ingress.home}`);

        await o.ingestWatchedFs({
          drain: (entries) => {
            // note: drain just return promise (not awaited) so that we can allow each
            // async workflow to work independently (better performance).
            if (entries.length) {
              ingressWorkflow(
                sessionID,
                govn,
                ingressTxPaths,
                entries,
                workflowPaths,
                referenceDataHome,
                fhirEndpointUrl,
              );
            }
          },
          watch: false,
          watchPaths,
        });
      }
    },
  )
  .parse();
