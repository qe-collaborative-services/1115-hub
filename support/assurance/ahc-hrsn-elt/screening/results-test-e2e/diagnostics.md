---
workflowPaths:
  inProcess:
    home: >-
      /home/snshah/workspaces/github.com/qe-collaborative-services/1115-hub/support/assurance/ahc-hrsn-elt/screening/results-test-e2e
  egress:
    home: >-
      /home/snshah/workspaces/github.com/qe-collaborative-services/1115-hub/support/assurance/ahc-hrsn-elt/screening/results-test-e2e
walkRootPaths:
  - support/assurance/ahc-hrsn-elt/screening/synthetic-content
referenceDataHome: >-
  /home/snshah/workspaces/github.com/qe-collaborative-services/1115-hub/src/ahc-hrsn-elt/reference-data
sources:
  - uri: >-
      support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-2023-12-12-valid.csv
    nature: ERROR
    tableName: ERROR
    ingestionIssues: 1
  - uri: >-
      support/assurance/ahc-hrsn-elt/screening/synthetic-content/JRCHC_SDOH
      HEL_Report 2452_ran 020124DeIdent.xlsx
    nature: ERROR
    tableName: ERROR
    ingestionIssues: 1
  - uri: >-
      support/assurance/ahc-hrsn-elt/screening/synthetic-content/QE_ADMIN_DATA-2_01HPKTY3HCTK826TVX5TASGA55.csv
    nature: CSV
    tableName: qe_admin_data_2_01hpkty3hctk826tvx5tasga55
    ingestionIssues: 0
  - uri: >-
      support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-2023-12-25-valid.xlsx
    nature: ERROR
    tableName: ERROR
    ingestionIssues: 1
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
      support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail.csv
    nature: ERROR
    tableName: ERROR
    ingestionIssues: 1
  - uri: >-
      support/assurance/ahc-hrsn-elt/screening/synthetic-content/SCREENING-2_01HPKTY3HCTK826TVX5TASGA55.csv
    nature: CSV
    tableName: screening_2_01hpkty3hctk826tvx5tasga55
    ingestionIssues: 0
  - uri: >-
      support/assurance/ahc-hrsn-elt/screening/synthetic-content/DEMOGRAPHIC_DATA-2_01HPKTY3HCTK826TVX5TASGA55.csv
    nature: CSV
    tableName: demographic_data_2_01hpkty3hctk826tvx5tasga55
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
      support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-2024-01-25-valid.xlsx
    nature: Excel Workbook Sheet
    tableName: ahc_hrsn_2024_01_25_valid_question_reference
    ingestionIssues: 0
  - uri: >-
      support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-2024-01-25-valid.xlsx
    nature: Excel Workbook Sheet
    tableName: ahc_hrsn_2024_01_25_valid_answer_reference
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
INSERT INTO "device" ("device_id", "name", "state", "boundary", "segmentation", "state_sysinfo", "elaboration") VALUES ('7bab389e-54af-5a13-a39f-079abdc73a48', 'EXCELSIOR', 'SINGLETON', 'UNKNOWN', NULL, '{"os-arch":"x64","os-platform":"linux"}', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "orch_session" ("orch_session_id", "device_id", "orch_started_at", "orch_finished_at", "elaboration", "args_json", "diagnostics_json", "diagnostics_md") VALUES ('05269d28-15ae-5bd6-bd88-f949ccfa52d7', '7bab389e-54af-5a13-a39f-079abdc73a48', ('2024-02-16T16:13:30.775Z'), NULL, NULL, NULL, NULL, 'Session 05269d28-15ae-5bd6-bd88-f949ccfa52d7 markdown diagnostics not provided (not completed?)');

-- Load Reference data from csvs
CREATE TABLE encounter_class_reference AS 
  SELECT * FROM read_csv_auto('/home/snshah/workspaces/github.com/qe-collaborative-services/1115-hub/src/ahc-hrsn-elt/reference-data/encounter-class-reference.csv',
    delim = ',',
    header = true,
    columns = {
      'Code': 'VARCHAR',
      'System': 'VARCHAR',
      'Display': 'VARCHAR',
      'Definition': 'VARCHAR'
    });

CREATE TABLE screening_status_code_reference AS 
  SELECT * FROM read_csv_auto('/home/snshah/workspaces/github.com/qe-collaborative-services/1115-hub/src/ahc-hrsn-elt/reference-data/screening-status-code-reference.csv',
    delim = ',',
    header = true,
    columns = {
      'Lvl': 'VARCHAR',
      'Code': 'VARCHAR',
      'Display': 'VARCHAR',
      'Definition': 'VARCHAR'
    });

CREATE TABLE encounter_status_code_reference AS 
  SELECT * FROM read_csv_auto('/home/snshah/workspaces/github.com/qe-collaborative-services/1115-hub/src/ahc-hrsn-elt/reference-data/encounter-status-code-reference.csv',
    delim = ',',
    header = true,
    columns = {
      'Code': 'VARCHAR',
      'Display': 'VARCHAR',
      'Definition': 'VARCHAR'
    });

CREATE TABLE encounter_type_code_reference AS 
  SELECT * FROM read_csv_auto('/home/snshah/workspaces/github.com/qe-collaborative-services/1115-hub/src/ahc-hrsn-elt/reference-data/encounter-type-code-reference.csv',
    delim = ',',
    header = true,
    columns = {
      'Code': 'VARCHAR',
      'System': 'VARCHAR',
      'Display': 'VARCHAR'
    });

CREATE TABLE business_rules AS 
  SELECT * FROM read_csv_auto('/home/snshah/workspaces/github.com/qe-collaborative-services/1115-hub/src/ahc-hrsn-elt/reference-data/business-rules.csv',
    delim = ',',
    header = true,
    columns = {
      'Worksheet': 'VARCHAR',
      'Field': 'VARCHAR',
      'Required': 'VARCHAR',
      'Permissible Values': 'VARCHAR', 
      'Criteria-1': 'VARCHAR',
      'Criteria-2': 'VARCHAR',
      'Criteria-3': 'VARCHAR',
      'Criteria-4': 'VARCHAR',
      'Criteria-5': 'VARCHAR',
      'Criteria-6': 'VARCHAR',
      'Criteria-7': 'VARCHAR',
      'Remarks': 'VARCHAR'
    });

CREATE TABLE ahc_cross_walk AS 
  SELECT * FROM read_csv_auto('/home/snshah/workspaces/github.com/qe-collaborative-services/1115-hub/src/ahc-hrsn-elt/reference-data/ahc-cross-walk.csv',
    delim = ',',
    header = true,
    columns = {
      'SCREENING_CODE': 'VARCHAR',
      'SCREENING_CODE_DESCRIPTION': 'VARCHAR',
      'QUESTION': 'VARCHAR',
      'QUESTION_CODE': 'VARCHAR',
      'ANSWER_VALUE': 'VARCHAR',
      'ANSWER_CODE': 'VARCHAR',
      'SCORE': 'VARCHAR',
      'UCUM Units': 'VARCHAR',
      'SDOH_DOMAIN': 'VARCHAR',
      'POTENTIAL_NEED_INDICATED': 'VARCHAR',
    });

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
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-2023-12-12-valid.csv (ERROR)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('8b7c669c-1795-5f6b-8f3a-3e502b74c628', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-2023-12-12-valid.csv', 'ERROR', NULL);
INSERT INTO "orch_session_issue" ("orch_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('7b979b68-7227-53fd-b689-e4fe153afb76', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '8b7c669c-1795-5f6b-8f3a-3e502b74c628', 'Unknown CSV File Type', 'CSV file ''ahc-hrsn-2023-12-12-valid.csv'' not found in ''ahc-hrsn-2023-12-12-valid.csv''', NULL, NULL, 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-2023-12-12-valid.csv', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/JRCHC_SDOH HEL_Report 2452_ran 020124DeIdent.xlsx (ERROR)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('abf5c680-a135-5d89-b871-fa5b9b99aed6', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/JRCHC_SDOH HEL_Report 2452_ran 020124DeIdent.xlsx', 'ERROR', NULL);
INSERT INTO "orch_session_issue" ("orch_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('641dff51-97fd-56b3-8443-c1ed568a6d66', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'abf5c680-a135-5d89-b871-fa5b9b99aed6', 'Sheet Missing', 'Excel workbook sheet ''Admin_Demographic'' not found in ''JRCHC_SDOH HEL_Report 2452_ran 020124DeIdent.xlsx'' (available: JRCHC_SDOH HEL_Report 2452_ran )', NULL, NULL, 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/JRCHC_SDOH HEL_Report 2452_ran 020124DeIdent.xlsx', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/JRCHC_SDOH HEL_Report 2452_ran 020124DeIdent.xlsx (ERROR)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('d70a4700-6b40-52fc-a7a2-69ef0d7f69ff', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/JRCHC_SDOH HEL_Report 2452_ran 020124DeIdent.xlsx', 'ERROR', NULL);
INSERT INTO "orch_session_issue" ("orch_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('47277588-99e8-59f5-8384-b24344a86073', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'd70a4700-6b40-52fc-a7a2-69ef0d7f69ff', 'Sheet Missing', 'Excel workbook sheet ''Screening'' not found in ''JRCHC_SDOH HEL_Report 2452_ran 020124DeIdent.xlsx'' (available: JRCHC_SDOH HEL_Report 2452_ran )', NULL, NULL, 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/JRCHC_SDOH HEL_Report 2452_ran 020124DeIdent.xlsx', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/JRCHC_SDOH HEL_Report 2452_ran 020124DeIdent.xlsx (ERROR)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('58b22e99-5854-53bf-adbe-08e67df99b85', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/JRCHC_SDOH HEL_Report 2452_ran 020124DeIdent.xlsx', 'ERROR', NULL);
INSERT INTO "orch_session_issue" ("orch_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('a26ce332-3ced-5623-861d-23a2ef78e4a9', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '58b22e99-5854-53bf-adbe-08e67df99b85', 'Sheet Missing', 'Excel workbook sheet ''QE_Admin_Data'' not found in ''JRCHC_SDOH HEL_Report 2452_ran 020124DeIdent.xlsx'' (available: JRCHC_SDOH HEL_Report 2452_ran )', NULL, NULL, 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/JRCHC_SDOH HEL_Report 2452_ran 020124DeIdent.xlsx', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/JRCHC_SDOH HEL_Report 2452_ran 020124DeIdent.xlsx (ERROR)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('bc0c03b5-d1ba-5301-850f-5e4c42c1bf09', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/JRCHC_SDOH HEL_Report 2452_ran 020124DeIdent.xlsx', 'ERROR', NULL);
INSERT INTO "orch_session_issue" ("orch_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('ae477ba1-c7f1-5f34-847a-50bddb7130aa', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'bc0c03b5-d1ba-5301-850f-5e4c42c1bf09', 'Sheet Missing', 'Excel workbook sheet ''Question_Reference'' not found in ''JRCHC_SDOH HEL_Report 2452_ran 020124DeIdent.xlsx'' (available: JRCHC_SDOH HEL_Report 2452_ran )', NULL, NULL, 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/JRCHC_SDOH HEL_Report 2452_ran 020124DeIdent.xlsx', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/JRCHC_SDOH HEL_Report 2452_ran 020124DeIdent.xlsx (ERROR)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/JRCHC_SDOH HEL_Report 2452_ran 020124DeIdent.xlsx', 'ERROR', NULL);
INSERT INTO "orch_session_issue" ("orch_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839', 'Sheet Missing', 'Excel workbook sheet ''Answer_Reference'' not found in ''JRCHC_SDOH HEL_Report 2452_ran 020124DeIdent.xlsx'' (available: JRCHC_SDOH HEL_Report 2452_ran )', NULL, NULL, 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/JRCHC_SDOH HEL_Report 2452_ran 020124DeIdent.xlsx', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/QE_ADMIN_DATA-2_01HPKTY3HCTK826TVX5TASGA55.csv (qe_admin_data_2_01hpkty3hctk826tvx5tasga55)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('7ef8bdeb-fd56-5eb9-a09b-ef15ce18dc49', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/QE_ADMIN_DATA-2_01HPKTY3HCTK826TVX5TASGA55.csv', 'qe_admin_data_2_01hpkty3hctk826tvx5tasga55', NULL);

-- state management diagnostics 
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('591191c7-f693-5957-8734-ac87151ca981', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '7ef8bdeb-fd56-5eb9-a09b-ef15ce18dc49', 'ENTER(ingest)', 'ATTEMPT_CSV_INGEST', NULL, 'QeAdminDataCsvFileIngestSource.ingestSQL', (CURRENT_TIMESTAMP), NULL);

-- be sure to add src_file_row_number and session_id columns to each row
-- because assurance CTEs require them
CREATE TABLE qe_admin_data_2_01hpkty3hctk826tvx5tasga55 AS
  SELECT *, row_number() OVER () as src_file_row_number, '05269d28-15ae-5bd6-bd88-f949ccfa52d7' as session_id, '7ef8bdeb-fd56-5eb9-a09b-ef15ce18dc49' as session_entry_id
    FROM read_csv_auto('support/assurance/ahc-hrsn-elt/screening/synthetic-content/QE_ADMIN_DATA-2_01HPKTY3HCTK826TVX5TASGA55.csv');

WITH required_column_names_in_src AS (
    SELECT column_name
      FROM (VALUES ('PAT_MRN_ID'), ('FACILITY ID (Assigning authority)'), ('FACILITY_LONG_NAME'), ('ORGANIZATION_TYPE'), ('FACILITY ADDRESS1'), ('FACILITY ADDRESS2'), ('FACILITY CITY'), ('FACILITY STATE'), ('FACILITY ZIP'), ('VISIT_PART_2_FLAG'), ('VISIT_OMH_FLAG'), ('VISIT_OPWDD_FLAG')) AS required(column_name)
     WHERE required.column_name NOT IN (
         SELECT column_name
           FROM information_schema.columns
          WHERE table_name = 'qe_admin_data_2_01hpkty3hctk826tvx5tasga55')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '7ef8bdeb-fd56-5eb9-a09b-ef15ce18dc49',
           'Missing Column',
           'Required column ' || column_name || ' is missing in qe_admin_data_2_01hpkty3hctk826tvx5tasga55.',
           'Ensure qe_admin_data_2_01hpkty3hctk826tvx5tasga55 contains the column "' || column_name || '"'
      FROM required_column_names_in_src;

INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('3b4eb0e5-6239-537a-8e67-e50e172e72a2', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '7ef8bdeb-fd56-5eb9-a09b-ef15ce18dc49', 'ATTEMPT_CSV_INGEST', 'INGESTED_CSV', NULL, 'QeAdminDataCsvFileIngestSource.ingestSQL', (CURRENT_TIMESTAMP), NULL);
    
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-2023-12-25-valid.xlsx (ERROR)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('071f8fe1-4899-5c71-9c86-7d7377661d45', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-2023-12-25-valid.xlsx', 'ERROR', NULL);
INSERT INTO "orch_session_issue" ("orch_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('86b4a49e-7378-5159-9f41-b005208c31bc', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '071f8fe1-4899-5c71-9c86-7d7377661d45', 'Sheet Missing', 'Excel workbook sheet ''Question_Reference'' not found in ''ahc-hrsn-2023-12-25-valid.xlsx'' (available: Admin_Demographic, Screening, QE_Admin_Data)', NULL, NULL, 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-2023-12-25-valid.xlsx', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-2023-12-25-valid.xlsx (ERROR)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('a530fe1b-57ef-5a90-8bea-835ece2483da', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-2023-12-25-valid.xlsx', 'ERROR', NULL);
INSERT INTO "orch_session_issue" ("orch_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('a3fe7098-8ae8-5612-81ac-cbe10780c19b', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'a530fe1b-57ef-5a90-8bea-835ece2483da', 'Sheet Missing', 'Excel workbook sheet ''Answer_Reference'' not found in ''ahc-hrsn-2023-12-25-valid.xlsx'' (available: Admin_Demographic, Screening, QE_Admin_Data)', NULL, NULL, 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-2023-12-25-valid.xlsx', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/jrchc-hrsn-file-spec.xlsx (ERROR)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('99e72a60-96ab-5ef1-a3af-3e7759777664', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/jrchc-hrsn-file-spec.xlsx', 'ERROR', NULL);
INSERT INTO "orch_session_issue" ("orch_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('e36daa69-3c63-5384-b6a7-03fa3b00641d', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '99e72a60-96ab-5ef1-a3af-3e7759777664', 'Sheet Missing', 'Excel workbook sheet ''Admin_Demographic'' not found in ''jrchc-hrsn-file-spec.xlsx'' (available: Original Report, HeL LOINC Mapping)', NULL, NULL, 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/jrchc-hrsn-file-spec.xlsx', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/jrchc-hrsn-file-spec.xlsx (ERROR)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('89f7ec04-277a-5799-afaa-a70d0f2a8ed5', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/jrchc-hrsn-file-spec.xlsx', 'ERROR', NULL);
INSERT INTO "orch_session_issue" ("orch_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('c60cf3db-b1bf-5103-b278-b0c128ce924a', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '89f7ec04-277a-5799-afaa-a70d0f2a8ed5', 'Sheet Missing', 'Excel workbook sheet ''Screening'' not found in ''jrchc-hrsn-file-spec.xlsx'' (available: Original Report, HeL LOINC Mapping)', NULL, NULL, 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/jrchc-hrsn-file-spec.xlsx', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/jrchc-hrsn-file-spec.xlsx (ERROR)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('b2a7c7e8-5ffe-5f28-8112-4eb7abb6397f', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/jrchc-hrsn-file-spec.xlsx', 'ERROR', NULL);
INSERT INTO "orch_session_issue" ("orch_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('b10e248d-8c94-59ec-83fc-a1249dd3b111', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'b2a7c7e8-5ffe-5f28-8112-4eb7abb6397f', 'Sheet Missing', 'Excel workbook sheet ''QE_Admin_Data'' not found in ''jrchc-hrsn-file-spec.xlsx'' (available: Original Report, HeL LOINC Mapping)', NULL, NULL, 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/jrchc-hrsn-file-spec.xlsx', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/jrchc-hrsn-file-spec.xlsx (ERROR)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('5222b730-9add-5b52-b0c9-6f2506b0af9d', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/jrchc-hrsn-file-spec.xlsx', 'ERROR', NULL);
INSERT INTO "orch_session_issue" ("orch_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('fa7874f6-f848-572b-a9ab-9db4c8d5e959', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '5222b730-9add-5b52-b0c9-6f2506b0af9d', 'Sheet Missing', 'Excel workbook sheet ''Question_Reference'' not found in ''jrchc-hrsn-file-spec.xlsx'' (available: Original Report, HeL LOINC Mapping)', NULL, NULL, 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/jrchc-hrsn-file-spec.xlsx', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/jrchc-hrsn-file-spec.xlsx (ERROR)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('c302047e-21cf-5059-a32c-e81a9bd3a9b9', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/jrchc-hrsn-file-spec.xlsx', 'ERROR', NULL);
INSERT INTO "orch_session_issue" ("orch_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('3252fee6-3a9a-5f4c-81c6-739201046d79', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'c302047e-21cf-5059-a32c-e81a9bd3a9b9', 'Sheet Missing', 'Excel workbook sheet ''Answer_Reference'' not found in ''jrchc-hrsn-file-spec.xlsx'' (available: Original Report, HeL LOINC Mapping)', NULL, NULL, 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/jrchc-hrsn-file-spec.xlsx', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx (ERROR)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('78d6a904-035e-54ae-8ac2-ca5cdf3f75f7', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx', 'ERROR', NULL);
INSERT INTO "orch_session_issue" ("orch_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('9860873a-c387-5d98-9930-4ff296eb7192', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '78d6a904-035e-54ae-8ac2-ca5cdf3f75f7', 'Sheet Missing', 'Excel workbook sheet ''Admin_Demographic'' not found in ''synthetic-fail-excel-01.xlsx'' (available: Sheet1)', NULL, NULL, 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx (ERROR)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('d5d6e25d-81b4-5f98-8b91-ea2dbc155a9c', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx', 'ERROR', NULL);
INSERT INTO "orch_session_issue" ("orch_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('46171763-bd21-57a8-a403-0785f72643cf', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'd5d6e25d-81b4-5f98-8b91-ea2dbc155a9c', 'Sheet Missing', 'Excel workbook sheet ''Screening'' not found in ''synthetic-fail-excel-01.xlsx'' (available: Sheet1)', NULL, NULL, 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx (ERROR)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('4971a2f5-06a3-5898-823d-364145d3b9a5', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx', 'ERROR', NULL);
INSERT INTO "orch_session_issue" ("orch_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('c2c0cbca-70cb-54f6-9dc7-66b47c4f3157', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '4971a2f5-06a3-5898-823d-364145d3b9a5', 'Sheet Missing', 'Excel workbook sheet ''QE_Admin_Data'' not found in ''synthetic-fail-excel-01.xlsx'' (available: Sheet1)', NULL, NULL, 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx (ERROR)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('8640a4b5-53ef-506e-bcde-83f00315d4b2', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx', 'ERROR', NULL);
INSERT INTO "orch_session_issue" ("orch_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('544998d3-58c5-5f65-9dc8-9f998508495f', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '8640a4b5-53ef-506e-bcde-83f00315d4b2', 'Sheet Missing', 'Excel workbook sheet ''Question_Reference'' not found in ''synthetic-fail-excel-01.xlsx'' (available: Sheet1)', NULL, NULL, 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx (ERROR)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('0adb81bc-3df2-5f86-99cc-2d20e1dd5efd', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx', 'ERROR', NULL);
INSERT INTO "orch_session_issue" ("orch_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('10d0290c-b2eb-581e-b627-b5b8fcbb830f', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '0adb81bc-3df2-5f86-99cc-2d20e1dd5efd', 'Sheet Missing', 'Excel workbook sheet ''Answer_Reference'' not found in ''synthetic-fail-excel-01.xlsx'' (available: Sheet1)', NULL, NULL, 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail.csv (ERROR)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('e6951d0b-be59-58c3-8a04-01181208c601', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail.csv', 'ERROR', NULL);
INSERT INTO "orch_session_issue" ("orch_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('2afb3098-bcfd-5a54-8ebb-4d65d399c55e', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'e6951d0b-be59-58c3-8a04-01181208c601', 'Unknown CSV File Type', 'CSV file ''synthetic-fail.csv'' not found in ''synthetic-fail.csv''', NULL, NULL, 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail.csv', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/SCREENING-2_01HPKTY3HCTK826TVX5TASGA55.csv (screening_2_01hpkty3hctk826tvx5tasga55)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('0e074bf2-f1fe-55d4-bd44-a88cbed79aeb', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/SCREENING-2_01HPKTY3HCTK826TVX5TASGA55.csv', 'screening_2_01hpkty3hctk826tvx5tasga55', NULL);

-- state management diagnostics 
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('e8b3dab4-5058-5c79-8088-45b423119149', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '0e074bf2-f1fe-55d4-bd44-a88cbed79aeb', 'ENTER(ingest)', 'ATTEMPT_CSV_INGEST', NULL, 'ScreeningCsvFileIngestSource.ingestSQL', (CURRENT_TIMESTAMP), NULL);

-- be sure to add src_file_row_number and session_id columns to each row
-- because assurance CTEs require them
CREATE TABLE screening_2_01hpkty3hctk826tvx5tasga55 AS
  SELECT *, row_number() OVER () as src_file_row_number, '05269d28-15ae-5bd6-bd88-f949ccfa52d7' as session_id, '0e074bf2-f1fe-55d4-bd44-a88cbed79aeb' as session_entry_id
    FROM read_csv_auto('support/assurance/ahc-hrsn-elt/screening/synthetic-content/SCREENING-2_01HPKTY3HCTK826TVX5TASGA55.csv');

WITH required_column_names_in_src AS (
    SELECT column_name
      FROM (VALUES ('PAT_MRN_ID'), ('FACILITY_ID'), ('ENCOUNTER_ID'), ('ENCOUNTER_CLASS_CODE_SYSTEM'), ('ENCOUNTER_CLASS_CODE'), ('ENCOUNTER_CLASS_CODE_DESCRIPTION'), ('ENCOUNTER_STATUS_CODE_SYSTEM'), ('ENCOUNTER_STATUS_CODE'), ('ENCOUNTER_STATUS_CODE_DESCRIPTION'), ('ENCOUNTER_TYPE_CODE_SYSTEM_NAME'), ('ENCOUNTER_TYPE_CODE'), ('ENCOUNTER_TYPE_CODE_DESCRIPTION'), ('SCREENING_CODE_DESCRIPTION'), ('SCREENING_CODE_SYSTEM_NAME'), ('SCREENING_CODE'), ('SCREENING_STATUS_CODE_DESCRIPTION'), ('SCREENING_STATUS_CODE'), ('SCREENING_STATUS_CODE_SYSTEM'), ('RECORDED_TIME'), ('QUESTION'), ('MEAS_VALUE'), ('UCUM_UNITS'), ('QUESTION_CODE'), ('QUESTION_CODE_SYSTEM_NAME'), ('ANSWER_CODE'), ('ANSWER_CODE_SYSTEM_NAME'), ('PARENT_QUESTION_CODE'), ('SDOH_DOMAIN'), ('POTENTIAL_NEED_INDICATED'), ('ASSISTANCE_REQUESTED')) AS required(column_name)
     WHERE required.column_name NOT IN (
         SELECT column_name
           FROM information_schema.columns
          WHERE table_name = 'screening_2_01hpkty3hctk826tvx5tasga55')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '0e074bf2-f1fe-55d4-bd44-a88cbed79aeb',
           'Missing Column',
           'Required column ' || column_name || ' is missing in screening_2_01hpkty3hctk826tvx5tasga55.',
           'Ensure screening_2_01hpkty3hctk826tvx5tasga55 contains the column "' || column_name || '"'
      FROM required_column_names_in_src;

INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('9dabd022-4a26-55f2-98f4-e534e7704b23', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '0e074bf2-f1fe-55d4-bd44-a88cbed79aeb', 'ATTEMPT_CSV_INGEST', 'INGESTED_CSV', NULL, 'ScreeningCsvFileIngestSource.ingestSQL', (CURRENT_TIMESTAMP), NULL);
    
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/DEMOGRAPHIC_DATA-2_01HPKTY3HCTK826TVX5TASGA55.csv (demographic_data_2_01hpkty3hctk826tvx5tasga55)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('80af4eff-d697-565b-9e3f-a587e322b1da', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/DEMOGRAPHIC_DATA-2_01HPKTY3HCTK826TVX5TASGA55.csv', 'demographic_data_2_01hpkty3hctk826tvx5tasga55', NULL);

-- state management diagnostics 
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('6fcd9df5-34cf-5c09-8fb5-e73617e28d73', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '80af4eff-d697-565b-9e3f-a587e322b1da', 'ENTER(ingest)', 'ATTEMPT_CSV_INGEST', NULL, 'AdminDemographicCsvFileIngestSource.ingestSQL', (CURRENT_TIMESTAMP), NULL);

-- be sure to add src_file_row_number and session_id columns to each row
-- because assurance CTEs require them
CREATE TABLE demographic_data_2_01hpkty3hctk826tvx5tasga55 AS
  SELECT *, row_number() OVER () as src_file_row_number, '05269d28-15ae-5bd6-bd88-f949ccfa52d7' as session_id, '80af4eff-d697-565b-9e3f-a587e322b1da' as session_entry_id
    FROM read_csv_auto('support/assurance/ahc-hrsn-elt/screening/synthetic-content/DEMOGRAPHIC_DATA-2_01HPKTY3HCTK826TVX5TASGA55.csv');

WITH required_column_names_in_src AS (
    SELECT column_name
      FROM (VALUES ('MPI_ID'), ('PAT_MRN_ID'), ('FACILITY_ID'), ('CONSENT'), ('FIRST_NAME'), ('MIDDLE_NAME'), ('LAST_NAME'), ('ADMINISTRATIVE_SEX_CODE'), ('ADMINISTRATIVE_SEX _CODE_DESCRIPTION'), ('ADMINISTRATIVE_SEX _CODE_SYSTEM'), ('SEX_AT_BIRTH_CODE'), ('SEX_AT_BIRTH_CODE_DESCRIPTION'), ('SEX_AT_BIRTH_CODE_SYSTEM'), ('PAT_BIRTH_DATE'), ('ADDRESS1'), ('ADDRESS2'), ('CITY'), ('STATE'), ('ZIP'), ('GENDER_IDENTITY_CODE_SYSTEM_NAME'), ('GENDER_IDENTITY_CODE'), ('GENDER_IDENTITY_DESCRIPTION'), ('SEXUAL_ORIENTATION_CODE_SYSTEM_NAME'), ('SEXUAL_ORIENTATION_CODE'), ('SEXUAL_ORIENTATION_DESCRIPTION'), ('PREFERRED_LANGUAGE_CODE_SYSTEM_NAME'), ('PREFERRED_LANGUAGE_CODE'), ('PREFERRED_LANGUAGE_DESCRIPTION'), ('RACE_CODE_SYSTEM_NAME'), ('RACE_CODE'), ('RACE_CODE_DESCRIPTION'), ('ETHNICITY_CODE_SYSTEM_NAME'), ('ETHNICITY_CODE'), ('ETHNICITY_CODE_DESCRIPTION'), ('MEDICAID_CIN')) AS required(column_name)
     WHERE required.column_name NOT IN (
         SELECT column_name
           FROM information_schema.columns
          WHERE table_name = 'demographic_data_2_01hpkty3hctk826tvx5tasga55')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '80af4eff-d697-565b-9e3f-a587e322b1da',
           'Missing Column',
           'Required column ' || column_name || ' is missing in demographic_data_2_01hpkty3hctk826tvx5tasga55.',
           'Ensure demographic_data_2_01hpkty3hctk826tvx5tasga55 contains the column "' || column_name || '"'
      FROM required_column_names_in_src;

INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('7e65e3a7-4415-55f4-866b-3b0cc4e85fc6', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '80af4eff-d697-565b-9e3f-a587e322b1da', 'ATTEMPT_CSV_INGEST', 'INGESTED_CSV', NULL, 'AdminDemographicCsvFileIngestSource.ingestSQL', (CURRENT_TIMESTAMP), NULL);
    
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-2024-01-25-valid.xlsx (ahc_hrsn_2024_01_25_valid_admin_demographic)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('5b77d127-e62a-50a9-acee-bea63ff64dd5', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-2024-01-25-valid.xlsx', 'ahc_hrsn_2024_01_25_valid_admin_demographic', NULL);
     
-- state management diagnostics 
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('a92a6466-6fe4-58d7-8948-e2e09dc2fec2', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '5b77d127-e62a-50a9-acee-bea63ff64dd5', 'ENTER(ingest)', 'ATTEMPT_EXCEL_INGEST', NULL, 'AdminDemographicExcelSheetIngestSource.ingestSQL', (CURRENT_TIMESTAMP), NULL);

-- ingest Excel workbook sheet 'Admin_Demographic' into ahc_hrsn_2024_01_25_valid_admin_demographic using spatial plugin
INSTALL spatial; LOAD spatial;

-- be sure to add src_file_row_number and session_id columns to each row
-- because assurance CTEs require them
CREATE TABLE ahc_hrsn_2024_01_25_valid_admin_demographic AS
  SELECT *, row_number() OVER () as src_file_row_number, '05269d28-15ae-5bd6-bd88-f949ccfa52d7' as session_id, '5b77d127-e62a-50a9-acee-bea63ff64dd5' as session_entry_id
    FROM st_read('support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-2024-01-25-valid.xlsx', layer='Admin_Demographic', open_options=['HEADERS=FORCE', 'FIELD_TYPES=AUTO']);          

WITH required_column_names_in_src AS (
    SELECT column_name
      FROM (VALUES ('ADDRESS1'), ('ADDRESS2'), ('ADMINISTRATIVE_SEX'), ('CITY'), ('CONSENT '), ('ENCOUNTER_ID'), ('ETHNICITY_CODE'), ('ETHNICITY_CODE_DESCRIPTION'), ('ETHNICITY_CODE_SYSTEM_NAME'), ('FACILITY ID (Assigning authority)'), ('FIRST_NAME'), ('GENDER_IDENTITY_CODE'), ('GENDER_IDENTITY_CODE_SYSTEM_NAME'), ('GENDER_IDENTITY_DESCRIPTION'), ('LAST_NAME'), ('MEDICAID_CIN'), ('MIDDLE_NAME'), ('MPI_ID'), ('PAT_BIRTH_DATE'), ('PAT_MRN_ID'), ('PREFERRED_LANGUAGE_CODE'), ('PREFERRED_LANGUAGE_CODE_SYSTEM_NAME'), ('PREFERRED_LANGUAGE_DESCRIPTION'), ('RACE_CODE'), ('RACE_CODE_DESCRIPTION'), ('RACE_CODE_SYSTEM_NAME'), ('SEX_AT_BIRTH'), ('SEXUAL_ORIENTATION_CODE'), ('SEXUAL_ORIENTATION_CODE_SYSTEM_NAME'), ('SEXUAL_ORIENTATION_DESCRIPTION'), ('STATE'), ('ZIP')) AS required(column_name)
     WHERE required.column_name NOT IN (
         SELECT column_name
           FROM information_schema.columns
          WHERE table_name = 'ahc_hrsn_2024_01_25_valid_admin_demographic')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '5b77d127-e62a-50a9-acee-bea63ff64dd5',
           'Missing Column',
           'Required column ' || column_name || ' is missing in ahc_hrsn_2024_01_25_valid_admin_demographic.',
           'Ensure ahc_hrsn_2024_01_25_valid_admin_demographic contains the column "' || column_name || '"'
      FROM required_column_names_in_src;
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('34e90086-3d06-5b10-972d-7d0b40a02289', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '5b77d127-e62a-50a9-acee-bea63ff64dd5', 'ATTEMPT_EXCEL_INGEST', 'INGESTED_EXCEL_WORKBOOK_SHEET', NULL, 'AdminDemographicExcelSheetIngestSource.ingestSQL', (CURRENT_TIMESTAMP), NULL);

-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-2024-01-25-valid.xlsx (ahc_hrsn_2024_01_25_valid_screening)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('21d7e4ec-32e3-5e20-9029-28fdd6c5fa66', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-2024-01-25-valid.xlsx', 'ahc_hrsn_2024_01_25_valid_screening', NULL);
     
-- state management diagnostics 
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('4f7e4436-c5f6-5ba1-9793-580ab66789fb', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '21d7e4ec-32e3-5e20-9029-28fdd6c5fa66', 'ENTER(ingest)', 'ATTEMPT_EXCEL_INGEST', NULL, 'ScreeningExcelSheetIngestSource.ingestSQL', (CURRENT_TIMESTAMP), NULL);

-- ingest Excel workbook sheet 'Screening' into ahc_hrsn_2024_01_25_valid_screening using spatial plugin
INSTALL spatial; LOAD spatial;

-- be sure to add src_file_row_number and session_id columns to each row
-- because assurance CTEs require them
CREATE TABLE ahc_hrsn_2024_01_25_valid_screening AS
  SELECT *, row_number() OVER () as src_file_row_number, '05269d28-15ae-5bd6-bd88-f949ccfa52d7' as session_id, '21d7e4ec-32e3-5e20-9029-28fdd6c5fa66' as session_entry_id
    FROM st_read('support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-2024-01-25-valid.xlsx', layer='Screening', open_options=['HEADERS=FORCE', 'FIELD_TYPES=AUTO']);          

WITH required_column_names_in_src AS (
    SELECT column_name
      FROM (VALUES ('ANSWER_CODE_SYSTEM_NAME'), ('ANSWER_CODE'), ('ASSISTANCE_REQUESTED'), ('FACILITY ID (Assigning authority)'), ('MEAS_VALUE'), ('PARENT_QUESTION_CODE'), ('PAT_MRN_ID'), ('POTENTIAL_NEED_INDICATED'), ('QUESTION_CODE_SYSTEM_NAME'), ('QUESTION_CODE'), ('QUESTION'), ('RECORDED_TIME'), ('SCREENING_CODE_SYSTEM_NAME'), ('SCREENING_CODE'), ('SCREENING_METHOD'), ('SCREENING_NAME'), ('SDOH_DOMAIN'), ('UCUM_UNITS')) AS required(column_name)
     WHERE required.column_name NOT IN (
         SELECT column_name
           FROM information_schema.columns
          WHERE table_name = 'ahc_hrsn_2024_01_25_valid_screening')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '21d7e4ec-32e3-5e20-9029-28fdd6c5fa66',
           'Missing Column',
           'Required column ' || column_name || ' is missing in ahc_hrsn_2024_01_25_valid_screening.',
           'Ensure ahc_hrsn_2024_01_25_valid_screening contains the column "' || column_name || '"'
      FROM required_column_names_in_src;
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('86ff3ab6-900d-5474-b63c-cbcac3c66f1a', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '21d7e4ec-32e3-5e20-9029-28fdd6c5fa66', 'ATTEMPT_EXCEL_INGEST', 'INGESTED_EXCEL_WORKBOOK_SHEET', NULL, 'ScreeningExcelSheetIngestSource.ingestSQL', (CURRENT_TIMESTAMP), NULL);

-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-2024-01-25-valid.xlsx (ahc_hrsn_2024_01_25_valid_q_e_admin_data)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('f6d4aff4-4b71-5662-8f57-00ee247dc57c', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-2024-01-25-valid.xlsx', 'ahc_hrsn_2024_01_25_valid_q_e_admin_data', NULL);
     
-- state management diagnostics 
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('6202ec4a-f3d5-5302-9ed6-9cb59a5b2818', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'f6d4aff4-4b71-5662-8f57-00ee247dc57c', 'ENTER(ingest)', 'ATTEMPT_EXCEL_INGEST', NULL, 'QeAdminDataExcelSheetIngestSource.ingestSQL', (CURRENT_TIMESTAMP), NULL);

-- ingest Excel workbook sheet 'QE_Admin_Data' into ahc_hrsn_2024_01_25_valid_q_e_admin_data using spatial plugin
INSTALL spatial; LOAD spatial;

-- be sure to add src_file_row_number and session_id columns to each row
-- because assurance CTEs require them
CREATE TABLE ahc_hrsn_2024_01_25_valid_q_e_admin_data AS
  SELECT *, row_number() OVER () as src_file_row_number, '05269d28-15ae-5bd6-bd88-f949ccfa52d7' as session_id, 'f6d4aff4-4b71-5662-8f57-00ee247dc57c' as session_entry_id
    FROM st_read('support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-2024-01-25-valid.xlsx', layer='QE_Admin_Data', open_options=['HEADERS=FORCE', 'FIELD_TYPES=AUTO']);          

WITH required_column_names_in_src AS (
    SELECT column_name
      FROM (VALUES ('PAT_MRN_ID'), ('FACILITY ID (Assigning authority)'), ('FACILITY_LONG_NAME'), ('ORGANIZATION_TYPE'), ('FACILITY ADDRESS1'), ('FACILITY ADDRESS2'), ('FACILITY CITY'), ('FACILITY STATE'), ('FACILITY ZIP'), ('VISIT_PART_2_FLAG'), ('VISIT_OMH_FLAG'), ('VISIT_OPWDD_FLAG')) AS required(column_name)
     WHERE required.column_name NOT IN (
         SELECT column_name
           FROM information_schema.columns
          WHERE table_name = 'ahc_hrsn_2024_01_25_valid_q_e_admin_data')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           'f6d4aff4-4b71-5662-8f57-00ee247dc57c',
           'Missing Column',
           'Required column ' || column_name || ' is missing in ahc_hrsn_2024_01_25_valid_q_e_admin_data.',
           'Ensure ahc_hrsn_2024_01_25_valid_q_e_admin_data contains the column "' || column_name || '"'
      FROM required_column_names_in_src;
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('4b7537b2-9d60-59f3-8c61-fa2ff4265c02', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'f6d4aff4-4b71-5662-8f57-00ee247dc57c', 'ATTEMPT_EXCEL_INGEST', 'INGESTED_EXCEL_WORKBOOK_SHEET', NULL, 'QeAdminDataExcelSheetIngestSource.ingestSQL', (CURRENT_TIMESTAMP), NULL);

-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-2024-01-25-valid.xlsx (ahc_hrsn_2024_01_25_valid_question_reference)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('657d6337-8d24-5b67-b139-87db6a228264', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-2024-01-25-valid.xlsx', 'ahc_hrsn_2024_01_25_valid_question_reference', NULL);
     
-- state management diagnostics 
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('9f13dd7d-9ff8-509d-b716-cde856c5f0f0', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '657d6337-8d24-5b67-b139-87db6a228264', 'ENTER(ingest)', 'ATTEMPT_EXCEL_INGEST', NULL, 'QuestionReferenceExcelSheetIngestSource.ingestSQL', (CURRENT_TIMESTAMP), NULL);

-- ingest Excel workbook sheet 'Question_Reference' into ahc_hrsn_2024_01_25_valid_question_reference using spatial plugin
INSTALL spatial; LOAD spatial;

-- be sure to add src_file_row_number and session_id columns to each row
-- because assurance CTEs require them
CREATE TABLE ahc_hrsn_2024_01_25_valid_question_reference AS
  SELECT *, row_number() OVER () as src_file_row_number, '05269d28-15ae-5bd6-bd88-f949ccfa52d7' as session_id, '657d6337-8d24-5b67-b139-87db6a228264' as session_entry_id
    FROM st_read('support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-2024-01-25-valid.xlsx', layer='Question_Reference', open_options=['HEADERS=FORCE', 'FIELD_TYPES=AUTO']);          

WITH required_column_names_in_src AS (
    SELECT column_name
      FROM (VALUES ('SCREENING_CODE'), ('QUESTION_CODE'), ('QUESTION'), ('SDOH_DOMAIN')) AS required(column_name)
     WHERE required.column_name NOT IN (
         SELECT column_name
           FROM information_schema.columns
          WHERE table_name = 'ahc_hrsn_2024_01_25_valid_question_reference')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '657d6337-8d24-5b67-b139-87db6a228264',
           'Missing Column',
           'Required column ' || column_name || ' is missing in ahc_hrsn_2024_01_25_valid_question_reference.',
           'Ensure ahc_hrsn_2024_01_25_valid_question_reference contains the column "' || column_name || '"'
      FROM required_column_names_in_src;
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('9c0d34d3-bf09-527a-aef5-85004a400be5', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '657d6337-8d24-5b67-b139-87db6a228264', 'ATTEMPT_EXCEL_INGEST', 'INGESTED_EXCEL_WORKBOOK_SHEET', NULL, 'QuestionReferenceExcelSheetIngestSource.ingestSQL', (CURRENT_TIMESTAMP), NULL);

-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-2024-01-25-valid.xlsx (ahc_hrsn_2024_01_25_valid_answer_reference)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('e2816d61-4406-5073-ac60-f129a107d938', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-2024-01-25-valid.xlsx', 'ahc_hrsn_2024_01_25_valid_answer_reference', NULL);
     
-- state management diagnostics 
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('413ec5cd-eee9-5c62-90a5-6670f8b9ddff', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'e2816d61-4406-5073-ac60-f129a107d938', 'ENTER(ingest)', 'ATTEMPT_EXCEL_INGEST', NULL, 'AnswerReferenceExcelSheetIngestSource.ingestSQL', (CURRENT_TIMESTAMP), NULL);

-- ingest Excel workbook sheet 'Answer_Reference' into ahc_hrsn_2024_01_25_valid_answer_reference using spatial plugin
INSTALL spatial; LOAD spatial;

-- be sure to add src_file_row_number and session_id columns to each row
-- because assurance CTEs require them
CREATE TABLE ahc_hrsn_2024_01_25_valid_answer_reference AS
  SELECT *, row_number() OVER () as src_file_row_number, '05269d28-15ae-5bd6-bd88-f949ccfa52d7' as session_id, 'e2816d61-4406-5073-ac60-f129a107d938' as session_entry_id
    FROM st_read('support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-2024-01-25-valid.xlsx', layer='Answer_Reference', open_options=['HEADERS=FORCE', 'FIELD_TYPES=AUTO']);          

WITH required_column_names_in_src AS (
    SELECT column_name
      FROM (VALUES ('QUESTION_CODE'), ('ANSWER_CODE'), ('MEAS_VALUE')) AS required(column_name)
     WHERE required.column_name NOT IN (
         SELECT column_name
           FROM information_schema.columns
          WHERE table_name = 'ahc_hrsn_2024_01_25_valid_answer_reference')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           'e2816d61-4406-5073-ac60-f129a107d938',
           'Missing Column',
           'Required column ' || column_name || ' is missing in ahc_hrsn_2024_01_25_valid_answer_reference.',
           'Ensure ahc_hrsn_2024_01_25_valid_answer_reference contains the column "' || column_name || '"'
      FROM required_column_names_in_src;
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('6c48996f-0dd4-572f-b087-e5913926cd4b', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'e2816d61-4406-5073-ac60-f129a107d938', 'ATTEMPT_EXCEL_INGEST', 'INGESTED_EXCEL_WORKBOOK_SHEET', NULL, 'AnswerReferenceExcelSheetIngestSource.ingestSQL', (CURRENT_TIMESTAMP), NULL);

SELECT session_entry_id, orch_session_issue_id, issue_type, issue_message, invalid_value FROM orch_session_issue WHERE session_id = '05269d28-15ae-5bd6-bd88-f949ccfa52d7'
```
### `ingest` STDOUT (status: `0`)
```json
[{"session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","orch_session_issue_id":"7b979b68-7227-53fd-b689-e4fe153afb76","issue_type":"Unknown CSV File Type","issue_message":"CSV file 'ahc-hrsn-2023-12-12-valid.csv' not found in 'ahc-hrsn-2023-12-12-valid.csv'","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-2023-12-12-valid.csv"},
{"session_entry_id":"abf5c680-a135-5d89-b871-fa5b9b99aed6","orch_session_issue_id":"641dff51-97fd-56b3-8443-c1ed568a6d66","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet 'Admin_Demographic' not found in 'JRCHC_SDOH HEL_Report 2452_ran 020124DeIdent.xlsx' (available: JRCHC_SDOH HEL_Report 2452_ran )","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/JRCHC_SDOH HEL_Report 2452_ran 020124DeIdent.xlsx"},
{"session_entry_id":"d70a4700-6b40-52fc-a7a2-69ef0d7f69ff","orch_session_issue_id":"47277588-99e8-59f5-8384-b24344a86073","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet 'Screening' not found in 'JRCHC_SDOH HEL_Report 2452_ran 020124DeIdent.xlsx' (available: JRCHC_SDOH HEL_Report 2452_ran )","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/JRCHC_SDOH HEL_Report 2452_ran 020124DeIdent.xlsx"},
{"session_entry_id":"58b22e99-5854-53bf-adbe-08e67df99b85","orch_session_issue_id":"a26ce332-3ced-5623-861d-23a2ef78e4a9","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet 'QE_Admin_Data' not found in 'JRCHC_SDOH HEL_Report 2452_ran 020124DeIdent.xlsx' (available: JRCHC_SDOH HEL_Report 2452_ran )","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/JRCHC_SDOH HEL_Report 2452_ran 020124DeIdent.xlsx"},
{"session_entry_id":"bc0c03b5-d1ba-5301-850f-5e4c42c1bf09","orch_session_issue_id":"ae477ba1-c7f1-5f34-847a-50bddb7130aa","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet 'Question_Reference' not found in 'JRCHC_SDOH HEL_Report 2452_ran 020124DeIdent.xlsx' (available: JRCHC_SDOH HEL_Report 2452_ran )","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/JRCHC_SDOH HEL_Report 2452_ran 020124DeIdent.xlsx"},
{"session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","orch_session_issue_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet 'Answer_Reference' not found in 'JRCHC_SDOH HEL_Report 2452_ran 020124DeIdent.xlsx' (available: JRCHC_SDOH HEL_Report 2452_ran )","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/JRCHC_SDOH HEL_Report 2452_ran 020124DeIdent.xlsx"},
{"session_entry_id":"071f8fe1-4899-5c71-9c86-7d7377661d45","orch_session_issue_id":"86b4a49e-7378-5159-9f41-b005208c31bc","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet 'Question_Reference' not found in 'ahc-hrsn-2023-12-25-valid.xlsx' (available: Admin_Demographic, Screening, QE_Admin_Data)","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-2023-12-25-valid.xlsx"},
{"session_entry_id":"a530fe1b-57ef-5a90-8bea-835ece2483da","orch_session_issue_id":"a3fe7098-8ae8-5612-81ac-cbe10780c19b","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet 'Answer_Reference' not found in 'ahc-hrsn-2023-12-25-valid.xlsx' (available: Admin_Demographic, Screening, QE_Admin_Data)","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/ahc-hrsn-2023-12-25-valid.xlsx"},
{"session_entry_id":"99e72a60-96ab-5ef1-a3af-3e7759777664","orch_session_issue_id":"e36daa69-3c63-5384-b6a7-03fa3b00641d","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet 'Admin_Demographic' not found in 'jrchc-hrsn-file-spec.xlsx' (available: Original Report, HeL LOINC Mapping)","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/jrchc-hrsn-file-spec.xlsx"},
{"session_entry_id":"89f7ec04-277a-5799-afaa-a70d0f2a8ed5","orch_session_issue_id":"c60cf3db-b1bf-5103-b278-b0c128ce924a","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet 'Screening' not found in 'jrchc-hrsn-file-spec.xlsx' (available: Original Report, HeL LOINC Mapping)","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/jrchc-hrsn-file-spec.xlsx"},
{"session_entry_id":"b2a7c7e8-5ffe-5f28-8112-4eb7abb6397f","orch_session_issue_id":"b10e248d-8c94-59ec-83fc-a1249dd3b111","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet 'QE_Admin_Data' not found in 'jrchc-hrsn-file-spec.xlsx' (available: Original Report, HeL LOINC Mapping)","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/jrchc-hrsn-file-spec.xlsx"},
{"session_entry_id":"5222b730-9add-5b52-b0c9-6f2506b0af9d","orch_session_issue_id":"fa7874f6-f848-572b-a9ab-9db4c8d5e959","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet 'Question_Reference' not found in 'jrchc-hrsn-file-spec.xlsx' (available: Original Report, HeL LOINC Mapping)","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/jrchc-hrsn-file-spec.xlsx"},
{"session_entry_id":"c302047e-21cf-5059-a32c-e81a9bd3a9b9","orch_session_issue_id":"3252fee6-3a9a-5f4c-81c6-739201046d79","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet 'Answer_Reference' not found in 'jrchc-hrsn-file-spec.xlsx' (available: Original Report, HeL LOINC Mapping)","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/jrchc-hrsn-file-spec.xlsx"},
{"session_entry_id":"78d6a904-035e-54ae-8ac2-ca5cdf3f75f7","orch_session_issue_id":"9860873a-c387-5d98-9930-4ff296eb7192","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet 'Admin_Demographic' not found in 'synthetic-fail-excel-01.xlsx' (available: Sheet1)","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx"},
{"session_entry_id":"d5d6e25d-81b4-5f98-8b91-ea2dbc155a9c","orch_session_issue_id":"46171763-bd21-57a8-a403-0785f72643cf","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet 'Screening' not found in 'synthetic-fail-excel-01.xlsx' (available: Sheet1)","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx"},
{"session_entry_id":"4971a2f5-06a3-5898-823d-364145d3b9a5","orch_session_issue_id":"c2c0cbca-70cb-54f6-9dc7-66b47c4f3157","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet 'QE_Admin_Data' not found in 'synthetic-fail-excel-01.xlsx' (available: Sheet1)","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx"},
{"session_entry_id":"8640a4b5-53ef-506e-bcde-83f00315d4b2","orch_session_issue_id":"544998d3-58c5-5f65-9dc8-9f998508495f","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet 'Question_Reference' not found in 'synthetic-fail-excel-01.xlsx' (available: Sheet1)","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx"},
{"session_entry_id":"0adb81bc-3df2-5f86-99cc-2d20e1dd5efd","orch_session_issue_id":"10d0290c-b2eb-581e-b627-b5b8fcbb830f","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet 'Answer_Reference' not found in 'synthetic-fail-excel-01.xlsx' (available: Sheet1)","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx"},
{"session_entry_id":"e6951d0b-be59-58c3-8a04-01181208c601","orch_session_issue_id":"2afb3098-bcfd-5a54-8ebb-4d65d399c55e","issue_type":"Unknown CSV File Type","issue_message":"CSV file 'synthetic-fail.csv' not found in 'synthetic-fail.csv'","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail.csv"}]

```
No STDERR emitted by `ingest`.

    

## ensureContent

```sql
-- preambleSQL
SET autoinstall_known_extensions=true;
SET autoload_known_extensions=true;
-- end preambleSQL
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('c40829eb-7f91-583a-8af8-06de851777a0', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '7ef8bdeb-fd56-5eb9-a09b-ef15ce18dc49', 'INGESTED_CSV', 'ATTEMPT_CSV_ASSURANCE', NULL, 'QeAdminDataCsvFileIngestSource.assuranceSQL', (CURRENT_TIMESTAMP), NULL);

WITH mandatory_value AS (
    SELECT 'PAT_MRN_ID' AS issue_column,
           "PAT_MRN_ID" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "qe_admin_data_2_01hpkty3hctk826tvx5tasga55"
     WHERE "PAT_MRN_ID" IS NULL
        OR TRIM("PAT_MRN_ID") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '7ef8bdeb-fd56-5eb9-a09b-ef15ce18dc49',
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
      FROM "qe_admin_data_2_01hpkty3hctk826tvx5tasga55"
     WHERE "FACILITY ID (Assigning authority)" IS NULL
        OR TRIM("FACILITY ID (Assigning authority)") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '7ef8bdeb-fd56-5eb9-a09b-ef15ce18dc49',
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
      FROM "qe_admin_data_2_01hpkty3hctk826tvx5tasga55"
     WHERE "FACILITY ID (Assigning authority)" IS NOT NULL
       AND "FACILITY ID (Assigning authority)" IN (
          SELECT "FACILITY ID (Assigning authority)"
            FROM "qe_admin_data_2_01hpkty3hctk826tvx5tasga55"
        GROUP BY "FACILITY ID (Assigning authority)"
          HAVING COUNT(*) > 1)
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '7ef8bdeb-fd56-5eb9-a09b-ef15ce18dc49',
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
      FROM "qe_admin_data_2_01hpkty3hctk826tvx5tasga55"
     WHERE "FACILITY_LONG_NAME" IS NULL
        OR TRIM("FACILITY_LONG_NAME") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '7ef8bdeb-fd56-5eb9-a09b-ef15ce18dc49',
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
      FROM "qe_admin_data_2_01hpkty3hctk826tvx5tasga55"
     WHERE "ORGANIZATION_TYPE" IS NULL
        OR TRIM("ORGANIZATION_TYPE") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '7ef8bdeb-fd56-5eb9-a09b-ef15ce18dc49',
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
      FROM "qe_admin_data_2_01hpkty3hctk826tvx5tasga55"
     WHERE "ORGANIZATION_TYPE" NOT IN ('Hospital', 'DTC', 'SNF', 'SCN', 'CBO', 'OMH', 'OASAS', 'Practice', 'Article 36', 'Article 40', 'MCO')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '7ef8bdeb-fd56-5eb9-a09b-ef15ce18dc49',
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
      FROM "qe_admin_data_2_01hpkty3hctk826tvx5tasga55"
     WHERE "FACILITY ADDRESS1" IS NULL
        OR TRIM("FACILITY ADDRESS1") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '7ef8bdeb-fd56-5eb9-a09b-ef15ce18dc49',
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
      FROM "qe_admin_data_2_01hpkty3hctk826tvx5tasga55"
     WHERE "FACILITY ADDRESS1" IS NOT NULL
       AND "FACILITY ADDRESS1" IN (
          SELECT "FACILITY ADDRESS1"
            FROM "qe_admin_data_2_01hpkty3hctk826tvx5tasga55"
        GROUP BY "FACILITY ADDRESS1"
          HAVING COUNT(*) > 1)
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '7ef8bdeb-fd56-5eb9-a09b-ef15ce18dc49',
           'Unique Value Violation',
           issue_row,
           issue_column,
           invalid_value,
           'Duplicate value "' || invalid_value || '" found in ' || issue_column,
           'Ensure each value in column6 is unique'
      FROM unique_value;   
WITH pattern AS (
    SELECT 'FACILITY ADDRESS1' AS issue_column,
           "FACILITY ADDRESS1" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "qe_admin_data_2_01hpkty3hctk826tvx5tasga55"
     WHERE "FACILITY ADDRESS1" NOT SIMILAR TO '^[a-zA-Z0-9\s]+$'
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '7ef8bdeb-fd56-5eb9-a09b-ef15ce18dc49',
           'Pattern Mismatch',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' does not match the pattern ^[a-zA-Z0-9\s]+$',
           'Follow the pattern ^[a-zA-Z0-9\s]+$ in ' || issue_column
      FROM pattern; 
WITH unique_value AS (
    SELECT 'FACILITY ADDRESS2' AS issue_column,
           "FACILITY ADDRESS2" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "qe_admin_data_2_01hpkty3hctk826tvx5tasga55"
     WHERE "FACILITY ADDRESS2" IS NOT NULL
       AND "FACILITY ADDRESS2" IN (
          SELECT "FACILITY ADDRESS2"
            FROM "qe_admin_data_2_01hpkty3hctk826tvx5tasga55"
        GROUP BY "FACILITY ADDRESS2"
          HAVING COUNT(*) > 1)
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '7ef8bdeb-fd56-5eb9-a09b-ef15ce18dc49',
           'Unique Value Violation',
           issue_row,
           issue_column,
           invalid_value,
           'Duplicate value "' || invalid_value || '" found in ' || issue_column,
           'Ensure each value in column6 is unique'
      FROM unique_value;
WITH pattern AS (
    SELECT 'FACILITY ADDRESS2' AS issue_column,
           "FACILITY ADDRESS2" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "qe_admin_data_2_01hpkty3hctk826tvx5tasga55"
     WHERE "FACILITY ADDRESS2" NOT SIMILAR TO '^[a-zA-Z0-9\s]+$'
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '7ef8bdeb-fd56-5eb9-a09b-ef15ce18dc49',
           'Pattern Mismatch',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' does not match the pattern ^[a-zA-Z0-9\s]+$',
           'Follow the pattern ^[a-zA-Z0-9\s]+$ in ' || issue_column
      FROM pattern;    
WITH mandatory_value AS (
    SELECT 'FACILITY STATE' AS issue_column,
           "FACILITY STATE" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "qe_admin_data_2_01hpkty3hctk826tvx5tasga55"
     WHERE "FACILITY STATE" IS NULL
        OR TRIM("FACILITY STATE") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '7ef8bdeb-fd56-5eb9-a09b-ef15ce18dc49',
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
      FROM "qe_admin_data_2_01hpkty3hctk826tvx5tasga55"
     WHERE "FACILITY STATE" NOT IN ('NY', 'New York')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '7ef8bdeb-fd56-5eb9-a09b-ef15ce18dc49',
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
      FROM "qe_admin_data_2_01hpkty3hctk826tvx5tasga55"
     WHERE "FACILITY ZIP" IS NULL
        OR TRIM("FACILITY ZIP") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '7ef8bdeb-fd56-5eb9-a09b-ef15ce18dc49',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH pattern AS (
    SELECT 'FACILITY ZIP' AS issue_column,
           "FACILITY ZIP" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "qe_admin_data_2_01hpkty3hctk826tvx5tasga55"
     WHERE "FACILITY ZIP" NOT SIMILAR TO '^\d{5}(\d{4})?$'
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '7ef8bdeb-fd56-5eb9-a09b-ef15ce18dc49',
           'Pattern Mismatch',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' does not match the pattern ^\d{5}(\d{4})?$',
           'Follow the pattern ^\d{5}(\d{4})?$ in ' || issue_column
      FROM pattern;
WITH mandatory_value AS (
    SELECT 'VISIT_PART_2_FLAG' AS issue_column,
           "VISIT_PART_2_FLAG" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "qe_admin_data_2_01hpkty3hctk826tvx5tasga55"
     WHERE "VISIT_PART_2_FLAG" IS NULL
        OR TRIM("VISIT_PART_2_FLAG") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '7ef8bdeb-fd56-5eb9-a09b-ef15ce18dc49',
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
      FROM "qe_admin_data_2_01hpkty3hctk826tvx5tasga55"
     WHERE "VISIT_PART_2_FLAG" NOT IN ('Yes', 'No')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '7ef8bdeb-fd56-5eb9-a09b-ef15ce18dc49',
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
      FROM "qe_admin_data_2_01hpkty3hctk826tvx5tasga55"
     WHERE "VISIT_OMH_FLAG" IS NULL
        OR TRIM("VISIT_OMH_FLAG") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '7ef8bdeb-fd56-5eb9-a09b-ef15ce18dc49',
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
      FROM "qe_admin_data_2_01hpkty3hctk826tvx5tasga55"
     WHERE "VISIT_OMH_FLAG" NOT IN ('Yes', 'No')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '7ef8bdeb-fd56-5eb9-a09b-ef15ce18dc49',
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
      FROM "qe_admin_data_2_01hpkty3hctk826tvx5tasga55"
     WHERE "VISIT_OPWDD_FLAG" IS NULL
        OR TRIM("VISIT_OPWDD_FLAG") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '7ef8bdeb-fd56-5eb9-a09b-ef15ce18dc49',
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
      FROM "qe_admin_data_2_01hpkty3hctk826tvx5tasga55"
     WHERE "VISIT_OPWDD_FLAG" NOT IN ('Yes', 'No')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '7ef8bdeb-fd56-5eb9-a09b-ef15ce18dc49',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''Yes'', ''No'')',
           'Use only allowed values ''Yes'', ''No'' in ' || issue_column
      FROM allowed_values;
WITH pattern AS (
    SELECT 'FACILITY_LONG_NAME' AS issue_column,
           "FACILITY_LONG_NAME" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "qe_admin_data_2_01hpkty3hctk826tvx5tasga55"
     WHERE "FACILITY_LONG_NAME" NOT SIMILAR TO '^[a-zA-Z\s]+$'
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '7ef8bdeb-fd56-5eb9-a09b-ef15ce18dc49',
           'Pattern Mismatch',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' does not match the pattern ^[a-zA-Z\s]+$',
           'Follow the pattern ^[a-zA-Z\s]+$ in ' || issue_column
      FROM pattern;

INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('5a941253-b661-5282-a5e6-97cbfe5dfb32', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '7ef8bdeb-fd56-5eb9-a09b-ef15ce18dc49', 'ATTEMPT_CSV_ASSURANCE', 'ASSURED_CSV', NULL, 'QeAdminDataCsvFileIngestSource.assuranceSQL', (CURRENT_TIMESTAMP), NULL);
    
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('a8ec8b43-9e16-5eeb-9683-bc14288971f1', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '0e074bf2-f1fe-55d4-bd44-a88cbed79aeb', 'INGESTED_CSV', 'ATTEMPT_CSV_ASSURANCE', NULL, 'ScreeningCsvFileIngestSource.assuranceSQL', (CURRENT_TIMESTAMP), NULL);


WITH mandatory_value AS (
    SELECT 'PAT_MRN_ID' AS issue_column,
           "PAT_MRN_ID" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "screening_2_01hpkty3hctk826tvx5tasga55"
     WHERE "PAT_MRN_ID" IS NULL
        OR TRIM("PAT_MRN_ID") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '0e074bf2-f1fe-55d4-bd44-a88cbed79aeb',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH mandatory_value AS (
    SELECT 'FACILITY_ID' AS issue_column,
           "FACILITY_ID" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "screening_2_01hpkty3hctk826tvx5tasga55"
     WHERE "FACILITY_ID" IS NULL
        OR TRIM("FACILITY_ID") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '0e074bf2-f1fe-55d4-bd44-a88cbed79aeb',
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
      FROM "screening_2_01hpkty3hctk826tvx5tasga55"
     WHERE "SCREENING_CODE_SYSTEM_NAME" IS NULL
        OR TRIM("SCREENING_CODE_SYSTEM_NAME") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '0e074bf2-f1fe-55d4-bd44-a88cbed79aeb',
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
      FROM "screening_2_01hpkty3hctk826tvx5tasga55"
     WHERE "SCREENING_CODE_SYSTEM_NAME" NOT IN ('LN', 'LOINC')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '0e074bf2-f1fe-55d4-bd44-a88cbed79aeb',
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
      FROM "screening_2_01hpkty3hctk826tvx5tasga55"
     WHERE "SCREENING_CODE" IS NULL
        OR TRIM("SCREENING_CODE") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '0e074bf2-f1fe-55d4-bd44-a88cbed79aeb',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH allowed_values AS (
    SELECT 'SCREENING_CODE' AS issue_column,
           "SCREENING_CODE" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "screening_2_01hpkty3hctk826tvx5tasga55"
     WHERE "SCREENING_CODE" NOT IN ('96777-8', '97023-6')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '0e074bf2-f1fe-55d4-bd44-a88cbed79aeb',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''96777-8'', ''97023-6'')',
           'Use only allowed values ''96777-8'', ''97023-6'' in ' || issue_column
      FROM allowed_values;
WITH mandatory_value AS (
    SELECT 'RECORDED_TIME' AS issue_column,
           "RECORDED_TIME" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "screening_2_01hpkty3hctk826tvx5tasga55"
     WHERE "RECORDED_TIME" IS NULL
        OR TRIM("RECORDED_TIME") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '0e074bf2-f1fe-55d4-bd44-a88cbed79aeb',
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
      FROM "screening_2_01hpkty3hctk826tvx5tasga55"
     WHERE "RECORDED_TIME" IS NOT NULL
       AND TRY_CAST("RECORDED_TIME" AS TIMESTAMP) IS NULL
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '0e074bf2-f1fe-55d4-bd44-a88cbed79aeb',
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
      FROM "screening_2_01hpkty3hctk826tvx5tasga55"
     WHERE "QUESTION" IS NULL
        OR TRIM("QUESTION") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '0e074bf2-f1fe-55d4-bd44-a88cbed79aeb',
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
      FROM "screening_2_01hpkty3hctk826tvx5tasga55"
     WHERE "MEAS_VALUE" IS NULL
        OR TRIM("MEAS_VALUE") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '0e074bf2-f1fe-55d4-bd44-a88cbed79aeb',
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
      FROM "screening_2_01hpkty3hctk826tvx5tasga55"
     WHERE "QUESTION_CODE" IS NULL
        OR TRIM("QUESTION_CODE") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '0e074bf2-f1fe-55d4-bd44-a88cbed79aeb',
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
      FROM "screening_2_01hpkty3hctk826tvx5tasga55"
     WHERE "QUESTION_CODE_SYSTEM_NAME" IS NULL
        OR TRIM("QUESTION_CODE_SYSTEM_NAME") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '0e074bf2-f1fe-55d4-bd44-a88cbed79aeb',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH valid_encounter_class_in_all_rows AS (
    SELECT 'ENCOUNTER_CLASS_CODE' AS issue_column,
           sr."ENCOUNTER_CLASS_CODE" AS invalid_value,
           sr.src_file_row_number AS issue_row
      FROM screening_2_01hpkty3hctk826tvx5tasga55 sr
      LEFT JOIN encounter_class_reference ecr
      ON sr.ENCOUNTER_CLASS_CODE = ecr.Code         
     WHERE sr.ENCOUNTER_CLASS_CODE IS NOT NULL
      AND ecr.Code IS NULL
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '0e074bf2-f1fe-55d4-bd44-a88cbed79aeb',
           'Invalid Encounter Class',
           issue_row,
           issue_column,
           invalid_value,
           'Invalid Encounter Class "' || invalid_value || '" found in ' || issue_column,
           'Validate Encounter Class Code with encounter class reference data'
      FROM valid_encounter_class_in_all_rows;
WITH allowed_values AS (
    SELECT 'QUESTION_CODE_SYSTEM_NAME' AS issue_column,
           "QUESTION_CODE_SYSTEM_NAME" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "screening_2_01hpkty3hctk826tvx5tasga55"
     WHERE "QUESTION_CODE_SYSTEM_NAME" NOT IN ('LN','LOIN')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '0e074bf2-f1fe-55d4-bd44-a88cbed79aeb',
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
      FROM "screening_2_01hpkty3hctk826tvx5tasga55"
     WHERE "ANSWER_CODE" IS NULL
        OR TRIM("ANSWER_CODE") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '0e074bf2-f1fe-55d4-bd44-a88cbed79aeb',
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
      FROM "screening_2_01hpkty3hctk826tvx5tasga55"
     WHERE "ANSWER_CODE_SYSTEM_NAME" IS NULL
        OR TRIM("ANSWER_CODE_SYSTEM_NAME") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '0e074bf2-f1fe-55d4-bd44-a88cbed79aeb',
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
      FROM "screening_2_01hpkty3hctk826tvx5tasga55"
     WHERE "ANSWER_CODE_SYSTEM_NAME" NOT IN ('LN','LOIN')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '0e074bf2-f1fe-55d4-bd44-a88cbed79aeb',
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
      FROM "screening_2_01hpkty3hctk826tvx5tasga55"
     WHERE "SDOH_DOMAIN" IS NULL
        OR TRIM("SDOH_DOMAIN") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '0e074bf2-f1fe-55d4-bd44-a88cbed79aeb',
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
      FROM "screening_2_01hpkty3hctk826tvx5tasga55"
     WHERE "POTENTIAL_NEED_INDICATED" IS NULL
        OR TRIM("POTENTIAL_NEED_INDICATED") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '0e074bf2-f1fe-55d4-bd44-a88cbed79aeb',
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
      FROM "screening_2_01hpkty3hctk826tvx5tasga55"
     WHERE "POTENTIAL_NEED_INDICATED" NOT IN ('Yes','No','NA')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '0e074bf2-f1fe-55d4-bd44-a88cbed79aeb',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''Yes'',''No'',''NA'')',
           'Use only allowed values ''Yes'',''No'',''NA'' in ' || issue_column
      FROM allowed_values;
WITH allowed_values AS (
    SELECT 'ASSISTANCE_REQUESTED' AS issue_column,
           "ASSISTANCE_REQUESTED" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "screening_2_01hpkty3hctk826tvx5tasga55"
     WHERE "ASSISTANCE_REQUESTED" NOT IN ('Yes','No','NA')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '0e074bf2-f1fe-55d4-bd44-a88cbed79aeb',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''Yes'',''No'',''NA'')',
           'Use only allowed values ''Yes'',''No'',''NA'' in ' || issue_column
      FROM allowed_values;
    

INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('f58ee169-7478-59ca-9e36-aa384ddb501c', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '0e074bf2-f1fe-55d4-bd44-a88cbed79aeb', 'ATTEMPT_CSV_ASSURANCE', 'ASSURED_CSV', NULL, 'ScreeningCsvFileIngestSource.assuranceSQL', (CURRENT_TIMESTAMP), NULL);
    
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('35c62034-5b20-5891-8d38-3e9b051dec6e', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '80af4eff-d697-565b-9e3f-a587e322b1da', 'INGESTED_CSV', 'ATTEMPT_CSV_ASSURANCE', NULL, 'AdminDemographicCsvFileIngestSource.assuranceSQL', (CURRENT_TIMESTAMP), NULL);

WITH mandatory_value AS (
    SELECT 'FIRST_NAME' AS issue_column,
           "FIRST_NAME" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "demographic_data_2_01hpkty3hctk826tvx5tasga55"
     WHERE "FIRST_NAME" IS NULL
        OR TRIM("FIRST_NAME") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '80af4eff-d697-565b-9e3f-a587e322b1da',
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
      FROM "demographic_data_2_01hpkty3hctk826tvx5tasga55"
     WHERE "FIRST_NAME" NOT SIMILAR TO '^[A-Za-z]+$'
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '80af4eff-d697-565b-9e3f-a587e322b1da',
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
      FROM "demographic_data_2_01hpkty3hctk826tvx5tasga55"
     WHERE "MIDDLE_NAME" NOT SIMILAR TO '^[A-Za-z]+$'
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '80af4eff-d697-565b-9e3f-a587e322b1da',
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
      FROM "demographic_data_2_01hpkty3hctk826tvx5tasga55"
     WHERE "LAST_NAME" IS NULL
        OR TRIM("LAST_NAME") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '80af4eff-d697-565b-9e3f-a587e322b1da',
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
      FROM "demographic_data_2_01hpkty3hctk826tvx5tasga55"
     WHERE "LAST_NAME" NOT SIMILAR TO '^[A-Za-z]+$'
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '80af4eff-d697-565b-9e3f-a587e322b1da',
           'Pattern Mismatch',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' does not match the pattern ^[A-Za-z]+$',
           'Follow the pattern ^[A-Za-z]+$ in ' || issue_column
      FROM pattern; 
WITH mandatory_value AS (
    SELECT 'ADMINISTRATIVE_SEX_CODE' AS issue_column,
           "ADMINISTRATIVE_SEX_CODE" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "demographic_data_2_01hpkty3hctk826tvx5tasga55"
     WHERE "ADMINISTRATIVE_SEX_CODE" IS NULL
        OR TRIM("ADMINISTRATIVE_SEX_CODE") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '80af4eff-d697-565b-9e3f-a587e322b1da',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value; 
WITH allowed_values AS (
    SELECT 'ADMINISTRATIVE_SEX_CODE' AS issue_column,
           "ADMINISTRATIVE_SEX_CODE" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "demographic_data_2_01hpkty3hctk826tvx5tasga55"
     WHERE "ADMINISTRATIVE_SEX_CODE" NOT IN ('M', 'F', 'X (UN)', 'UNK', 'OTH. ASKU')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '80af4eff-d697-565b-9e3f-a587e322b1da',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''M'', ''F'', ''X (UN)'', ''UNK'', ''OTH. ASKU'')',
           'Use only allowed values ''M'', ''F'', ''X (UN)'', ''UNK'', ''OTH. ASKU'' in ' || issue_column
      FROM allowed_values;   
WITH allowed_values AS (
    SELECT 'SEX_AT_BIRTH_CODE' AS issue_column,
           "SEX_AT_BIRTH_CODE" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "demographic_data_2_01hpkty3hctk826tvx5tasga55"
     WHERE "SEX_AT_BIRTH_CODE" NOT IN ('M', 'F', 'ASKU', 'OTH', 'UNK')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '80af4eff-d697-565b-9e3f-a587e322b1da',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''M'', ''F'', ''ASKU'', ''OTH'', ''UNK'')',
           'Use only allowed values ''M'', ''F'', ''ASKU'', ''OTH'', ''UNK'' in ' || issue_column
      FROM allowed_values; 
WITH allowed_values AS (
    SELECT 'SEX_AT_BIRTH_CODE_DESCRIPTION' AS issue_column,
           "SEX_AT_BIRTH_CODE_DESCRIPTION" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "demographic_data_2_01hpkty3hctk826tvx5tasga55"
     WHERE "SEX_AT_BIRTH_CODE_DESCRIPTION" NOT IN ('Male', 'Female', 'Asked but Unknown', 'Other', 'Unknown')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '80af4eff-d697-565b-9e3f-a587e322b1da',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''Male'', ''Female'', ''Asked but Unknown'', ''Other'', ''Unknown'')',
           'Use only allowed values ''Male'', ''Female'', ''Asked but Unknown'', ''Other'', ''Unknown'' in ' || issue_column
      FROM allowed_values; 
WITH mandatory_value AS (
    SELECT 'PAT_BIRTH_DATE' AS issue_column,
           "PAT_BIRTH_DATE" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "demographic_data_2_01hpkty3hctk826tvx5tasga55"
     WHERE "PAT_BIRTH_DATE" IS NULL
        OR TRIM("PAT_BIRTH_DATE") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '80af4eff-d697-565b-9e3f-a587e322b1da',
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
      FROM "demographic_data_2_01hpkty3hctk826tvx5tasga55"
     WHERE "PAT_BIRTH_DATE" IS NOT NULL
       AND TRY_CAST("PAT_BIRTH_DATE" AS DATE) IS NULL
       AND EXTRACT(YEAR FROM TRY_CAST("PAT_BIRTH_DATE" AS TIMESTAMP)) < 1915
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '80af4eff-d697-565b-9e3f-a587e322b1da',
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
      FROM "demographic_data_2_01hpkty3hctk826tvx5tasga55"
     WHERE "CITY" IS NULL
        OR TRIM("CITY") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '80af4eff-d697-565b-9e3f-a587e322b1da',
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
      FROM "demographic_data_2_01hpkty3hctk826tvx5tasga55"
     WHERE "STATE" IS NULL
        OR TRIM("STATE") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '80af4eff-d697-565b-9e3f-a587e322b1da',
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
      FROM "demographic_data_2_01hpkty3hctk826tvx5tasga55"
     WHERE "STATE" NOT IN ('NY', 'New York')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '80af4eff-d697-565b-9e3f-a587e322b1da',
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
      FROM "demographic_data_2_01hpkty3hctk826tvx5tasga55"
     WHERE "ZIP" IS NULL
        OR TRIM("ZIP") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '80af4eff-d697-565b-9e3f-a587e322b1da',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH pattern AS (
    SELECT 'ZIP' AS issue_column,
           "ZIP" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "demographic_data_2_01hpkty3hctk826tvx5tasga55"
     WHERE "ZIP" NOT SIMILAR TO '^\d{5}(\d{4})?$'
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '80af4eff-d697-565b-9e3f-a587e322b1da',
           'Pattern Mismatch',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' does not match the pattern ^\d{5}(\d{4})?$',
           'Follow the pattern ^\d{5}(\d{4})?$ in ' || issue_column
      FROM pattern;
WITH pattern AS (
    SELECT 'ADDRESS1' AS issue_column,
           "ADDRESS1" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "demographic_data_2_01hpkty3hctk826tvx5tasga55"
     WHERE "ADDRESS1" NOT SIMILAR TO '^[a-zA-Z0-9\s]+$'
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '80af4eff-d697-565b-9e3f-a587e322b1da',
           'Pattern Mismatch',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' does not match the pattern ^[a-zA-Z0-9\s]+$',
           'Follow the pattern ^[a-zA-Z0-9\s]+$ in ' || issue_column
      FROM pattern;
WITH allowed_values AS (
    SELECT 'GENDER_IDENTITY_CODE' AS issue_column,
           "GENDER_IDENTITY_CODE" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "demographic_data_2_01hpkty3hctk826tvx5tasga55"
     WHERE "GENDER_IDENTITY_CODE" NOT IN ('407377005','446141000124107','446151000124109','446131000124102','407376001','ASKU','OTH','UNK')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '80af4eff-d697-565b-9e3f-a587e322b1da',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''407377005'',''446141000124107'',''446151000124109'',''446131000124102'',''407376001'',''ASKU'',''OTH'',''UNK'')',
           'Use only allowed values ''407377005'',''446141000124107'',''446151000124109'',''446131000124102'',''407376001'',''ASKU'',''OTH'',''UNK'' in ' || issue_column
      FROM allowed_values;
WITH allowed_values AS (
    SELECT 'ADMINISTRATIVE_SEX _CODE_DESCRIPTION' AS issue_column,
           "ADMINISTRATIVE_SEX _CODE_DESCRIPTION" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "demographic_data_2_01hpkty3hctk826tvx5tasga55"
     WHERE "ADMINISTRATIVE_SEX _CODE_DESCRIPTION" NOT IN ('Male','Female','Asked but Unknown','Other','Unknown')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '80af4eff-d697-565b-9e3f-a587e322b1da',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''Male'',''Female'',''Asked but Unknown'',''Other'',''Unknown'')',
           'Use only allowed values ''Male'',''Female'',''Asked but Unknown'',''Other'',''Unknown'' in ' || issue_column
      FROM allowed_values;
WITH allowed_values AS (
    SELECT 'GENDER_IDENTITY_CODE_SYSTEM_NAME' AS issue_column,
           "GENDER_IDENTITY_CODE_SYSTEM_NAME" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "demographic_data_2_01hpkty3hctk826tvx5tasga55"
     WHERE "GENDER_IDENTITY_CODE_SYSTEM_NAME" NOT IN ('SNOMED-CT','SNOMED')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '80af4eff-d697-565b-9e3f-a587e322b1da',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''SNOMED-CT'',''SNOMED'')',
           'Use only allowed values ''SNOMED-CT'',''SNOMED'' in ' || issue_column
      FROM allowed_values;
WITH allowed_values AS (
    SELECT 'SEXUAL_ORIENTATION_CODE' AS issue_column,
           "SEXUAL_ORIENTATION_CODE" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "demographic_data_2_01hpkty3hctk826tvx5tasga55"
     WHERE "SEXUAL_ORIENTATION_CODE" NOT IN ('42035005','20430005','38628009','OTH','UNK')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '80af4eff-d697-565b-9e3f-a587e322b1da',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''42035005'',''20430005'',''38628009'',''OTH'',''UNK'')',
           'Use only allowed values ''42035005'',''20430005'',''38628009'',''OTH'',''UNK'' in ' || issue_column
      FROM allowed_values;
WITH allowed_values AS (
    SELECT 'SEXUAL_ORIENTATION_CODE_SYSTEM_NAME' AS issue_column,
           "SEXUAL_ORIENTATION_CODE_SYSTEM_NAME" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "demographic_data_2_01hpkty3hctk826tvx5tasga55"
     WHERE "SEXUAL_ORIENTATION_CODE_SYSTEM_NAME" NOT IN ('SNOMED-CT','SNOMED')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '80af4eff-d697-565b-9e3f-a587e322b1da',
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
      FROM "demographic_data_2_01hpkty3hctk826tvx5tasga55"
     WHERE "SEXUAL_ORIENTATION_DESCRIPTION" NOT IN ('Bisexual','Straight','Gay or lesbian','other','unknown')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '80af4eff-d697-565b-9e3f-a587e322b1da',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''Bisexual'',''Straight'',''Gay or lesbian'',''other'',''unknown'')',
           'Use only allowed values ''Bisexual'',''Straight'',''Gay or lesbian'',''other'',''unknown'' in ' || issue_column
      FROM allowed_values;
WITH allowed_values AS (
    SELECT 'RACE_CODE_SYSTEM_NAME' AS issue_column,
           "RACE_CODE_SYSTEM_NAME" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "demographic_data_2_01hpkty3hctk826tvx5tasga55"
     WHERE "RACE_CODE_SYSTEM_NAME" NOT IN ('CDC','CDCRE')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '80af4eff-d697-565b-9e3f-a587e322b1da',
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
      FROM "demographic_data_2_01hpkty3hctk826tvx5tasga55"
     WHERE "ETHNICITY_CODE_SYSTEM_NAME" NOT IN ('CDC','CDCRE')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '80af4eff-d697-565b-9e3f-a587e322b1da',
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
      FROM "demographic_data_2_01hpkty3hctk826tvx5tasga55"
     WHERE "MPI_ID" IS NULL
        OR TRIM("MPI_ID") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '80af4eff-d697-565b-9e3f-a587e322b1da',
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
      FROM "demographic_data_2_01hpkty3hctk826tvx5tasga55"
     WHERE "PAT_MRN_ID" IS NULL
        OR TRIM("PAT_MRN_ID") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '80af4eff-d697-565b-9e3f-a587e322b1da',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH mandatory_value AS (
    SELECT 'FACILITY_ID' AS issue_column,
           "FACILITY_ID" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "demographic_data_2_01hpkty3hctk826tvx5tasga55"
     WHERE "FACILITY_ID" IS NULL
        OR TRIM("FACILITY_ID") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '80af4eff-d697-565b-9e3f-a587e322b1da',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;   
WITH pattern AS (
    SELECT 'MEDICAID_CIN' AS issue_column,
           "MEDICAID_CIN" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "demographic_data_2_01hpkty3hctk826tvx5tasga55"
     WHERE "MEDICAID_CIN" NOT SIMILAR TO '^[A-Za-z]{2}\d{5}[A-Za-z]$'
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '80af4eff-d697-565b-9e3f-a587e322b1da',
           'Pattern Mismatch',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' does not match the pattern ^[A-Za-z]{2}\d{5}[A-Za-z]$',
           'Follow the pattern ^[A-Za-z]{2}\d{5}[A-Za-z]$ in ' || issue_column
      FROM pattern; 
WITH mandatory_value AS (
    SELECT 'CONSENT' AS issue_column,
           "CONSENT" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "demographic_data_2_01hpkty3hctk826tvx5tasga55"
     WHERE "CONSENT" IS NULL
        OR TRIM("CONSENT") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '80af4eff-d697-565b-9e3f-a587e322b1da',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value; 
WITH allowed_values AS (
    SELECT 'CONSENT' AS issue_column,
           "CONSENT" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "demographic_data_2_01hpkty3hctk826tvx5tasga55"
     WHERE "CONSENT" NOT IN ('Yes','No','Y','N','Unknown')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '80af4eff-d697-565b-9e3f-a587e322b1da',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''Yes'',''No'',''Y'',''N'',''Unknown'')',
           'Use only allowed values ''Yes'',''No'',''Y'',''N'',''Unknown'' in ' || issue_column
      FROM allowed_values;

INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('3cab2329-2aae-5475-9792-04e14e862f1e', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '80af4eff-d697-565b-9e3f-a587e322b1da', 'ATTEMPT_CSV_ASSURANCE', 'ASSURED_CSV', NULL, 'AdminDemographicCsvFileIngestSource.assuranceSQL', (CURRENT_TIMESTAMP), NULL);
    
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('aa8b8d1a-c8cc-5a9b-b5aa-34a6fc85e11a', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '5b77d127-e62a-50a9-acee-bea63ff64dd5', 'INGESTED_EXCEL_WORKBOOK_SHEET', 'ATTEMPT_EXCEL_WORKBOOK_SHEET_ASSURANCE', NULL, 'AdminDemographicExcelSheetIngestSource.assuranceSQL', (CURRENT_TIMESTAMP), NULL);

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
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '5b77d127-e62a-50a9-acee-bea63ff64dd5',
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
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '5b77d127-e62a-50a9-acee-bea63ff64dd5',
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
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '5b77d127-e62a-50a9-acee-bea63ff64dd5',
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
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '5b77d127-e62a-50a9-acee-bea63ff64dd5',
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
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '5b77d127-e62a-50a9-acee-bea63ff64dd5',
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
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '5b77d127-e62a-50a9-acee-bea63ff64dd5',
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
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '5b77d127-e62a-50a9-acee-bea63ff64dd5',
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
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '5b77d127-e62a-50a9-acee-bea63ff64dd5',
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
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '5b77d127-e62a-50a9-acee-bea63ff64dd5',
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
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '5b77d127-e62a-50a9-acee-bea63ff64dd5',
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
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '5b77d127-e62a-50a9-acee-bea63ff64dd5',
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
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '5b77d127-e62a-50a9-acee-bea63ff64dd5',
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
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '5b77d127-e62a-50a9-acee-bea63ff64dd5',
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
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '5b77d127-e62a-50a9-acee-bea63ff64dd5',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH pattern AS (
    SELECT 'ZIP' AS issue_column,
           "ZIP" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_admin_demographic"
     WHERE "ZIP" NOT SIMILAR TO '^\d{5}(\d{4})?$'
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '5b77d127-e62a-50a9-acee-bea63ff64dd5',
           'Pattern Mismatch',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' does not match the pattern ^\d{5}(\d{4})?$',
           'Follow the pattern ^\d{5}(\d{4})?$ in ' || issue_column
      FROM pattern;
WITH pattern AS (
    SELECT 'ADDRESS1' AS issue_column,
           "ADDRESS1" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_admin_demographic"
     WHERE "ADDRESS1" NOT SIMILAR TO '^[a-zA-Z0-9\s]+$'
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '5b77d127-e62a-50a9-acee-bea63ff64dd5',
           'Pattern Mismatch',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' does not match the pattern ^[a-zA-Z0-9\s]+$',
           'Follow the pattern ^[a-zA-Z0-9\s]+$ in ' || issue_column
      FROM pattern;
WITH allowed_values AS (
    SELECT 'GENDER_IDENTITY_CODE' AS issue_column,
           "GENDER_IDENTITY_CODE" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_admin_demographic"
     WHERE "GENDER_IDENTITY_CODE" NOT IN ('407377005','446141000124107','446151000124109','446131000124102','407376001','ASKU','OTH','UNK')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '5b77d127-e62a-50a9-acee-bea63ff64dd5',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''407377005'',''446141000124107'',''446151000124109'',''446131000124102'',''407376001'',''ASKU'',''OTH'',''UNK'')',
           'Use only allowed values ''407377005'',''446141000124107'',''446151000124109'',''446131000124102'',''407376001'',''ASKU'',''OTH'',''UNK'' in ' || issue_column
      FROM allowed_values;
WITH allowed_values AS (
    SELECT 'GENDER_IDENTITY_DESCRIPTION' AS issue_column,
           "GENDER_IDENTITY_DESCRIPTION" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_admin_demographic"
     WHERE "GENDER_IDENTITY_DESCRIPTION" NOT IN ('Female-to-Male (FTM)','Transgender Male','Trans Man','Female','Male','Genderqueer','Male-to-Female (MTF)', 'Transgender Female','Trans Woman','Asked but unknown','Other','Unknown')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '5b77d127-e62a-50a9-acee-bea63ff64dd5',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''Female-to-Male (FTM)'',''Transgender Male'',''Trans Man'',''Female'',''Male'',''Genderqueer'',''Male-to-Female (MTF)'', ''Transgender Female'',''Trans Woman'',''Asked but unknown'',''Other'',''Unknown'')',
           'Use only allowed values ''Female-to-Male (FTM)'',''Transgender Male'',''Trans Man'',''Female'',''Male'',''Genderqueer'',''Male-to-Female (MTF)'', ''Transgender Female'',''Trans Woman'',''Asked but unknown'',''Other'',''Unknown'' in ' || issue_column
      FROM allowed_values;
WITH allowed_values AS (
    SELECT 'GENDER_IDENTITY_CODE_SYSTEM_NAME' AS issue_column,
           "GENDER_IDENTITY_CODE_SYSTEM_NAME" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_admin_demographic"
     WHERE "GENDER_IDENTITY_CODE_SYSTEM_NAME" NOT IN ('SNOMED-CT','SNOMED')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '5b77d127-e62a-50a9-acee-bea63ff64dd5',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''SNOMED-CT'',''SNOMED'')',
           'Use only allowed values ''SNOMED-CT'',''SNOMED'' in ' || issue_column
      FROM allowed_values;
WITH allowed_values AS (
    SELECT 'SEXUAL_ORIENTATION_CODE' AS issue_column,
           "SEXUAL_ORIENTATION_CODE" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_admin_demographic"
     WHERE "SEXUAL_ORIENTATION_CODE" NOT IN ('42035005','20430005','38628009','OTH','UNK')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '5b77d127-e62a-50a9-acee-bea63ff64dd5',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''42035005'',''20430005'',''38628009'',''OTH'',''UNK'')',
           'Use only allowed values ''42035005'',''20430005'',''38628009'',''OTH'',''UNK'' in ' || issue_column
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
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '5b77d127-e62a-50a9-acee-bea63ff64dd5',
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
     WHERE "SEXUAL_ORIENTATION_DESCRIPTION" NOT IN ('Bisexual','Straight','Gay or lesbian','other','unknown')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '5b77d127-e62a-50a9-acee-bea63ff64dd5',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''Bisexual'',''Straight'',''Gay or lesbian'',''other'',''unknown'')',
           'Use only allowed values ''Bisexual'',''Straight'',''Gay or lesbian'',''other'',''unknown'' in ' || issue_column
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
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '5b77d127-e62a-50a9-acee-bea63ff64dd5',
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
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '5b77d127-e62a-50a9-acee-bea63ff64dd5',
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
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '5b77d127-e62a-50a9-acee-bea63ff64dd5',
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
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '5b77d127-e62a-50a9-acee-bea63ff64dd5',
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
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '5b77d127-e62a-50a9-acee-bea63ff64dd5',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;   
WITH pattern AS (
    SELECT 'MEDICAID_CIN' AS issue_column,
           "MEDICAID_CIN" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_admin_demographic"
     WHERE "MEDICAID_CIN" NOT SIMILAR TO '^[A-Za-z]{2}\d{5}[A-Za-z]$'
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '5b77d127-e62a-50a9-acee-bea63ff64dd5',
           'Pattern Mismatch',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' does not match the pattern ^[A-Za-z]{2}\d{5}[A-Za-z]$',
           'Follow the pattern ^[A-Za-z]{2}\d{5}[A-Za-z]$ in ' || issue_column
      FROM pattern; 
WITH mandatory_value AS (
    SELECT 'CONSENT ' AS issue_column,
           "CONSENT " AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_admin_demographic"
     WHERE "CONSENT " IS NULL
        OR TRIM("CONSENT ") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '5b77d127-e62a-50a9-acee-bea63ff64dd5',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value; 
WITH allowed_values AS (
    SELECT 'CONSENT ' AS issue_column,
           "CONSENT " AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_admin_demographic"
     WHERE "CONSENT " NOT IN ('Yes', 'No')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '5b77d127-e62a-50a9-acee-bea63ff64dd5',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''Yes'', ''No'')',
           'Use only allowed values ''Yes'', ''No'' in ' || issue_column
      FROM allowed_values;
    
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('b63bd83d-959a-5a5f-8d60-08b84bf16c90', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '5b77d127-e62a-50a9-acee-bea63ff64dd5', 'ATTEMPT_EXCEL_WORKBOOK_SHEET_ASSURANCE', 'ASSURED_EXCEL_WORKBOOK_SHEET', NULL, 'AdminDemographicExcelSheetIngestSource.assuranceSQL', (CURRENT_TIMESTAMP), NULL);
    
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('8278fd0f-7116-55bd-8d7a-0a30681b0d2f', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '21d7e4ec-32e3-5e20-9029-28fdd6c5fa66', 'INGESTED_EXCEL_WORKBOOK_SHEET', 'ATTEMPT_EXCEL_WORKBOOK_SHEET_ASSURANCE', NULL, 'ScreeningExcelSheetIngestSource.assuranceSQL', (CURRENT_TIMESTAMP), NULL);

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
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '21d7e4ec-32e3-5e20-9029-28fdd6c5fa66',
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
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '21d7e4ec-32e3-5e20-9029-28fdd6c5fa66',
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
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '21d7e4ec-32e3-5e20-9029-28fdd6c5fa66',
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
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '21d7e4ec-32e3-5e20-9029-28fdd6c5fa66',
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
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '21d7e4ec-32e3-5e20-9029-28fdd6c5fa66',
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
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '21d7e4ec-32e3-5e20-9029-28fdd6c5fa66',
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
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '21d7e4ec-32e3-5e20-9029-28fdd6c5fa66',
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
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '21d7e4ec-32e3-5e20-9029-28fdd6c5fa66',
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
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '21d7e4ec-32e3-5e20-9029-28fdd6c5fa66',
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
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '21d7e4ec-32e3-5e20-9029-28fdd6c5fa66',
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
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '21d7e4ec-32e3-5e20-9029-28fdd6c5fa66',
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
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '21d7e4ec-32e3-5e20-9029-28fdd6c5fa66',
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
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '21d7e4ec-32e3-5e20-9029-28fdd6c5fa66',
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
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '21d7e4ec-32e3-5e20-9029-28fdd6c5fa66',
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
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '21d7e4ec-32e3-5e20-9029-28fdd6c5fa66',
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
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '21d7e4ec-32e3-5e20-9029-28fdd6c5fa66',
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
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '21d7e4ec-32e3-5e20-9029-28fdd6c5fa66',
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
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '21d7e4ec-32e3-5e20-9029-28fdd6c5fa66',
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
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '21d7e4ec-32e3-5e20-9029-28fdd6c5fa66',
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
     WHERE "POTENTIAL_NEED_INDICATED" NOT IN ('Yes','No','NA')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '21d7e4ec-32e3-5e20-9029-28fdd6c5fa66',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''Yes'',''No'',''NA'')',
           'Use only allowed values ''Yes'',''No'',''NA'' in ' || issue_column
      FROM allowed_values;
WITH allowed_values AS (
    SELECT 'ASSISTANCE_REQUESTED' AS issue_column,
           "ASSISTANCE_REQUESTED" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_screening"
     WHERE "ASSISTANCE_REQUESTED" NOT IN ('Yes','No','NA')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '21d7e4ec-32e3-5e20-9029-28fdd6c5fa66',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''Yes'',''No'',''NA'')',
           'Use only allowed values ''Yes'',''No'',''NA'' in ' || issue_column
      FROM allowed_values;
WITH valid_screening_questions_in_all_rows AS (
    SELECT 'QUESTION_CODE' AS issue_column,
           sr."QUESTION_CODE" AS invalid_value,
           sr.src_file_row_number AS issue_row
      FROM ahc_hrsn_2024_01_25_valid_screening sr
      LEFT JOIN ahc_hrsn_2024_01_25_valid_question_reference qr
      ON sr.QUESTION_CODE = qr.QUESTION_CODE AND sr.SCREENING_CODE = qr.SCREENING_CODE            
     WHERE sr.QUESTION_CODE IS NOT NULL
      AND qr.QUESTION_CODE IS NULL
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '21d7e4ec-32e3-5e20-9029-28fdd6c5fa66',
           'Invalid Screening Question',
           issue_row,
           issue_column,
           invalid_value,
           'Invalid Screening Question "' || invalid_value || '" found in ' || issue_column,
           'Validate screening questions with question reference data'
      FROM valid_screening_questions_in_all_rows;
    
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('47d97ff4-908a-50f7-a2e2-443e2dad7056', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '21d7e4ec-32e3-5e20-9029-28fdd6c5fa66', 'ATTEMPT_EXCEL_WORKBOOK_SHEET_ASSURANCE', 'ASSURED_EXCEL_WORKBOOK_SHEET', NULL, 'ScreeningExcelSheetIngestSource.assuranceSQL', (CURRENT_TIMESTAMP), NULL);
    
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('c420c3ba-ddbc-582b-9cdf-361497beb034', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'f6d4aff4-4b71-5662-8f57-00ee247dc57c', 'INGESTED_EXCEL_WORKBOOK_SHEET', 'ATTEMPT_EXCEL_WORKBOOK_SHEET_ASSURANCE', NULL, 'QeAdminDataExcelSheetIngestSource.assuranceSQL', (CURRENT_TIMESTAMP), NULL);

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
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           'f6d4aff4-4b71-5662-8f57-00ee247dc57c',
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
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           'f6d4aff4-4b71-5662-8f57-00ee247dc57c',
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
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           'f6d4aff4-4b71-5662-8f57-00ee247dc57c',
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
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           'f6d4aff4-4b71-5662-8f57-00ee247dc57c',
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
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           'f6d4aff4-4b71-5662-8f57-00ee247dc57c',
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
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           'f6d4aff4-4b71-5662-8f57-00ee247dc57c',
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
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           'f6d4aff4-4b71-5662-8f57-00ee247dc57c',
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
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           'f6d4aff4-4b71-5662-8f57-00ee247dc57c',
           'Unique Value Violation',
           issue_row,
           issue_column,
           invalid_value,
           'Duplicate value "' || invalid_value || '" found in ' || issue_column,
           'Ensure each value in column6 is unique'
      FROM unique_value;   
WITH pattern AS (
    SELECT 'FACILITY ADDRESS1' AS issue_column,
           "FACILITY ADDRESS1" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_q_e_admin_data"
     WHERE "FACILITY ADDRESS1" NOT SIMILAR TO '^[a-zA-Z0-9\s]+$'
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           'f6d4aff4-4b71-5662-8f57-00ee247dc57c',
           'Pattern Mismatch',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' does not match the pattern ^[a-zA-Z0-9\s]+$',
           'Follow the pattern ^[a-zA-Z0-9\s]+$ in ' || issue_column
      FROM pattern; 
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
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           'f6d4aff4-4b71-5662-8f57-00ee247dc57c',
           'Unique Value Violation',
           issue_row,
           issue_column,
           invalid_value,
           'Duplicate value "' || invalid_value || '" found in ' || issue_column,
           'Ensure each value in column6 is unique'
      FROM unique_value;
WITH pattern AS (
    SELECT 'FACILITY ADDRESS2' AS issue_column,
           "FACILITY ADDRESS2" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_q_e_admin_data"
     WHERE "FACILITY ADDRESS2" NOT SIMILAR TO '^[a-zA-Z0-9\s]+$'
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           'f6d4aff4-4b71-5662-8f57-00ee247dc57c',
           'Pattern Mismatch',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' does not match the pattern ^[a-zA-Z0-9\s]+$',
           'Follow the pattern ^[a-zA-Z0-9\s]+$ in ' || issue_column
      FROM pattern;    
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
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           'f6d4aff4-4b71-5662-8f57-00ee247dc57c',
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
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           'f6d4aff4-4b71-5662-8f57-00ee247dc57c',
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
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           'f6d4aff4-4b71-5662-8f57-00ee247dc57c',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH pattern AS (
    SELECT 'FACILITY ZIP' AS issue_column,
           "FACILITY ZIP" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_q_e_admin_data"
     WHERE "FACILITY ZIP" NOT SIMILAR TO '^\d{5}(\d{4})?$'
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           'f6d4aff4-4b71-5662-8f57-00ee247dc57c',
           'Pattern Mismatch',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' does not match the pattern ^\d{5}(\d{4})?$',
           'Follow the pattern ^\d{5}(\d{4})?$ in ' || issue_column
      FROM pattern;
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
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           'f6d4aff4-4b71-5662-8f57-00ee247dc57c',
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
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           'f6d4aff4-4b71-5662-8f57-00ee247dc57c',
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
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           'f6d4aff4-4b71-5662-8f57-00ee247dc57c',
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
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           'f6d4aff4-4b71-5662-8f57-00ee247dc57c',
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
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           'f6d4aff4-4b71-5662-8f57-00ee247dc57c',
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
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           'f6d4aff4-4b71-5662-8f57-00ee247dc57c',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''Yes'', ''No'')',
           'Use only allowed values ''Yes'', ''No'' in ' || issue_column
      FROM allowed_values;
WITH pattern AS (
    SELECT 'FACILITY_LONG_NAME' AS issue_column,
           "FACILITY_LONG_NAME" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "ahc_hrsn_2024_01_25_valid_q_e_admin_data"
     WHERE "FACILITY_LONG_NAME" NOT SIMILAR TO '^[a-zA-Z\s]+$'
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           'f6d4aff4-4b71-5662-8f57-00ee247dc57c',
           'Pattern Mismatch',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' does not match the pattern ^[a-zA-Z\s]+$',
           'Follow the pattern ^[a-zA-Z\s]+$ in ' || issue_column
      FROM pattern;
    
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('90a0010e-213e-58c3-9302-5e7310006b95', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'f6d4aff4-4b71-5662-8f57-00ee247dc57c', 'ATTEMPT_EXCEL_WORKBOOK_SHEET_ASSURANCE', 'ASSURED_EXCEL_WORKBOOK_SHEET', NULL, 'QeAdminDataExcelSheetIngestSource.assuranceSQL', (CURRENT_TIMESTAMP), NULL);
    
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('97c2cca2-92f5-5937-97e6-d84beeb4018e', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '657d6337-8d24-5b67-b139-87db6a228264', 'INGESTED_EXCEL_WORKBOOK_SHEET', 'ATTEMPT_EXCEL_WORKBOOK_SHEET_ASSURANCE', NULL, 'QuestionReferenceExcelSheetIngestSource.assuranceSQL', (CURRENT_TIMESTAMP), NULL);
                
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('f626602e-8be5-5e8c-824c-bdde91b22817', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '657d6337-8d24-5b67-b139-87db6a228264', 'ATTEMPT_EXCEL_WORKBOOK_SHEET_ASSURANCE', 'ASSURED_EXCEL_WORKBOOK_SHEET', NULL, 'QuestionReferenceExcelSheetIngestSource.assuranceSQL', (CURRENT_TIMESTAMP), NULL);
    
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('442b5e69-76fb-5da8-ae00-b79ea50cbedb', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'e2816d61-4406-5073-ac60-f129a107d938', 'INGESTED_EXCEL_WORKBOOK_SHEET', 'ATTEMPT_EXCEL_WORKBOOK_SHEET_ASSURANCE', NULL, 'AnswerReferenceExcelSheetIngestSource.assuranceSQL', (CURRENT_TIMESTAMP), NULL);
                
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('398104b8-02dc-509b-998a-0b66b5a912e1', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'e2816d61-4406-5073-ac60-f129a107d938', 'ATTEMPT_EXCEL_WORKBOOK_SHEET_ASSURANCE', 'ASSURED_EXCEL_WORKBOOK_SHEET', NULL, 'AnswerReferenceExcelSheetIngestSource.assuranceSQL', (CURRENT_TIMESTAMP), NULL);
    
```
No STDOUT emitted by `ensureContent` (status: `0`).

No STDERR emitted by `ensureContent`.

    

## emitResources

```sql
-- preambleSQL
SET autoinstall_known_extensions=true;
SET autoload_known_extensions=true;
-- end preambleSQL
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('05e8feaa-0bed-5909-a817-39812494b361', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', NULL, 'NONE', 'ENTER(prepareInit)', NULL, 'rsEE.beforeCell', ('2024-02-16T16:13:33.202Z'), NULL);
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('8f460419-7b80-516d-8919-84520950f612', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', NULL, 'EXIT(prepareInit)', 'ENTER(init)', NULL, 'rsEE.afterCell', ('2024-02-16T16:13:33.202Z'), NULL);
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('1931dfcc-e8fc-597d-b1bc-65b4287e6fdf', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', NULL, 'EXIT(init)', 'ENTER(ingest)', NULL, 'rsEE.afterCell', ('2024-02-16T16:13:33.202Z'), NULL);
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('17cedd6e-e794-5b45-9790-c4ba2483cc1e', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', NULL, 'EXIT(ingest)', 'ENTER(ensureContent)', NULL, 'rsEE.afterCell', ('2024-02-16T16:13:33.202Z'), NULL);
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('0a26bdb9-1499-515c-aeb4-c6d1d0a20541', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', NULL, 'EXIT(ensureContent)', 'ENTER(emitResources)', NULL, 'rsEE.afterCell', ('2024-02-16T16:13:33.202Z'), NULL);

-- removed SQLPage and execution diagnostics SQL DML from diagnostics Markdown

ATTACH '/home/snshah/workspaces/github.com/qe-collaborative-services/1115-hub/support/assurance/ahc-hrsn-elt/screening/results-test-e2e/resource.sqlite.db' AS resource_db (TYPE SQLITE);

-- copy relevant orchestration engine admin tables into the the attached database
CREATE TABLE resource_db.device AS SELECT * FROM device;
CREATE TABLE resource_db.orch_session AS SELECT * FROM orch_session;
CREATE TABLE resource_db.orch_session_entry AS SELECT * FROM orch_session_entry;
CREATE TABLE resource_db.orch_session_state AS SELECT * FROM orch_session_state;
CREATE TABLE resource_db.orch_session_exec AS SELECT * FROM orch_session_exec;
CREATE TABLE resource_db.orch_session_issue AS SELECT * FROM orch_session_issue;
CREATE TABLE resource_db.sqlpage_files AS SELECT * FROM sqlpage_files;

-- export content tables from DuckDb into the attached database (nature-dependent)
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('334b7ece-79ec-5ea1-b98b-bb09d0e2b234', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '7ef8bdeb-fd56-5eb9-a09b-ef15ce18dc49', 'ASSURED_CSV', 'EXIT(QeAdminDataCsvFileIngestSource)', NULL, 'QeAdminDataCsvFileIngestSource.exportResourceSQL', (CURRENT_TIMESTAMP), NULL);

CREATE TABLE resource_db.qe_admin_data_2_01hpkty3hctk826tvx5tasga55 AS SELECT * FROM qe_admin_data_2_01hpkty3hctk826tvx5tasga55;
  
  INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('397748ba-bd27-56b6-8272-a45f9caeaf64', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '7ef8bdeb-fd56-5eb9-a09b-ef15ce18dc49', 'ATTEMPT_CSV_EXPORT', 'EXIT(ScreeningCsvFileIngestSource)', NULL, 'QeAdminDataCsvFileIngestSource.exportResourceSQL', (CURRENT_TIMESTAMP), NULL);
  
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('0626c65d-bfe1-5eba-8a88-316343d5a123', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '0e074bf2-f1fe-55d4-bd44-a88cbed79aeb', 'ASSURED_CSV', 'EXIT(ScreeningCsvFileIngestSource)', NULL, 'ScreeningCsvFileIngestSource.exportResourceSQL', (CURRENT_TIMESTAMP), NULL);

CREATE TABLE resource_db.screening_2_01hpkty3hctk826tvx5tasga55 AS SELECT * FROM screening_2_01hpkty3hctk826tvx5tasga55;

-- try sqltofhir Visual Studio Code extension for writing FHIR resources with SQL.
-- see https://marketplace.visualstudio.com/items?itemName=arkhn.sqltofhir-vscode
CREATE VIEW resource_db.screening_2_01hpkty3hctk826tvx5tasga55_fhir AS 
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
  FROM screening_2_01hpkty3hctk826tvx5tasga55;
  
        -- TODO: Need to fill out subject->display, source->display, questionnaire
CREATE VIEW resource_db.screening_2_01hpkty3hctk826tvx5tasga55_fhir_questionnaire AS 
  SELECT pat_mrn_id, json_object(
        'resourceType', 'QuestionnaireResponse',
        'id', ENCOUNTER_ID,
        'status', 'completed',
        'questionnaire', '',
        '_questionnaire', json_object(
            'extension', json_array(
                json_object(
                    'url', QUESTION_CODE_SYSTEM_NAME,
                    'valueString', QUESTION_CODE
                )
            )
        ),
        'subject', json_object(
            'reference', 'Patient/' || PAT_MRN_ID 
        ),
        'authored', RECORDED_TIME,
        'source', json_object(
            'reference', 'Patient/' || PAT_MRN_ID
        ),
        'item', json_array(
            json_object(
                'linkId', QUESTION_CODE,
                'text', QUESTION,
                'answer',  json_array(
                  json_object(
                      'valueCoding', json_object(
                        'system', 'http://loinc.org',
                        'code', ANSWER_CODE,
                        'display', MEAS_VALUE
                      )
                  )
                )
            )
        )
    ) AS FHIR_Questionnaire
  FROM screening_2_01hpkty3hctk826tvx5tasga55; 

  INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('485754a8-39a0-5f12-96bc-6e869590e1e9', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '0e074bf2-f1fe-55d4-bd44-a88cbed79aeb', 'ATTEMPT_CSV_EXPORT', 'EXIT(ScreeningCsvFileIngestSource)', NULL, 'ScreeningCsvFileIngestSource.exportResourceSQL', (CURRENT_TIMESTAMP), NULL);
  
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('6ec2d7d4-0366-56b5-8763-dd9d6361dce0', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '80af4eff-d697-565b-9e3f-a587e322b1da', 'ASSURED_CSV', 'EXIT(AdminDemographicCsvFileIngestSource)', NULL, 'AdminDemographicCsvFileIngestSource.exportResourceSQL', (CURRENT_TIMESTAMP), NULL);

CREATE TABLE resource_db.demographic_data_2_01hpkty3hctk826tvx5tasga55 AS SELECT * FROM demographic_data_2_01hpkty3hctk826tvx5tasga55;
  
CREATE VIEW resource_db.demographic_data_2_01hpkty3hctk826tvx5tasga55_fhir_patient AS 
  SELECT pat_mrn_id, json_object(
        'resourceType', 'Patient',
        'identifier', MPI_ID,
        'active', true,
        'name', CONCAT(FIRST_NAME,' ', LAST_NAME),
        'telecom', '',
        'gender', GENDER_IDENTITY_DESCRIPTION,
        'birthDate', PAT_BIRTH_DATE,
        'address', json_array(
            json_object(
              'text', ADDRESS1,
              'line', ADDRESS2,
              'city', CITY,
              'state', STATE,
              'postalCode', ZIP
          )
        )
    ) AS FHIR_Patient
  FROM demographic_data_2_01hpkty3hctk826tvx5tasga55; 
  
  INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('09b84d82-4502-5597-99c1-a190fb056033', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '80af4eff-d697-565b-9e3f-a587e322b1da', 'ATTEMPT_CSV_EXPORT', 'EXIT(ScreeningCsvFileIngestSource)', NULL, 'AdminDemographicCsvFileIngestSource.exportResourceSQL', (CURRENT_TIMESTAMP), NULL);
  
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('63d56427-0888-5164-bea5-3f122e5805fd', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '5b77d127-e62a-50a9-acee-bea63ff64dd5', 'ASSURED_EXCEL_WORKBOOK_SHEET', 'ATTEMPT_EXCEL_WORKBOOK_SHEET_EXPORT', NULL, 'AdminDemographicExcelSheetIngestSource.exportResourceSQL', (CURRENT_TIMESTAMP), NULL);

CREATE TABLE resource_db.ahc_hrsn_2024_01_25_valid_admin_demographic AS SELECT * FROM ahc_hrsn_2024_01_25_valid_admin_demographic;

INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('1a02c252-e9e3-5a86-8ec9-54e0cb66e62b', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '5b77d127-e62a-50a9-acee-bea63ff64dd5', 'ATTEMPT_EXCEL_WORKBOOK_SHEET_EXPORT', 'EXIT(AdminDemographicExcelSheetIngestSource)', NULL, 'AdminDemographicExcelSheetIngestSource.exportResourceSQL', (CURRENT_TIMESTAMP), NULL);
    
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('2d193f6b-b33f-5f8b-8281-da48e6bceaaf', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '21d7e4ec-32e3-5e20-9029-28fdd6c5fa66', 'ASSURED_EXCEL_WORKBOOK_SHEET', 'ATTEMPT_EXCEL_WORKBOOK_SHEET_EXPORT', NULL, 'ScreeningExcelSheetIngestSource.exportResourceSQL', (CURRENT_TIMESTAMP), NULL);

CREATE TABLE resource_db.ahc_hrsn_2024_01_25_valid_screening AS SELECT * FROM ahc_hrsn_2024_01_25_valid_screening;

INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('3392e5a3-5c3e-5fbe-9dc0-08c6b4a4cc99', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '21d7e4ec-32e3-5e20-9029-28fdd6c5fa66', 'ATTEMPT_EXCEL_WORKBOOK_SHEET_EXPORT', 'EXIT(ScreeningExcelSheetIngestSource)', NULL, 'ScreeningExcelSheetIngestSource.exportResourceSQL', (CURRENT_TIMESTAMP), NULL);
    
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('7d8ecb6e-190a-5c47-b730-41cbb9d35145', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'f6d4aff4-4b71-5662-8f57-00ee247dc57c', 'ASSURED_EXCEL_WORKBOOK_SHEET', 'ATTEMPT_EXCEL_WORKBOOK_SHEET_EXPORT', NULL, 'QeAdminDataExcelSheetIngestSource.exportResourceSQL', (CURRENT_TIMESTAMP), NULL);

CREATE TABLE resource_db.ahc_hrsn_2024_01_25_valid_q_e_admin_data AS SELECT * FROM ahc_hrsn_2024_01_25_valid_q_e_admin_data;

INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('4b7b09fc-4ad4-5311-92d1-7c7a0550d0aa', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'f6d4aff4-4b71-5662-8f57-00ee247dc57c', 'ATTEMPT_EXCEL_WORKBOOK_SHEET_EXPORT', 'EXIT(AdminDemographicExcelSheetIngestSource)', NULL, 'QeAdminDataExcelSheetIngestSource.exportResourceSQL', (CURRENT_TIMESTAMP), NULL);
    
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('effcdab8-9c23-5403-ac83-f79f6f89b302', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '657d6337-8d24-5b67-b139-87db6a228264', 'ASSURED_EXCEL_WORKBOOK_SHEET', 'ATTEMPT_EXCEL_WORKBOOK_SHEET_EXPORT', NULL, 'QuestionReferenceExcelSheetIngestSource.exportResourceSQL', (CURRENT_TIMESTAMP), NULL);

CREATE TABLE resource_db.ahc_hrsn_2024_01_25_valid_question_reference AS SELECT * FROM ahc_hrsn_2024_01_25_valid_question_reference;

INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('ddd5157b-0daf-5a61-bcd3-cda46ece2d09', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '657d6337-8d24-5b67-b139-87db6a228264', 'ATTEMPT_EXCEL_WORKBOOK_SHEET_EXPORT', 'EXIT(QuestionReferenceExcelSheetIngestSource)', NULL, 'QuestionReferenceExcelSheetIngestSource.exportResourceSQL', (CURRENT_TIMESTAMP), NULL);
    
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('7210b304-8af5-537d-be03-2b8bb421337d', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'e2816d61-4406-5073-ac60-f129a107d938', 'ASSURED_EXCEL_WORKBOOK_SHEET', 'ATTEMPT_EXCEL_WORKBOOK_SHEET_EXPORT', NULL, 'AnswerReferenceExcelSheetIngestSource.exportResourceSQL', (CURRENT_TIMESTAMP), NULL);

CREATE TABLE resource_db.ahc_hrsn_2024_01_25_valid_answer_reference AS SELECT * FROM ahc_hrsn_2024_01_25_valid_answer_reference;

INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('841b1d15-81a7-5865-8dee-86f56e93ad92', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'e2816d61-4406-5073-ac60-f129a107d938', 'ATTEMPT_EXCEL_WORKBOOK_SHEET_EXPORT', 'EXIT(AnswerReferenceExcelSheetIngestSource)', NULL, 'AnswerReferenceExcelSheetIngestSource.exportResourceSQL', (CURRENT_TIMESTAMP), NULL);
    ;

-- export reference tables from DuckDb into the attached database (nature-dependent)
CREATE TABLE resource_db.encounter_class_reference AS SELECT * FROM encounter_class_reference;
CREATE TABLE resource_db.screening_status_code_reference AS SELECT * FROM screening_status_code_reference;
CREATE TABLE resource_db.encounter_status_code_reference AS SELECT * FROM encounter_status_code_reference;
CREATE TABLE resource_db.encounter_type_code_reference AS SELECT * FROM encounter_type_code_reference;
CREATE TABLE resource_db.business_rules AS SELECT * FROM business_rules;
CREATE TABLE resource_db.ahc_cross_walk AS SELECT * FROM ahc_cross_walk;

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
COPY (SELECT * FROM orch_session_diagnostic_text) TO '/home/snshah/workspaces/github.com/qe-collaborative-services/1115-hub/support/assurance/ahc-hrsn-elt/screening/results-test-e2e/diagnostics.xlsx' WITH (FORMAT GDAL, DRIVER 'xlsx');
```
No STDOUT emitted by `emitDiagnostics` (status: `0`).

No STDERR emitted by `emitDiagnostics`.

    