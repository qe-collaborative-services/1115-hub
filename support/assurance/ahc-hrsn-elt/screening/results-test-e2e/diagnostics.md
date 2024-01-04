---
walkRootPaths:
  - support/assurance/ahc-hrsn-elt/screening/synthetic-content
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
# Ingest Diagnostics

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
CREATE TABLE IF NOT EXISTS "ingest_session" (
    "ingest_session_id" TEXT PRIMARY KEY NOT NULL,
    "device_id" TEXT NOT NULL,
    "ingest_started_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "ingest_finished_at" TIMESTAMPTZ,
    "elaboration" TEXT,
    FOREIGN KEY("device_id") REFERENCES "device"("device_id")
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
CREATE INDEX IF NOT EXISTS "idx_device__name__state" ON "device"("name", "state");

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

-- register the current device and session and use the identifiers for all logging
INSERT INTO "device" ("device_id", "name", "state", "boundary", "segmentation", "state_sysinfo", "elaboration") VALUES ('05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'Titan', 'SINGLETON', 'UNKNOWN', NULL, '{"os-arch":"x64","os-platform":"linux"}', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "ingest_session" ("ingest_session_id", "device_id", "ingest_started_at", "ingest_finished_at", "elaboration") VALUES ('05e8feaa-0bed-5909-a817-39812494b361', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', NULL, NULL, NULL);

-- no after-init SQL found
```


## ingest
```sql
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx (ERROR)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "ingest_session_entry" ("ingest_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('1931dfcc-e8fc-597d-b1bc-65b4287e6fdf', '05e8feaa-0bed-5909-a817-39812494b361', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx', 'ERROR', NULL);
INSERT INTO "ingest_session_issue" ("ingest_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('8b7c669c-1795-5f6b-8f3a-3e502b74c628', '05e8feaa-0bed-5909-a817-39812494b361', '1931dfcc-e8fc-597d-b1bc-65b4287e6fdf', 'Sheet Missing', 'Excel workbook sheet ''Admin_Demographic'' not found in ''synthetic-fail-excel-01.xlsx'' (available: Sheet1)', NULL, NULL, 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx (ERROR)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "ingest_session_entry" ("ingest_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('7b979b68-7227-53fd-b689-e4fe153afb76', '05e8feaa-0bed-5909-a817-39812494b361', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx', 'ERROR', NULL);
INSERT INTO "ingest_session_issue" ("ingest_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('abf5c680-a135-5d89-b871-fa5b9b99aed6', '05e8feaa-0bed-5909-a817-39812494b361', '7b979b68-7227-53fd-b689-e4fe153afb76', 'Sheet Missing', 'Excel workbook sheet ''Screening'' not found in ''synthetic-fail-excel-01.xlsx'' (available: Sheet1)', NULL, NULL, 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx (ERROR)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "ingest_session_entry" ("ingest_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('641dff51-97fd-56b3-8443-c1ed568a6d66', '05e8feaa-0bed-5909-a817-39812494b361', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx', 'ERROR', NULL);
INSERT INTO "ingest_session_issue" ("ingest_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('d70a4700-6b40-52fc-a7a2-69ef0d7f69ff', '05e8feaa-0bed-5909-a817-39812494b361', '641dff51-97fd-56b3-8443-c1ed568a6d66', 'Sheet Missing', 'Excel workbook sheet ''QE_Admin_Data'' not found in ''synthetic-fail-excel-01.xlsx'' (available: Sheet1)', NULL, NULL, 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx (ahc_hrsn_valid_01_admin_demographic)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "ingest_session_entry" ("ingest_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('47277588-99e8-59f5-8384-b24344a86073', '05e8feaa-0bed-5909-a817-39812494b361', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx', 'ahc_hrsn_valid_01_admin_demographic', NULL);
        
INSERT INTO "ingest_session_issue" ("ingest_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('58b22e99-5854-53bf-adbe-08e67df99b85', '05e8feaa-0bed-5909-a817-39812494b361', '47277588-99e8-59f5-8384-b24344a86073', 'TODO', 'Excel workbook ''ahc-hrsn-valid-01.xlsx'' sheet ''Admin_Demographic'' has not been implemented yet.', NULL, NULL, 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx (ahc_hrsn_valid_01_screening)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "ingest_session_entry" ("ingest_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('a26ce332-3ced-5623-861d-23a2ef78e4a9', '05e8feaa-0bed-5909-a817-39812494b361', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx', 'ahc_hrsn_valid_01_screening', NULL);
     
-- ingest Excel workbook sheet 'Screening' into ahc_hrsn_valid_01_screening using spatial plugin
INSTALL spatial; LOAD spatial;

-- be sure to add src_file_row_number and session_id columns to each row
-- because assurance CTEs require them
CREATE TABLE ahc_hrsn_valid_01_screening AS
  SELECT *, row_number() OVER () as src_file_row_number, '05e8feaa-0bed-5909-a817-39812494b361' as session_id, 'a26ce332-3ced-5623-861d-23a2ef78e4a9' as session_entry_id
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
           '05e8feaa-0bed-5909-a817-39812494b361',
           'a26ce332-3ced-5623-861d-23a2ef78e4a9',
           'Missing Column',
           'Required column ' || column_name || ' is missing in ahc_hrsn_valid_01_screening.',
           'Ensure ahc_hrsn_valid_01_screening contains the column "' || column_name || '"'
      FROM required_column_names_in_src;
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx (ahc_hrsn_valid_01_q_e_admin_data)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "ingest_session_entry" ("ingest_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('bc0c03b5-d1ba-5301-850f-5e4c42c1bf09', '05e8feaa-0bed-5909-a817-39812494b361', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx', 'ahc_hrsn_valid_01_q_e_admin_data', NULL);
        
INSERT INTO "ingest_session_issue" ("ingest_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('ae477ba1-c7f1-5f34-847a-50bddb7130aa', '05e8feaa-0bed-5909-a817-39812494b361', 'bc0c03b5-d1ba-5301-850f-5e4c42c1bf09', 'TODO', 'Excel workbook ''ahc-hrsn-valid-01.xlsx'' sheet ''QE_Admin_Data'' has not been implemented yet.', NULL, NULL, 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail.csv (synthetic_fail)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "ingest_session_entry" ("ingest_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839', '05e8feaa-0bed-5909-a817-39812494b361', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail.csv', 'synthetic_fail', NULL);

-- be sure to add src_file_row_number and session_id columns to each row
-- because assurance CTEs require them
CREATE TABLE synthetic_fail AS
  SELECT *, row_number() OVER () as src_file_row_number, '05e8feaa-0bed-5909-a817-39812494b361' as session_id, '8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839' as session_entry_id
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
           '05e8feaa-0bed-5909-a817-39812494b361',
           '8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839',
           'Missing Column',
           'Required column ' || column_name || ' is missing in synthetic_fail.',
           'Ensure synthetic_fail contains the column "' || column_name || '"'
      FROM required_column_names_in_src;
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-12-12-2023-valid.csv (ahc_hrsn_12_12_2023_valid)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "ingest_session_entry" ("ingest_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0', '05e8feaa-0bed-5909-a817-39812494b361', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-12-12-2023-valid.csv', 'ahc_hrsn_12_12_2023_valid', NULL);

-- be sure to add src_file_row_number and session_id columns to each row
-- because assurance CTEs require them
CREATE TABLE ahc_hrsn_12_12_2023_valid AS
  SELECT *, row_number() OVER () as src_file_row_number, '05e8feaa-0bed-5909-a817-39812494b361' as session_id, 'b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0' as session_entry_id
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
           '05e8feaa-0bed-5909-a817-39812494b361',
           'b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0',
           'Missing Column',
           'Required column ' || column_name || ' is missing in ahc_hrsn_12_12_2023_valid.',
           'Ensure ahc_hrsn_12_12_2023_valid contains the column "' || column_name || '"'
      FROM required_column_names_in_src;
SELECT session_entry_id, ingest_session_issue_id, issue_type, issue_message, invalid_value FROM ingest_session_issue WHERE session_id = '05e8feaa-0bed-5909-a817-39812494b361'
```

### stdout
```sh
[{"session_entry_id":"1931dfcc-e8fc-597d-b1bc-65b4287e6fdf","ingest_session_issue_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet 'Admin_Demographic' not found in 'synthetic-fail-excel-01.xlsx' (available: Sheet1)","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx"},
{"session_entry_id":"7b979b68-7227-53fd-b689-e4fe153afb76","ingest_session_issue_id":"abf5c680-a135-5d89-b871-fa5b9b99aed6","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet 'Screening' not found in 'synthetic-fail-excel-01.xlsx' (available: Sheet1)","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx"},
{"session_entry_id":"641dff51-97fd-56b3-8443-c1ed568a6d66","ingest_session_issue_id":"d70a4700-6b40-52fc-a7a2-69ef0d7f69ff","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet 'QE_Admin_Data' not found in 'synthetic-fail-excel-01.xlsx' (available: Sheet1)","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx"},
{"session_entry_id":"47277588-99e8-59f5-8384-b24344a86073","ingest_session_issue_id":"58b22e99-5854-53bf-adbe-08e67df99b85","issue_type":"TODO","issue_message":"Excel workbook 'ahc-hrsn-valid-01.xlsx' sheet 'Admin_Demographic' has not been implemented yet.","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx"},
{"session_entry_id":"a26ce332-3ced-5623-861d-23a2ef78e4a9","ingest_session_issue_id":"5c3046fa-bb76-4d07-b4d7-2cdfd85193a2","issue_type":"Missing Column","issue_message":"Required column FACILITY is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"a26ce332-3ced-5623-861d-23a2ef78e4a9","ingest_session_issue_id":"4882c6b1-77f1-4cba-ba86-c26e062dab71","issue_type":"Missing Column","issue_message":"Required column FIRST_NAME is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"a26ce332-3ced-5623-861d-23a2ef78e4a9","ingest_session_issue_id":"e6139de2-edd1-4516-a7c0-8828e6a6d4b3","issue_type":"Missing Column","issue_message":"Required column LAST_NAME is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"a26ce332-3ced-5623-861d-23a2ef78e4a9","ingest_session_issue_id":"948d5ddb-caef-4683-af04-a9936974d326","issue_type":"Missing Column","issue_message":"Required column PAT_BIRTH_DATE is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"a26ce332-3ced-5623-861d-23a2ef78e4a9","ingest_session_issue_id":"7f0fd156-d853-438e-a643-62156d1d8f90","issue_type":"Missing Column","issue_message":"Required column MEDICAID_CIN is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"a26ce332-3ced-5623-861d-23a2ef78e4a9","ingest_session_issue_id":"81ac8b91-89c0-4ec2-89ec-fa5d8ee36bc3","issue_type":"Missing Column","issue_message":"Required column ENCOUNTER_ID is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"a26ce332-3ced-5623-861d-23a2ef78e4a9","ingest_session_issue_id":"13a43ce9-da28-48a9-90aa-7a1ff58d7bab","issue_type":"Missing Column","issue_message":"Required column SURVEY is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"a26ce332-3ced-5623-861d-23a2ef78e4a9","ingest_session_issue_id":"a638ff45-26b4-46d9-81b2-ce35f105277f","issue_type":"Missing Column","issue_message":"Required column SURVEY_ID is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"a26ce332-3ced-5623-861d-23a2ef78e4a9","ingest_session_issue_id":"9c1b5ed8-c102-41c4-a8a7-1e9a9b5168a4","issue_type":"Missing Column","issue_message":"Required column NEED_INDICATED is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"a26ce332-3ced-5623-861d-23a2ef78e4a9","ingest_session_issue_id":"f96e38c5-a3e0-483e-ba36-5d5934b9503f","issue_type":"Missing Column","issue_message":"Required column VISIT_PART_2_FLAG is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"a26ce332-3ced-5623-861d-23a2ef78e4a9","ingest_session_issue_id":"74b39964-6432-456d-8471-338dcd6d42e3","issue_type":"Missing Column","issue_message":"Required column VISIT_OMH_FLAG is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"a26ce332-3ced-5623-861d-23a2ef78e4a9","ingest_session_issue_id":"4000bd76-bd24-49e2-849a-839dabc51be8","issue_type":"Missing Column","issue_message":"Required column VISIT_OPWDD_FLAG is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"bc0c03b5-d1ba-5301-850f-5e4c42c1bf09","ingest_session_issue_id":"ae477ba1-c7f1-5f34-847a-50bddb7130aa","issue_type":"TODO","issue_message":"Excel workbook 'ahc-hrsn-valid-01.xlsx' sheet 'QE_Admin_Data' has not been implemented yet.","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx"},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","ingest_session_issue_id":"5cd2a955-9d69-42e9-aa54-03d3f2e1e1be","issue_type":"Missing Column","issue_message":"Required column PAT_MRN_ID is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","ingest_session_issue_id":"e10797f7-b3cf-42c5-9ffc-f8fa529c89df","issue_type":"Missing Column","issue_message":"Required column FACILITY is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","ingest_session_issue_id":"35190394-6745-4cf5-ac25-7637e9c1d08d","issue_type":"Missing Column","issue_message":"Required column FIRST_NAME is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","ingest_session_issue_id":"9e6b7969-254a-4e5a-a2b4-7844fb3bb0ec","issue_type":"Missing Column","issue_message":"Required column LAST_NAME is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","ingest_session_issue_id":"9a969bf1-b846-4f90-b8bc-995c5cbe0ca1","issue_type":"Missing Column","issue_message":"Required column PAT_BIRTH_DATE is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","ingest_session_issue_id":"20074e00-8db4-4ced-950d-28dfc6a384a6","issue_type":"Missing Column","issue_message":"Required column MEDICAID_CIN is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","ingest_session_issue_id":"7c82d85a-a562-4a4c-be1d-eb3644f85357","issue_type":"Missing Column","issue_message":"Required column ENCOUNTER_ID is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","ingest_session_issue_id":"1f2f3f60-99f7-489c-a320-87ec93cd091e","issue_type":"Missing Column","issue_message":"Required column SURVEY is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","ingest_session_issue_id":"426b3fe4-013b-4d2e-a808-412399b989f4","issue_type":"Missing Column","issue_message":"Required column SURVEY_ID is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","ingest_session_issue_id":"263b09ed-942a-4ab5-a387-7b65798bb7e1","issue_type":"Missing Column","issue_message":"Required column RECORDED_TIME is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","ingest_session_issue_id":"c52dbac0-2f05-461a-9f17-7460c1846953","issue_type":"Missing Column","issue_message":"Required column QUESTION is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","ingest_session_issue_id":"028f272c-4fb9-44b2-a253-ed1957e69daf","issue_type":"Missing Column","issue_message":"Required column MEAS_VALUE is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","ingest_session_issue_id":"7aecbcab-353a-4168-8661-21d361ca2c12","issue_type":"Missing Column","issue_message":"Required column QUESTION_CODE is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","ingest_session_issue_id":"1f05683a-c313-4d6c-ba3c-dab029472ba9","issue_type":"Missing Column","issue_message":"Required column QUESTION_CODE_SYSTEM_NAME is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","ingest_session_issue_id":"a736fbae-3a61-44f9-9a4c-ed4720b91762","issue_type":"Missing Column","issue_message":"Required column ANSWER_CODE is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","ingest_session_issue_id":"76da67c9-4093-44cf-b3c4-5aa5dbe243f1","issue_type":"Missing Column","issue_message":"Required column ANSWER_CODE_SYSTEM_NAME is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","ingest_session_issue_id":"bc1fc326-08ba-4d2b-a7c5-3115ffca70a0","issue_type":"Missing Column","issue_message":"Required column SDOH_DOMAIN is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","ingest_session_issue_id":"6acfa2f1-2f37-4bd9-bd69-166a0bf82363","issue_type":"Missing Column","issue_message":"Required column NEED_INDICATED is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","ingest_session_issue_id":"57d1b10a-da42-45ab-96c7-590470dc3f3e","issue_type":"Missing Column","issue_message":"Required column VISIT_PART_2_FLAG is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","ingest_session_issue_id":"8b063687-59c5-4d4e-ab4b-6313e6c3f08f","issue_type":"Missing Column","issue_message":"Required column VISIT_OMH_FLAG is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","ingest_session_issue_id":"e2c6ea89-c5e0-4d20-96d1-a2f5cb64efa2","issue_type":"Missing Column","issue_message":"Required column VISIT_OPWDD_FLAG is missing in synthetic_fail.","invalid_value":null}]

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
           '05e8feaa-0bed-5909-a817-39812494b361',
           'b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0',
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
        INSERT INTO "ingest_session_state" ("ingest_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('8f460419-7b80-516d-8919-84520950f612', '05e8feaa-0bed-5909-a817-39812494b361', NULL, 'NONE', 'ENTER(prepareInit)', NULL, 'rsEE.beforeCell', (make_timestamp(2024, 1, 3, 19, 51, 54.220)), NULL);
        INSERT INTO "ingest_session_state" ("ingest_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('7bab389e-54af-5a13-a39f-079abdc73a48', '05e8feaa-0bed-5909-a817-39812494b361', NULL, 'EXIT(prepareInit)', 'ENTER(init)', NULL, 'rsEE.afterCell', (make_timestamp(2024, 1, 3, 19, 51, 54.220)), NULL);
        INSERT INTO "ingest_session_state" ("ingest_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('168a34c7-d043-5ec4-a84a-c961f1a301ef', '05e8feaa-0bed-5909-a817-39812494b361', NULL, 'EXIT(init)', 'ENTER(ingest)', NULL, 'rsEE.afterCell', (make_timestamp(2024, 1, 3, 19, 51, 54.220)), NULL);
        INSERT INTO "ingest_session_state" ("ingest_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('7ef8bdeb-fd56-5eb9-a09b-ef15ce18dc49', '05e8feaa-0bed-5909-a817-39812494b361', NULL, 'EXIT(ingest)', 'ENTER(ensureContent)', NULL, 'rsEE.afterCell', (make_timestamp(2024, 1, 3, 19, 51, 54.220)), NULL);
        INSERT INTO "ingest_session_state" ("ingest_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('591191c7-f693-5957-8734-ac87151ca981', '05e8feaa-0bed-5909-a817-39812494b361', NULL, 'EXIT(ensureContent)', 'ENTER(emitResources)', NULL, 'rsEE.afterCell', (make_timestamp(2024, 1, 3, 19, 51, 54.221)), NULL);

        -- emit all the SQLPage content
        CREATE TABLE IF NOT EXISTS "sqlpage_files" (
    "path" TEXT PRIMARY KEY NOT NULL,
    "contents" TEXT NOT NULL,
    "last_modified" DATE
);

INSERT INTO "sqlpage_files" ("path", "contents", "last_modified") VALUES ('index.sql', 'SELECT
  ''shell''                   as component,
  ''book''                    as icon,
  ''QCS Ingestion Center''    as title,
  ''/''                       as link,
  ''issues''                  as menu_item,
  ''schema''                  as menu_item;
SELECT ''list'' as component;
SELECT ''Ingestion Issues'' as title, ''issues.sql'' as link;
SELECT ''Ingestion State Schema'' as title, ''schema.sql'' as link;', (CURRENT_TIMESTAMP)) ON CONFLICT(path) DO UPDATE SET contents = EXCLUDED.contents /* TODO: does not work in DuckDB , last_modified = (CURRENT_TIMESTAMP) */;

INSERT INTO "sqlpage_files" ("path", "contents", "last_modified") VALUES ('issues.sql', 'SELECT
  ''shell''                   as component,
  ''book''                    as icon,
  ''QCS Ingestion Center''    as title,
  ''/''                       as link,
  ''issues''                  as menu_item,
  ''schema''                  as menu_item;
SELECT ''table'' as component;
SELECT issue_type, issue_message, invalid_value, remediation 
  FROM "ingest_session_issue";
    ', (CURRENT_TIMESTAMP)) ON CONFLICT(path) DO UPDATE SET contents = EXCLUDED.contents /* TODO: does not work in DuckDB , last_modified = (CURRENT_TIMESTAMP) */;

INSERT INTO "sqlpage_files" ("path", "contents", "last_modified") VALUES ('schema.sql', 'SELECT
  ''shell''                   as component,
  ''book''                    as icon,
  ''QCS Ingestion Center''    as title,
  ''/''                       as link,
  ''issues''                  as menu_item,
  ''schema''                  as menu_item;
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
        
        ATTACH 'support/assurance/ahc-hrsn-elt/screening/results-test-e2e/resource.sqlite.db' AS resource_db (TYPE SQLITE);

        CREATE TABLE resource_db.device AS SELECT * FROM device;
        CREATE TABLE resource_db.ingest_session AS SELECT * FROM ingest_session;
        CREATE TABLE resource_db.ingest_session_entry AS SELECT * FROM ingest_session_entry;
        CREATE TABLE resource_db.ingest_session_state AS SELECT * FROM ingest_session_state;
        CREATE TABLE resource_db.ingest_session_issue AS SELECT * FROM ingest_session_issue;
        CREATE TABLE resource_db.sqlpage_files AS SELECT * FROM sqlpage_files;

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
