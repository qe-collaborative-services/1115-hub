import { SQLa_orch_duckdb as ddbo } from "./deps.ts";
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
const govn = new ddbo.OrchGovernance(true);
const args: mod.OrchEngineArgs = {
  session: new ddbo.OrchSession(govn),
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
await ddbo.orchestrate(mod.OrchEngine.prototype, mod.oeDescr, {
  govn,
  newInstance: () =>
    new mod.OrchEngine(mod.fsPatternIngestSourcesSupplier(govn), govn, args),
}, args);
