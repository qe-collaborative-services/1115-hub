---
rootPaths:
  - support/assurance/ahc-hrsn-elt/screening/synthetic-content
icDb: >-
  support/assurance/ahc-hrsn-elt/screening/results-test-e2e/ingestion-center.duckdb
diagsMd: support/assurance/ahc-hrsn-elt/screening/results-test-e2e/diagnostics.md
diagsXlsx: support/assurance/ahc-hrsn-elt/screening/results-test-e2e/diagnostics.xlsx
resourceDb: support/assurance/ahc-hrsn-elt/screening/results-test-e2e/resource.sqlite.db
sources:
  - uri: >-
      support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail.csv
    nature: CSV
    tableName: synthetic_fail
    assurable: false
  - uri: >-
      support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-12-12-2023-valid.csv
    nature: CSV
    tableName: ahc_hrsn_12_12_2023_valid
    assurable: true
  - uri: >-
      support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx
    nature: ERROR
    tableName: ERROR
    assurable: false
  - uri: >-
      support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx
    nature: Excel Workbook Sheet
    tableName: ahc_hrsn_valid_01_admin_demographic
    assurable: false
  - uri: >-
      support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx
    nature: Excel Workbook Sheet
    tableName: ahc_hrsn_valid_01_screening
    assurable: false
  - uri: >-
      support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx
    nature: Excel Workbook Sheet
    tableName: ahc_hrsn_valid_01_q_e_admin_data
    assurable: false
---
# Ingest Diagnostics

## init
```sql

-- no before-init SQL found
CREATE TABLE IF NOT EXISTS "ingest_session" (
    "ingest_session_id" TEXT PRIMARY KEY NOT NULL,
    "ingest_started_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "ingest_finished_at" TIMESTAMPTZ,
    "elaboration" TEXT
);
CREATE TABLE IF NOT EXISTS "ingest_session_entry" (
    "ingest_session_entry_id" TEXT PRIMARY KEY NOT NULL,
    "session_id" TEXT NOT NULL,
    "ingest_src" TEXT NOT NULL,
    "ingest_table_name" TEXT,
    "elaboration" TEXT,
    FOREIGN KEY("session_id") REFERENCES "ingest_session"("ingest_session_id")
);
CREATE TABLE IF NOT EXISTS "ingest_session_state" (
    "ingest_session_state_id" TEXT PRIMARY KEY NOT NULL,
    "session_id" TEXT NOT NULL,
    "session_entry_id" TEXT,
    "from_state" TEXT NOT NULL,
    "to_state" TEXT NOT NULL,
    "transition_result" TEXT,
    "transition_reason" TEXT,
    "transitioned_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "elaboration" TEXT,
    FOREIGN KEY("session_id") REFERENCES "ingest_session"("ingest_session_id"),
    FOREIGN KEY("session_entry_id") REFERENCES "ingest_session_entry"("ingest_session_entry_id"),
    UNIQUE("ingest_session_state_id", "from_state", "to_state")
);
CREATE TABLE IF NOT EXISTS "ingest_session_issue" (
    "ingest_session_issue_id" TEXT PRIMARY KEY NOT NULL,
    "session_id" TEXT NOT NULL,
    "session_entry_id" TEXT,
    "issue_type" TEXT NOT NULL,
    "issue_message" TEXT NOT NULL,
    "issue_row" INTEGER,
    "issue_column" TEXT,
    "invalid_value" TEXT,
    "remediation" TEXT,
    "elaboration" TEXT,
    FOREIGN KEY("session_id") REFERENCES "ingest_session"("ingest_session_id"),
    FOREIGN KEY("session_entry_id") REFERENCES "ingest_session_entry"("ingest_session_entry_id")
);


DROP VIEW IF EXISTS "ingest_session_diagnostic_text";
CREATE VIEW IF NOT EXISTS "ingest_session_diagnostic_text" AS
    SELECT
        -- Including all other columns from 'ingest_session'
        ises.* EXCLUDE (ingest_started_at, ingest_finished_at),
        -- TODO: Casting known timestamp columns to text so emit to Excel works with GDAL (spatial)
           -- strftime(timestamptz ingest_started_at, '%Y-%m-%d %H:%M:%S') AS ingest_started_at,
           -- strftime(timestamptz ingest_finished_at, '%Y-%m-%d %H:%M:%S') AS ingest_finished_at,
    
        -- Including all columns from 'ingest_session_entry'
        isee.* EXCLUDE (session_id),
    
        -- Including all other columns from 'ingest_session_issue'
        isi.* EXCLUDE (session_id, session_entry_id)
    FROM ingest_session AS ises
    JOIN ingest_session_entry AS isee ON ises.ingest_session_id = isee.session_id
    LEFT JOIN ingest_session_issue AS isi ON isee.ingest_session_entry_id = isi.session_entry_id;

-- register the current session and use the identifier for all logging
INSERT INTO "ingest_session" ("ingest_session_id", "ingest_started_at", "ingest_finished_at", "elaboration") VALUES ('05269d28-15ae-5bd6-bd88-f949ccfa52d7', NULL, NULL, NULL);

-- no after-init SQL found
```


