---
walkRootPaths:
  - support/assurance/ahc-hrsn-elt/screening/synthetic-content
diagsJson: support/assurance/ahc-hrsn-elt/screening/results-test-e2e/diagnostics.json
diagsMd: support/assurance/ahc-hrsn-elt/screening/results-test-e2e/diagnostics.md
diagsXlsx: support/assurance/ahc-hrsn-elt/screening/results-test-e2e/diagnostics.xlsx
resourceDb: support/assurance/ahc-hrsn-elt/screening/results-test-e2e/resource.sqlite.db
sources:
  - uri: >-
      support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail.csv
    nature: CSV
    tableName: synthetic_fail
    ingestionIssues: 21
  - uri: >-
      support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-12-12-2023-valid.csv
    nature: CSV
    tableName: ahc_hrsn_12_12_2023_valid
    ingestionIssues: 0
  - uri: >-
      support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx
    nature: ERROR
    tableName: ERROR
    ingestionIssues: 1
  - uri: >-
      support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx
    nature: Excel Workbook Sheet
    tableName: ahc_hrsn_valid_01_admin_demographic
    ingestionIssues: 1
  - uri: >-
      support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx
    nature: Excel Workbook Sheet
    tableName: ahc_hrsn_valid_01_screening
    ingestionIssues: 12
  - uri: >-
      support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx
    nature: Excel Workbook Sheet
    tableName: ahc_hrsn_valid_01_q_e_admin_data
    ingestionIssues: 1
---
# Orchestration Diagnostics

## init
```sql

-- no before-init SQL found
CREATE TABLE IF NOT EXISTS "device" (
    "device_id" TEXT PRIMARY KEY NOT NULL,
    "name" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "boundary" TEXT NOT NULL,
    "segmentation" TEXT,
    "state_sysinfo" TEXT,
    "elaboration" TEXT,
    UNIQUE("name", "state", "boundary")
);
CREATE TABLE IF NOT EXISTS "orch_session" (
    "orch_session_id" TEXT PRIMARY KEY NOT NULL,
    "device_id" TEXT NOT NULL,
    "orch_started_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "orch_finished_at" TIMESTAMPTZ,
    "elaboration" TEXT,
    FOREIGN KEY("device_id") REFERENCES "device"("device_id")
);
CREATE TABLE IF NOT EXISTS "orch_session_entry" (
    "orch_session_entry_id" TEXT PRIMARY KEY NOT NULL,
    "session_id" TEXT NOT NULL,
    "ingest_src" TEXT NOT NULL,
    "ingest_table_name" TEXT,
    "elaboration" TEXT,
    FOREIGN KEY("session_id") REFERENCES "orch_session"("orch_session_id")
);
CREATE TABLE IF NOT EXISTS "orch_session_state" (
    "orch_session_state_id" TEXT PRIMARY KEY NOT NULL,
    "session_id" TEXT NOT NULL,
    "session_entry_id" TEXT,
    "from_state" TEXT NOT NULL,
    "to_state" TEXT NOT NULL,
    "transition_result" TEXT,
    "transition_reason" TEXT,
    "transitioned_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "elaboration" TEXT,
    FOREIGN KEY("session_id") REFERENCES "orch_session"("orch_session_id"),
    FOREIGN KEY("session_entry_id") REFERENCES "orch_session_entry"("orch_session_entry_id"),
    UNIQUE("orch_session_state_id", "from_state", "to_state")
);
CREATE TABLE IF NOT EXISTS "orch_session_exec" (
    "orch_session_exec_id" TEXT PRIMARY KEY NOT NULL,
    "exec_nature" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "session_entry_id" TEXT,
    "parent_exec_id" TEXT,
    "namespace" TEXT,
    "exec_identity" TEXT,
    "exec_code" TEXT NOT NULL,
    "exec_status" INTEGER NOT NULL,
    "input_text" TEXT,
    "exec_error_text" TEXT,
    "output_text" TEXT,
    "output_nature" TEXT,
    "narrative_md" TEXT,
    "elaboration" TEXT,
    FOREIGN KEY("session_id") REFERENCES "orch_session"("orch_session_id"),
    FOREIGN KEY("session_entry_id") REFERENCES "orch_session_entry"("orch_session_entry_id"),
    FOREIGN KEY("parent_exec_id") REFERENCES "orch_session_exec"("orch_session_exec_id")
);
CREATE TABLE IF NOT EXISTS "orch_session_issue" (
    "orch_session_issue_id" TEXT PRIMARY KEY NOT NULL,
    "session_id" TEXT NOT NULL,
    "session_entry_id" TEXT,
    "issue_type" TEXT NOT NULL,
    "issue_message" TEXT NOT NULL,
    "issue_row" INTEGER,
    "issue_column" TEXT,
    "invalid_value" TEXT,
    "remediation" TEXT,
    "elaboration" TEXT,
    FOREIGN KEY("session_id") REFERENCES "orch_session"("orch_session_id"),
    FOREIGN KEY("session_entry_id") REFERENCES "orch_session_entry"("orch_session_entry_id")
);
CREATE INDEX IF NOT EXISTS "idx_device__name__state" ON "device"("name", "state");

DROP VIEW IF EXISTS "orch_session_diagnostic_text";
CREATE VIEW IF NOT EXISTS "orch_session_diagnostic_text" AS
    SELECT
        -- Including all other columns from 'orch_session'
        ises.* EXCLUDE (orch_started_at, orch_finished_at),
        -- TODO: Casting known timestamp columns to text so emit to Excel works with GDAL (spatial)
           -- strftime(timestamptz orch_started_at, '%Y-%m-%d %H:%M:%S') AS orch_started_at,
           -- strftime(timestamptz orch_finished_at, '%Y-%m-%d %H:%M:%S') AS orch_finished_at,
    
        -- Including all columns from 'orch_session_entry'
        isee.* EXCLUDE (session_id),
    
        -- Including all other columns from 'orch_session_issue'
        isi.* EXCLUDE (session_id, session_entry_id)
    FROM orch_session AS ises
    JOIN orch_session_entry AS isee ON ises.orch_session_id = isee.session_id
    LEFT JOIN orch_session_issue AS isi ON isee.orch_session_entry_id = isi.session_entry_id;

-- register the current device and session and use the identifiers for all logging
INSERT INTO "device" ("device_id", "name", "state", "boundary", "segmentation", "state_sysinfo", "elaboration") VALUES ('05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'Defiant', 'SINGLETON', 'UNKNOWN', NULL, '{"os-arch":"x64","os-platform":"linux"}', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "orch_session" ("orch_session_id", "device_id", "orch_started_at", "orch_finished_at", "elaboration") VALUES ('05e8feaa-0bed-5909-a817-39812494b361', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', NULL, NULL, NULL);

-- no after-init SQL found
```


