export * as fs from "https://deno.land/std@0.209.0/fs/mod.ts";
export * as path from "https://deno.land/std@0.209.0/path/mod.ts";
export * as yaml from "https://deno.land/std@0.209.0/yaml/stringify.ts";
export * as uuid from "https://deno.land/std@0.209.0/uuid/mod.ts";

export * as cliffy from "https://deno.land/x/cliffy@v1.0.0-rc.3/command/mod.ts";
export * as dax from "https://deno.land/x/dax@0.36.0/mod.ts";

// local: ../../netspective-labs/sql-aide
// remote: https://raw.githubusercontent.com/netspective-labs/sql-aide/v0.11.9

// export * as SQLa from "../../netspective-labs/sql-aide/render/mod.ts";
// export * as SQLa_ddb_dialect from "../../netspective-labs/sql-aide/render/dialect/duckdb/mod.ts";
// export * as SQLa_ddb_ingest from "../../netspective-labs/sql-aide/pattern/ingest/duckdb/mod.ts";

export * as SQLa from "https://raw.githubusercontent.com/netspective-labs/sql-aide/v0.11.9/render/mod.ts";
export * as SQLa_ddb_dialect from "https://raw.githubusercontent.com/netspective-labs/sql-aide/v0.11.9/render/dialect/duckdb/mod.ts";
export * as SQLa_ddb_ingest from "https://raw.githubusercontent.com/netspective-labs/sql-aide/v0.11.9/pattern/ingest/duckdb/mod.ts";