## ingest-0
```sql
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "ingest_session_entry" ("ingest_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('7bab389e-54af-5a13-a39f-079abdc73a48', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail.csv', 'synthetic_fail', NULL);

-- be sure to add src_file_row_number and session_id columns to each row
-- because assurance CTEs require them
CREATE TABLE synthetic_fail AS
  SELECT *, row_number() OVER () as src_file_row_number, '05269d28-15ae-5bd6-bd88-f949ccfa52d7' as session_id, '7bab389e-54af-5a13-a39f-079abdc73a48' as session_entry_id
    FROM read_csv_auto('support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail.csv');

WITH required_column_names_in_src AS (
    SELECT column_name
      FROM (VALUES ('PAT_MRN_ID'), ('FACILITY'), ('FIRST_NAME'), ('LAST_NAME'), ('PAT_BIRTH_DATE'), ('MEDICAID_CIN'), ('ENCOUNTER_ID'), ('SURVEY'), ('SURVEY_ID'), ('RECORDED_TIME'), ('QUESTION'), ('MEAS_VALUE'), ('QUESTION_CODE'), ('QUESTION_CODE_SYSTEM_NAME'), ('ANSWER_CODE'), ('ANSWER_CODE_SYSTEM_NAME'), ('SDOH_DOMAIN'), ('NEED_INDICATED'), ('VISIT_PART_2_FLAG'), ('VISIT_OMH_FLAG'), ('VISIT_OPWDD_FLAG')) AS required(column_name)
     WHERE required.column_name NOT IN (
         SELECT upper(trim(column_name))
           FROM information_schema.columns
          WHERE table_name = 'synthetic_fail')
)
INSERT INTO ingest_session_issue (ingest_session_issue_id, session_id, session_entry_id, issue_type, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '7bab389e-54af-5a13-a39f-079abdc73a48',
           'Missing Column',
           'Required column ' || column_name || ' is missing in synthetic_fail.',
           'Ensure synthetic_fail contains the column "' || column_name || '"'
      FROM required_column_names_in_src;

-- required by IngestEngine, emit the errors for the given session (file) so it can be picked up
SELECT * FROM ingest_session_issue WHERE session_id = '05269d28-15ae-5bd6-bd88-f949ccfa52d7' and session_entry_id = '7bab389e-54af-5a13-a39f-079abdc73a48';
```