## ingest
```sql
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail.csv (synthetic_fail)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('8b7c669c-1795-5f6b-8f3a-3e502b74c628', '05e8feaa-0bed-5909-a817-39812494b361', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail.csv', 'synthetic_fail', NULL);

-- be sure to add src_file_row_number and session_id columns to each row
-- because assurance CTEs require them
CREATE TABLE synthetic_fail AS
  SELECT *, row_number() OVER () as src_file_row_number, '05e8feaa-0bed-5909-a817-39812494b361' as session_id, '8b7c669c-1795-5f6b-8f3a-3e502b74c628' as session_entry_id
    FROM read_csv_auto('support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail.csv');

WITH required_column_names_in_src AS (
    SELECT column_name
      FROM (VALUES ('PAT_MRN_ID'), ('FACILITY'), ('FIRST_NAME'), ('LAST_NAME'), ('PAT_BIRTH_DATE'), ('MEDICAID_CIN'), ('ENCOUNTER_ID'), ('SURVEY'), ('SURVEY_ID'), ('RECORDED_TIME'), ('QUESTION'), ('MEAS_VALUE'), ('QUESTION_CODE'), ('QUESTION_CODE_SYSTEM_NAME'), ('ANSWER_CODE'), ('ANSWER_CODE_SYSTEM_NAME'), ('SDOH_DOMAIN'), ('NEED_INDICATED'), ('VISIT_PART_2_FLAG'), ('VISIT_OMH_FLAG'), ('VISIT_OPWDD_FLAG')) AS required(column_name)
     WHERE required.column_name NOT IN (
         SELECT upper(trim(column_name))
           FROM information_schema.columns
          WHERE table_name = 'synthetic_fail')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Missing Column',
           'Required column ' || column_name || ' is missing in synthetic_fail.',
           'Ensure synthetic_fail contains the column "' || column_name || '"'
      FROM required_column_names_in_src;
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-12-12-2023-valid.csv (ahc_hrsn_12_12_2023_valid)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('7b979b68-7227-53fd-b689-e4fe153afb76', '05e8feaa-0bed-5909-a817-39812494b361', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-12-12-2023-valid.csv', 'ahc_hrsn_12_12_2023_valid', NULL);

-- be sure to add src_file_row_number and session_id columns to each row
-- because assurance CTEs require them
CREATE TABLE ahc_hrsn_12_12_2023_valid AS
  SELECT *, row_number() OVER () as src_file_row_number, '05e8feaa-0bed-5909-a817-39812494b361' as session_id, '7b979b68-7227-53fd-b689-e4fe153afb76' as session_entry_id
    FROM read_csv_auto('support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-12-12-2023-valid.csv');

WITH required_column_names_in_src AS (
    SELECT column_name
      FROM (VALUES ('PAT_MRN_ID'), ('FACILITY'), ('FIRST_NAME'), ('LAST_NAME'), ('PAT_BIRTH_DATE'), ('MEDICAID_CIN'), ('ENCOUNTER_ID'), ('SURVEY'), ('SURVEY_ID'), ('RECORDED_TIME'), ('QUESTION'), ('MEAS_VALUE'), ('QUESTION_CODE'), ('QUESTION_CODE_SYSTEM_NAME'), ('ANSWER_CODE'), ('ANSWER_CODE_SYSTEM_NAME'), ('SDOH_DOMAIN'), ('NEED_INDICATED'), ('VISIT_PART_2_FLAG'), ('VISIT_OMH_FLAG'), ('VISIT_OPWDD_FLAG')) AS required(column_name)
     WHERE required.column_name NOT IN (
         SELECT upper(trim(column_name))
           FROM information_schema.columns
          WHERE table_name = 'ahc_hrsn_12_12_2023_valid')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '7b979b68-7227-53fd-b689-e4fe153afb76',
           'Missing Column',
           'Required column ' || column_name || ' is missing in ahc_hrsn_12_12_2023_valid.',
           'Ensure ahc_hrsn_12_12_2023_valid contains the column "' || column_name || '"'
      FROM required_column_names_in_src;
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx (ERROR)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('abf5c680-a135-5d89-b871-fa5b9b99aed6', '05e8feaa-0bed-5909-a817-39812494b361', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx', 'ERROR', NULL);
INSERT INTO "orch_session_issue" ("orch_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('641dff51-97fd-56b3-8443-c1ed568a6d66', '05e8feaa-0bed-5909-a817-39812494b361', 'abf5c680-a135-5d89-b871-fa5b9b99aed6', 'Sheet Missing', 'Excel workbook sheet ''Admin_Demographic'' not found in ''synthetic-fail-excel-01.xlsx'' (available: Sheet1)', NULL, NULL, 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx (ERROR)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('d70a4700-6b40-52fc-a7a2-69ef0d7f69ff', '05e8feaa-0bed-5909-a817-39812494b361', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx', 'ERROR', NULL);
INSERT INTO "orch_session_issue" ("orch_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('47277588-99e8-59f5-8384-b24344a86073', '05e8feaa-0bed-5909-a817-39812494b361', 'd70a4700-6b40-52fc-a7a2-69ef0d7f69ff', 'Sheet Missing', 'Excel workbook sheet ''Screening'' not found in ''synthetic-fail-excel-01.xlsx'' (available: Sheet1)', NULL, NULL, 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx (ERROR)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('58b22e99-5854-53bf-adbe-08e67df99b85', '05e8feaa-0bed-5909-a817-39812494b361', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx', 'ERROR', NULL);
INSERT INTO "orch_session_issue" ("orch_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('a26ce332-3ced-5623-861d-23a2ef78e4a9', '05e8feaa-0bed-5909-a817-39812494b361', '58b22e99-5854-53bf-adbe-08e67df99b85', 'Sheet Missing', 'Excel workbook sheet ''QE_Admin_Data'' not found in ''synthetic-fail-excel-01.xlsx'' (available: Sheet1)', NULL, NULL, 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx (ahc_hrsn_valid_01_admin_demographic)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('bc0c03b5-d1ba-5301-850f-5e4c42c1bf09', '05e8feaa-0bed-5909-a817-39812494b361', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx', 'ahc_hrsn_valid_01_admin_demographic', NULL);
        
INSERT INTO "orch_session_issue" ("orch_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('ae477ba1-c7f1-5f34-847a-50bddb7130aa', '05e8feaa-0bed-5909-a817-39812494b361', 'bc0c03b5-d1ba-5301-850f-5e4c42c1bf09', 'TODO', 'Excel workbook ''ahc-hrsn-valid-01.xlsx'' sheet ''Admin_Demographic'' has not been implemented yet.', NULL, NULL, 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx (ahc_hrsn_valid_01_screening)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839', '05e8feaa-0bed-5909-a817-39812494b361', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx', 'ahc_hrsn_valid_01_screening', NULL);
     
-- ingest Excel workbook sheet 'Screening' into ahc_hrsn_valid_01_screening using spatial plugin
INSTALL spatial; LOAD spatial;

-- be sure to add src_file_row_number and session_id columns to each row
-- because assurance CTEs require them
CREATE TABLE ahc_hrsn_valid_01_screening AS
  SELECT *, row_number() OVER () as src_file_row_number, '05e8feaa-0bed-5909-a817-39812494b361' as session_id, '8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839' as session_entry_id
    FROM st_read('support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx', layer='Screening', open_options=['HEADERS=FORCE', 'FIELD_TYPES=AUTO']);          

WITH required_column_names_in_src AS (
    SELECT column_name
      FROM (VALUES ('PAT_MRN_ID'), ('FACILITY'), ('FIRST_NAME'), ('LAST_NAME'), ('PAT_BIRTH_DATE'), ('MEDICAID_CIN'), ('ENCOUNTER_ID'), ('SURVEY'), ('SURVEY_ID'), ('RECORDED_TIME'), ('QUESTION'), ('MEAS_VALUE'), ('QUESTION_CODE'), ('QUESTION_CODE_SYSTEM_NAME'), ('ANSWER_CODE'), ('ANSWER_CODE_SYSTEM_NAME'), ('SDOH_DOMAIN'), ('NEED_INDICATED'), ('VISIT_PART_2_FLAG'), ('VISIT_OMH_FLAG'), ('VISIT_OPWDD_FLAG')) AS required(column_name)
     WHERE required.column_name NOT IN (
         SELECT upper(trim(column_name))
           FROM information_schema.columns
          WHERE table_name = 'ahc_hrsn_valid_01_screening')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839',
           'Missing Column',
           'Required column ' || column_name || ' is missing in ahc_hrsn_valid_01_screening.',
           'Ensure ahc_hrsn_valid_01_screening contains the column "' || column_name || '"'
      FROM required_column_names_in_src;
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx (ahc_hrsn_valid_01_q_e_admin_data)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0', '05e8feaa-0bed-5909-a817-39812494b361', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx', 'ahc_hrsn_valid_01_q_e_admin_data', NULL);
        
INSERT INTO "orch_session_issue" ("orch_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('7ef8bdeb-fd56-5eb9-a09b-ef15ce18dc49', '05e8feaa-0bed-5909-a817-39812494b361', 'b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0', 'TODO', 'Excel workbook ''ahc-hrsn-valid-01.xlsx'' sheet ''QE_Admin_Data'' has not been implemented yet.', NULL, NULL, 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx', NULL, NULL);
SELECT session_entry_id, orch_session_issue_id, issue_type, issue_message, invalid_value FROM orch_session_issue WHERE session_id = '05e8feaa-0bed-5909-a817-39812494b361'
```

