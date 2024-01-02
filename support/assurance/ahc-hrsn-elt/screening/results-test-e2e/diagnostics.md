---
walkRootPaths:
  - support/assurance/ahc-hrsn-elt/screening/synthetic-content
diagsMd: support/assurance/ahc-hrsn-elt/screening/results-test-e2e/diagnostics.md
diagsXlsx: support/assurance/ahc-hrsn-elt/screening/results-test-e2e/diagnostics.xlsx
resourceDb: support/assurance/ahc-hrsn-elt/screening/results-test-e2e/resource.sqlite.db
sources:
  - uri: >-
      support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx
    nature: Excel Workbook Sheet
    tableName: ahc_hrsn_valid_01_admin_demographic
    ingestionIssues: 1
  - uri: >-
      support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx
    nature: Excel Workbook Sheet
    tableName: ahc_hrsn_valid_01_screening
    ingestionIssues: 21
  - uri: >-
      support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx
    nature: Excel Workbook Sheet
    tableName: ahc_hrsn_valid_01_q_e_admin_data
    ingestionIssues: 1
  - uri: >-
      support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail.csv
    nature: CSV
    tableName: synthetic_fail
    ingestionIssues: 21
  - uri: >-
      support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx
    nature: ERROR
    tableName: ERROR
    ingestionIssues: 1
  - uri: >-
      support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-12-12-2023-valid.csv
    nature: CSV
    tableName: ahc_hrsn_12_12_2023_valid
    ingestionIssues: 0
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