### stdout
```sh
[{"ingest_session_issue_id":"1d62090e-421c-4d2f-a79d-42d02218cd13","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"7bab389e-54af-5a13-a39f-079abdc73a48","issue_type":"Missing Column","issue_message":"Required column PAT_MRN_ID is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"PAT_MRN_ID\"","elaboration":null},
{"ingest_session_issue_id":"eb6c2120-4d30-4d74-b23b-8c2a111ab2ec","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"7bab389e-54af-5a13-a39f-079abdc73a48","issue_type":"Missing Column","issue_message":"Required column FACILITY is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"FACILITY\"","elaboration":null},
{"ingest_session_issue_id":"adaedffc-0cda-43e9-abb8-1f7de065c73a","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"7bab389e-54af-5a13-a39f-079abdc73a48","issue_type":"Missing Column","issue_message":"Required column FIRST_NAME is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"FIRST_NAME\"","elaboration":null},
{"ingest_session_issue_id":"76ffffb9-5275-4b4e-858f-f7e8278b8aad","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"7bab389e-54af-5a13-a39f-079abdc73a48","issue_type":"Missing Column","issue_message":"Required column LAST_NAME is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"LAST_NAME\"","elaboration":null},
{"ingest_session_issue_id":"6433e280-0673-4eb4-973b-8edaac741f57","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"7bab389e-54af-5a13-a39f-079abdc73a48","issue_type":"Missing Column","issue_message":"Required column PAT_BIRTH_DATE is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"PAT_BIRTH_DATE\"","elaboration":null},
{"ingest_session_issue_id":"84a0a784-467f-4b2e-a5f6-01ccaa2a51fc","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"7bab389e-54af-5a13-a39f-079abdc73a48","issue_type":"Missing Column","issue_message":"Required column MEDICAID_CIN is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"MEDICAID_CIN\"","elaboration":null},
{"ingest_session_issue_id":"8d3ba017-481f-4394-a158-d2fc5b8ab954","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"7bab389e-54af-5a13-a39f-079abdc73a48","issue_type":"Missing Column","issue_message":"Required column ENCOUNTER_ID is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"ENCOUNTER_ID\"","elaboration":null},
{"ingest_session_issue_id":"3e68fef6-ccf4-48fe-a283-704e4eb75374","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"7bab389e-54af-5a13-a39f-079abdc73a48","issue_type":"Missing Column","issue_message":"Required column SURVEY is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"SURVEY\"","elaboration":null},
{"ingest_session_issue_id":"cf377023-2d73-4db6-a120-86c867adaa99","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"7bab389e-54af-5a13-a39f-079abdc73a48","issue_type":"Missing Column","issue_message":"Required column SURVEY_ID is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"SURVEY_ID\"","elaboration":null},
{"ingest_session_issue_id":"cffbab36-7f80-4846-a545-bcdf744ab69a","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"7bab389e-54af-5a13-a39f-079abdc73a48","issue_type":"Missing Column","issue_message":"Required column RECORDED_TIME is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"RECORDED_TIME\"","elaboration":null},
{"ingest_session_issue_id":"eceae89b-e0f5-4e6a-bc90-cf2ff7876032","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"7bab389e-54af-5a13-a39f-079abdc73a48","issue_type":"Missing Column","issue_message":"Required column QUESTION is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"QUESTION\"","elaboration":null},
{"ingest_session_issue_id":"c436e2aa-31d9-4f87-9235-869999bb9cc3","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"7bab389e-54af-5a13-a39f-079abdc73a48","issue_type":"Missing Column","issue_message":"Required column MEAS_VALUE is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"MEAS_VALUE\"","elaboration":null},
{"ingest_session_issue_id":"1dbe4f19-f975-459e-a8ae-813947feedd9","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"7bab389e-54af-5a13-a39f-079abdc73a48","issue_type":"Missing Column","issue_message":"Required column QUESTION_CODE is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"QUESTION_CODE\"","elaboration":null},
{"ingest_session_issue_id":"991cc8c7-6d8a-4cd1-97d6-c8cacd23ecd9","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"7bab389e-54af-5a13-a39f-079abdc73a48","issue_type":"Missing Column","issue_message":"Required column QUESTION_CODE_SYSTEM_NAME is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"QUESTION_CODE_SYSTEM_NAME\"","elaboration":null},
{"ingest_session_issue_id":"789dad0b-db42-4988-acaf-fd2ca520b223","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"7bab389e-54af-5a13-a39f-079abdc73a48","issue_type":"Missing Column","issue_message":"Required column ANSWER_CODE is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"ANSWER_CODE\"","elaboration":null},
{"ingest_session_issue_id":"bb3fa37a-c79b-4aad-ab9a-4a2e072b44a7","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"7bab389e-54af-5a13-a39f-079abdc73a48","issue_type":"Missing Column","issue_message":"Required column ANSWER_CODE_SYSTEM_NAME is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"ANSWER_CODE_SYSTEM_NAME\"","elaboration":null},
{"ingest_session_issue_id":"439fe7e6-7821-4af7-98ca-dbef52726fe6","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"7bab389e-54af-5a13-a39f-079abdc73a48","issue_type":"Missing Column","issue_message":"Required column SDOH_DOMAIN is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"SDOH_DOMAIN\"","elaboration":null},
{"ingest_session_issue_id":"c496d27a-cda0-40c7-858d-b0ed2845f744","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"7bab389e-54af-5a13-a39f-079abdc73a48","issue_type":"Missing Column","issue_message":"Required column NEED_INDICATED is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"NEED_INDICATED\"","elaboration":null},
{"ingest_session_issue_id":"14fddde7-e2a1-4ca8-a39f-cee1beefcdc5","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"7bab389e-54af-5a13-a39f-079abdc73a48","issue_type":"Missing Column","issue_message":"Required column VISIT_PART_2_FLAG is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"VISIT_PART_2_FLAG\"","elaboration":null},
{"ingest_session_issue_id":"ee301881-6874-4465-86cd-57003de5b101","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"7bab389e-54af-5a13-a39f-079abdc73a48","issue_type":"Missing Column","issue_message":"Required column VISIT_OMH_FLAG is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"VISIT_OMH_FLAG\"","elaboration":null},
{"ingest_session_issue_id":"7879dbd7-da51-41f3-a35d-0387dc732480","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"7bab389e-54af-5a13-a39f-079abdc73a48","issue_type":"Missing Column","issue_message":"Required column VISIT_OPWDD_FLAG is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"VISIT_OPWDD_FLAG\"","elaboration":null}]

```

