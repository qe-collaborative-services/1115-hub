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
INSERT INTO "device" ("device_id", "name", "state", "boundary", "segmentation", "state_sysinfo", "elaboration") VALUES ('05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'Titan', 'SINGLETON', 'UNKNOWN', NULL, '{"os-arch":"x64","os-platform":"linux"}', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "orch_session" ("orch_session_id", "device_id", "orch_started_at", "orch_finished_at", "elaboration") VALUES ('05e8feaa-0bed-5909-a817-39812494b361', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', NULL, NULL, NULL);

-- no after-init SQL found
```


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

### stdout
```sh
[{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"7b979b68-7227-53fd-b689-e4fe153afb76","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet 'Admin_Demographic' not found in 'synthetic-fail-excel-01.xlsx' (available: Sheet1)","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx"},
{"session_entry_id":"abf5c680-a135-5d89-b871-fa5b9b99aed6","orch_session_issue_id":"641dff51-97fd-56b3-8443-c1ed568a6d66","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet 'Screening' not found in 'synthetic-fail-excel-01.xlsx' (available: Sheet1)","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx"},
{"session_entry_id":"d70a4700-6b40-52fc-a7a2-69ef0d7f69ff","orch_session_issue_id":"47277588-99e8-59f5-8384-b24344a86073","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet 'QE_Admin_Data' not found in 'synthetic-fail-excel-01.xlsx' (available: Sheet1)","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx"},
{"session_entry_id":"58b22e99-5854-53bf-adbe-08e67df99b85","orch_session_issue_id":"a26ce332-3ced-5623-861d-23a2ef78e4a9","issue_type":"TODO","issue_message":"Excel workbook 'ahc-hrsn-valid-01.xlsx' sheet 'Admin_Demographic' has not been implemented yet.","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx"},
{"session_entry_id":"bc0c03b5-d1ba-5301-850f-5e4c42c1bf09","orch_session_issue_id":"1c249b90-02ed-42e3-bc80-8bebe0b3f63b","issue_type":"Missing Column","issue_message":"Required column FACILITY is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"bc0c03b5-d1ba-5301-850f-5e4c42c1bf09","orch_session_issue_id":"41d3ee39-c1a6-4232-9e19-3c397bc28e67","issue_type":"Missing Column","issue_message":"Required column FIRST_NAME is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"bc0c03b5-d1ba-5301-850f-5e4c42c1bf09","orch_session_issue_id":"65619ffc-d9fe-4b65-83d5-ef481cef90d2","issue_type":"Missing Column","issue_message":"Required column LAST_NAME is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"bc0c03b5-d1ba-5301-850f-5e4c42c1bf09","orch_session_issue_id":"c5290207-8a38-422a-828a-ae6f20805f6c","issue_type":"Missing Column","issue_message":"Required column PAT_BIRTH_DATE is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"bc0c03b5-d1ba-5301-850f-5e4c42c1bf09","orch_session_issue_id":"740b7b5d-db7c-461f-8980-59e870a14963","issue_type":"Missing Column","issue_message":"Required column MEDICAID_CIN is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"bc0c03b5-d1ba-5301-850f-5e4c42c1bf09","orch_session_issue_id":"130d8033-1979-4035-a8ca-828d9d071b1f","issue_type":"Missing Column","issue_message":"Required column ENCOUNTER_ID is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"bc0c03b5-d1ba-5301-850f-5e4c42c1bf09","orch_session_issue_id":"42705ffe-03a5-4409-a55a-29eb3faa6365","issue_type":"Missing Column","issue_message":"Required column SURVEY is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"bc0c03b5-d1ba-5301-850f-5e4c42c1bf09","orch_session_issue_id":"904da14c-df53-4397-82b2-edd4155d5d7a","issue_type":"Missing Column","issue_message":"Required column SURVEY_ID is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"bc0c03b5-d1ba-5301-850f-5e4c42c1bf09","orch_session_issue_id":"d82c4a03-df84-4d87-958c-9b54baddeb2c","issue_type":"Missing Column","issue_message":"Required column NEED_INDICATED is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"bc0c03b5-d1ba-5301-850f-5e4c42c1bf09","orch_session_issue_id":"5fb4f10b-717a-4aa7-a937-a554d4e2b6f1","issue_type":"Missing Column","issue_message":"Required column VISIT_PART_2_FLAG is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"bc0c03b5-d1ba-5301-850f-5e4c42c1bf09","orch_session_issue_id":"7bddee20-67e2-4c3d-9d3b-adc300497d57","issue_type":"Missing Column","issue_message":"Required column VISIT_OMH_FLAG is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"bc0c03b5-d1ba-5301-850f-5e4c42c1bf09","orch_session_issue_id":"b300f309-cb97-4c1e-9046-42c65feaed8b","issue_type":"Missing Column","issue_message":"Required column VISIT_OPWDD_FLAG is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"ae477ba1-c7f1-5f34-847a-50bddb7130aa","orch_session_issue_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","issue_type":"TODO","issue_message":"Excel workbook 'ahc-hrsn-valid-01.xlsx' sheet 'QE_Admin_Data' has not been implemented yet.","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx"},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"39ad14b9-3de2-4dea-9075-8182a9f7be7e","issue_type":"Missing Column","issue_message":"Required column PAT_MRN_ID is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"b4d9c654-79c0-474e-8077-88549890405c","issue_type":"Missing Column","issue_message":"Required column FACILITY is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"4b81795d-4e50-4f8b-b9d4-1d879522eef0","issue_type":"Missing Column","issue_message":"Required column FIRST_NAME is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"17063d26-909d-4cf6-9063-d6a1e0dda382","issue_type":"Missing Column","issue_message":"Required column LAST_NAME is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"2531d9ad-1bf1-4987-bedd-04baa40f9246","issue_type":"Missing Column","issue_message":"Required column PAT_BIRTH_DATE is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"51438f74-bab0-40d2-9810-83c888938960","issue_type":"Missing Column","issue_message":"Required column MEDICAID_CIN is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"c1be0df4-8755-4667-8766-3aa8f61737a5","issue_type":"Missing Column","issue_message":"Required column ENCOUNTER_ID is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"6b54595c-8fc5-493c-bac5-078956ac90e3","issue_type":"Missing Column","issue_message":"Required column SURVEY is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"fa0cc4d3-ea6d-4b2b-b507-48f1c541c42b","issue_type":"Missing Column","issue_message":"Required column SURVEY_ID is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"76434d6d-fb85-401c-9383-9a6c18fa2c48","issue_type":"Missing Column","issue_message":"Required column RECORDED_TIME is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"d2702766-09b6-4fed-8a0c-62be3bf50fef","issue_type":"Missing Column","issue_message":"Required column QUESTION is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"0f710509-bb46-4f6b-a48e-4a508a8c3fea","issue_type":"Missing Column","issue_message":"Required column MEAS_VALUE is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"439bf9e2-d6c0-41ad-a18b-fcd4590aafa9","issue_type":"Missing Column","issue_message":"Required column QUESTION_CODE is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"c9b61112-d008-40bb-8ef0-51a1a60793fc","issue_type":"Missing Column","issue_message":"Required column QUESTION_CODE_SYSTEM_NAME is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"0f830419-702b-46ce-902f-f8ce101713a0","issue_type":"Missing Column","issue_message":"Required column ANSWER_CODE is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"cfde60f3-6ef4-4fe2-877d-8b34778687a4","issue_type":"Missing Column","issue_message":"Required column ANSWER_CODE_SYSTEM_NAME is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"07168f2d-4495-48f0-98c1-01c3e1ebaab0","issue_type":"Missing Column","issue_message":"Required column SDOH_DOMAIN is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"70c74ded-5d86-468d-a3db-218adaa673c3","issue_type":"Missing Column","issue_message":"Required column NEED_INDICATED is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"98ee1b1f-4b3d-405a-8cd2-db5df12212bf","issue_type":"Missing Column","issue_message":"Required column VISIT_PART_2_FLAG is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"576d7063-64a0-42a4-ac5f-83110f349002","issue_type":"Missing Column","issue_message":"Required column VISIT_OMH_FLAG is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"1558afa6-3b96-4263-ba04-9585fba3091b","issue_type":"Missing Column","issue_message":"Required column VISIT_OPWDD_FLAG is missing in synthetic_fail.","invalid_value":null}]

