#!/usr/bin/env -S deno run --allow-read --allow-write --allow-env --allow-run --allow-sys

import { cliffy } from "./deps.ts";
import * as i from "./src/ingest.ts";

async function CLI() {
  const govn = new i.Governance();

  const callerName = import.meta.resolve(import.meta.url);
  await new cliffy.Command()
    .name(callerName.slice(callerName.lastIndexOf("/") + 1))
    .version("0.1.0")
    .description("QE Collaborative Services (QCS) Controller")
    .option(
      "--ic-db <file:string>",
      "The ingestion center (IC) DuckDB database file name",
      { required: true, default: "ingestion-center.duckdb" },
    )
    .option(
      "--ic-deterministic-pk",
      "Whether ingestion center (IC) deterministic primary keys should be used (for testing)",
      { required: true, default: false },
    )
    .option(
      "--duckdb-cmd <file:string>",
      "The DuckDB CLI command to use for orchestration",
      { required: true, default: "duckdb" },
    )
    .option(
      "-r, --root-path <directory:string>",
      "The root path to walk to find src files",
      { required: true, default: Deno.cwd() },
    )
    .option("-s, --src <glob:string>", "Source globs (multiple allowed)", {
      collect: true,
      required: true,
    })
    .option(
      "--diags-xlsx <file:string>",
      "Excel file to store human-friendly diagnostics in",
    )
    .option("--diags-json <file:string>", "JSON file to store diagnostics in")
    .option("--diags-md <file:string>", "Markdown file to store diagnostics in")
    .option("--diags-dag-puml <file:string>", "Emit DAG PlantUML diagram")
    .option(
      "--resource-db <file:string>",
      "The resource SQLite database file name",
    )
    .action(async (args) => {
      await i.IngestEngine.run(args, govn);
    })
    .command("help", new cliffy.HelpCommand().global())
    .command("completions", new cliffy.CompletionsCommand())
    .parse();
}

if (import.meta.main) {
  await CLI();
}