## ingest-1
```sql
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "ingest_session_entry" ("ingest_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('168a34c7-d043-5ec4-a84a-c961f1a301ef', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-12-12-2023-valid.csv', 'ahc_hrsn_12_12_2023_valid', NULL);

-- be sure to add src_file_row_number and session_id columns to each row
-- because assurance CTEs require them
CREATE TABLE ahc_hrsn_12_12_2023_valid AS
  SELECT *, row_number() OVER () as src_file_row_number, '05269d28-15ae-5bd6-bd88-f949ccfa52d7' as session_id, '168a34c7-d043-5ec4-a84a-c961f1a301ef' as session_entry_id
    FROM read_csv_auto('support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-12-12-2023-valid.csv');

WITH required_column_names_in_src AS (
    SELECT column_name
      FROM (VALUES ('PAT_MRN_ID'), ('FACILITY'), ('FIRST_NAME'), ('LAST_NAME'), ('PAT_BIRTH_DATE'), ('MEDICAID_CIN'), ('ENCOUNTER_ID'), ('SURVEY'), ('SURVEY_ID'), ('RECORDED_TIME'), ('QUESTION'), ('MEAS_VALUE'), ('QUESTION_CODE'), ('QUESTION_CODE_SYSTEM_NAME'), ('ANSWER_CODE'), ('ANSWER_CODE_SYSTEM_NAME'), ('SDOH_DOMAIN'), ('NEED_INDICATED'), ('VISIT_PART_2_FLAG'), ('VISIT_OMH_FLAG'), ('VISIT_OPWDD_FLAG')) AS required(column_name)
     WHERE required.column_name NOT IN (
         SELECT upper(trim(column_name))
           FROM information_schema.columns
          WHERE table_name = 'ahc_hrsn_12_12_2023_valid')
)
INSERT INTO ingest_session_issue (ingest_session_issue_id, session_id, session_entry_id, issue_type, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '168a34c7-d043-5ec4-a84a-c961f1a301ef',
           'Missing Column',
           'Required column ' || column_name || ' is missing in ahc_hrsn_12_12_2023_valid.',
           'Ensure ahc_hrsn_12_12_2023_valid contains the column "' || column_name || '"'
      FROM required_column_names_in_src;

-- required by IngestEngine, emit the errors for the given session (file) so it can be picked up
SELECT * FROM ingest_session_issue WHERE session_id = '05269d28-15ae-5bd6-bd88-f949ccfa52d7' and session_entry_id = '168a34c7-d043-5ec4-a84a-c961f1a301ef';
```


## ingest-2
```sql
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "ingest_session_entry" ("ingest_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('1931dfcc-e8fc-597d-b1bc-65b4287e6fdf', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx', 'ERROR', NULL);
INSERT INTO "ingest_session_issue" ("ingest_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('8b7c669c-1795-5f6b-8f3a-3e502b74c628', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '1931dfcc-e8fc-597d-b1bc-65b4287e6fdf', 'Sheet Missing', 'Excel workbook sheet ''Admin_Demographic'' not found in ''synthetic-fail-excel-01.xlsx'' (available: Sheet1)', NULL, NULL, 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx', NULL, NULL);;
-- required by IngestEngine, emit the errors for the given session (file) so it can be picked up
SELECT * FROM ingest_session_issue WHERE session_id = '05269d28-15ae-5bd6-bd88-f949ccfa52d7' and session_entry_id = '1931dfcc-e8fc-597d-b1bc-65b4287e6fdf';
```