```

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


## emitResources
```sql
-- preambleSQL
SET autoinstall_known_extensions=true;
SET autoload_known_extensions=true;
-- end preambleSQL
        INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('8f460419-7b80-516d-8919-84520950f612', '05e8feaa-0bed-5909-a817-39812494b361', NULL, 'NONE', 'ENTER(prepareInit)', NULL, 'rsEE.beforeCell', (make_timestamp(2024, 1, 3, 8, 53, 12.567)), NULL);
        INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('7bab389e-54af-5a13-a39f-079abdc73a48', '05e8feaa-0bed-5909-a817-39812494b361', NULL, 'EXIT(prepareInit)', 'ENTER(init)', NULL, 'rsEE.afterCell', (make_timestamp(2024, 1, 3, 8, 53, 12.567)), NULL);
        INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('1931dfcc-e8fc-597d-b1bc-65b4287e6fdf', '05e8feaa-0bed-5909-a817-39812494b361', NULL, 'EXIT(init)', 'ENTER(ingest)', NULL, 'rsEE.afterCell', (make_timestamp(2024, 1, 3, 8, 53, 12.567)), NULL);
        INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('3b4eb0e5-6239-537a-8e67-e50e172e72a2', '05e8feaa-0bed-5909-a817-39812494b361', NULL, 'EXIT(ingest)', 'ENTER(ensureContent)', NULL, 'rsEE.afterCell', (make_timestamp(2024, 1, 3, 8, 53, 12.567)), NULL);
        INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('86b4a49e-7378-5159-9f41-b005208c31bc', '05e8feaa-0bed-5909-a817-39812494b361', NULL, 'EXIT(ensureContent)', 'ENTER(emitResources)', NULL, 'rsEE.afterCell', (make_timestamp(2024, 1, 3, 8, 53, 12.567)), NULL);

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

