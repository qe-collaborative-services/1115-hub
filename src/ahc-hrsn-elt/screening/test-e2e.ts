import {
  colors as c,
  path,
  SQLa_orch as o,
  SQLa_orch_duckdb as ddbo,
} from "./deps.ts";
import * as mod from "./mod.ts";

export function e2eTestFsPathTree(rootPath: string): mod.OrchEnginePaths {
  const oePath = (childPath: string): mod.OrchEnginePath => {
    const home = path.join(rootPath, childPath);
    const resolvedPath = (child: string) => path.join(home, child);

    return {
      home,
      resolvedPath,
      // don't actually move anything during testing, just pretend
      movedPath: (path, dest) => dest.resolvedPath(path),
    };
  };

  const oeStorablePath = (childPath: string): mod.OrchEngineStorablePath => {
    const oep = oePath(childPath);
    return {
      ...oep,
      storedContent: async (path, content) => {
        const dest = oep.resolvedPath(path);
        await Deno.writeTextFile(dest, content);
        return dest;
      },
    };
  };

  const ingress = oePath(
    "support/assurance/ahc-hrsn-elt/screening/synthetic-content",
  );
  const inProcess: mod.OrchEnginePaths["inProcess"] = {
    ...oeStorablePath(
      "support/assurance/ahc-hrsn-elt/screening/results-test-e2e",
    ),
    duckDbFsPathSupplier: () =>
      inProcess.resolvedPath("ingestion-center.duckdb"),
  };
  const egress: mod.OrchEnginePaths["egress"] = {
    ...oeStorablePath(
      "support/assurance/ahc-hrsn-elt/screening/results-test-e2e",
    ),
    diagsJsonSupplier: () => egress.resolvedPath("diagnostics.json"),
    diagsMdSupplier: () => egress.resolvedPath("diagnostics.md"),
    diagsXlsxSupplier: () => egress.resolvedPath("diagnostics.xlsx"),
    resourceDbSupplier: () => egress.resolvedPath("resource.sqlite.db"),
  };

  return {
    ingress,
    inProcess,
    egress,

    initializePaths: async () => {
      try {
        await Deno.remove(inProcess.duckDbFsPathSupplier());
      } catch (_err) {
        // ignore errors if file does not exist
      }
    },
  };
}

// Assume all paths are relative to the root of this repo because this module
// is executed using `deno task ahc-hrsn-screening-test-e2e` from repo root.

const e2eTestFilePaths = e2eTestFsPathTree(Deno.cwd());
const govn = new ddbo.DuckDbOrchGovernance(
  true,
  new ddbo.DuckDbOrchEmitContext(),
);
const sessionID = await govn.emitCtx.newUUID(true);
const args: mod.OrchEngineArgs = {
  session: new o.OrchSession(sessionID, govn),
  paths: e2eTestFilePaths,
  walkRootPaths: [e2eTestFilePaths.ingress.home],
  emitDagPuml: async (puml, _previewUrl) => {
    await Deno.writeTextFile(
      e2eTestFilePaths.inProcess.resolvedPath("dag.puml"),
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
    new mod.OrchEngine(mod.fsPatternIngestSourcesSupplier(govn), govn, args),
}, args);

if (workflow?.duckdb.stdErrsEncountered) {
  // deno-fmt-ignore
  console.error(`❌ ${c.brightRed("DuckDB orchestration SQL syntax/parsing errors encountered (ingestion state is indeterminate).")}`);
} else {
  console.info(
    "✅ No DuckDB orchestration SQL syntax or SQL parsing errors encountered.",
  );
}

const { diagsMdSupplier, resourceDbSupplier } = e2eTestFilePaths.egress;

if (diagsMdSupplier) {
  console.info("📄 Diagnostics are in", c.cyan(diagsMdSupplier()));
}

if (resourceDbSupplier) {
  // deno-fmt-ignore
  console.info(`📦 ${c.green(resourceDbSupplier())} has the aggregated content and \`orch_session_*\` validation tables.`);
}
// deno-fmt-ignore
console.info(`🦆 ${c.yellow(e2eTestFilePaths.inProcess.duckDbFsPathSupplier())} has the raw ingested content and \`orch_session_*\` validation tables.`);
