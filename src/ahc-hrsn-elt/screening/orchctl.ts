import {
  colors as c,
  SQLa_orch as o,
  SQLa_orch_duckdb as ddbo,
} from "./deps.ts";
import * as mod from "./mod.ts";

async function ingressWorkflow(
  govn: ddbo.DuckDbOrchGovernance,
  src:
    | mod.ScreeningIngressGroup
    | o.IngressEntry<string, string>
    | o.IngressEntry<string, string>[],
) {
  console.dir(src); // TODO: log this properly

  const sessionID = await govn.emitCtx.newUUID(false);

  const paths = mod.orchEngineFsPathTree(sftpSimulator, sessionID);
  await Deno.mkdir(paths.inProcess.home, { recursive: true });
  await Deno.mkdir(paths.egress.home, { recursive: true });

  const args: mod.OrchEngineArgs = {
    session: new o.OrchSession(sessionID, govn),
    paths,
    walkRootPaths: [paths.ingress.home],
    emitDagPuml: async (puml, _previewUrl) => {
      await Deno.writeTextFile(
        paths.inProcess.resolvedPath("dag.puml"),
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

  // TODO: if paths.ingress.archive is provided, move the sources to the archive
  // if (mod.isScreeningIngressGroup(src)) {
  //   src.entries.forEach(async (entry) => paths.ingress.archive);
  // } else {
  //   if (Array.isArray(src)) {
  //     src.forEach(async (entry) => await collect(entry.fsPath));
  //   } else {
  //     await collect(src.fsPath);
  //   }
  // }

  if (workflow?.duckdb.stdErrsEncountered) {
    // deno-fmt-ignore
    console.error(`❌ ${c.brightRed("DuckDB orchestration SQL syntax/parsing errors encountered (ingestion state is indeterminate).")}`);
  } else {
    console.info(
      "✅ No DuckDB orchestration SQL syntax or SQL parsing errors encountered.",
    );
  }

  const { diagsMdSupplier, resourceDbSupplier } = paths.egress;

  if (diagsMdSupplier) {
    console.info("📄 Diagnostics are in", c.cyan(diagsMdSupplier()));
  }

  if (resourceDbSupplier) {
    // deno-fmt-ignore
    console.info(`📦 ${c.green(resourceDbSupplier())} has the aggregated content and \`orch_session_*\` validation tables.`);
  }
  // deno-fmt-ignore
  console.info(`🦆 ${c.yellow(paths.inProcess.duckDbFsPathSupplier())} has the raw ingested content and \`orch_session_*\` validation tables.`);

  // TODO: if no syntax/compile errors encountered, move "inprocess" to "egress"
  // if (mod.isScreeningIngressGroup(src)) {
  //   src.entries.forEach(async (entry) => paths.ingress.archive);
  // } else {
  //   if (Array.isArray(src)) {
  //     src.forEach(async (entry) => await collect(entry.fsPath));
  //   } else {
  //     await collect(src.fsPath);
  //   }
  // }
}

// TODO: after testing, remove the simulator
const sftpSimulator = "SFTP-simulator" as const;
const sftpSimulatorIngress = `${sftpSimulator}/ingress` as const;
console.log("Removing and re-creating", sftpSimulator);
try {
  await Deno.remove(sftpSimulator, { recursive: true });
  // deno-lint-ignore no-empty
} catch (_) {}
await Deno.mkdir(sftpSimulatorIngress, { recursive: true });

const govn = new ddbo.DuckDbOrchGovernance(
  true,
  new ddbo.DuckDbOrchEmitContext(),
);

const screeningGroups = new mod.ScreeningIngressGroups(async (group) => {
  await ingressWorkflow(govn, group);
});

const watchPaths: o.WatchFsPath<string, string>[] = [{
  pathID: "ingress",
  rootPath: sftpSimulatorIngress,
  onIngress: async (entry) => {
    const group = screeningGroups.potential(entry);
    await ingressWorkflow(govn, group ?? entry);
  },
}];

console.log(`Waiting for files in ${sftpSimulatorIngress}`);
await o.ingestWatchedFs({
  drain: async (entries) => {
    if (entries.length) await ingressWorkflow(govn, entries);
  },
  watch: true,
  watchPaths,
});
