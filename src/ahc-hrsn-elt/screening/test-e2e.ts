import {
  colors as c,
  SQLa_orch as o,
  SQLa_orch_duckdb as ddbo,
} from "./deps.ts";
import * as mod from "./mod.ts";

/**
 * End-to-End (e2e) test case for AHC HRSN Extract Load Transform (ELT) module.
 * TODO:
 * - add Deno 'watch' capability with specific directories so new files
 *   automatically run code
 * - add Deno 'cron' capability in case 'watch' functionality is not desired and
 *   time-based execution is more suitable.
 * - consider adding Cliffy-based CLI as controllers for watch / cron
 */

// Assume all paths are relative to the root of this repo because this module
// is executed using `deno task ahc-hrsn-screening-test-e2e` from repo root.

const ahcHrsnScreeningHome = `support/assurance/ahc-hrsn-elt/screening`;
const resultsHome = `${ahcHrsnScreeningHome}/results-test-e2e`;
const govn = new ddbo.DuckDbOrchGovernance(
  true,
  new ddbo.DuckDbOrchEmitContext(),
);

const args: mod.OrchEngineArgs = {
  session: new o.OrchSession(govn),
  walkRootPaths: [`${ahcHrsnScreeningHome}/synthetic-content`],
  duckDbDestFsPathSupplier: () => `${resultsHome}/ingestion-center.duckdb`,
  prepareDuckDbFsPath: async (duckDbFsPath: string) => {
    try {
      await Deno.remove(duckDbFsPath);
    } catch (_err) {
      // ignore errors if file does not exist
    }
  },
  diagsJson: `${resultsHome}/diagnostics.json`,
  diagsMd: `${resultsHome}/diagnostics.md`,
  diagsXlsx: `${resultsHome}/diagnostics.xlsx`,
  resourceDb: `${resultsHome}/resource.sqlite.db`,
  emitDagPuml: async (puml, _previewUrl) => {
    await Deno.writeTextFile(`${resultsHome}/dag.puml`, puml);
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
console.info(`🦆 ${c.yellow(args.duckDbDestFsPathSupplier())} has the raw ingested content and \`orch_session_*\` validation tables.`);
