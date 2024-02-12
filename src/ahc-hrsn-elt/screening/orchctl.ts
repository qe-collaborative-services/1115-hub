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
) {
  const sessionID = await govn.emitCtx.newUUID(false);

  const workflowPaths = mod.orchEngineWorkflowPaths(sftpSimulator, sessionID);
  await workflowPaths.initializePaths?.();

  const args: mod.OrchEngineArgs = {
    session: new o.OrchSession(sessionID, govn),
    workflowPaths,
    walkRootPaths: [ip.ingress.home],
    emitDagPuml: async (puml, _previewUrl) => {
      await Deno.writeTextFile(
        workflowPaths.inProcess.resolvedPath("dag.puml"),
        puml,
      );
    },
  };

  const workflow = await o.orchestrate<
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

  const archiveHome = workflowPaths.ingressArchive?.home;
  const consumeIngressed = async (fsPath: string) => {
    if (archiveHome) {
      await Deno.rename(fsPath, path.join(archiveHome, path.basename(fsPath)));
      console.info(c.dim(`moved ${fsPath} to ${archiveHome}`)); // TODO: move to proper log
    } else {
      await Deno.remove(fsPath);
      console.info(c.dim(`consumed (removed) ${fsPath}`)); // TODO: move to proper log
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

  if (workflow?.duckdb.stdErrsEncountered) {
    // deno-fmt-ignore
    console.error(`❌ ${c.brightRed("DuckDB orchestration SQL syntax/parsing errors encountered (ingestion state is indeterminate).")}`);
  } else {
    console.info(
      "✅ No DuckDB orchestration SQL syntax or SQL parsing errors encountered.",
    );
  }

  const { diagsMdSupplier, resourceDbSupplier } = workflowPaths.egress;

  if (diagsMdSupplier) {
    console.info("📄 Diagnostics are in", c.cyan(diagsMdSupplier()));
  }

  if (resourceDbSupplier) {
    // deno-fmt-ignore
    console.info(`📦 ${c.green(resourceDbSupplier())} has the aggregated content and \`orch_session_*\` validation tables.`);
  }
  // deno-fmt-ignore
  console.info(`🦆 ${c.yellow(workflowPaths.inProcess.duckDbFsPathSupplier())} has the raw ingested content and \`orch_session_*\` validation tables.`);
}

// TODO: after testing, remove the simulator
const sftpSimulator = "SFTP-simulator" as const;
const ingressPaths = mod.orchEngineIngressPaths(`${sftpSimulator}/ingress`);
console.log("Removing and re-creating", sftpSimulator);
try {
  await Deno.remove(sftpSimulator, { recursive: true });
  // deno-lint-ignore no-empty
} catch (_) {}
await Deno.mkdir(ingressPaths.ingress.home, { recursive: true });

const govn = new ddbo.DuckDbOrchGovernance(
  true,
  new ddbo.DuckDbOrchEmitContext(),
);

const screeningGroups = new mod.ScreeningIngressGroups(async (group) => {
  await ingressWorkflow(govn, ingressPaths, group);
});

const watchPaths: o.WatchFsPath<string, string>[] = [{
  pathID: "ingress",
  rootPath: ingressPaths.ingress.home,
  // note: onIngress we just return promises (not awaited) so that we can
  // allow each async workflow to work independently (better performance)
  onIngress: (entry) => {
    const group = screeningGroups.potential(entry);
    try {
      ingressWorkflow(govn, ingressPaths, group ?? entry);
    } catch (err) {
      // TODO: store the error in a proper log
      console.dir(entry);
      console.error(err);
    }
  },
}];

console.log(`Waiting for files in ${ingressPaths.ingress.home}`);
await o.ingestWatchedFs({
  drain: (entries) => {
    // note: drain just return promise (not awaited) so that we can allow each
    // async workflow to work independently (better performance).
    if (entries.length) ingressWorkflow(govn, ingressPaths, entries);
  },
  watch: true,
  watchPaths,
});
