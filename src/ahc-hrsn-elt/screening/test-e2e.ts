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
      movedPath: (path, dest) => {
        // don't actually move anything during testing, just pretend
        return dest.resolvedPath(path);
      },
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
  const egress = oeStorablePath(
    "support/assurance/ahc-hrsn-elt/screening/results-test-e2e",
  );

  return {
    ingress,
    inProcess: egress,
    archive: egress,
    egress,

    duckDbFsPathSupplier: () => egress.resolvedPath("ingestion-center.duckdb"),
    prepareDuckDbFsPath: async (duckDbFsPath: string) => {
      try {
        await Deno.remove(duckDbFsPath);
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
  diagsJson: e2eTestFilePaths.egress.resolvedPath("diagnostics.json"),
  diagsMd: e2eTestFilePaths.egress.resolvedPath("diagnostics.md"),
  diagsXlsx: e2eTestFilePaths.egress.resolvedPath("diagnostics.xlsx"),
  resourceDb: e2eTestFilePaths.egress.resolvedPath("resource.sqlite.db"),
  emitDagPuml: async (puml, _previewUrl) => {
    await Deno.writeTextFile(
      e2eTestFilePaths.egress.resolvedPath("dag.puml"),
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

if (args.diagsMd) {
  console.info("📄 Diagnostics are in", c.cyan(args.diagsMd));
}

if (args.resourceDb) {
  // deno-fmt-ignore
  console.info(`📦 ${c.green(args.resourceDb)} has the aggregated content and \`orch_session_*\` validation tables.`);
}
// deno-fmt-ignore
console.info(`🦆 ${c.yellow(e2eTestFilePaths.duckDbFsPathSupplier())} has the raw ingested content and \`orch_session_*\` validation tables.`);
