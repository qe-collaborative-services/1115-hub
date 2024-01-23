---
walkRootPaths:
  - support/assurance/ahc-hrsn-elt/screening/synthetic-content
diagsJson: support/assurance/ahc-hrsn-elt/screening/results-test-e2e/diagnostics.json
diagsMd: support/assurance/ahc-hrsn-elt/screening/results-test-e2e/diagnostics.md
diagsXlsx: support/assurance/ahc-hrsn-elt/screening/results-test-e2e/diagnostics.xlsx
resourceDb: support/assurance/ahc-hrsn-elt/screening/results-test-e2e/resource.sqlite.db
sources:
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
---
# Orchestration Diagnostics
## Contents

- [init](#init)
- [ingest](#ingest)
  - [`ingest` STDOUT (status: `0`)](#ingest-stdout-status-0-)
- [ensureContent](#ensurecontent)
- [emitResources](#emitresources)
- [emitDiagnostics](#emitdiagnostics)


## init

```sql
-- preambleSQL
SET autoinstall_known_extensions=true;
SET autoload_known_extensions=true;
-- end preambleSQL

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
    "orch_started_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "orch_finished_at" TIMESTAMP,
    "elaboration" TEXT,
    "args_json" TEXT,
    "diagnostics_json" TEXT,
    "diagnostics_md" TEXT,
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
    "transitioned_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
INSERT INTO "device" ("device_id", "name", "state", "boundary", "segmentation", "state_sysinfo", "elaboration") VALUES ('05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'EXCELSIOR', 'SINGLETON', 'UNKNOWN', NULL, '{"os-arch":"x64","os-platform":"linux"}', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "orch_session" ("orch_session_id", "device_id", "orch_started_at", "orch_finished_at", "elaboration", "args_json", "diagnostics_json", "diagnostics_md") VALUES ('05e8feaa-0bed-5909-a817-39812494b361', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', (make_timestamp(2024, 1, 1, 21, 19, 12.565)), NULL, NULL, NULL, NULL, 'Session 05e8feaa-0bed-5909-a817-39812494b361 markdown diagnostics not provided (not completed?)');

-- no after-init SQL found
```
No STDOUT emitted by `init` (status: `0`).

No STDERR emitted by `init`.

    

## ingest

```sql
-- preambleSQL
SET autoinstall_known_extensions=true;
SET autoload_known_extensions=true;
-- end preambleSQL
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx (ERROR)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('8b7c669c-1795-5f6b-8f3a-3e502b74c628', '05e8feaa-0bed-5909-a817-39812494b361', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx', 'ERROR', NULL);
INSERT INTO "orch_session_issue" ("orch_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('7b979b68-7227-53fd-b689-e4fe153afb76', '05e8feaa-0bed-5909-a817-39812494b361', '8b7c669c-1795-5f6b-8f3a-3e502b74c628', 'Sheet Missing', 'Excel workbook sheet ''Admin_Demographic'' not found in ''synthetic-fail-excel-01.xlsx'' (available: Sheet1)', NULL, NULL, 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx (ERROR)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('abf5c680-a135-5d89-b871-fa5b9b99aed6', '05e8feaa-0bed-5909-a817-39812494b361', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx', 'ERROR', NULL);
INSERT INTO "orch_session_issue" ("orch_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('641dff51-97fd-56b3-8443-c1ed568a6d66', '05e8feaa-0bed-5909-a817-39812494b361', 'abf5c680-a135-5d89-b871-fa5b9b99aed6', 'Sheet Missing', 'Excel workbook sheet ''Screening'' not found in ''synthetic-fail-excel-01.xlsx'' (available: Sheet1)', NULL, NULL, 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx (ERROR)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('d70a4700-6b40-52fc-a7a2-69ef0d7f69ff', '05e8feaa-0bed-5909-a817-39812494b361', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx', 'ERROR', NULL);
INSERT INTO "orch_session_issue" ("orch_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('47277588-99e8-59f5-8384-b24344a86073', '05e8feaa-0bed-5909-a817-39812494b361', 'd70a4700-6b40-52fc-a7a2-69ef0d7f69ff', 'Sheet Missing', 'Excel workbook sheet ''QE_Admin_Data'' not found in ''synthetic-fail-excel-01.xlsx'' (available: Sheet1)', NULL, NULL, 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx (ahc_hrsn_valid_01_admin_demographic)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('58b22e99-5854-53bf-adbe-08e67df99b85', '05e8feaa-0bed-5909-a817-39812494b361', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx', 'ahc_hrsn_valid_01_admin_demographic', NULL);
        
INSERT INTO "orch_session_issue" ("orch_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('a26ce332-3ced-5623-861d-23a2ef78e4a9', '05e8feaa-0bed-5909-a817-39812494b361', '58b22e99-5854-53bf-adbe-08e67df99b85', 'TODO', 'Excel workbook ''ahc-hrsn-valid-01.xlsx'' sheet ''Admin_Demographic'' has not been implemented yet.', NULL, NULL, 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx (ahc_hrsn_valid_01_screening)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('bc0c03b5-d1ba-5301-850f-5e4c42c1bf09', '05e8feaa-0bed-5909-a817-39812494b361', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx', 'ahc_hrsn_valid_01_screening', NULL);
     
-- ingest Excel workbook sheet 'Screening' into ahc_hrsn_valid_01_screening using spatial plugin
INSTALL spatial; LOAD spatial;

-- be sure to add src_file_row_number and session_id columns to each row
-- because assurance CTEs require them
CREATE TABLE ahc_hrsn_valid_01_screening AS
  SELECT *, row_number() OVER () as src_file_row_number, '05e8feaa-0bed-5909-a817-39812494b361' as session_id, 'bc0c03b5-d1ba-5301-850f-5e4c42c1bf09' as session_entry_id
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
           'bc0c03b5-d1ba-5301-850f-5e4c42c1bf09',
           'Missing Column',
           'Required column ' || column_name || ' is missing in ahc_hrsn_valid_01_screening.',
           'Ensure ahc_hrsn_valid_01_screening contains the column "' || column_name || '"'
      FROM required_column_names_in_src;
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx (ahc_hrsn_valid_01_q_e_admin_data)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('ae477ba1-c7f1-5f34-847a-50bddb7130aa', '05e8feaa-0bed-5909-a817-39812494b361', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx', 'ahc_hrsn_valid_01_q_e_admin_data', NULL);
        
INSERT INTO "orch_session_issue" ("orch_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839', '05e8feaa-0bed-5909-a817-39812494b361', 'ae477ba1-c7f1-5f34-847a-50bddb7130aa', 'TODO', 'Excel workbook ''ahc-hrsn-valid-01.xlsx'' sheet ''QE_Admin_Data'' has not been implemented yet.', NULL, NULL, 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail.csv (synthetic_fail)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0', '05e8feaa-0bed-5909-a817-39812494b361', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail.csv', 'synthetic_fail', NULL);

-- be sure to add src_file_row_number and session_id columns to each row
-- because assurance CTEs require them
CREATE TABLE synthetic_fail AS
  SELECT *, row_number() OVER () as src_file_row_number, '05e8feaa-0bed-5909-a817-39812494b361' as session_id, 'b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0' as session_entry_id
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
           'b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0',
           'Missing Column',
           'Required column ' || column_name || ' is missing in synthetic_fail.',
           'Ensure synthetic_fail contains the column "' || column_name || '"'
      FROM required_column_names_in_src;
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-12-12-2023-valid.csv (ahc_hrsn_12_12_2023_valid)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('7ef8bdeb-fd56-5eb9-a09b-ef15ce18dc49', '05e8feaa-0bed-5909-a817-39812494b361', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-12-12-2023-valid.csv', 'ahc_hrsn_12_12_2023_valid', NULL);

-- be sure to add src_file_row_number and session_id columns to each row
-- because assurance CTEs require them
CREATE TABLE ahc_hrsn_12_12_2023_valid AS
  SELECT *, row_number() OVER () as src_file_row_number, '05e8feaa-0bed-5909-a817-39812494b361' as session_id, '7ef8bdeb-fd56-5eb9-a09b-ef15ce18dc49' as session_entry_id
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
           '7ef8bdeb-fd56-5eb9-a09b-ef15ce18dc49',
           'Missing Column',
           'Required column ' || column_name || ' is missing in ahc_hrsn_12_12_2023_valid.',
           'Ensure ahc_hrsn_12_12_2023_valid contains the column "' || column_name || '"'
      FROM required_column_names_in_src;
SELECT session_entry_id, orch_session_issue_id, issue_type, issue_message, invalid_value FROM orch_session_issue WHERE session_id = '05e8feaa-0bed-5909-a817-39812494b361'
```
### `ingest` STDOUT (status: `0`)
```json
[{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"7b979b68-7227-53fd-b689-e4fe153afb76","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet 'Admin_Demographic' not found in 'synthetic-fail-excel-01.xlsx' (available: Sheet1)","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx"},
{"session_entry_id":"abf5c680-a135-5d89-b871-fa5b9b99aed6","orch_session_issue_id":"641dff51-97fd-56b3-8443-c1ed568a6d66","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet 'Screening' not found in 'synthetic-fail-excel-01.xlsx' (available: Sheet1)","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx"},
{"session_entry_id":"d70a4700-6b40-52fc-a7a2-69ef0d7f69ff","orch_session_issue_id":"47277588-99e8-59f5-8384-b24344a86073","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet 'QE_Admin_Data' not found in 'synthetic-fail-excel-01.xlsx' (available: Sheet1)","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx"},
{"session_entry_id":"58b22e99-5854-53bf-adbe-08e67df99b85","orch_session_issue_id":"a26ce332-3ced-5623-861d-23a2ef78e4a9","issue_type":"TODO","issue_message":"Excel workbook 'ahc-hrsn-valid-01.xlsx' sheet 'Admin_Demographic' has not been implemented yet.","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx"},
{"session_entry_id":"bc0c03b5-d1ba-5301-850f-5e4c42c1bf09","orch_session_issue_id":"95b8b0b0-a12d-48c7-ac7d-b79791c1de3c","issue_type":"Missing Column","issue_message":"Required column FACILITY is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"bc0c03b5-d1ba-5301-850f-5e4c42c1bf09","orch_session_issue_id":"2635d729-6559-464a-b0d6-7325018ffe36","issue_type":"Missing Column","issue_message":"Required column FIRST_NAME is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"bc0c03b5-d1ba-5301-850f-5e4c42c1bf09","orch_session_issue_id":"b9069bd0-8299-4b62-ab81-e287d88133be","issue_type":"Missing Column","issue_message":"Required column LAST_NAME is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"bc0c03b5-d1ba-5301-850f-5e4c42c1bf09","orch_session_issue_id":"ffd88615-fc9c-402f-8479-67df9fcff002","issue_type":"Missing Column","issue_message":"Required column PAT_BIRTH_DATE is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"bc0c03b5-d1ba-5301-850f-5e4c42c1bf09","orch_session_issue_id":"23166d7b-d6b5-4bf5-906e-c0350d65bcf1","issue_type":"Missing Column","issue_message":"Required column MEDICAID_CIN is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"bc0c03b5-d1ba-5301-850f-5e4c42c1bf09","orch_session_issue_id":"6f584c45-31fb-419e-9173-33dee34cffa9","issue_type":"Missing Column","issue_message":"Required column ENCOUNTER_ID is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"bc0c03b5-d1ba-5301-850f-5e4c42c1bf09","orch_session_issue_id":"6d58188e-2b9a-42db-b593-b578e796f775","issue_type":"Missing Column","issue_message":"Required column SURVEY is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"bc0c03b5-d1ba-5301-850f-5e4c42c1bf09","orch_session_issue_id":"ef252f02-7ff7-4fd4-9c14-f9e2508c6ffa","issue_type":"Missing Column","issue_message":"Required column SURVEY_ID is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"bc0c03b5-d1ba-5301-850f-5e4c42c1bf09","orch_session_issue_id":"cfeeb1dd-de6e-423c-9f9d-ce724e1979dd","issue_type":"Missing Column","issue_message":"Required column NEED_INDICATED is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"bc0c03b5-d1ba-5301-850f-5e4c42c1bf09","orch_session_issue_id":"499b7f18-15d5-405a-9a99-830fcf1a67e7","issue_type":"Missing Column","issue_message":"Required column VISIT_PART_2_FLAG is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"bc0c03b5-d1ba-5301-850f-5e4c42c1bf09","orch_session_issue_id":"57858b87-1b4d-4bec-870b-7bfe9bcbf4c6","issue_type":"Missing Column","issue_message":"Required column VISIT_OMH_FLAG is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"bc0c03b5-d1ba-5301-850f-5e4c42c1bf09","orch_session_issue_id":"fda5965b-8733-4cd7-8f38-46707a87000e","issue_type":"Missing Column","issue_message":"Required column VISIT_OPWDD_FLAG is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"ae477ba1-c7f1-5f34-847a-50bddb7130aa","orch_session_issue_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","issue_type":"TODO","issue_message":"Excel workbook 'ahc-hrsn-valid-01.xlsx' sheet 'QE_Admin_Data' has not been implemented yet.","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx"},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"bbf9588f-c3b5-490f-8e1d-0b4d585a350a","issue_type":"Missing Column","issue_message":"Required column PAT_MRN_ID is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"3645688c-9317-4f40-b626-c4f2f55b9b2b","issue_type":"Missing Column","issue_message":"Required column FACILITY is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"7b6fcfa1-dab6-4c98-b71a-e2dcea765514","issue_type":"Missing Column","issue_message":"Required column FIRST_NAME is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"9686114b-e3f3-4f48-a423-5fb7cfd98da6","issue_type":"Missing Column","issue_message":"Required column LAST_NAME is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"b11d057d-511d-4e08-b2a0-7956484b2bb4","issue_type":"Missing Column","issue_message":"Required column PAT_BIRTH_DATE is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"b72d9b61-880e-48f9-b52a-3e2e80071be7","issue_type":"Missing Column","issue_message":"Required column MEDICAID_CIN is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"23b92792-6856-4dd6-8f36-26291e6f7c3b","issue_type":"Missing Column","issue_message":"Required column ENCOUNTER_ID is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"0f74e96e-82c9-4553-b393-f514c76dcb21","issue_type":"Missing Column","issue_message":"Required column SURVEY is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"962da885-0a5f-40d9-bd3c-9787ed79257f","issue_type":"Missing Column","issue_message":"Required column SURVEY_ID is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"7647913f-db03-4601-af23-12d6bb2410dc","issue_type":"Missing Column","issue_message":"Required column RECORDED_TIME is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"bb824194-3bd3-45d0-bd6b-673b34cf993b","issue_type":"Missing Column","issue_message":"Required column QUESTION is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"2599baf6-9da4-4128-8a54-934e6cadee6e","issue_type":"Missing Column","issue_message":"Required column MEAS_VALUE is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"05ae4641-e06a-4d39-9ebd-0935ad2e061b","issue_type":"Missing Column","issue_message":"Required column QUESTION_CODE is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"9bc6e87f-e77f-4750-a7c9-b1b320902717","issue_type":"Missing Column","issue_message":"Required column QUESTION_CODE_SYSTEM_NAME is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"4cf83cfc-cca5-4f4f-8c6e-f0e901ec1e67","issue_type":"Missing Column","issue_message":"Required column ANSWER_CODE is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"e773ff1a-56fe-4d8f-99e4-cfd83382a9e6","issue_type":"Missing Column","issue_message":"Required column ANSWER_CODE_SYSTEM_NAME is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"04a1b1b9-2e96-47c3-9ca4-f53d9194c2d1","issue_type":"Missing Column","issue_message":"Required column SDOH_DOMAIN is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"5c2ca29d-4b10-47c0-8212-3150a077625a","issue_type":"Missing Column","issue_message":"Required column NEED_INDICATED is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"dc5f13d6-c58f-440c-8b16-5187f61f1dbc","issue_type":"Missing Column","issue_message":"Required column VISIT_PART_2_FLAG is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"846e6fd6-9a03-4e19-8866-bcc60e15178a","issue_type":"Missing Column","issue_message":"Required column VISIT_OMH_FLAG is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"54f0d4e0-2a53-49c0-9871-ac29f241f5ff","issue_type":"Missing Column","issue_message":"Required column VISIT_OPWDD_FLAG is missing in synthetic_fail.","invalid_value":null}]

```
No STDERR emitted by `ingest`.

    

## ensureContent

```sql
-- preambleSQL
SET autoinstall_known_extensions=true;
SET autoload_known_extensions=true;
-- end preambleSQL
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
           '7ef8bdeb-fd56-5eb9-a09b-ef15ce18dc49',
           'Data Type Mismatch',
           issue_row,
           issue_column,
           invalid_value,
           'Non-integer value "' || invalid_value || '" found in ' || issue_column,
           'Convert non-integer values to INTEGER'
      FROM numeric_value_in_all_rows;
```
No STDOUT emitted by `ensureContent` (status: `0`).

No STDERR emitted by `ensureContent`.

    

## emitResources

```sql
-- preambleSQL
SET autoinstall_known_extensions=true;
SET autoload_known_extensions=true;
-- end preambleSQL
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('8f460419-7b80-516d-8919-84520950f612', '05e8feaa-0bed-5909-a817-39812494b361', NULL, 'NONE', 'ENTER(prepareInit)', NULL, 'rsEE.beforeCell', (make_timestamp(2024, 1, 1, 21, 19, 14.119)), NULL);
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('7bab389e-54af-5a13-a39f-079abdc73a48', '05e8feaa-0bed-5909-a817-39812494b361', NULL, 'EXIT(prepareInit)', 'ENTER(init)', NULL, 'rsEE.afterCell', (make_timestamp(2024, 1, 1, 21, 19, 14.119)), NULL);
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('1931dfcc-e8fc-597d-b1bc-65b4287e6fdf', '05e8feaa-0bed-5909-a817-39812494b361', NULL, 'EXIT(init)', 'ENTER(ingest)', NULL, 'rsEE.afterCell', (make_timestamp(2024, 1, 1, 21, 19, 14.119)), NULL);
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('3b4eb0e5-6239-537a-8e67-e50e172e72a2', '05e8feaa-0bed-5909-a817-39812494b361', NULL, 'EXIT(ingest)', 'ENTER(ensureContent)', NULL, 'rsEE.afterCell', (make_timestamp(2024, 1, 1, 21, 19, 14.119)), NULL);
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('86b4a49e-7378-5159-9f41-b005208c31bc', '05e8feaa-0bed-5909-a817-39812494b361', NULL, 'EXIT(ensureContent)', 'ENTER(emitResources)', NULL, 'rsEE.afterCell', (make_timestamp(2024, 1, 1, 21, 19, 14.119)), NULL);

-- removed SQLPage and execution diagnostics SQL DML from diagnostics Markdown

ATTACH 'support/assurance/ahc-hrsn-elt/screening/results-test-e2e/resource.sqlite.db' AS resource_db (TYPE SQLITE);

-- copy relevant orchestration engine admin tables into the the attached database
CREATE TABLE resource_db.device AS SELECT * FROM device;
CREATE TABLE resource_db.orch_session AS SELECT * FROM orch_session;
CREATE TABLE resource_db.orch_session_entry AS SELECT * FROM orch_session_entry;
CREATE TABLE resource_db.orch_session_state AS SELECT * FROM orch_session_state;
CREATE TABLE resource_db.orch_session_exec AS SELECT * FROM orch_session_exec;
CREATE TABLE resource_db.orch_session_issue AS SELECT * FROM orch_session_issue;
CREATE TABLE resource_db.sqlpage_files AS SELECT * FROM sqlpage_files;

-- export content tables from DuckDb into the attached database (nature-dependent)
CREATE TABLE resource_db.ahc_hrsn_12_12_2023_valid AS SELECT * FROM ahc_hrsn_12_12_2023_valid;

CREATE VIEW resource_db.ahc_hrsn_12_12_2023_valid_fhir AS 
  SELECT pat_mrn_id, json_object(
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
No STDOUT emitted by `emitResources` (status: `0`).

No STDERR emitted by `emitResources`.

    

## emitDiagnostics

```sql
-- preambleSQL
SET autoinstall_known_extensions=true;
SET autoload_known_extensions=true;
-- end preambleSQL
INSTALL spatial; LOAD spatial;
-- TODO: join with orch_session table to give all the results in one sheet
COPY (SELECT * FROM orch_session_diagnostic_text) TO 'support/assurance/ahc-hrsn-elt/screening/results-test-e2e/diagnostics.xlsx' WITH (FORMAT GDAL, DRIVER 'xlsx');
```
No STDOUT emitted by `emitDiagnostics` (status: `0`).

No STDERR emitted by `emitDiagnostics`.

    