INSERT INTO "sqlpage_files" ("path", "contents", "last_modified") VALUES ('sqlpage/templates/info_model_schema_tables.handlebars', '{{caption}}
<ul>
{{#each_row}}
    <li><a href="?table_nature={{nature}}&table_name={{table_name}}">{{table_name}}</a> ({{nature}}, {{columns_count}} columns)</li>
{{/each_row}}
</ul>', (CURRENT_TIMESTAMP));

INSERT INTO "sqlpage_files" ("path", "contents", "last_modified") VALUES ('index.sql', 'SELECT ''shell'' as component, ''QCS Orchestration Engine'' as title, ''book'' as icon, ''/'' as link, ''screenings'' as menu_item, ''sessions'' as menu_item, ''schema'' as menu_item;
    ;
SELECT ''list'' as component;
SELECT ''1115 Waiver Screenings'' as title,''1115-waiver-screenings.sql'' as link;
SELECT ''Orchestration Sessions'' as title,''sessions.sql'' as link;
SELECT ''Orchestration Issues'' as title,''issues.sql'' as link;
SELECT ''Orchestration State Schema'' as title,''schema.sql'' as link;', (CURRENT_TIMESTAMP)) ON CONFLICT(path) DO UPDATE SET contents = EXCLUDED.contents /* TODO: does not work in DuckDB , last_modified = (CURRENT_TIMESTAMP) */;

INSERT INTO "sqlpage_files" ("path", "contents", "last_modified") VALUES ('sessions.sql', 'SELECT ''shell'' as component, ''QCS Orchestration Engine'' as title, ''book'' as icon, ''/'' as link, ''screenings'' as menu_item, ''sessions'' as menu_item, ''schema'' as menu_item;
    ;

SELECT ''table'' as component;
SELECT * FROM device;

SELECT ''table'' as component;
SELECT * FROM orch_session;

SELECT ''table'' as component, ''true'' as search, ''ingest_src'' as markdown;
SELECT ''['' || ingest_src || ''](issues.sql?session_entry_id=''|| orch_session_entry_id ||'')'' as ingest_src, ingest_table_name FROM "orch_session_entry";
    ', (CURRENT_TIMESTAMP)) ON CONFLICT(path) DO UPDATE SET contents = EXCLUDED.contents /* TODO: does not work in DuckDB , last_modified = (CURRENT_TIMESTAMP) */;

INSERT INTO "sqlpage_files" ("path", "contents", "last_modified") VALUES ('issues.sql', 'SELECT ''shell'' as component, ''QCS Orchestration Engine'' as title, ''book'' as icon, ''/'' as link, ''screenings'' as menu_item, ''sessions'' as menu_item, ''schema'' as menu_item;
    ;

SELECT ''session_entries'' as component, ''Choose Session Entry'' as title;
SELECT orch_session_entry_id, ingest_src, ingest_table_name 
  FROM orch_session_entry;

SELECT ''table'' as component, ''true'' as search;

            SELECT issue_type, issue_message, invalid_value, remediation
              FROM orch_session_issue
             WHERE session_entry_id = $session_entry_id;
', (CURRENT_TIMESTAMP)) ON CONFLICT(path) DO UPDATE SET contents = EXCLUDED.contents /* TODO: does not work in DuckDB , last_modified = (CURRENT_TIMESTAMP) */;

INSERT INTO "sqlpage_files" ("path", "contents", "last_modified") VALUES ('1115-waiver-screenings.sql', 'SELECT ''shell'' as component, ''QCS Orchestration Engine'' as title, ''book'' as icon, ''/'' as link, ''screenings'' as menu_item, ''sessions'' as menu_item, ''schema'' as menu_item;
    ;

SELECT ''table'' as component, ''true'' as search, ''true'' as sort, ''pat_mrn_id'' as markdown;

              SELECT format(''[%s](?pat_mrn_id=%s)'', pat_mrn_id, pat_mrn_id) as pat_mrn_id, facility, first_name, last_name
                FROM ahc_hrsn_12_12_2023_valid
            GROUP BY pat_mrn_id, facility, first_name, last_name
            ORDER BY facility, last_name, first_name;

SELECT ''text'' as component, (select format(''%s %s Answers'', first_name, last_name) from ahc_hrsn_12_12_2023_valid where pat_mrn_id = $pat_mrn_id) as title;
SELECT ''table'' as component, ''true'' as search, ''true'' as sort WHERE coalesce($pat_mrn_id, '''') <> '''';

            SELECT question, meas_value 
              FROM "ahc_hrsn_12_12_2023_valid"
             WHERE pat_mrn_id = $pat_mrn_id;

SELECT ''text'' as component, (select format(''%s %s FHIR Observations'', first_name, last_name) from ahc_hrsn_12_12_2023_valid where pat_mrn_id = $pat_mrn_id) as title;
SELECT ''table'' as component, ''true'' as search, ''true'' as sort WHERE $pat_mrn_id is not null;

            SELECT * 
              FROM "ahc_hrsn_12_12_2023_valid_fhir"
             WHERE pat_mrn_id = $pat_mrn_id;

    ', (CURRENT_TIMESTAMP)) ON CONFLICT(path) DO UPDATE SET contents = EXCLUDED.contents /* TODO: does not work in DuckDB , last_modified = (CURRENT_TIMESTAMP) */;

INSERT INTO "sqlpage_files" ("path", "contents", "last_modified") VALUES ('schema.sql', 'SELECT ''shell'' as component, ''QCS Orchestration Engine'' as title, ''book'' as icon, ''/'' as link, ''screenings'' as menu_item, ''sessions'' as menu_item, ''schema'' as menu_item;
    ;
SELECT ''text'' as component, ''Information Model (Schema) Documentation'' as title, ''TODO (description)'' as contents_md;

SELECT ''table'' as component, ''table_name'' as markdown;

          SELECT format(''[%s](?table_name=%s&table_nature)'', m.tbl_name, m.tbl_name, m.type) AS table_name,
                 (SELECT COUNT(*) FROM sqlite_master sm2 JOIN pragma_table_info(m.tbl_name) cc ON 1=1 WHERE sm2.tbl_name = m.tbl_name) AS columns_count,
                 m.type as nature
            FROM sqlite_master m
        ORDER BY table_name
      ;

SELECT ''text'' as component, ($table_name || '' '' || $table_nature || '' columns'' ) as title, ''TODO (lineage, governance, description, etc.)'' as contents_md WHERE coalesce($table_name, '''') <> '''';
SELECT ''table'' as component WHERE coalesce($table_name, '''') <> '''';

            SELECT
              ROW_NUMBER() OVER (PARTITION BY m.tbl_name ORDER BY c.cid) AS column_num,
              -- TODO: add governance information (e.g. description, etc. from SQLa)
              CASE WHEN c.pk THEN ''*'' ELSE '''' END AS is_primary_key,
              c.name AS column_name,
              c."type" AS column_type,
              CASE WHEN c."notnull" THEN ''*'' ELSE '''' END AS not_null,
              COALESCE(c.dflt_value, '''') AS default_value,
              COALESCE((SELECT pfkl."table" || ''.'' || pfkl."to" FROM pragma_foreign_key_list(m.tbl_name) AS pfkl WHERE pfkl."from" = c.name), '''') as fk_refs
              -- TODO: add "is_indexed" and other details
            FROM sqlite_master m JOIN pragma_table_info(m.tbl_name) c ON 1=1
            WHERE m.tbl_name = $table_name;

SELECT ''text'' as component, ($table_name || '' indexes'') as title;
SELECT ''table'' as component WHERE coalesce($table_name, '''') <> '''';

            SELECT il.name as "Index Name", group_concat(ii.name, '', '') as columns
              FROM sqlite_master as m, pragma_index_list(m.name) AS il, pragma_index_info(il.name) AS ii
             WHERE m.tbl_name = $table_name
             GROUP BY m.name, il.name;

-- TODO: add PlantUML or Mermaid ERD through SQL as emitted by tbls (use ChatGPT to create)
    ;
    ', (CURRENT_TIMESTAMP)) ON CONFLICT(path) DO UPDATE SET contents = EXCLUDED.contents /* TODO: does not work in DuckDB , last_modified = (CURRENT_TIMESTAMP) */;
        
        -- emit all the execution diagnostics
        INSERT INTO "orch_session_exec" ("orch_session_exec_id", "exec_nature", "session_id", "session_entry_id", "parent_exec_id", "namespace", "exec_identity", "exec_code", "exec_status", "input_text", "exec_error_text", "output_text", "output_nature", "narrative_md", "elaboration") VALUES ('168a34c7-d043-5ec4-a84a-c961f1a301ef', 'duckdb', '05e8feaa-0bed-5909-a817-39812494b361', NULL, NULL, NULL, 'init', 'duckdb support/assurance/ahc-hrsn-elt/screening/results-test-e2e/ingestion-center.duckdb', 0, '-- preambleSQL
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
INSERT INTO "device" ("device_id", "name", "state", "boundary", "segmentation", "state_sysinfo", "elaboration") VALUES (''05269d28-15ae-5bd6-bd88-f949ccfa52d7'', ''Titan'', ''SINGLETON'', ''UNKNOWN'', NULL, ''{"os-arch":"x64","os-platform":"linux"}'', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "orch_session" ("orch_session_id", "device_id", "orch_started_at", "orch_finished_at", "elaboration") VALUES (''05e8feaa-0bed-5909-a817-39812494b361'', ''05269d28-15ae-5bd6-bd88-f949ccfa52d7'', NULL, NULL, NULL);

-- no after-init SQL found', NULL, NULL, NULL, '```sql
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
INSERT INTO "device" ("device_id", "name", "state", "boundary", "segmentation", "state_sysinfo", "elaboration") VALUES (''05269d28-15ae-5bd6-bd88-f949ccfa52d7'', ''Titan'', ''SINGLETON'', ''UNKNOWN'', NULL, ''{"os-arch":"x64","os-platform":"linux"}'', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "orch_session" ("orch_session_id", "device_id", "orch_started_at", "orch_finished_at", "elaboration") VALUES (''05e8feaa-0bed-5909-a817-39812494b361'', ''05269d28-15ae-5bd6-bd88-f949ccfa52d7'', NULL, NULL, NULL);

-- no after-init SQL found
```
', NULL);
        INSERT INTO "orch_session_exec" ("orch_session_exec_id", "exec_nature", "session_id", "session_entry_id", "parent_exec_id", "namespace", "exec_identity", "exec_code", "exec_status", "input_text", "exec_error_text", "output_text", "output_nature", "narrative_md", "elaboration") VALUES ('591191c7-f693-5957-8734-ac87151ca981', 'duckdb', '05e8feaa-0bed-5909-a817-39812494b361', NULL, NULL, NULL, 'ingest', 'duckdb support/assurance/ahc-hrsn-elt/screening/results-test-e2e/ingestion-center.duckdb --json', 0, '-- preambleSQL
SET autoinstall_known_extensions=true;
SET autoload_known_extensions=true;
-- end preambleSQL
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx (ERROR)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES (''8b7c669c-1795-5f6b-8f3a-3e502b74c628'', ''05e8feaa-0bed-5909-a817-39812494b361'', ''support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx'', ''ERROR'', NULL);
INSERT INTO "orch_session_issue" ("orch_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES (''7b979b68-7227-53fd-b689-e4fe153afb76'', ''05e8feaa-0bed-5909-a817-39812494b361'', ''8b7c669c-1795-5f6b-8f3a-3e502b74c628'', ''Sheet Missing'', ''Excel workbook sheet ''''Admin_Demographic'''' not found in ''''synthetic-fail-excel-01.xlsx'''' (available: Sheet1)'', NULL, NULL, ''support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx'', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx (ERROR)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES (''abf5c680-a135-5d89-b871-fa5b9b99aed6'', ''05e8feaa-0bed-5909-a817-39812494b361'', ''support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx'', ''ERROR'', NULL);
INSERT INTO "orch_session_issue" ("orch_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES (''641dff51-97fd-56b3-8443-c1ed568a6d66'', ''05e8feaa-0bed-5909-a817-39812494b361'', ''abf5c680-a135-5d89-b871-fa5b9b99aed6'', ''Sheet Missing'', ''Excel workbook sheet ''''Screening'''' not found in ''''synthetic-fail-excel-01.xlsx'''' (available: Sheet1)'', NULL, NULL, ''support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx'', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx (ERROR)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES (''d70a4700-6b40-52fc-a7a2-69ef0d7f69ff'', ''05e8feaa-0bed-5909-a817-39812494b361'', ''support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx'', ''ERROR'', NULL);
INSERT INTO "orch_session_issue" ("orch_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES (''47277588-99e8-59f5-8384-b24344a86073'', ''05e8feaa-0bed-5909-a817-39812494b361'', ''d70a4700-6b40-52fc-a7a2-69ef0d7f69ff'', ''Sheet Missing'', ''Excel workbook sheet ''''QE_Admin_Data'''' not found in ''''synthetic-fail-excel-01.xlsx'''' (available: Sheet1)'', NULL, NULL, ''support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx'', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx (ahc_hrsn_valid_01_admin_demographic)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES (''58b22e99-5854-53bf-adbe-08e67df99b85'', ''05e8feaa-0bed-5909-a817-39812494b361'', ''support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx'', ''ahc_hrsn_valid_01_admin_demographic'', NULL);
        
INSERT INTO "orch_session_issue" ("orch_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES (''a26ce332-3ced-5623-861d-23a2ef78e4a9'', ''05e8feaa-0bed-5909-a817-39812494b361'', ''58b22e99-5854-53bf-adbe-08e67df99b85'', ''TODO'', ''Excel workbook ''''ahc-hrsn-valid-01.xlsx'''' sheet ''''Admin_Demographic'''' has not been implemented yet.'', NULL, NULL, ''support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx'', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx (ahc_hrsn_valid_01_screening)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES (''bc0c03b5-d1ba-5301-850f-5e4c42c1bf09'', ''05e8feaa-0bed-5909-a817-39812494b361'', ''support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx'', ''ahc_hrsn_valid_01_screening'', NULL);
     
-- ingest Excel workbook sheet ''Screening'' into ahc_hrsn_valid_01_screening using spatial plugin
INSTALL spatial; LOAD spatial;

-- be sure to add src_file_row_number and session_id columns to each row
-- because assurance CTEs require them
CREATE TABLE ahc_hrsn_valid_01_screening AS
  SELECT *, row_number() OVER () as src_file_row_number, ''05e8feaa-0bed-5909-a817-39812494b361'' as session_id, ''bc0c03b5-d1ba-5301-850f-5e4c42c1bf09'' as session_entry_id
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
           ''bc0c03b5-d1ba-5301-850f-5e4c42c1bf09'',
           ''Missing Column'',
           ''Required column '' || column_name || '' is missing in ahc_hrsn_valid_01_screening.'',
           ''Ensure ahc_hrsn_valid_01_screening contains the column "'' || column_name || ''"''
      FROM required_column_names_in_src;
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx (ahc_hrsn_valid_01_q_e_admin_data)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES (''ae477ba1-c7f1-5f34-847a-50bddb7130aa'', ''05e8feaa-0bed-5909-a817-39812494b361'', ''support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx'', ''ahc_hrsn_valid_01_q_e_admin_data'', NULL);
        
INSERT INTO "orch_session_issue" ("orch_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES (''8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839'', ''05e8feaa-0bed-5909-a817-39812494b361'', ''ae477ba1-c7f1-5f34-847a-50bddb7130aa'', ''TODO'', ''Excel workbook ''''ahc-hrsn-valid-01.xlsx'''' sheet ''''QE_Admin_Data'''' has not been implemented yet.'', NULL, NULL, ''support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx'', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail.csv (synthetic_fail)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES (''b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0'', ''05e8feaa-0bed-5909-a817-39812494b361'', ''support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail.csv'', ''synthetic_fail'', NULL);

-- be sure to add src_file_row_number and session_id columns to each row
-- because assurance CTEs require them
CREATE TABLE synthetic_fail AS
  SELECT *, row_number() OVER () as src_file_row_number, ''05e8feaa-0bed-5909-a817-39812494b361'' as session_id, ''b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0'' as session_entry_id
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
           ''b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0'',
           ''Missing Column'',
           ''Required column '' || column_name || '' is missing in synthetic_fail.'',
           ''Ensure synthetic_fail contains the column "'' || column_name || ''"''
      FROM required_column_names_in_src;
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-12-12-2023-valid.csv (ahc_hrsn_12_12_2023_valid)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES (''7ef8bdeb-fd56-5eb9-a09b-ef15ce18dc49'', ''05e8feaa-0bed-5909-a817-39812494b361'', ''support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-12-12-2023-valid.csv'', ''ahc_hrsn_12_12_2023_valid'', NULL);

-- be sure to add src_file_row_number and session_id columns to each row
-- because assurance CTEs require them
CREATE TABLE ahc_hrsn_12_12_2023_valid AS
  SELECT *, row_number() OVER () as src_file_row_number, ''05e8feaa-0bed-5909-a817-39812494b361'' as session_id, ''7ef8bdeb-fd56-5eb9-a09b-ef15ce18dc49'' as session_entry_id
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
           ''7ef8bdeb-fd56-5eb9-a09b-ef15ce18dc49'',
           ''Missing Column'',
           ''Required column '' || column_name || '' is missing in ahc_hrsn_12_12_2023_valid.'',
           ''Ensure ahc_hrsn_12_12_2023_valid contains the column "'' || column_name || ''"''
      FROM required_column_names_in_src;
SELECT session_entry_id, orch_session_issue_id, issue_type, issue_message, invalid_value FROM orch_session_issue WHERE session_id = ''05e8feaa-0bed-5909-a817-39812494b361''', NULL, '[{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"7b979b68-7227-53fd-b689-e4fe153afb76","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet ''Admin_Demographic'' not found in ''synthetic-fail-excel-01.xlsx'' (available: Sheet1)","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx"},
{"session_entry_id":"abf5c680-a135-5d89-b871-fa5b9b99aed6","orch_session_issue_id":"641dff51-97fd-56b3-8443-c1ed568a6d66","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet ''Screening'' not found in ''synthetic-fail-excel-01.xlsx'' (available: Sheet1)","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx"},
{"session_entry_id":"d70a4700-6b40-52fc-a7a2-69ef0d7f69ff","orch_session_issue_id":"47277588-99e8-59f5-8384-b24344a86073","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet ''QE_Admin_Data'' not found in ''synthetic-fail-excel-01.xlsx'' (available: Sheet1)","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx"},
{"session_entry_id":"58b22e99-5854-53bf-adbe-08e67df99b85","orch_session_issue_id":"a26ce332-3ced-5623-861d-23a2ef78e4a9","issue_type":"TODO","issue_message":"Excel workbook ''ahc-hrsn-valid-01.xlsx'' sheet ''Admin_Demographic'' has not been implemented yet.","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx"},
{"session_entry_id":"bc0c03b5-d1ba-5301-850f-5e4c42c1bf09","orch_session_issue_id":"1c249b90-02ed-42e3-bc80-8bebe0b3f63b","issue_type":"Missing Column","issue_message":"Required column FACILITY is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"bc0c03b5-d1ba-5301-850f-5e4c42c1bf09","orch_session_issue_id":"41d3ee39-c1a6-4232-9e19-3c397bc28e67","issue_type":"Missing Column","issue_message":"Required column FIRST_NAME is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"bc0c03b5-d1ba-5301-850f-5e4c42c1bf09","orch_session_issue_id":"65619ffc-d9fe-4b65-83d5-ef481cef90d2","issue_type":"Missing Column","issue_message":"Required column LAST_NAME is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"bc0c03b5-d1ba-5301-850f-5e4c42c1bf09","orch_session_issue_id":"c5290207-8a38-422a-828a-ae6f20805f6c","issue_type":"Missing Column","issue_message":"Required column PAT_BIRTH_DATE is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"bc0c03b5-d1ba-5301-850f-5e4c42c1bf09","orch_session_issue_id":"740b7b5d-db7c-461f-8980-59e870a14963","issue_type":"Missing Column","issue_message":"Required column MEDICAID_CIN is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"bc0c03b5-d1ba-5301-850f-5e4c42c1bf09","orch_session_issue_id":"130d8033-1979-4035-a8ca-828d9d071b1f","issue_type":"Missing Column","issue_message":"Required column ENCOUNTER_ID is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"bc0c03b5-d1ba-5301-850f-5e4c42c1bf09","orch_session_issue_id":"42705ffe-03a5-4409-a55a-29eb3faa6365","issue_type":"Missing Column","issue_message":"Required column SURVEY is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"bc0c03b5-d1ba-5301-850f-5e4c42c1bf09","orch_session_issue_id":"904da14c-df53-4397-82b2-edd4155d5d7a","issue_type":"Missing Column","issue_message":"Required column SURVEY_ID is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"bc0c03b5-d1ba-5301-850f-5e4c42c1bf09","orch_session_issue_id":"d82c4a03-df84-4d87-958c-9b54baddeb2c","issue_type":"Missing Column","issue_message":"Required column NEED_INDICATED is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"bc0c03b5-d1ba-5301-850f-5e4c42c1bf09","orch_session_issue_id":"5fb4f10b-717a-4aa7-a937-a554d4e2b6f1","issue_type":"Missing Column","issue_message":"Required column VISIT_PART_2_FLAG is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"bc0c03b5-d1ba-5301-850f-5e4c42c1bf09","orch_session_issue_id":"7bddee20-67e2-4c3d-9d3b-adc300497d57","issue_type":"Missing Column","issue_message":"Required column VISIT_OMH_FLAG is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"bc0c03b5-d1ba-5301-850f-5e4c42c1bf09","orch_session_issue_id":"b300f309-cb97-4c1e-9046-42c65feaed8b","issue_type":"Missing Column","issue_message":"Required column VISIT_OPWDD_FLAG is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"ae477ba1-c7f1-5f34-847a-50bddb7130aa","orch_session_issue_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","issue_type":"TODO","issue_message":"Excel workbook ''ahc-hrsn-valid-01.xlsx'' sheet ''QE_Admin_Data'' has not been implemented yet.","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx"},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"39ad14b9-3de2-4dea-9075-8182a9f7be7e","issue_type":"Missing Column","issue_message":"Required column PAT_MRN_ID is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"b4d9c654-79c0-474e-8077-88549890405c","issue_type":"Missing Column","issue_message":"Required column FACILITY is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"4b81795d-4e50-4f8b-b9d4-1d879522eef0","issue_type":"Missing Column","issue_message":"Required column FIRST_NAME is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"17063d26-909d-4cf6-9063-d6a1e0dda382","issue_type":"Missing Column","issue_message":"Required column LAST_NAME is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"2531d9ad-1bf1-4987-bedd-04baa40f9246","issue_type":"Missing Column","issue_message":"Required column PAT_BIRTH_DATE is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"51438f74-bab0-40d2-9810-83c888938960","issue_type":"Missing Column","issue_message":"Required column MEDICAID_CIN is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"c1be0df4-8755-4667-8766-3aa8f61737a5","issue_type":"Missing Column","issue_message":"Required column ENCOUNTER_ID is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"6b54595c-8fc5-493c-bac5-078956ac90e3","issue_type":"Missing Column","issue_message":"Required column SURVEY is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"fa0cc4d3-ea6d-4b2b-b507-48f1c541c42b","issue_type":"Missing Column","issue_message":"Required column SURVEY_ID is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"76434d6d-fb85-401c-9383-9a6c18fa2c48","issue_type":"Missing Column","issue_message":"Required column RECORDED_TIME is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"d2702766-09b6-4fed-8a0c-62be3bf50fef","issue_type":"Missing Column","issue_message":"Required column QUESTION is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"0f710509-bb46-4f6b-a48e-4a508a8c3fea","issue_type":"Missing Column","issue_message":"Required column MEAS_VALUE is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"439bf9e2-d6c0-41ad-a18b-fcd4590aafa9","issue_type":"Missing Column","issue_message":"Required column QUESTION_CODE is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"c9b61112-d008-40bb-8ef0-51a1a60793fc","issue_type":"Missing Column","issue_message":"Required column QUESTION_CODE_SYSTEM_NAME is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"0f830419-702b-46ce-902f-f8ce101713a0","issue_type":"Missing Column","issue_message":"Required column ANSWER_CODE is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"cfde60f3-6ef4-4fe2-877d-8b34778687a4","issue_type":"Missing Column","issue_message":"Required column ANSWER_CODE_SYSTEM_NAME is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"07168f2d-4495-48f0-98c1-01c3e1ebaab0","issue_type":"Missing Column","issue_message":"Required column SDOH_DOMAIN is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"70c74ded-5d86-468d-a3db-218adaa673c3","issue_type":"Missing Column","issue_message":"Required column NEED_INDICATED is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"98ee1b1f-4b3d-405a-8cd2-db5df12212bf","issue_type":"Missing Column","issue_message":"Required column VISIT_PART_2_FLAG is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"576d7063-64a0-42a4-ac5f-83110f349002","issue_type":"Missing Column","issue_message":"Required column VISIT_OMH_FLAG is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"1558afa6-3b96-4263-ba04-9585fba3091b","issue_type":"Missing Column","issue_message":"Required column VISIT_OPWDD_FLAG is missing in synthetic_fail.","invalid_value":null}]
', 'JSON', '```sql
-- preambleSQL
SET autoinstall_known_extensions=true;
SET autoload_known_extensions=true;
-- end preambleSQL
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx (ERROR)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES (''8b7c669c-1795-5f6b-8f3a-3e502b74c628'', ''05e8feaa-0bed-5909-a817-39812494b361'', ''support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx'', ''ERROR'', NULL);
INSERT INTO "orch_session_issue" ("orch_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES (''7b979b68-7227-53fd-b689-e4fe153afb76'', ''05e8feaa-0bed-5909-a817-39812494b361'', ''8b7c669c-1795-5f6b-8f3a-3e502b74c628'', ''Sheet Missing'', ''Excel workbook sheet ''''Admin_Demographic'''' not found in ''''synthetic-fail-excel-01.xlsx'''' (available: Sheet1)'', NULL, NULL, ''support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx'', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx (ERROR)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES (''abf5c680-a135-5d89-b871-fa5b9b99aed6'', ''05e8feaa-0bed-5909-a817-39812494b361'', ''support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx'', ''ERROR'', NULL);
INSERT INTO "orch_session_issue" ("orch_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES (''641dff51-97fd-56b3-8443-c1ed568a6d66'', ''05e8feaa-0bed-5909-a817-39812494b361'', ''abf5c680-a135-5d89-b871-fa5b9b99aed6'', ''Sheet Missing'', ''Excel workbook sheet ''''Screening'''' not found in ''''synthetic-fail-excel-01.xlsx'''' (available: Sheet1)'', NULL, NULL, ''support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx'', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx (ERROR)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES (''d70a4700-6b40-52fc-a7a2-69ef0d7f69ff'', ''05e8feaa-0bed-5909-a817-39812494b361'', ''support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx'', ''ERROR'', NULL);
INSERT INTO "orch_session_issue" ("orch_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES (''47277588-99e8-59f5-8384-b24344a86073'', ''05e8feaa-0bed-5909-a817-39812494b361'', ''d70a4700-6b40-52fc-a7a2-69ef0d7f69ff'', ''Sheet Missing'', ''Excel workbook sheet ''''QE_Admin_Data'''' not found in ''''synthetic-fail-excel-01.xlsx'''' (available: Sheet1)'', NULL, NULL, ''support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx'', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx (ahc_hrsn_valid_01_admin_demographic)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES (''58b22e99-5854-53bf-adbe-08e67df99b85'', ''05e8feaa-0bed-5909-a817-39812494b361'', ''support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx'', ''ahc_hrsn_valid_01_admin_demographic'', NULL);
        
INSERT INTO "orch_session_issue" ("orch_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES (''a26ce332-3ced-5623-861d-23a2ef78e4a9'', ''05e8feaa-0bed-5909-a817-39812494b361'', ''58b22e99-5854-53bf-adbe-08e67df99b85'', ''TODO'', ''Excel workbook ''''ahc-hrsn-valid-01.xlsx'''' sheet ''''Admin_Demographic'''' has not been implemented yet.'', NULL, NULL, ''support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx'', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx (ahc_hrsn_valid_01_screening)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES (''bc0c03b5-d1ba-5301-850f-5e4c42c1bf09'', ''05e8feaa-0bed-5909-a817-39812494b361'', ''support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx'', ''ahc_hrsn_valid_01_screening'', NULL);
     
-- ingest Excel workbook sheet ''Screening'' into ahc_hrsn_valid_01_screening using spatial plugin
INSTALL spatial; LOAD spatial;

-- be sure to add src_file_row_number and session_id columns to each row
-- because assurance CTEs require them
CREATE TABLE ahc_hrsn_valid_01_screening AS
  SELECT *, row_number() OVER () as src_file_row_number, ''05e8feaa-0bed-5909-a817-39812494b361'' as session_id, ''bc0c03b5-d1ba-5301-850f-5e4c42c1bf09'' as session_entry_id
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
           ''bc0c03b5-d1ba-5301-850f-5e4c42c1bf09'',
           ''Missing Column'',
           ''Required column '' || column_name || '' is missing in ahc_hrsn_valid_01_screening.'',
           ''Ensure ahc_hrsn_valid_01_screening contains the column "'' || column_name || ''"''
      FROM required_column_names_in_src;
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx (ahc_hrsn_valid_01_q_e_admin_data)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES (''ae477ba1-c7f1-5f34-847a-50bddb7130aa'', ''05e8feaa-0bed-5909-a817-39812494b361'', ''support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx'', ''ahc_hrsn_valid_01_q_e_admin_data'', NULL);
        
INSERT INTO "orch_session_issue" ("orch_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES (''8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839'', ''05e8feaa-0bed-5909-a817-39812494b361'', ''ae477ba1-c7f1-5f34-847a-50bddb7130aa'', ''TODO'', ''Excel workbook ''''ahc-hrsn-valid-01.xlsx'''' sheet ''''QE_Admin_Data'''' has not been implemented yet.'', NULL, NULL, ''support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx'', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail.csv (synthetic_fail)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES (''b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0'', ''05e8feaa-0bed-5909-a817-39812494b361'', ''support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail.csv'', ''synthetic_fail'', NULL);

-- be sure to add src_file_row_number and session_id columns to each row
-- because assurance CTEs require them
CREATE TABLE synthetic_fail AS
  SELECT *, row_number() OVER () as src_file_row_number, ''05e8feaa-0bed-5909-a817-39812494b361'' as session_id, ''b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0'' as session_entry_id
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
           ''b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0'',
           ''Missing Column'',
           ''Required column '' || column_name || '' is missing in synthetic_fail.'',
           ''Ensure synthetic_fail contains the column "'' || column_name || ''"''
      FROM required_column_names_in_src;
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-12-12-2023-valid.csv (ahc_hrsn_12_12_2023_valid)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES (''7ef8bdeb-fd56-5eb9-a09b-ef15ce18dc49'', ''05e8feaa-0bed-5909-a817-39812494b361'', ''support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-12-12-2023-valid.csv'', ''ahc_hrsn_12_12_2023_valid'', NULL);

-- be sure to add src_file_row_number and session_id columns to each row
-- because assurance CTEs require them
CREATE TABLE ahc_hrsn_12_12_2023_valid AS
  SELECT *, row_number() OVER () as src_file_row_number, ''05e8feaa-0bed-5909-a817-39812494b361'' as session_id, ''7ef8bdeb-fd56-5eb9-a09b-ef15ce18dc49'' as session_entry_id
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
           ''7ef8bdeb-fd56-5eb9-a09b-ef15ce18dc49'',
           ''Missing Column'',
           ''Required column '' || column_name || '' is missing in ahc_hrsn_12_12_2023_valid.'',
           ''Ensure ahc_hrsn_12_12_2023_valid contains the column "'' || column_name || ''"''
      FROM required_column_names_in_src;
SELECT session_entry_id, orch_session_issue_id, issue_type, issue_message, invalid_value FROM orch_session_issue WHERE session_id = ''05e8feaa-0bed-5909-a817-39812494b361''
```

### stdout
```sh
[{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"7b979b68-7227-53fd-b689-e4fe153afb76","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet ''Admin_Demographic'' not found in ''synthetic-fail-excel-01.xlsx'' (available: Sheet1)","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx"},
{"session_entry_id":"abf5c680-a135-5d89-b871-fa5b9b99aed6","orch_session_issue_id":"641dff51-97fd-56b3-8443-c1ed568a6d66","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet ''Screening'' not found in ''synthetic-fail-excel-01.xlsx'' (available: Sheet1)","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx"},
{"session_entry_id":"d70a4700-6b40-52fc-a7a2-69ef0d7f69ff","orch_session_issue_id":"47277588-99e8-59f5-8384-b24344a86073","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet ''QE_Admin_Data'' not found in ''synthetic-fail-excel-01.xlsx'' (available: Sheet1)","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx"},
{"session_entry_id":"58b22e99-5854-53bf-adbe-08e67df99b85","orch_session_issue_id":"a26ce332-3ced-5623-861d-23a2ef78e4a9","issue_type":"TODO","issue_message":"Excel workbook ''ahc-hrsn-valid-01.xlsx'' sheet ''Admin_Demographic'' has not been implemented yet.","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx"},
{"session_entry_id":"bc0c03b5-d1ba-5301-850f-5e4c42c1bf09","orch_session_issue_id":"1c249b90-02ed-42e3-bc80-8bebe0b3f63b","issue_type":"Missing Column","issue_message":"Required column FACILITY is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"bc0c03b5-d1ba-5301-850f-5e4c42c1bf09","orch_session_issue_id":"41d3ee39-c1a6-4232-9e19-3c397bc28e67","issue_type":"Missing Column","issue_message":"Required column FIRST_NAME is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"bc0c03b5-d1ba-5301-850f-5e4c42c1bf09","orch_session_issue_id":"65619ffc-d9fe-4b65-83d5-ef481cef90d2","issue_type":"Missing Column","issue_message":"Required column LAST_NAME is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"bc0c03b5-d1ba-5301-850f-5e4c42c1bf09","orch_session_issue_id":"c5290207-8a38-422a-828a-ae6f20805f6c","issue_type":"Missing Column","issue_message":"Required column PAT_BIRTH_DATE is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"bc0c03b5-d1ba-5301-850f-5e4c42c1bf09","orch_session_issue_id":"740b7b5d-db7c-461f-8980-59e870a14963","issue_type":"Missing Column","issue_message":"Required column MEDICAID_CIN is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"bc0c03b5-d1ba-5301-850f-5e4c42c1bf09","orch_session_issue_id":"130d8033-1979-4035-a8ca-828d9d071b1f","issue_type":"Missing Column","issue_message":"Required column ENCOUNTER_ID is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"bc0c03b5-d1ba-5301-850f-5e4c42c1bf09","orch_session_issue_id":"42705ffe-03a5-4409-a55a-29eb3faa6365","issue_type":"Missing Column","issue_message":"Required column SURVEY is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"bc0c03b5-d1ba-5301-850f-5e4c42c1bf09","orch_session_issue_id":"904da14c-df53-4397-82b2-edd4155d5d7a","issue_type":"Missing Column","issue_message":"Required column SURVEY_ID is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"bc0c03b5-d1ba-5301-850f-5e4c42c1bf09","orch_session_issue_id":"d82c4a03-df84-4d87-958c-9b54baddeb2c","issue_type":"Missing Column","issue_message":"Required column NEED_INDICATED is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"bc0c03b5-d1ba-5301-850f-5e4c42c1bf09","orch_session_issue_id":"5fb4f10b-717a-4aa7-a937-a554d4e2b6f1","issue_type":"Missing Column","issue_message":"Required column VISIT_PART_2_FLAG is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"bc0c03b5-d1ba-5301-850f-5e4c42c1bf09","orch_session_issue_id":"7bddee20-67e2-4c3d-9d3b-adc300497d57","issue_type":"Missing Column","issue_message":"Required column VISIT_OMH_FLAG is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"bc0c03b5-d1ba-5301-850f-5e4c42c1bf09","orch_session_issue_id":"b300f309-cb97-4c1e-9046-42c65feaed8b","issue_type":"Missing Column","issue_message":"Required column VISIT_OPWDD_FLAG is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"ae477ba1-c7f1-5f34-847a-50bddb7130aa","orch_session_issue_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","issue_type":"TODO","issue_message":"Excel workbook ''ahc-hrsn-valid-01.xlsx'' sheet ''QE_Admin_Data'' has not been implemented yet.","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx"},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"39ad14b9-3de2-4dea-9075-8182a9f7be7e","issue_type":"Missing Column","issue_message":"Required column PAT_MRN_ID is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"b4d9c654-79c0-474e-8077-88549890405c","issue_type":"Missing Column","issue_message":"Required column FACILITY is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"4b81795d-4e50-4f8b-b9d4-1d879522eef0","issue_type":"Missing Column","issue_message":"Required column FIRST_NAME is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"17063d26-909d-4cf6-9063-d6a1e0dda382","issue_type":"Missing Column","issue_message":"Required column LAST_NAME is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"2531d9ad-1bf1-4987-bedd-04baa40f9246","issue_type":"Missing Column","issue_message":"Required column PAT_BIRTH_DATE is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"51438f74-bab0-40d2-9810-83c888938960","issue_type":"Missing Column","issue_message":"Required column MEDICAID_CIN is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"c1be0df4-8755-4667-8766-3aa8f61737a5","issue_type":"Missing Column","issue_message":"Required column ENCOUNTER_ID is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"6b54595c-8fc5-493c-bac5-078956ac90e3","issue_type":"Missing Column","issue_message":"Required column SURVEY is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"fa0cc4d3-ea6d-4b2b-b507-48f1c541c42b","issue_type":"Missing Column","issue_message":"Required column SURVEY_ID is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"76434d6d-fb85-401c-9383-9a6c18fa2c48","issue_type":"Missing Column","issue_message":"Required column RECORDED_TIME is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"d2702766-09b6-4fed-8a0c-62be3bf50fef","issue_type":"Missing Column","issue_message":"Required column QUESTION is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"0f710509-bb46-4f6b-a48e-4a508a8c3fea","issue_type":"Missing Column","issue_message":"Required column MEAS_VALUE is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"439bf9e2-d6c0-41ad-a18b-fcd4590aafa9","issue_type":"Missing Column","issue_message":"Required column QUESTION_CODE is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"c9b61112-d008-40bb-8ef0-51a1a60793fc","issue_type":"Missing Column","issue_message":"Required column QUESTION_CODE_SYSTEM_NAME is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"0f830419-702b-46ce-902f-f8ce101713a0","issue_type":"Missing Column","issue_message":"Required column ANSWER_CODE is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"cfde60f3-6ef4-4fe2-877d-8b34778687a4","issue_type":"Missing Column","issue_message":"Required column ANSWER_CODE_SYSTEM_NAME is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"07168f2d-4495-48f0-98c1-01c3e1ebaab0","issue_type":"Missing Column","issue_message":"Required column SDOH_DOMAIN is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"70c74ded-5d86-468d-a3db-218adaa673c3","issue_type":"Missing Column","issue_message":"Required column NEED_INDICATED is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"98ee1b1f-4b3d-405a-8cd2-db5df12212bf","issue_type":"Missing Column","issue_message":"Required column VISIT_PART_2_FLAG is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"576d7063-64a0-42a4-ac5f-83110f349002","issue_type":"Missing Column","issue_message":"Required column VISIT_OMH_FLAG is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"1558afa6-3b96-4263-ba04-9585fba3091b","issue_type":"Missing Column","issue_message":"Required column VISIT_OPWDD_FLAG is missing in synthetic_fail.","invalid_value":null}]

```', NULL);
        INSERT INTO "orch_session_exec" ("orch_session_exec_id", "exec_nature", "session_id", "session_entry_id", "parent_exec_id", "namespace", "exec_identity", "exec_code", "exec_status", "input_text", "exec_error_text", "output_text", "output_nature", "narrative_md", "elaboration") VALUES ('071f8fe1-4899-5c71-9c86-7d7377661d45', 'duckdb', '05e8feaa-0bed-5909-a817-39812494b361', NULL, NULL, NULL, 'ensureContent', 'duckdb support/assurance/ahc-hrsn-elt/screening/results-test-e2e/ingestion-center.duckdb', 0, '-- preambleSQL
SET autoinstall_known_extensions=true;
SET autoload_known_extensions=true;
-- end preambleSQL
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
           ''7ef8bdeb-fd56-5eb9-a09b-ef15ce18dc49'',
           ''Data Type Mismatch'',
           issue_row,
           issue_column,
           invalid_value,
           ''Non-integer value "'' || invalid_value || ''" found in '' || issue_column,
           ''Convert non-integer values to INTEGER''
      FROM numeric_value_in_all_rows;', NULL, NULL, NULL, '```sql
-- preambleSQL
SET autoinstall_known_extensions=true;
SET autoload_known_extensions=true;
-- end preambleSQL
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
           ''7ef8bdeb-fd56-5eb9-a09b-ef15ce18dc49'',
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
