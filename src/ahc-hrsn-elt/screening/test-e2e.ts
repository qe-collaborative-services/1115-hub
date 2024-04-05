import {
  colors as c,
  path,
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

  if (workflow?.duckdb.stdErrsEncountered) {
    // deno-fmt-ignore
    console.error(`❌ ${c.brightRed("DuckDB orchestration SQL syntax/parsing errors encountered (ingestion state is indeterminate).")}`);
  } else {
    console.info(
      "✅ No DuckDB orchestration SQL syntax or SQL parsing errors encountered.",
    );
  }

  const { diagsMdSupplier, resourceDbSupplier } = e2eTestPaths.egress;

  if (diagsMdSupplier) {
    console.info("📄 Diagnostics are in", c.cyan(diagsMdSupplier()));
  }

  if (resourceDbSupplier) {
    // deno-fmt-ignore
    console.info(`📦 ${c.green(resourceDbSupplier())} has the aggregated content and \`orch_session_*\` validation tables.`);
  }

  // deno-fmt-ignore
  console.info(`🦆 ${c.yellow(e2eTestPaths.inProcess.duckDbFsPathSupplier())} has the raw ingested content and \`orch_session_*\` validation tables.`);
}

function e2eTestWorkflowPaths(rootPath: string): mod.OrchEngineWorkflowPaths {
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

  const inProcess: mod.OrchEngineWorkflowPaths["inProcess"] = {
    ...oeStorablePath(
      "support/assurance/ahc-hrsn-elt/screening/results-test-e2e",
    ),
    duckDbFsPathSupplier: () =>
      inProcess.resolvedPath("ingestion-center.duckdb"),
  };
  const egress: mod.OrchEngineWorkflowPaths["egress"] = {
    ...oeStorablePath(
      "support/assurance/ahc-hrsn-elt/screening/results-test-e2e",
    ),
    diagsJsonSupplier: () => egress.resolvedPath("diagnostics.json"),
    diagsMdSupplier: () => egress.resolvedPath("diagnostics.md"),
    diagsXlsxSupplier: () => egress.resolvedPath("diagnostics.xlsx"),
    resourceDbSupplier: () => egress.resolvedPath("resource.sqlite.db"),
    fhirJsonSupplier: (id: string) => {
      return egress.resolvedPath("fhir-" + id + ".json");
    },
    fhirHttpSupplier: () => egress.resolvedPath("fhir.http"),
  };

  return {
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

const e2eIngressPaths = mod.orchEngineIngressPaths(
  "support/assurance/ahc-hrsn-elt/screening/synthetic-content",
);
const e2eTestPaths = e2eTestWorkflowPaths(Deno.cwd());
const govn = new ddbo.DuckDbOrchGovernance(
  true,
  new ddbo.DuckDbOrchEmitContext(),
);
const sessionID = await govn.emitCtx.newUUID(true);
const args: mod.OrchEngineArgs = {
  session: new o.OrchSession(sessionID, govn, mod.ORCHESTRATE_VERSION),
  workflowPaths: e2eTestPaths,
  walkRootPaths: [e2eIngressPaths.ingress.home],
  referenceDataHome: path.join(Deno.cwd(), "src/ahc-hrsn-elt/reference-data"),
  emitDagPuml: async (puml, _previewUrl) => {
    await Deno.writeTextFile(
      e2eTestPaths.inProcess.resolvedPath("dag.puml"),
      puml,
    );
  },
};

const screeningGroups = new mod.ScreeningIngressGroups(async (group) => {
  await ingressWorkflow(govn, group);
});

const watchPaths: o.WatchFsPath<string, string>[] = [{
  pathID: "ingress",
  rootPath: e2eIngressPaths.ingress.home,
  onIngress: async (entry) => {
    const group = screeningGroups.potential(entry);
    await ingressWorkflow(govn, group ?? entry);
  },
}];

await o.ingestWatchedFs({
  drain: async (entries) => await ingressWorkflow(govn, entries),
  watch: false,
  watchPaths,
});
