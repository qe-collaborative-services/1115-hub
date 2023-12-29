export * as fs from "https://deno.land/std@0.209.0/fs/mod.ts";
export * as path from "https://deno.land/std@0.209.0/path/mod.ts";
export * as yaml from "https://deno.land/std@0.209.0/yaml/stringify.ts";
export * as uuid from "https://deno.land/std@0.209.0/uuid/mod.ts";

export * as cliffy from "https://deno.land/x/cliffy@v1.0.0-rc.3/command/mod.ts";
export * as dax from "https://deno.land/x/dax@0.36.0/mod.ts";

// local: ../../netspective-labs/sql-aide
// remote: https://raw.githubusercontent.com/netspective-labs/sql-aide/v0.11.13

export * as chainNB from "https://raw.githubusercontent.com/netspective-labs/sql-aide/v0.11.13/lib/notebook/chain-of-responsibility.ts";
export * as duckdb_shell from "https://raw.githubusercontent.com/netspective-labs/sql-aide/v0.11.13/lib/duckdb/mod.ts";
export * as ws from "https://raw.githubusercontent.com/netspective-labs/sql-aide/v0.11.13/lib/universal/whitespace.ts";

export * as SQLa from "https://raw.githubusercontent.com/netspective-labs/sql-aide/v0.11.13/render/mod.ts";
export * as SQLa_ddb_dialect from "https://raw.githubusercontent.com/netspective-labs/sql-aide/v0.11.13/render/dialect/duckdb/mod.ts";
export * as SQLa_ddb_ingest from "https://raw.githubusercontent.com/netspective-labs/sql-aide/v0.11.13/pattern/ingest/duckdb/mod.ts";
export * as SQLa_ddb_ingestnb from "https://raw.githubusercontent.com/netspective-labs/sql-aide/v0.11.13/pattern/ingest/duckdb/notebook.ts";
