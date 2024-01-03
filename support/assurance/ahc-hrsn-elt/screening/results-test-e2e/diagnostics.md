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
{"session_entry_id":"a26ce332-3ced-5623-861d-23a2ef78e4a9","ingest_session_issue_id":"075edff5-a4e7-4ee3-8d19-cfd113748ac0","issue_type":"Missing Column","issue_message":"Required column FACILITY is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"a26ce332-3ced-5623-861d-23a2ef78e4a9","ingest_session_issue_id":"6ca0effe-2584-4e52-a4c8-f0419e77b764","issue_type":"Missing Column","issue_message":"Required column FIRST_NAME is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"a26ce332-3ced-5623-861d-23a2ef78e4a9","ingest_session_issue_id":"48efe1e7-3744-44e3-89c2-39386800a5ce","issue_type":"Missing Column","issue_message":"Required column LAST_NAME is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"a26ce332-3ced-5623-861d-23a2ef78e4a9","ingest_session_issue_id":"cd51142c-2eb5-468e-bc9b-0ccb3e58bf66","issue_type":"Missing Column","issue_message":"Required column PAT_BIRTH_DATE is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"a26ce332-3ced-5623-861d-23a2ef78e4a9","ingest_session_issue_id":"1c9d1659-2fa2-49a3-a148-175572b163b8","issue_type":"Missing Column","issue_message":"Required column MEDICAID_CIN is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"a26ce332-3ced-5623-861d-23a2ef78e4a9","ingest_session_issue_id":"2545cca8-d5c8-4893-89d2-082b5624ef68","issue_type":"Missing Column","issue_message":"Required column ENCOUNTER_ID is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"a26ce332-3ced-5623-861d-23a2ef78e4a9","ingest_session_issue_id":"96f2ece9-baca-4da9-8e46-d32d6c7a7f79","issue_type":"Missing Column","issue_message":"Required column SURVEY is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"a26ce332-3ced-5623-861d-23a2ef78e4a9","ingest_session_issue_id":"254ea412-be68-44e9-ac29-9cbe4374418b","issue_type":"Missing Column","issue_message":"Required column SURVEY_ID is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"a26ce332-3ced-5623-861d-23a2ef78e4a9","ingest_session_issue_id":"e632a328-5781-4643-9e66-428ae9953f3c","issue_type":"Missing Column","issue_message":"Required column NEED_INDICATED is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"a26ce332-3ced-5623-861d-23a2ef78e4a9","ingest_session_issue_id":"97eb4167-9616-43dc-976a-3686d4b132ba","issue_type":"Missing Column","issue_message":"Required column VISIT_PART_2_FLAG is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"a26ce332-3ced-5623-861d-23a2ef78e4a9","ingest_session_issue_id":"bc25ec47-3825-45cd-804b-bcd5f7ec0a98","issue_type":"Missing Column","issue_message":"Required column VISIT_OMH_FLAG is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"a26ce332-3ced-5623-861d-23a2ef78e4a9","ingest_session_issue_id":"f8aaddfe-ac87-4710-a869-4ff918b7b9d2","issue_type":"Missing Column","issue_message":"Required column VISIT_OPWDD_FLAG is missing in ahc_hrsn_valid_01_screening.","invalid_value":null},
{"session_entry_id":"bc0c03b5-d1ba-5301-850f-5e4c42c1bf09","ingest_session_issue_id":"ae477ba1-c7f1-5f34-847a-50bddb7130aa","issue_type":"TODO","issue_message":"Excel workbook 'ahc-hrsn-valid-01.xlsx' sheet 'QE_Admin_Data' has not been implemented yet.","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-valid-01.xlsx"},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","ingest_session_issue_id":"52ee9024-14c7-4bb7-9052-db9e92bf4ecb","issue_type":"Missing Column","issue_message":"Required column PAT_MRN_ID is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","ingest_session_issue_id":"1349ff77-41c8-4fac-867a-061d8904b9e0","issue_type":"Missing Column","issue_message":"Required column FACILITY is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","ingest_session_issue_id":"b1092e59-9718-42e5-9dc6-616a87edff14","issue_type":"Missing Column","issue_message":"Required column FIRST_NAME is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","ingest_session_issue_id":"668ac1f1-7c0e-44ca-94e9-01a791222d74","issue_type":"Missing Column","issue_message":"Required column LAST_NAME is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","ingest_session_issue_id":"32388b9a-8bcd-4306-9b52-11e640030dcc","issue_type":"Missing Column","issue_message":"Required column PAT_BIRTH_DATE is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","ingest_session_issue_id":"643bb10c-584a-45ef-ac7a-2c378c7b461f","issue_type":"Missing Column","issue_message":"Required column MEDICAID_CIN is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","ingest_session_issue_id":"a212a6ab-1097-4052-af76-640ad3ab449f","issue_type":"Missing Column","issue_message":"Required column ENCOUNTER_ID is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","ingest_session_issue_id":"4f30e487-6b0b-4341-b9ce-d4c37bc3e503","issue_type":"Missing Column","issue_message":"Required column SURVEY is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","ingest_session_issue_id":"8b3142b0-7eed-4b04-af98-f8ad3fd6917e","issue_type":"Missing Column","issue_message":"Required column SURVEY_ID is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","ingest_session_issue_id":"757746fe-3786-4d12-aa38-68a403161dd2","issue_type":"Missing Column","issue_message":"Required column RECORDED_TIME is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","ingest_session_issue_id":"0faf29d3-d45d-4498-847a-d9a1058b0313","issue_type":"Missing Column","issue_message":"Required column QUESTION is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","ingest_session_issue_id":"88b5519e-9d49-4054-892c-1c65948d1e5f","issue_type":"Missing Column","issue_message":"Required column MEAS_VALUE is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","ingest_session_issue_id":"3de7dd13-d26d-4ce5-9297-16e22313ec6a","issue_type":"Missing Column","issue_message":"Required column QUESTION_CODE is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","ingest_session_issue_id":"7b8c600d-6011-43e7-a889-ae51561eda9a","issue_type":"Missing Column","issue_message":"Required column QUESTION_CODE_SYSTEM_NAME is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","ingest_session_issue_id":"c15a925c-8ac1-4fae-82d7-b44ea2ff7551","issue_type":"Missing Column","issue_message":"Required column ANSWER_CODE is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","ingest_session_issue_id":"4c35bd4d-beaa-48ad-b21c-acf0c91c2296","issue_type":"Missing Column","issue_message":"Required column ANSWER_CODE_SYSTEM_NAME is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","ingest_session_issue_id":"f9f053aa-571d-47df-b497-5d2e9006fc4c","issue_type":"Missing Column","issue_message":"Required column SDOH_DOMAIN is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","ingest_session_issue_id":"ec6c0559-785d-407a-8dea-39cfb3c01e7c","issue_type":"Missing Column","issue_message":"Required column NEED_INDICATED is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","ingest_session_issue_id":"7a33a23e-e341-40ae-8b33-4a10c7efcff1","issue_type":"Missing Column","issue_message":"Required column VISIT_PART_2_FLAG is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","ingest_session_issue_id":"1481d6a3-4f03-4121-a2b8-a51708188977","issue_type":"Missing Column","issue_message":"Required column VISIT_OMH_FLAG is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","ingest_session_issue_id":"5c7575ce-8ecc-49d8-8d67-3f9a2879a7e5","issue_type":"Missing Column","issue_message":"Required column VISIT_OPWDD_FLAG is missing in synthetic_fail.","invalid_value":null}]

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
INSERT INTO "ingest_session_state" ("ingest_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('8f460419-7b80-516d-8919-84520950f612', '05e8feaa-0bed-5909-a817-39812494b361', NULL, 'NONE', 'ENTER(prepareInit)', NULL, 'rsEE.beforeCell', (make_timestamp(2024, 1, 3, 10, 16, 50.55)), NULL);
INSERT INTO "ingest_session_state" ("ingest_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('7bab389e-54af-5a13-a39f-079abdc73a48', '05e8feaa-0bed-5909-a817-39812494b361', NULL, 'EXIT(prepareInit)', 'ENTER(init)', NULL, 'rsEE.afterCell', (make_timestamp(2024, 1, 3, 10, 16, 50.55)), NULL);
INSERT INTO "ingest_session_state" ("ingest_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('168a34c7-d043-5ec4-a84a-c961f1a301ef', '05e8feaa-0bed-5909-a817-39812494b361', NULL, 'EXIT(init)', 'ENTER(ingest)', NULL, 'rsEE.afterCell', (make_timestamp(2024, 1, 3, 10, 16, 50.55)), NULL);
INSERT INTO "ingest_session_state" ("ingest_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('7ef8bdeb-fd56-5eb9-a09b-ef15ce18dc49', '05e8feaa-0bed-5909-a817-39812494b361', NULL, 'EXIT(ingest)', 'ENTER(ensureContent)', NULL, 'rsEE.afterCell', (make_timestamp(2024, 1, 3, 10, 16, 50.55)), NULL);
INSERT INTO "ingest_session_state" ("ingest_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('591191c7-f693-5957-8734-ac87151ca981', '05e8feaa-0bed-5909-a817-39812494b361', NULL, 'EXIT(ensureContent)', 'ENTER(emitResources)', NULL, 'rsEE.afterCell', (make_timestamp(2024, 1, 3, 10, 16, 50.55)), NULL);

ATTACH 'support/assurance/ahc-hrsn-elt/screening/results-test-e2e/resource.sqlite.db' AS resource_db (TYPE SQLITE);

CREATE TABLE resource_db.device AS SELECT * FROM device;
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