### stdout
```sh
[{"ingest_session_issue_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"1931dfcc-e8fc-597d-b1bc-65b4287e6fdf","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet 'Admin_Demographic' not found in 'synthetic-fail-excel-01.xlsx' (available: Sheet1)","issue_row":null,"issue_column":null,"invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx","remediation":null,"elaboration":null}]

```

## ingest-3
```sql
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "ingest_session_entry" ("ingest_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('7b979b68-7227-53fd-b689-e4fe153afb76', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx', 'ERROR', NULL);
INSERT INTO "ingest_session_issue" ("ingest_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('abf5c680-a135-5d89-b871-fa5b9b99aed6', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '7b979b68-7227-53fd-b689-e4fe153afb76', 'Sheet Missing', 'Excel workbook sheet ''Screening'' not found in ''synthetic-fail-excel-01.xlsx'' (available: Sheet1)', NULL, NULL, 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx', NULL, NULL);;
-- required by IngestEngine, emit the errors for the given session (file) so it can be picked up
SELECT * FROM ingest_session_issue WHERE session_id = '05269d28-15ae-5bd6-bd88-f949ccfa52d7' and session_entry_id = '7b979b68-7227-53fd-b689-e4fe153afb76';
```

### stdout
```sh
[{"ingest_session_issue_id":"abf5c680-a135-5d89-b871-fa5b9b99aed6","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"7b979b68-7227-53fd-b689-e4fe153afb76","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet 'Screening' not found in 'synthetic-fail-excel-01.xlsx' (available: Sheet1)","issue_row":null,"issue_column":null,"invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx","remediation":null,"elaboration":null}]

```

## ingest-4
```sql
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "ingest_session_entry" ("ingest_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('641dff51-97fd-56b3-8443-c1ed568a6d66', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx', 'ERROR', NULL);
INSERT INTO "ingest_session_issue" ("ingest_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('d70a4700-6b40-52fc-a7a2-69ef0d7f69ff', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '641dff51-97fd-56b3-8443-c1ed568a6d66', 'Sheet Missing', 'Excel workbook sheet ''QE_Admin_Data'' not found in ''synthetic-fail-excel-01.xlsx'' (available: Sheet1)', NULL, NULL, 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx', NULL, NULL);;
-- required by IngestEngine, emit the errors for the given session (file) so it can be picked up
SELECT * FROM ingest_session_issue WHERE session_id = '05269d28-15ae-5bd6-bd88-f949ccfa52d7' and session_entry_id = '641dff51-97fd-56b3-8443-c1ed568a6d66';
```

### stdout
```sh
[{"ingest_session_issue_id":"d70a4700-6b40-52fc-a7a2-69ef0d7f69ff","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"641dff51-97fd-56b3-8443-c1ed568a6d66","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet 'QE_Admin_Data' not found in 'synthetic-fail-excel-01.xlsx' (available: Sheet1)","issue_row":null,"issue_column":null,"invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx","remediation":null,"elaboration":null}]

```

## ingest-5
```sql
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "ingest_session_entry" ("ingest_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('47277588-99e8-59f5-8384-b24344a86073', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx', 'ahc_hrsn_valid_01_admin_demographic', NULL);
        
INSERT INTO "ingest_session_issue" ("ingest_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('58b22e99-5854-53bf-adbe-08e67df99b85', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '47277588-99e8-59f5-8384-b24344a86073', 'TODO', 'Excel workbook ''ahc-hrsn-valid-01.xlsx'' sheet ''Admin_Demographic'' has not been implemented yet.', NULL, NULL, 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx', NULL, NULL);;

-- required by IngestEngine, emit the errors for the given session (file) so it can be picked up
SELECT * FROM ingest_session_issue WHERE session_id = '05269d28-15ae-5bd6-bd88-f949ccfa52d7' and session_entry_id = '47277588-99e8-59f5-8384-b24344a86073';
```