## ingest
```sql
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx (ahc_hrsn_valid_01_admin_demographic)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "ingest_session_entry" ("ingest_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('168a34c7-d043-5ec4-a84a-c961f1a301ef', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx', 'ahc_hrsn_valid_01_admin_demographic', NULL);
        
INSERT INTO "ingest_session_issue" ("ingest_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('1931dfcc-e8fc-597d-b1bc-65b4287e6fdf', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '168a34c7-d043-5ec4-a84a-c961f1a301ef', 'TODO', 'Excel workbook ''ahc-hrsn-valid-01.xlsx'' sheet ''Admin_Demographic'' has not been implemented yet.', NULL, NULL, 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx (ahc_hrsn_valid_01_screening)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "ingest_session_entry" ("ingest_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('8b7c669c-1795-5f6b-8f3a-3e502b74c628', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx', 'ahc_hrsn_valid_01_screening', NULL);
     
-- ingest Excel workbook sheet 'Screening' into ahc_hrsn_valid_01_screening using spatial plugin
INSTALL spatial; LOAD spatial;

-- be sure to add src_file_row_number and session_id columns to each row
-- because assurance CTEs require them
CREATE TABLE ahc_hrsn_valid_01_screening AS
  SELECT *, row_number() OVER () as src_file_row_number, '05269d28-15ae-5bd6-bd88-f949ccfa52d7' as session_id, '8b7c669c-1795-5f6b-8f3a-3e502b74c628' as session_entry_id
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
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Missing Column',
           'Required column ' || column_name || ' is missing in ahc_hrsn_valid_01_screening.',
           'Ensure ahc_hrsn_valid_01_screening contains the column "' || column_name || '"'
      FROM required_column_names_in_src;
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx (ahc_hrsn_valid_01_q_e_admin_data)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "ingest_session_entry" ("ingest_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('7b979b68-7227-53fd-b689-e4fe153afb76', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx', 'ahc_hrsn_valid_01_q_e_admin_data', NULL);
        
INSERT INTO "ingest_session_issue" ("ingest_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('abf5c680-a135-5d89-b871-fa5b9b99aed6', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '7b979b68-7227-53fd-b689-e4fe153afb76', 'TODO', 'Excel workbook ''ahc-hrsn-valid-01.xlsx'' sheet ''QE_Admin_Data'' has not been implemented yet.', NULL, NULL, 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail.csv (synthetic_fail)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "ingest_session_entry" ("ingest_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('641dff51-97fd-56b3-8443-c1ed568a6d66', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail.csv', 'synthetic_fail', NULL);

-- be sure to add src_file_row_number and session_id columns to each row
-- because assurance CTEs require them
CREATE TABLE synthetic_fail AS
  SELECT *, row_number() OVER () as src_file_row_number, '05269d28-15ae-5bd6-bd88-f949ccfa52d7' as session_id, '641dff51-97fd-56b3-8443-c1ed568a6d66' as session_entry_id
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
           '641dff51-97fd-56b3-8443-c1ed568a6d66',
           'Missing Column',
           'Required column ' || column_name || ' is missing in synthetic_fail.',
           'Ensure synthetic_fail contains the column "' || column_name || '"'
      FROM required_column_names_in_src;
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx (ERROR)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "ingest_session_entry" ("ingest_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('d70a4700-6b40-52fc-a7a2-69ef0d7f69ff', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx', 'ERROR', NULL);
INSERT INTO "ingest_session_issue" ("ingest_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('47277588-99e8-59f5-8384-b24344a86073', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'd70a4700-6b40-52fc-a7a2-69ef0d7f69ff', 'Sheet Missing', 'Excel workbook sheet ''Admin_Demographic'' not found in ''synthetic-fail-excel-01.xlsx'' (available: Sheet1)', NULL, NULL, 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx (ERROR)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "ingest_session_entry" ("ingest_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('58b22e99-5854-53bf-adbe-08e67df99b85', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx', 'ERROR', NULL);
INSERT INTO "ingest_session_issue" ("ingest_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('a26ce332-3ced-5623-861d-23a2ef78e4a9', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '58b22e99-5854-53bf-adbe-08e67df99b85', 'Sheet Missing', 'Excel workbook sheet ''Screening'' not found in ''synthetic-fail-excel-01.xlsx'' (available: Sheet1)', NULL, NULL, 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx (ERROR)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "ingest_session_entry" ("ingest_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('bc0c03b5-d1ba-5301-850f-5e4c42c1bf09', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx', 'ERROR', NULL);
INSERT INTO "ingest_session_issue" ("ingest_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('ae477ba1-c7f1-5f34-847a-50bddb7130aa', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'bc0c03b5-d1ba-5301-850f-5e4c42c1bf09', 'Sheet Missing', 'Excel workbook sheet ''QE_Admin_Data'' not found in ''synthetic-fail-excel-01.xlsx'' (available: Sheet1)', NULL, NULL, 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-12-12-2023-valid.csv (ahc_hrsn_12_12_2023_valid)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "ingest_session_entry" ("ingest_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-12-12-2023-valid.csv', 'ahc_hrsn_12_12_2023_valid', NULL);

-- be sure to add src_file_row_number and session_id columns to each row
-- because assurance CTEs require them
CREATE TABLE ahc_hrsn_12_12_2023_valid AS
  SELECT *, row_number() OVER () as src_file_row_number, '05269d28-15ae-5bd6-bd88-f949ccfa52d7' as session_id, '8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839' as session_entry_id
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
           '8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839',
           'Missing Column',
           'Required column ' || column_name || ' is missing in ahc_hrsn_12_12_2023_valid.',
           'Ensure ahc_hrsn_12_12_2023_valid contains the column "' || column_name || '"'
      FROM required_column_names_in_src;
SELECT session_entry_id, ingest_session_issue_id, issue_type, issue_message, invalid_value FROM ingest_session_issue WHERE session_id = '05269d28-15ae-5bd6-bd88-f949ccfa52d7'
```

