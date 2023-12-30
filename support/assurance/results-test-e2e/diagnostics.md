---
rootPaths:
  - support/assurance/synthetic-content
icDb: support/assurance/results-test-e2e/ingestion-center.duckdb
diagsMd: support/assurance/results-test-e2e/diagnostics.md
diagsXlsx: support/assurance/results-test-e2e/diagnostics.xlsx
resourceDb: support/assurance/results-test-e2e/resource.sqlite.db
sources:
  - uri: support/assurance/synthetic-content/ahc-hrsn-valid-01.xlsx
    nature: Excel Workbook Sheet
    tableName: ahc_hrsn_valid_01_admin_demographic
    assurable: false
  - uri: support/assurance/synthetic-content/ahc-hrsn-valid-01.xlsx
    nature: Excel Workbook Sheet
    tableName: ahc_hrsn_valid_01_screening
    assurable: false
  - uri: support/assurance/synthetic-content/ahc-hrsn-valid-01.xlsx
    nature: Excel Workbook Sheet
    tableName: ahc_hrsn_valid_01_q_e_admin_data
    assurable: false
  - uri: support/assurance/synthetic-content/synthetic-fail.csv
    nature: CSV
    tableName: synthetic_fail
    assurable: false
  - uri: support/assurance/synthetic-content/synthetic-fail-excel-01.xlsx
    nature: ERROR
    tableName: ERROR
    assurable: false
  - uri: support/assurance/synthetic-content/ahc-hrsn-12-12-2023-valid.csv
    nature: CSV
    tableName: ahc_hrsn_12_12_2023_valid
    assurable: true
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


-- register the current session and use the identifier for all logging
INSERT INTO "ingest_session" ("ingest_session_id", "ingest_started_at", "ingest_finished_at", "elaboration") VALUES ('05269d28-15ae-5bd6-bd88-f949ccfa52d7', NULL, NULL, NULL);