### stdout
```sh
[{"ingest_session_issue_id":"58b22e99-5854-53bf-adbe-08e67df99b85","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"47277588-99e8-59f5-8384-b24344a86073","issue_type":"TODO","issue_message":"Excel workbook 'ahc-hrsn-valid-01.xlsx' sheet 'Admin_Demographic' has not been implemented yet.","issue_row":null,"issue_column":null,"invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx","remediation":null,"elaboration":null}]

```

## ingest-6
```sql
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "ingest_session_entry" ("ingest_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('a26ce332-3ced-5623-861d-23a2ef78e4a9', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx', 'ahc_hrsn_valid_01_screening', NULL);
     
-- ingest Excel workbook sheet 'Screening' into ahc_hrsn_valid_01_screening using spatial plugin
INSTALL spatial; LOAD spatial;

-- be sure to add src_file_row_number and session_id columns to each row
-- because assurance CTEs require them
CREATE TABLE ahc_hrsn_valid_01_screening AS
  SELECT *, row_number() OVER () as src_file_row_number, '05269d28-15ae-5bd6-bd88-f949ccfa52d7' as session_id, 'a26ce332-3ced-5623-861d-23a2ef78e4a9' as session_entry_id
    FROM st_read('support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx', layer='Screening', open_options=['HEADERS=FORCE', 'FIELD_TYPES=AUTO']);          

WITH required_column_names_in_src AS (
    SELECT column_name
      FROM (VALUES ('PAT_MRN_ID'), ('FACILITY'), ('FIRST_NAME'), ('LAST_NAME'), ('PAT_BIRTH_DATE'), ('MEDICAID_CIN'), ('ENCOUNTER_ID'), ('SURVEY'), ('SURVEY_ID'), ('RECORDED_TIME'), ('QUESTION'), ('MEAS_VALUE'), ('QUESTION_CODE'), ('QUESTION_CODE_SYSTEM_NAME'), ('ANSWER_CODE'), ('ANSWER_CODE_SYSTEM_NAME'), ('SDOH_DOMAIN'), ('NEED_INDICATED'), ('VISIT_PART_2_FLAG'), ('VISIT_OMH_FLAG'), ('VISIT_OPWDD_FLAG')) AS required(column_name)
     WHERE required.column_name NOT IN (
         SELECT upper(trim(column_name))
           FROM information_schema.columns
          WHERE table_name = 'ahc_hrsn_valid_01_screening')
)
INSERT INTO ingest_session_issue (ingest_session_issue_id, session_id, session_entry_id, issue_type, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           'a26ce332-3ced-5623-861d-23a2ef78e4a9',
           'Missing Column',
           'Required column ' || column_name || ' is missing in ahc_hrsn_valid_01_screening.',
           'Ensure ahc_hrsn_valid_01_screening contains the column "' || column_name || '"'
      FROM required_column_names_in_src;

-- required by IngestEngine, emit the errors for the given session (file) so it can be picked up
SELECT * FROM ingest_session_issue WHERE session_id = '05269d28-15ae-5bd6-bd88-f949ccfa52d7' and session_entry_id = 'a26ce332-3ced-5623-861d-23a2ef78e4a9';
```