### stdout
```sh
[{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"25355414-e403-4a71-9f97-6080aa7bf3a2","issue_type":"Missing Column","issue_message":"Required column PAT_MRN_ID is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"1b56ef89-bbe2-4316-9053-88092657c1f1","issue_type":"Missing Column","issue_message":"Required column FACILITY is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"e2319144-804e-4b6e-9e1c-b4f3879f087e","issue_type":"Missing Column","issue_message":"Required column FIRST_NAME is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"6854ff25-99aa-4cfd-8f56-bb8555cd2907","issue_type":"Missing Column","issue_message":"Required column LAST_NAME is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"8f598ae7-822d-4c83-982e-4ffbb6c659b0","issue_type":"Missing Column","issue_message":"Required column PAT_BIRTH_DATE is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"7e545c76-8575-4640-8f1d-19b211581e88","issue_type":"Missing Column","issue_message":"Required column MEDICAID_CIN is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"2ff4dd2b-6851-41f3-b12c-d851ee7a48d8","issue_type":"Missing Column","issue_message":"Required column ENCOUNTER_ID is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"81cde82d-dc27-4b05-bfb5-d8647e2567a5","issue_type":"Missing Column","issue_message":"Required column SURVEY is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"e4664262-9986-4c1a-888c-de73c88ec7df","issue_type":"Missing Column","issue_message":"Required column SURVEY_ID is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"c215c80d-a0fc-4cef-9b26-bd3395bb442e","issue_type":"Missing Column","issue_message":"Required column RECORDED_TIME is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"261d05e0-5f76-48a2-97a1-1ca728d5ab8a","issue_type":"Missing Column","issue_message":"Required column QUESTION is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"1a853360-4bee-4809-b696-8b450323cd4f","issue_type":"Missing Column","issue_message":"Required column MEAS_VALUE is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"6aff6844-8fa9-4df4-bc8d-44a219fa3aca","issue_type":"Missing Column","issue_message":"Required column QUESTION_CODE is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"f83f927c-1bc3-4945-91c1-cf1093672932","issue_type":"Missing Column","issue_message":"Required column QUESTION_CODE_SYSTEM_NAME is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"ef87acfe-68c3-429b-8899-2dd51e520782","issue_type":"Missing Column","issue_message":"Required column ANSWER_CODE is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"23321b2a-c50f-4d54-854e-fd5d052cf775","issue_type":"Missing Column","issue_message":"Required column ANSWER_CODE_SYSTEM_NAME is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"5ababacc-22c3-4324-8191-32e38155389c","issue_type":"Missing Column","issue_message":"Required column SDOH_DOMAIN is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"fef18579-457a-4cc8-9545-4368a58aa2f7","issue_type":"Missing Column","issue_message":"Required column NEED_INDICATED is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"3bde8af0-cd21-4b71-8ed5-e5c0e239ba46","issue_type":"Missing Column","issue_message":"Required column VISIT_PART_2_FLAG is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"cdf71f13-ef66-48d8-88c3-be8ed69b67fe","issue_type":"Missing Column","issue_message":"Required column VISIT_OMH_FLAG is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"5e9c72ef-9215-4fb8-8bf3-7e89d7723db6","issue_type":"Missing Column","issue_message":"Required column VISIT_OPWDD_FLAG is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"abf5c680-a135-5d89-b871-fa5b9b99aed6","orch_session_issue_id":"641dff51-97fd-56b3-8443-c1ed568a6d66","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet 'Admin_Demographic' not found in 'synthetic-fail-excel-01.xlsx' (available: Sheet1)","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx"},
{"session_entry_id":"d70a4700-6b40-52fc-a7a2-69ef0d7f69ff","orch_session_issue_id":"47277588-99e8-59f5-8384-b24344a86073","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet 'Screening' not found in 'synthetic-fail-excel-01.xlsx' (available: Sheet1)","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx"},
{"session_entry_id":"58b22e99-5854-53bf-adbe-08e67df99b85","orch_session_issue_id":"a26ce332-3ced-5623-861d-23a2ef78e4a9","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet 'QE_Admin_Data' not found in 'synthetic-fail-excel-01.xlsx' (available: Sheet1)","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx"},
{"session_entry_id":"bc0c03b5-d1ba-5301-850f-5e4c42c1bf09","orch_session_issue_id":"ae477ba1-c7f1-5f34-847a-50bddb7130aa","issue_type":"TODO","issue_message":"Excel workbook 'ahc-hrsn-valid-01.xlsx' sheet 'Admin_Demographic' has not been implemented yet.","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx"},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","orch_session_issue_id":"41012e63-00c6-4517-a855-8a5f49bfaaca","issue_type":"Missing Column","issue_message":"Required column FACILITY is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","orch_session_issue_id":"ef79d627-c51c-4286-bdd5-824d29a0fe60","issue_type":"Missing Column","issue_message":"Required column FIRST_NAME is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","orch_session_issue_id":"6adcc105-6856-42dc-9bd0-c58399db18ac","issue_type":"Missing Column","issue_message":"Required column LAST_NAME is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","orch_session_issue_id":"3a02e275-c59f-4336-a1a5-eb53a5e17bac","issue_type":"Missing Column","issue_message":"Required column PAT_BIRTH_DATE is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","orch_session_issue_id":"6ef5cda9-8ba5-47ac-bc46-a45b3b79e73c","issue_type":"Missing Column","issue_message":"Required column MEDICAID_CIN is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","orch_session_issue_id":"65a20fd7-d9f1-46fc-85e9-11948c17376a","issue_type":"Missing Column","issue_message":"Required column ENCOUNTER_ID is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","orch_session_issue_id":"cadff939-0510-4454-80dd-a3a3bad3bac2","issue_type":"Missing Column","issue_message":"Required column SURVEY is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","orch_session_issue_id":"7a249006-c736-4bf7-8069-c33577b577ac","issue_type":"Missing Column","issue_message":"Required column SURVEY_ID is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","orch_session_issue_id":"f5702bc4-e786-43d9-9709-5ca8ed9443a2","issue_type":"Missing Column","issue_message":"Required column NEED_INDICATED is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","orch_session_issue_id":"fa2c1c05-b864-4bbe-8d8e-0721091f66f5","issue_type":"Missing Column","issue_message":"Required column VISIT_PART_2_FLAG is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","orch_session_issue_id":"b6cd623c-869c-48a6-9548-fedf900c7b3d","issue_type":"Missing Column","issue_message":"Required column VISIT_OMH_FLAG is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","orch_session_issue_id":"ec1daff2-2c0d-4dba-a92e-14fe7ec05cea","issue_type":"Missing Column","issue_message":"Required column VISIT_OPWDD_FLAG is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"7ef8bdeb-fd56-5eb9-a09b-ef15ce18dc49","issue_type":"TODO","issue_message":"Excel workbook 'ahc-hrsn-valid-01.xlsx' sheet 'QE_Admin_Data' has not been implemented yet.","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx"}]

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
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '7b979b68-7227-53fd-b689-e4fe153afb76',
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
        INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('8f460419-7b80-516d-8919-84520950f612', '05e8feaa-0bed-5909-a817-39812494b361', NULL, 'NONE', 'ENTER(prepareInit)', NULL, 'rsEE.beforeCell', (make_timestamp(2024, 1, 0, 15, 42, 30.179)), NULL);
        INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('7bab389e-54af-5a13-a39f-079abdc73a48', '05e8feaa-0bed-5909-a817-39812494b361', NULL, 'EXIT(prepareInit)', 'ENTER(init)', NULL, 'rsEE.afterCell', (make_timestamp(2024, 1, 0, 15, 42, 30.179)), NULL);
        INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('1931dfcc-e8fc-597d-b1bc-65b4287e6fdf', '05e8feaa-0bed-5909-a817-39812494b361', NULL, 'EXIT(init)', 'ENTER(ingest)', NULL, 'rsEE.afterCell', (make_timestamp(2024, 1, 0, 15, 42, 30.179)), NULL);
        INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('3b4eb0e5-6239-537a-8e67-e50e172e72a2', '05e8feaa-0bed-5909-a817-39812494b361', NULL, 'EXIT(ingest)', 'ENTER(ensureContent)', NULL, 'rsEE.afterCell', (make_timestamp(2024, 1, 0, 15, 42, 30.179)), NULL);
        INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('86b4a49e-7378-5159-9f41-b005208c31bc', '05e8feaa-0bed-5909-a817-39812494b361', NULL, 'EXIT(ensureContent)', 'ENTER(emitResources)', NULL, 'rsEE.afterCell', (make_timestamp(2024, 1, 0, 15, 42, 30.179)), NULL);

        -- emit all the SQLPage content
        CREATE TABLE IF NOT EXISTS "sqlpage_files" (
    "path" TEXT PRIMARY KEY NOT NULL,
    "contents" TEXT NOT NULL,
    "last_modified" DATE
);

INSERT INTO "sqlpage_files" ("path", "contents", "last_modified") VALUES ('sqlpage/templates/session_entries.handlebars', '<h1>{{title}}</h1>
  
<ul>
{{#each_row}}
    <li><a href="?session_entry_id={{orch_session_entry_id}}">{{ingest_src}}</a> ({{ingest_table_name}})</li>
{{/each_row}}
</ul>', (CURRENT_TIMESTAMP));

INSERT INTO "sqlpage_files" ("path", "contents", "last_modified") VALUES ('index.sql', 'SELECT ''shell'' as component, ''QCS Orchestration Engine'' as title, ''book'' as icon, ''/'' as link, ''sessions'' as menu_item, ''schema'' as menu_item;
    ;
SELECT ''list'' as component;
SELECT ''Screenings'' as title,''screenings.sql'' as link;
SELECT ''Jon Doe Screening'' as title,''jondoe.sql'' as link;
SELECT ''Orchestration Sessions'' as title,''sessions.sql'' as link;
SELECT ''Orchestration Issues'' as title,''issues.sql'' as link;
SELECT ''Orchestration State Schema'' as title,''schema.sql'' as link;', (CURRENT_TIMESTAMP)) ON CONFLICT(path) DO UPDATE SET contents = EXCLUDED.contents /* TODO: does not work in DuckDB , last_modified = (CURRENT_TIMESTAMP) */;

INSERT INTO "sqlpage_files" ("path", "contents", "last_modified") VALUES ('sessions.sql', 'SELECT ''shell'' as component, ''QCS Orchestration Engine'' as title, ''book'' as icon, ''/'' as link, ''sessions'' as menu_item, ''schema'' as menu_item;
    ;

SELECT ''table'' as component;
SELECT * FROM device;

SELECT ''table'' as component;
SELECT * FROM orch_session;

SELECT ''table'' as component, ''true'' as search, ''ingest_src'' as markdown;
SELECT ''['' || ingest_src || ''](issues.sql?session_entry_id=''|| orch_session_entry_id ||'')'' as ingest_src, ingest_table_name FROM "orch_session_entry";
    ', (CURRENT_TIMESTAMP)) ON CONFLICT(path) DO UPDATE SET contents = EXCLUDED.contents /* TODO: does not work in DuckDB , last_modified = (CURRENT_TIMESTAMP) */;

INSERT INTO "sqlpage_files" ("path", "contents", "last_modified") VALUES ('issues.sql', 'SELECT ''shell'' as component, ''QCS Orchestration Engine'' as title, ''book'' as icon, ''/'' as link, ''sessions'' as menu_item, ''schema'' as menu_item;
    ;

SELECT ''session_entries'' as component, ''Choose Session Entry'' as title;
SELECT orch_session_entry_id, ingest_src, ingest_table_name 
  FROM orch_session_entry;

SELECT ''table'' as component, ''true'' as search;

            SELECT issue_type, issue_message, invalid_value, remediation
              FROM orch_session_issue
             WHERE session_entry_id = $session_entry_id;
', (CURRENT_TIMESTAMP)) ON CONFLICT(path) DO UPDATE SET contents = EXCLUDED.contents /* TODO: does not work in DuckDB , last_modified = (CURRENT_TIMESTAMP) */;

INSERT INTO "sqlpage_files" ("path", "contents", "last_modified") VALUES ('screenings.sql', 'SELECT ''shell'' as component, ''QCS Orchestration Engine'' as title, ''book'' as icon, ''/'' as link, ''sessions'' as menu_item, ''schema'' as menu_item;
    ;  
SELECT ''table'' as component, ''true'' as search, ''true'' as sort;

            SELECT * 
              FROM "ahc_hrsn_12_12_2023_valid";
    ', (CURRENT_TIMESTAMP)) ON CONFLICT(path) DO UPDATE SET contents = EXCLUDED.contents /* TODO: does not work in DuckDB , last_modified = (CURRENT_TIMESTAMP) */;

INSERT INTO "sqlpage_files" ("path", "contents", "last_modified") VALUES ('jondoe.sql', 'SELECT ''shell'' as component, ''QCS Orchestration Engine'' as title, ''book'' as icon, ''/'' as link, ''sessions'' as menu_item, ''schema'' as menu_item;
    ;
SELECT ''text'' as component, ''Jon Doe (11223344)'' as title, ''Test'' as contentsmd;
SELECT ''table'' as component, ''true'' as search, ''true'' as sort;

            SELECT pat_mrn_id, question, meas_value 
              FROM "ahc_hrsn_12_12_2023_valid"
             WHERE pat_mrn_id = ''11223344'';
SELECT ''table'' as component, ''true'' as search;

            SELECT *
              FROM "ahc_hrsn_12_12_2023_valid_fhir";
    ', (CURRENT_TIMESTAMP)) ON CONFLICT(path) DO UPDATE SET contents = EXCLUDED.contents /* TODO: does not work in DuckDB , last_modified = (CURRENT_TIMESTAMP) */;

INSERT INTO "sqlpage_files" ("path", "contents", "last_modified") VALUES ('schema.sql', 'SELECT ''shell'' as component, ''QCS Orchestration Engine'' as title, ''book'' as icon, ''/'' as link, ''sessions'' as menu_item, ''schema'' as menu_item;
    ;
-- TODO: https://github.com/lovasoa/SQLpage/discussions/109#discussioncomment-7359513
--       see the above for how to fix for SQLPage but figure out to use the same SQL
--       in and out of SQLPage (maybe do what Ophir said in discussion and create
--       custom output for SQLPage using components?)
WITH TableInfo AS (
  SELECT
    m.tbl_name AS table_name,
    CASE WHEN c.pk THEN ''*'' ELSE '''' END AS is_primary_key,
    c.name AS column_name,
    c."type" AS column_type,
    CASE WHEN c."notnull" THEN ''*'' ELSE '''' END AS not_null,
    COALESCE(c.dflt_value, '''') AS default_value,
    COALESCE((SELECT pfkl."table" || ''.'' || pfkl."to" FROM pragma_foreign_key_list(m.tbl_name) AS pfkl WHERE pfkl."from" = c.name), '''') as fk_refs,
    ROW_NUMBER() OVER (PARTITION BY m.tbl_name ORDER BY c.cid) AS row_num
  FROM sqlite_master m JOIN pragma_table_info(m.tbl_name) c ON 1=1
  WHERE m.type = ''table''
  ORDER BY table_name, row_num
),
Views AS (
  SELECT ''## Views '' AS markdown_output
  UNION ALL
  SELECT ''| View | Column | Type |'' AS markdown_output
  UNION ALL
  SELECT ''| ---- | ------ |----- |'' AS markdown_output
  UNION ALL
  SELECT ''| '' || tbl_name || '' | '' || c.name || '' | '' || c."type" || '' | ''
  FROM
    sqlite_master m,
    pragma_table_info(m.tbl_name) c
  WHERE
    m.type = ''view''
),
Indexes AS (
  SELECT ''## Indexes'' AS markdown_output
  UNION ALL
  SELECT ''| Table | Index | Columns |'' AS markdown_output
  UNION ALL
  SELECT ''| ----- | ----- | ------- |'' AS markdown_output
  UNION ALL
  SELECT ''| '' ||  m.name || '' | '' || il.name || '' | '' || group_concat(ii.name, '', '') || '' |'' AS markdown_output
  FROM sqlite_master as m,
    pragma_index_list(m.name) AS il,
    pragma_index_info(il.name) AS ii
  WHERE
    m.type = ''table''
  GROUP BY
    m.name,
    il.name
)
SELECT
    ''text'' as component,
    ''Information Schema'' as title,
    group_concat(markdown_output, ''
'') AS contents_md
FROM
  (
    SELECT ''## Tables'' AS markdown_output
    UNION ALL
    SELECT
      CASE WHEN ti.row_num = 1 THEN ''
### `'' || ti.table_name || ''` Table
| PK | Column | Type | Req? | Default | References |
| -- | ------ | ---- | ---- | ------- | ---------- |
'' ||
        ''| '' || is_primary_key || '' | '' || ti.column_name || '' | '' || ti.column_type || '' | '' || ti.not_null || '' | '' || ti.default_value || '' | '' || ti.fk_refs || '' |''
      ELSE
        ''| '' || is_primary_key || '' | '' || ti.column_name || '' | '' || ti.column_type || '' | '' || ti.not_null || '' | '' || ti.default_value || '' | '' || ti.fk_refs || '' |''
      END
    FROM TableInfo ti
    UNION ALL SELECT ''''
    UNION ALL SELECT * FROM	Views
    UNION ALL SELECT ''''
    UNION ALL SELECT * FROM Indexes
);
    ', (CURRENT_TIMESTAMP)) ON CONFLICT(path) DO UPDATE SET contents = EXCLUDED.contents /* TODO: does not work in DuckDB , last_modified = (CURRENT_TIMESTAMP) */;
        
        -- emit all the execution diagnostics
        INSERT INTO "orch_session_exec" ("orch_session_exec_id", "exec_nature", "session_id", "session_entry_id", "parent_exec_id", "namespace", "exec_identity", "exec_code", "exec_status", "input_text", "exec_error_text", "output_text", "output_nature", "narrative_md", "elaboration") VALUES ('168a34c7-d043-5ec4-a84a-c961f1a301ef', 'duckdb', '05e8feaa-0bed-5909-a817-39812494b361', NULL, NULL, NULL, 'init', 'duckdb support/assurance/ahc-hrsn-elt/screening/results-test-e2e/ingestion-center.duckdb', 0, '
-- no before-init SQL found
CREATE TABLE IF NOT EXISTS "device" (
    "device_id" TEXT PRIMARY KEY NOT NULL,
    "name" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "boundary" TEXT NOT NULL,
    "segmentation" TEXT,
    "state_sysinfo" TEXT,
    "elaboration" TEXT,
    UNIQUE("name", "state", "boundary")
);
CREATE TABLE IF NOT EXISTS "orch_session" (
    "orch_session_id" TEXT PRIMARY KEY NOT NULL,
    "device_id" TEXT NOT NULL,
    "orch_started_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "orch_finished_at" TIMESTAMPTZ,
    "elaboration" TEXT,
    FOREIGN KEY("device_id") REFERENCES "device"("device_id")
);
CREATE TABLE IF NOT EXISTS "orch_session_entry" (
    "orch_session_entry_id" TEXT PRIMARY KEY NOT NULL,
    "session_id" TEXT NOT NULL,
    "ingest_src" TEXT NOT NULL,
    "ingest_table_name" TEXT,
    "elaboration" TEXT,
    FOREIGN KEY("session_id") REFERENCES "orch_session"("orch_session_id")
);
CREATE TABLE IF NOT EXISTS "orch_session_state" (
    "orch_session_state_id" TEXT PRIMARY KEY NOT NULL,
    "session_id" TEXT NOT NULL,
    "session_entry_id" TEXT,
    "from_state" TEXT NOT NULL,
    "to_state" TEXT NOT NULL,
    "transition_result" TEXT,
    "transition_reason" TEXT,
    "transitioned_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "elaboration" TEXT,
    FOREIGN KEY("session_id") REFERENCES "orch_session"("orch_session_id"),
    FOREIGN KEY("session_entry_id") REFERENCES "orch_session_entry"("orch_session_entry_id"),
    UNIQUE("orch_session_state_id", "from_state", "to_state")
);
CREATE TABLE IF NOT EXISTS "orch_session_exec" (
    "orch_session_exec_id" TEXT PRIMARY KEY NOT NULL,
    "exec_nature" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "session_entry_id" TEXT,
    "parent_exec_id" TEXT,
    "namespace" TEXT,
    "exec_identity" TEXT,
    "exec_code" TEXT NOT NULL,
    "exec_status" INTEGER NOT NULL,
    "input_text" TEXT,
    "exec_error_text" TEXT,
    "output_text" TEXT,
    "output_nature" TEXT,
    "narrative_md" TEXT,
    "elaboration" TEXT,
    FOREIGN KEY("session_id") REFERENCES "orch_session"("orch_session_id"),
    FOREIGN KEY("session_entry_id") REFERENCES "orch_session_entry"("orch_session_entry_id"),
    FOREIGN KEY("parent_exec_id") REFERENCES "orch_session_exec"("orch_session_exec_id")
);
CREATE TABLE IF NOT EXISTS "orch_session_issue" (
    "orch_session_issue_id" TEXT PRIMARY KEY NOT NULL,
    "session_id" TEXT NOT NULL,
    "session_entry_id" TEXT,
    "issue_type" TEXT NOT NULL,
    "issue_message" TEXT NOT NULL,
    "issue_row" INTEGER,
    "issue_column" TEXT,
    "invalid_value" TEXT,
    "remediation" TEXT,
    "elaboration" TEXT,
    FOREIGN KEY("session_id") REFERENCES "orch_session"("orch_session_id"),
    FOREIGN KEY("session_entry_id") REFERENCES "orch_session_entry"("orch_session_entry_id")
);
CREATE INDEX IF NOT EXISTS "idx_device__name__state" ON "device"("name", "state");

DROP VIEW IF EXISTS "orch_session_diagnostic_text";
CREATE VIEW IF NOT EXISTS "orch_session_diagnostic_text" AS
    SELECT
        -- Including all other columns from ''orch_session''
        ises.* EXCLUDE (orch_started_at, orch_finished_at),
        -- TODO: Casting known timestamp columns to text so emit to Excel works with GDAL (spatial)
           -- strftime(timestamptz orch_started_at, ''%Y-%m-%d %H:%M:%S'') AS orch_started_at,
           -- strftime(timestamptz orch_finished_at, ''%Y-%m-%d %H:%M:%S'') AS orch_finished_at,
    
        -- Including all columns from ''orch_session_entry''
        isee.* EXCLUDE (session_id),
    
        -- Including all other columns from ''orch_session_issue''
        isi.* EXCLUDE (session_id, session_entry_id)
    FROM orch_session AS ises
    JOIN orch_session_entry AS isee ON ises.orch_session_id = isee.session_id
    LEFT JOIN orch_session_issue AS isi ON isee.orch_session_entry_id = isi.session_entry_id;

-- register the current device and session and use the identifiers for all logging
INSERT INTO "device" ("device_id", "name", "state", "boundary", "segmentation", "state_sysinfo", "elaboration") VALUES (''05269d28-15ae-5bd6-bd88-f949ccfa52d7'', ''Defiant'', ''SINGLETON'', ''UNKNOWN'', NULL, ''{"os-arch":"x64","os-platform":"linux"}'', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "orch_session" ("orch_session_id", "device_id", "orch_started_at", "orch_finished_at", "elaboration") VALUES (''05e8feaa-0bed-5909-a817-39812494b361'', ''05269d28-15ae-5bd6-bd88-f949ccfa52d7'', NULL, NULL, NULL);

-- no after-init SQL found', NULL, NULL, NULL, '```sql

