---
walkRootPaths:
  - support/assurance/ahc-hrsn-elt/screening/synthetic-content
diagsJson: support/assurance/ahc-hrsn-elt/screening/results-test-e2e/diagnostics.json
diagsMd: support/assurance/ahc-hrsn-elt/screening/results-test-e2e/diagnostics.md
diagsXlsx: support/assurance/ahc-hrsn-elt/screening/results-test-e2e/diagnostics.xlsx
resourceDb: support/assurance/ahc-hrsn-elt/screening/results-test-e2e/resource.sqlite.db
sources:
  - uri: >-
      support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-2023-12-12-valid.csv
    nature: CSV
    tableName: ahc_hrsn_2023_12_12_valid
    ingestionIssues: 0
  - uri: >-
      support/assurance/ahc-hrsn-elt/screening/synthetic-content/jrchc-hrsn-file-spec.xlsx
    nature: ERROR
    tableName: ERROR
    ingestionIssues: 1
  - uri: >-
      support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx
    nature: ERROR
    tableName: ERROR
    ingestionIssues: 1
  - uri: >-
      support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-2023-12-25-valid.xlsx
    nature: Excel Workbook Sheet
    tableName: ahc_hrsn_2023_12_25_valid_admin_demographic
    ingestionIssues: 0
  - uri: >-
      support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-2023-12-25-valid.xlsx
    nature: Excel Workbook Sheet
    tableName: ahc_hrsn_2023_12_25_valid_screening
    ingestionIssues: 0
  - uri: >-
      support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-2023-12-25-valid.xlsx
    nature: Excel Workbook Sheet
    tableName: ahc_hrsn_2023_12_25_valid_q_e_admin_data
    ingestionIssues: 0
  - uri: >-
      support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-2024-01-25-valid.xlsx
    nature: Excel Workbook Sheet
    tableName: ahc_hrsn_2024_01_25_valid_admin_demographic
    ingestionIssues: 0
  - uri: >-
      support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-2024-01-25-valid.xlsx
    nature: Excel Workbook Sheet
    tableName: ahc_hrsn_2024_01_25_valid_screening
    ingestionIssues: 0
  - uri: >-
      support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-2024-01-25-valid.xlsx
    nature: Excel Workbook Sheet
    tableName: ahc_hrsn_2024_01_25_valid_q_e_admin_data
    ingestionIssues: 0
  - uri: >-
      support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail.csv
    nature: CSV
    tableName: synthetic_fail
    ingestionIssues: 21
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
INSERT INTO "device" ("device_id", "name", "state", "boundary", "segmentation", "state_sysinfo", "elaboration") VALUES ('05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'MOBILIS-X1G9', 'SINGLETON', 'UNKNOWN', NULL, '{"os-arch":"x64","os-platform":"linux"}', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "orch_session" ("orch_session_id", "device_id", "orch_started_at", "orch_finished_at", "elaboration", "args_json", "diagnostics_json", "diagnostics_md") VALUES ('05e8feaa-0bed-5909-a817-39812494b361', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', ('2024-02-01T19:37:03.453Z'), NULL, NULL, NULL, NULL, 'Session 05e8feaa-0bed-5909-a817-39812494b361 markdown diagnostics not provided (not completed?)');

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
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-2023-12-12-valid.csv (ahc_hrsn_2023_12_12_valid)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('8b7c669c-1795-5f6b-8f3a-3e502b74c628', '05e8feaa-0bed-5909-a817-39812494b361', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-2023-12-12-valid.csv', 'ahc_hrsn_2023_12_12_valid', NULL);

-- state management diagnostics 
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('7b979b68-7227-53fd-b689-e4fe153afb76', '05e8feaa-0bed-5909-a817-39812494b361', '8b7c669c-1795-5f6b-8f3a-3e502b74c628', 'ENTER(ingest)', 'ATTEMPT_CSV_INGEST', NULL, 'ScreeningCsvFileIngestSource.ingestSQL', (CURRENT_TIMESTAMP), NULL);

-- be sure to add src_file_row_number and session_id columns to each row
-- because assurance CTEs require them
CREATE TABLE ahc_hrsn_2023_12_12_valid AS
  SELECT *, row_number() OVER () as src_file_row_number, '05e8feaa-0bed-5909-a817-39812494b361' as session_id, '8b7c669c-1795-5f6b-8f3a-3e502b74c628' as session_entry_id
    FROM read_csv_auto('support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-2023-12-12-valid.csv');

WITH required_column_names_in_src AS (
    SELECT column_name
      FROM (VALUES ('ANSWER_CODE_SYSTEM_NAME'), ('ANSWER_CODE'), ('ENCOUNTER_ID'), ('FACILITY'), ('FIRST_NAME'), ('LAST_NAME'), ('MEAS_VALUE'), ('MEDICAID_CIN'), ('NEED_INDICATED'), ('PAT_BIRTH_DATE'), ('PAT_MRN_ID'), ('QUESTION_CODE_SYSTEM_NAME'), ('QUESTION_CODE'), ('QUESTION'), ('RECORDED_TIME'), ('SDOH_DOMAIN'), ('SURVEY_ID'), ('SURVEY'), ('VISIT_OMH_FLAG'), ('VISIT_OPWDD_FLAG'), ('VISIT_PART_2_FLAG')) AS required(column_name)
     WHERE required.column_name NOT IN (
         SELECT upper(trim(column_name))
           FROM information_schema.columns
          WHERE table_name = 'ahc_hrsn_2023_12_12_valid')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Missing Column',
           'Required column ' || column_name || ' is missing in ahc_hrsn_2023_12_12_valid.',
           'Ensure ahc_hrsn_2023_12_12_valid contains the column "' || column_name || '"'
      FROM required_column_names_in_src;

INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('abf5c680-a135-5d89-b871-fa5b9b99aed6', '05e8feaa-0bed-5909-a817-39812494b361', '8b7c669c-1795-5f6b-8f3a-3e502b74c628', 'ATTEMPT_CSV_INGEST', 'INGESTED_CSV', NULL, 'ScreeningCsvFileIngestSource.ingestSQL', (CURRENT_TIMESTAMP), NULL);
    
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/jrchc-hrsn-file-spec.xlsx (ERROR)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('641dff51-97fd-56b3-8443-c1ed568a6d66', '05e8feaa-0bed-5909-a817-39812494b361', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/jrchc-hrsn-file-spec.xlsx', 'ERROR', NULL);
INSERT INTO "orch_session_issue" ("orch_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('d70a4700-6b40-52fc-a7a2-69ef0d7f69ff', '05e8feaa-0bed-5909-a817-39812494b361', '641dff51-97fd-56b3-8443-c1ed568a6d66', 'Sheet Missing', 'Excel workbook sheet ''Admin_Demographic'' not found in ''jrchc-hrsn-file-spec.xlsx'' (available: Original Report, HeL LOINC Mapping)', NULL, NULL, 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/jrchc-hrsn-file-spec.xlsx', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/jrchc-hrsn-file-spec.xlsx (ERROR)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('47277588-99e8-59f5-8384-b24344a86073', '05e8feaa-0bed-5909-a817-39812494b361', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/jrchc-hrsn-file-spec.xlsx', 'ERROR', NULL);
INSERT INTO "orch_session_issue" ("orch_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('58b22e99-5854-53bf-adbe-08e67df99b85', '05e8feaa-0bed-5909-a817-39812494b361', '47277588-99e8-59f5-8384-b24344a86073', 'Sheet Missing', 'Excel workbook sheet ''Screening'' not found in ''jrchc-hrsn-file-spec.xlsx'' (available: Original Report, HeL LOINC Mapping)', NULL, NULL, 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/jrchc-hrsn-file-spec.xlsx', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/jrchc-hrsn-file-spec.xlsx (ERROR)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('a26ce332-3ced-5623-861d-23a2ef78e4a9', '05e8feaa-0bed-5909-a817-39812494b361', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/jrchc-hrsn-file-spec.xlsx', 'ERROR', NULL);
INSERT INTO "orch_session_issue" ("orch_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('bc0c03b5-d1ba-5301-850f-5e4c42c1bf09', '05e8feaa-0bed-5909-a817-39812494b361', 'a26ce332-3ced-5623-861d-23a2ef78e4a9', 'Sheet Missing', 'Excel workbook sheet ''QE_Admin_Data'' not found in ''jrchc-hrsn-file-spec.xlsx'' (available: Original Report, HeL LOINC Mapping)', NULL, NULL, 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/jrchc-hrsn-file-spec.xlsx', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx (ERROR)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('ae477ba1-c7f1-5f34-847a-50bddb7130aa', '05e8feaa-0bed-5909-a817-39812494b361', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx', 'ERROR', NULL);
INSERT INTO "orch_session_issue" ("orch_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839', '05e8feaa-0bed-5909-a817-39812494b361', 'ae477ba1-c7f1-5f34-847a-50bddb7130aa', 'Sheet Missing', 'Excel workbook sheet ''Admin_Demographic'' not found in ''synthetic-fail-excel-01.xlsx'' (available: Sheet1)', NULL, NULL, 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx (ERROR)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0', '05e8feaa-0bed-5909-a817-39812494b361', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx', 'ERROR', NULL);
INSERT INTO "orch_session_issue" ("orch_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('7ef8bdeb-fd56-5eb9-a09b-ef15ce18dc49', '05e8feaa-0bed-5909-a817-39812494b361', 'b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0', 'Sheet Missing', 'Excel workbook sheet ''Screening'' not found in ''synthetic-fail-excel-01.xlsx'' (available: Sheet1)', NULL, NULL, 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx (ERROR)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('591191c7-f693-5957-8734-ac87151ca981', '05e8feaa-0bed-5909-a817-39812494b361', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx', 'ERROR', NULL);
INSERT INTO "orch_session_issue" ("orch_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('3b4eb0e5-6239-537a-8e67-e50e172e72a2', '05e8feaa-0bed-5909-a817-39812494b361', '591191c7-f693-5957-8734-ac87151ca981', 'Sheet Missing', 'Excel workbook sheet ''QE_Admin_Data'' not found in ''synthetic-fail-excel-01.xlsx'' (available: Sheet1)', NULL, NULL, 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-2023-12-25-valid.xlsx (ahc_hrsn_2023_12_25_valid_admin_demographic)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('071f8fe1-4899-5c71-9c86-7d7377661d45', '05e8feaa-0bed-5909-a817-39812494b361', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-2023-12-25-valid.xlsx', 'ahc_hrsn_2023_12_25_valid_admin_demographic', NULL);
     
-- state management diagnostics 
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('86b4a49e-7378-5159-9f41-b005208c31bc', '05e8feaa-0bed-5909-a817-39812494b361', '071f8fe1-4899-5c71-9c86-7d7377661d45', 'ENTER(ingest)', 'ATTEMPT_EXCEL_INGEST', NULL, 'AdminDemographicExcelSheetIngestSource.ingestSQL', (CURRENT_TIMESTAMP), NULL);

-- ingest Excel workbook sheet 'Admin_Demographic' into ahc_hrsn_2023_12_25_valid_admin_demographic using spatial plugin
INSTALL spatial; LOAD spatial;

-- be sure to add src_file_row_number and session_id columns to each row
-- because assurance CTEs require them
CREATE TABLE ahc_hrsn_2023_12_25_valid_admin_demographic AS
  SELECT *, row_number() OVER () as src_file_row_number, '05e8feaa-0bed-5909-a817-39812494b361' as session_id, '071f8fe1-4899-5c71-9c86-7d7377661d45' as session_entry_id
    FROM st_read('support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-2023-12-25-valid.xlsx', layer='Admin_Demographic', open_options=['HEADERS=FORCE', 'FIELD_TYPES=AUTO']);          

WITH required_column_names_in_src AS (
    SELECT column_name
      FROM (VALUES ('ADDRESS1'), ('ADDRESS2'), ('ADMINISTRATIVE_SEX'), ('CITY'), ('CONSENT'), ('ENCOUNTER_ID'), ('ETHNICITY_CODE'), ('ETHNICITY_CODE_DESCRIPTION'), ('ETHNICITY_CODE_SYSTEM_NAME'), ('FACILITY ID (ASSIGNING AUTHORITY)'), ('FIRST_NAME'), ('GENDER_IDENTITY_CODE'), ('GENDER_IDENTITY_CODE_SYSTEM_NAME'), ('GENDER_IDENTITY_DESCRIPTION'), ('LAST_NAME'), ('MEDICAID_CIN'), ('MIDDLE_NAME'), ('MPI_ID'), ('PAT_BIRTH_DATE'), ('PAT_MRN_ID'), ('PREFERRED_LANGUAGE_CODE'), ('PREFERRED_LANGUAGE_CODE_SYSTEM_NAME'), ('PREFERRED_LANGUAGE_DESCRIPTION'), ('RACE_CODE'), ('RACE_CODE_DESCRIPTION'), ('RACE_CODE_SYSTEM_NAME'), ('SEX_AT_BIRTH'), ('SEXUAL_ORIENTATION_CODE'), ('SEXUAL_ORIENTATION_CODE_SYSTEM_NAME'), ('SEXUAL_ORIENTATION_DESCRIPTION'), ('STATE'), ('ZIP')) AS required(column_name)
     WHERE required.column_name NOT IN (
         SELECT upper(trim(column_name))
           FROM information_schema.columns
          WHERE table_name = 'ahc_hrsn_2023_12_25_valid_admin_demographic')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '071f8fe1-4899-5c71-9c86-7d7377661d45',
           'Missing Column',
           'Required column ' || column_name || ' is missing in ahc_hrsn_2023_12_25_valid_admin_demographic.',
           'Ensure ahc_hrsn_2023_12_25_valid_admin_demographic contains the column "' || column_name || '"'
      FROM required_column_names_in_src;
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('a530fe1b-57ef-5a90-8bea-835ece2483da', '05e8feaa-0bed-5909-a817-39812494b361', '071f8fe1-4899-5c71-9c86-7d7377661d45', 'ATTEMPT_EXCEL_INGEST', 'INGESTED_EXCEL_WORKBOOK_SHEET', NULL, 'AdminDemographicExcelSheetIngestSource.ingestSQL', (CURRENT_TIMESTAMP), NULL);

-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-2023-12-25-valid.xlsx (ahc_hrsn_2023_12_25_valid_screening)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('a3fe7098-8ae8-5612-81ac-cbe10780c19b', '05e8feaa-0bed-5909-a817-39812494b361', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-2023-12-25-valid.xlsx', 'ahc_hrsn_2023_12_25_valid_screening', NULL);
     
-- state management diagnostics 
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('99e72a60-96ab-5ef1-a3af-3e7759777664', '05e8feaa-0bed-5909-a817-39812494b361', 'a3fe7098-8ae8-5612-81ac-cbe10780c19b', 'ENTER(ingest)', 'ATTEMPT_EXCEL_INGEST', NULL, 'ScreeningExcelSheetIngestSource.ingestSQL', (CURRENT_TIMESTAMP), NULL);

-- ingest Excel workbook sheet 'Screening' into ahc_hrsn_2023_12_25_valid_screening using spatial plugin
INSTALL spatial; LOAD spatial;

-- be sure to add src_file_row_number and session_id columns to each row
-- because assurance CTEs require them
CREATE TABLE ahc_hrsn_2023_12_25_valid_screening AS
  SELECT *, row_number() OVER () as src_file_row_number, '05e8feaa-0bed-5909-a817-39812494b361' as session_id, 'a3fe7098-8ae8-5612-81ac-cbe10780c19b' as session_entry_id
    FROM st_read('support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-2023-12-25-valid.xlsx', layer='Screening', open_options=['HEADERS=FORCE', 'FIELD_TYPES=AUTO']);          

WITH required_column_names_in_src AS (
    SELECT column_name
      FROM (VALUES ('ANSWER_CODE_SYSTEM_NAME'), ('ANSWER_CODE'), ('ASSISTANCE_REQUESTED'), ('FACILITY ID (ASSIGNING AUTHORITY)'), ('MEAS_VALUE'), ('PARENT_QUESTION_CODE'), ('PAT_MRN_ID'), ('POTENTIAL_NEED_INDICATED'), ('QUESTION_CODE_SYSTEM_NAME'), ('QUESTION_CODE'), ('QUESTION'), ('RECORDED_TIME'), ('SCREENING_CODE_SYSTEM_NAME'), ('SCREENING_CODE'), ('SCREENING_METHOD'), ('SCREENING_NAME'), ('SDOH_DOMAIN'), ('UCUM_UNITS')) AS required(column_name)
     WHERE required.column_name NOT IN (
         SELECT upper(trim(column_name))
           FROM information_schema.columns
          WHERE table_name = 'ahc_hrsn_2023_12_25_valid_screening')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'a3fe7098-8ae8-5612-81ac-cbe10780c19b',
           'Missing Column',
           'Required column ' || column_name || ' is missing in ahc_hrsn_2023_12_25_valid_screening.',
           'Ensure ahc_hrsn_2023_12_25_valid_screening contains the column "' || column_name || '"'
      FROM required_column_names_in_src;
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('e36daa69-3c63-5384-b6a7-03fa3b00641d', '05e8feaa-0bed-5909-a817-39812494b361', 'a3fe7098-8ae8-5612-81ac-cbe10780c19b', 'ATTEMPT_EXCEL_INGEST', 'INGESTED_EXCEL_WORKBOOK_SHEET', NULL, 'ScreeningExcelSheetIngestSource.ingestSQL', (CURRENT_TIMESTAMP), NULL);

-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-2023-12-25-valid.xlsx (ahc_hrsn_2023_12_25_valid_q_e_admin_data)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('89f7ec04-277a-5799-afaa-a70d0f2a8ed5', '05e8feaa-0bed-5909-a817-39812494b361', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-2023-12-25-valid.xlsx', 'ahc_hrsn_2023_12_25_valid_q_e_admin_data', NULL);
     
-- state management diagnostics 
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('c60cf3db-b1bf-5103-b278-b0c128ce924a', '05e8feaa-0bed-5909-a817-39812494b361', '89f7ec04-277a-5799-afaa-a70d0f2a8ed5', 'ENTER(ingest)', 'ATTEMPT_EXCEL_INGEST', NULL, 'QeAdminDataExcelSheetIngestSource.ingestSQL', (CURRENT_TIMESTAMP), NULL);

-- ingest Excel workbook sheet 'QE_Admin_Data' into ahc_hrsn_2023_12_25_valid_q_e_admin_data using spatial plugin
INSTALL spatial; LOAD spatial;

-- be sure to add src_file_row_number and session_id columns to each row
-- because assurance CTEs require them
CREATE TABLE ahc_hrsn_2023_12_25_valid_q_e_admin_data AS
  SELECT *, row_number() OVER () as src_file_row_number, '05e8feaa-0bed-5909-a817-39812494b361' as session_id, '89f7ec04-277a-5799-afaa-a70d0f2a8ed5' as session_entry_id
    FROM st_read('support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-2023-12-25-valid.xlsx', layer='QE_Admin_Data', open_options=['HEADERS=FORCE', 'FIELD_TYPES=AUTO']);          

WITH required_column_names_in_src AS (
    SELECT column_name
      FROM (VALUES ('PAT_MRN_ID'), ('FACILITY ID (ASSIGNING AUTHORITY)'), ('FACILITY_LONG_NAME'), ('ORGANIZATION_TYPE'), ('FACILITY ADDRESS1'), ('FACILITY ADDRESS2'), ('FACILITY CITY'), ('FACILITY STATE'), ('FACILITY ZIP'), ('VISIT_PART_2_FLAG'), ('VISIT_OMH_FLAG'), ('VISIT_OPWDD_FLAG')) AS required(column_name)
     WHERE required.column_name NOT IN (
         SELECT upper(trim(column_name))
           FROM information_schema.columns
          WHERE table_name = 'ahc_hrsn_2023_12_25_valid_q_e_admin_data')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '89f7ec04-277a-5799-afaa-a70d0f2a8ed5',
           'Missing Column',
           'Required column ' || column_name || ' is missing in ahc_hrsn_2023_12_25_valid_q_e_admin_data.',
           'Ensure ahc_hrsn_2023_12_25_valid_q_e_admin_data contains the column "' || column_name || '"'
      FROM required_column_names_in_src;
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('b2a7c7e8-5ffe-5f28-8112-4eb7abb6397f', '05e8feaa-0bed-5909-a817-39812494b361', '89f7ec04-277a-5799-afaa-a70d0f2a8ed5', 'ATTEMPT_EXCEL_INGEST', 'INGESTED_EXCEL_WORKBOOK_SHEET', NULL, 'QeAdminDataExcelSheetIngestSource.ingestSQL', (CURRENT_TIMESTAMP), NULL);

-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-2024-01-25-valid.xlsx (ahc_hrsn_2024_01_25_valid_admin_demographic)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('b10e248d-8c94-59ec-83fc-a1249dd3b111', '05e8feaa-0bed-5909-a817-39812494b361', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-2024-01-25-valid.xlsx', 'ahc_hrsn_2024_01_25_valid_admin_demographic', NULL);
     
-- state management diagnostics 
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('5222b730-9add-5b52-b0c9-6f2506b0af9d', '05e8feaa-0bed-5909-a817-39812494b361', 'b10e248d-8c94-59ec-83fc-a1249dd3b111', 'ENTER(ingest)', 'ATTEMPT_EXCEL_INGEST', NULL, 'AdminDemographicExcelSheetIngestSource.ingestSQL', (CURRENT_TIMESTAMP), NULL);

-- ingest Excel workbook sheet 'Admin_Demographic' into ahc_hrsn_2024_01_25_valid_admin_demographic using spatial plugin
INSTALL spatial; LOAD spatial;

-- be sure to add src_file_row_number and session_id columns to each row
-- because assurance CTEs require them
CREATE TABLE ahc_hrsn_2024_01_25_valid_admin_demographic AS
  SELECT *, row_number() OVER () as src_file_row_number, '05e8feaa-0bed-5909-a817-39812494b361' as session_id, 'b10e248d-8c94-59ec-83fc-a1249dd3b111' as session_entry_id
    FROM st_read('support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-2024-01-25-valid.xlsx', layer='Admin_Demographic', open_options=['HEADERS=FORCE', 'FIELD_TYPES=AUTO']);          

WITH required_column_names_in_src AS (
    SELECT column_name
      FROM (VALUES ('ADDRESS1'), ('ADDRESS2'), ('ADMINISTRATIVE_SEX'), ('CITY'), ('CONSENT'), ('ENCOUNTER_ID'), ('ETHNICITY_CODE'), ('ETHNICITY_CODE_DESCRIPTION'), ('ETHNICITY_CODE_SYSTEM_NAME'), ('FACILITY ID (ASSIGNING AUTHORITY)'), ('FIRST_NAME'), ('GENDER_IDENTITY_CODE'), ('GENDER_IDENTITY_CODE_SYSTEM_NAME'), ('GENDER_IDENTITY_DESCRIPTION'), ('LAST_NAME'), ('MEDICAID_CIN'), ('MIDDLE_NAME'), ('MPI_ID'), ('PAT_BIRTH_DATE'), ('PAT_MRN_ID'), ('PREFERRED_LANGUAGE_CODE'), ('PREFERRED_LANGUAGE_CODE_SYSTEM_NAME'), ('PREFERRED_LANGUAGE_DESCRIPTION'), ('RACE_CODE'), ('RACE_CODE_DESCRIPTION'), ('RACE_CODE_SYSTEM_NAME'), ('SEX_AT_BIRTH'), ('SEXUAL_ORIENTATION_CODE'), ('SEXUAL_ORIENTATION_CODE_SYSTEM_NAME'), ('SEXUAL_ORIENTATION_DESCRIPTION'), ('STATE'), ('ZIP')) AS required(column_name)
     WHERE required.column_name NOT IN (
         SELECT upper(trim(column_name))
           FROM information_schema.columns
          WHERE table_name = 'ahc_hrsn_2024_01_25_valid_admin_demographic')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'b10e248d-8c94-59ec-83fc-a1249dd3b111',
           'Missing Column',
           'Required column ' || column_name || ' is missing in ahc_hrsn_2024_01_25_valid_admin_demographic.',
           'Ensure ahc_hrsn_2024_01_25_valid_admin_demographic contains the column "' || column_name || '"'
      FROM required_column_names_in_src;
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('fa7874f6-f848-572b-a9ab-9db4c8d5e959', '05e8feaa-0bed-5909-a817-39812494b361', 'b10e248d-8c94-59ec-83fc-a1249dd3b111', 'ATTEMPT_EXCEL_INGEST', 'INGESTED_EXCEL_WORKBOOK_SHEET', NULL, 'AdminDemographicExcelSheetIngestSource.ingestSQL', (CURRENT_TIMESTAMP), NULL);

-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-2024-01-25-valid.xlsx (ahc_hrsn_2024_01_25_valid_screening)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('c302047e-21cf-5059-a32c-e81a9bd3a9b9', '05e8feaa-0bed-5909-a817-39812494b361', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-2024-01-25-valid.xlsx', 'ahc_hrsn_2024_01_25_valid_screening', NULL);
     
-- state management diagnostics 
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('3252fee6-3a9a-5f4c-81c6-739201046d79', '05e8feaa-0bed-5909-a817-39812494b361', 'c302047e-21cf-5059-a32c-e81a9bd3a9b9', 'ENTER(ingest)', 'ATTEMPT_EXCEL_INGEST', NULL, 'ScreeningExcelSheetIngestSource.ingestSQL', (CURRENT_TIMESTAMP), NULL);

-- ingest Excel workbook sheet 'Screening' into ahc_hrsn_2024_01_25_valid_screening using spatial plugin
INSTALL spatial; LOAD spatial;

-- be sure to add src_file_row_number and session_id columns to each row
-- because assurance CTEs require them
CREATE TABLE ahc_hrsn_2024_01_25_valid_screening AS
  SELECT *, row_number() OVER () as src_file_row_number, '05e8feaa-0bed-5909-a817-39812494b361' as session_id, 'c302047e-21cf-5059-a32c-e81a9bd3a9b9' as session_entry_id
    FROM st_read('support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-2024-01-25-valid.xlsx', layer='Screening', open_options=['HEADERS=FORCE', 'FIELD_TYPES=AUTO']);          

WITH required_column_names_in_src AS (
    SELECT column_name
      FROM (VALUES ('ANSWER_CODE_SYSTEM_NAME'), ('ANSWER_CODE'), ('ASSISTANCE_REQUESTED'), ('FACILITY ID (ASSIGNING AUTHORITY)'), ('MEAS_VALUE'), ('PARENT_QUESTION_CODE'), ('PAT_MRN_ID'), ('POTENTIAL_NEED_INDICATED'), ('QUESTION_CODE_SYSTEM_NAME'), ('QUESTION_CODE'), ('QUESTION'), ('RECORDED_TIME'), ('SCREENING_CODE_SYSTEM_NAME'), ('SCREENING_CODE'), ('SCREENING_METHOD'), ('SCREENING_NAME'), ('SDOH_DOMAIN'), ('UCUM_UNITS')) AS required(column_name)
     WHERE required.column_name NOT IN (
         SELECT upper(trim(column_name))
           FROM information_schema.columns
          WHERE table_name = 'ahc_hrsn_2024_01_25_valid_screening')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'c302047e-21cf-5059-a32c-e81a9bd3a9b9',
           'Missing Column',
           'Required column ' || column_name || ' is missing in ahc_hrsn_2024_01_25_valid_screening.',
           'Ensure ahc_hrsn_2024_01_25_valid_screening contains the column "' || column_name || '"'
      FROM required_column_names_in_src;
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('78d6a904-035e-54ae-8ac2-ca5cdf3f75f7', '05e8feaa-0bed-5909-a817-39812494b361', 'c302047e-21cf-5059-a32c-e81a9bd3a9b9', 'ATTEMPT_EXCEL_INGEST', 'INGESTED_EXCEL_WORKBOOK_SHEET', NULL, 'ScreeningExcelSheetIngestSource.ingestSQL', (CURRENT_TIMESTAMP), NULL);

-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-2024-01-25-valid.xlsx (ahc_hrsn_2024_01_25_valid_q_e_admin_data)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('9860873a-c387-5d98-9930-4ff296eb7192', '05e8feaa-0bed-5909-a817-39812494b361', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-2024-01-25-valid.xlsx', 'ahc_hrsn_2024_01_25_valid_q_e_admin_data', NULL);
     
-- state management diagnostics 
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('d5d6e25d-81b4-5f98-8b91-ea2dbc155a9c', '05e8feaa-0bed-5909-a817-39812494b361', '9860873a-c387-5d98-9930-4ff296eb7192', 'ENTER(ingest)', 'ATTEMPT_EXCEL_INGEST', NULL, 'QeAdminDataExcelSheetIngestSource.ingestSQL', (CURRENT_TIMESTAMP), NULL);

-- ingest Excel workbook sheet 'QE_Admin_Data' into ahc_hrsn_2024_01_25_valid_q_e_admin_data using spatial plugin
INSTALL spatial; LOAD spatial;

-- be sure to add src_file_row_number and session_id columns to each row
-- because assurance CTEs require them
CREATE TABLE ahc_hrsn_2024_01_25_valid_q_e_admin_data AS
  SELECT *, row_number() OVER () as src_file_row_number, '05e8feaa-0bed-5909-a817-39812494b361' as session_id, '9860873a-c387-5d98-9930-4ff296eb7192' as session_entry_id
    FROM st_read('support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-2024-01-25-valid.xlsx', layer='QE_Admin_Data', open_options=['HEADERS=FORCE', 'FIELD_TYPES=AUTO']);          

WITH required_column_names_in_src AS (
    SELECT column_name
      FROM (VALUES ('PAT_MRN_ID'), ('FACILITY ID (ASSIGNING AUTHORITY)'), ('FACILITY_LONG_NAME'), ('ORGANIZATION_TYPE'), ('FACILITY ADDRESS1'), ('FACILITY ADDRESS2'), ('FACILITY CITY'), ('FACILITY STATE'), ('FACILITY ZIP'), ('VISIT_PART_2_FLAG'), ('VISIT_OMH_FLAG'), ('VISIT_OPWDD_FLAG')) AS required(column_name)
     WHERE required.column_name NOT IN (
         SELECT upper(trim(column_name))
           FROM information_schema.columns
          WHERE table_name = 'ahc_hrsn_2024_01_25_valid_q_e_admin_data')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '9860873a-c387-5d98-9930-4ff296eb7192',
           'Missing Column',
           'Required column ' || column_name || ' is missing in ahc_hrsn_2024_01_25_valid_q_e_admin_data.',
           'Ensure ahc_hrsn_2024_01_25_valid_q_e_admin_data contains the column "' || column_name || '"'
      FROM required_column_names_in_src;
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('46171763-bd21-57a8-a403-0785f72643cf', '05e8feaa-0bed-5909-a817-39812494b361', '9860873a-c387-5d98-9930-4ff296eb7192', 'ATTEMPT_EXCEL_INGEST', 'INGESTED_EXCEL_WORKBOOK_SHEET', NULL, 'QeAdminDataExcelSheetIngestSource.ingestSQL', (CURRENT_TIMESTAMP), NULL);

-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail.csv (synthetic_fail)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('4971a2f5-06a3-5898-823d-364145d3b9a5', '05e8feaa-0bed-5909-a817-39812494b361', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail.csv', 'synthetic_fail', NULL);

-- state management diagnostics 
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('c2c0cbca-70cb-54f6-9dc7-66b47c4f3157', '05e8feaa-0bed-5909-a817-39812494b361', '4971a2f5-06a3-5898-823d-364145d3b9a5', 'ENTER(ingest)', 'ATTEMPT_CSV_INGEST', NULL, 'ScreeningCsvFileIngestSource.ingestSQL', (CURRENT_TIMESTAMP), NULL);

-- be sure to add src_file_row_number and session_id columns to each row
-- because assurance CTEs require them
CREATE TABLE synthetic_fail AS
  SELECT *, row_number() OVER () as src_file_row_number, '05e8feaa-0bed-5909-a817-39812494b361' as session_id, '4971a2f5-06a3-5898-823d-364145d3b9a5' as session_entry_id
    FROM read_csv_auto('support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail.csv');

WITH required_column_names_in_src AS (
    SELECT column_name
      FROM (VALUES ('ANSWER_CODE_SYSTEM_NAME'), ('ANSWER_CODE'), ('ENCOUNTER_ID'), ('FACILITY'), ('FIRST_NAME'), ('LAST_NAME'), ('MEAS_VALUE'), ('MEDICAID_CIN'), ('NEED_INDICATED'), ('PAT_BIRTH_DATE'), ('PAT_MRN_ID'), ('QUESTION_CODE_SYSTEM_NAME'), ('QUESTION_CODE'), ('QUESTION'), ('RECORDED_TIME'), ('SDOH_DOMAIN'), ('SURVEY_ID'), ('SURVEY'), ('VISIT_OMH_FLAG'), ('VISIT_OPWDD_FLAG'), ('VISIT_PART_2_FLAG')) AS required(column_name)
     WHERE required.column_name NOT IN (
         SELECT upper(trim(column_name))
           FROM information_schema.columns
          WHERE table_name = 'synthetic_fail')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '4971a2f5-06a3-5898-823d-364145d3b9a5',
           'Missing Column',
           'Required column ' || column_name || ' is missing in synthetic_fail.',
           'Ensure synthetic_fail contains the column "' || column_name || '"'
      FROM required_column_names_in_src;

INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('8640a4b5-53ef-506e-bcde-83f00315d4b2', '05e8feaa-0bed-5909-a817-39812494b361', '4971a2f5-06a3-5898-823d-364145d3b9a5', 'ATTEMPT_CSV_INGEST', 'INGESTED_CSV', NULL, 'ScreeningCsvFileIngestSource.ingestSQL', (CURRENT_TIMESTAMP), NULL);
    
SELECT session_entry_id, orch_session_issue_id, issue_type, issue_message, invalid_value FROM orch_session_issue WHERE session_id = '05e8feaa-0bed-5909-a817-39812494b361'
```
### `ingest` STDOUT (status: `0`)
```json
[{"session_entry_id":"641dff51-97fd-56b3-8443-c1ed568a6d66","orch_session_issue_id":"d70a4700-6b40-52fc-a7a2-69ef0d7f69ff","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet 'Admin_Demographic' not found in 'jrchc-hrsn-file-spec.xlsx' (available: Original Report, HeL LOINC Mapping)","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/jrchc-hrsn-file-spec.xlsx"},
{"session_entry_id":"47277588-99e8-59f5-8384-b24344a86073","orch_session_issue_id":"58b22e99-5854-53bf-adbe-08e67df99b85","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet 'Screening' not found in 'jrchc-hrsn-file-spec.xlsx' (available: Original Report, HeL LOINC Mapping)","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/jrchc-hrsn-file-spec.xlsx"},
{"session_entry_id":"a26ce332-3ced-5623-861d-23a2ef78e4a9","orch_session_issue_id":"bc0c03b5-d1ba-5301-850f-5e4c42c1bf09","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet 'QE_Admin_Data' not found in 'jrchc-hrsn-file-spec.xlsx' (available: Original Report, HeL LOINC Mapping)","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/jrchc-hrsn-file-spec.xlsx"},
{"session_entry_id":"ae477ba1-c7f1-5f34-847a-50bddb7130aa","orch_session_issue_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet 'Admin_Demographic' not found in 'synthetic-fail-excel-01.xlsx' (available: Sheet1)","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx"},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"7ef8bdeb-fd56-5eb9-a09b-ef15ce18dc49","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet 'Screening' not found in 'synthetic-fail-excel-01.xlsx' (available: Sheet1)","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx"},
{"session_entry_id":"591191c7-f693-5957-8734-ac87151ca981","orch_session_issue_id":"3b4eb0e5-6239-537a-8e67-e50e172e72a2","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet 'QE_Admin_Data' not found in 'synthetic-fail-excel-01.xlsx' (available: Sheet1)","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx"},
{"session_entry_id":"4971a2f5-06a3-5898-823d-364145d3b9a5","orch_session_issue_id":"51882d75-a8dc-4308-9a8a-b366137dfb44","issue_type":"Missing Column","issue_message":"Required column ANSWER_CODE_SYSTEM_NAME is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"4971a2f5-06a3-5898-823d-364145d3b9a5","orch_session_issue_id":"90659c26-dbe6-4a2d-88c1-767fea20c390","issue_type":"Missing Column","issue_message":"Required column ANSWER_CODE is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"4971a2f5-06a3-5898-823d-364145d3b9a5","orch_session_issue_id":"7f8c23b6-ec5f-4e21-a688-705475433a4b","issue_type":"Missing Column","issue_message":"Required column ENCOUNTER_ID is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"4971a2f5-06a3-5898-823d-364145d3b9a5","orch_session_issue_id":"27cce54c-21b9-4fcf-bb03-6766a610a92a","issue_type":"Missing Column","issue_message":"Required column FACILITY is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"4971a2f5-06a3-5898-823d-364145d3b9a5","orch_session_issue_id":"14cace53-063c-404f-88c2-e0cde943c0d7","issue_type":"Missing Column","issue_message":"Required column FIRST_NAME is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"4971a2f5-06a3-5898-823d-364145d3b9a5","orch_session_issue_id":"f75806f3-da75-4bab-bad1-ffd27fb2c4fd","issue_type":"Missing Column","issue_message":"Required column LAST_NAME is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"4971a2f5-06a3-5898-823d-364145d3b9a5","orch_session_issue_id":"feff8476-caad-46c1-9305-653fd37de259","issue_type":"Missing Column","issue_message":"Required column MEAS_VALUE is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"4971a2f5-06a3-5898-823d-364145d3b9a5","orch_session_issue_id":"1f4d121b-0d3e-4434-84fb-5421beb6e1ca","issue_type":"Missing Column","issue_message":"Required column MEDICAID_CIN is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"4971a2f5-06a3-5898-823d-364145d3b9a5","orch_session_issue_id":"4a16b1ee-bbd5-4263-9483-1fc6b5f4a3a6","issue_type":"Missing Column","issue_message":"Required column NEED_INDICATED is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"4971a2f5-06a3-5898-823d-364145d3b9a5","orch_session_issue_id":"4901cad7-1756-40e9-bd5e-5935b3ca6c65","issue_type":"Missing Column","issue_message":"Required column PAT_BIRTH_DATE is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"4971a2f5-06a3-5898-823d-364145d3b9a5","orch_session_issue_id":"510f128c-5a56-4870-afde-22e2854120fc","issue_type":"Missing Column","issue_message":"Required column PAT_MRN_ID is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"4971a2f5-06a3-5898-823d-364145d3b9a5","orch_session_issue_id":"9139dde1-1955-479e-a6ef-018eb0cb0a20","issue_type":"Missing Column","issue_message":"Required column QUESTION_CODE_SYSTEM_NAME is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"4971a2f5-06a3-5898-823d-364145d3b9a5","orch_session_issue_id":"42a5b339-5f74-45cb-aed5-286ce9433657","issue_type":"Missing Column","issue_message":"Required column QUESTION_CODE is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"4971a2f5-06a3-5898-823d-364145d3b9a5","orch_session_issue_id":"c03e6c01-7393-4cd3-b9b8-3a7513f0ea13","issue_type":"Missing Column","issue_message":"Required column QUESTION is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"4971a2f5-06a3-5898-823d-364145d3b9a5","orch_session_issue_id":"a1c6fbd8-12ab-40a7-83a0-2046d8cb62d5","issue_type":"Missing Column","issue_message":"Required column RECORDED_TIME is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"4971a2f5-06a3-5898-823d-364145d3b9a5","orch_session_issue_id":"eb8382fe-9d65-4c8e-949c-6225499e22d3","issue_type":"Missing Column","issue_message":"Required column SDOH_DOMAIN is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"4971a2f5-06a3-5898-823d-364145d3b9a5","orch_session_issue_id":"69bb3e9d-5d5c-455d-9e92-28d2b8fc98e3","issue_type":"Missing Column","issue_message":"Required column SURVEY_ID is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"4971a2f5-06a3-5898-823d-364145d3b9a5","orch_session_issue_id":"ebed3434-1c6f-4567-af7f-5d572715b5a2","issue_type":"Missing Column","issue_message":"Required column SURVEY is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"4971a2f5-06a3-5898-823d-364145d3b9a5","orch_session_issue_id":"47f07035-3683-4016-9cbe-2780f4a21358","issue_type":"Missing Column","issue_message":"Required column VISIT_OMH_FLAG is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"4971a2f5-06a3-5898-823d-364145d3b9a5","orch_session_issue_id":"1e7e9f5d-d760-4fe4-b5e4-375c7d4876c5","issue_type":"Missing Column","issue_message":"Required column VISIT_OPWDD_FLAG is missing in synthetic_fail.","invalid_value":null},
{"session_entry_id":"4971a2f5-06a3-5898-823d-364145d3b9a5","orch_session_issue_id":"b1b5fb6f-7b71-4f49-9901-428873bb9368","issue_type":"Missing Column","issue_message":"Required column VISIT_PART_2_FLAG is missing in synthetic_fail.","invalid_value":null}]

```
No STDERR emitted by `ingest`.

    

## ensureContent

```sql
-- preambleSQL
SET autoinstall_known_extensions=true;
SET autoload_known_extensions=true;
-- end preambleSQL
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('10d0290c-b2eb-581e-b627-b5b8fcbb830f', '05e8feaa-0bed-5909-a817-39812494b361', '8b7c669c-1795-5f6b-8f3a-3e502b74c628', 'INGESTED_CSV', 'ATTEMPT_CSV_ASSURANCE', NULL, 'ScreeningCsvFileIngestSource.assuranceSQL', (CURRENT_TIMESTAMP), NULL);

WITH mandatory_value AS (
    SELECT 'PAT_MRN_ID' AS issue_column,
           "PAT_MRN_ID" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_12_valid"
     WHERE "PAT_MRN_ID" IS NULL
        OR TRIM("PAT_MRN_ID") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH numeric_value_in_all_rows AS (
    SELECT 'PAT_MRN_ID' AS issue_column,
           "PAT_MRN_ID" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_12_valid"
     WHERE "PAT_MRN_ID" IS NOT NULL
       AND "PAT_MRN_ID" NOT SIMILAR TO '^[+-]?[0-9]+$'
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Data Type Mismatch',
           issue_row,
           issue_column,
           invalid_value,
           'Non-integer value "' || invalid_value || '" found in ' || issue_column,
           'Convert non-integer values to INTEGER'
      FROM numeric_value_in_all_rows;
WITH mandatory_value AS (
    SELECT 'FIRST_NAME' AS issue_column,
           "FIRST_NAME" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_12_valid"
     WHERE "FIRST_NAME" IS NULL
        OR TRIM("FIRST_NAME") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH pattern AS (
    SELECT 'FIRST_NAME' AS issue_column,
           "FIRST_NAME" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_12_valid"
     WHERE "FIRST_NAME" NOT SIMILAR TO '^[A-Za-z]+$'
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Pattern Mismatch',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' does not match the pattern ^[A-Za-z]+$',
           'Follow the pattern ^[A-Za-z]+$ in ' || issue_column
      FROM pattern;
WITH mandatory_value AS (
    SELECT 'LAST_NAME' AS issue_column,
           "LAST_NAME" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_12_valid"
     WHERE "LAST_NAME" IS NULL
        OR TRIM("LAST_NAME") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH pattern AS (
    SELECT 'LAST_NAME' AS issue_column,
           "LAST_NAME" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_12_valid"
     WHERE "LAST_NAME" NOT SIMILAR TO '^[A-Za-z]+$'
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Pattern Mismatch',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' does not match the pattern ^[A-Za-z]+$',
           'Follow the pattern ^[A-Za-z]+$ in ' || issue_column
      FROM pattern;
WITH mandatory_value AS (
    SELECT 'PAT_BIRTH_DATE' AS issue_column,
           "PAT_BIRTH_DATE" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_12_valid"
     WHERE "PAT_BIRTH_DATE" IS NULL
        OR TRIM("PAT_BIRTH_DATE") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH valid_birth_date_in_all_rows AS (
    SELECT 'PAT_BIRTH_DATE' AS issue_column,
           "PAT_BIRTH_DATE" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_12_valid"
     WHERE "PAT_BIRTH_DATE" IS NOT NULL
       AND TRY_CAST("PAT_BIRTH_DATE" AS DATE) IS NULL
       AND EXTRACT(YEAR FROM TRY_CAST("PAT_BIRTH_DATE" AS TIMESTAMP)) < 1915
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Invalid Date',
           issue_row,
           issue_column,
           invalid_value,
           'Invalid Birth Date "' || invalid_value || '" found in ' || issue_column,
           'Provide a valid birthdate on or after 1915.'
      FROM valid_birth_date_in_all_rows;
WITH mandatory_value AS (
    SELECT 'MEDICAID_CIN' AS issue_column,
           "MEDICAID_CIN" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_12_valid"
     WHERE "MEDICAID_CIN" IS NULL
        OR TRIM("MEDICAID_CIN") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH numeric_value_in_all_rows AS (
    SELECT 'MEDICAID_CIN' AS issue_column,
           "MEDICAID_CIN" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_12_valid"
     WHERE "MEDICAID_CIN" IS NOT NULL
       AND "MEDICAID_CIN" NOT SIMILAR TO '^[+-]?[0-9]+$'
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Data Type Mismatch',
           issue_row,
           issue_column,
           invalid_value,
           'Non-integer value "' || invalid_value || '" found in ' || issue_column,
           'Convert non-integer values to INTEGER'
      FROM numeric_value_in_all_rows; 
WITH mandatory_value AS (
    SELECT 'ENCOUNTER_ID' AS issue_column,
           "ENCOUNTER_ID" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_12_valid"
     WHERE "ENCOUNTER_ID" IS NULL
        OR TRIM("ENCOUNTER_ID") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH mandatory_value AS (
    SELECT 'RECORDED_TIME' AS issue_column,
           "RECORDED_TIME" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_12_valid"
     WHERE "RECORDED_TIME" IS NULL
        OR TRIM("RECORDED_TIME") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value; 
WITH valid_date_time_in_all_rows AS (
    SELECT 'RECORDED_TIME' AS issue_column,
           "RECORDED_TIME" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_12_valid"
     WHERE "RECORDED_TIME" IS NOT NULL
       AND TRY_CAST("RECORDED_TIME" AS TIMESTAMP) IS NULL
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Invalid Date',
           issue_row,
           issue_column,
           invalid_value,
           'Invalid timestamp "' || invalid_value || '" found in ' || issue_column,
           'Please be sure to provide both a valid date and time.'
      FROM valid_date_time_in_all_rows;
WITH mandatory_value AS (
    SELECT 'QUESTION' AS issue_column,
           "QUESTION" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_12_valid"
     WHERE "QUESTION" IS NULL
        OR TRIM("QUESTION") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH mandatory_value AS (
    SELECT 'MEAS_VALUE' AS issue_column,
           "MEAS_VALUE" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_12_valid"
     WHERE "MEAS_VALUE" IS NULL
        OR TRIM("MEAS_VALUE") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value; 
WITH mandatory_value AS (
    SELECT 'QUESTION_CODE' AS issue_column,
           "QUESTION_CODE" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_12_valid"
     WHERE "QUESTION_CODE" IS NULL
        OR TRIM("QUESTION_CODE") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH allowed_values AS (
    SELECT 'QUESTION_CODE' AS issue_column,
           "QUESTION_CODE" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_12_valid"
     WHERE "QUESTION_CODE" NOT IN ('71802-3','96778-6')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''71802-3'',''96778-6'')',
           'Use only allowed values ''71802-3'',''96778-6'' in ' || issue_column
      FROM allowed_values;
WITH mandatory_value AS (
    SELECT 'ANSWER_CODE' AS issue_column,
           "ANSWER_CODE" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_12_valid"
     WHERE "ANSWER_CODE" IS NULL
        OR TRIM("ANSWER_CODE") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH mandatory_value AS (
    SELECT 'ANSWER_CODE_SYSTEM_NAME' AS issue_column,
           "ANSWER_CODE_SYSTEM_NAME" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_12_valid"
     WHERE "ANSWER_CODE_SYSTEM_NAME" IS NULL
        OR TRIM("ANSWER_CODE_SYSTEM_NAME") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH mandatory_value AS (
    SELECT 'SDOH_DOMAIN' AS issue_column,
           "SDOH_DOMAIN" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_12_valid"
     WHERE "SDOH_DOMAIN" IS NULL
        OR TRIM("SDOH_DOMAIN") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH mandatory_value AS (
    SELECT 'NEED_INDICATED' AS issue_column,
           "NEED_INDICATED" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_12_valid"
     WHERE "NEED_INDICATED" IS NULL
        OR TRIM("NEED_INDICATED") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH allowed_values AS (
    SELECT 'NEED_INDICATED' AS issue_column,
           "NEED_INDICATED" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_12_valid"
     WHERE "NEED_INDICATED" NOT IN ('TRUE','FALSE')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''TRUE'',''FALSE'')',
           'Use only allowed values ''TRUE'',''FALSE'' in ' || issue_column
      FROM allowed_values;
WITH mandatory_value AS (
    SELECT 'VISIT_PART_2_FLAG' AS issue_column,
           "VISIT_PART_2_FLAG" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_12_valid"
     WHERE "VISIT_PART_2_FLAG" IS NULL
        OR TRIM("VISIT_PART_2_FLAG") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH allowed_values AS (
    SELECT 'VISIT_PART_2_FLAG' AS issue_column,
           "VISIT_PART_2_FLAG" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_12_valid"
     WHERE "VISIT_PART_2_FLAG" NOT IN ('TRUE','FALSE')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''TRUE'',''FALSE'')',
           'Use only allowed values ''TRUE'',''FALSE'' in ' || issue_column
      FROM allowed_values;
WITH mandatory_value AS (
    SELECT 'VISIT_OMH_FLAG' AS issue_column,
           "VISIT_OMH_FLAG" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_12_valid"
     WHERE "VISIT_OMH_FLAG" IS NULL
        OR TRIM("VISIT_OMH_FLAG") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH allowed_values AS (
    SELECT 'VISIT_OMH_FLAG' AS issue_column,
           "VISIT_OMH_FLAG" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_12_valid"
     WHERE "VISIT_OMH_FLAG" NOT IN ('TRUE','FALSE')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''TRUE'',''FALSE'')',
           'Use only allowed values ''TRUE'',''FALSE'' in ' || issue_column
      FROM allowed_values;
WITH mandatory_value AS (
    SELECT 'VISIT_OPWDD_FLAG' AS issue_column,
           "VISIT_OPWDD_FLAG" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_12_valid"
     WHERE "VISIT_OPWDD_FLAG" IS NULL
        OR TRIM("VISIT_OPWDD_FLAG") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH allowed_values AS (
    SELECT 'VISIT_OPWDD_FLAG' AS issue_column,
           "VISIT_OPWDD_FLAG" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_12_valid"
     WHERE "VISIT_OPWDD_FLAG" NOT IN ('TRUE','FALSE')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''TRUE'',''FALSE'')',
           'Use only allowed values ''TRUE'',''FALSE'' in ' || issue_column
      FROM allowed_values;

INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('5b77d127-e62a-50a9-acee-bea63ff64dd5', '05e8feaa-0bed-5909-a817-39812494b361', '8b7c669c-1795-5f6b-8f3a-3e502b74c628', 'ATTEMPT_CSV_ASSURANCE', 'ASSURED_CSV', NULL, 'ScreeningCsvFileIngestSource.assuranceSQL', (CURRENT_TIMESTAMP), NULL);
    
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('e6951d0b-be59-58c3-8a04-01181208c601', '05e8feaa-0bed-5909-a817-39812494b361', '071f8fe1-4899-5c71-9c86-7d7377661d45', 'INGESTED_EXCEL_WORKBOOK_SHEET', 'ATTEMPT_EXCEL_WORKBOOK_SHEET_ASSURANCE', NULL, 'AdminDemographicExcelSheetIngestSource.assuranceSQL', (CURRENT_TIMESTAMP), NULL);


WITH mandatory_value AS (
    SELECT 'FIRST_NAME' AS issue_column,
           "FIRST_NAME" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_25_valid_admin_demographic"
     WHERE "FIRST_NAME" IS NULL
        OR TRIM("FIRST_NAME") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '071f8fe1-4899-5c71-9c86-7d7377661d45',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH pattern AS (
    SELECT 'FIRST_NAME' AS issue_column,
           "FIRST_NAME" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_25_valid_admin_demographic"
     WHERE "FIRST_NAME" NOT SIMILAR TO '^[A-Za-z]+$'
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '071f8fe1-4899-5c71-9c86-7d7377661d45',
           'Pattern Mismatch',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' does not match the pattern ^[A-Za-z]+$',
           'Follow the pattern ^[A-Za-z]+$ in ' || issue_column
      FROM pattern;
WITH pattern AS (
    SELECT 'MIDDLE_NAME' AS issue_column,
           "MIDDLE_NAME" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_25_valid_admin_demographic"
     WHERE "MIDDLE_NAME" NOT SIMILAR TO '^[A-Za-z]+$'
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '071f8fe1-4899-5c71-9c86-7d7377661d45',
           'Pattern Mismatch',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' does not match the pattern ^[A-Za-z]+$',
           'Follow the pattern ^[A-Za-z]+$ in ' || issue_column
      FROM pattern;
WITH mandatory_value AS (
    SELECT 'LAST_NAME' AS issue_column,
           "LAST_NAME" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_25_valid_admin_demographic"
     WHERE "LAST_NAME" IS NULL
        OR TRIM("LAST_NAME") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '071f8fe1-4899-5c71-9c86-7d7377661d45',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH pattern AS (
    SELECT 'LAST_NAME' AS issue_column,
           "LAST_NAME" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_25_valid_admin_demographic"
     WHERE "LAST_NAME" NOT SIMILAR TO '^[A-Za-z]+$'
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '071f8fe1-4899-5c71-9c86-7d7377661d45',
           'Pattern Mismatch',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' does not match the pattern ^[A-Za-z]+$',
           'Follow the pattern ^[A-Za-z]+$ in ' || issue_column
      FROM pattern; 
WITH mandatory_value AS (
    SELECT 'ADMINISTRATIVE_SEX' AS issue_column,
           "ADMINISTRATIVE_SEX" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_25_valid_admin_demographic"
     WHERE "ADMINISTRATIVE_SEX" IS NULL
        OR TRIM("ADMINISTRATIVE_SEX") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '071f8fe1-4899-5c71-9c86-7d7377661d45',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value; 
WITH allowed_values AS (
    SELECT 'ADMINISTRATIVE_SEX' AS issue_column,
           "ADMINISTRATIVE_SEX" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_25_valid_admin_demographic"
     WHERE "ADMINISTRATIVE_SEX" NOT IN ('M','F','X')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '071f8fe1-4899-5c71-9c86-7d7377661d45',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''M'',''F'',''X'')',
           'Use only allowed values ''M'',''F'',''X'' in ' || issue_column
      FROM allowed_values;   
WITH allowed_values AS (
    SELECT 'SEX_AT_BIRTH' AS issue_column,
           "SEX_AT_BIRTH" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_25_valid_admin_demographic"
     WHERE "SEX_AT_BIRTH" NOT IN ('M','F','X')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '071f8fe1-4899-5c71-9c86-7d7377661d45',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''M'',''F'',''X'')',
           'Use only allowed values ''M'',''F'',''X'' in ' || issue_column
      FROM allowed_values; 
WITH mandatory_value AS (
    SELECT 'PAT_BIRTH_DATE' AS issue_column,
           "PAT_BIRTH_DATE" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_25_valid_admin_demographic"
     WHERE "PAT_BIRTH_DATE" IS NULL
        OR TRIM("PAT_BIRTH_DATE") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '071f8fe1-4899-5c71-9c86-7d7377661d45',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH valid_birth_date_in_all_rows AS (
    SELECT 'PAT_BIRTH_DATE' AS issue_column,
           "PAT_BIRTH_DATE" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_25_valid_admin_demographic"
     WHERE "PAT_BIRTH_DATE" IS NOT NULL
       AND TRY_CAST("PAT_BIRTH_DATE" AS DATE) IS NULL
       AND EXTRACT(YEAR FROM TRY_CAST("PAT_BIRTH_DATE" AS TIMESTAMP)) < 1915
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '071f8fe1-4899-5c71-9c86-7d7377661d45',
           'Invalid Date',
           issue_row,
           issue_column,
           invalid_value,
           'Invalid Birth Date "' || invalid_value || '" found in ' || issue_column,
           'Provide a valid birthdate on or after 1915.'
      FROM valid_birth_date_in_all_rows;
WITH mandatory_value AS (
    SELECT 'CITY' AS issue_column,
           "CITY" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_25_valid_admin_demographic"
     WHERE "CITY" IS NULL
        OR TRIM("CITY") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '071f8fe1-4899-5c71-9c86-7d7377661d45',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH mandatory_value AS (
    SELECT 'STATE' AS issue_column,
           "STATE" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_25_valid_admin_demographic"
     WHERE "STATE" IS NULL
        OR TRIM("STATE") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '071f8fe1-4899-5c71-9c86-7d7377661d45',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH allowed_values AS (
    SELECT 'STATE' AS issue_column,
           "STATE" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_25_valid_admin_demographic"
     WHERE "STATE" NOT IN ('NY', 'New York')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '071f8fe1-4899-5c71-9c86-7d7377661d45',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''NY'', ''New York'')',
           'Use only allowed values ''NY'', ''New York'' in ' || issue_column
      FROM allowed_values;
WITH mandatory_value AS (
    SELECT 'ZIP' AS issue_column,
           "ZIP" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_25_valid_admin_demographic"
     WHERE "ZIP" IS NULL
        OR TRIM("ZIP") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '071f8fe1-4899-5c71-9c86-7d7377661d45',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH allowed_values AS (
    SELECT 'GENDER_IDENTITY_CODE_SYSTEM_NAME' AS issue_column,
           "GENDER_IDENTITY_CODE_SYSTEM_NAME" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_25_valid_admin_demographic"
     WHERE "GENDER_IDENTITY_CODE_SYSTEM_NAME" NOT IN ('SNOMED-CT','SNOMED')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '071f8fe1-4899-5c71-9c86-7d7377661d45',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''SNOMED-CT'',''SNOMED'')',
           'Use only allowed values ''SNOMED-CT'',''SNOMED'' in ' || issue_column
      FROM allowed_values;
WITH allowed_values AS (
    SELECT 'SEXUAL_ORIENTATION_CODE_SYSTEM_NAME' AS issue_column,
           "SEXUAL_ORIENTATION_CODE_SYSTEM_NAME" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_25_valid_admin_demographic"
     WHERE "SEXUAL_ORIENTATION_CODE_SYSTEM_NAME" NOT IN ('SNOMED-CT','SNOMED')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '071f8fe1-4899-5c71-9c86-7d7377661d45',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''SNOMED-CT'',''SNOMED'')',
           'Use only allowed values ''SNOMED-CT'',''SNOMED'' in ' || issue_column
      FROM allowed_values;
WITH allowed_values AS (
    SELECT 'SEXUAL_ORIENTATION_DESCRIPTION' AS issue_column,
           "SEXUAL_ORIENTATION_DESCRIPTION" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_25_valid_admin_demographic"
     WHERE "SEXUAL_ORIENTATION_DESCRIPTION" NOT IN ('Bisexual','Heterosexual','Homosexual','other','unknown')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '071f8fe1-4899-5c71-9c86-7d7377661d45',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''Bisexual'',''Heterosexual'',''Homosexual'',''other'',''unknown'')',
           'Use only allowed values ''Bisexual'',''Heterosexual'',''Homosexual'',''other'',''unknown'' in ' || issue_column
      FROM allowed_values;
WITH allowed_values AS (
    SELECT 'SEXUAL_ORIENTATION_DESCRIPTION' AS issue_column,
           "SEXUAL_ORIENTATION_DESCRIPTION" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_25_valid_admin_demographic"
     WHERE "SEXUAL_ORIENTATION_DESCRIPTION" NOT IN ('ISO','ISO 639-2')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '071f8fe1-4899-5c71-9c86-7d7377661d45',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''ISO'',''ISO 639-2'')',
           'Use only allowed values ''ISO'',''ISO 639-2'' in ' || issue_column
      FROM allowed_values;
WITH allowed_values AS (
    SELECT 'RACE_CODE_SYSTEM_NAME' AS issue_column,
           "RACE_CODE_SYSTEM_NAME" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_25_valid_admin_demographic"
     WHERE "RACE_CODE_SYSTEM_NAME" NOT IN ('CDC','CDCRE')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '071f8fe1-4899-5c71-9c86-7d7377661d45',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''CDC'',''CDCRE'')',
           'Use only allowed values ''CDC'',''CDCRE'' in ' || issue_column
      FROM allowed_values;
WITH allowed_values AS (
    SELECT 'ETHNICITY_CODE_SYSTEM_NAME' AS issue_column,
           "ETHNICITY_CODE_SYSTEM_NAME" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_25_valid_admin_demographic"
     WHERE "ETHNICITY_CODE_SYSTEM_NAME" NOT IN ('CDC','CDCRE')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '071f8fe1-4899-5c71-9c86-7d7377661d45',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''CDC'',''CDCRE'')',
           'Use only allowed values ''CDC'',''CDCRE'' in ' || issue_column
      FROM allowed_values;
WITH mandatory_value AS (
    SELECT 'MPI_ID' AS issue_column,
           "MPI_ID" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_25_valid_admin_demographic"
     WHERE "MPI_ID" IS NULL
        OR TRIM("MPI_ID") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '071f8fe1-4899-5c71-9c86-7d7377661d45',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value; 
WITH mandatory_value AS (
    SELECT 'PAT_MRN_ID' AS issue_column,
           "PAT_MRN_ID" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_25_valid_admin_demographic"
     WHERE "PAT_MRN_ID" IS NULL
        OR TRIM("PAT_MRN_ID") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '071f8fe1-4899-5c71-9c86-7d7377661d45',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH mandatory_value AS (
    SELECT 'FACILITY ID (Assigning authority)' AS issue_column,
           "FACILITY ID (Assigning authority)" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_25_valid_admin_demographic"
     WHERE "FACILITY ID (Assigning authority)" IS NULL
        OR TRIM("FACILITY ID (Assigning authority)") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '071f8fe1-4899-5c71-9c86-7d7377661d45',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
    
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('a92a6466-6fe4-58d7-8948-e2e09dc2fec2', '05e8feaa-0bed-5909-a817-39812494b361', '071f8fe1-4899-5c71-9c86-7d7377661d45', 'ATTEMPT_EXCEL_WORKBOOK_SHEET_ASSURANCE', 'ASSURED_EXCEL_WORKBOOK_SHEET', NULL, 'AdminDemographicExcelSheetIngestSource.assuranceSQL', (CURRENT_TIMESTAMP), NULL);
    
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('2afb3098-bcfd-5a54-8ebb-4d65d399c55e', '05e8feaa-0bed-5909-a817-39812494b361', 'a3fe7098-8ae8-5612-81ac-cbe10780c19b', 'INGESTED_EXCEL_WORKBOOK_SHEET', 'ATTEMPT_EXCEL_WORKBOOK_SHEET_ASSURANCE', NULL, 'ScreeningExcelSheetIngestSource.assuranceSQL', (CURRENT_TIMESTAMP), NULL);

WITH mandatory_value AS (
    SELECT 'PAT_MRN_ID' AS issue_column,
           "PAT_MRN_ID" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_25_valid_screening"
     WHERE "PAT_MRN_ID" IS NULL
        OR TRIM("PAT_MRN_ID") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'a3fe7098-8ae8-5612-81ac-cbe10780c19b',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH mandatory_value AS (
    SELECT 'FACILITY ID (Assigning authority)' AS issue_column,
           "FACILITY ID (Assigning authority)" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_25_valid_screening"
     WHERE "FACILITY ID (Assigning authority)" IS NULL
        OR TRIM("FACILITY ID (Assigning authority)") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'a3fe7098-8ae8-5612-81ac-cbe10780c19b',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH mandatory_value AS (
    SELECT 'SCREENING_NAME' AS issue_column,
           "SCREENING_NAME" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_25_valid_screening"
     WHERE "SCREENING_NAME" IS NULL
        OR TRIM("SCREENING_NAME") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'a3fe7098-8ae8-5612-81ac-cbe10780c19b',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH mandatory_value AS (
    SELECT 'SCREENING_CODE_SYSTEM_NAME' AS issue_column,
           "SCREENING_CODE_SYSTEM_NAME" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_25_valid_screening"
     WHERE "SCREENING_CODE_SYSTEM_NAME" IS NULL
        OR TRIM("SCREENING_CODE_SYSTEM_NAME") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'a3fe7098-8ae8-5612-81ac-cbe10780c19b',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH allowed_values AS (
    SELECT 'SCREENING_CODE_SYSTEM_NAME' AS issue_column,
           "SCREENING_CODE_SYSTEM_NAME" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_25_valid_screening"
     WHERE "SCREENING_CODE_SYSTEM_NAME" NOT IN ('LN', 'LOINC')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'a3fe7098-8ae8-5612-81ac-cbe10780c19b',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''LN'', ''LOINC'')',
           'Use only allowed values ''LN'', ''LOINC'' in ' || issue_column
      FROM allowed_values;
WITH mandatory_value AS (
    SELECT 'SCREENING_CODE' AS issue_column,
           "SCREENING_CODE" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_25_valid_screening"
     WHERE "SCREENING_CODE" IS NULL
        OR TRIM("SCREENING_CODE") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'a3fe7098-8ae8-5612-81ac-cbe10780c19b',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH allowed_values AS (
    SELECT 'SCREENING_METHOD' AS issue_column,
           "SCREENING_METHOD" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_25_valid_screening"
     WHERE "SCREENING_METHOD" NOT IN ('In-Person', 'Phone', 'Website')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'a3fe7098-8ae8-5612-81ac-cbe10780c19b',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''In-Person'', ''Phone'', ''Website'')',
           'Use only allowed values ''In-Person'', ''Phone'', ''Website'' in ' || issue_column
      FROM allowed_values;
WITH mandatory_value AS (
    SELECT 'RECORDED_TIME' AS issue_column,
           "RECORDED_TIME" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_25_valid_screening"
     WHERE "RECORDED_TIME" IS NULL
        OR TRIM("RECORDED_TIME") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'a3fe7098-8ae8-5612-81ac-cbe10780c19b',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value; 
WITH valid_date_time_in_all_rows AS (
    SELECT 'RECORDED_TIME' AS issue_column,
           "RECORDED_TIME" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_25_valid_screening"
     WHERE "RECORDED_TIME" IS NOT NULL
       AND TRY_CAST("RECORDED_TIME" AS TIMESTAMP) IS NULL
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'a3fe7098-8ae8-5612-81ac-cbe10780c19b',
           'Invalid Date',
           issue_row,
           issue_column,
           invalid_value,
           'Invalid timestamp "' || invalid_value || '" found in ' || issue_column,
           'Please be sure to provide both a valid date and time.'
      FROM valid_date_time_in_all_rows;
WITH mandatory_value AS (
    SELECT 'QUESTION' AS issue_column,
           "QUESTION" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_25_valid_screening"
     WHERE "QUESTION" IS NULL
        OR TRIM("QUESTION") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'a3fe7098-8ae8-5612-81ac-cbe10780c19b',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH mandatory_value AS (
    SELECT 'MEAS_VALUE' AS issue_column,
           "MEAS_VALUE" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_25_valid_screening"
     WHERE "MEAS_VALUE" IS NULL
        OR TRIM("MEAS_VALUE") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'a3fe7098-8ae8-5612-81ac-cbe10780c19b',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;      
WITH mandatory_value AS (
    SELECT 'QUESTION_CODE' AS issue_column,
           "QUESTION_CODE" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_25_valid_screening"
     WHERE "QUESTION_CODE" IS NULL
        OR TRIM("QUESTION_CODE") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'a3fe7098-8ae8-5612-81ac-cbe10780c19b',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH mandatory_value AS (
    SELECT 'QUESTION_CODE_SYSTEM_NAME' AS issue_column,
           "QUESTION_CODE_SYSTEM_NAME" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_25_valid_screening"
     WHERE "QUESTION_CODE_SYSTEM_NAME" IS NULL
        OR TRIM("QUESTION_CODE_SYSTEM_NAME") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'a3fe7098-8ae8-5612-81ac-cbe10780c19b',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH allowed_values AS (
    SELECT 'QUESTION_CODE_SYSTEM_NAME' AS issue_column,
           "QUESTION_CODE_SYSTEM_NAME" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_25_valid_screening"
     WHERE "QUESTION_CODE_SYSTEM_NAME" NOT IN ('LN','LOIN')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'a3fe7098-8ae8-5612-81ac-cbe10780c19b',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''LN'',''LOIN'')',
           'Use only allowed values ''LN'',''LOIN'' in ' || issue_column
      FROM allowed_values;
WITH mandatory_value AS (
    SELECT 'ANSWER_CODE' AS issue_column,
           "ANSWER_CODE" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_25_valid_screening"
     WHERE "ANSWER_CODE" IS NULL
        OR TRIM("ANSWER_CODE") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'a3fe7098-8ae8-5612-81ac-cbe10780c19b',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH mandatory_value AS (
    SELECT 'ANSWER_CODE_SYSTEM_NAME' AS issue_column,
           "ANSWER_CODE_SYSTEM_NAME" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_25_valid_screening"
     WHERE "ANSWER_CODE_SYSTEM_NAME" IS NULL
        OR TRIM("ANSWER_CODE_SYSTEM_NAME") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'a3fe7098-8ae8-5612-81ac-cbe10780c19b',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH allowed_values AS (
    SELECT 'ANSWER_CODE_SYSTEM_NAME' AS issue_column,
           "ANSWER_CODE_SYSTEM_NAME" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_25_valid_screening"
     WHERE "ANSWER_CODE_SYSTEM_NAME" NOT IN ('LN','LOIN')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'a3fe7098-8ae8-5612-81ac-cbe10780c19b',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''LN'',''LOIN'')',
           'Use only allowed values ''LN'',''LOIN'' in ' || issue_column
      FROM allowed_values;
WITH mandatory_value AS (
    SELECT 'SDOH_DOMAIN' AS issue_column,
           "SDOH_DOMAIN" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_25_valid_screening"
     WHERE "SDOH_DOMAIN" IS NULL
        OR TRIM("SDOH_DOMAIN") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'a3fe7098-8ae8-5612-81ac-cbe10780c19b',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH mandatory_value AS (
    SELECT 'POTENTIAL_NEED_INDICATED' AS issue_column,
           "POTENTIAL_NEED_INDICATED" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_25_valid_screening"
     WHERE "POTENTIAL_NEED_INDICATED" IS NULL
        OR TRIM("POTENTIAL_NEED_INDICATED") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'a3fe7098-8ae8-5612-81ac-cbe10780c19b',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH allowed_values AS (
    SELECT 'POTENTIAL_NEED_INDICATED' AS issue_column,
           "POTENTIAL_NEED_INDICATED" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_25_valid_screening"
     WHERE "POTENTIAL_NEED_INDICATED" NOT IN ('Yes','No')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'a3fe7098-8ae8-5612-81ac-cbe10780c19b',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''Yes'',''No'')',
           'Use only allowed values ''Yes'',''No'' in ' || issue_column
      FROM allowed_values;
WITH allowed_values AS (
    SELECT 'ASSISTANCE_REQUESTED' AS issue_column,
           "ASSISTANCE_REQUESTED" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_25_valid_screening"
     WHERE "ASSISTANCE_REQUESTED" NOT IN ('Yes','No')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'a3fe7098-8ae8-5612-81ac-cbe10780c19b',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''Yes'',''No'')',
           'Use only allowed values ''Yes'',''No'' in ' || issue_column
      FROM allowed_values;
    
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('6fcd9df5-34cf-5c09-8fb5-e73617e28d73', '05e8feaa-0bed-5909-a817-39812494b361', 'a3fe7098-8ae8-5612-81ac-cbe10780c19b', 'ATTEMPT_EXCEL_WORKBOOK_SHEET_ASSURANCE', 'ASSURED_EXCEL_WORKBOOK_SHEET', NULL, 'ScreeningExcelSheetIngestSource.assuranceSQL', (CURRENT_TIMESTAMP), NULL);
    
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('0e074bf2-f1fe-55d4-bd44-a88cbed79aeb', '05e8feaa-0bed-5909-a817-39812494b361', '89f7ec04-277a-5799-afaa-a70d0f2a8ed5', 'INGESTED_EXCEL_WORKBOOK_SHEET', 'ATTEMPT_EXCEL_WORKBOOK_SHEET_ASSURANCE', NULL, 'QeAdminDataExcelSheetIngestSource.assuranceSQL', (CURRENT_TIMESTAMP), NULL);

WITH mandatory_value AS (
    SELECT 'PAT_MRN_ID' AS issue_column,
           "PAT_MRN_ID" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_25_valid_q_e_admin_data"
     WHERE "PAT_MRN_ID" IS NULL
        OR TRIM("PAT_MRN_ID") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '89f7ec04-277a-5799-afaa-a70d0f2a8ed5',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH mandatory_value AS (
    SELECT 'FACILITY ID (Assigning authority)' AS issue_column,
           "FACILITY ID (Assigning authority)" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_25_valid_q_e_admin_data"
     WHERE "FACILITY ID (Assigning authority)" IS NULL
        OR TRIM("FACILITY ID (Assigning authority)") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '89f7ec04-277a-5799-afaa-a70d0f2a8ed5',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH unique_value AS (
    SELECT 'FACILITY ID (Assigning authority)' AS issue_column,
           "FACILITY ID (Assigning authority)" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_25_valid_q_e_admin_data"
     WHERE "FACILITY ID (Assigning authority)" IS NOT NULL
       AND "FACILITY ID (Assigning authority)" IN (
          SELECT "FACILITY ID (Assigning authority)"
            FROM "ahc_hrsn_2023_12_25_valid_q_e_admin_data"
        GROUP BY "FACILITY ID (Assigning authority)"
          HAVING COUNT(*) > 1)
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '89f7ec04-277a-5799-afaa-a70d0f2a8ed5',
           'Unique Value Violation',
           issue_row,
           issue_column,
           invalid_value,
           'Duplicate value "' || invalid_value || '" found in ' || issue_column,
           'Ensure each value in column6 is unique'
      FROM unique_value;
WITH mandatory_value AS (
    SELECT 'FACILITY_LONG_NAME' AS issue_column,
           "FACILITY_LONG_NAME" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_25_valid_q_e_admin_data"
     WHERE "FACILITY_LONG_NAME" IS NULL
        OR TRIM("FACILITY_LONG_NAME") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '89f7ec04-277a-5799-afaa-a70d0f2a8ed5',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH mandatory_value AS (
    SELECT 'ORGANIZATION_TYPE' AS issue_column,
           "ORGANIZATION_TYPE" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_25_valid_q_e_admin_data"
     WHERE "ORGANIZATION_TYPE" IS NULL
        OR TRIM("ORGANIZATION_TYPE") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '89f7ec04-277a-5799-afaa-a70d0f2a8ed5',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH allowed_values AS (
    SELECT 'ORGANIZATION_TYPE' AS issue_column,
           "ORGANIZATION_TYPE" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_25_valid_q_e_admin_data"
     WHERE "ORGANIZATION_TYPE" NOT IN ('Hospital', 'DTC', 'SNF', 'SCN', 'CBO', 'OMH', 'OASAS', 'Practice', 'Article 36', 'Article 40', 'MCO')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '89f7ec04-277a-5799-afaa-a70d0f2a8ed5',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''Hospital'', ''DTC'', ''SNF'', ''SCN'', ''CBO'', ''OMH'', ''OASAS'', ''Practice'', ''Article 36'', ''Article 40'', ''MCO'')',
           'Use only allowed values ''Hospital'', ''DTC'', ''SNF'', ''SCN'', ''CBO'', ''OMH'', ''OASAS'', ''Practice'', ''Article 36'', ''Article 40'', ''MCO'' in ' || issue_column
      FROM allowed_values;
WITH mandatory_value AS (
    SELECT 'FACILITY ADDRESS1' AS issue_column,
           "FACILITY ADDRESS1" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_25_valid_q_e_admin_data"
     WHERE "FACILITY ADDRESS1" IS NULL
        OR TRIM("FACILITY ADDRESS1") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '89f7ec04-277a-5799-afaa-a70d0f2a8ed5',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH unique_value AS (
    SELECT 'FACILITY ADDRESS1' AS issue_column,
           "FACILITY ADDRESS1" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_25_valid_q_e_admin_data"
     WHERE "FACILITY ADDRESS1" IS NOT NULL
       AND "FACILITY ADDRESS1" IN (
          SELECT "FACILITY ADDRESS1"
            FROM "ahc_hrsn_2023_12_25_valid_q_e_admin_data"
        GROUP BY "FACILITY ADDRESS1"
          HAVING COUNT(*) > 1)
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '89f7ec04-277a-5799-afaa-a70d0f2a8ed5',
           'Unique Value Violation',
           issue_row,
           issue_column,
           invalid_value,
           'Duplicate value "' || invalid_value || '" found in ' || issue_column,
           'Ensure each value in column6 is unique'
      FROM unique_value;    
WITH unique_value AS (
    SELECT 'FACILITY ADDRESS2' AS issue_column,
           "FACILITY ADDRESS2" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_25_valid_q_e_admin_data"
     WHERE "FACILITY ADDRESS2" IS NOT NULL
       AND "FACILITY ADDRESS2" IN (
          SELECT "FACILITY ADDRESS2"
            FROM "ahc_hrsn_2023_12_25_valid_q_e_admin_data"
        GROUP BY "FACILITY ADDRESS2"
          HAVING COUNT(*) > 1)
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '89f7ec04-277a-5799-afaa-a70d0f2a8ed5',
           'Unique Value Violation',
           issue_row,
           issue_column,
           invalid_value,
           'Duplicate value "' || invalid_value || '" found in ' || issue_column,
           'Ensure each value in column6 is unique'
      FROM unique_value;
WITH mandatory_value AS (
    SELECT 'FACILITY STATE' AS issue_column,
           "FACILITY STATE" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_25_valid_q_e_admin_data"
     WHERE "FACILITY STATE" IS NULL
        OR TRIM("FACILITY STATE") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '89f7ec04-277a-5799-afaa-a70d0f2a8ed5',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH allowed_values AS (
    SELECT 'FACILITY STATE' AS issue_column,
           "FACILITY STATE" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_25_valid_q_e_admin_data"
     WHERE "FACILITY STATE" NOT IN ('NY', 'New York')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '89f7ec04-277a-5799-afaa-a70d0f2a8ed5',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''NY'', ''New York'')',
           'Use only allowed values ''NY'', ''New York'' in ' || issue_column
      FROM allowed_values;
WITH mandatory_value AS (
    SELECT 'FACILITY ZIP' AS issue_column,
           "FACILITY ZIP" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_25_valid_q_e_admin_data"
     WHERE "FACILITY ZIP" IS NULL
        OR TRIM("FACILITY ZIP") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '89f7ec04-277a-5799-afaa-a70d0f2a8ed5',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH mandatory_value AS (
    SELECT 'VISIT_PART_2_FLAG' AS issue_column,
           "VISIT_PART_2_FLAG" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_25_valid_q_e_admin_data"
     WHERE "VISIT_PART_2_FLAG" IS NULL
        OR TRIM("VISIT_PART_2_FLAG") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '89f7ec04-277a-5799-afaa-a70d0f2a8ed5',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH allowed_values AS (
    SELECT 'VISIT_PART_2_FLAG' AS issue_column,
           "VISIT_PART_2_FLAG" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_25_valid_q_e_admin_data"
     WHERE "VISIT_PART_2_FLAG" NOT IN ('Yes', 'No')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '89f7ec04-277a-5799-afaa-a70d0f2a8ed5',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''Yes'', ''No'')',
           'Use only allowed values ''Yes'', ''No'' in ' || issue_column
      FROM allowed_values;
WITH mandatory_value AS (
    SELECT 'VISIT_OMH_FLAG' AS issue_column,
           "VISIT_OMH_FLAG" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_25_valid_q_e_admin_data"
     WHERE "VISIT_OMH_FLAG" IS NULL
        OR TRIM("VISIT_OMH_FLAG") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '89f7ec04-277a-5799-afaa-a70d0f2a8ed5',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH allowed_values AS (
    SELECT 'VISIT_OMH_FLAG' AS issue_column,
           "VISIT_OMH_FLAG" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_25_valid_q_e_admin_data"
     WHERE "VISIT_OMH_FLAG" NOT IN ('Yes', 'No')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '89f7ec04-277a-5799-afaa-a70d0f2a8ed5',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''Yes'', ''No'')',
           'Use only allowed values ''Yes'', ''No'' in ' || issue_column
      FROM allowed_values;
WITH mandatory_value AS (
    SELECT 'VISIT_OPWDD_FLAG' AS issue_column,
           "VISIT_OPWDD_FLAG" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_25_valid_q_e_admin_data"
     WHERE "VISIT_OPWDD_FLAG" IS NULL
        OR TRIM("VISIT_OPWDD_FLAG") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '89f7ec04-277a-5799-afaa-a70d0f2a8ed5',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH allowed_values AS (
    SELECT 'VISIT_OPWDD_FLAG' AS issue_column,
           "VISIT_OPWDD_FLAG" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2023_12_25_valid_q_e_admin_data"
     WHERE "VISIT_OPWDD_FLAG" NOT IN ('Yes', 'No')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '89f7ec04-277a-5799-afaa-a70d0f2a8ed5',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''Yes'', ''No'')',
           'Use only allowed values ''Yes'', ''No'' in ' || issue_column
      FROM allowed_values;
    
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('7e65e3a7-4415-55f4-866b-3b0cc4e85fc6', '05e8feaa-0bed-5909-a817-39812494b361', '89f7ec04-277a-5799-afaa-a70d0f2a8ed5', 'ATTEMPT_EXCEL_WORKBOOK_SHEET_ASSURANCE', 'ASSURED_EXCEL_WORKBOOK_SHEET', NULL, 'QeAdminDataExcelSheetIngestSource.assuranceSQL', (CURRENT_TIMESTAMP), NULL);
    
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('e8b3dab4-5058-5c79-8088-45b423119149', '05e8feaa-0bed-5909-a817-39812494b361', 'b10e248d-8c94-59ec-83fc-a1249dd3b111', 'INGESTED_EXCEL_WORKBOOK_SHEET', 'ATTEMPT_EXCEL_WORKBOOK_SHEET_ASSURANCE', NULL, 'AdminDemographicExcelSheetIngestSource.assuranceSQL', (CURRENT_TIMESTAMP), NULL);


WITH mandatory_value AS (
    SELECT 'FIRST_NAME' AS issue_column,
           "FIRST_NAME" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_admin_demographic"
     WHERE "FIRST_NAME" IS NULL
        OR TRIM("FIRST_NAME") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'b10e248d-8c94-59ec-83fc-a1249dd3b111',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH pattern AS (
    SELECT 'FIRST_NAME' AS issue_column,
           "FIRST_NAME" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_admin_demographic"
     WHERE "FIRST_NAME" NOT SIMILAR TO '^[A-Za-z]+$'
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'b10e248d-8c94-59ec-83fc-a1249dd3b111',
           'Pattern Mismatch',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' does not match the pattern ^[A-Za-z]+$',
           'Follow the pattern ^[A-Za-z]+$ in ' || issue_column
      FROM pattern;
WITH pattern AS (
    SELECT 'MIDDLE_NAME' AS issue_column,
           "MIDDLE_NAME" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_admin_demographic"
     WHERE "MIDDLE_NAME" NOT SIMILAR TO '^[A-Za-z]+$'
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'b10e248d-8c94-59ec-83fc-a1249dd3b111',
           'Pattern Mismatch',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' does not match the pattern ^[A-Za-z]+$',
           'Follow the pattern ^[A-Za-z]+$ in ' || issue_column
      FROM pattern;
WITH mandatory_value AS (
    SELECT 'LAST_NAME' AS issue_column,
           "LAST_NAME" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_admin_demographic"
     WHERE "LAST_NAME" IS NULL
        OR TRIM("LAST_NAME") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'b10e248d-8c94-59ec-83fc-a1249dd3b111',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH pattern AS (
    SELECT 'LAST_NAME' AS issue_column,
           "LAST_NAME" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_admin_demographic"
     WHERE "LAST_NAME" NOT SIMILAR TO '^[A-Za-z]+$'
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'b10e248d-8c94-59ec-83fc-a1249dd3b111',
           'Pattern Mismatch',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' does not match the pattern ^[A-Za-z]+$',
           'Follow the pattern ^[A-Za-z]+$ in ' || issue_column
      FROM pattern; 
WITH mandatory_value AS (
    SELECT 'ADMINISTRATIVE_SEX' AS issue_column,
           "ADMINISTRATIVE_SEX" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_admin_demographic"
     WHERE "ADMINISTRATIVE_SEX" IS NULL
        OR TRIM("ADMINISTRATIVE_SEX") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'b10e248d-8c94-59ec-83fc-a1249dd3b111',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value; 
WITH allowed_values AS (
    SELECT 'ADMINISTRATIVE_SEX' AS issue_column,
           "ADMINISTRATIVE_SEX" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_admin_demographic"
     WHERE "ADMINISTRATIVE_SEX" NOT IN ('M','F','X')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'b10e248d-8c94-59ec-83fc-a1249dd3b111',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''M'',''F'',''X'')',
           'Use only allowed values ''M'',''F'',''X'' in ' || issue_column
      FROM allowed_values;   
WITH allowed_values AS (
    SELECT 'SEX_AT_BIRTH' AS issue_column,
           "SEX_AT_BIRTH" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_admin_demographic"
     WHERE "SEX_AT_BIRTH" NOT IN ('M','F','X')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'b10e248d-8c94-59ec-83fc-a1249dd3b111',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''M'',''F'',''X'')',
           'Use only allowed values ''M'',''F'',''X'' in ' || issue_column
      FROM allowed_values; 
WITH mandatory_value AS (
    SELECT 'PAT_BIRTH_DATE' AS issue_column,
           "PAT_BIRTH_DATE" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_admin_demographic"
     WHERE "PAT_BIRTH_DATE" IS NULL
        OR TRIM("PAT_BIRTH_DATE") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'b10e248d-8c94-59ec-83fc-a1249dd3b111',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH valid_birth_date_in_all_rows AS (
    SELECT 'PAT_BIRTH_DATE' AS issue_column,
           "PAT_BIRTH_DATE" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_admin_demographic"
     WHERE "PAT_BIRTH_DATE" IS NOT NULL
       AND TRY_CAST("PAT_BIRTH_DATE" AS DATE) IS NULL
       AND EXTRACT(YEAR FROM TRY_CAST("PAT_BIRTH_DATE" AS TIMESTAMP)) < 1915
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'b10e248d-8c94-59ec-83fc-a1249dd3b111',
           'Invalid Date',
           issue_row,
           issue_column,
           invalid_value,
           'Invalid Birth Date "' || invalid_value || '" found in ' || issue_column,
           'Provide a valid birthdate on or after 1915.'
      FROM valid_birth_date_in_all_rows;
WITH mandatory_value AS (
    SELECT 'CITY' AS issue_column,
           "CITY" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_admin_demographic"
     WHERE "CITY" IS NULL
        OR TRIM("CITY") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'b10e248d-8c94-59ec-83fc-a1249dd3b111',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH mandatory_value AS (
    SELECT 'STATE' AS issue_column,
           "STATE" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_admin_demographic"
     WHERE "STATE" IS NULL
        OR TRIM("STATE") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'b10e248d-8c94-59ec-83fc-a1249dd3b111',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH allowed_values AS (
    SELECT 'STATE' AS issue_column,
           "STATE" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_admin_demographic"
     WHERE "STATE" NOT IN ('NY', 'New York')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'b10e248d-8c94-59ec-83fc-a1249dd3b111',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''NY'', ''New York'')',
           'Use only allowed values ''NY'', ''New York'' in ' || issue_column
      FROM allowed_values;
WITH mandatory_value AS (
    SELECT 'ZIP' AS issue_column,
           "ZIP" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_admin_demographic"
     WHERE "ZIP" IS NULL
        OR TRIM("ZIP") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'b10e248d-8c94-59ec-83fc-a1249dd3b111',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH allowed_values AS (
    SELECT 'GENDER_IDENTITY_CODE_SYSTEM_NAME' AS issue_column,
           "GENDER_IDENTITY_CODE_SYSTEM_NAME" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_admin_demographic"
     WHERE "GENDER_IDENTITY_CODE_SYSTEM_NAME" NOT IN ('SNOMED-CT','SNOMED')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'b10e248d-8c94-59ec-83fc-a1249dd3b111',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''SNOMED-CT'',''SNOMED'')',
           'Use only allowed values ''SNOMED-CT'',''SNOMED'' in ' || issue_column
      FROM allowed_values;
WITH allowed_values AS (
    SELECT 'SEXUAL_ORIENTATION_CODE_SYSTEM_NAME' AS issue_column,
           "SEXUAL_ORIENTATION_CODE_SYSTEM_NAME" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_admin_demographic"
     WHERE "SEXUAL_ORIENTATION_CODE_SYSTEM_NAME" NOT IN ('SNOMED-CT','SNOMED')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'b10e248d-8c94-59ec-83fc-a1249dd3b111',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''SNOMED-CT'',''SNOMED'')',
           'Use only allowed values ''SNOMED-CT'',''SNOMED'' in ' || issue_column
      FROM allowed_values;
WITH allowed_values AS (
    SELECT 'SEXUAL_ORIENTATION_DESCRIPTION' AS issue_column,
           "SEXUAL_ORIENTATION_DESCRIPTION" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_admin_demographic"
     WHERE "SEXUAL_ORIENTATION_DESCRIPTION" NOT IN ('Bisexual','Heterosexual','Homosexual','other','unknown')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'b10e248d-8c94-59ec-83fc-a1249dd3b111',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''Bisexual'',''Heterosexual'',''Homosexual'',''other'',''unknown'')',
           'Use only allowed values ''Bisexual'',''Heterosexual'',''Homosexual'',''other'',''unknown'' in ' || issue_column
      FROM allowed_values;
WITH allowed_values AS (
    SELECT 'SEXUAL_ORIENTATION_DESCRIPTION' AS issue_column,
           "SEXUAL_ORIENTATION_DESCRIPTION" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_admin_demographic"
     WHERE "SEXUAL_ORIENTATION_DESCRIPTION" NOT IN ('ISO','ISO 639-2')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'b10e248d-8c94-59ec-83fc-a1249dd3b111',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''ISO'',''ISO 639-2'')',
           'Use only allowed values ''ISO'',''ISO 639-2'' in ' || issue_column
      FROM allowed_values;
WITH allowed_values AS (
    SELECT 'RACE_CODE_SYSTEM_NAME' AS issue_column,
           "RACE_CODE_SYSTEM_NAME" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_admin_demographic"
     WHERE "RACE_CODE_SYSTEM_NAME" NOT IN ('CDC','CDCRE')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'b10e248d-8c94-59ec-83fc-a1249dd3b111',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''CDC'',''CDCRE'')',
           'Use only allowed values ''CDC'',''CDCRE'' in ' || issue_column
      FROM allowed_values;
WITH allowed_values AS (
    SELECT 'ETHNICITY_CODE_SYSTEM_NAME' AS issue_column,
           "ETHNICITY_CODE_SYSTEM_NAME" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_admin_demographic"
     WHERE "ETHNICITY_CODE_SYSTEM_NAME" NOT IN ('CDC','CDCRE')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'b10e248d-8c94-59ec-83fc-a1249dd3b111',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''CDC'',''CDCRE'')',
           'Use only allowed values ''CDC'',''CDCRE'' in ' || issue_column
      FROM allowed_values;
WITH mandatory_value AS (
    SELECT 'MPI_ID' AS issue_column,
           "MPI_ID" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_admin_demographic"
     WHERE "MPI_ID" IS NULL
        OR TRIM("MPI_ID") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'b10e248d-8c94-59ec-83fc-a1249dd3b111',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value; 
WITH mandatory_value AS (
    SELECT 'PAT_MRN_ID' AS issue_column,
           "PAT_MRN_ID" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_admin_demographic"
     WHERE "PAT_MRN_ID" IS NULL
        OR TRIM("PAT_MRN_ID") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'b10e248d-8c94-59ec-83fc-a1249dd3b111',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH mandatory_value AS (
    SELECT 'FACILITY ID (Assigning authority)' AS issue_column,
           "FACILITY ID (Assigning authority)" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_admin_demographic"
     WHERE "FACILITY ID (Assigning authority)" IS NULL
        OR TRIM("FACILITY ID (Assigning authority)") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'b10e248d-8c94-59ec-83fc-a1249dd3b111',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
    
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('34e90086-3d06-5b10-972d-7d0b40a02289', '05e8feaa-0bed-5909-a817-39812494b361', 'b10e248d-8c94-59ec-83fc-a1249dd3b111', 'ATTEMPT_EXCEL_WORKBOOK_SHEET_ASSURANCE', 'ASSURED_EXCEL_WORKBOOK_SHEET', NULL, 'AdminDemographicExcelSheetIngestSource.assuranceSQL', (CURRENT_TIMESTAMP), NULL);
    
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('9dabd022-4a26-55f2-98f4-e534e7704b23', '05e8feaa-0bed-5909-a817-39812494b361', 'c302047e-21cf-5059-a32c-e81a9bd3a9b9', 'INGESTED_EXCEL_WORKBOOK_SHEET', 'ATTEMPT_EXCEL_WORKBOOK_SHEET_ASSURANCE', NULL, 'ScreeningExcelSheetIngestSource.assuranceSQL', (CURRENT_TIMESTAMP), NULL);

WITH mandatory_value AS (
    SELECT 'PAT_MRN_ID' AS issue_column,
           "PAT_MRN_ID" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_screening"
     WHERE "PAT_MRN_ID" IS NULL
        OR TRIM("PAT_MRN_ID") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'c302047e-21cf-5059-a32c-e81a9bd3a9b9',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH mandatory_value AS (
    SELECT 'FACILITY ID (Assigning authority)' AS issue_column,
           "FACILITY ID (Assigning authority)" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_screening"
     WHERE "FACILITY ID (Assigning authority)" IS NULL
        OR TRIM("FACILITY ID (Assigning authority)") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'c302047e-21cf-5059-a32c-e81a9bd3a9b9',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH mandatory_value AS (
    SELECT 'SCREENING_NAME' AS issue_column,
           "SCREENING_NAME" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_screening"
     WHERE "SCREENING_NAME" IS NULL
        OR TRIM("SCREENING_NAME") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'c302047e-21cf-5059-a32c-e81a9bd3a9b9',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH mandatory_value AS (
    SELECT 'SCREENING_CODE_SYSTEM_NAME' AS issue_column,
           "SCREENING_CODE_SYSTEM_NAME" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_screening"
     WHERE "SCREENING_CODE_SYSTEM_NAME" IS NULL
        OR TRIM("SCREENING_CODE_SYSTEM_NAME") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'c302047e-21cf-5059-a32c-e81a9bd3a9b9',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH allowed_values AS (
    SELECT 'SCREENING_CODE_SYSTEM_NAME' AS issue_column,
           "SCREENING_CODE_SYSTEM_NAME" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_screening"
     WHERE "SCREENING_CODE_SYSTEM_NAME" NOT IN ('LN', 'LOINC')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'c302047e-21cf-5059-a32c-e81a9bd3a9b9',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''LN'', ''LOINC'')',
           'Use only allowed values ''LN'', ''LOINC'' in ' || issue_column
      FROM allowed_values;
WITH mandatory_value AS (
    SELECT 'SCREENING_CODE' AS issue_column,
           "SCREENING_CODE" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_screening"
     WHERE "SCREENING_CODE" IS NULL
        OR TRIM("SCREENING_CODE") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'c302047e-21cf-5059-a32c-e81a9bd3a9b9',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH allowed_values AS (
    SELECT 'SCREENING_METHOD' AS issue_column,
           "SCREENING_METHOD" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_screening"
     WHERE "SCREENING_METHOD" NOT IN ('In-Person', 'Phone', 'Website')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'c302047e-21cf-5059-a32c-e81a9bd3a9b9',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''In-Person'', ''Phone'', ''Website'')',
           'Use only allowed values ''In-Person'', ''Phone'', ''Website'' in ' || issue_column
      FROM allowed_values;
WITH mandatory_value AS (
    SELECT 'RECORDED_TIME' AS issue_column,
           "RECORDED_TIME" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_screening"
     WHERE "RECORDED_TIME" IS NULL
        OR TRIM("RECORDED_TIME") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'c302047e-21cf-5059-a32c-e81a9bd3a9b9',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value; 
WITH valid_date_time_in_all_rows AS (
    SELECT 'RECORDED_TIME' AS issue_column,
           "RECORDED_TIME" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_screening"
     WHERE "RECORDED_TIME" IS NOT NULL
       AND TRY_CAST("RECORDED_TIME" AS TIMESTAMP) IS NULL
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'c302047e-21cf-5059-a32c-e81a9bd3a9b9',
           'Invalid Date',
           issue_row,
           issue_column,
           invalid_value,
           'Invalid timestamp "' || invalid_value || '" found in ' || issue_column,
           'Please be sure to provide both a valid date and time.'
      FROM valid_date_time_in_all_rows;
WITH mandatory_value AS (
    SELECT 'QUESTION' AS issue_column,
           "QUESTION" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_screening"
     WHERE "QUESTION" IS NULL
        OR TRIM("QUESTION") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'c302047e-21cf-5059-a32c-e81a9bd3a9b9',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH mandatory_value AS (
    SELECT 'MEAS_VALUE' AS issue_column,
           "MEAS_VALUE" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_screening"
     WHERE "MEAS_VALUE" IS NULL
        OR TRIM("MEAS_VALUE") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'c302047e-21cf-5059-a32c-e81a9bd3a9b9',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;      
WITH mandatory_value AS (
    SELECT 'QUESTION_CODE' AS issue_column,
           "QUESTION_CODE" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_screening"
     WHERE "QUESTION_CODE" IS NULL
        OR TRIM("QUESTION_CODE") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'c302047e-21cf-5059-a32c-e81a9bd3a9b9',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH mandatory_value AS (
    SELECT 'QUESTION_CODE_SYSTEM_NAME' AS issue_column,
           "QUESTION_CODE_SYSTEM_NAME" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_screening"
     WHERE "QUESTION_CODE_SYSTEM_NAME" IS NULL
        OR TRIM("QUESTION_CODE_SYSTEM_NAME") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'c302047e-21cf-5059-a32c-e81a9bd3a9b9',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH allowed_values AS (
    SELECT 'QUESTION_CODE_SYSTEM_NAME' AS issue_column,
           "QUESTION_CODE_SYSTEM_NAME" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_screening"
     WHERE "QUESTION_CODE_SYSTEM_NAME" NOT IN ('LN','LOIN')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'c302047e-21cf-5059-a32c-e81a9bd3a9b9',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''LN'',''LOIN'')',
           'Use only allowed values ''LN'',''LOIN'' in ' || issue_column
      FROM allowed_values;
WITH mandatory_value AS (
    SELECT 'ANSWER_CODE' AS issue_column,
           "ANSWER_CODE" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_screening"
     WHERE "ANSWER_CODE" IS NULL
        OR TRIM("ANSWER_CODE") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'c302047e-21cf-5059-a32c-e81a9bd3a9b9',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH mandatory_value AS (
    SELECT 'ANSWER_CODE_SYSTEM_NAME' AS issue_column,
           "ANSWER_CODE_SYSTEM_NAME" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_screening"
     WHERE "ANSWER_CODE_SYSTEM_NAME" IS NULL
        OR TRIM("ANSWER_CODE_SYSTEM_NAME") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'c302047e-21cf-5059-a32c-e81a9bd3a9b9',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH allowed_values AS (
    SELECT 'ANSWER_CODE_SYSTEM_NAME' AS issue_column,
           "ANSWER_CODE_SYSTEM_NAME" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_screening"
     WHERE "ANSWER_CODE_SYSTEM_NAME" NOT IN ('LN','LOIN')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'c302047e-21cf-5059-a32c-e81a9bd3a9b9',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''LN'',''LOIN'')',
           'Use only allowed values ''LN'',''LOIN'' in ' || issue_column
      FROM allowed_values;
WITH mandatory_value AS (
    SELECT 'SDOH_DOMAIN' AS issue_column,
           "SDOH_DOMAIN" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_screening"
     WHERE "SDOH_DOMAIN" IS NULL
        OR TRIM("SDOH_DOMAIN") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'c302047e-21cf-5059-a32c-e81a9bd3a9b9',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH mandatory_value AS (
    SELECT 'POTENTIAL_NEED_INDICATED' AS issue_column,
           "POTENTIAL_NEED_INDICATED" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_screening"
     WHERE "POTENTIAL_NEED_INDICATED" IS NULL
        OR TRIM("POTENTIAL_NEED_INDICATED") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'c302047e-21cf-5059-a32c-e81a9bd3a9b9',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH allowed_values AS (
    SELECT 'POTENTIAL_NEED_INDICATED' AS issue_column,
           "POTENTIAL_NEED_INDICATED" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_screening"
     WHERE "POTENTIAL_NEED_INDICATED" NOT IN ('Yes','No')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'c302047e-21cf-5059-a32c-e81a9bd3a9b9',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''Yes'',''No'')',
           'Use only allowed values ''Yes'',''No'' in ' || issue_column
      FROM allowed_values;
WITH allowed_values AS (
    SELECT 'ASSISTANCE_REQUESTED' AS issue_column,
           "ASSISTANCE_REQUESTED" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_screening"
     WHERE "ASSISTANCE_REQUESTED" NOT IN ('Yes','No')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           'c302047e-21cf-5059-a32c-e81a9bd3a9b9',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''Yes'',''No'')',
           'Use only allowed values ''Yes'',''No'' in ' || issue_column
      FROM allowed_values;
    
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('21d7e4ec-32e3-5e20-9029-28fdd6c5fa66', '05e8feaa-0bed-5909-a817-39812494b361', 'c302047e-21cf-5059-a32c-e81a9bd3a9b9', 'ATTEMPT_EXCEL_WORKBOOK_SHEET_ASSURANCE', 'ASSURED_EXCEL_WORKBOOK_SHEET', NULL, 'ScreeningExcelSheetIngestSource.assuranceSQL', (CURRENT_TIMESTAMP), NULL);
    
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('80af4eff-d697-565b-9e3f-a587e322b1da', '05e8feaa-0bed-5909-a817-39812494b361', '9860873a-c387-5d98-9930-4ff296eb7192', 'INGESTED_EXCEL_WORKBOOK_SHEET', 'ATTEMPT_EXCEL_WORKBOOK_SHEET_ASSURANCE', NULL, 'QeAdminDataExcelSheetIngestSource.assuranceSQL', (CURRENT_TIMESTAMP), NULL);

WITH mandatory_value AS (
    SELECT 'PAT_MRN_ID' AS issue_column,
           "PAT_MRN_ID" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_q_e_admin_data"
     WHERE "PAT_MRN_ID" IS NULL
        OR TRIM("PAT_MRN_ID") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '9860873a-c387-5d98-9930-4ff296eb7192',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH mandatory_value AS (
    SELECT 'FACILITY ID (Assigning authority)' AS issue_column,
           "FACILITY ID (Assigning authority)" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_q_e_admin_data"
     WHERE "FACILITY ID (Assigning authority)" IS NULL
        OR TRIM("FACILITY ID (Assigning authority)") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '9860873a-c387-5d98-9930-4ff296eb7192',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH unique_value AS (
    SELECT 'FACILITY ID (Assigning authority)' AS issue_column,
           "FACILITY ID (Assigning authority)" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_q_e_admin_data"
     WHERE "FACILITY ID (Assigning authority)" IS NOT NULL
       AND "FACILITY ID (Assigning authority)" IN (
          SELECT "FACILITY ID (Assigning authority)"
            FROM "ahc_hrsn_2024_01_25_valid_q_e_admin_data"
        GROUP BY "FACILITY ID (Assigning authority)"
          HAVING COUNT(*) > 1)
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '9860873a-c387-5d98-9930-4ff296eb7192',
           'Unique Value Violation',
           issue_row,
           issue_column,
           invalid_value,
           'Duplicate value "' || invalid_value || '" found in ' || issue_column,
           'Ensure each value in column6 is unique'
      FROM unique_value;
WITH mandatory_value AS (
    SELECT 'FACILITY_LONG_NAME' AS issue_column,
           "FACILITY_LONG_NAME" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_q_e_admin_data"
     WHERE "FACILITY_LONG_NAME" IS NULL
        OR TRIM("FACILITY_LONG_NAME") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '9860873a-c387-5d98-9930-4ff296eb7192',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH mandatory_value AS (
    SELECT 'ORGANIZATION_TYPE' AS issue_column,
           "ORGANIZATION_TYPE" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_q_e_admin_data"
     WHERE "ORGANIZATION_TYPE" IS NULL
        OR TRIM("ORGANIZATION_TYPE") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '9860873a-c387-5d98-9930-4ff296eb7192',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH allowed_values AS (
    SELECT 'ORGANIZATION_TYPE' AS issue_column,
           "ORGANIZATION_TYPE" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_q_e_admin_data"
     WHERE "ORGANIZATION_TYPE" NOT IN ('Hospital', 'DTC', 'SNF', 'SCN', 'CBO', 'OMH', 'OASAS', 'Practice', 'Article 36', 'Article 40', 'MCO')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '9860873a-c387-5d98-9930-4ff296eb7192',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''Hospital'', ''DTC'', ''SNF'', ''SCN'', ''CBO'', ''OMH'', ''OASAS'', ''Practice'', ''Article 36'', ''Article 40'', ''MCO'')',
           'Use only allowed values ''Hospital'', ''DTC'', ''SNF'', ''SCN'', ''CBO'', ''OMH'', ''OASAS'', ''Practice'', ''Article 36'', ''Article 40'', ''MCO'' in ' || issue_column
      FROM allowed_values;
WITH mandatory_value AS (
    SELECT 'FACILITY ADDRESS1' AS issue_column,
           "FACILITY ADDRESS1" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_q_e_admin_data"
     WHERE "FACILITY ADDRESS1" IS NULL
        OR TRIM("FACILITY ADDRESS1") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '9860873a-c387-5d98-9930-4ff296eb7192',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH unique_value AS (
    SELECT 'FACILITY ADDRESS1' AS issue_column,
           "FACILITY ADDRESS1" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_q_e_admin_data"
     WHERE "FACILITY ADDRESS1" IS NOT NULL
       AND "FACILITY ADDRESS1" IN (
          SELECT "FACILITY ADDRESS1"
            FROM "ahc_hrsn_2024_01_25_valid_q_e_admin_data"
        GROUP BY "FACILITY ADDRESS1"
          HAVING COUNT(*) > 1)
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '9860873a-c387-5d98-9930-4ff296eb7192',
           'Unique Value Violation',
           issue_row,
           issue_column,
           invalid_value,
           'Duplicate value "' || invalid_value || '" found in ' || issue_column,
           'Ensure each value in column6 is unique'
      FROM unique_value;    
WITH unique_value AS (
    SELECT 'FACILITY ADDRESS2' AS issue_column,
           "FACILITY ADDRESS2" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_q_e_admin_data"
     WHERE "FACILITY ADDRESS2" IS NOT NULL
       AND "FACILITY ADDRESS2" IN (
          SELECT "FACILITY ADDRESS2"
            FROM "ahc_hrsn_2024_01_25_valid_q_e_admin_data"
        GROUP BY "FACILITY ADDRESS2"
          HAVING COUNT(*) > 1)
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '9860873a-c387-5d98-9930-4ff296eb7192',
           'Unique Value Violation',
           issue_row,
           issue_column,
           invalid_value,
           'Duplicate value "' || invalid_value || '" found in ' || issue_column,
           'Ensure each value in column6 is unique'
      FROM unique_value;
WITH mandatory_value AS (
    SELECT 'FACILITY STATE' AS issue_column,
           "FACILITY STATE" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_q_e_admin_data"
     WHERE "FACILITY STATE" IS NULL
        OR TRIM("FACILITY STATE") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '9860873a-c387-5d98-9930-4ff296eb7192',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH allowed_values AS (
    SELECT 'FACILITY STATE' AS issue_column,
           "FACILITY STATE" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_q_e_admin_data"
     WHERE "FACILITY STATE" NOT IN ('NY', 'New York')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '9860873a-c387-5d98-9930-4ff296eb7192',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''NY'', ''New York'')',
           'Use only allowed values ''NY'', ''New York'' in ' || issue_column
      FROM allowed_values;
WITH mandatory_value AS (
    SELECT 'FACILITY ZIP' AS issue_column,
           "FACILITY ZIP" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_q_e_admin_data"
     WHERE "FACILITY ZIP" IS NULL
        OR TRIM("FACILITY ZIP") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '9860873a-c387-5d98-9930-4ff296eb7192',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH mandatory_value AS (
    SELECT 'VISIT_PART_2_FLAG' AS issue_column,
           "VISIT_PART_2_FLAG" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_q_e_admin_data"
     WHERE "VISIT_PART_2_FLAG" IS NULL
        OR TRIM("VISIT_PART_2_FLAG") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '9860873a-c387-5d98-9930-4ff296eb7192',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH allowed_values AS (
    SELECT 'VISIT_PART_2_FLAG' AS issue_column,
           "VISIT_PART_2_FLAG" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_q_e_admin_data"
     WHERE "VISIT_PART_2_FLAG" NOT IN ('Yes', 'No')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '9860873a-c387-5d98-9930-4ff296eb7192',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''Yes'', ''No'')',
           'Use only allowed values ''Yes'', ''No'' in ' || issue_column
      FROM allowed_values;
WITH mandatory_value AS (
    SELECT 'VISIT_OMH_FLAG' AS issue_column,
           "VISIT_OMH_FLAG" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_q_e_admin_data"
     WHERE "VISIT_OMH_FLAG" IS NULL
        OR TRIM("VISIT_OMH_FLAG") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '9860873a-c387-5d98-9930-4ff296eb7192',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH allowed_values AS (
    SELECT 'VISIT_OMH_FLAG' AS issue_column,
           "VISIT_OMH_FLAG" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_q_e_admin_data"
     WHERE "VISIT_OMH_FLAG" NOT IN ('Yes', 'No')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '9860873a-c387-5d98-9930-4ff296eb7192',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''Yes'', ''No'')',
           'Use only allowed values ''Yes'', ''No'' in ' || issue_column
      FROM allowed_values;
WITH mandatory_value AS (
    SELECT 'VISIT_OPWDD_FLAG' AS issue_column,
           "VISIT_OPWDD_FLAG" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_q_e_admin_data"
     WHERE "VISIT_OPWDD_FLAG" IS NULL
        OR TRIM("VISIT_OPWDD_FLAG") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '9860873a-c387-5d98-9930-4ff296eb7192',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH allowed_values AS (
    SELECT 'VISIT_OPWDD_FLAG' AS issue_column,
           "VISIT_OPWDD_FLAG" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_q_e_admin_data"
     WHERE "VISIT_OPWDD_FLAG" NOT IN ('Yes', 'No')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05e8feaa-0bed-5909-a817-39812494b361',
           '9860873a-c387-5d98-9930-4ff296eb7192',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''Yes'', ''No'')',
           'Use only allowed values ''Yes'', ''No'' in ' || issue_column
      FROM allowed_values;
    
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('4f7e4436-c5f6-5ba1-9793-580ab66789fb', '05e8feaa-0bed-5909-a817-39812494b361', '9860873a-c387-5d98-9930-4ff296eb7192', 'ATTEMPT_EXCEL_WORKBOOK_SHEET_ASSURANCE', 'ASSURED_EXCEL_WORKBOOK_SHEET', NULL, 'QeAdminDataExcelSheetIngestSource.assuranceSQL', (CURRENT_TIMESTAMP), NULL);
    
```
No STDOUT emitted by `ensureContent` (status: `0`).

No STDERR emitted by `ensureContent`.

    

## emitResources

```sql
-- preambleSQL
SET autoinstall_known_extensions=true;
SET autoload_known_extensions=true;
-- end preambleSQL
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('8f460419-7b80-516d-8919-84520950f612', '05e8feaa-0bed-5909-a817-39812494b361', NULL, 'NONE', 'ENTER(prepareInit)', NULL, 'rsEE.beforeCell', ('2024-02-01T19:37:05.301Z'), NULL);
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('7bab389e-54af-5a13-a39f-079abdc73a48', '05e8feaa-0bed-5909-a817-39812494b361', NULL, 'EXIT(prepareInit)', 'ENTER(init)', NULL, 'rsEE.afterCell', ('2024-02-01T19:37:05.301Z'), NULL);
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('1931dfcc-e8fc-597d-b1bc-65b4287e6fdf', '05e8feaa-0bed-5909-a817-39812494b361', NULL, 'EXIT(init)', 'ENTER(ingest)', NULL, 'rsEE.afterCell', ('2024-02-01T19:37:05.301Z'), NULL);
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('0adb81bc-3df2-5f86-99cc-2d20e1dd5efd', '05e8feaa-0bed-5909-a817-39812494b361', NULL, 'EXIT(ingest)', 'ENTER(ensureContent)', NULL, 'rsEE.afterCell', ('2024-02-01T19:37:05.301Z'), NULL);
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('f6d4aff4-4b71-5662-8f57-00ee247dc57c', '05e8feaa-0bed-5909-a817-39812494b361', NULL, 'EXIT(ensureContent)', 'ENTER(emitResources)', NULL, 'rsEE.afterCell', ('2024-02-01T19:37:05.301Z'), NULL);

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
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('6202ec4a-f3d5-5302-9ed6-9cb59a5b2818', '05e8feaa-0bed-5909-a817-39812494b361', '8b7c669c-1795-5f6b-8f3a-3e502b74c628', 'ASSURED_CSV', 'EXIT(ScreeningCsvFileIngestSource)', NULL, 'ScreeningCsvFileIngestSource.exportResourceSQL', (CURRENT_TIMESTAMP), NULL);

CREATE TABLE resource_db.ahc_hrsn_2023_12_12_valid AS SELECT * FROM ahc_hrsn_2023_12_12_valid;

-- try sqltofhir Visual Studio Code extension for writing FHIR resources with SQL.
-- see https://marketplace.visualstudio.com/items?itemName=arkhn.sqltofhir-vscode
CREATE VIEW resource_db.ahc_hrsn_2023_12_12_valid_fhir AS 
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
  FROM ahc_hrsn_2023_12_12_valid;
  
  INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('bebf797d-855b-5e76-93d2-2a802febd5a2', '05e8feaa-0bed-5909-a817-39812494b361', '8b7c669c-1795-5f6b-8f3a-3e502b74c628', 'ATTEMPT_CSV_EXPORT', 'EXIT(ScreeningCsvFileIngestSource)', NULL, 'ScreeningCsvFileIngestSource.exportResourceSQL', (CURRENT_TIMESTAMP), NULL);
  
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('4b7537b2-9d60-59f3-8c61-fa2ff4265c02', '05e8feaa-0bed-5909-a817-39812494b361', '071f8fe1-4899-5c71-9c86-7d7377661d45', 'ASSURED_EXCEL_WORKBOOK_SHEET', 'ATTEMPT_EXCEL_WORKBOOK_SHEET_EXPORT', NULL, 'AdminDemographicExcelSheetIngestSource.exportResourceSQL', (CURRENT_TIMESTAMP), NULL);

CREATE TABLE resource_db.ahc_hrsn_2023_12_25_valid_admin_demographic AS SELECT * FROM ahc_hrsn_2023_12_25_valid_admin_demographic;

INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('6c48996f-0dd4-572f-b087-e5913926cd4b', '05e8feaa-0bed-5909-a817-39812494b361', '071f8fe1-4899-5c71-9c86-7d7377661d45', 'ATTEMPT_EXCEL_WORKBOOK_SHEET_EXPORT', 'EXIT(AdminDemographicExcelSheetIngestSource)', NULL, 'AdminDemographicExcelSheetIngestSource.exportResourceSQL', (CURRENT_TIMESTAMP), NULL);
    
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('657d6337-8d24-5b67-b139-87db6a228264', '05e8feaa-0bed-5909-a817-39812494b361', 'a3fe7098-8ae8-5612-81ac-cbe10780c19b', 'ASSURED_EXCEL_WORKBOOK_SHEET', 'ATTEMPT_EXCEL_WORKBOOK_SHEET_EXPORT', NULL, 'ScreeningExcelSheetIngestSource.exportResourceSQL', (CURRENT_TIMESTAMP), NULL);

CREATE TABLE resource_db.ahc_hrsn_2023_12_25_valid_screening AS SELECT * FROM ahc_hrsn_2023_12_25_valid_screening;

INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('17cedd6e-e794-5b45-9790-c4ba2483cc1e', '05e8feaa-0bed-5909-a817-39812494b361', 'a3fe7098-8ae8-5612-81ac-cbe10780c19b', 'ATTEMPT_EXCEL_WORKBOOK_SHEET_EXPORT', 'EXIT(ScreeningExcelSheetIngestSource)', NULL, 'ScreeningExcelSheetIngestSource.exportResourceSQL', (CURRENT_TIMESTAMP), NULL);
    
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('9f13dd7d-9ff8-509d-b716-cde856c5f0f0', '05e8feaa-0bed-5909-a817-39812494b361', '89f7ec04-277a-5799-afaa-a70d0f2a8ed5', 'ASSURED_EXCEL_WORKBOOK_SHEET', 'ATTEMPT_EXCEL_WORKBOOK_SHEET_EXPORT', NULL, 'QeAdminDataExcelSheetIngestSource.exportResourceSQL', (CURRENT_TIMESTAMP), NULL);

CREATE TABLE resource_db.ahc_hrsn_2023_12_25_valid_q_e_admin_data AS SELECT * FROM ahc_hrsn_2023_12_25_valid_q_e_admin_data;

INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('c40829eb-7f91-583a-8af8-06de851777a0', '05e8feaa-0bed-5909-a817-39812494b361', '89f7ec04-277a-5799-afaa-a70d0f2a8ed5', 'ATTEMPT_EXCEL_WORKBOOK_SHEET_EXPORT', 'EXIT(AdminDemographicExcelSheetIngestSource)', NULL, 'QeAdminDataExcelSheetIngestSource.exportResourceSQL', (CURRENT_TIMESTAMP), NULL);
    
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('9c0d34d3-bf09-527a-aef5-85004a400be5', '05e8feaa-0bed-5909-a817-39812494b361', 'b10e248d-8c94-59ec-83fc-a1249dd3b111', 'ASSURED_EXCEL_WORKBOOK_SHEET', 'ATTEMPT_EXCEL_WORKBOOK_SHEET_EXPORT', NULL, 'AdminDemographicExcelSheetIngestSource.exportResourceSQL', (CURRENT_TIMESTAMP), NULL);

CREATE TABLE resource_db.ahc_hrsn_2024_01_25_valid_admin_demographic AS SELECT * FROM ahc_hrsn_2024_01_25_valid_admin_demographic;

INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('a8ec8b43-9e16-5eeb-9683-bc14288971f1', '05e8feaa-0bed-5909-a817-39812494b361', 'b10e248d-8c94-59ec-83fc-a1249dd3b111', 'ATTEMPT_EXCEL_WORKBOOK_SHEET_EXPORT', 'EXIT(AdminDemographicExcelSheetIngestSource)', NULL, 'AdminDemographicExcelSheetIngestSource.exportResourceSQL', (CURRENT_TIMESTAMP), NULL);
    
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('e2816d61-4406-5073-ac60-f129a107d938', '05e8feaa-0bed-5909-a817-39812494b361', 'c302047e-21cf-5059-a32c-e81a9bd3a9b9', 'ASSURED_EXCEL_WORKBOOK_SHEET', 'ATTEMPT_EXCEL_WORKBOOK_SHEET_EXPORT', NULL, 'ScreeningExcelSheetIngestSource.exportResourceSQL', (CURRENT_TIMESTAMP), NULL);

CREATE TABLE resource_db.ahc_hrsn_2024_01_25_valid_screening AS SELECT * FROM ahc_hrsn_2024_01_25_valid_screening;

INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('35c62034-5b20-5891-8d38-3e9b051dec6e', '05e8feaa-0bed-5909-a817-39812494b361', 'c302047e-21cf-5059-a32c-e81a9bd3a9b9', 'ATTEMPT_EXCEL_WORKBOOK_SHEET_EXPORT', 'EXIT(ScreeningExcelSheetIngestSource)', NULL, 'ScreeningExcelSheetIngestSource.exportResourceSQL', (CURRENT_TIMESTAMP), NULL);
    
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('413ec5cd-eee9-5c62-90a5-6670f8b9ddff', '05e8feaa-0bed-5909-a817-39812494b361', '9860873a-c387-5d98-9930-4ff296eb7192', 'ASSURED_EXCEL_WORKBOOK_SHEET', 'ATTEMPT_EXCEL_WORKBOOK_SHEET_EXPORT', NULL, 'QeAdminDataExcelSheetIngestSource.exportResourceSQL', (CURRENT_TIMESTAMP), NULL);

CREATE TABLE resource_db.ahc_hrsn_2024_01_25_valid_q_e_admin_data AS SELECT * FROM ahc_hrsn_2024_01_25_valid_q_e_admin_data;

INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('aa8b8d1a-c8cc-5a9b-b5aa-34a6fc85e11a', '05e8feaa-0bed-5909-a817-39812494b361', '9860873a-c387-5d98-9930-4ff296eb7192', 'ATTEMPT_EXCEL_WORKBOOK_SHEET_EXPORT', 'EXIT(AdminDemographicExcelSheetIngestSource)', NULL, 'QeAdminDataExcelSheetIngestSource.exportResourceSQL', (CURRENT_TIMESTAMP), NULL);
    ;

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

    