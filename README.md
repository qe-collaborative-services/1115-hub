# QCS Ingestion Center (QCS-IC) Strategy

The objective of QCS-IC is to get from ingestable content in CSV, Excel, and
similar formats into a SQL-queryable analyst-friendly format as quickly as
possible. Once content is SQL-queryable and analyst-friendly it can be
anonymized, enriched, cleansed, validated, transformed, and pushed to other
formats such as FHIR (JSON).

To facilitate quickly getting ingestable content into a SQL-queryable
analyst-friendly format, QCS-IC employs the following architecture strategy:

- SQL-native encourages performing work inside a DuckDB database as early as
  possible in the ingestion process but all ingested resources can be exported
  into SQLite, MySQL, PostgreSQL, AWS Cloud, Azure Cloud, or other databases for
  portability.
  - All declarative ingestion is done using a relational database (DuckDB).
  - Some imperative structural validation is done using TypeScript (e.g.
    minimally validating the existence of specific sheets in an Excel workbook
    before ingesting so if a source document such as an Excel workbook is deemed
    invalid it's data is never read into the database).
  - Most structural validation of ingested CSVs and Excel workbooks is done
    using SQL (e.g. checking column names).
  - All declarative content validation is done using SQL (using CTEs) with an
    imperative TypeScript or external commands fallback.
  - All declarative content anonymization can be done using SQL CTEs with an
    imperative TypeScript or external commands fallback.
  - All declarative content enrichment can be done using SQL CTEs with an
    imperative TypeScript or external commands fallback (e.g. running REST API
    to match patient IDs or facility IDs in an MPI).
  - All declarative content cleansing can be done using SQL whenever possible
    using CTEs with an imperative TypeScript or external commands fallback.
  - All declarative content transformations can be done using SQL (using CTEs)
    with an imperative TypeScript or external commands fallback.
  - All error reporting is done using a database (for machine consumption), via
    web browser or Excel (for human consumption).
  - All business reporting is done directly from within the DuckDB database or
    exported to SQLite for easy integration into other systems.
  - Local business reporting may also be done using SQLPage, Jupyter notebooks,
    or other edge computing environments.
- Flexible support for local, edge, server, cloud or hybrid models. No code
  changes should be required regardless of which deployment model is chosen.
  - _Local_ allows development on a laptop or any Windows, MacOS, or Linux
    desktop
  - _Edge_ allows services to run within a QE for parts or all of the
    functionality
  - _Server_ allows services to run partially or entirely at a QCS facility in
    case a QE does not want or have the capability to run services _locally_ or
    on the _edge_.
  - _Cloud_ allows services to run partially or entirely in a public or private
    cloud provider (e.g. AWS, Azure, ORACLE Cloud).
- Automatic upgrades of code using `semver` and GitHub tags.

## Runtime (Deployment) Dependencies

All dependencies must be cross-platform, open source with permissive licenses so
that developers and data analysts do not need to procure or purchase any tools.

- Download
  [Deno](https://docs.deno.com/runtime/manual/getting_started/installation)
  Javascript runtime and put it in your `PATH`.
- Download [DuckDB](https://duckdb.org/docs/installation) 0.9+ for ingestion
  operations and put it in your `PATH`.
- Download [SQLPage](https://github.com/lovasoa/SQLpage/releases) SQL browser
  and put it in your `PATH`. This is not strictly required but highly
  recommended for easier diagnostics.

The utilities mentioned above are cross-platform single-file binaries and will
run on Windows, MacOS, or Linux. Please be sure to get the proper binaries for
your platform.

You can run `deno task doctor` (see below) to see if dependencies are installed
properly.

## Build (Development) Dependencies

During build (development) in a sandbox you will need all the runtime
dependencies mentioned above plus do the following:

- Download [Visual Studio Code](https://code.visualstudio.com/download) IDE and
  use it for editing or viewing of CSV and other assets. VS Code is available
  for all major OS platforms.
- Download [SQLite](https://www.sqlite.org/download.html) embedded database and
  put it in your `PATH`.

You can run `deno task doctor` (see below) to see if dependencies are installed
properly.

## Try out the code

You can run the code directly from GitHub (the latest version or any specific
pinned version) without cloning the GitHub repo or clone the repo and run the
code locally.

```bash
$ git clone https://github.com/qe-collaborative-services/1115-hub
$ cd 1115-hub
$ deno task                               # list available tasks in `deno.jsonc`
$ deno task doctor                        # see if dependencies are installed properly
$ deno task ahc-hrsn-screening-test-e2e   # run the ingestion tasks as end-to-end test
$ deno task ahc-hrsn-screening-test-serve # run the ingestion tasks as end-to-end test and serve with SQLPage
$ deno task ahc-hrsn-screening-doc        # generate documentation for the library in support/docs/lib/ahc-hrsn-elt/screening
```

## Architecture and Approach

This code allows multiple operating models, but these two are the most likely
use cases:

- Cloud-only model where a QE does not operate their own code instances to
  validate or manage data and relies on QCS infrastructure only.
  - Benefits: No local infrastructure required
  - Detriments: No ability to validate or analyze aggregated data before sending
    to QCS environment
- Self-sufficient model where a QE can operate their own code instances for
  validation and data management locally and then forwards processed data to the
  QCS infrastructure.
  - Benefits: Ability to validate and analyze aggregated data before sending to
    QCS environment
  - Detriments: Needs small amount of local infrastructure to operate the same
    code running at QCS

### Cloud Only Model

![Architecture](support/docs/cloud-only-architecture.drawio.svg)

### Self-sufficient QE Model

![Architecture](support/docs/self-sufficient-architecture.drawio.svg)