-- no before-init SQL found
CREATE TABLE IF NOT EXISTS "device" (
    "device_id" TEXT PRIMARY KEY NOT NULL,
    "name" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "boundary" TEXT NOT NULL,
    "segmentation" TEXT,
    "state_sysinfo" TEXT,
    "elaboration" TEXT,
    UNIQUE("name", "state", "boundary")
);
CREATE TABLE IF NOT EXISTS "orch_session" (
    "orch_session_id" TEXT PRIMARY KEY NOT NULL,
    "device_id" TEXT NOT NULL,
    "orch_started_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "orch_finished_at" TIMESTAMPTZ,
    "elaboration" TEXT,
    FOREIGN KEY("device_id") REFERENCES "device"("device_id")
);
CREATE TABLE IF NOT EXISTS "orch_session_entry" (
    "orch_session_entry_id" TEXT PRIMARY KEY NOT NULL,
    "session_id" TEXT NOT NULL,
    "ingest_src" TEXT NOT NULL,
    "ingest_table_name" TEXT,
    "elaboration" TEXT,
    FOREIGN KEY("session_id") REFERENCES "orch_session"("orch_session_id")
);
CREATE TABLE IF NOT EXISTS "orch_session_state" (
    "orch_session_state_id" TEXT PRIMARY KEY NOT NULL,
    "session_id" TEXT NOT NULL,
    "session_entry_id" TEXT,
    "from_state" TEXT NOT NULL,
    "to_state" TEXT NOT NULL,
    "transition_result" TEXT,
    "transition_reason" TEXT,
    "transitioned_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "elaboration" TEXT,
    FOREIGN KEY("session_id") REFERENCES "orch_session"("orch_session_id"),
    FOREIGN KEY("session_entry_id") REFERENCES "orch_session_entry"("orch_session_entry_id"),
    UNIQUE("orch_session_state_id", "from_state", "to_state")
);
CREATE TABLE IF NOT EXISTS "orch_session_exec" (
    "orch_session_exec_id" TEXT PRIMARY KEY NOT NULL,
    "exec_nature" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "session_entry_id" TEXT,
    "parent_exec_id" TEXT,
    "namespace" TEXT,
    "exec_identity" TEXT,
    "exec_code" TEXT NOT NULL,
    "exec_status" INTEGER NOT NULL,
    "input_text" TEXT,
    "exec_error_text" TEXT,
    "output_text" TEXT,
    "output_nature" TEXT,
    "narrative_md" TEXT,
    "elaboration" TEXT,
    FOREIGN KEY("session_id") REFERENCES "orch_session"("orch_session_id"),
    FOREIGN KEY("session_entry_id") REFERENCES "orch_session_entry"("orch_session_entry_id"),
    FOREIGN KEY("parent_exec_id") REFERENCES "orch_session_exec"("orch_session_exec_id")
);
CREATE TABLE IF NOT EXISTS "orch_session_issue" (
    "orch_session_issue_id" TEXT PRIMARY KEY NOT NULL,
    "session_id" TEXT NOT NULL,
    "session_entry_id" TEXT,
    "issue_type" TEXT NOT NULL,
    "issue_message" TEXT NOT NULL,
    "issue_row" INTEGER,
    "issue_column" TEXT,
    "invalid_value" TEXT,
    "remediation" TEXT,
    "elaboration" TEXT,
    FOREIGN KEY("session_id") REFERENCES "orch_session"("orch_session_id"),
    FOREIGN KEY("session_entry_id") REFERENCES "orch_session_entry"("orch_session_entry_id")
);
CREATE INDEX IF NOT EXISTS "idx_device__name__state" ON "device"("name", "state");

