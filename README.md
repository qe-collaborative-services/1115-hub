# QCS Ingestion Center Strategy

## Dependencies

- Download [Just](https://github.com/casey/just/releases) task runner and put it in your `PATH`.
- Download [DuckDB](https://duckdb.org/docs/installation) 0.9+ for ingestion operations and put it in your `PATH`.
- Download [SQLite](https://www.sqlite.org/download.html) embedded database and put it in your `PATH`

All utilities mentioned above are cross-platform single-file binaries and will run on Windows, MacOS, or Linux. Please be sure to get the proper binaries for your platform. 

## Try out the code

```bash
$ just list           # see all tasks available
$ just ingest         # ingest CSV in `src` and show errors (saved to `ingested`)
$ just test-e2e       # ingest CSV in support/tabular-assurance and show errors
```

## Architecture and Approach

TODO: narratives and explanations

![Architecture](support/docs/architecture.drawio.svg)