### stdout
```sh
[{"ingest_session_issue_id":"a5efdefa-01df-4c18-a9af-bc1e8a7963e1","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"a26ce332-3ced-5623-861d-23a2ef78e4a9","issue_type":"Missing Column","issue_message":"Required column FACILITY is missing in ahc_hrsn_valid_01_screening.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure ahc_hrsn_valid_01_screening contains the column \"FACILITY\"","elaboration":null},
{"ingest_session_issue_id":"9f8cc74d-65b7-4557-ba38-07aa21267699","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"a26ce332-3ced-5623-861d-23a2ef78e4a9","issue_type":"Missing Column","issue_message":"Required column FIRST_NAME is missing in ahc_hrsn_valid_01_screening.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure ahc_hrsn_valid_01_screening contains the column \"FIRST_NAME\"","elaboration":null},
{"ingest_session_issue_id":"985842e7-03b6-4d7f-9fae-f5fcf95e6c35","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"a26ce332-3ced-5623-861d-23a2ef78e4a9","issue_type":"Missing Column","issue_message":"Required column LAST_NAME is missing in ahc_hrsn_valid_01_screening.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure ahc_hrsn_valid_01_screening contains the column \"LAST_NAME\"","elaboration":null},
{"ingest_session_issue_id":"b37f730f-42e2-46c4-8263-bccbb681babd","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"a26ce332-3ced-5623-861d-23a2ef78e4a9","issue_type":"Missing Column","issue_message":"Required column PAT_BIRTH_DATE is missing in ahc_hrsn_valid_01_screening.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure ahc_hrsn_valid_01_screening contains the column \"PAT_BIRTH_DATE\"","elaboration":null},
{"ingest_session_issue_id":"36eac8e0-d4c4-4ae6-af24-a4ca713f075c","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"a26ce332-3ced-5623-861d-23a2ef78e4a9","issue_type":"Missing Column","issue_message":"Required column MEDICAID_CIN is missing in ahc_hrsn_valid_01_screening.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure ahc_hrsn_valid_01_screening contains the column \"MEDICAID_CIN\"","elaboration":null},
{"ingest_session_issue_id":"b9a5d5ef-591d-42c4-b695-39b8345176c4","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"a26ce332-3ced-5623-861d-23a2ef78e4a9","issue_type":"Missing Column","issue_message":"Required column ENCOUNTER_ID is missing in ahc_hrsn_valid_01_screening.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure ahc_hrsn_valid_01_screening contains the column \"ENCOUNTER_ID\"","elaboration":null},
{"ingest_session_issue_id":"1373859a-be5b-44f1-b530-c5e24d016f3b","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"a26ce332-3ced-5623-861d-23a2ef78e4a9","issue_type":"Missing Column","issue_message":"Required column SURVEY is missing in ahc_hrsn_valid_01_screening.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure ahc_hrsn_valid_01_screening contains the column \"SURVEY\"","elaboration":null},
{"ingest_session_issue_id":"124d2172-198a-401f-92db-cacb6e72799d","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"a26ce332-3ced-5623-861d-23a2ef78e4a9","issue_type":"Missing Column","issue_message":"Required column SURVEY_ID is missing in ahc_hrsn_valid_01_screening.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure ahc_hrsn_valid_01_screening contains the column \"SURVEY_ID\"","elaboration":null},
{"ingest_session_issue_id":"b709f71b-e3cb-4ba4-9960-c366e0a15fcc","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"a26ce332-3ced-5623-861d-23a2ef78e4a9","issue_type":"Missing Column","issue_message":"Required column NEED_INDICATED is missing in ahc_hrsn_valid_01_screening.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure ahc_hrsn_valid_01_screening contains the column \"NEED_INDICATED\"","elaboration":null},
{"ingest_session_issue_id":"7c3a5569-2b46-4935-bfa4-ed1cc0f2209c","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"a26ce332-3ced-5623-861d-23a2ef78e4a9","issue_type":"Missing Column","issue_message":"Required column VISIT_PART_2_FLAG is missing in ahc_hrsn_valid_01_screening.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure ahc_hrsn_valid_01_screening contains the column \"VISIT_PART_2_FLAG\"","elaboration":null},
{"ingest_session_issue_id":"db99bb24-cd1f-4384-bae1-7f88124cda3e","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"a26ce332-3ced-5623-861d-23a2ef78e4a9","issue_type":"Missing Column","issue_message":"Required column VISIT_OMH_FLAG is missing in ahc_hrsn_valid_01_screening.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure ahc_hrsn_valid_01_screening contains the column \"VISIT_OMH_FLAG\"","elaboration":null},
{"ingest_session_issue_id":"15535506-368a-4157-bef7-88d1fd779d0d","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"a26ce332-3ced-5623-861d-23a2ef78e4a9","issue_type":"Missing Column","issue_message":"Required column VISIT_OPWDD_FLAG is missing in ahc_hrsn_valid_01_screening.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure ahc_hrsn_valid_01_screening contains the column \"VISIT_OPWDD_FLAG\"","elaboration":null}]

```

