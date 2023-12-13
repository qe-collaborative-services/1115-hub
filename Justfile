set dotenv-load
set positional-arguments

default: ingest

# List available recipes and their arguments
list:
    @just --list

# Perform ingestions
ingest: 
    rm -f ingested/ingest-1115-issues.xlsx ingested/ingest-1115.sqlite.db \
      && cat src/ingest-1115.duckdb.sql | duckdb ":memory:"

# Run end-to-end tests
test-e2e: 
    rm -f rm -f support/tabular-assurance/test-results/assurance-issues.xlsx \
                support/tabular-assurance/test-results/assurance-diagnostics.sqlite.db \
      && cat support/tabular-assurance/assurance.duckdb.sql | duckdb ":memory:"