-- no after-init SQL found
```


## ingest-0
```sql
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "ingest_session_entry" ("ingest_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('168a34c7-d043-5ec4-a84a-c961f1a301ef', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/synthetic-content/ahc-hrsn-valid-01.xlsx', 'ahc_hrsn_valid_01_admin_demographic', NULL);
        
INSERT INTO "ingest_session_issue" ("ingest_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('1931dfcc-e8fc-597d-b1bc-65b4287e6fdf', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '168a34c7-d043-5ec4-a84a-c961f1a301ef', 'TODO', 'Excel workbook ''ahc-hrsn-valid-01.xlsx'' sheet ''Admin_Demographic'' has not been implemented yet.', NULL, NULL, 'support/assurance/synthetic-content/ahc-hrsn-valid-01.xlsx', NULL, NULL);;

-- required by IngestEngine, emit the errors for the given session (file) so it can be picked up
SELECT * FROM ingest_session_issue WHERE session_id = '05269d28-15ae-5bd6-bd88-f949ccfa52d7' and session_entry_id = '168a34c7-d043-5ec4-a84a-c961f1a301ef';
```

### stdout
```sh
[{"ingest_session_issue_id":"1931dfcc-e8fc-597d-b1bc-65b4287e6fdf","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"168a34c7-d043-5ec4-a84a-c961f1a301ef","issue_type":"TODO","issue_message":"Excel workbook 'ahc-hrsn-valid-01.xlsx' sheet 'Admin_Demographic' has not been implemented yet.","issue_row":null,"issue_column":null,"invalid_value":"support/assurance/synthetic-content/ahc-hrsn-valid-01.xlsx","remediation":null,"elaboration":null}]

```

## ingest-1
```sql
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "ingest_session_entry" ("ingest_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('8b7c669c-1795-5f6b-8f3a-3e502b74c628', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/synthetic-content/ahc-hrsn-valid-01.xlsx', 'ahc_hrsn_valid_01_screening', NULL);
     
-- ingest Excel workbook sheet 'Screening' into ahc_hrsn_valid_01_screening using spatial plugin
INSTALL spatial; LOAD spatial;

-- be sure to add src_file_row_number and session_id columns to each row
-- because assurance CTEs require them
CREATE TABLE ahc_hrsn_valid_01_screening AS
  SELECT *, row_number() OVER () as src_file_row_number, '05269d28-15ae-5bd6-bd88-f949ccfa52d7' as session_id, '8b7c669c-1795-5f6b-8f3a-3e502b74c628' as session_entry_id
    FROM st_read('support/assurance/synthetic-content/ahc-hrsn-valid-01.xlsx', layer='Screening', open_options=['HEADERS=FORCE', 'FIELD_TYPES=AUTO']);          

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
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Missing Column',
           'Required column ' || column_name || ' is missing in ahc_hrsn_valid_01_screening.',
           'Ensure ahc_hrsn_valid_01_screening contains the column "' || column_name || '"'
      FROM required_column_names_in_src;

-- required by IngestEngine, emit the errors for the given session (file) so it can be picked up
SELECT * FROM ingest_session_issue WHERE session_id = '05269d28-15ae-5bd6-bd88-f949ccfa52d7' and session_entry_id = '8b7c669c-1795-5f6b-8f3a-3e502b74c628';
```

### stdout
```sh
[{"ingest_session_issue_id":"600e7ff2-9270-400d-8f53-6d51336e9465","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","issue_type":"Missing Column","issue_message":"Required column PAT_MRN_ID is missing in ahc_hrsn_valid_01_screening.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure ahc_hrsn_valid_01_screening contains the column \"PAT_MRN_ID\"","elaboration":null},
{"ingest_session_issue_id":"4bff53aa-7b63-4595-b6e2-cb82ff761a44","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","issue_type":"Missing Column","issue_message":"Required column FACILITY is missing in ahc_hrsn_valid_01_screening.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure ahc_hrsn_valid_01_screening contains the column \"FACILITY\"","elaboration":null},
{"ingest_session_issue_id":"1f4e687b-9e62-4ca4-927d-8ce6dc6e17f6","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","issue_type":"Missing Column","issue_message":"Required column FIRST_NAME is missing in ahc_hrsn_valid_01_screening.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure ahc_hrsn_valid_01_screening contains the column \"FIRST_NAME\"","elaboration":null},
{"ingest_session_issue_id":"fd36ecf0-814f-41e6-8def-f827a6428343","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","issue_type":"Missing Column","issue_message":"Required column LAST_NAME is missing in ahc_hrsn_valid_01_screening.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure ahc_hrsn_valid_01_screening contains the column \"LAST_NAME\"","elaboration":null},
{"ingest_session_issue_id":"762b8876-4f63-4507-ac44-273c69a61427","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","issue_type":"Missing Column","issue_message":"Required column PAT_BIRTH_DATE is missing in ahc_hrsn_valid_01_screening.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure ahc_hrsn_valid_01_screening contains the column \"PAT_BIRTH_DATE\"","elaboration":null},
{"ingest_session_issue_id":"eea1968f-0db9-4e34-894f-bd2993c09ba5","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","issue_type":"Missing Column","issue_message":"Required column MEDICAID_CIN is missing in ahc_hrsn_valid_01_screening.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure ahc_hrsn_valid_01_screening contains the column \"MEDICAID_CIN\"","elaboration":null},
{"ingest_session_issue_id":"704cd277-2933-4211-8df3-6f800fc8a696","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","issue_type":"Missing Column","issue_message":"Required column ENCOUNTER_ID is missing in ahc_hrsn_valid_01_screening.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure ahc_hrsn_valid_01_screening contains the column \"ENCOUNTER_ID\"","elaboration":null},
{"ingest_session_issue_id":"6f09fee0-ec02-4f2d-903a-8ea9eafff274","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","issue_type":"Missing Column","issue_message":"Required column SURVEY is missing in ahc_hrsn_valid_01_screening.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure ahc_hrsn_valid_01_screening contains the column \"SURVEY\"","elaboration":null},
{"ingest_session_issue_id":"939d0637-9ca8-4f34-96bc-28efa27f4ab7","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","issue_type":"Missing Column","issue_message":"Required column SURVEY_ID is missing in ahc_hrsn_valid_01_screening.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure ahc_hrsn_valid_01_screening contains the column \"SURVEY_ID\"","elaboration":null},
{"ingest_session_issue_id":"7e063e1e-455e-48d3-88fe-c63abf5689c7","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","issue_type":"Missing Column","issue_message":"Required column RECORDED_TIME is missing in ahc_hrsn_valid_01_screening.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure ahc_hrsn_valid_01_screening contains the column \"RECORDED_TIME\"","elaboration":null},
{"ingest_session_issue_id":"d80091b3-65a5-46f5-be82-d4cf3a80edf6","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","issue_type":"Missing Column","issue_message":"Required column QUESTION is missing in ahc_hrsn_valid_01_screening.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure ahc_hrsn_valid_01_screening contains the column \"QUESTION\"","elaboration":null},
{"ingest_session_issue_id":"db723cdf-9fb5-46bc-867d-9ad57519aaf7","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","issue_type":"Missing Column","issue_message":"Required column MEAS_VALUE is missing in ahc_hrsn_valid_01_screening.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure ahc_hrsn_valid_01_screening contains the column \"MEAS_VALUE\"","elaboration":null},
{"ingest_session_issue_id":"c7fab8de-a65d-4003-86e8-338cb19bc7a6","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","issue_type":"Missing Column","issue_message":"Required column QUESTION_CODE is missing in ahc_hrsn_valid_01_screening.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure ahc_hrsn_valid_01_screening contains the column \"QUESTION_CODE\"","elaboration":null},
{"ingest_session_issue_id":"e1875632-9d0a-4280-9445-00c613b23b60","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","issue_type":"Missing Column","issue_message":"Required column QUESTION_CODE_SYSTEM_NAME is missing in ahc_hrsn_valid_01_screening.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure ahc_hrsn_valid_01_screening contains the column \"QUESTION_CODE_SYSTEM_NAME\"","elaboration":null},
{"ingest_session_issue_id":"1a57febc-ab7f-4f31-b5c7-b40f00433bd7","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","issue_type":"Missing Column","issue_message":"Required column ANSWER_CODE is missing in ahc_hrsn_valid_01_screening.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure ahc_hrsn_valid_01_screening contains the column \"ANSWER_CODE\"","elaboration":null},
{"ingest_session_issue_id":"f3b7d1bc-954c-4f78-9ddf-90ef8e827e0e","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","issue_type":"Missing Column","issue_message":"Required column ANSWER_CODE_SYSTEM_NAME is missing in ahc_hrsn_valid_01_screening.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure ahc_hrsn_valid_01_screening contains the column \"ANSWER_CODE_SYSTEM_NAME\"","elaboration":null},
{"ingest_session_issue_id":"29d6b3d3-4c48-47b5-82a8-7fc98691af60","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","issue_type":"Missing Column","issue_message":"Required column SDOH_DOMAIN is missing in ahc_hrsn_valid_01_screening.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure ahc_hrsn_valid_01_screening contains the column \"SDOH_DOMAIN\"","elaboration":null},
{"ingest_session_issue_id":"739dd110-ca51-4a69-9db9-ef56b93bdd0a","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","issue_type":"Missing Column","issue_message":"Required column NEED_INDICATED is missing in ahc_hrsn_valid_01_screening.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure ahc_hrsn_valid_01_screening contains the column \"NEED_INDICATED\"","elaboration":null},
{"ingest_session_issue_id":"70348106-a609-4982-8ab1-fdcbc2b150b7","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","issue_type":"Missing Column","issue_message":"Required column VISIT_PART_2_FLAG is missing in ahc_hrsn_valid_01_screening.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure ahc_hrsn_valid_01_screening contains the column \"VISIT_PART_2_FLAG\"","elaboration":null},
{"ingest_session_issue_id":"9576fff7-d45b-4a1e-b8ef-40ed9522167f","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","issue_type":"Missing Column","issue_message":"Required column VISIT_OMH_FLAG is missing in ahc_hrsn_valid_01_screening.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure ahc_hrsn_valid_01_screening contains the column \"VISIT_OMH_FLAG\"","elaboration":null},
{"ingest_session_issue_id":"c0466663-5296-4ee3-b347-bb6855b15c97","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","issue_type":"Missing Column","issue_message":"Required column VISIT_OPWDD_FLAG is missing in ahc_hrsn_valid_01_screening.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure ahc_hrsn_valid_01_screening contains the column \"VISIT_OPWDD_FLAG\"","elaboration":null}]

```

## ingest-2
```sql
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "ingest_session_entry" ("ingest_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('7b979b68-7227-53fd-b689-e4fe153afb76', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/synthetic-content/ahc-hrsn-valid-01.xlsx', 'ahc_hrsn_valid_01_q_e_admin_data', NULL);
        
INSERT INTO "ingest_session_issue" ("ingest_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('abf5c680-a135-5d89-b871-fa5b9b99aed6', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '7b979b68-7227-53fd-b689-e4fe153afb76', 'TODO', 'Excel workbook ''ahc-hrsn-valid-01.xlsx'' sheet ''QE_Admin_Data'' has not been implemented yet.', NULL, NULL, 'support/assurance/synthetic-content/ahc-hrsn-valid-01.xlsx', NULL, NULL);;

-- required by IngestEngine, emit the errors for the given session (file) so it can be picked up
SELECT * FROM ingest_session_issue WHERE session_id = '05269d28-15ae-5bd6-bd88-f949ccfa52d7' and session_entry_id = '7b979b68-7227-53fd-b689-e4fe153afb76';
```

### stdout
```sh
[{"ingest_session_issue_id":"abf5c680-a135-5d89-b871-fa5b9b99aed6","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"7b979b68-7227-53fd-b689-e4fe153afb76","issue_type":"TODO","issue_message":"Excel workbook 'ahc-hrsn-valid-01.xlsx' sheet 'QE_Admin_Data' has not been implemented yet.","issue_row":null,"issue_column":null,"invalid_value":"support/assurance/synthetic-content/ahc-hrsn-valid-01.xlsx","remediation":null,"elaboration":null}]

```

## ingest-3
```sql
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "ingest_session_entry" ("ingest_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('641dff51-97fd-56b3-8443-c1ed568a6d66', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/synthetic-content/synthetic-fail.csv', 'synthetic_fail', NULL);

-- be sure to add src_file_row_number and session_id columns to each row
-- because assurance CTEs require them
CREATE TABLE synthetic_fail AS
  SELECT *, row_number() OVER () as src_file_row_number, '05269d28-15ae-5bd6-bd88-f949ccfa52d7' as session_id, '641dff51-97fd-56b3-8443-c1ed568a6d66' as session_entry_id
    FROM read_csv_auto('support/assurance/synthetic-content/synthetic-fail.csv');

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
           '641dff51-97fd-56b3-8443-c1ed568a6d66',
           'Missing Column',
           'Required column ' || column_name || ' is missing in synthetic_fail.',
           'Ensure synthetic_fail contains the column "' || column_name || '"'
      FROM required_column_names_in_src;

-- required by IngestEngine, emit the errors for the given session (file) so it can be picked up
SELECT * FROM ingest_session_issue WHERE session_id = '05269d28-15ae-5bd6-bd88-f949ccfa52d7' and session_entry_id = '641dff51-97fd-56b3-8443-c1ed568a6d66';
```

### stdout
```sh
[{"ingest_session_issue_id":"5d3dbe64-c29e-4f0a-8ca3-5ee94778708c","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"641dff51-97fd-56b3-8443-c1ed568a6d66","issue_type":"Missing Column","issue_message":"Required column PAT_MRN_ID is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"PAT_MRN_ID\"","elaboration":null},
{"ingest_session_issue_id":"66d7eaa2-5042-47bf-8c88-2a23229b0bde","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"641dff51-97fd-56b3-8443-c1ed568a6d66","issue_type":"Missing Column","issue_message":"Required column FACILITY is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"FACILITY\"","elaboration":null},
{"ingest_session_issue_id":"94da5182-eb64-4b8f-8392-96928cea41c2","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"641dff51-97fd-56b3-8443-c1ed568a6d66","issue_type":"Missing Column","issue_message":"Required column FIRST_NAME is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"FIRST_NAME\"","elaboration":null},
{"ingest_session_issue_id":"85adf558-1245-4354-a4f2-c1bee1af2821","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"641dff51-97fd-56b3-8443-c1ed568a6d66","issue_type":"Missing Column","issue_message":"Required column LAST_NAME is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"LAST_NAME\"","elaboration":null},
{"ingest_session_issue_id":"178124f2-ecac-41d8-ab3a-1d5e14b53345","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"641dff51-97fd-56b3-8443-c1ed568a6d66","issue_type":"Missing Column","issue_message":"Required column PAT_BIRTH_DATE is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"PAT_BIRTH_DATE\"","elaboration":null},
{"ingest_session_issue_id":"0a5cc160-2382-4f7c-84bd-baa7a858a2b4","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"641dff51-97fd-56b3-8443-c1ed568a6d66","issue_type":"Missing Column","issue_message":"Required column MEDICAID_CIN is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"MEDICAID_CIN\"","elaboration":null},
{"ingest_session_issue_id":"b6b67033-0c4f-47da-a471-e01f481f920e","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"641dff51-97fd-56b3-8443-c1ed568a6d66","issue_type":"Missing Column","issue_message":"Required column ENCOUNTER_ID is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"ENCOUNTER_ID\"","elaboration":null},
{"ingest_session_issue_id":"d74cbbe7-bce2-41cb-a1e7-030615c160e1","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"641dff51-97fd-56b3-8443-c1ed568a6d66","issue_type":"Missing Column","issue_message":"Required column SURVEY is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"SURVEY\"","elaboration":null},
{"ingest_session_issue_id":"c78b0791-69f5-42bc-b63f-f7b4d0760623","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"641dff51-97fd-56b3-8443-c1ed568a6d66","issue_type":"Missing Column","issue_message":"Required column SURVEY_ID is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"SURVEY_ID\"","elaboration":null},
{"ingest_session_issue_id":"a0dcba12-834d-4283-b6b3-d4d2f5865553","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"641dff51-97fd-56b3-8443-c1ed568a6d66","issue_type":"Missing Column","issue_message":"Required column RECORDED_TIME is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"RECORDED_TIME\"","elaboration":null},
{"ingest_session_issue_id":"e3d79e6b-0fc8-4da5-8870-b9de5bb10ab9","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"641dff51-97fd-56b3-8443-c1ed568a6d66","issue_type":"Missing Column","issue_message":"Required column QUESTION is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"QUESTION\"","elaboration":null},
{"ingest_session_issue_id":"d8bc369c-b1d7-4896-b7db-f06fc378a1b7","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"641dff51-97fd-56b3-8443-c1ed568a6d66","issue_type":"Missing Column","issue_message":"Required column MEAS_VALUE is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"MEAS_VALUE\"","elaboration":null},
{"ingest_session_issue_id":"c951266d-ff4a-4999-b2d5-e90ea480dc22","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"641dff51-97fd-56b3-8443-c1ed568a6d66","issue_type":"Missing Column","issue_message":"Required column QUESTION_CODE is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"QUESTION_CODE\"","elaboration":null},
{"ingest_session_issue_id":"6d4da6ff-e948-44e6-bd91-aeed8f5fd1bd","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"641dff51-97fd-56b3-8443-c1ed568a6d66","issue_type":"Missing Column","issue_message":"Required column QUESTION_CODE_SYSTEM_NAME is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"QUESTION_CODE_SYSTEM_NAME\"","elaboration":null},
{"ingest_session_issue_id":"83cfaea1-f575-4fbe-a2aa-5ab424114b1d","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"641dff51-97fd-56b3-8443-c1ed568a6d66","issue_type":"Missing Column","issue_message":"Required column ANSWER_CODE is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"ANSWER_CODE\"","elaboration":null},
{"ingest_session_issue_id":"8c0a932e-64c2-4560-9276-d2ab704acebe","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"641dff51-97fd-56b3-8443-c1ed568a6d66","issue_type":"Missing Column","issue_message":"Required column ANSWER_CODE_SYSTEM_NAME is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"ANSWER_CODE_SYSTEM_NAME\"","elaboration":null},
{"ingest_session_issue_id":"d0fc3004-8671-4c23-bddb-e5afb85fd8ae","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"641dff51-97fd-56b3-8443-c1ed568a6d66","issue_type":"Missing Column","issue_message":"Required column SDOH_DOMAIN is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"SDOH_DOMAIN\"","elaboration":null},
{"ingest_session_issue_id":"9a41cae6-f435-4faf-926c-97c0013a3463","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"641dff51-97fd-56b3-8443-c1ed568a6d66","issue_type":"Missing Column","issue_message":"Required column NEED_INDICATED is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"NEED_INDICATED\"","elaboration":null},
{"ingest_session_issue_id":"cf2d9d52-452b-4e3f-a93d-1f65bb6c2b22","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"641dff51-97fd-56b3-8443-c1ed568a6d66","issue_type":"Missing Column","issue_message":"Required column VISIT_PART_2_FLAG is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"VISIT_PART_2_FLAG\"","elaboration":null},
{"ingest_session_issue_id":"03ee0bbd-3d6e-464d-8e07-35ba9aa27f45","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"641dff51-97fd-56b3-8443-c1ed568a6d66","issue_type":"Missing Column","issue_message":"Required column VISIT_OMH_FLAG is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"VISIT_OMH_FLAG\"","elaboration":null},
{"ingest_session_issue_id":"dbbc08c5-00c8-4521-9a88-f314894aa1db","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"641dff51-97fd-56b3-8443-c1ed568a6d66","issue_type":"Missing Column","issue_message":"Required column VISIT_OPWDD_FLAG is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"VISIT_OPWDD_FLAG\"","elaboration":null}]

```

## ingest-4
```sql
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "ingest_session_entry" ("ingest_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('d70a4700-6b40-52fc-a7a2-69ef0d7f69ff', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/synthetic-content/synthetic-fail-excel-01.xlsx', 'ERROR', NULL);
INSERT INTO "ingest_session_issue" ("ingest_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('47277588-99e8-59f5-8384-b24344a86073', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'd70a4700-6b40-52fc-a7a2-69ef0d7f69ff', 'Sheet Missing', 'Excel workbook sheet ''Admin_Demographic'' not found in ''synthetic-fail-excel-01.xlsx'' (available: Sheet1)', NULL, NULL, 'support/assurance/synthetic-content/synthetic-fail-excel-01.xlsx', NULL, NULL);;
-- required by IngestEngine, emit the errors for the given session (file) so it can be picked up
SELECT * FROM ingest_session_issue WHERE session_id = '05269d28-15ae-5bd6-bd88-f949ccfa52d7' and session_entry_id = 'd70a4700-6b40-52fc-a7a2-69ef0d7f69ff';
```

### stdout
```sh
[{"ingest_session_issue_id":"47277588-99e8-59f5-8384-b24344a86073","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"d70a4700-6b40-52fc-a7a2-69ef0d7f69ff","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet 'Admin_Demographic' not found in 'synthetic-fail-excel-01.xlsx' (available: Sheet1)","issue_row":null,"issue_column":null,"invalid_value":"support/assurance/synthetic-content/synthetic-fail-excel-01.xlsx","remediation":null,"elaboration":null}]

```

## ingest-5
```sql
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "ingest_session_entry" ("ingest_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('58b22e99-5854-53bf-adbe-08e67df99b85', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/synthetic-content/synthetic-fail-excel-01.xlsx', 'ERROR', NULL);
INSERT INTO "ingest_session_issue" ("ingest_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('a26ce332-3ced-5623-861d-23a2ef78e4a9', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '58b22e99-5854-53bf-adbe-08e67df99b85', 'Sheet Missing', 'Excel workbook sheet ''Screening'' not found in ''synthetic-fail-excel-01.xlsx'' (available: Sheet1)', NULL, NULL, 'support/assurance/synthetic-content/synthetic-fail-excel-01.xlsx', NULL, NULL);;
-- required by IngestEngine, emit the errors for the given session (file) so it can be picked up
SELECT * FROM ingest_session_issue WHERE session_id = '05269d28-15ae-5bd6-bd88-f949ccfa52d7' and session_entry_id = '58b22e99-5854-53bf-adbe-08e67df99b85';
```

### stdout
```sh
[{"ingest_session_issue_id":"a26ce332-3ced-5623-861d-23a2ef78e4a9","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"58b22e99-5854-53bf-adbe-08e67df99b85","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet 'Screening' not found in 'synthetic-fail-excel-01.xlsx' (available: Sheet1)","issue_row":null,"issue_column":null,"invalid_value":"support/assurance/synthetic-content/synthetic-fail-excel-01.xlsx","remediation":null,"elaboration":null}]

```

## ingest-6
```sql
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "ingest_session_entry" ("ingest_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('bc0c03b5-d1ba-5301-850f-5e4c42c1bf09', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/synthetic-content/synthetic-fail-excel-01.xlsx', 'ERROR', NULL);
INSERT INTO "ingest_session_issue" ("ingest_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('ae477ba1-c7f1-5f34-847a-50bddb7130aa', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'bc0c03b5-d1ba-5301-850f-5e4c42c1bf09', 'Sheet Missing', 'Excel workbook sheet ''QE_Admin_Data'' not found in ''synthetic-fail-excel-01.xlsx'' (available: Sheet1)', NULL, NULL, 'support/assurance/synthetic-content/synthetic-fail-excel-01.xlsx', NULL, NULL);;
-- required by IngestEngine, emit the errors for the given session (file) so it can be picked up
SELECT * FROM ingest_session_issue WHERE session_id = '05269d28-15ae-5bd6-bd88-f949ccfa52d7' and session_entry_id = 'bc0c03b5-d1ba-5301-850f-5e4c42c1bf09';
```

### stdout
```sh
[{"ingest_session_issue_id":"ae477ba1-c7f1-5f34-847a-50bddb7130aa","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"bc0c03b5-d1ba-5301-850f-5e4c42c1bf09","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet 'QE_Admin_Data' not found in 'synthetic-fail-excel-01.xlsx' (available: Sheet1)","issue_row":null,"issue_column":null,"invalid_value":"support/assurance/synthetic-content/synthetic-fail-excel-01.xlsx","remediation":null,"elaboration":null}]

```

## ingest-7
```sql
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "ingest_session_entry" ("ingest_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/synthetic-content/ahc-hrsn-12-12-2023-valid.csv', 'ahc_hrsn_12_12_2023_valid', NULL);

-- be sure to add src_file_row_number and session_id columns to each row
-- because assurance CTEs require them
CREATE TABLE ahc_hrsn_12_12_2023_valid AS
  SELECT *, row_number() OVER () as src_file_row_number, '05269d28-15ae-5bd6-bd88-f949ccfa52d7' as session_id, '8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839' as session_entry_id
    FROM read_csv_auto('support/assurance/synthetic-content/ahc-hrsn-12-12-2023-valid.csv');

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
           '8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839',
           'Missing Column',
           'Required column ' || column_name || ' is missing in ahc_hrsn_12_12_2023_valid.',
           'Ensure ahc_hrsn_12_12_2023_valid contains the column "' || column_name || '"'
      FROM required_column_names_in_src;

-- required by IngestEngine, emit the errors for the given session (file) so it can be picked up
SELECT * FROM ingest_session_issue WHERE session_id = '05269d28-15ae-5bd6-bd88-f949ccfa52d7' and session_entry_id = '8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839';
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
           '8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839',
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
INSERT INTO "ingest_session_state" ("ingest_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('05e8feaa-0bed-5909-a817-39812494b361', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', NULL, 'NONE', 'ENTER(init)', NULL, NULL, (make_timestamp(2023, 11, 6, 9, 55, 23.972)), NULL);
INSERT INTO "ingest_session_state" ("ingest_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('8f460419-7b80-516d-8919-84520950f612', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', NULL, 'ENTER(init)', 'EXIT(init)', NULL, NULL, (make_timestamp(2023, 11, 6, 9, 55, 23.972)), NULL);
INSERT INTO "ingest_session_state" ("ingest_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('7bab389e-54af-5a13-a39f-079abdc73a48', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', NULL, 'EXIT(init)', 'ENTER(ingest)', NULL, NULL, (make_timestamp(2023, 11, 6, 9, 55, 23.972)), NULL);
INSERT INTO "ingest_session_state" ("ingest_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', NULL, 'ENTER(ingest)', 'EXIT(ingest)', NULL, NULL, (make_timestamp(2023, 11, 6, 9, 55, 23.973)), NULL);
INSERT INTO "ingest_session_state" ("ingest_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('7ef8bdeb-fd56-5eb9-a09b-ef15ce18dc49', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', NULL, 'EXIT(ingest)', 'ENTER(ensureContent)', NULL, NULL, (make_timestamp(2023, 11, 6, 9, 55, 23.973)), NULL);

ATTACH 'support/assurance/results-test-e2e/resource.sqlite.db' AS resource_db (TYPE SQLITE);

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
COPY (SELECT * FROM ingest_session_issue) TO 'support/assurance/results-test-e2e/diagnostics.xlsx' WITH (FORMAT GDAL, DRIVER 'xlsx');
```