## ingest-7
```sql
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "ingest_session_entry" ("ingest_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('bc0c03b5-d1ba-5301-850f-5e4c42c1bf09', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx', 'ahc_hrsn_valid_01_q_e_admin_data', NULL);
        
INSERT INTO "ingest_session_issue" ("ingest_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('ae477ba1-c7f1-5f34-847a-50bddb7130aa', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'bc0c03b5-d1ba-5301-850f-5e4c42c1bf09', 'TODO', 'Excel workbook ''ahc-hrsn-valid-01.xlsx'' sheet ''QE_Admin_Data'' has not been implemented yet.', NULL, NULL, 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx', NULL, NULL);;

-- required by IngestEngine, emit the errors for the given session (file) so it can be picked up
SELECT * FROM ingest_session_issue WHERE session_id = '05269d28-15ae-5bd6-bd88-f949ccfa52d7' and session_entry_id = 'bc0c03b5-d1ba-5301-850f-5e4c42c1bf09';
```

### stdout
```sh
[{"ingest_session_issue_id":"ae477ba1-c7f1-5f34-847a-50bddb7130aa","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"bc0c03b5-d1ba-5301-850f-5e4c42c1bf09","issue_type":"TODO","issue_message":"Excel workbook 'ahc-hrsn-valid-01.xlsx' sheet 'QE_Admin_Data' has not been implemented yet.","issue_row":null,"issue_column":null,"invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx","remediation":null,"elaboration":null}]

```

## ensureContent
```sql
WITH numeric_value_in_all_rows AS (
    SELECT 'SURVEY_ID' AS issue_column,
           SURVEY_ID AS invalid_value,
           src_file_row_number AS issue_row
      FROM ahc_hrsn_12_12_2023_valid
     WHERE SURVEY_ID IS NOT NULL
       AND SURVEY_ID NOT SIMILAR TO '^[+-]?[0-9]+$'
)
INSERT INTO ingest_session_issue (ingest_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '168a34c7-d043-5ec4-a84a-c961f1a301ef',
           'Data Type Mismatch',
           issue_row,
           issue_column,
           invalid_value,
           'Non-integer value "' || invalid_value || '" found in ' || issue_column,
           'Convert non-integer values to INTEGER'
      FROM numeric_value_in_all_rows;
```


## emitResources
```sql
INSERT INTO "ingest_session_state" ("ingest_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('05e8feaa-0bed-5909-a817-39812494b361', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', NULL, 'NONE', 'ENTER(init)', NULL, 'rsEE.beforeCell', (make_timestamp(2023, 11, 6, 19, 30, 36.857)), NULL);
INSERT INTO "ingest_session_state" ("ingest_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('8f460419-7b80-516d-8919-84520950f612', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', NULL, 'EXIT(init)', 'ENTER(ingest)', NULL, 'rsEE.afterCell', (make_timestamp(2023, 11, 6, 19, 30, 36.857)), NULL);
INSERT INTO "ingest_session_state" ("ingest_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', NULL, 'EXIT(ingest)', 'ENTER(ensureContent)', NULL, 'rsEE.afterCell', (make_timestamp(2023, 11, 6, 19, 30, 36.857)), NULL);
INSERT INTO "ingest_session_state" ("ingest_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', NULL, 'EXIT(ensureContent)', 'ENTER(emitResources)', NULL, 'rsEE.afterCell', (make_timestamp(2023, 11, 6, 19, 30, 36.857)), NULL);

ATTACH 'support/assurance/ahc-hrsn-elt/screening/results-test-e2e/resource.sqlite.db' AS resource_db (TYPE SQLITE);

CREATE TABLE resource_db.ingest_session AS SELECT * FROM ingest_session;
CREATE TABLE resource_db.ingest_session_entry AS SELECT * FROM ingest_session_entry;
CREATE TABLE resource_db.ingest_session_state AS SELECT * FROM ingest_session_state;
CREATE TABLE resource_db.ingest_session_issue AS SELECT * FROM ingest_session_issue;

-- {contentResult.map(cr => `CREATE TABLE resource_db.${cr.iaSqlSupplier.tableName} AS SELECT * FROM ${cr.tableName}`).join(";")};

DETACH DATABASE resource_db;
-- no after-finalize SQL provided
```


## emitDiagnostics
```sql
INSTALL spatial; LOAD spatial;
-- TODO: join with ingest_session table to give all the results in one sheet
COPY (SELECT * FROM ingest_session_diagnostic_text) TO 'support/assurance/ahc-hrsn-elt/screening/results-test-e2e/diagnostics.xlsx' WITH (FORMAT GDAL, DRIVER 'xlsx');
```
