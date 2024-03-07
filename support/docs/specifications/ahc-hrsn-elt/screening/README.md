# NYeC Specifications

- [ahc-hrsn-2024-02-26-omnibus-rules.xlsx](ahc-hrsn-2024-02-26-omnibus-rules.xlsx)
  contains the "Omnibus Rules" (sample files, external references, business
  rules and remarks in a single Excel Workbook for convenience)
- [DEMOGRAPHIC_DATA_20240307.csv](DEMOGRAPHIC_DATA_20240307.csv) sample data
- [QE_ADMIN_DATA_20240307.csv](QE_ADMIN_DATA_20240307.csv) sample data
- [SCREENING_20240307.csv](SCREENING_20240307.csv) sample data

## File naming conventions

"Grouped" ingress filenames must match the case, prefixes, suffixes as follows:

- `SCREENING*(suffix).csv`
- `QE_ADMIN_DATA*(suffix).csv`
- `DEMOGRAPHIC_DATA*(suffix).csv`

Example Ingress group 1 (`_groupID-01` is arbitrary, `.csv` is required):

- `DEMOGRAPHIC_DATA_groupID-01.csv`
- `QE_ADMIN_DATA_groupID-01.csv`
- `SCREENING_groupID-01.csv`

Example Ingress group 2 (`_mygroup-02` is arbitrary, `.csv` is required):

- `DEMOGRAPHIC_DATA_mygroup-02.csv`
- `QE_ADMIN_DATA_mygroup-02.csv`
- `SCREENING_mygroup-02.csv`

Example Ingress group 3 (`_any_suffix` is arbitrary, `.csv` is required):

- `DEMOGRAPHIC_DATA_any_suffix.csv`
- `QE_ADMIN_DATA_any_suffix.csv`
- `SCREENING_any_suffix.csv`