DROP VIEW IF EXISTS "orch_session_diagnostic_text";
CREATE VIEW IF NOT EXISTS "orch_session_diagnostic_text" AS
    SELECT
        -- Including all other columns from ''orch_session''
        ises.* EXCLUDE (orch_started_at, orch_finished_at),
        -- TODO: Casting known timestamp columns to text so emit to Excel works with GDAL (spatial)
           -- strftime(timestamptz orch_started_at, ''%Y-%m-%d %H:%M:%S'') AS orch_started_at,
           -- strftime(timestamptz orch_finished_at, ''%Y-%m-%d %H:%M:%S'') AS orch_finished_at,
    
        -- Including all columns from ''orch_session_entry''
        isee.* EXCLUDE (session_id),
    
        -- Including all other columns from ''orch_session_issue''
        isi.* EXCLUDE (session_id, session_entry_id)
    FROM orch_session AS ises
    JOIN orch_session_entry AS isee ON ises.orch_session_id = isee.session_id
    LEFT JOIN orch_session_issue AS isi ON isee.orch_session_entry_id = isi.session_entry_id;

-- register the current device and session and use the identifiers for all logging
INSERT INTO "device" ("device_id", "name", "state", "boundary", "segmentation", "state_sysinfo", "elaboration") VALUES (''05269d28-15ae-5bd6-bd88-f949ccfa52d7'', ''Defiant'', ''SINGLETON'', ''UNKNOWN'', NULL, ''{"os-arch":"x64","os-platform":"linux"}'', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "orch_session" ("orch_session_id", "device_id", "orch_started_at", "orch_finished_at", "elaboration") VALUES (''05e8feaa-0bed-5909-a817-39812494b361'', ''05269d28-15ae-5bd6-bd88-f949ccfa52d7'', NULL, NULL, NULL);

-- no after-init SQL found
```
', NULL);
        INSERT INTO "orch_session_exec" ("orch_session_exec_id", "exec_nature", "session_id", "session_entry_id", "parent_exec_id", "namespace", "exec_identity", "exec_code", "exec_status", "input_text", "exec_error_text", "output_text", "output_nature", "narrative_md", "elaboration") VALUES ('591191c7-f693-5957-8734-ac87151ca981', 'duckdb', '05e8feaa-0bed-5909-a817-39812494b361', NULL, NULL, NULL, 'ingest', 'duckdb support/assurance/ahc-hrsn-elt/screening/results-test-e2e/ingestion-center.duckdb --json', 0, '-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail.csv (synthetic_fail)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES (''8b7c669c-1795-5f6b-8f3a-3e502b74c628'', ''05e8feaa-0bed-5909-a817-39812494b361'', ''support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail.csv'', ''synthetic_fail'', NULL);

-- be sure to add src_file_row_number and session_id columns to each row
-- because assurance CTEs require them
CREATE TABLE synthetic_fail AS
  SELECT *, row_number() OVER () as src_file_row_number, ''05e8feaa-0bed-5909-a817-39812494b361'' as session_id, ''8b7c669c-1795-5f6b-8f3a-3e502b74c628'' as session_entry_id
    FROM read_csv_auto(''support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail.csv'');

WITH required_column_names_in_src AS (
    SELECT column_name
      FROM (VALUES (''PAT_MRN_ID''), (''FACILITY''), (''FIRST_NAME''), (''LAST_NAME''), (''PAT_BIRTH_DATE''), (''MEDICAID_CIN''), (''ENCOUNTER_ID''), (''SURVEY''), (''SURVEY_ID''), (''RECORDED_TIME''), (''QUESTION''), (''MEAS_VALUE''), (''QUESTION_CODE''), (''QUESTION_CODE_SYSTEM_NAME''), (''ANSWER_CODE''), (''ANSWER_CODE_SYSTEM_NAME''), (''SDOH_DOMAIN''), (''NEED_INDICATED''), (''VISIT_PART_2_FLAG''), (''VISIT_OMH_FLAG''), (''VISIT_OPWDD_FLAG'')) AS required(column_name)
     WHERE required.column_name NOT IN (
         SELECT upper(trim(column_name))
           FROM information_schema.columns
          WHERE table_name = ''synthetic_fail'')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_message, remediation)
    SELECT uuid(),
           ''05e8feaa-0bed-5909-a817-39812494b361'',
           ''8b7c669c-1795-5f6b-8f3a-3e502b74c628'',
           ''Missing Column'',
           ''Required column '' || column_name || '' is missing in synthetic_fail.'',
           ''Ensure synthetic_fail contains the column "'' || column_name || ''"''
      FROM required_column_names_in_src;
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-12-12-2023-valid.csv (ahc_hrsn_12_12_2023_valid)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES (''7b979b68-7227-53fd-b689-e4fe153afb76'', ''05e8feaa-0bed-5909-a817-39812494b361'', ''support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-12-12-2023-valid.csv'', ''ahc_hrsn_12_12_2023_valid'', NULL);

-- be sure to add src_file_row_number and session_id columns to each row
-- because assurance CTEs require them
CREATE TABLE ahc_hrsn_12_12_2023_valid AS
  SELECT *, row_number() OVER () as src_file_row_number, ''05e8feaa-0bed-5909-a817-39812494b361'' as session_id, ''7b979b68-7227-53fd-b689-e4fe153afb76'' as session_entry_id
    FROM read_csv_auto(''support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-12-12-2023-valid.csv'');

WITH required_column_names_in_src AS (
    SELECT column_name
      FROM (VALUES (''PAT_MRN_ID''), (''FACILITY''), (''FIRST_NAME''), (''LAST_NAME''), (''PAT_BIRTH_DATE''), (''MEDICAID_CIN''), (''ENCOUNTER_ID''), (''SURVEY''), (''SURVEY_ID''), (''RECORDED_TIME''), (''QUESTION''), (''MEAS_VALUE''), (''QUESTION_CODE''), (''QUESTION_CODE_SYSTEM_NAME''), (''ANSWER_CODE''), (''ANSWER_CODE_SYSTEM_NAME''), (''SDOH_DOMAIN''), (''NEED_INDICATED''), (''VISIT_PART_2_FLAG''), (''VISIT_OMH_FLAG''), (''VISIT_OPWDD_FLAG'')) AS required(column_name)
     WHERE required.column_name NOT IN (
         SELECT upper(trim(column_name))
           FROM information_schema.columns
          WHERE table_name = ''ahc_hrsn_12_12_2023_valid'')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_message, remediation)
    SELECT uuid(),
           ''05e8feaa-0bed-5909-a817-39812494b361'',
           ''7b979b68-7227-53fd-b689-e4fe153afb76'',
           ''Missing Column'',
           ''Required column '' || column_name || '' is missing in ahc_hrsn_12_12_2023_valid.'',
           ''Ensure ahc_hrsn_12_12_2023_valid contains the column "'' || column_name || ''"''
      FROM required_column_names_in_src;
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx (ERROR)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES (''abf5c680-a135-5d89-b871-fa5b9b99aed6'', ''05e8feaa-0bed-5909-a817-39812494b361'', ''support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx'', ''ERROR'', NULL);
INSERT INTO "orch_session_issue" ("orch_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES (''641dff51-97fd-56b3-8443-c1ed568a6d66'', ''05e8feaa-0bed-5909-a817-39812494b361'', ''abf5c680-a135-5d89-b871-fa5b9b99aed6'', ''Sheet Missing'', ''Excel workbook sheet ''''Admin_Demographic'''' not found in ''''synthetic-fail-excel-01.xlsx'''' (available: Sheet1)'', NULL, NULL, ''support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx'', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx (ERROR)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES (''d70a4700-6b40-52fc-a7a2-69ef0d7f69ff'', ''05e8feaa-0bed-5909-a817-39812494b361'', ''support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx'', ''ERROR'', NULL);
INSERT INTO "orch_session_issue" ("orch_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES (''47277588-99e8-59f5-8384-b24344a86073'', ''05e8feaa-0bed-5909-a817-39812494b361'', ''d70a4700-6b40-52fc-a7a2-69ef0d7f69ff'', ''Sheet Missing'', ''Excel workbook sheet ''''Screening'''' not found in ''''synthetic-fail-excel-01.xlsx'''' (available: Sheet1)'', NULL, NULL, ''support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx'', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx (ERROR)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES (''58b22e99-5854-53bf-adbe-08e67df99b85'', ''05e8feaa-0bed-5909-a817-39812494b361'', ''support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx'', ''ERROR'', NULL);
INSERT INTO "orch_session_issue" ("orch_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES (''a26ce332-3ced-5623-861d-23a2ef78e4a9'', ''05e8feaa-0bed-5909-a817-39812494b361'', ''58b22e99-5854-53bf-adbe-08e67df99b85'', ''Sheet Missing'', ''Excel workbook sheet ''''QE_Admin_Data'''' not found in ''''synthetic-fail-excel-01.xlsx'''' (available: Sheet1)'', NULL, NULL, ''support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx'', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx (ahc_hrsn_valid_01_admin_demographic)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES (''bc0c03b5-d1ba-5301-850f-5e4c42c1bf09'', ''05e8feaa-0bed-5909-a817-39812494b361'', ''support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx'', ''ahc_hrsn_valid_01_admin_demographic'', NULL);
        
INSERT INTO "orch_session_issue" ("orch_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES (''ae477ba1-c7f1-5f34-847a-50bddb7130aa'', ''05e8feaa-0bed-5909-a817-39812494b361'', ''bc0c03b5-d1ba-5301-850f-5e4c42c1bf09'', ''TODO'', ''Excel workbook ''''ahc-hrsn-valid-01.xlsx'''' sheet ''''Admin_Demographic'''' has not been implemented yet.'', NULL, NULL, ''support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx'', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx (ahc_hrsn_valid_01_screening)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES (''8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839'', ''05e8feaa-0bed-5909-a817-39812494b361'', ''support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx'', ''ahc_hrsn_valid_01_screening'', NULL);
     
-- ingest Excel workbook sheet ''Screening'' into ahc_hrsn_valid_01_screening using spatial plugin
INSTALL spatial; LOAD spatial;

-- be sure to add src_file_row_number and session_id columns to each row
-- because assurance CTEs require them
CREATE TABLE ahc_hrsn_valid_01_screening AS
  SELECT *, row_number() OVER () as src_file_row_number, ''05e8feaa-0bed-5909-a817-39812494b361'' as session_id, ''8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839'' as session_entry_id
    FROM st_read(''support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx'', layer=''Screening'', open_options=[''HEADERS=FORCE'', ''FIELD_TYPES=AUTO'']);          

WITH required_column_names_in_src AS (
    SELECT column_name
      FROM (VALUES (''PAT_MRN_ID''), (''FACILITY''), (''FIRST_NAME''), (''LAST_NAME''), (''PAT_BIRTH_DATE''), (''MEDICAID_CIN''), (''ENCOUNTER_ID''), (''SURVEY''), (''SURVEY_ID''), (''RECORDED_TIME''), (''QUESTION''), (''MEAS_VALUE''), (''QUESTION_CODE''), (''QUESTION_CODE_SYSTEM_NAME''), (''ANSWER_CODE''), (''ANSWER_CODE_SYSTEM_NAME''), (''SDOH_DOMAIN''), (''NEED_INDICATED''), (''VISIT_PART_2_FLAG''), (''VISIT_OMH_FLAG''), (''VISIT_OPWDD_FLAG'')) AS required(column_name)
     WHERE required.column_name NOT IN (
         SELECT upper(trim(column_name))
           FROM information_schema.columns
          WHERE table_name = ''ahc_hrsn_valid_01_screening'')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_message, remediation)
    SELECT uuid(),
           ''05e8feaa-0bed-5909-a817-39812494b361'',
           ''8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839'',
           ''Missing Column'',
           ''Required column '' || column_name || '' is missing in ahc_hrsn_valid_01_screening.'',
           ''Ensure ahc_hrsn_valid_01_screening contains the column "'' || column_name || ''"''
      FROM required_column_names_in_src;
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx (ahc_hrsn_valid_01_q_e_admin_data)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES (''b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0'', ''05e8feaa-0bed-5909-a817-39812494b361'', ''support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx'', ''ahc_hrsn_valid_01_q_e_admin_data'', NULL);
        
INSERT INTO "orch_session_issue" ("orch_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES (''7ef8bdeb-fd56-5eb9-a09b-ef15ce18dc49'', ''05e8feaa-0bed-5909-a817-39812494b361'', ''b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0'', ''TODO'', ''Excel workbook ''''ahc-hrsn-valid-01.xlsx'''' sheet ''''QE_Admin_Data'''' has not been implemented yet.'', NULL, NULL, ''support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx'', NULL, NULL);
SELECT session_entry_id, orch_session_issue_id, issue_type, issue_message, invalid_value FROM orch_session_issue WHERE session_id = ''05e8feaa-0bed-5909-a817-39812494b361''', NULL, '[{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"25355414-e403-4a71-9f97-6080aa7bf3a2","issue_type":"Missing Column","issue_message":"Required column PAT_MRN_ID is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"1b56ef89-bbe2-4316-9053-88092657c1f1","issue_type":"Missing Column","issue_message":"Required column FACILITY is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"e2319144-804e-4b6e-9e1c-b4f3879f087e","issue_type":"Missing Column","issue_message":"Required column FIRST_NAME is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"6854ff25-99aa-4cfd-8f56-bb8555cd2907","issue_type":"Missing Column","issue_message":"Required column LAST_NAME is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"8f598ae7-822d-4c83-982e-4ffbb6c659b0","issue_type":"Missing Column","issue_message":"Required column PAT_BIRTH_DATE is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"7e545c76-8575-4640-8f1d-19b211581e88","issue_type":"Missing Column","issue_message":"Required column MEDICAID_CIN is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"2ff4dd2b-6851-41f3-b12c-d851ee7a48d8","issue_type":"Missing Column","issue_message":"Required column ENCOUNTER_ID is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"81cde82d-dc27-4b05-bfb5-d8647e2567a5","issue_type":"Missing Column","issue_message":"Required column SURVEY is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"e4664262-9986-4c1a-888c-de73c88ec7df","issue_type":"Missing Column","issue_message":"Required column SURVEY_ID is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"c215c80d-a0fc-4cef-9b26-bd3395bb442e","issue_type":"Missing Column","issue_message":"Required column RECORDED_TIME is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"261d05e0-5f76-48a2-97a1-1ca728d5ab8a","issue_type":"Missing Column","issue_message":"Required column QUESTION is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"1a853360-4bee-4809-b696-8b450323cd4f","issue_type":"Missing Column","issue_message":"Required column MEAS_VALUE is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"6aff6844-8fa9-4df4-bc8d-44a219fa3aca","issue_type":"Missing Column","issue_message":"Required column QUESTION_CODE is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"f83f927c-1bc3-4945-91c1-cf1093672932","issue_type":"Missing Column","issue_message":"Required column QUESTION_CODE_SYSTEM_NAME is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"ef87acfe-68c3-429b-8899-2dd51e520782","issue_type":"Missing Column","issue_message":"Required column ANSWER_CODE is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"23321b2a-c50f-4d54-854e-fd5d052cf775","issue_type":"Missing Column","issue_message":"Required column ANSWER_CODE_SYSTEM_NAME is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"5ababacc-22c3-4324-8191-32e38155389c","issue_type":"Missing Column","issue_message":"Required column SDOH_DOMAIN is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"fef18579-457a-4cc8-9545-4368a58aa2f7","issue_type":"Missing Column","issue_message":"Required column NEED_INDICATED is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"3bde8af0-cd21-4b71-8ed5-e5c0e239ba46","issue_type":"Missing Column","issue_message":"Required column VISIT_PART_2_FLAG is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"cdf71f13-ef66-48d8-88c3-be8ed69b67fe","issue_type":"Missing Column","issue_message":"Required column VISIT_OMH_FLAG is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"5e9c72ef-9215-4fb8-8bf3-7e89d7723db6","issue_type":"Missing Column","issue_message":"Required column VISIT_OPWDD_FLAG is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"abf5c680-a135-5d89-b871-fa5b9b99aed6","orch_session_issue_id":"641dff51-97fd-56b3-8443-c1ed568a6d66","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet ''Admin_Demographic'' not found in ''synthetic-fail-excel-01.xlsx'' (available: Sheet1)","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx"},
{"session_entry_id":"d70a4700-6b40-52fc-a7a2-69ef0d7f69ff","orch_session_issue_id":"47277588-99e8-59f5-8384-b24344a86073","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet ''Screening'' not found in ''synthetic-fail-excel-01.xlsx'' (available: Sheet1)","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx"},
{"session_entry_id":"58b22e99-5854-53bf-adbe-08e67df99b85","orch_session_issue_id":"a26ce332-3ced-5623-861d-23a2ef78e4a9","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet ''QE_Admin_Data'' not found in ''synthetic-fail-excel-01.xlsx'' (available: Sheet1)","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx"},
{"session_entry_id":"bc0c03b5-d1ba-5301-850f-5e4c42c1bf09","orch_session_issue_id":"ae477ba1-c7f1-5f34-847a-50bddb7130aa","issue_type":"TODO","issue_message":"Excel workbook ''ahc-hrsn-valid-01.xlsx'' sheet ''Admin_Demographic'' has not been implemented yet.","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx"},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","orch_session_issue_id":"41012e63-00c6-4517-a855-8a5f49bfaaca","issue_type":"Missing Column","issue_message":"Required column FACILITY is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","orch_session_issue_id":"ef79d627-c51c-4286-bdd5-824d29a0fe60","issue_type":"Missing Column","issue_message":"Required column FIRST_NAME is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","orch_session_issue_id":"6adcc105-6856-42dc-9bd0-c58399db18ac","issue_type":"Missing Column","issue_message":"Required column LAST_NAME is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","orch_session_issue_id":"3a02e275-c59f-4336-a1a5-eb53a5e17bac","issue_type":"Missing Column","issue_message":"Required column PAT_BIRTH_DATE is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","orch_session_issue_id":"6ef5cda9-8ba5-47ac-bc46-a45b3b79e73c","issue_type":"Missing Column","issue_message":"Required column MEDICAID_CIN is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","orch_session_issue_id":"65a20fd7-d9f1-46fc-85e9-11948c17376a","issue_type":"Missing Column","issue_message":"Required column ENCOUNTER_ID is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","orch_session_issue_id":"cadff939-0510-4454-80dd-a3a3bad3bac2","issue_type":"Missing Column","issue_message":"Required column SURVEY is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","orch_session_issue_id":"7a249006-c736-4bf7-8069-c33577b577ac","issue_type":"Missing Column","issue_message":"Required column SURVEY_ID is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","orch_session_issue_id":"f5702bc4-e786-43d9-9709-5ca8ed9443a2","issue_type":"Missing Column","issue_message":"Required column NEED_INDICATED is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","orch_session_issue_id":"fa2c1c05-b864-4bbe-8d8e-0721091f66f5","issue_type":"Missing Column","issue_message":"Required column VISIT_PART_2_FLAG is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","orch_session_issue_id":"b6cd623c-869c-48a6-9548-fedf900c7b3d","issue_type":"Missing Column","issue_message":"Required column VISIT_OMH_FLAG is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","orch_session_issue_id":"ec1daff2-2c0d-4dba-a92e-14fe7ec05cea","issue_type":"Missing Column","issue_message":"Required column VISIT_OPWDD_FLAG is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"7ef8bdeb-fd56-5eb9-a09b-ef15ce18dc49","issue_type":"TODO","issue_message":"Excel workbook ''ahc-hrsn-valid-01.xlsx'' sheet ''QE_Admin_Data'' has not been implemented yet.","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx"}]
', 'JSON', '```sql
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail.csv (synthetic_fail)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES (''8b7c669c-1795-5f6b-8f3a-3e502b74c628'', ''05e8feaa-0bed-5909-a817-39812494b361'', ''support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail.csv'', ''synthetic_fail'', NULL);

-- be sure to add src_file_row_number and session_id columns to each row
-- because assurance CTEs require them
CREATE TABLE synthetic_fail AS
  SELECT *, row_number() OVER () as src_file_row_number, ''05e8feaa-0bed-5909-a817-39812494b361'' as session_id, ''8b7c669c-1795-5f6b-8f3a-3e502b74c628'' as session_entry_id
    FROM read_csv_auto(''support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail.csv'');

WITH required_column_names_in_src AS (
    SELECT column_name
      FROM (VALUES (''PAT_MRN_ID''), (''FACILITY''), (''FIRST_NAME''), (''LAST_NAME''), (''PAT_BIRTH_DATE''), (''MEDICAID_CIN''), (''ENCOUNTER_ID''), (''SURVEY''), (''SURVEY_ID''), (''RECORDED_TIME''), (''QUESTION''), (''MEAS_VALUE''), (''QUESTION_CODE''), (''QUESTION_CODE_SYSTEM_NAME''), (''ANSWER_CODE''), (''ANSWER_CODE_SYSTEM_NAME''), (''SDOH_DOMAIN''), (''NEED_INDICATED''), (''VISIT_PART_2_FLAG''), (''VISIT_OMH_FLAG''), (''VISIT_OPWDD_FLAG'')) AS required(column_name)
     WHERE required.column_name NOT IN (
         SELECT upper(trim(column_name))
           FROM information_schema.columns
          WHERE table_name = ''synthetic_fail'')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_message, remediation)
    SELECT uuid(),
           ''05e8feaa-0bed-5909-a817-39812494b361'',
           ''8b7c669c-1795-5f6b-8f3a-3e502b74c628'',
           ''Missing Column'',
           ''Required column '' || column_name || '' is missing in synthetic_fail.'',
           ''Ensure synthetic_fail contains the column "'' || column_name || ''"''
      FROM required_column_names_in_src;
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-12-12-2023-valid.csv (ahc_hrsn_12_12_2023_valid)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES (''7b979b68-7227-53fd-b689-e4fe153afb76'', ''05e8feaa-0bed-5909-a817-39812494b361'', ''support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-12-12-2023-valid.csv'', ''ahc_hrsn_12_12_2023_valid'', NULL);

-- be sure to add src_file_row_number and session_id columns to each row
-- because assurance CTEs require them
CREATE TABLE ahc_hrsn_12_12_2023_valid AS
  SELECT *, row_number() OVER () as src_file_row_number, ''05e8feaa-0bed-5909-a817-39812494b361'' as session_id, ''7b979b68-7227-53fd-b689-e4fe153afb76'' as session_entry_id
    FROM read_csv_auto(''support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-12-12-2023-valid.csv'');

WITH required_column_names_in_src AS (
    SELECT column_name
      FROM (VALUES (''PAT_MRN_ID''), (''FACILITY''), (''FIRST_NAME''), (''LAST_NAME''), (''PAT_BIRTH_DATE''), (''MEDICAID_CIN''), (''ENCOUNTER_ID''), (''SURVEY''), (''SURVEY_ID''), (''RECORDED_TIME''), (''QUESTION''), (''MEAS_VALUE''), (''QUESTION_CODE''), (''QUESTION_CODE_SYSTEM_NAME''), (''ANSWER_CODE''), (''ANSWER_CODE_SYSTEM_NAME''), (''SDOH_DOMAIN''), (''NEED_INDICATED''), (''VISIT_PART_2_FLAG''), (''VISIT_OMH_FLAG''), (''VISIT_OPWDD_FLAG'')) AS required(column_name)
     WHERE required.column_name NOT IN (
         SELECT upper(trim(column_name))
           FROM information_schema.columns
          WHERE table_name = ''ahc_hrsn_12_12_2023_valid'')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_message, remediation)
    SELECT uuid(),
           ''05e8feaa-0bed-5909-a817-39812494b361'',
           ''7b979b68-7227-53fd-b689-e4fe153afb76'',
           ''Missing Column'',
           ''Required column '' || column_name || '' is missing in ahc_hrsn_12_12_2023_valid.'',
           ''Ensure ahc_hrsn_12_12_2023_valid contains the column "'' || column_name || ''"''
      FROM required_column_names_in_src;
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx (ERROR)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES (''abf5c680-a135-5d89-b871-fa5b9b99aed6'', ''05e8feaa-0bed-5909-a817-39812494b361'', ''support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx'', ''ERROR'', NULL);
INSERT INTO "orch_session_issue" ("orch_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES (''641dff51-97fd-56b3-8443-c1ed568a6d66'', ''05e8feaa-0bed-5909-a817-39812494b361'', ''abf5c680-a135-5d89-b871-fa5b9b99aed6'', ''Sheet Missing'', ''Excel workbook sheet ''''Admin_Demographic'''' not found in ''''synthetic-fail-excel-01.xlsx'''' (available: Sheet1)'', NULL, NULL, ''support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx'', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx (ERROR)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES (''d70a4700-6b40-52fc-a7a2-69ef0d7f69ff'', ''05e8feaa-0bed-5909-a817-39812494b361'', ''support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx'', ''ERROR'', NULL);
INSERT INTO "orch_session_issue" ("orch_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES (''47277588-99e8-59f5-8384-b24344a86073'', ''05e8feaa-0bed-5909-a817-39812494b361'', ''d70a4700-6b40-52fc-a7a2-69ef0d7f69ff'', ''Sheet Missing'', ''Excel workbook sheet ''''Screening'''' not found in ''''synthetic-fail-excel-01.xlsx'''' (available: Sheet1)'', NULL, NULL, ''support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx'', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx (ERROR)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES (''58b22e99-5854-53bf-adbe-08e67df99b85'', ''05e8feaa-0bed-5909-a817-39812494b361'', ''support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx'', ''ERROR'', NULL);
INSERT INTO "orch_session_issue" ("orch_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES (''a26ce332-3ced-5623-861d-23a2ef78e4a9'', ''05e8feaa-0bed-5909-a817-39812494b361'', ''58b22e99-5854-53bf-adbe-08e67df99b85'', ''Sheet Missing'', ''Excel workbook sheet ''''QE_Admin_Data'''' not found in ''''synthetic-fail-excel-01.xlsx'''' (available: Sheet1)'', NULL, NULL, ''support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx'', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx (ahc_hrsn_valid_01_admin_demographic)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES (''bc0c03b5-d1ba-5301-850f-5e4c42c1bf09'', ''05e8feaa-0bed-5909-a817-39812494b361'', ''support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx'', ''ahc_hrsn_valid_01_admin_demographic'', NULL);
        
INSERT INTO "orch_session_issue" ("orch_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES (''ae477ba1-c7f1-5f34-847a-50bddb7130aa'', ''05e8feaa-0bed-5909-a817-39812494b361'', ''bc0c03b5-d1ba-5301-850f-5e4c42c1bf09'', ''TODO'', ''Excel workbook ''''ahc-hrsn-valid-01.xlsx'''' sheet ''''Admin_Demographic'''' has not been implemented yet.'', NULL, NULL, ''support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx'', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx (ahc_hrsn_valid_01_screening)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES (''8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839'', ''05e8feaa-0bed-5909-a817-39812494b361'', ''support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx'', ''ahc_hrsn_valid_01_screening'', NULL);
     
-- ingest Excel workbook sheet ''Screening'' into ahc_hrsn_valid_01_screening using spatial plugin
INSTALL spatial; LOAD spatial;

-- be sure to add src_file_row_number and session_id columns to each row
-- because assurance CTEs require them
CREATE TABLE ahc_hrsn_valid_01_screening AS
  SELECT *, row_number() OVER () as src_file_row_number, ''05e8feaa-0bed-5909-a817-39812494b361'' as session_id, ''8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839'' as session_entry_id
    FROM st_read(''support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx'', layer=''Screening'', open_options=[''HEADERS=FORCE'', ''FIELD_TYPES=AUTO'']);          

WITH required_column_names_in_src AS (
    SELECT column_name
      FROM (VALUES (''PAT_MRN_ID''), (''FACILITY''), (''FIRST_NAME''), (''LAST_NAME''), (''PAT_BIRTH_DATE''), (''MEDICAID_CIN''), (''ENCOUNTER_ID''), (''SURVEY''), (''SURVEY_ID''), (''RECORDED_TIME''), (''QUESTION''), (''MEAS_VALUE''), (''QUESTION_CODE''), (''QUESTION_CODE_SYSTEM_NAME''), (''ANSWER_CODE''), (''ANSWER_CODE_SYSTEM_NAME''), (''SDOH_DOMAIN''), (''NEED_INDICATED''), (''VISIT_PART_2_FLAG''), (''VISIT_OMH_FLAG''), (''VISIT_OPWDD_FLAG'')) AS required(column_name)
     WHERE required.column_name NOT IN (
         SELECT upper(trim(column_name))
           FROM information_schema.columns
          WHERE table_name = ''ahc_hrsn_valid_01_screening'')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_message, remediation)
    SELECT uuid(),
           ''05e8feaa-0bed-5909-a817-39812494b361'',
           ''8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839'',
           ''Missing Column'',
           ''Required column '' || column_name || '' is missing in ahc_hrsn_valid_01_screening.'',
           ''Ensure ahc_hrsn_valid_01_screening contains the column "'' || column_name || ''"''
      FROM required_column_names_in_src;
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx (ahc_hrsn_valid_01_q_e_admin_data)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES (''b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0'', ''05e8feaa-0bed-5909-a817-39812494b361'', ''support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx'', ''ahc_hrsn_valid_01_q_e_admin_data'', NULL);
        
INSERT INTO "orch_session_issue" ("orch_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES (''7ef8bdeb-fd56-5eb9-a09b-ef15ce18dc49'', ''05e8feaa-0bed-5909-a817-39812494b361'', ''b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0'', ''TODO'', ''Excel workbook ''''ahc-hrsn-valid-01.xlsx'''' sheet ''''QE_Admin_Data'''' has not been implemented yet.'', NULL, NULL, ''support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx'', NULL, NULL);
SELECT session_entry_id, orch_session_issue_id, issue_type, issue_message, invalid_value FROM orch_session_issue WHERE session_id = ''05e8feaa-0bed-5909-a817-39812494b361''
```

### stdout
```sh
[{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"25355414-e403-4a71-9f97-6080aa7bf3a2","issue_type":"Missing Column","issue_message":"Required column PAT_MRN_ID is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"1b56ef89-bbe2-4316-9053-88092657c1f1","issue_type":"Missing Column","issue_message":"Required column FACILITY is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"e2319144-804e-4b6e-9e1c-b4f3879f087e","issue_type":"Missing Column","issue_message":"Required column FIRST_NAME is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"6854ff25-99aa-4cfd-8f56-bb8555cd2907","issue_type":"Missing Column","issue_message":"Required column LAST_NAME is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"8f598ae7-822d-4c83-982e-4ffbb6c659b0","issue_type":"Missing Column","issue_message":"Required column PAT_BIRTH_DATE is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"7e545c76-8575-4640-8f1d-19b211581e88","issue_type":"Missing Column","issue_message":"Required column MEDICAID_CIN is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"2ff4dd2b-6851-41f3-b12c-d851ee7a48d8","issue_type":"Missing Column","issue_message":"Required column ENCOUNTER_ID is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"81cde82d-dc27-4b05-bfb5-d8647e2567a5","issue_type":"Missing Column","issue_message":"Required column SURVEY is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"e4664262-9986-4c1a-888c-de73c88ec7df","issue_type":"Missing Column","issue_message":"Required column SURVEY_ID is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"c215c80d-a0fc-4cef-9b26-bd3395bb442e","issue_type":"Missing Column","issue_message":"Required column RECORDED_TIME is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"261d05e0-5f76-48a2-97a1-1ca728d5ab8a","issue_type":"Missing Column","issue_message":"Required column QUESTION is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"1a853360-4bee-4809-b696-8b450323cd4f","issue_type":"Missing Column","issue_message":"Required column MEAS_VALUE is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"6aff6844-8fa9-4df4-bc8d-44a219fa3aca","issue_type":"Missing Column","issue_message":"Required column QUESTION_CODE is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"f83f927c-1bc3-4945-91c1-cf1093672932","issue_type":"Missing Column","issue_message":"Required column QUESTION_CODE_SYSTEM_NAME is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"ef87acfe-68c3-429b-8899-2dd51e520782","issue_type":"Missing Column","issue_message":"Required column ANSWER_CODE is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"23321b2a-c50f-4d54-854e-fd5d052cf775","issue_type":"Missing Column","issue_message":"Required column ANSWER_CODE_SYSTEM_NAME is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"5ababacc-22c3-4324-8191-32e38155389c","issue_type":"Missing Column","issue_message":"Required column SDOH_DOMAIN is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"fef18579-457a-4cc8-9545-4368a58aa2f7","issue_type":"Missing Column","issue_message":"Required column NEED_INDICATED is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"3bde8af0-cd21-4b71-8ed5-e5c0e239ba46","issue_type":"Missing Column","issue_message":"Required column VISIT_PART_2_FLAG is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"cdf71f13-ef66-48d8-88c3-be8ed69b67fe","issue_type":"Missing Column","issue_message":"Required column VISIT_OMH_FLAG is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"5e9c72ef-9215-4fb8-8bf3-7e89d7723db6","issue_type":"Missing Column","issue_message":"Required column VISIT_OPWDD_FLAG is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"abf5c680-a135-5d89-b871-fa5b9b99aed6","orch_session_issue_id":"641dff51-97fd-56b3-8443-c1ed568a6d66","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet ''Admin_Demographic'' not found in ''synthetic-fail-excel-01.xlsx'' (available: Sheet1)","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx"},
{"session_entry_id":"d70a4700-6b40-52fc-a7a2-69ef0d7f69ff","orch_session_issue_id":"47277588-99e8-59f5-8384-b24344a86073","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet ''Screening'' not found in ''synthetic-fail-excel-01.xlsx'' (available: Sheet1)","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx"},
{"session_entry_id":"58b22e99-5854-53bf-adbe-08e67df99b85","orch_session_issue_id":"a26ce332-3ced-5623-861d-23a2ef78e4a9","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet ''QE_Admin_Data'' not found in ''synthetic-fail-excel-01.xlsx'' (available: Sheet1)","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx"},
{"session_entry_id":"bc0c03b5-d1ba-5301-850f-5e4c42c1bf09","orch_session_issue_id":"ae477ba1-c7f1-5f34-847a-50bddb7130aa","issue_type":"TODO","issue_message":"Excel workbook ''ahc-hrsn-valid-01.xlsx'' sheet ''Admin_Demographic'' has not been implemented yet.","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx"},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","orch_session_issue_id":"41012e63-00c6-4517-a855-8a5f49bfaaca","issue_type":"Missing Column","issue_message":"Required column FACILITY is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","orch_session_issue_id":"ef79d627-c51c-4286-bdd5-824d29a0fe60","issue_type":"Missing Column","issue_message":"Required column FIRST_NAME is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","orch_session_issue_id":"6adcc105-6856-42dc-9bd0-c58399db18ac","issue_type":"Missing Column","issue_message":"Required column LAST_NAME is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","orch_session_issue_id":"3a02e275-c59f-4336-a1a5-eb53a5e17bac","issue_type":"Missing Column","issue_message":"Required column PAT_BIRTH_DATE is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","orch_session_issue_id":"6ef5cda9-8ba5-47ac-bc46-a45b3b79e73c","issue_type":"Missing Column","issue_message":"Required column MEDICAID_CIN is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","orch_session_issue_id":"65a20fd7-d9f1-46fc-85e9-11948c17376a","issue_type":"Missing Column","issue_message":"Required column ENCOUNTER_ID is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","orch_session_issue_id":"cadff939-0510-4454-80dd-a3a3bad3bac2","issue_type":"Missing Column","issue_message":"Required column SURVEY is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","orch_session_issue_id":"7a249006-c736-4bf7-8069-c33577b577ac","issue_type":"Missing Column","issue_message":"Required column SURVEY_ID is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","orch_session_issue_id":"f5702bc4-e786-43d9-9709-5ca8ed9443a2","issue_type":"Missing Column","issue_message":"Required column NEED_INDICATED is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","orch_session_issue_id":"fa2c1c05-b864-4bbe-8d8e-0721091f66f5","issue_type":"Missing Column","issue_message":"Required column VISIT_PART_2_FLAG is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","orch_session_issue_id":"b6cd623c-869c-48a6-9548-fedf900c7b3d","issue_type":"Missing Column","issue_message":"Required column VISIT_OMH_FLAG is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","orch_session_issue_id":"ec1daff2-2c0d-4dba-a92e-14fe7ec05cea","issue_type":"Missing Column","issue_message":"Required column VISIT_OPWDD_FLAG is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"7ef8bdeb-fd56-5eb9-a09b-ef15ce18dc49","issue_type":"TODO","issue_message":"Excel workbook ''ahc-hrsn-valid-01.xlsx'' sheet ''QE_Admin_Data'' has not been implemented yet.","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx"}]

```', NULL);
        INSERT INTO "orch_session_exec" ("orch_session_exec_id", "exec_nature", "session_id", "session_entry_id", "parent_exec_id", "namespace", "exec_identity", "exec_code", "exec_status", "input_text", "exec_error_text", "output_text", "output_nature", "narrative_md", "elaboration") VALUES ('071f8fe1-4899-5c71-9c86-7d7377661d45', 'duckdb', '05e8feaa-0bed-5909-a817-39812494b361', NULL, NULL, NULL, 'ensureContent', 'duckdb support/assurance/ahc-hrsn-elt/screening/results-test-e2e/ingestion-center.duckdb', 0, 'WITH numeric_value_in_all_rows AS (
    SELECT ''SURVEY_ID'' AS issue_column,
           SURVEY_ID AS invalid_value,
           src_file_row_number AS issue_row
      FROM ahc_hrsn_12_12_2023_valid
     WHERE SURVEY_ID IS NOT NULL
       AND SURVEY_ID NOT SIMILAR TO ''^[+-]?[0-9]+$''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           ''05e8feaa-0bed-5909-a817-39812494b361'',
           ''7b979b68-7227-53fd-b689-e4fe153afb76'',
           ''Data Type Mismatch'',
           issue_row,
           issue_column,
           invalid_value,
           ''Non-integer value "'' || invalid_value || ''" found in '' || issue_column,
           ''Convert non-integer values to INTEGER''
      FROM numeric_value_in_all_rows;', NULL, NULL, NULL, '```sql
WITH numeric_value_in_all_rows AS (
    SELECT ''SURVEY_ID'' AS issue_column,
           SURVEY_ID AS invalid_value,
           src_file_row_number AS issue_row
      FROM ahc_hrsn_12_12_2023_valid
     WHERE SURVEY_ID IS NOT NULL
       AND SURVEY_ID NOT SIMILAR TO ''^[+-]?[0-9]+$''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           ''05e8feaa-0bed-5909-a817-39812494b361'',
           ''7b979b68-7227-53fd-b689-e4fe153afb76'',
           ''Data Type Mismatch'',
           issue_row,
           issue_column,
           invalid_value,
           ''Non-integer value "'' || invalid_value || ''" found in '' || issue_column,
           ''Convert non-integer values to INTEGER''
      FROM numeric_value_in_all_rows;
```
', NULL);

        ATTACH 'support/assurance/ahc-hrsn-elt/screening/results-test-e2e/resource.sqlite.db' AS resource_db (TYPE SQLITE);

        CREATE TABLE resource_db.device AS SELECT * FROM device;
        CREATE TABLE resource_db.orch_session AS SELECT * FROM orch_session;
        CREATE TABLE resource_db.orch_session_entry AS SELECT * FROM orch_session_entry;
        CREATE TABLE resource_db.orch_session_state AS SELECT * FROM orch_session_state;
        CREATE TABLE resource_db.orch_session_exec AS SELECT * FROM orch_session_exec;
        CREATE TABLE resource_db.orch_session_issue AS SELECT * FROM orch_session_issue;
        CREATE TABLE resource_db.sqlpage_files AS SELECT * FROM sqlpage_files;

        CREATE TABLE resource_db.ahc_hrsn_12_12_2023_valid AS SELECT * FROM ahc_hrsn_12_12_2023_valid;

CREATE VIEW resource_db.ahc_hrsn_12_12_2023_valid_fhir AS 
  SELECT json_object(
        'resourceType', 'Observation',
        'id', ENCOUNTER_ID,
        'status', 'final',
        'code', json_object(
            'coding', json_array(
                json_object(
                    'system', QUESTION_CODE_SYSTEM_NAME,
                    'code', QUESTION_CODE,
                    'display', QUESTION
                )
            )
        ),
        'subject', json_object(
            'reference', 'Patient/' || PAT_MRN_ID
        ),
        'effectiveDateTime', RECORDED_TIME,
        'valueString', MEAS_VALUE,
        'performer', json_array(
            json_object(
                'reference', 'Practitioner/' || session_id
            )
        ),
        'context', json_object(
            'reference', 'Encounter/' || ENCOUNTER_ID
        )
    ) AS FHIR_Observation
  FROM ahc_hrsn_12_12_2023_valid;

        DETACH DATABASE resource_db;
        -- no after-finalize SQL provided
```

### stderr
```sh
Error: near line 1: Conversion Error: Date out of range: 2024-1-0
Error: near line 2: Conversion Error: Date out of range: 2024-1-0
Error: near line 3: Conversion Error: Date out of range: 2024-1-0
Error: near line 4: Conversion Error: Date out of range: 2024-1-0
Error: near line 5: Conversion Error: Date out of range: 2024-1-0

```

## emitDiagnostics
```sql
INSTALL spatial; LOAD spatial;
-- TODO: join with orch_session table to give all the results in one sheet
COPY (SELECT * FROM orch_session_diagnostic_text) TO 'support/assurance/ahc-hrsn-elt/screening/results-test-e2e/diagnostics.xlsx' WITH (FORMAT GDAL, DRIVER 'xlsx');
```
