// orch-http-service.ts
import { Command } from "https://deno.land/x/cliffy@v1.0.0-rc.3/command/mod.ts";
import {
  Application,
  Context,
  Router,
} from "https://deno.land/x/oak@v12.6.2/mod.ts";
import JSZip from "npm:jszip";
import {
  colors as c,
  path,
  SQLa_orch as o,
  SQLa_orch_duckdb as ddbo,
} from "./deps.ts";
import * as mod from "./mod.ts";

async function addFolderToZip(
  zip: JSZip,
  folderPath: string,
  zipFolderPath = "",
) {
  for await (const entry of Deno.readDir(folderPath)) {
    const fullPath = path.join(folderPath, entry.name);
    const zipPath = path.join(zipFolderPath, entry.name);

    if (entry.isDirectory) {
      await addFolderToZip(zip, fullPath, zipPath); // Recurse into subdirectories
    } else if (entry.isFile) {
      const fileContent = await Deno.readFile(fullPath);
      zip.file(zipPath, fileContent); // Add files to zip
    }
  }
}

async function orchestrateFiles(
  sessionID: string,
  govn: ddbo.DuckDbOrchGovernance,
  ip: mod.OrchEngineIngressPaths,
  src:
    | mod.ScreeningIngressGroup
    | o.IngressEntry<string, string>
    | o.IngressEntry<string, string>[],
  workflowPaths: mod.OrchEngineWorkflowPaths,
  referenceDataHome: string,
  submitShinNy: string,
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
  if (fhirEndpointUrl && submitShinNy == "yes") {
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

  Deno.writeTextFile(
    sessionLogFsPath,
    JSON.stringify({ ...sessionEnd, finalizeAt: new Date() }, null, "  "),
  );
  console.info(c.dim(sessionLogFsPath));
}

const runServer = async (
  host: string,
  port: number,
  rootPath: string,
  referenceDataHome: string,
  shinnyFhirUrl: string,
) => {
  const app = new Application();
  const router = new Router();

  router.post("/orchestrate.zip", async (context: Context) => {
    if (!context.request.hasBody) {
      context.response.status = 400;
      context.response.body = "No data submitted";
      return;
    }

    const bodyResult = context.request.body({ type: "form-data" });
    const formData = await bodyResult.value.read();
    if (!formData.fields.qe) {
      context.response.status = 400;
      context.response.body = "No QE found in the request.";
      return;
    }
    let submitShinNY = "yes";
    if (formData.fields["submit-shin-ny"]) {
      submitShinNY = formData.fields["submit-shin-ny"].toLowerCase();
    }
    const formDataFiles = formData.files ? formData.files : [];
    if (formDataFiles.length == 0) {
      context.response.status = 400;
      context.response.body = "No files found in the request.";
      return;
    }
    const qe = formData.fields.qe;
    const govn = new ddbo.DuckDbOrchGovernance(
      true,
      new ddbo.DuckDbOrchEmitContext(),
    );
    const sessionID = await govn.emitCtx.newUUID(false);
    const basePath = `${rootPath}/${qe}`;
    const egressPath = `${rootPath}/${qe}/egress`;
    const ingressTxPath = `${egressPath}/${sessionID}/.ingress-tx`;
    const egressSessionPath = `${egressPath}/${sessionID}`;
    const workflowPaths = mod.orchEngineWorkflowPaths(
      basePath,
      sessionID,
    );

    const ingressTxPaths = mod.orchEngineIngressPaths(
      workflowPaths.ingressTx.home,
    );
    await workflowPaths.initializePaths?.();
    console.log(ingressTxPath);
    for (const files of formDataFiles) {
      if (files.contentType == "application/zip" && files.filename) {
        const zip = new JSZip();
        // Read the file from the filename path
        const zipData = await Deno.readFile(files.filename);
        const unzippedData = await zip.loadAsync(zipData);

        await Promise.all(
          Object.keys(unzippedData.files).map(async (fileName) => {
            const file = unzippedData.files[fileName];
            if (!file.dir) {
              const content = await file.async("uint8array");
              const filePath = path.join(ingressTxPath, fileName);
              await Deno.writeFile(filePath, content);
            }
          }),
        );
      } else {
        if (files.filename) {
          const filePath = path.join(ingressTxPath, files.originalName);
          await Deno.writeFile(filePath, await Deno.readFile(files.filename));
        }
      }
    }
    const screeningGroups = new mod.ScreeningIngressGroups(
      async (group) => {
        await orchestrateFiles(
          sessionID,
          govn,
          ingressTxPaths,
          group,
          workflowPaths,
          referenceDataHome,
          submitShinNY,
          shinnyFhirUrl,
        );
      },
    );
    const watchPaths: o.WatchFsPath<string, string>[] = [{
      pathID: "ingress",
      rootPath: ingressTxPaths.ingress.home,
      onIngress: (entry) => {
        const group = screeningGroups.potential(entry);
        try {
          orchestrateFiles(
            sessionID,
            govn,
            ingressTxPaths,
            group ?? entry,
            workflowPaths,
            referenceDataHome,
            submitShinNY,
            shinnyFhirUrl,
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
      drain: async (entries) => {
        if (entries.length) {
          await orchestrateFiles(
            sessionID,
            govn,
            ingressTxPaths,
            entries,
            workflowPaths,
            referenceDataHome,
            submitShinNY,
            shinnyFhirUrl,
          );
          const zip = new JSZip();
          await addFolderToZip(zip, egressSessionPath);
          const zipContent = await zip.generateAsync({
            type: "uint8array",
          });
          // Specify the final ZIP file path
          const finalZipPath = path.join(
            egressPath,
            sessionID,
            "egress-tx.zip",
          );
          await Deno.writeFile(finalZipPath, zipContent);
          console.log(
            `Completed processing files in ${ingressTxPaths.ingress.home}`,
          );
          // context.response.body = "ZIP file processed and saved successfully.";
          // Use below code to emit the zip file
          context.response.body = zipContent;
          context.response.type = "application/zip";
        }
      },
      watch: false,
      watchPaths,
    });
  });

  //TODO: orchestrate.json
  router.post("/orchestrate.json", async (_context: Context) => {
  });

  app.use(router.routes());
  app.use(router.allowedMethods());

  console.log(`Server running on ${host}:${port}`);
  await app.listen({ hostname: host, port: port });
};

await new Command()
  .name("orch-http-service")
  .description("HTTP service for orchestrating ZIP file processing.")
  .option("-p, --port [port:number]", "Port to run the HTTP server on.", {
    default: 8000,
    value: (port) => {
      const parsedPort = Number(port);
      if (isNaN(parsedPort) || parsedPort < 1 || parsedPort > 65535) {
        throw new Error("Port must be a number between 1 and 65535.");
      }
      return parsedPort;
    },
  })
  .option("-H, --host <host:string>", "Host for the HTTP server", {
    default: "127.0.0.1",
  })
  .option("--session-artifacts-home <path>", "Root path", { default: "/HTTP" })
  .option("--reference-data-home <path>", "Reference data path", {
    default: path.join(Deno.cwd(), "src/ahc-hrsn-elt/reference-data"),
  })
  .option("--shinny-fhir-url <url:string>", "SHIN-NY FHIR endpoint URL.", {
    default: "https://default-fhir-url.com",
  })
  .action(
    (
      {
        host,
        port,
        sessionArtifactsHome,
        referenceDataHome,
        shinnyFhirUrl,
      },
    ) => {
      runServer(
        host,
        port,
        sessionArtifactsHome,
        referenceDataHome,
        shinnyFhirUrl,
      );
    },
  )
  .parse(Deno.args);
