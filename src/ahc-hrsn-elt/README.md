# 1115 Screening Assurance and ETL

This module is a Deno TypeScript library for building type-safe, reliable and
scalable procedures for extracting Accountable Health Communities (AHC)
Health-Related Social Needs (HRSN) screening data, validating ("assuring") it,
transforming it, enriching it and loading it in a relational or other database.

## Layout

```
/
├── src/
│   └── ahc-hrsn-elt/                  # code for AHC HRSN functionality
│       └── screening/                 # 
│           ├── csv.ts                 # module which helps build DuckDB SQL for CSV ingestion
│           ├── deps.ts                # all external dependencies used by this module
│           ├── excel.ts               # module which helps build DuckDB SQL for Excel workbook ingestion
│           ├── governance.ts          # business rules and other "governance" code  
│           ├── orchestrate.ts         # orchestration workflow (notebook cells) code
│           ├── sqlpage.ts             # SQLPage server diagnostics code notebook 
│           ├── mod.ts                 # Deno module entrypoint when building your own code
│           └── test-e2e.ts            # code executed when `deno task ahc-hrsn-screening-test-e2e` is run
|
└── support/                           # scripts, libraries, and modules which support this project for development or deployment
    ├── assurance/                     # quality assurance code and utilities
    │   └── ahc-hrsn-elt/              # 
    │       └── screening/             # 
    │           ├── results-test-e2e/  # location where src/ahc-hrsn-elt/screening/test-e2e.ts emits results
    │           └── synthetic-content/ # location where src/ahc-hrsn-elt/screening/test-e2e.ts sources content
    │
    ├── bin/                           # doctor.ts and other supporting binaries
    │
    └── docs/                          # documentation and related artifacts
```
