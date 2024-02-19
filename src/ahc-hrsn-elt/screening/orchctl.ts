import { Command } from "https://deno.land/x/cliffy@v1.0.0-rc.3/command/mod.ts";
import {
  colors as c,
  path,
  SQLa_orch as o,
  SQLa_orch_duckdb as ddbo,
} from "./deps.ts";
import * as mod from "./mod.ts";

async function ingressWorkflow(
  govn: ddbo.DuckDbOrchGovernance,
  ip: mod.OrchEngineIngressPaths,
  src:
    | mod.ScreeningIngressGroup
    | o.IngressEntry<string, string>
    | o.IngressEntry<string, string>[],
  workflowRootPath: string,
) {
  const sessionID = await govn.emitCtx.newUUID(false);
  const sessionStart = {
    ingressPaths: ip,
    initAt: new Date(),
    sessionID,
    src,
  };

  const workflowPaths = mod.orchEngineWorkflowPaths(
    workflowRootPath,
    sessionID,
  );
  await workflowPaths.initializePaths?.();

  const sessionLogFsPath = workflowPaths.egress.resolvedPath("session.json");
  Deno.writeTextFile(
    sessionLogFsPath,
    JSON.stringify(sessionStart, null, "  "),
  );

  const args: mod.OrchEngineArgs = {
    session: new o.OrchSession(sessionID, govn),
    workflowPaths,
    walkRootPaths: [ip.ingress.home],
    referenceDataHome: path.join(Deno.cwd(), "src/ahc-hrsn-elt/reference-data"),
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

  Deno.writeTextFile(
    sessionLogFsPath,
    JSON.stringify({ ...sessionEnd, finalizeAt: new Date() }, null, "  "),
  );
  console.info(c.dim(sessionLogFsPath));
}

await new Command()
  .name("orchctl")
  .description("A simple reverse proxy example cli.")
  .version("v1.0.0")
  .option("--qe <qe>", "Qe user name.")
  .option("--sftp-root <path>", "Qe user name.", { default: "/SFTP" })
  .action(async ({ qe, sftpRoot }) => {
    const rootPath = `${sftpRoot}/${qe}`;
    const ingressPaths = mod.orchEngineIngressPaths(`${rootPath}/ingress`);
    console.dir(ingressPaths);

    const govn = new ddbo.DuckDbOrchGovernance(
      true,
      new ddbo.DuckDbOrchEmitContext(),
    );

    const screeningGroups = new mod.ScreeningIngressGroups(async (group) => {
      await ingressWorkflow(govn, ingressPaths, group, rootPath);
    });

    const watchPaths: o.WatchFsPath<string, string>[] = [{
      pathID: "ingress",
      rootPath: ingressPaths.ingress.home,
      // note: onIngress we just return promises (not awaited) so that we can
      // allow each async workflow to work independently (better performance)
      onIngress: (entry) => {
        const group = screeningGroups.potential(entry);
        try {
          ingressWorkflow(govn, ingressPaths, group ?? entry, rootPath);
        } catch (err) {
          // TODO: store the error in a proper log
          console.dir(entry);
          console.error(err);
        }
      },
    }];

    console.log(`Processing files in ${ingressPaths.ingress.home}`);
    await o.ingestWatchedFs({
      drain: (entries) => {
        // note: drain just return promise (not awaited) so that we can allow each
        // async workflow to work independently (better performance).
        if (entries.length) {
          ingressWorkflow(govn, ingressPaths, entries, rootPath);
        }
      },
      watch: false,
      watchPaths,
    });
  })
  .parse();