### stdout
```sh
[{"session_entry_id":"168a34c7-d043-5ec4-a84a-c961f1a301ef","ingest_session_issue_id":"1931dfcc-e8fc-597d-b1bc-65b4287e6fdf","issue_type":"TODO","issue_message":"Excel workbook 'ahc-hrsn-valid-01.xlsx' sheet 'Admin_Demographic' has not been implemented yet.","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx"},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","ingest_session_issue_id":"f90e1b86-1420-44d6-b5cc-30eaa9bf35b8","issue_type":"Missing Column","issue_message":"Required column PAT_MRN_ID is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","ingest_session_issue_id":"47cae7da-f34b-4f30-a4a7-40cddb1f6edf","issue_type":"Missing Column","issue_message":"Required column FACILITY is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","ingest_session_issue_id":"ebee1f4a-ee7c-479c-8b07-89758cb1d73e","issue_type":"Missing Column","issue_message":"Required column FIRST_NAME is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","ingest_session_issue_id":"87b75ddc-9bd3-4e0b-a329-8630956f260a","issue_type":"Missing Column","issue_message":"Required column LAST_NAME is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","ingest_session_issue_id":"71122c39-abfa-4f7a-a052-7b12dbc85209","issue_type":"Missing Column","issue_message":"Required column PAT_BIRTH_DATE is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","ingest_session_issue_id":"4d3ec647-4c81-4b82-9c4a-97c46b79da94","issue_type":"Missing Column","issue_message":"Required column MEDICAID_CIN is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","ingest_session_issue_id":"732ff8b5-04f4-4f64-a79e-3b70904ddc77","issue_type":"Missing Column","issue_message":"Required column ENCOUNTER_ID is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","ingest_session_issue_id":"f525abde-7b87-4938-b10f-0ba22a181d66","issue_type":"Missing Column","issue_message":"Required column SURVEY is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","ingest_session_issue_id":"cdcfa698-2b10-488e-b38b-5a0922968fcf","issue_type":"Missing Column","issue_message":"Required column SURVEY_ID is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","ingest_session_issue_id":"0436f804-5fa3-4376-a333-bdd660a1dcbf","issue_type":"Missing Column","issue_message":"Required column RECORDED_TIME is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","ingest_session_issue_id":"6b79ac35-5a81-404d-a6f4-0ac2d842180b","issue_type":"Missing Column","issue_message":"Required column QUESTION is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","ingest_session_issue_id":"ac240c17-7a9d-4b3f-9a57-0a7bab948de9","issue_type":"Missing Column","issue_message":"Required column MEAS_VALUE is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","ingest_session_issue_id":"65cb6487-0370-4c9f-a8c8-4fdcc72b5481","issue_type":"Missing Column","issue_message":"Required column QUESTION_CODE is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","ingest_session_issue_id":"8ca30133-4a62-483b-adb5-73af19efffc0","issue_type":"Missing Column","issue_message":"Required column QUESTION_CODE_SYSTEM_NAME is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","ingest_session_issue_id":"1140d439-6c92-4031-97a7-11efb15a0b8f","issue_type":"Missing Column","issue_message":"Required column ANSWER_CODE is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","ingest_session_issue_id":"806433ee-9244-4fa9-ae48-4241b64c73bb","issue_type":"Missing Column","issue_message":"Required column ANSWER_CODE_SYSTEM_NAME is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","ingest_session_issue_id":"c0a83f0f-8258-4839-956a-cc11924e897c","issue_type":"Missing Column","issue_message":"Required column SDOH_DOMAIN is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","ingest_session_issue_id":"ee11d8bd-5e1e-418d-9212-aba3d1464169","issue_type":"Missing Column","issue_message":"Required column NEED_INDICATED is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","ingest_session_issue_id":"eeb5f9e9-640c-4a2a-89a1-ca18e0d1e2cc","issue_type":"Missing Column","issue_message":"Required column VISIT_PART_2_FLAG is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","ingest_session_issue_id":"05608383-5739-4536-9956-0ee132c81df5","issue_type":"Missing Column","issue_message":"Required column VISIT_OMH_FLAG is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","ingest_session_issue_id":"effc0021-0518-46f0-bd24-51c18ea2ef7c","issue_type":"Missing Column","issue_message":"Required column VISIT_OPWDD_FLAG is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"7b979b68-7227-53fd-b689-e4fe153afb76","ingest_session_issue_id":"abf5c680-a135-5d89-b871-fa5b9b99aed6","issue_type":"TODO","issue_message":"Excel workbook 'ahc-hrsn-valid-01.xlsx' sheet 'QE_Admin_Data' has not been implemented yet.","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx"},
{"session_entry_id":"641dff51-97fd-56b3-8443-c1ed568a6d66","ingest_session_issue_id":"5fdee1e6-35b0-4957-a97a-144f6047a5fc","issue_type":"Missing Column","issue_message":"Required column PAT_MRN_ID is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"641dff51-97fd-56b3-8443-c1ed568a6d66","ingest_session_issue_id":"f6df354f-de42-45e8-b911-d8003e95da0a","issue_type":"Missing Column","issue_message":"Required column FACILITY is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"641dff51-97fd-56b3-8443-c1ed568a6d66","ingest_session_issue_id":"195b5ec4-0e29-4f0f-b947-b4aebf30db7e","issue_type":"Missing Column","issue_message":"Required column FIRST_NAME is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"641dff51-97fd-56b3-8443-c1ed568a6d66","ingest_session_issue_id":"ce61d386-d74e-4d57-88cb-c2d4841f2850","issue_type":"Missing Column","issue_message":"Required column LAST_NAME is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"641dff51-97fd-56b3-8443-c1ed568a6d66","ingest_session_issue_id":"c870238a-6582-4143-b011-2bbcb815beba","issue_type":"Missing Column","issue_message":"Required column PAT_BIRTH_DATE is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"641dff51-97fd-56b3-8443-c1ed568a6d66","ingest_session_issue_id":"fea81780-cea3-4276-b8c5-f614ddcae93c","issue_type":"Missing Column","issue_message":"Required column MEDICAID_CIN is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"641dff51-97fd-56b3-8443-c1ed568a6d66","ingest_session_issue_id":"94b9747a-5851-416c-8dd0-c07a2a2fc357","issue_type":"Missing Column","issue_message":"Required column ENCOUNTER_ID is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"641dff51-97fd-56b3-8443-c1ed568a6d66","ingest_session_issue_id":"14e733df-0136-412e-aab0-feb8f220833f","issue_type":"Missing Column","issue_message":"Required column SURVEY is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"641dff51-97fd-56b3-8443-c1ed568a6d66","ingest_session_issue_id":"06e8f683-8b7e-4282-8b3c-bba186c5d980","issue_type":"Missing Column","issue_message":"Required column SURVEY_ID is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"641dff51-97fd-56b3-8443-c1ed568a6d66","ingest_session_issue_id":"0186351e-151e-4b24-9d17-37a028982787","issue_type":"Missing Column","issue_message":"Required column RECORDED_TIME is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"641dff51-97fd-56b3-8443-c1ed568a6d66","ingest_session_issue_id":"78cc5f6b-1d37-49a9-a6a7-ff657c93a1dc","issue_type":"Missing Column","issue_message":"Required column QUESTION is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"641dff51-97fd-56b3-8443-c1ed568a6d66","ingest_session_issue_id":"353be5f1-42b4-4c21-8247-0058b5faef00","issue_type":"Missing Column","issue_message":"Required column MEAS_VALUE is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"641dff51-97fd-56b3-8443-c1ed568a6d66","ingest_session_issue_id":"a5665d88-1b21-4fc5-969d-64b4e8325f6d","issue_type":"Missing Column","issue_message":"Required column QUESTION_CODE is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"641dff51-97fd-56b3-8443-c1ed568a6d66","ingest_session_issue_id":"4862b8c6-ee43-41bf-87d8-c513a8df0af4","issue_type":"Missing Column","issue_message":"Required column QUESTION_CODE_SYSTEM_NAME is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"641dff51-97fd-56b3-8443-c1ed568a6d66","ingest_session_issue_id":"c19e097c-e4db-41e1-bce2-b67c91de1f18","issue_type":"Missing Column","issue_message":"Required column ANSWER_CODE is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"641dff51-97fd-56b3-8443-c1ed568a6d66","ingest_session_issue_id":"e2a59c76-55b4-40b1-965f-8211316f5bc5","issue_type":"Missing Column","issue_message":"Required column ANSWER_CODE_SYSTEM_NAME is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"641dff51-97fd-56b3-8443-c1ed568a6d66","ingest_session_issue_id":"3e58c098-cf2d-45d5-8e9b-5407e46f61c8","issue_type":"Missing Column","issue_message":"Required column SDOH_DOMAIN is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"641dff51-97fd-56b3-8443-c1ed568a6d66","ingest_session_issue_id":"77d0008e-108f-46b5-8ea0-ea43e7606017","issue_type":"Missing Column","issue_message":"Required column NEED_INDICATED is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"641dff51-97fd-56b3-8443-c1ed568a6d66","ingest_session_issue_id":"f25ac8c1-ef7c-4600-9858-271ef4f501d8","issue_type":"Missing Column","issue_message":"Required column VISIT_PART_2_FLAG is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"641dff51-97fd-56b3-8443-c1ed568a6d66","ingest_session_issue_id":"680e74ef-c3a1-4247-9ac4-e950c9b6a540","issue_type":"Missing Column","issue_message":"Required column VISIT_OMH_FLAG is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"641dff51-97fd-56b3-8443-c1ed568a6d66","ingest_session_issue_id":"f0c7a585-20a6-4e4e-892f-82c31eb69047","issue_type":"Missing Column","issue_message":"Required column VISIT_OPWDD_FLAG is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"d70a4700-6b40-52fc-a7a2-69ef0d7f69ff","ingest_session_issue_id":"47277588-99e8-59f5-8384-b24344a86073","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet 'Admin_Demographic' not found in 'synthetic-fail-excel-01.xlsx' (available: Sheet1)","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx"},
{"session_entry_id":"58b22e99-5854-53bf-adbe-08e67df99b85","ingest_session_issue_id":"a26ce332-3ced-5623-861d-23a2ef78e4a9","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet 'Screening' not found in 'synthetic-fail-excel-01.xlsx' (available: Sheet1)","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx"},
{"session_entry_id":"bc0c03b5-d1ba-5301-850f-5e4c42c1bf09","ingest_session_issue_id":"ae477ba1-c7f1-5f34-847a-50bddb7130aa","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet 'QE_Admin_Data' not found in 'synthetic-fail-excel-01.xlsx' (available: Sheet1)","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx"}]

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
INSERT INTO "ingest_session_state" ("ingest_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('05e8feaa-0bed-5909-a817-39812494b361', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', NULL, 'NONE', 'ENTER(prepareInit)', NULL, 'rsEE.beforeCell', (make_timestamp(2024, 1, 2, 12, 35, 57.578)), NULL);
INSERT INTO "ingest_session_state" ("ingest_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('8f460419-7b80-516d-8919-84520950f612', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', NULL, 'EXIT(prepareInit)', 'ENTER(init)', NULL, 'rsEE.afterCell', (make_timestamp(2024, 1, 2, 12, 35, 57.578)), NULL);
INSERT INTO "ingest_session_state" ("ingest_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('7bab389e-54af-5a13-a39f-079abdc73a48', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', NULL, 'EXIT(init)', 'ENTER(ingest)', NULL, 'rsEE.afterCell', (make_timestamp(2024, 1, 2, 12, 35, 57.578)), NULL);
INSERT INTO "ingest_session_state" ("ingest_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', NULL, 'EXIT(ingest)', 'ENTER(ensureContent)', NULL, 'rsEE.afterCell', (make_timestamp(2024, 1, 2, 12, 35, 57.578)), NULL);
INSERT INTO "ingest_session_state" ("ingest_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('7ef8bdeb-fd56-5eb9-a09b-ef15ce18dc49', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', NULL, 'EXIT(ensureContent)', 'ENTER(emitResources)', NULL, 'rsEE.afterCell', (make_timestamp(2024, 1, 2, 12, 35, 57.578)), NULL);

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
