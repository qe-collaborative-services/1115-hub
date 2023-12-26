# QCS Ingestion Center Strategy

- SQL-native encourages performing work inside a database as early as possible
  - All ingestion is done using a relational database
  - All validation is done using a relational database and pure SQL
  - All error reporting is done using a database (for machine consumption) or
    Excel (for human consumption)
  - All business reporting is done using a database
- Support for local, edge, or server based models.
  - _Local_ allows development on a laptop or any Windows, MacOS, or Linux
    desktop
  - _Edge_ allows services to run within a QE for parts or all of the
    functionality
  - _Server_ allows services to run partially or entirely at a QCS facility in
    case a QE does not want or have the capability to run services _locally_ or
    on the _edge_.
- Automatic upgrades of code using `semver` and GitHub tags.

## Dependencies

- Download
  [Deno](https://docs.deno.com/runtime/manual/getting_started/installation)
  Javascript runtime and put it in your `PATH`.
- Download [DuckDB](https://duckdb.org/docs/installation) 0.9+ for ingestion
  operations and put it in your `PATH`.

The utilities mentioned above are cross-platform single-file binaries and will
run on Windows, MacOS, or Linux. Please be sure to get the proper binaries for
your platform.

## Development Tools

- Download [Visual Studio Code](https://code.visualstudio.com/download) IDE and
  use it for editing or viewing of CSV and other assets. VS Code is available
  for all major OS platforms.
- Download [SQLite](https://www.sqlite.org/download.html) embedded database and
  put it in your `PATH`.

## Try out the code

You can run the code directly from GitHub (the latest version or any specific
pinned version) without cloning the GitHub repo or clone the repo and run the
code locally.

```bash
$ git clone https://github.com/qe-collaborative-services/1115-hub
$ cd 1115-hub
$ deno task                 # list available tasks in `deno.jsonc`
$ deno task doctor          # see if dependencies are installed properly
$ deno task test-e2e        # run the ingestion tasks as end-to-end test
```

## Architecture and Approach

TODO: narratives and explanations

![Architecture](support/docs/architecture.drawio.svg)
