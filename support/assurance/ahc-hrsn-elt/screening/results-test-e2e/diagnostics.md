---
workflowPaths:
  inProcess:
    home: >-
      /home/alan/workspaces/github.com/alan-francis/1115-hub/support/assurance/ahc-hrsn-elt/screening/results-test-e2e
  egress:
    home: >-
      /home/alan/workspaces/github.com/alan-francis/1115-hub/support/assurance/ahc-hrsn-elt/screening/results-test-e2e
walkRootPaths:
  - support/assurance/ahc-hrsn-elt/screening/synthetic-content
referenceDataHome: >-
  /home/alan/workspaces/github.com/alan-francis/1115-hub/src/ahc-hrsn-elt/reference-data
sources:
  - uri: >-
      support/assurance/ahc-hrsn-elt/screening/synthetic-content/DEMOGRAPHIC_DATA_20240307.csv
    nature: CSV
    tableName: admin_demographics_20240307
    ingestionIssues: 0
  - uri: >-
      support/assurance/ahc-hrsn-elt/screening/synthetic-content/JRCHC_SDOH
      HEL_Report 2452_ran 020124DeIdent.xlsx
    nature: ERROR
    tableName: ERROR
    ingestionIssues: 1
  - uri: >-
      support/assurance/ahc-hrsn-elt/screening/synthetic-content/QE_ADMIN_DATA_20240307.csv
    nature: CSV
    tableName: qe_admin_data_20240307
    ingestionIssues: 0
  - uri: >-
      support/assurance/ahc-hrsn-elt/screening/synthetic-content/SCREENING_20240307.csv
    nature: CSV
    tableName: screening_20240307
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
      /home/alan/workspaces/github.com/alan-francis/1115-hub/src/ahc-hrsn-elt/reference-data/ahc-cross-walk.csv
    nature: CSV
    tableName: ahc_cross_walk
    ingestionIssues: 0
  - uri: >-
      /home/alan/workspaces/github.com/alan-francis/1115-hub/src/ahc-hrsn-elt/reference-data/encounter-class-reference.csv
    nature: CSV
    tableName: encounter_class_reference
    ingestionIssues: 0
  - uri: >-
      /home/alan/workspaces/github.com/alan-francis/1115-hub/src/ahc-hrsn-elt/reference-data/encounter-status-code-reference.csv
    nature: CSV
    tableName: encounter_status_code_reference
    ingestionIssues: 0
  - uri: >-
      /home/alan/workspaces/github.com/alan-francis/1115-hub/src/ahc-hrsn-elt/reference-data/encounter-type-code-reference.csv
    nature: CSV
    tableName: encounter_type_code_reference
    ingestionIssues: 0
  - uri: >-
      /home/alan/workspaces/github.com/alan-francis/1115-hub/src/ahc-hrsn-elt/reference-data/screening-status-code-reference.csv
    nature: CSV
    tableName: screening_status_code_reference
    ingestionIssues: 0
  - uri: >-
      /home/alan/workspaces/github.com/alan-francis/1115-hub/src/ahc-hrsn-elt/reference-data/gender-identity-reference.csv
    nature: CSV
    tableName: gender_identity_reference
    ingestionIssues: 0
  - uri: >-
      /home/alan/workspaces/github.com/alan-francis/1115-hub/src/ahc-hrsn-elt/reference-data/administrative-sex-reference.csv
    nature: CSV
    tableName: administrative_sex_reference
    ingestionIssues: 0
  - uri: >-
      /home/alan/workspaces/github.com/alan-francis/1115-hub/src/ahc-hrsn-elt/reference-data/sex-at-birth-reference.csv
    nature: CSV
    tableName: sex_at_birth_reference
    ingestionIssues: 0
  - uri: >-
      /home/alan/workspaces/github.com/alan-francis/1115-hub/src/ahc-hrsn-elt/reference-data/sexual-orientation-reference.csv
    nature: CSV
    tableName: sexual_orientation_reference
    ingestionIssues: 0
  - uri: >-
      /home/alan/workspaces/github.com/alan-francis/1115-hub/src/ahc-hrsn-elt/reference-data/business-rules.csv
    nature: CSV
    tableName: business_rules
    ingestionIssues: 0
  - uri: >-
      /home/alan/workspaces/github.com/alan-francis/1115-hub/src/ahc-hrsn-elt/reference-data/race-reference.csv
    nature: CSV
    tableName: race_reference
    ingestionIssues: 0
  - uri: >-
      /home/alan/workspaces/github.com/alan-francis/1115-hub/src/ahc-hrsn-elt/reference-data/ethnicity-reference.csv
    nature: CSV
    tableName: ethnicity_reference
    ingestionIssues: 0
  - uri: >-
      /home/alan/workspaces/github.com/alan-francis/1115-hub/src/ahc-hrsn-elt/reference-data/preferred-language-reference.csv
    nature: CSV
    tableName: preferred_language_reference
    ingestionIssues: 0
  - uri: >-
      /home/alan/workspaces/github.com/alan-francis/1115-hub/src/ahc-hrsn-elt/reference-data/sdoh-domain-reference.csv
    nature: CSV
    tableName: sdoh_domain_reference
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
- [jsonResult_5](#jsonresult-5)
  - [`jsonResult_5` STDOUT (status: `0`)](#jsonresult-5-stdout-status-0-)


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
    "version" TEXT NOT NULL,
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
INSERT INTO "device" ("device_id", "name", "state", "boundary", "segmentation", "state_sysinfo", "elaboration") VALUES ('7bab389e-54af-5a13-a39f-079abdc73a48', 'ALAN-FRANCIS', 'SINGLETON', 'UNKNOWN', NULL, '{"os-arch":"x64","os-platform":"linux"}', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "orch_session" ("orch_session_id", "device_id", "version", "orch_started_at", "orch_finished_at", "elaboration", "args_json", "diagnostics_json", "diagnostics_md") VALUES ('05269d28-15ae-5bd6-bd88-f949ccfa52d7', '7bab389e-54af-5a13-a39f-079abdc73a48', '0.10.2', ('2024-03-28T06:13:51.914Z'), NULL, NULL, NULL, NULL, 'Session 05269d28-15ae-5bd6-bd88-f949ccfa52d7 markdown diagnostics not provided (not completed?)');

-- Load Reference data from csvs

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
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/DEMOGRAPHIC_DATA_20240307.csv (admin_demographics_20240307)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('8b7c669c-1795-5f6b-8f3a-3e502b74c628', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/DEMOGRAPHIC_DATA_20240307.csv', 'admin_demographics_20240307', NULL);

-- state management diagnostics
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('7b979b68-7227-53fd-b689-e4fe153afb76', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '8b7c669c-1795-5f6b-8f3a-3e502b74c628', 'ENTER(ingest)', 'ATTEMPT_CSV_INGEST', NULL, 'AdminDemographicCsvFileIngestSource.ingestSQL', (CURRENT_TIMESTAMP), NULL);

-- be sure to add src_file_row_number and session_id columns to each row
-- because assurance CTEs require them
CREATE TABLE admin_demographics_20240307 AS
  SELECT *, row_number() OVER () as src_file_row_number, '05269d28-15ae-5bd6-bd88-f949ccfa52d7' as session_id, '8b7c669c-1795-5f6b-8f3a-3e502b74c628' as session_entry_id
    FROM read_csv_auto('support/assurance/ahc-hrsn-elt/screening/synthetic-content/DEMOGRAPHIC_DATA_20240307.csv', types={'SEX_AT_BIRTH_CODE': 'VARCHAR', 'ADMINISTRATIVE_SEX_CODE': 'VARCHAR', 'SEXUAL_ORIENTATION_CODE': 'VARCHAR', 'GENDER_IDENTITY_CODE': 'VARCHAR'});

WITH required_column_names_in_src AS (
    SELECT column_name
      FROM (VALUES ('MPI_ID'), ('PAT_MRN_ID'), ('FACILITY_ID'), ('CONSENT'), ('FIRST_NAME'), ('MIDDLE_NAME'), ('LAST_NAME'), ('ADMINISTRATIVE_SEX_CODE'), ('ADMINISTRATIVE_SEX_CODE_DESCRIPTION'), ('ADMINISTRATIVE_SEX_CODE_SYSTEM'), ('SEX_AT_BIRTH_CODE'), ('SEX_AT_BIRTH_CODE_DESCRIPTION'), ('SEX_AT_BIRTH_CODE_SYSTEM'), ('PAT_BIRTH_DATE'), ('ADDRESS1'), ('ADDRESS2'), ('CITY'), ('STATE'), ('ZIP'), ('GENDER_IDENTITY_CODE_SYSTEM_NAME'), ('GENDER_IDENTITY_CODE'), ('GENDER_IDENTITY_CODE_DESCRIPTION'), ('SEXUAL_ORIENTATION_CODE_SYSTEM_NAME'), ('SEXUAL_ORIENTATION_CODE'), ('SEXUAL_ORIENTATION_DESCRIPTION'), ('PREFERRED_LANGUAGE_CODE_SYSTEM_NAME'), ('PREFERRED_LANGUAGE_CODE'), ('PREFERRED_LANGUAGE_DESCRIPTION'), ('RACE_CODE_SYSTEM_NAME'), ('RACE_CODE'), ('RACE_CODE_DESCRIPTION'), ('ETHNICITY_CODE_SYSTEM_NAME'), ('ETHNICITY_CODE'), ('ETHNICITY_CODE_DESCRIPTION'), ('MEDICAID_CIN')) AS required(column_name)
     WHERE required.column_name NOT IN (
         SELECT column_name
           FROM information_schema.columns
          WHERE table_name = 'admin_demographics_20240307')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Missing Column',
           'Required column ' || column_name || ' is missing in admin_demographics_20240307.',
           'Ensure admin_demographics_20240307 contains the column "' || column_name || '"'
      FROM required_column_names_in_src;

INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('abf5c680-a135-5d89-b871-fa5b9b99aed6', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '8b7c669c-1795-5f6b-8f3a-3e502b74c628', 'ATTEMPT_CSV_INGEST', 'INGESTED_CSV', NULL, 'AdminDemographicCsvFileIngestSource.ingestSQL', (CURRENT_TIMESTAMP), NULL);
    
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/JRCHC_SDOH HEL_Report 2452_ran 020124DeIdent.xlsx (ERROR)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('641dff51-97fd-56b3-8443-c1ed568a6d66', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/JRCHC_SDOH HEL_Report 2452_ran 020124DeIdent.xlsx', 'ERROR', NULL);
INSERT INTO "orch_session_issue" ("orch_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('d70a4700-6b40-52fc-a7a2-69ef0d7f69ff', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '641dff51-97fd-56b3-8443-c1ed568a6d66', 'Sheet Missing', 'Excel workbook sheet ''Admin_Demographic'' not found in ''JRCHC_SDOH HEL_Report 2452_ran 020124DeIdent.xlsx'' (available: JRCHC_SDOH HEL_Report 2452_ran )', NULL, NULL, 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/JRCHC_SDOH HEL_Report 2452_ran 020124DeIdent.xlsx', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/JRCHC_SDOH HEL_Report 2452_ran 020124DeIdent.xlsx (ERROR)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('47277588-99e8-59f5-8384-b24344a86073', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/JRCHC_SDOH HEL_Report 2452_ran 020124DeIdent.xlsx', 'ERROR', NULL);
INSERT INTO "orch_session_issue" ("orch_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('58b22e99-5854-53bf-adbe-08e67df99b85', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '47277588-99e8-59f5-8384-b24344a86073', 'Sheet Missing', 'Excel workbook sheet ''Screening'' not found in ''JRCHC_SDOH HEL_Report 2452_ran 020124DeIdent.xlsx'' (available: JRCHC_SDOH HEL_Report 2452_ran )', NULL, NULL, 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/JRCHC_SDOH HEL_Report 2452_ran 020124DeIdent.xlsx', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/JRCHC_SDOH HEL_Report 2452_ran 020124DeIdent.xlsx (ERROR)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('a26ce332-3ced-5623-861d-23a2ef78e4a9', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/JRCHC_SDOH HEL_Report 2452_ran 020124DeIdent.xlsx', 'ERROR', NULL);
INSERT INTO "orch_session_issue" ("orch_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('bc0c03b5-d1ba-5301-850f-5e4c42c1bf09', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'a26ce332-3ced-5623-861d-23a2ef78e4a9', 'Sheet Missing', 'Excel workbook sheet ''QE_Admin_Data'' not found in ''JRCHC_SDOH HEL_Report 2452_ran 020124DeIdent.xlsx'' (available: JRCHC_SDOH HEL_Report 2452_ran )', NULL, NULL, 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/JRCHC_SDOH HEL_Report 2452_ran 020124DeIdent.xlsx', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/JRCHC_SDOH HEL_Report 2452_ran 020124DeIdent.xlsx (ERROR)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('ae477ba1-c7f1-5f34-847a-50bddb7130aa', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/JRCHC_SDOH HEL_Report 2452_ran 020124DeIdent.xlsx', 'ERROR', NULL);
INSERT INTO "orch_session_issue" ("orch_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'ae477ba1-c7f1-5f34-847a-50bddb7130aa', 'Sheet Missing', 'Excel workbook sheet ''Question_Reference'' not found in ''JRCHC_SDOH HEL_Report 2452_ran 020124DeIdent.xlsx'' (available: JRCHC_SDOH HEL_Report 2452_ran )', NULL, NULL, 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/JRCHC_SDOH HEL_Report 2452_ran 020124DeIdent.xlsx', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/JRCHC_SDOH HEL_Report 2452_ran 020124DeIdent.xlsx (ERROR)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/JRCHC_SDOH HEL_Report 2452_ran 020124DeIdent.xlsx', 'ERROR', NULL);
INSERT INTO "orch_session_issue" ("orch_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('7ef8bdeb-fd56-5eb9-a09b-ef15ce18dc49', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0', 'Sheet Missing', 'Excel workbook sheet ''Answer_Reference'' not found in ''JRCHC_SDOH HEL_Report 2452_ran 020124DeIdent.xlsx'' (available: JRCHC_SDOH HEL_Report 2452_ran )', NULL, NULL, 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/JRCHC_SDOH HEL_Report 2452_ran 020124DeIdent.xlsx', NULL, NULL);
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/QE_ADMIN_DATA_20240307.csv (qe_admin_data_20240307)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('591191c7-f693-5957-8734-ac87151ca981', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/QE_ADMIN_DATA_20240307.csv', 'qe_admin_data_20240307', NULL);

-- state management diagnostics
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('3b4eb0e5-6239-537a-8e67-e50e172e72a2', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '591191c7-f693-5957-8734-ac87151ca981', 'ENTER(ingest)', 'ATTEMPT_CSV_INGEST', NULL, 'QeAdminDataCsvFileIngestSource.ingestSQL', (CURRENT_TIMESTAMP), NULL);

-- be sure to add src_file_row_number and session_id columns to each row
-- because assurance CTEs require them
CREATE TABLE qe_admin_data_20240307 AS
  SELECT *, row_number() OVER () as src_file_row_number, '05269d28-15ae-5bd6-bd88-f949ccfa52d7' as session_id, '591191c7-f693-5957-8734-ac87151ca981' as session_entry_id
    FROM read_csv_auto('support/assurance/ahc-hrsn-elt/screening/synthetic-content/QE_ADMIN_DATA_20240307.csv');

WITH required_column_names_in_src AS (
    SELECT column_name
      FROM (VALUES ('PAT_MRN_ID'), ('FACILITY_ID'), ('FACILITY_LONG_NAME'), ('ORGANIZATION_TYPE'), ('FACILITY_ADDRESS1'), ('FACILITY_ADDRESS2'), ('FACILITY_CITY'), ('FACILITY_STATE'), ('FACILITY_ZIP'), ('VISIT_PART_2_FLAG'), ('VISIT_OMH_FLAG'), ('VISIT_OPWDD_FLAG')) AS required(column_name)
     WHERE required.column_name NOT IN (
         SELECT column_name
           FROM information_schema.columns
          WHERE table_name = 'qe_admin_data_20240307')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '591191c7-f693-5957-8734-ac87151ca981',
           'Missing Column',
           'Required column ' || column_name || ' is missing in qe_admin_data_20240307.',
           'Ensure qe_admin_data_20240307 contains the column "' || column_name || '"'
      FROM required_column_names_in_src;

INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('071f8fe1-4899-5c71-9c86-7d7377661d45', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '591191c7-f693-5957-8734-ac87151ca981', 'ATTEMPT_CSV_INGEST', 'INGESTED_CSV', NULL, 'QeAdminDataCsvFileIngestSource.ingestSQL', (CURRENT_TIMESTAMP), NULL);
    
-- ingest support/assurance/ahc-hrsn-elt/screening/synthetic-content/SCREENING_20240307.csv (screening_20240307)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('86b4a49e-7378-5159-9f41-b005208c31bc', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/ahc-hrsn-elt/screening/synthetic-content/SCREENING_20240307.csv', 'screening_20240307', NULL);

-- state management diagnostics
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('a530fe1b-57ef-5a90-8bea-835ece2483da', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '86b4a49e-7378-5159-9f41-b005208c31bc', 'ENTER(ingest)', 'ATTEMPT_CSV_INGEST', NULL, 'ScreeningCsvFileIngestSource.ingestSQL', (CURRENT_TIMESTAMP), NULL);

-- be sure to add src_file_row_number and session_id columns to each row
-- because assurance CTEs require them
CREATE TABLE screening_20240307 AS
  SELECT *, row_number() OVER () as src_file_row_number, '05269d28-15ae-5bd6-bd88-f949ccfa52d7' as session_id, '86b4a49e-7378-5159-9f41-b005208c31bc' as session_entry_id
    FROM read_csv_auto('support/assurance/ahc-hrsn-elt/screening/synthetic-content/SCREENING_20240307.csv', types={'RECORDED_TIME': 'VARCHAR', 'ENCOUNTER_TYPE_CODE': 'VARCHAR'});

WITH required_column_names_in_src AS (
    SELECT column_name
      FROM (VALUES ('PAT_MRN_ID'), ('FACILITY_ID'), ('ENCOUNTER_ID'), ('ENCOUNTER_CLASS_CODE_SYSTEM'), ('ENCOUNTER_CLASS_CODE'), ('ENCOUNTER_CLASS_CODE_DESCRIPTION'), ('ENCOUNTER_STATUS_CODE_SYSTEM'), ('ENCOUNTER_STATUS_CODE'), ('ENCOUNTER_STATUS_CODE_DESCRIPTION'), ('ENCOUNTER_TYPE_CODE_SYSTEM'), ('ENCOUNTER_TYPE_CODE'), ('ENCOUNTER_TYPE_CODE_DESCRIPTION'), ('SCREENING_CODE_DESCRIPTION'), ('SCREENING_CODE_SYSTEM_NAME'), ('SCREENING_CODE'), ('SCREENING_STATUS_CODE_DESCRIPTION'), ('SCREENING_STATUS_CODE'), ('SCREENING_STATUS_CODE_SYSTEM'), ('RECORDED_TIME'), ('QUESTION_CODE_DESCRIPTION'), ('ANSWER_CODE_DESCRIPTION'), ('UCUM_UNITS'), ('QUESTION_CODE'), ('QUESTION_CODE_SYSTEM_NAME'), ('ANSWER_CODE'), ('ANSWER_CODE_SYSTEM_NAME'), ('PARENT_QUESTION_CODE'), ('SDOH_DOMAIN'), ('POTENTIAL_NEED_INDICATED')) AS required(column_name)
     WHERE required.column_name NOT IN (
         SELECT column_name
           FROM information_schema.columns
          WHERE table_name = 'screening_20240307')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '86b4a49e-7378-5159-9f41-b005208c31bc',
           'Missing Column',
           'Required column ' || column_name || ' is missing in screening_20240307.',
           'Ensure screening_20240307 contains the column "' || column_name || '"'
      FROM required_column_names_in_src;

INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('a3fe7098-8ae8-5612-81ac-cbe10780c19b', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '86b4a49e-7378-5159-9f41-b005208c31bc', 'ATTEMPT_CSV_INGEST', 'INGESTED_CSV', NULL, 'ScreeningCsvFileIngestSource.ingestSQL', (CURRENT_TIMESTAMP), NULL);
    
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
-- ingest /home/alan/workspaces/github.com/alan-francis/1115-hub/src/ahc-hrsn-elt/reference-data/ahc-cross-walk.csv (ahc_cross_walk)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('e6951d0b-be59-58c3-8a04-01181208c601', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '/home/alan/workspaces/github.com/alan-francis/1115-hub/src/ahc-hrsn-elt/reference-data/ahc-cross-walk.csv', 'ahc_cross_walk', NULL);

-- state management diagnostics
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('2afb3098-bcfd-5a54-8ebb-4d65d399c55e', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'e6951d0b-be59-58c3-8a04-01181208c601', 'ENTER(ingest)', 'ATTEMPT_CSV_INGEST', NULL, 'AhcCrossWalkCsvFileIngestSource.ingestSQL', (CURRENT_TIMESTAMP), NULL);

-- be sure to add src_file_row_number and session_id columns to each row
-- because assurance CTEs require them
CREATE TABLE ahc_cross_walk AS
  SELECT *, row_number() OVER () as src_file_row_number, '05269d28-15ae-5bd6-bd88-f949ccfa52d7' as session_id, 'e6951d0b-be59-58c3-8a04-01181208c601' as session_entry_id
    FROM read_csv_auto('/home/alan/workspaces/github.com/alan-francis/1115-hub/src/ahc-hrsn-elt/reference-data/ahc-cross-walk.csv', header = true);

WITH required_column_names_in_src AS (
    SELECT column_name
      FROM (VALUES ('SCREENING_CODE'), ('SCREENING_CODE_DESCRIPTION'), ('QUESTION_SLNO'), ('QUESTION'), ('QUESTION_CODE'), ('QUESTION_SLNO_REFERENCE'), ('ANSWER_VALUE'), ('ANSWER_CODE'), ('CALCULATED_FIELD'), ('SCORE'), ('UCUM_UNITS'), ('SDOH_DOMAIN'), ('POTENTIAL_NEED_INDICATED')) AS required(column_name)
     WHERE required.column_name NOT IN (
         SELECT column_name
           FROM information_schema.columns
          WHERE table_name = 'ahc_cross_walk')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           'e6951d0b-be59-58c3-8a04-01181208c601',
           'Missing Column',
           'Required column ' || column_name || ' is missing in ahc_cross_walk.',
           'Ensure ahc_cross_walk contains the column "' || column_name || '"'
      FROM required_column_names_in_src;

INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('0e074bf2-f1fe-55d4-bd44-a88cbed79aeb', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'e6951d0b-be59-58c3-8a04-01181208c601', 'ATTEMPT_CSV_INGEST', 'INGESTED_CSV', NULL, 'AhcCrossWalkCsvFileIngestSource.ingestSQL', (CURRENT_TIMESTAMP), NULL);
      
-- ingest /home/alan/workspaces/github.com/alan-francis/1115-hub/src/ahc-hrsn-elt/reference-data/encounter-class-reference.csv (encounter_class_reference)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('e8b3dab4-5058-5c79-8088-45b423119149', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '/home/alan/workspaces/github.com/alan-francis/1115-hub/src/ahc-hrsn-elt/reference-data/encounter-class-reference.csv', 'encounter_class_reference', NULL);

-- state management diagnostics
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('9dabd022-4a26-55f2-98f4-e534e7704b23', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'e8b3dab4-5058-5c79-8088-45b423119149', 'ENTER(ingest)', 'ATTEMPT_CSV_INGEST', NULL, 'EncounterClassReferenceCsvFileIngestSource.ingestSQL', (CURRENT_TIMESTAMP), NULL);

-- be sure to add src_file_row_number and session_id columns to each row
-- because assurance CTEs require them
CREATE TABLE encounter_class_reference AS
  SELECT *, row_number() OVER () as src_file_row_number, '05269d28-15ae-5bd6-bd88-f949ccfa52d7' as session_id, 'e8b3dab4-5058-5c79-8088-45b423119149' as session_entry_id
    FROM read_csv_auto('/home/alan/workspaces/github.com/alan-francis/1115-hub/src/ahc-hrsn-elt/reference-data/encounter-class-reference.csv',
      header = true
    );

WITH required_column_names_in_src AS (
    SELECT column_name
      FROM (VALUES ('Code'), ('System'), ('Display'), ('Definition')) AS required(column_name)
     WHERE required.column_name NOT IN (
         SELECT column_name
           FROM information_schema.columns
          WHERE table_name = 'encounter_class_reference')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           'e8b3dab4-5058-5c79-8088-45b423119149',
           'Missing Column',
           'Required column ' || column_name || ' is missing in encounter_class_reference.',
           'Ensure encounter_class_reference contains the column "' || column_name || '"'
      FROM required_column_names_in_src;

INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('80af4eff-d697-565b-9e3f-a587e322b1da', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'e8b3dab4-5058-5c79-8088-45b423119149', 'ATTEMPT_CSV_INGEST', 'INGESTED_CSV', NULL, 'EncounterClassReferenceCsvFileIngestSource.ingestSQL', (CURRENT_TIMESTAMP), NULL);
      
-- ingest /home/alan/workspaces/github.com/alan-francis/1115-hub/src/ahc-hrsn-elt/reference-data/encounter-status-code-reference.csv (encounter_status_code_reference)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('6fcd9df5-34cf-5c09-8fb5-e73617e28d73', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '/home/alan/workspaces/github.com/alan-francis/1115-hub/src/ahc-hrsn-elt/reference-data/encounter-status-code-reference.csv', 'encounter_status_code_reference', NULL);

-- state management diagnostics
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('7e65e3a7-4415-55f4-866b-3b0cc4e85fc6', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '6fcd9df5-34cf-5c09-8fb5-e73617e28d73', 'ENTER(ingest)', 'ATTEMPT_CSV_INGEST', NULL, 'EncounterStatusCodeReferenceCsvFileIngestSource.ingestSQL', (CURRENT_TIMESTAMP), NULL);

-- be sure to add src_file_row_number and session_id columns to each row
-- because assurance CTEs require them
CREATE TABLE encounter_status_code_reference AS
  SELECT *, row_number() OVER () as src_file_row_number, '05269d28-15ae-5bd6-bd88-f949ccfa52d7' as session_id, '6fcd9df5-34cf-5c09-8fb5-e73617e28d73' as session_entry_id
    FROM read_csv_auto('/home/alan/workspaces/github.com/alan-francis/1115-hub/src/ahc-hrsn-elt/reference-data/encounter-status-code-reference.csv',
      header = true
    );

WITH required_column_names_in_src AS (
    SELECT column_name
      FROM (VALUES ('Code'), ('Display'), ('Definition')) AS required(column_name)
     WHERE required.column_name NOT IN (
         SELECT column_name
           FROM information_schema.columns
          WHERE table_name = 'encounter_status_code_reference')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '6fcd9df5-34cf-5c09-8fb5-e73617e28d73',
           'Missing Column',
           'Required column ' || column_name || ' is missing in encounter_status_code_reference.',
           'Ensure encounter_status_code_reference contains the column "' || column_name || '"'
      FROM required_column_names_in_src;

INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('5b77d127-e62a-50a9-acee-bea63ff64dd5', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '6fcd9df5-34cf-5c09-8fb5-e73617e28d73', 'ATTEMPT_CSV_INGEST', 'INGESTED_CSV', NULL, 'EncounterStatusCodeReferenceCsvFileIngestSource.ingestSQL', (CURRENT_TIMESTAMP), NULL);
      
-- ingest /home/alan/workspaces/github.com/alan-francis/1115-hub/src/ahc-hrsn-elt/reference-data/encounter-type-code-reference.csv (encounter_type_code_reference)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('a92a6466-6fe4-58d7-8948-e2e09dc2fec2', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '/home/alan/workspaces/github.com/alan-francis/1115-hub/src/ahc-hrsn-elt/reference-data/encounter-type-code-reference.csv', 'encounter_type_code_reference', NULL);

-- state management diagnostics
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('34e90086-3d06-5b10-972d-7d0b40a02289', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'a92a6466-6fe4-58d7-8948-e2e09dc2fec2', 'ENTER(ingest)', 'ATTEMPT_CSV_INGEST', NULL, 'EncounterTypeCodeReferenceCsvFileIngestSource.ingestSQL', (CURRENT_TIMESTAMP), NULL);

-- be sure to add src_file_row_number and session_id columns to each row
-- because assurance CTEs require them
CREATE TABLE encounter_type_code_reference AS
  SELECT *, row_number() OVER () as src_file_row_number, '05269d28-15ae-5bd6-bd88-f949ccfa52d7' as session_id, 'a92a6466-6fe4-58d7-8948-e2e09dc2fec2' as session_entry_id
    FROM read_csv_auto('/home/alan/workspaces/github.com/alan-francis/1115-hub/src/ahc-hrsn-elt/reference-data/encounter-type-code-reference.csv',
      header = true
    );

WITH required_column_names_in_src AS (
    SELECT column_name
      FROM (VALUES ('Code'), ('System'), ('Display')) AS required(column_name)
     WHERE required.column_name NOT IN (
         SELECT column_name
           FROM information_schema.columns
          WHERE table_name = 'encounter_type_code_reference')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           'a92a6466-6fe4-58d7-8948-e2e09dc2fec2',
           'Missing Column',
           'Required column ' || column_name || ' is missing in encounter_type_code_reference.',
           'Ensure encounter_type_code_reference contains the column "' || column_name || '"'
      FROM required_column_names_in_src;

INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('21d7e4ec-32e3-5e20-9029-28fdd6c5fa66', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'a92a6466-6fe4-58d7-8948-e2e09dc2fec2', 'ATTEMPT_CSV_INGEST', 'INGESTED_CSV', NULL, 'EncounterTypeCodeReferenceCsvFileIngestSource.ingestSQL', (CURRENT_TIMESTAMP), NULL);
      
-- ingest /home/alan/workspaces/github.com/alan-francis/1115-hub/src/ahc-hrsn-elt/reference-data/screening-status-code-reference.csv (screening_status_code_reference)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('4f7e4436-c5f6-5ba1-9793-580ab66789fb', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '/home/alan/workspaces/github.com/alan-francis/1115-hub/src/ahc-hrsn-elt/reference-data/screening-status-code-reference.csv', 'screening_status_code_reference', NULL);

-- state management diagnostics
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('86ff3ab6-900d-5474-b63c-cbcac3c66f1a', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '4f7e4436-c5f6-5ba1-9793-580ab66789fb', 'ENTER(ingest)', 'ATTEMPT_CSV_INGEST', NULL, 'ScreeningStatusCodeReferenceCsvFileIngestSource.ingestSQL', (CURRENT_TIMESTAMP), NULL);

-- be sure to add src_file_row_number and session_id columns to each row
-- because assurance CTEs require them
CREATE TABLE screening_status_code_reference AS
  SELECT *, row_number() OVER () as src_file_row_number, '05269d28-15ae-5bd6-bd88-f949ccfa52d7' as session_id, '4f7e4436-c5f6-5ba1-9793-580ab66789fb' as session_entry_id
    FROM read_csv_auto('/home/alan/workspaces/github.com/alan-francis/1115-hub/src/ahc-hrsn-elt/reference-data/screening-status-code-reference.csv',
      header = true
    );

WITH required_column_names_in_src AS (
    SELECT column_name
      FROM (VALUES ('Lvl'), ('Code'), ('Display'), ('Definition')) AS required(column_name)
     WHERE required.column_name NOT IN (
         SELECT column_name
           FROM information_schema.columns
          WHERE table_name = 'screening_status_code_reference')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '4f7e4436-c5f6-5ba1-9793-580ab66789fb',
           'Missing Column',
           'Required column ' || column_name || ' is missing in screening_status_code_reference.',
           'Ensure screening_status_code_reference contains the column "' || column_name || '"'
      FROM required_column_names_in_src;

INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('f6d4aff4-4b71-5662-8f57-00ee247dc57c', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '4f7e4436-c5f6-5ba1-9793-580ab66789fb', 'ATTEMPT_CSV_INGEST', 'INGESTED_CSV', NULL, 'ScreeningStatusCodeReferenceCsvFileIngestSource.ingestSQL', (CURRENT_TIMESTAMP), NULL);
      
-- ingest /home/alan/workspaces/github.com/alan-francis/1115-hub/src/ahc-hrsn-elt/reference-data/gender-identity-reference.csv (gender_identity_reference)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('6202ec4a-f3d5-5302-9ed6-9cb59a5b2818', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '/home/alan/workspaces/github.com/alan-francis/1115-hub/src/ahc-hrsn-elt/reference-data/gender-identity-reference.csv', 'gender_identity_reference', NULL);

-- state management diagnostics
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('4b7537b2-9d60-59f3-8c61-fa2ff4265c02', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '6202ec4a-f3d5-5302-9ed6-9cb59a5b2818', 'ENTER(ingest)', 'ATTEMPT_CSV_INGEST', NULL, 'GenderIdentityReferenceCsvFileIngestSource.ingestSQL', (CURRENT_TIMESTAMP), NULL);

-- be sure to add src_file_row_number and session_id columns to each row
-- because assurance CTEs require them
CREATE TABLE gender_identity_reference AS
  SELECT *, row_number() OVER () as src_file_row_number, '05269d28-15ae-5bd6-bd88-f949ccfa52d7' as session_id, '6202ec4a-f3d5-5302-9ed6-9cb59a5b2818' as session_entry_id
    FROM read_csv_auto('/home/alan/workspaces/github.com/alan-francis/1115-hub/src/ahc-hrsn-elt/reference-data/gender-identity-reference.csv',
      header = true
    );

WITH required_column_names_in_src AS (
    SELECT column_name
      FROM (VALUES ('GENDER_IDENTITY_CODE'), ('GENDER_IDENTITY_CODE_DESCRIPTION'), ('GENDER_IDENTITY_CODE_SYSTEM_NAME')) AS required(column_name)
     WHERE required.column_name NOT IN (
         SELECT column_name
           FROM information_schema.columns
          WHERE table_name = 'gender_identity_reference')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '6202ec4a-f3d5-5302-9ed6-9cb59a5b2818',
           'Missing Column',
           'Required column ' || column_name || ' is missing in gender_identity_reference.',
           'Ensure gender_identity_reference contains the column "' || column_name || '"'
      FROM required_column_names_in_src;

INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('657d6337-8d24-5b67-b139-87db6a228264', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '6202ec4a-f3d5-5302-9ed6-9cb59a5b2818', 'ATTEMPT_CSV_INGEST', 'INGESTED_CSV', NULL, 'GenderIdentityReferenceCsvFileIngestSource.ingestSQL', (CURRENT_TIMESTAMP), NULL);
      
-- ingest /home/alan/workspaces/github.com/alan-francis/1115-hub/src/ahc-hrsn-elt/reference-data/administrative-sex-reference.csv (administrative_sex_reference)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('9f13dd7d-9ff8-509d-b716-cde856c5f0f0', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '/home/alan/workspaces/github.com/alan-francis/1115-hub/src/ahc-hrsn-elt/reference-data/administrative-sex-reference.csv', 'administrative_sex_reference', NULL);

-- state management diagnostics
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('9c0d34d3-bf09-527a-aef5-85004a400be5', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '9f13dd7d-9ff8-509d-b716-cde856c5f0f0', 'ENTER(ingest)', 'ATTEMPT_CSV_INGEST', NULL, 'AdministrativeSexReferenceCsvFileIngestSource.ingestSQL', (CURRENT_TIMESTAMP), NULL);

-- be sure to add src_file_row_number and session_id columns to each row
-- because assurance CTEs require them
CREATE TABLE administrative_sex_reference AS
  SELECT *, row_number() OVER () as src_file_row_number, '05269d28-15ae-5bd6-bd88-f949ccfa52d7' as session_id, '9f13dd7d-9ff8-509d-b716-cde856c5f0f0' as session_entry_id
    FROM read_csv_auto('/home/alan/workspaces/github.com/alan-francis/1115-hub/src/ahc-hrsn-elt/reference-data/administrative-sex-reference.csv',
      header = true
    );

WITH required_column_names_in_src AS (
    SELECT column_name
      FROM (VALUES ('ADMINISTRATIVE_SEX_CODE'), ('ADMINISTRATIVE_SEX_CODE_DESCRIPTION'), ('ADMINISTRATIVE_SEX_CODE_SYSTEM')) AS required(column_name)
     WHERE required.column_name NOT IN (
         SELECT column_name
           FROM information_schema.columns
          WHERE table_name = 'administrative_sex_reference')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '9f13dd7d-9ff8-509d-b716-cde856c5f0f0',
           'Missing Column',
           'Required column ' || column_name || ' is missing in administrative_sex_reference.',
           'Ensure administrative_sex_reference contains the column "' || column_name || '"'
      FROM required_column_names_in_src;

INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('e2816d61-4406-5073-ac60-f129a107d938', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '9f13dd7d-9ff8-509d-b716-cde856c5f0f0', 'ATTEMPT_CSV_INGEST', 'INGESTED_CSV', NULL, 'AdministrativeSexReferenceCsvFileIngestSource.ingestSQL', (CURRENT_TIMESTAMP), NULL);
      
-- ingest /home/alan/workspaces/github.com/alan-francis/1115-hub/src/ahc-hrsn-elt/reference-data/sex-at-birth-reference.csv (sex_at_birth_reference)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('413ec5cd-eee9-5c62-90a5-6670f8b9ddff', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '/home/alan/workspaces/github.com/alan-francis/1115-hub/src/ahc-hrsn-elt/reference-data/sex-at-birth-reference.csv', 'sex_at_birth_reference', NULL);

-- state management diagnostics
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('6c48996f-0dd4-572f-b087-e5913926cd4b', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '413ec5cd-eee9-5c62-90a5-6670f8b9ddff', 'ENTER(ingest)', 'ATTEMPT_CSV_INGEST', NULL, 'SexAtBirthReferenceCsvFileIngestSource.ingestSQL', (CURRENT_TIMESTAMP), NULL);

-- be sure to add src_file_row_number and session_id columns to each row
-- because assurance CTEs require them
CREATE TABLE sex_at_birth_reference AS
  SELECT *, row_number() OVER () as src_file_row_number, '05269d28-15ae-5bd6-bd88-f949ccfa52d7' as session_id, '413ec5cd-eee9-5c62-90a5-6670f8b9ddff' as session_entry_id
    FROM read_csv_auto('/home/alan/workspaces/github.com/alan-francis/1115-hub/src/ahc-hrsn-elt/reference-data/sex-at-birth-reference.csv',
      header = true
    );

WITH required_column_names_in_src AS (
    SELECT column_name
      FROM (VALUES ('SEX_AT_BIRTH_CODE'), ('SEX_AT_BIRTH_CODE_DESCRIPTION'), ('SEX_AT_BIRTH_CODE_SYSTEM')) AS required(column_name)
     WHERE required.column_name NOT IN (
         SELECT column_name
           FROM information_schema.columns
          WHERE table_name = 'sex_at_birth_reference')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '413ec5cd-eee9-5c62-90a5-6670f8b9ddff',
           'Missing Column',
           'Required column ' || column_name || ' is missing in sex_at_birth_reference.',
           'Ensure sex_at_birth_reference contains the column "' || column_name || '"'
      FROM required_column_names_in_src;

INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('bebf797d-855b-5e76-93d2-2a802febd5a2', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '413ec5cd-eee9-5c62-90a5-6670f8b9ddff', 'ATTEMPT_CSV_INGEST', 'INGESTED_CSV', NULL, 'SexAtBirthReferenceCsvFileIngestSource.ingestSQL', (CURRENT_TIMESTAMP), NULL);
      
-- ingest /home/alan/workspaces/github.com/alan-francis/1115-hub/src/ahc-hrsn-elt/reference-data/sexual-orientation-reference.csv (sexual_orientation_reference)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('17cedd6e-e794-5b45-9790-c4ba2483cc1e', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '/home/alan/workspaces/github.com/alan-francis/1115-hub/src/ahc-hrsn-elt/reference-data/sexual-orientation-reference.csv', 'sexual_orientation_reference', NULL);

-- state management diagnostics
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('c40829eb-7f91-583a-8af8-06de851777a0', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '17cedd6e-e794-5b45-9790-c4ba2483cc1e', 'ENTER(ingest)', 'ATTEMPT_CSV_INGEST', NULL, 'SexualOrientationReferenceCsvFileIngestSource.ingestSQL', (CURRENT_TIMESTAMP), NULL);

-- be sure to add src_file_row_number and session_id columns to each row
-- because assurance CTEs require them
CREATE TABLE sexual_orientation_reference AS
  SELECT *, row_number() OVER () as src_file_row_number, '05269d28-15ae-5bd6-bd88-f949ccfa52d7' as session_id, '17cedd6e-e794-5b45-9790-c4ba2483cc1e' as session_entry_id
    FROM read_csv_auto('/home/alan/workspaces/github.com/alan-francis/1115-hub/src/ahc-hrsn-elt/reference-data/sexual-orientation-reference.csv',
      header = true
    );

WITH required_column_names_in_src AS (
    SELECT column_name
      FROM (VALUES ('SEXUAL_ORIENTATION_CODE'), ('SEXUAL_ORIENTATION_CODE_DESCRIPTION'), ('SEXUAL_ORIENTATION_CODE_SYSTEM_NAME')) AS required(column_name)
     WHERE required.column_name NOT IN (
         SELECT column_name
           FROM information_schema.columns
          WHERE table_name = 'sexual_orientation_reference')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '17cedd6e-e794-5b45-9790-c4ba2483cc1e',
           'Missing Column',
           'Required column ' || column_name || ' is missing in sexual_orientation_reference.',
           'Ensure sexual_orientation_reference contains the column "' || column_name || '"'
      FROM required_column_names_in_src;

INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('a8ec8b43-9e16-5eeb-9683-bc14288971f1', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '17cedd6e-e794-5b45-9790-c4ba2483cc1e', 'ATTEMPT_CSV_INGEST', 'INGESTED_CSV', NULL, 'SexualOrientationReferenceCsvFileIngestSource.ingestSQL', (CURRENT_TIMESTAMP), NULL);
      
-- ingest /home/alan/workspaces/github.com/alan-francis/1115-hub/src/ahc-hrsn-elt/reference-data/business-rules.csv (business_rules)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('35c62034-5b20-5891-8d38-3e9b051dec6e', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '/home/alan/workspaces/github.com/alan-francis/1115-hub/src/ahc-hrsn-elt/reference-data/business-rules.csv', 'business_rules', NULL);

-- state management diagnostics
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('aa8b8d1a-c8cc-5a9b-b5aa-34a6fc85e11a', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '35c62034-5b20-5891-8d38-3e9b051dec6e', 'ENTER(ingest)', 'ATTEMPT_CSV_INGEST', NULL, 'BusinessRulesReferenceCsvFileIngestSource.ingestSQL', (CURRENT_TIMESTAMP), NULL);

-- be sure to add src_file_row_number and session_id columns to each row
-- because assurance CTEs require them
CREATE TABLE business_rules AS
  SELECT *, row_number() OVER () as src_file_row_number, '05269d28-15ae-5bd6-bd88-f949ccfa52d7' as session_id, '35c62034-5b20-5891-8d38-3e9b051dec6e' as session_entry_id
    FROM read_csv_auto('/home/alan/workspaces/github.com/alan-francis/1115-hub/src/ahc-hrsn-elt/reference-data/business-rules.csv',
      header = true
    );

WITH required_column_names_in_src AS (
    SELECT column_name
      FROM (VALUES ('Worksheet'), ('Field'), ('Required'), ('Permissible Values'), ('True Rejection'), ('Warning Layer'), ('Resolved by QE/QCS')) AS required(column_name)
     WHERE required.column_name NOT IN (
         SELECT column_name
           FROM information_schema.columns
          WHERE table_name = 'business_rules')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '35c62034-5b20-5891-8d38-3e9b051dec6e',
           'Missing Column',
           'Required column ' || column_name || ' is missing in business_rules.',
           'Ensure business_rules contains the column "' || column_name || '"'
      FROM required_column_names_in_src;

INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('8278fd0f-7116-55bd-8d7a-0a30681b0d2f', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '35c62034-5b20-5891-8d38-3e9b051dec6e', 'ATTEMPT_CSV_INGEST', 'INGESTED_CSV', NULL, 'BusinessRulesReferenceCsvFileIngestSource.ingestSQL', (CURRENT_TIMESTAMP), NULL);
      
-- ingest /home/alan/workspaces/github.com/alan-francis/1115-hub/src/ahc-hrsn-elt/reference-data/race-reference.csv (race_reference)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('c420c3ba-ddbc-582b-9cdf-361497beb034', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '/home/alan/workspaces/github.com/alan-francis/1115-hub/src/ahc-hrsn-elt/reference-data/race-reference.csv', 'race_reference', NULL);

-- state management diagnostics
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('97c2cca2-92f5-5937-97e6-d84beeb4018e', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'c420c3ba-ddbc-582b-9cdf-361497beb034', 'ENTER(ingest)', 'ATTEMPT_CSV_INGEST', NULL, 'RaceReferenceCsvFileIngestSource.ingestSQL', (CURRENT_TIMESTAMP), NULL);

-- be sure to add src_file_row_number and session_id columns to each row
-- because assurance CTEs require them
CREATE TABLE race_reference AS
  SELECT *, row_number() OVER () as src_file_row_number, '05269d28-15ae-5bd6-bd88-f949ccfa52d7' as session_id, 'c420c3ba-ddbc-582b-9cdf-361497beb034' as session_entry_id
    FROM read_csv_auto('/home/alan/workspaces/github.com/alan-francis/1115-hub/src/ahc-hrsn-elt/reference-data/race-reference.csv',
      header = true
    );

WITH required_column_names_in_src AS (
    SELECT column_name
      FROM (VALUES ('Concept Name'), ('Concept Code'), ('Hierarchical Code'), ('Race Category (Concept Name)'), ('Race Category (Concept Code)'), ('Hiearchical Code')) AS required(column_name)
     WHERE required.column_name NOT IN (
         SELECT column_name
           FROM information_schema.columns
          WHERE table_name = 'race_reference')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           'c420c3ba-ddbc-582b-9cdf-361497beb034',
           'Missing Column',
           'Required column ' || column_name || ' is missing in race_reference.',
           'Ensure race_reference contains the column "' || column_name || '"'
      FROM required_column_names_in_src;

INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('442b5e69-76fb-5da8-ae00-b79ea50cbedb', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'c420c3ba-ddbc-582b-9cdf-361497beb034', 'ATTEMPT_CSV_INGEST', 'INGESTED_CSV', NULL, 'RaceReferenceCsvFileIngestSource.ingestSQL', (CURRENT_TIMESTAMP), NULL);
      
-- ingest /home/alan/workspaces/github.com/alan-francis/1115-hub/src/ahc-hrsn-elt/reference-data/ethnicity-reference.csv (ethnicity_reference)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('5a941253-b661-5282-a5e6-97cbfe5dfb32', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '/home/alan/workspaces/github.com/alan-francis/1115-hub/src/ahc-hrsn-elt/reference-data/ethnicity-reference.csv', 'ethnicity_reference', NULL);

-- state management diagnostics
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('f58ee169-7478-59ca-9e36-aa384ddb501c', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '5a941253-b661-5282-a5e6-97cbfe5dfb32', 'ENTER(ingest)', 'ATTEMPT_CSV_INGEST', NULL, 'EthnicityReferenceCsvFileIngestSource.ingestSQL', (CURRENT_TIMESTAMP), NULL);

-- be sure to add src_file_row_number and session_id columns to each row
-- because assurance CTEs require them
CREATE TABLE ethnicity_reference AS
  SELECT *, row_number() OVER () as src_file_row_number, '05269d28-15ae-5bd6-bd88-f949ccfa52d7' as session_id, '5a941253-b661-5282-a5e6-97cbfe5dfb32' as session_entry_id
    FROM read_csv_auto('/home/alan/workspaces/github.com/alan-francis/1115-hub/src/ahc-hrsn-elt/reference-data/ethnicity-reference.csv',
      header = true
    );

WITH required_column_names_in_src AS (
    SELECT column_name
      FROM (VALUES ('Concept Code'), ('Concept Name'), ('Hierarchical Code'), ('Ethnicity Group (Concept Name)'), ('Ethnicity Group (Concept Code)')) AS required(column_name)
     WHERE required.column_name NOT IN (
         SELECT column_name
           FROM information_schema.columns
          WHERE table_name = 'ethnicity_reference')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '5a941253-b661-5282-a5e6-97cbfe5dfb32',
           'Missing Column',
           'Required column ' || column_name || ' is missing in ethnicity_reference.',
           'Ensure ethnicity_reference contains the column "' || column_name || '"'
      FROM required_column_names_in_src;

INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('3cab2329-2aae-5475-9792-04e14e862f1e', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '5a941253-b661-5282-a5e6-97cbfe5dfb32', 'ATTEMPT_CSV_INGEST', 'INGESTED_CSV', NULL, 'EthnicityReferenceCsvFileIngestSource.ingestSQL', (CURRENT_TIMESTAMP), NULL);
      
-- ingest /home/alan/workspaces/github.com/alan-francis/1115-hub/src/ahc-hrsn-elt/reference-data/preferred-language-reference.csv (preferred_language_reference)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('b63bd83d-959a-5a5f-8d60-08b84bf16c90', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '/home/alan/workspaces/github.com/alan-francis/1115-hub/src/ahc-hrsn-elt/reference-data/preferred-language-reference.csv', 'preferred_language_reference', NULL);

-- state management diagnostics
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('47d97ff4-908a-50f7-a2e2-443e2dad7056', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'b63bd83d-959a-5a5f-8d60-08b84bf16c90', 'ENTER(ingest)', 'ATTEMPT_CSV_INGEST', NULL, 'PreferredLanguageReferenceCsvFileIngestSource.ingestSQL', (CURRENT_TIMESTAMP), NULL);

-- be sure to add src_file_row_number and session_id columns to each row
-- because assurance CTEs require them
CREATE TABLE preferred_language_reference AS
  SELECT *, row_number() OVER () as src_file_row_number, '05269d28-15ae-5bd6-bd88-f949ccfa52d7' as session_id, 'b63bd83d-959a-5a5f-8d60-08b84bf16c90' as session_entry_id
    FROM read_csv_auto('/home/alan/workspaces/github.com/alan-francis/1115-hub/src/ahc-hrsn-elt/reference-data/preferred-language-reference.csv',
      header = true
    );

WITH required_column_names_in_src AS (
    SELECT column_name
      FROM (VALUES ('ISO 639-2 Code'), ('ISO 639-1 Code'), ('English name of Language'), ('French name of Language'), ('German name of Language')) AS required(column_name)
     WHERE required.column_name NOT IN (
         SELECT column_name
           FROM information_schema.columns
          WHERE table_name = 'preferred_language_reference')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           'b63bd83d-959a-5a5f-8d60-08b84bf16c90',
           'Missing Column',
           'Required column ' || column_name || ' is missing in preferred_language_reference.',
           'Ensure preferred_language_reference contains the column "' || column_name || '"'
      FROM required_column_names_in_src;

INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('90a0010e-213e-58c3-9302-5e7310006b95', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'b63bd83d-959a-5a5f-8d60-08b84bf16c90', 'ATTEMPT_CSV_INGEST', 'INGESTED_CSV', NULL, 'PreferredLanguageReferenceCsvFileIngestSource.ingestSQL', (CURRENT_TIMESTAMP), NULL);
      
-- ingest /home/alan/workspaces/github.com/alan-francis/1115-hub/src/ahc-hrsn-elt/reference-data/sdoh-domain-reference.csv (sdoh_domain_reference)
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "orch_session_entry" ("orch_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('f626602e-8be5-5e8c-824c-bdde91b22817', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '/home/alan/workspaces/github.com/alan-francis/1115-hub/src/ahc-hrsn-elt/reference-data/sdoh-domain-reference.csv', 'sdoh_domain_reference', NULL);

-- state management diagnostics
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('398104b8-02dc-509b-998a-0b66b5a912e1', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'f626602e-8be5-5e8c-824c-bdde91b22817', 'ENTER(ingest)', 'ATTEMPT_CSV_INGEST', NULL, 'SdohDomainReferenceCsvFileIngestSource.ingestSQL', (CURRENT_TIMESTAMP), NULL);

-- be sure to add src_file_row_number and session_id columns to each row
-- because assurance CTEs require them
CREATE TABLE sdoh_domain_reference AS
  SELECT *, row_number() OVER () as src_file_row_number, '05269d28-15ae-5bd6-bd88-f949ccfa52d7' as session_id, 'f626602e-8be5-5e8c-824c-bdde91b22817' as session_entry_id
    FROM read_csv_auto('/home/alan/workspaces/github.com/alan-francis/1115-hub/src/ahc-hrsn-elt/reference-data/sdoh-domain-reference.csv',
      header = true
    );

WITH required_column_names_in_src AS (
    SELECT column_name
      FROM (VALUES ('Code'), ('Display'), ('Definition')) AS required(column_name)
     WHERE required.column_name NOT IN (
         SELECT column_name
           FROM information_schema.columns
          WHERE table_name = 'sdoh_domain_reference')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           'f626602e-8be5-5e8c-824c-bdde91b22817',
           'Missing Column',
           'Required column ' || column_name || ' is missing in sdoh_domain_reference.',
           'Ensure sdoh_domain_reference contains the column "' || column_name || '"'
      FROM required_column_names_in_src;

INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('5476830d-6cd9-5866-a105-7049aa24426d', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'f626602e-8be5-5e8c-824c-bdde91b22817', 'ATTEMPT_CSV_INGEST', 'INGESTED_CSV', NULL, 'SdohDomainReferenceCsvFileIngestSource.ingestSQL', (CURRENT_TIMESTAMP), NULL);
      
SELECT session_entry_id, orch_session_issue_id, issue_type, issue_message, invalid_value FROM orch_session_issue WHERE session_id = '05269d28-15ae-5bd6-bd88-f949ccfa52d7'
```
### `ingest` STDOUT (status: `0`)
```json
[{"session_entry_id":"641dff51-97fd-56b3-8443-c1ed568a6d66","orch_session_issue_id":"d70a4700-6b40-52fc-a7a2-69ef0d7f69ff","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet 'Admin_Demographic' not found in 'JRCHC_SDOH HEL_Report 2452_ran 020124DeIdent.xlsx' (available: JRCHC_SDOH HEL_Report 2452_ran )","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/JRCHC_SDOH HEL_Report 2452_ran 020124DeIdent.xlsx"},
{"session_entry_id":"47277588-99e8-59f5-8384-b24344a86073","orch_session_issue_id":"58b22e99-5854-53bf-adbe-08e67df99b85","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet 'Screening' not found in 'JRCHC_SDOH HEL_Report 2452_ran 020124DeIdent.xlsx' (available: JRCHC_SDOH HEL_Report 2452_ran )","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/JRCHC_SDOH HEL_Report 2452_ran 020124DeIdent.xlsx"},
{"session_entry_id":"a26ce332-3ced-5623-861d-23a2ef78e4a9","orch_session_issue_id":"bc0c03b5-d1ba-5301-850f-5e4c42c1bf09","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet 'QE_Admin_Data' not found in 'JRCHC_SDOH HEL_Report 2452_ran 020124DeIdent.xlsx' (available: JRCHC_SDOH HEL_Report 2452_ran )","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/JRCHC_SDOH HEL_Report 2452_ran 020124DeIdent.xlsx"},
{"session_entry_id":"ae477ba1-c7f1-5f34-847a-50bddb7130aa","orch_session_issue_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet 'Question_Reference' not found in 'JRCHC_SDOH HEL_Report 2452_ran 020124DeIdent.xlsx' (available: JRCHC_SDOH HEL_Report 2452_ran )","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/JRCHC_SDOH HEL_Report 2452_ran 020124DeIdent.xlsx"},
{"session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","orch_session_issue_id":"7ef8bdeb-fd56-5eb9-a09b-ef15ce18dc49","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet 'Answer_Reference' not found in 'JRCHC_SDOH HEL_Report 2452_ran 020124DeIdent.xlsx' (available: JRCHC_SDOH HEL_Report 2452_ran )","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/JRCHC_SDOH HEL_Report 2452_ran 020124DeIdent.xlsx"},
{"session_entry_id":"99e72a60-96ab-5ef1-a3af-3e7759777664","orch_session_issue_id":"e36daa69-3c63-5384-b6a7-03fa3b00641d","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet 'Admin_Demographic' not found in 'jrchc-hrsn-file-spec.xlsx' (available: Original Report, HeL LOINC Mapping)","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/jrchc-hrsn-file-spec.xlsx"},
{"session_entry_id":"89f7ec04-277a-5799-afaa-a70d0f2a8ed5","orch_session_issue_id":"c60cf3db-b1bf-5103-b278-b0c128ce924a","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet 'Screening' not found in 'jrchc-hrsn-file-spec.xlsx' (available: Original Report, HeL LOINC Mapping)","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/jrchc-hrsn-file-spec.xlsx"},
{"session_entry_id":"b2a7c7e8-5ffe-5f28-8112-4eb7abb6397f","orch_session_issue_id":"b10e248d-8c94-59ec-83fc-a1249dd3b111","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet 'QE_Admin_Data' not found in 'jrchc-hrsn-file-spec.xlsx' (available: Original Report, HeL LOINC Mapping)","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/jrchc-hrsn-file-spec.xlsx"},
{"session_entry_id":"5222b730-9add-5b52-b0c9-6f2506b0af9d","orch_session_issue_id":"fa7874f6-f848-572b-a9ab-9db4c8d5e959","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet 'Question_Reference' not found in 'jrchc-hrsn-file-spec.xlsx' (available: Original Report, HeL LOINC Mapping)","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/jrchc-hrsn-file-spec.xlsx"},
{"session_entry_id":"c302047e-21cf-5059-a32c-e81a9bd3a9b9","orch_session_issue_id":"3252fee6-3a9a-5f4c-81c6-739201046d79","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet 'Answer_Reference' not found in 'jrchc-hrsn-file-spec.xlsx' (available: Original Report, HeL LOINC Mapping)","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/jrchc-hrsn-file-spec.xlsx"},
{"session_entry_id":"78d6a904-035e-54ae-8ac2-ca5cdf3f75f7","orch_session_issue_id":"9860873a-c387-5d98-9930-4ff296eb7192","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet 'Admin_Demographic' not found in 'synthetic-fail-excel-01.xlsx' (available: Sheet1)","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx"},
{"session_entry_id":"d5d6e25d-81b4-5f98-8b91-ea2dbc155a9c","orch_session_issue_id":"46171763-bd21-57a8-a403-0785f72643cf","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet 'Screening' not found in 'synthetic-fail-excel-01.xlsx' (available: Sheet1)","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx"},
{"session_entry_id":"4971a2f5-06a3-5898-823d-364145d3b9a5","orch_session_issue_id":"c2c0cbca-70cb-54f6-9dc7-66b47c4f3157","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet 'QE_Admin_Data' not found in 'synthetic-fail-excel-01.xlsx' (available: Sheet1)","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx"},
{"session_entry_id":"8640a4b5-53ef-506e-bcde-83f00315d4b2","orch_session_issue_id":"544998d3-58c5-5f65-9dc8-9f998508495f","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet 'Question_Reference' not found in 'synthetic-fail-excel-01.xlsx' (available: Sheet1)","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx"},
{"session_entry_id":"0adb81bc-3df2-5f86-99cc-2d20e1dd5efd","orch_session_issue_id":"10d0290c-b2eb-581e-b627-b5b8fcbb830f","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet 'Answer_Reference' not found in 'synthetic-fail-excel-01.xlsx' (available: Sheet1)","invalid_value":"support/assurance/ahc-hrsn-elt/screening/synthetic-content/synthetic-fail-excel-01.xlsx"}]

```
No STDERR emitted by `ingest`.

    

## ensureContent

```sql
-- preambleSQL
SET autoinstall_known_extensions=true;
SET autoload_known_extensions=true;
-- end preambleSQL
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('0626c65d-bfe1-5eba-8a88-316343d5a123', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '8b7c669c-1795-5f6b-8f3a-3e502b74c628', 'INGESTED_CSV', 'ATTEMPT_CSV_ASSURANCE', NULL, 'AdminDemographicCsvFileIngestSource.assuranceSQL', (CURRENT_TIMESTAMP), NULL);

WITH mandatory_value AS (
    SELECT 'FIRST_NAME' AS issue_column,
           "FIRST_NAME" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "admin_demographics_20240307"
     WHERE "FIRST_NAME" IS NULL
        OR TRIM("FIRST_NAME") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
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
      FROM "admin_demographics_20240307"
     WHERE "FIRST_NAME" NOT SIMILAR TO '^[A-Za-z]+$'
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
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
      FROM "admin_demographics_20240307"
     WHERE "MIDDLE_NAME" NOT SIMILAR TO '^[A-Za-z]+$'
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
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
      FROM "admin_demographics_20240307"
     WHERE "LAST_NAME" IS NULL
        OR TRIM("LAST_NAME") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
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
      FROM "admin_demographics_20240307"
     WHERE "LAST_NAME" NOT SIMILAR TO '^[A-Za-z]+$'
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
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
      FROM "admin_demographics_20240307"
     WHERE "ADMINISTRATIVE_SEX_CODE" IS NULL
        OR TRIM("ADMINISTRATIVE_SEX_CODE") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH valid_administrative_sex_code_in_all_rows AS (
    SELECT 'ADMINISTRATIVE_SEX_CODE' AS issue_column,
           sr."ADMINISTRATIVE_SEX_CODE" AS invalid_value,
           sr.src_file_row_number AS issue_row
      FROM admin_demographics_20240307 sr
      LEFT JOIN administrative_sex_reference ref
      ON UPPER(sr."ADMINISTRATIVE_SEX_CODE") = UPPER(ref.ADMINISTRATIVE_SEX_CODE)
     WHERE sr."ADMINISTRATIVE_SEX_CODE" IS NOT NULL
      AND ref.ADMINISTRATIVE_SEX_CODE IS NULL
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Invalid ADMINISTRATIVE SEX CODE',
           issue_row,
           issue_column,
           invalid_value,
           'Invalid ADMINISTRATIVE SEX CODE "' || invalid_value || '" found in ' || issue_column,
           'Validate ADMINISTRATIVE SEX CODE with administrative sex reference data'
      FROM valid_administrative_sex_code_in_all_rows;
WITH valid_administrative_sex_code_description_in_all_rows AS (
    SELECT 'ADMINISTRATIVE_SEX_CODE_DESCRIPTION' AS issue_column,
           sr."ADMINISTRATIVE_SEX_CODE_DESCRIPTION" AS invalid_value,
           sr.src_file_row_number AS issue_row
      FROM admin_demographics_20240307 sr
      LEFT JOIN administrative_sex_reference ref
      ON UPPER(sr."ADMINISTRATIVE_SEX_CODE_DESCRIPTION") = UPPER(ref.ADMINISTRATIVE_SEX_CODE_DESCRIPTION)
     WHERE sr."ADMINISTRATIVE_SEX_CODE_DESCRIPTION" IS NOT NULL
      AND ref.ADMINISTRATIVE_SEX_CODE_DESCRIPTION IS NULL
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Invalid ADMINISTRATIVE SEX CODE DESCRIPTION',
           issue_row,
           issue_column,
           invalid_value,
           'Invalid ADMINISTRATIVE SEX CODE DESCRIPTION "' || invalid_value || '" found in ' || issue_column,
           'Validate ADMINISTRATIVE SEX CODE DESCRIPTION with administrative sex reference data'
      FROM valid_administrative_sex_code_description_in_all_rows;
WITH valid_administrative_sex_code_system_in_all_rows AS (
    SELECT 'ADMINISTRATIVE_SEX_CODE_SYSTEM' AS issue_column,
           sr."ADMINISTRATIVE_SEX_CODE_SYSTEM" AS invalid_value,
           sr.src_file_row_number AS issue_row
      FROM admin_demographics_20240307 sr
      LEFT JOIN administrative_sex_reference ref
      ON UPPER(sr."ADMINISTRATIVE_SEX_CODE_SYSTEM") = UPPER(ref.ADMINISTRATIVE_SEX_CODE_SYSTEM)
     WHERE sr."ADMINISTRATIVE_SEX_CODE_SYSTEM" IS NOT NULL
      AND ref.ADMINISTRATIVE_SEX_CODE_SYSTEM IS NULL
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Invalid ADMINISTRATIVE SEX CODE SYSTEM',
           issue_row,
           issue_column,
           invalid_value,
           'Invalid ADMINISTRATIVE SEX CODE SYSTEM "' || invalid_value || '" found in ' || issue_column,
           'Validate ADMINISTRATIVE SEX CODE SYSTEM with administrative sex reference data'
      FROM valid_administrative_sex_code_system_in_all_rows;
WITH valid_field_combination_in_all_rows AS (
  SELECT 	'ADMINISTRATIVE_SEX_CODE' AS issue_column,
      tbl."ADMINISTRATIVE_SEX_CODE" AS invalid_value,
      tbl."ADMINISTRATIVE_SEX_CODE_DESCRIPTION" AS dependent_value,
      tbl.src_file_row_number AS issue_row
  FROM admin_demographics_20240307  tbl
  WHERE tbl."ADMINISTRATIVE_SEX_CODE" is not null
  and tbl."ADMINISTRATIVE_SEX_CODE_DESCRIPTION" is not null
  and NOT EXISTS ( SELECT "ADMINISTRATIVE_SEX_CODE_DESCRIPTION" FROM administrative_sex_reference WHERE UPPER(tbl."ADMINISTRATIVE_SEX_CODE_DESCRIPTION") = UPPER("ADMINISTRATIVE_SEX_CODE_DESCRIPTION") AND UPPER(tbl."ADMINISTRATIVE_SEX_CODE") = UPPER("ADMINISTRATIVE_SEX_CODE"))
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Combination Not Matching',
           issue_row,
           issue_column,
           invalid_value,
           'Invalid value "' || invalid_value || '" found in ' || issue_column,
           'The ADMINISTRATIVE_SEX_CODE "' || invalid_value || '" of ADMINISTRATIVE_SEX_CODE_DESCRIPTION "' || dependent_value || '" is not matching with the ADMINISTRATIVE_SEX_CODE of ADMINISTRATIVE_SEX_CODE_DESCRIPTION in reference data'
      FROM valid_field_combination_in_all_rows;
WITH valid_field_combination_in_all_rows AS (
  SELECT 	'ADMINISTRATIVE_SEX_CODE_DESCRIPTION' AS issue_column,
      tbl."ADMINISTRATIVE_SEX_CODE_DESCRIPTION" AS invalid_value,
      tbl."ADMINISTRATIVE_SEX_CODE" AS dependent_value,
      tbl.src_file_row_number AS issue_row
  FROM admin_demographics_20240307  tbl
  WHERE tbl."ADMINISTRATIVE_SEX_CODE_DESCRIPTION" is not null
  and tbl."ADMINISTRATIVE_SEX_CODE" is not null
  and NOT EXISTS ( SELECT "ADMINISTRATIVE_SEX_CODE" FROM administrative_sex_reference WHERE UPPER(tbl."ADMINISTRATIVE_SEX_CODE") = UPPER("ADMINISTRATIVE_SEX_CODE") AND UPPER(tbl."ADMINISTRATIVE_SEX_CODE_DESCRIPTION") = UPPER("ADMINISTRATIVE_SEX_CODE_DESCRIPTION"))
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Combination Not Matching',
           issue_row,
           issue_column,
           invalid_value,
           'Invalid value "' || invalid_value || '" found in ' || issue_column,
           'The ADMINISTRATIVE_SEX_CODE_DESCRIPTION "' || invalid_value || '" of ADMINISTRATIVE_SEX_CODE "' || dependent_value || '" is not matching with the ADMINISTRATIVE_SEX_CODE_DESCRIPTION of ADMINISTRATIVE_SEX_CODE in reference data'
      FROM valid_field_combination_in_all_rows;
WITH valid_sex_at_birth_code_in_all_rows AS (
    SELECT 'SEX_AT_BIRTH_CODE' AS issue_column,
           sr."SEX_AT_BIRTH_CODE" AS invalid_value,
           sr.src_file_row_number AS issue_row
      FROM admin_demographics_20240307 sr
      LEFT JOIN sex_at_birth_reference ref
      ON UPPER(sr.SEX_AT_BIRTH_CODE) = UPPER(ref.SEX_AT_BIRTH_CODE)
     WHERE sr.SEX_AT_BIRTH_CODE IS NOT NULL
      AND ref.SEX_AT_BIRTH_CODE IS NULL
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Invalid SEX AT BIRTH CODE',
           issue_row,
           issue_column,
           invalid_value,
           'Invalid SEX AT BIRTH CODE "' || invalid_value || '" found in ' || issue_column,
           'Validate SEX AT BIRTH CODE with sex at birth reference data'
      FROM valid_sex_at_birth_code_in_all_rows;
WITH valid_sex_at_birth_code_description_in_all_rows AS (
    SELECT 'SEX_AT_BIRTH_CODE_DESCRIPTION' AS issue_column,
           sr."SEX_AT_BIRTH_CODE_DESCRIPTION" AS invalid_value,
           sr.src_file_row_number AS issue_row
      FROM admin_demographics_20240307 sr
      LEFT JOIN sex_at_birth_reference ref
      ON UPPER(sr.SEX_AT_BIRTH_CODE_DESCRIPTION) = UPPER(ref.SEX_AT_BIRTH_CODE_DESCRIPTION)
     WHERE sr.SEX_AT_BIRTH_CODE_DESCRIPTION IS NOT NULL
      AND ref.SEX_AT_BIRTH_CODE_DESCRIPTION IS NULL
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Invalid SEX_AT_BIRTH_CODE_DESCRIPTION',
           issue_row,
           issue_column,
           invalid_value,
           'Invalid SEX_AT_BIRTH_CODE_DESCRIPTION "' || invalid_value || '" found in ' || issue_column,
           'Validate SEX_AT_BIRTH_CODE_DESCRIPTION with sex at birth reference data'
      FROM valid_sex_at_birth_code_description_in_all_rows;
WITH valid_sex_at_birth_code_system_in_all_rows AS (
    SELECT 'SEX_AT_BIRTH_CODE_SYSTEM' AS issue_column,
           sr."SEX_AT_BIRTH_CODE_SYSTEM" AS invalid_value,
           sr.src_file_row_number AS issue_row
      FROM admin_demographics_20240307 sr
      LEFT JOIN sex_at_birth_reference ref
      ON UPPER(sr.SEX_AT_BIRTH_CODE_SYSTEM) = UPPER(ref.SEX_AT_BIRTH_CODE_SYSTEM)
     WHERE sr.SEX_AT_BIRTH_CODE_SYSTEM IS NOT NULL
      AND ref.SEX_AT_BIRTH_CODE_SYSTEM IS NULL
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Invalid SEX AT BIRTH CODE SYSTEM',
           issue_row,
           issue_column,
           invalid_value,
           'Invalid SEX AT BIRTH CODE SYSTEM "' || invalid_value || '" found in ' || issue_column,
           'Validate SEX AT BIRTH CODE SYSTEM with sex at birth reference data'
      FROM valid_sex_at_birth_code_system_in_all_rows;
WITH valid_field_combination_in_all_rows AS (
  SELECT 	'SEX_AT_BIRTH_CODE' AS issue_column,
      tbl."SEX_AT_BIRTH_CODE" AS invalid_value,
      tbl."SEX_AT_BIRTH_CODE_DESCRIPTION" AS dependent_value,
      tbl.src_file_row_number AS issue_row
  FROM admin_demographics_20240307  tbl
  WHERE tbl."SEX_AT_BIRTH_CODE" is not null
  and tbl."SEX_AT_BIRTH_CODE_DESCRIPTION" is not null
  and NOT EXISTS ( SELECT "SEX_AT_BIRTH_CODE_DESCRIPTION" FROM sex_at_birth_reference WHERE UPPER(tbl."SEX_AT_BIRTH_CODE_DESCRIPTION") = UPPER("SEX_AT_BIRTH_CODE_DESCRIPTION") AND UPPER(tbl."SEX_AT_BIRTH_CODE") = UPPER("SEX_AT_BIRTH_CODE"))
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Combination Not Matching',
           issue_row,
           issue_column,
           invalid_value,
           'Invalid value "' || invalid_value || '" found in ' || issue_column,
           'The SEX_AT_BIRTH_CODE "' || invalid_value || '" of SEX_AT_BIRTH_CODE_DESCRIPTION "' || dependent_value || '" is not matching with the SEX_AT_BIRTH_CODE of SEX_AT_BIRTH_CODE_DESCRIPTION in reference data'
      FROM valid_field_combination_in_all_rows;
WITH valid_field_combination_in_all_rows AS (
  SELECT 	'SEX_AT_BIRTH_CODE_DESCRIPTION' AS issue_column,
      tbl."SEX_AT_BIRTH_CODE_DESCRIPTION" AS invalid_value,
      tbl."SEX_AT_BIRTH_CODE" AS dependent_value,
      tbl.src_file_row_number AS issue_row
  FROM admin_demographics_20240307  tbl
  WHERE tbl."SEX_AT_BIRTH_CODE_DESCRIPTION" is not null
  and tbl."SEX_AT_BIRTH_CODE" is not null
  and NOT EXISTS ( SELECT "SEX_AT_BIRTH_CODE" FROM sex_at_birth_reference WHERE UPPER(tbl."SEX_AT_BIRTH_CODE") = UPPER("SEX_AT_BIRTH_CODE") AND UPPER(tbl."SEX_AT_BIRTH_CODE_DESCRIPTION") = UPPER("SEX_AT_BIRTH_CODE_DESCRIPTION"))
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Combination Not Matching',
           issue_row,
           issue_column,
           invalid_value,
           'Invalid value "' || invalid_value || '" found in ' || issue_column,
           'The SEX_AT_BIRTH_CODE_DESCRIPTION "' || invalid_value || '" of SEX_AT_BIRTH_CODE "' || dependent_value || '" is not matching with the SEX_AT_BIRTH_CODE_DESCRIPTION of SEX_AT_BIRTH_CODE in reference data'
      FROM valid_field_combination_in_all_rows;
WITH mandatory_value AS (
    SELECT 'PAT_BIRTH_DATE' AS issue_column,
           "PAT_BIRTH_DATE" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "admin_demographics_20240307"
     WHERE "PAT_BIRTH_DATE" IS NULL
        OR TRIM("PAT_BIRTH_DATE") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH valid_date_time_in_all_rows AS (
    SELECT 'PAT_BIRTH_DATE' AS issue_column,
           "PAT_BIRTH_DATE" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "admin_demographics_20240307"
     WHERE "PAT_BIRTH_DATE" IS NOT NULL
       AND TRY_CAST("PAT_BIRTH_DATE" AS TIMESTAMP) IS NULL
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Invalid Date',
           issue_row,
           issue_column,
           invalid_value,
           'Invalid timestamp "' || invalid_value || '" found in ' || issue_column,
           'Please be sure to provide both a valid date and time.'
      FROM valid_date_time_in_all_rows;
WITH mandatory_value AS (
    SELECT 'CITY' AS issue_column,
           "CITY" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "admin_demographics_20240307"
     WHERE "CITY" IS NULL
        OR TRIM("CITY") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
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
      FROM "admin_demographics_20240307"
     WHERE "STATE" IS NULL
        OR TRIM("STATE") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
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
      FROM "admin_demographics_20240307"
     WHERE "STATE" NOT IN ('NY', 'New York')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
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
      FROM "admin_demographics_20240307"
     WHERE "ZIP" IS NULL
        OR TRIM("ZIP") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
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
      FROM "admin_demographics_20240307"
     WHERE "ZIP" NOT SIMILAR TO '^\d{5}(\d{4})?$'
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Pattern Mismatch',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' does not match the pattern ^\d{5}(\d{4})?$',
           'Follow the pattern ^\d{5}(\d{4})?$ in ' || issue_column
      FROM pattern;
WITH valid_integer_alphanumeric_string_in_all_rows AS (
  SELECT 'ADDRESS1' AS issue_column,
    t."ADDRESS1" AS invalid_value,
    t.src_file_row_number AS issue_row
  FROM admin_demographics_20240307 t
  WHERE t."ADDRESS1" SIMILAR TO '[0-9]+'
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Data Type Mismatch',
           issue_row,
           issue_column,
           invalid_value,
           'Invalid value "' || invalid_value || '" found in ' || issue_column,
           'Invalid string of numbers found'
      FROM valid_integer_alphanumeric_string_in_all_rows;
WITH valid_address1_or_medicaid_cin_in_all_rows AS (
    SELECT 'ADDRESS1' AS issue_column,
           ADDRESS1 AS invalid_value,
           src_file_row_number AS issue_row
      FROM admin_demographics_20240307
      WHERE (ADDRESS1 IS NULL OR TRIM("ADDRESS1") = '') AND (MEDICAID_CIN IS NULL OR TRIM("MEDICAID_CIN") = '')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Invalid ADDRESS1',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field "' || issue_column || '" is empty',
           'The required field value ADDRESS1 is missing. This is required due to the absence of the MEDICAID_CIN.'
      FROM valid_address1_or_medicaid_cin_in_all_rows;
WITH valid_gender_identity_code_in_all_rows AS (
    SELECT 'GENDER_IDENTITY_CODE' AS issue_column,
           sr."GENDER_IDENTITY_CODE" AS invalid_value,
           sr.src_file_row_number AS issue_row
      FROM admin_demographics_20240307 sr
      LEFT JOIN gender_identity_reference ref
      ON UPPER(sr.GENDER_IDENTITY_CODE) = UPPER(ref.GENDER_IDENTITY_CODE)
     WHERE sr.GENDER_IDENTITY_CODE IS NOT NULL
      AND ref.GENDER_IDENTITY_CODE IS NULL
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Invalid GENDER IDENTITY CODE',
           issue_row,
           issue_column,
           invalid_value,
           'Invalid GENDER IDENTITY CODE "' || invalid_value || '" found in ' || issue_column,
           'Validate GENDER IDENTITY CODE with gender identity reference data'
      FROM valid_gender_identity_code_in_all_rows;
WITH allowed_values AS (
    SELECT 'GENDER_IDENTITY_CODE_SYSTEM_NAME' AS issue_column,
           "GENDER_IDENTITY_CODE_SYSTEM_NAME" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "admin_demographics_20240307"
     WHERE "GENDER_IDENTITY_CODE_SYSTEM_NAME" NOT IN ('SNOMED-CT','SNOMED','http://snomed.info/sct')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''SNOMED-CT'',''SNOMED'',''http://snomed.info/sct'')',
           'Use only allowed values ''SNOMED-CT'',''SNOMED'',''http://snomed.info/sct'' in ' || issue_column
      FROM allowed_values;
WITH valid_field_combination_in_all_rows AS (
  SELECT 	'GENDER_IDENTITY_CODE' AS issue_column,
      tbl."GENDER_IDENTITY_CODE" AS invalid_value,
      tbl."GENDER_IDENTITY_CODE_DESCRIPTION" AS dependent_value,
      tbl.src_file_row_number AS issue_row
  FROM admin_demographics_20240307  tbl
  WHERE tbl."GENDER_IDENTITY_CODE" is not null
  and tbl."GENDER_IDENTITY_CODE_DESCRIPTION" is not null
  and NOT EXISTS ( SELECT "GENDER_IDENTITY_CODE_DESCRIPTION" FROM gender_identity_reference WHERE UPPER(tbl."GENDER_IDENTITY_CODE_DESCRIPTION") = UPPER("GENDER_IDENTITY_CODE_DESCRIPTION") AND UPPER(tbl."GENDER_IDENTITY_CODE") = UPPER("GENDER_IDENTITY_CODE"))
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Combination Not Matching',
           issue_row,
           issue_column,
           invalid_value,
           'Invalid value "' || invalid_value || '" found in ' || issue_column,
           'The GENDER_IDENTITY_CODE "' || invalid_value || '" of GENDER_IDENTITY_CODE_DESCRIPTION "' || dependent_value || '" is not matching with the GENDER_IDENTITY_CODE of GENDER_IDENTITY_CODE_DESCRIPTION in reference data'
      FROM valid_field_combination_in_all_rows;
WITH valid_field_combination_in_all_rows AS (
  SELECT 	'GENDER_IDENTITY_CODE_DESCRIPTION' AS issue_column,
      tbl."GENDER_IDENTITY_CODE_DESCRIPTION" AS invalid_value,
      tbl."GENDER_IDENTITY_CODE" AS dependent_value,
      tbl.src_file_row_number AS issue_row
  FROM admin_demographics_20240307  tbl
  WHERE tbl."GENDER_IDENTITY_CODE_DESCRIPTION" is not null
  and tbl."GENDER_IDENTITY_CODE" is not null
  and NOT EXISTS ( SELECT "GENDER_IDENTITY_CODE" FROM gender_identity_reference WHERE UPPER(tbl."GENDER_IDENTITY_CODE") = UPPER("GENDER_IDENTITY_CODE") AND UPPER(tbl."GENDER_IDENTITY_CODE_DESCRIPTION") = UPPER("GENDER_IDENTITY_CODE_DESCRIPTION"))
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Combination Not Matching',
           issue_row,
           issue_column,
           invalid_value,
           'Invalid value "' || invalid_value || '" found in ' || issue_column,
           'The GENDER_IDENTITY_CODE_DESCRIPTION "' || invalid_value || '" of GENDER_IDENTITY_CODE "' || dependent_value || '" is not matching with the GENDER_IDENTITY_CODE_DESCRIPTION of GENDER_IDENTITY_CODE in reference data'
      FROM valid_field_combination_in_all_rows;
WITH valid_sexual_orientation_code_in_all_rows AS (
    SELECT 'SEXUAL_ORIENTATION_CODE' AS issue_column,
           sr."SEXUAL_ORIENTATION_CODE" AS invalid_value,
           sr.src_file_row_number AS issue_row
      FROM admin_demographics_20240307 sr
      LEFT JOIN sexual_orientation_reference ref
      ON UPPER(sr.SEXUAL_ORIENTATION_CODE) = UPPER(ref.SEXUAL_ORIENTATION_CODE)
     WHERE sr.SEXUAL_ORIENTATION_CODE IS NOT NULL
      AND ref.SEXUAL_ORIENTATION_CODE IS NULL
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Invalid SEXUAL ORIENTATION CODE',
           issue_row,
           issue_column,
           invalid_value,
           'Invalid SEXUAL ORIENTATION CODE "' || invalid_value || '" found in ' || issue_column,
           'Validate SEXUAL ORIENTATION CODE with sexual orientation reference data'
      FROM valid_sexual_orientation_code_in_all_rows;
WITH valid_sexual_orientation_description_in_all_rows AS (
    SELECT 'SEXUAL_ORIENTATION_DESCRIPTION' AS issue_column,
           sr."SEXUAL_ORIENTATION_DESCRIPTION" AS invalid_value,
           sr.src_file_row_number AS issue_row
      FROM admin_demographics_20240307 sr
      LEFT JOIN sexual_orientation_reference ref
      ON UPPER(sr.SEXUAL_ORIENTATION_DESCRIPTION) = UPPER(ref.SEXUAL_ORIENTATION_CODE_DESCRIPTION)
     WHERE sr.SEXUAL_ORIENTATION_DESCRIPTION IS NOT NULL
      AND ref.SEXUAL_ORIENTATION_CODE_DESCRIPTION IS NULL
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Invalid SEXUAL ORIENTATION CODE DESCRIPTION',
           issue_row,
           issue_column,
           invalid_value,
           'Invalid SEXUAL ORIENTATION CODE DESCRIPTION "' || invalid_value || '" found in ' || issue_column,
           'Validate SEXUAL ORIENTATION CODE DESCRIPTION with sexual orientation reference data'
      FROM valid_sexual_orientation_description_in_all_rows;
WITH valid_field_combination_in_all_rows AS (
  SELECT 	'SEXUAL_ORIENTATION_CODE' AS issue_column,
      tbl."SEXUAL_ORIENTATION_CODE" AS invalid_value,
      tbl."SEXUAL_ORIENTATION_DESCRIPTION" AS dependent_value,
      tbl.src_file_row_number AS issue_row
  FROM admin_demographics_20240307  tbl
  WHERE tbl."SEXUAL_ORIENTATION_CODE" is not null
  and tbl."SEXUAL_ORIENTATION_DESCRIPTION" is not null
  and NOT EXISTS ( SELECT "SEXUAL_ORIENTATION_CODE_DESCRIPTION" FROM sexual_orientation_reference WHERE UPPER(tbl."SEXUAL_ORIENTATION_DESCRIPTION") = UPPER("SEXUAL_ORIENTATION_CODE_DESCRIPTION") AND UPPER(tbl."SEXUAL_ORIENTATION_CODE") = UPPER("SEXUAL_ORIENTATION_CODE"))
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Combination Not Matching',
           issue_row,
           issue_column,
           invalid_value,
           'Invalid value "' || invalid_value || '" found in ' || issue_column,
           'The SEXUAL_ORIENTATION_CODE "' || invalid_value || '" of SEXUAL_ORIENTATION_DESCRIPTION "' || dependent_value || '" is not matching with the SEXUAL_ORIENTATION_CODE of SEXUAL_ORIENTATION_DESCRIPTION in reference data'
      FROM valid_field_combination_in_all_rows;
WITH valid_field_combination_in_all_rows AS (
  SELECT 	'SEXUAL_ORIENTATION_DESCRIPTION' AS issue_column,
      tbl."SEXUAL_ORIENTATION_DESCRIPTION" AS invalid_value,
      tbl."SEXUAL_ORIENTATION_CODE" AS dependent_value,
      tbl.src_file_row_number AS issue_row
  FROM admin_demographics_20240307  tbl
  WHERE tbl."SEXUAL_ORIENTATION_DESCRIPTION" is not null
  and tbl."SEXUAL_ORIENTATION_CODE" is not null
  and NOT EXISTS ( SELECT "SEXUAL_ORIENTATION_CODE" FROM sexual_orientation_reference WHERE UPPER(tbl."SEXUAL_ORIENTATION_CODE") = UPPER("SEXUAL_ORIENTATION_CODE") AND UPPER(tbl."SEXUAL_ORIENTATION_DESCRIPTION") = UPPER("SEXUAL_ORIENTATION_CODE_DESCRIPTION"))
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Combination Not Matching',
           issue_row,
           issue_column,
           invalid_value,
           'Invalid value "' || invalid_value || '" found in ' || issue_column,
           'The SEXUAL_ORIENTATION_DESCRIPTION "' || invalid_value || '" of SEXUAL_ORIENTATION_CODE "' || dependent_value || '" is not matching with the SEXUAL_ORIENTATION_DESCRIPTION of SEXUAL_ORIENTATION_CODE in reference data'
      FROM valid_field_combination_in_all_rows;
WITH allowed_values AS (
    SELECT 'SEXUAL_ORIENTATION_CODE_SYSTEM_NAME' AS issue_column,
           "SEXUAL_ORIENTATION_CODE_SYSTEM_NAME" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "admin_demographics_20240307"
     WHERE "SEXUAL_ORIENTATION_CODE_SYSTEM_NAME" NOT IN ('SNOMED-CT','SNOMED','http://snomed.info/sct')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''SNOMED-CT'',''SNOMED'',''http://snomed.info/sct'')',
           'Use only allowed values ''SNOMED-CT'',''SNOMED'',''http://snomed.info/sct'' in ' || issue_column
      FROM allowed_values;
WITH valid_ethnicity_code_in_all_rows AS (
    SELECT 'ETHNICITY_CODE' AS issue_column,
           ad."ETHNICITY_CODE" AS invalid_value,
           ad.src_file_row_number AS issue_row
      FROM admin_demographics_20240307 ad
      LEFT JOIN ethnicity_reference ref
      ON UPPER(CAST(ad."ETHNICITY_CODE" AS VARCHAR)) = UPPER(CAST(ref."Concept Code" AS VARCHAR))
     WHERE ad."ETHNICITY_CODE" IS NOT NULL
      AND ref."Concept Code" IS NULL
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Invalid ETHNICITY CODE',
           issue_row,
           issue_column,
           invalid_value,
           'Invalid ETHNICITY CODE "' || invalid_value || '" found in ' || issue_column,
           'Validate ETHNICITY CODE with ethnicity reference data'
      FROM valid_ethnicity_code_in_all_rows;
WITH valid_ethnicity_code_description_in_all_rows AS (
    SELECT 'ETHNICITY_CODE_DESCRIPTION' AS issue_column,
           ad."ETHNICITY_CODE_DESCRIPTION" AS invalid_value,
           ad.src_file_row_number AS issue_row
      FROM admin_demographics_20240307 ad
      LEFT JOIN ethnicity_reference ref
      ON UPPER(CAST(ad."ETHNICITY_CODE_DESCRIPTION" AS VARCHAR)) = UPPER(CAST(ref."Concept Name" AS VARCHAR))
     WHERE ad."ETHNICITY_CODE_DESCRIPTION" IS NOT NULL
      AND ref."Concept Name" IS NULL
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Invalid ETHNICITY CODE DESCRIPTION',
           issue_row,
           issue_column,
           invalid_value,
           'Invalid ETHNICITY CODE DESCRIPTION "' || invalid_value || '" found in ' || issue_column,
           'Validate ETHNICITY CODE DESCRIPTION with ethnicity reference data'
      FROM valid_ethnicity_code_description_in_all_rows;
WITH valid_field_combination_in_all_rows AS (
  SELECT 	'ETHNICITY_CODE' AS issue_column,
      tbl."ETHNICITY_CODE" AS invalid_value,
      tbl."ETHNICITY_CODE_DESCRIPTION" AS dependent_value,
      tbl.src_file_row_number AS issue_row
  FROM admin_demographics_20240307  tbl
  WHERE tbl."ETHNICITY_CODE" is not null
  and tbl."ETHNICITY_CODE_DESCRIPTION" is not null
  and NOT EXISTS ( SELECT "Concept Name" FROM ethnicity_reference WHERE UPPER(tbl."ETHNICITY_CODE_DESCRIPTION") = UPPER("Concept Name") AND UPPER(tbl."ETHNICITY_CODE") = UPPER("Concept Code"))
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Combination Not Matching',
           issue_row,
           issue_column,
           invalid_value,
           'Invalid value "' || invalid_value || '" found in ' || issue_column,
           'The ETHNICITY_CODE "' || invalid_value || '" of ETHNICITY_CODE_DESCRIPTION "' || dependent_value || '" is not matching with the ETHNICITY_CODE of ETHNICITY_CODE_DESCRIPTION in reference data'
      FROM valid_field_combination_in_all_rows;
WITH valid_field_combination_in_all_rows AS (
  SELECT 	'ETHNICITY_CODE_DESCRIPTION' AS issue_column,
      tbl."ETHNICITY_CODE_DESCRIPTION" AS invalid_value,
      tbl."ETHNICITY_CODE" AS dependent_value,
      tbl.src_file_row_number AS issue_row
  FROM admin_demographics_20240307  tbl
  WHERE tbl."ETHNICITY_CODE_DESCRIPTION" is not null
  and tbl."ETHNICITY_CODE" is not null
  and NOT EXISTS ( SELECT "Concept Code" FROM ethnicity_reference WHERE UPPER(tbl."ETHNICITY_CODE") = UPPER("Concept Code") AND UPPER(tbl."ETHNICITY_CODE_DESCRIPTION") = UPPER("Concept Name"))
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Combination Not Matching',
           issue_row,
           issue_column,
           invalid_value,
           'Invalid value "' || invalid_value || '" found in ' || issue_column,
           'The ETHNICITY_CODE_DESCRIPTION "' || invalid_value || '" of ETHNICITY_CODE "' || dependent_value || '" is not matching with the ETHNICITY_CODE_DESCRIPTION of ETHNICITY_CODE in reference data'
      FROM valid_field_combination_in_all_rows;
WITH valid_race_code_in_all_rows AS (
    SELECT 'RACE_CODE' AS issue_column,
           ad."RACE_CODE" AS invalid_value,
           ad.src_file_row_number AS issue_row
      FROM admin_demographics_20240307 ad
      LEFT JOIN race_reference ref
      ON UPPER(CAST(ad."RACE_CODE" AS VARCHAR)) = UPPER(CAST(ref."Concept Code" AS VARCHAR))
     WHERE ad."RACE_CODE" IS NOT NULL
      AND ref."Concept Code" IS NULL
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Invalid RACE CODE',
           issue_row,
           issue_column,
           invalid_value,
           'Invalid RACE CODE "' || invalid_value || '" found in ' || issue_column,
           'Validate RACE CODE with race reference data'
      FROM valid_race_code_in_all_rows;
WITH valid_race_code_description_in_all_rows AS (
    SELECT 'RACE_CODE_DESCRIPTION' AS issue_column,
           ad."RACE_CODE_DESCRIPTION" AS invalid_value,
           ad.src_file_row_number AS issue_row
      FROM admin_demographics_20240307 ad
      LEFT JOIN race_reference ref
      ON UPPER(CAST(ad."RACE_CODE_DESCRIPTION" AS VARCHAR)) = UPPER(CAST(ref."Concept Name" AS VARCHAR))
     WHERE ad."RACE_CODE_DESCRIPTION" IS NOT NULL
      AND ref."Concept Name" IS NULL
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Invalid RACE CODE DESCRIPTION',
           issue_row,
           issue_column,
           invalid_value,
           'Invalid RACE CODE DESCRIPTION "' || invalid_value || '" found in ' || issue_column,
           'Validate RACE CODE DESCRIPTION with race reference data'
      FROM valid_race_code_description_in_all_rows;
WITH valid_field_combination_in_all_rows AS (
  SELECT 	'RACE_CODE' AS issue_column,
      tbl."RACE_CODE" AS invalid_value,
      tbl."RACE_CODE_DESCRIPTION" AS dependent_value,
      tbl.src_file_row_number AS issue_row
  FROM admin_demographics_20240307  tbl
  WHERE tbl."RACE_CODE" is not null
  and tbl."RACE_CODE_DESCRIPTION" is not null
  and NOT EXISTS ( SELECT "Concept Name" FROM race_reference WHERE UPPER(tbl."RACE_CODE_DESCRIPTION") = UPPER("Concept Name") AND UPPER(tbl."RACE_CODE") = UPPER("Concept Code"))
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Combination Not Matching',
           issue_row,
           issue_column,
           invalid_value,
           'Invalid value "' || invalid_value || '" found in ' || issue_column,
           'The RACE_CODE "' || invalid_value || '" of RACE_CODE_DESCRIPTION "' || dependent_value || '" is not matching with the RACE_CODE of RACE_CODE_DESCRIPTION in reference data'
      FROM valid_field_combination_in_all_rows;
WITH valid_field_combination_in_all_rows AS (
  SELECT 	'RACE_CODE_DESCRIPTION' AS issue_column,
      tbl."RACE_CODE_DESCRIPTION" AS invalid_value,
      tbl."RACE_CODE" AS dependent_value,
      tbl.src_file_row_number AS issue_row
  FROM admin_demographics_20240307  tbl
  WHERE tbl."RACE_CODE_DESCRIPTION" is not null
  and tbl."RACE_CODE" is not null
  and NOT EXISTS ( SELECT "Concept Code" FROM race_reference WHERE UPPER(tbl."RACE_CODE") = UPPER("Concept Code") AND UPPER(tbl."RACE_CODE_DESCRIPTION") = UPPER("Concept Name"))
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Combination Not Matching',
           issue_row,
           issue_column,
           invalid_value,
           'Invalid value "' || invalid_value || '" found in ' || issue_column,
           'The RACE_CODE_DESCRIPTION "' || invalid_value || '" of RACE_CODE "' || dependent_value || '" is not matching with the RACE_CODE_DESCRIPTION of RACE_CODE in reference data'
      FROM valid_field_combination_in_all_rows;
WITH allowed_values AS (
    SELECT 'RACE_CODE_SYSTEM_NAME' AS issue_column,
           "RACE_CODE_SYSTEM_NAME" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "admin_demographics_20240307"
     WHERE "RACE_CODE_SYSTEM_NAME" NOT IN ('CDC','CDCRE','urn:oid:2.16.840.1.113883.6.238')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''CDC'',''CDCRE'',''urn:oid:2.16.840.1.113883.6.238'')',
           'Use only allowed values ''CDC'',''CDCRE'',''urn:oid:2.16.840.1.113883.6.238'' in ' || issue_column
      FROM allowed_values;
WITH allowed_values AS (
    SELECT 'ETHNICITY_CODE_SYSTEM_NAME' AS issue_column,
           "ETHNICITY_CODE_SYSTEM_NAME" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "admin_demographics_20240307"
     WHERE "ETHNICITY_CODE_SYSTEM_NAME" NOT IN ('CDC','CDCRE','urn:oid:2.16.840.1.113883.6.238')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''CDC'',''CDCRE'',''urn:oid:2.16.840.1.113883.6.238'')',
           'Use only allowed values ''CDC'',''CDCRE'',''urn:oid:2.16.840.1.113883.6.238'' in ' || issue_column
      FROM allowed_values;
WITH mandatory_value AS (
    SELECT 'MPI_ID' AS issue_column,
           "MPI_ID" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "admin_demographics_20240307"
     WHERE "MPI_ID" IS NULL
        OR TRIM("MPI_ID") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
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
      FROM "admin_demographics_20240307"
     WHERE "PAT_MRN_ID" IS NULL
        OR TRIM("PAT_MRN_ID") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH valid_mpi_id_per_pat_mrn_id_in_all_rows AS (
    SELECT 'MPI_ID' AS issue_column,
      MPI_ID AS invalid_value,
      min(src_file_row_number) AS issue_row
    FROM admin_demographics_20240307
    GROUP BY MPI_ID
    HAVING COUNT(DISTINCT PAT_MRN_ID) > 1
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Invalid MPI_ID',
           issue_row,
           issue_column,
           invalid_value,
           'The unique field "' || issue_column || '" "' || invalid_value || '"is not unique per PAT MRN ID',
           'MPI_ID is not unique per PAT MRN ID.'
      FROM valid_mpi_id_per_pat_mrn_id_in_all_rows;
WITH mandatory_value AS (
    SELECT 'FACILITY_ID' AS issue_column,
           "FACILITY_ID" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "admin_demographics_20240307"
     WHERE "FACILITY_ID" IS NULL
        OR TRIM("FACILITY_ID") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
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
      FROM "admin_demographics_20240307"
     WHERE "MEDICAID_CIN" NOT SIMILAR TO '^[A-Za-z]{2}\d{5}[A-Za-z]$'
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Pattern Mismatch',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' does not match the pattern ^[A-Za-z]{2}\d{5}[A-Za-z]$',
           'Follow the pattern ^[A-Za-z]{2}\d{5}[A-Za-z]$ in ' || issue_column
      FROM pattern;
WITH valid_unique_medicaid_cin_per_mrn_in_all_rows AS (
  SELECT 'MEDICAID_CIN' AS issue_column,
          "MEDICAID_CIN" AS invalid_value,
          min(src_file_row_number) AS issue_row
    FROM admin_demographics_20240307
    WHERE MEDICAID_CIN IS NOT NULL
    GROUP BY pat_mrn_id, MEDICAID_CIN
    HAVING COUNT(*) > 1
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Invalid Unique Medicaid Cin Per Mrn',
           issue_row,
           issue_column,
           invalid_value,
           'Invalid Unique Medicaid Cin Per Mrn "' || invalid_value || '" found in ' || issue_column,
           'Validate Unique Medicaid Cin Per Mrn'
      FROM valid_unique_medicaid_cin_per_mrn_in_all_rows;
WITH valid_address1_or_medicaid_cin_in_all_rows AS (
    SELECT 'MEDICAID_CIN' AS issue_column,
           MEDICAID_CIN AS invalid_value,
           src_file_row_number AS issue_row
      FROM admin_demographics_20240307
      WHERE (MEDICAID_CIN IS NULL OR TRIM("MEDICAID_CIN") = '') AND (ADDRESS1 IS NULL OR TRIM("ADDRESS1") = '')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Invalid MEDICAID_CIN',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field "' || issue_column || '" is empty',
           'The required field value MEDICAID_CIN is missing. This is required due to the absence of the ADDRESS1.'
      FROM valid_address1_or_medicaid_cin_in_all_rows;
WITH mandatory_value AS (
    SELECT 'CONSENT' AS issue_column,
           "CONSENT" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "admin_demographics_20240307"
     WHERE "CONSENT" IS NULL
        OR TRIM("CONSENT") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
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
      FROM "admin_demographics_20240307"
     WHERE "CONSENT" NOT IN ('Yes','No','Y','N','Unknown','UNK')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''Yes'',''No'',''Y'',''N'',''Unknown'',''UNK'')',
           'Use only allowed values ''Yes'',''No'',''Y'',''N'',''Unknown'',''UNK'' in ' || issue_column
      FROM allowed_values;

INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('11b19c60-a371-5444-9831-cb06a48b442e', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '8b7c669c-1795-5f6b-8f3a-3e502b74c628', 'ATTEMPT_CSV_ASSURANCE', 'ASSURED_CSV', NULL, 'AdminDemographicCsvFileIngestSource.assuranceSQL', (CURRENT_TIMESTAMP), NULL);
    
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('6ec2d7d4-0366-56b5-8763-dd9d6361dce0', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '591191c7-f693-5957-8734-ac87151ca981', 'INGESTED_CSV', 'ATTEMPT_CSV_ASSURANCE', NULL, 'QeAdminDataCsvFileIngestSource.assuranceSQL', (CURRENT_TIMESTAMP), NULL);

WITH mandatory_value AS (
    SELECT 'PAT_MRN_ID' AS issue_column,
           "PAT_MRN_ID" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "qe_admin_data_20240307"
     WHERE "PAT_MRN_ID" IS NULL
        OR TRIM("PAT_MRN_ID") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '591191c7-f693-5957-8734-ac87151ca981',
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
      FROM "qe_admin_data_20240307"
     WHERE "FACILITY_ID" IS NULL
        OR TRIM("FACILITY_ID") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '591191c7-f693-5957-8734-ac87151ca981',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH valid_unique_facility_id_per_facility_in_all_rows AS (
  SELECT 'FACILITY_ID' AS issue_column,
    FACILITY_ID AS invalid_value,
    min(src_file_row_number) AS issue_row
  FROM qe_admin_data_20240307
  GROUP BY FACILITY_ID
  HAVING COUNT(DISTINCT FACILITY_LONG_NAME) > 1
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '591191c7-f693-5957-8734-ac87151ca981',
           'Invalid FACILITY_ID',
           issue_row,
           issue_column,
           invalid_value,
           'The unique field "' || issue_column || '" "' || invalid_value || '"is not unique per facility',
           'FACILITY_ID is not unique per facility.'
      FROM valid_unique_facility_id_per_facility_in_all_rows;
WITH mandatory_value AS (
    SELECT 'FACILITY_LONG_NAME' AS issue_column,
           "FACILITY_LONG_NAME" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "qe_admin_data_20240307"
     WHERE "FACILITY_LONG_NAME" IS NULL
        OR TRIM("FACILITY_LONG_NAME") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '591191c7-f693-5957-8734-ac87151ca981',
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
      FROM "qe_admin_data_20240307"
     WHERE "ORGANIZATION_TYPE" IS NULL
        OR TRIM("ORGANIZATION_TYPE") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '591191c7-f693-5957-8734-ac87151ca981',
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
      FROM "qe_admin_data_20240307"
     WHERE "ORGANIZATION_TYPE" NOT IN ('Hospital', 'DTC', 'SNF', 'SCN', 'CBO', 'OMH', 'OASAS', 'Practice', 'Article 36', 'Article 40', 'MCO')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '591191c7-f693-5957-8734-ac87151ca981',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''Hospital'', ''DTC'', ''SNF'', ''SCN'', ''CBO'', ''OMH'', ''OASAS'', ''Practice'', ''Article 36'', ''Article 40'', ''MCO'')',
           'Use only allowed values ''Hospital'', ''DTC'', ''SNF'', ''SCN'', ''CBO'', ''OMH'', ''OASAS'', ''Practice'', ''Article 36'', ''Article 40'', ''MCO'' in ' || issue_column
      FROM allowed_values;
WITH mandatory_value AS (
    SELECT 'FACILITY_ADDRESS1' AS issue_column,
           "FACILITY_ADDRESS1" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "qe_admin_data_20240307"
     WHERE "FACILITY_ADDRESS1" IS NULL
        OR TRIM("FACILITY_ADDRESS1") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '591191c7-f693-5957-8734-ac87151ca981',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH valid_unique_facility_address1_per_facility_in_all_rows AS (
  SELECT 'FACILITY_ADDRESS1' AS issue_column,
    FACILITY_ADDRESS1 AS invalid_value,
    min(src_file_row_number) AS issue_row
  FROM qe_admin_data_20240307
  GROUP BY FACILITY_ADDRESS1
  HAVING COUNT(DISTINCT FACILITY_LONG_NAME) > 1
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '591191c7-f693-5957-8734-ac87151ca981',
           'Invalid FACILITY_ADDRESS1',
           issue_row,
           issue_column,
           invalid_value,
           'The unique field "' || issue_column || '" "' || invalid_value || '"is not unique per facility',
           'FACILITY_ADDRESS1 is not unique per facility.'
      FROM valid_unique_facility_address1_per_facility_in_all_rows;
WITH valid_integer_alphanumeric_string_in_all_rows AS (
  SELECT 'FACILITY_ADDRESS1' AS issue_column,
    t."FACILITY_ADDRESS1" AS invalid_value,
    t.src_file_row_number AS issue_row
  FROM qe_admin_data_20240307 t
  WHERE t."FACILITY_ADDRESS1" SIMILAR TO '[0-9]+'
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '591191c7-f693-5957-8734-ac87151ca981',
           'Data Type Mismatch',
           issue_row,
           issue_column,
           invalid_value,
           'Invalid value "' || invalid_value || '" found in ' || issue_column,
           'Invalid string of numbers found'
      FROM valid_integer_alphanumeric_string_in_all_rows;
WITH mandatory_value AS (
    SELECT 'FACILITY_STATE' AS issue_column,
           "FACILITY_STATE" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "qe_admin_data_20240307"
     WHERE "FACILITY_STATE" IS NULL
        OR TRIM("FACILITY_STATE") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '591191c7-f693-5957-8734-ac87151ca981',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH allowed_values AS (
    SELECT 'FACILITY_STATE' AS issue_column,
           "FACILITY_STATE" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "qe_admin_data_20240307"
     WHERE "FACILITY_STATE" NOT IN ('NY', 'New York')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '591191c7-f693-5957-8734-ac87151ca981',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''NY'', ''New York'')',
           'Use only allowed values ''NY'', ''New York'' in ' || issue_column
      FROM allowed_values;
WITH mandatory_value AS (
    SELECT 'FACILITY_ZIP' AS issue_column,
           "FACILITY_ZIP" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "qe_admin_data_20240307"
     WHERE "FACILITY_ZIP" IS NULL
        OR TRIM("FACILITY_ZIP") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '591191c7-f693-5957-8734-ac87151ca981',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH pattern AS (
    SELECT 'FACILITY_ZIP' AS issue_column,
           "FACILITY_ZIP" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "qe_admin_data_20240307"
     WHERE "FACILITY_ZIP" NOT SIMILAR TO '^\d{5}(\d{4})?$'
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '591191c7-f693-5957-8734-ac87151ca981',
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
      FROM "qe_admin_data_20240307"
     WHERE "VISIT_PART_2_FLAG" IS NULL
        OR TRIM("VISIT_PART_2_FLAG") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '591191c7-f693-5957-8734-ac87151ca981',
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
      FROM "qe_admin_data_20240307"
     WHERE "VISIT_PART_2_FLAG" NOT IN ('Yes', 'No')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '591191c7-f693-5957-8734-ac87151ca981',
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
      FROM "qe_admin_data_20240307"
     WHERE "VISIT_OMH_FLAG" IS NULL
        OR TRIM("VISIT_OMH_FLAG") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '591191c7-f693-5957-8734-ac87151ca981',
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
      FROM "qe_admin_data_20240307"
     WHERE "VISIT_OMH_FLAG" NOT IN ('Yes', 'No')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '591191c7-f693-5957-8734-ac87151ca981',
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
      FROM "qe_admin_data_20240307"
     WHERE "VISIT_OPWDD_FLAG" IS NULL
        OR TRIM("VISIT_OPWDD_FLAG") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '591191c7-f693-5957-8734-ac87151ca981',
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
      FROM "qe_admin_data_20240307"
     WHERE "VISIT_OPWDD_FLAG" NOT IN ('Yes', 'No')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '591191c7-f693-5957-8734-ac87151ca981',
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
      FROM "qe_admin_data_20240307"
     WHERE "FACILITY_LONG_NAME" NOT SIMILAR TO '^[a-zA-Z\s]+$'
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '591191c7-f693-5957-8734-ac87151ca981',
           'Pattern Mismatch',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' does not match the pattern ^[a-zA-Z\s]+$',
           'Follow the pattern ^[a-zA-Z\s]+$ in ' || issue_column
      FROM pattern;

INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('3e774fb3-fc39-5ce3-9b1f-aa7dbb147319', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '591191c7-f693-5957-8734-ac87151ca981', 'ATTEMPT_CSV_ASSURANCE', 'ASSURED_CSV', NULL, 'QeAdminDataCsvFileIngestSource.assuranceSQL', (CURRENT_TIMESTAMP), NULL);
    
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('63d56427-0888-5164-bea5-3f122e5805fd', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '86b4a49e-7378-5159-9f41-b005208c31bc', 'INGESTED_CSV', 'ATTEMPT_CSV_ASSURANCE', NULL, 'ScreeningCsvFileIngestSource.assuranceSQL', (CURRENT_TIMESTAMP), NULL);


WITH mandatory_value AS (
    SELECT 'PAT_MRN_ID' AS issue_column,
           "PAT_MRN_ID" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "screening_20240307"
     WHERE "PAT_MRN_ID" IS NULL
        OR TRIM("PAT_MRN_ID") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '86b4a49e-7378-5159-9f41-b005208c31bc',
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
      FROM "screening_20240307"
     WHERE "FACILITY_ID" IS NULL
        OR TRIM("FACILITY_ID") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '86b4a49e-7378-5159-9f41-b005208c31bc',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH valid_pat_mrn_id_across_all_three_tables AS (
  SELECT 'PAT_MRN_ID' AS issue_column, 'screening_20240307' AS issue_table_name, a.PAT_MRN_ID AS invalid_pat_value, a.FACILITY_ID AS invalid_facility_value, a.src_file_row_number AS issue_row
  FROM screening_20240307 a
  LEFT JOIN qe_admin_data_20240307 b
  ON UPPER(a.PAT_MRN_ID) = UPPER(b.PAT_MRN_ID)
  AND UPPER(a.FACILITY_ID) = UPPER(b.FACILITY_ID)
  LEFT JOIN admin_demographics_20240307 c
  ON UPPER(a.PAT_MRN_ID) = UPPER(c.PAT_MRN_ID)
  AND UPPER(a.FACILITY_ID) = UPPER(c.FACILITY_ID)
  WHERE b.PAT_MRN_ID IS NULL OR c.PAT_MRN_ID IS NULL OR b.FACILITY_ID IS NULL OR c.FACILITY_ID IS NULL
  UNION
  SELECT 'PAT_MRN_ID' AS issue_column, 'qe_admin_data_20240307' AS issue_table_name, b.PAT_MRN_ID AS invalid_pat_value, b.FACILITY_ID AS invalid_facility_value, b.src_file_row_number AS issue_row
  FROM qe_admin_data_20240307 b
  LEFT JOIN screening_20240307 a
  ON UPPER(a.PAT_MRN_ID) = UPPER(b.PAT_MRN_ID)
  AND UPPER(a.FACILITY_ID) = UPPER(b.FACILITY_ID)
  LEFT JOIN admin_demographics_20240307 c
  ON UPPER(b.PAT_MRN_ID) = UPPER(c.PAT_MRN_ID)
  AND UPPER(b.FACILITY_ID) = UPPER(c.FACILITY_ID)
  WHERE a.PAT_MRN_ID IS NULL OR c.PAT_MRN_ID IS NULL OR a.FACILITY_ID IS NULL OR c.FACILITY_ID IS NULL
  UNION
  SELECT 'PAT_MRN_ID' AS issue_column, 'admin_demographics_20240307' AS issue_table_name, c.PAT_MRN_ID AS invalid_pat_value, c.FACILITY_ID AS invalid_facility_value, c.src_file_row_number AS issue_row
  FROM admin_demographics_20240307 c
  LEFT JOIN screening_20240307 a
  ON UPPER(a.PAT_MRN_ID) = UPPER(c.PAT_MRN_ID)
  AND UPPER(a.FACILITY_ID) = UPPER(c.FACILITY_ID)
  LEFT JOIN qe_admin_data_20240307 b
  ON UPPER(c.PAT_MRN_ID) = UPPER(b.PAT_MRN_ID)
  AND UPPER(c.FACILITY_ID) = UPPER(b.FACILITY_ID)
  WHERE a.PAT_MRN_ID IS NULL OR b.PAT_MRN_ID IS NULL OR a.FACILITY_ID IS NULL OR b.FACILITY_ID IS NULL
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '86b4a49e-7378-5159-9f41-b005208c31bc',
           'PAT_MRN_ID that does not match the FACILITY_ID',
           issue_row,
           issue_column,
           invalid_pat_value,
           'PAT_MRN_ID ("' || invalid_pat_value || '") that does not match the FACILITY_ID ("' || invalid_facility_value || '") across the files was found in "' || issue_table_name || '".',
           'Validate PAT_MRN_ID that maches the FACILITY_ID across the files'
      FROM valid_pat_mrn_id_across_all_three_tables;
WITH mandatory_value AS (
    SELECT 'ENCOUNTER_CLASS_CODE' AS issue_column,
           "ENCOUNTER_CLASS_CODE" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "screening_20240307"
     WHERE "ENCOUNTER_CLASS_CODE" IS NULL
        OR TRIM("ENCOUNTER_CLASS_CODE") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '86b4a49e-7378-5159-9f41-b005208c31bc',
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
      FROM screening_20240307 sr
      LEFT JOIN encounter_class_reference ecr
      ON UPPER(sr.ENCOUNTER_CLASS_CODE) = UPPER(ecr.Code)
     WHERE sr.ENCOUNTER_CLASS_CODE IS NOT NULL
      AND ecr.Code IS NULL
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '86b4a49e-7378-5159-9f41-b005208c31bc',
           'Invalid ENCOUNTER CLASS CODE',
           issue_row,
           issue_column,
           invalid_value,
           'Invalid ENCOUNTER CLASS CODE "' || invalid_value || '" found in ' || issue_column,
           'Validate ENCOUNTER CLASS CODE with encounter class reference data'
      FROM valid_encounter_class_in_all_rows;
WITH valid_field_combination_in_all_rows AS (
  SELECT 	'ENCOUNTER_CLASS_CODE' AS issue_column,
      tbl."ENCOUNTER_CLASS_CODE" AS invalid_value,
      tbl."ENCOUNTER_CLASS_CODE_DESCRIPTION" AS dependent_value,
      tbl.src_file_row_number AS issue_row
  FROM screening_20240307  tbl
  WHERE tbl."ENCOUNTER_CLASS_CODE" is not null
  and tbl."ENCOUNTER_CLASS_CODE_DESCRIPTION" is not null
  and NOT EXISTS ( SELECT "Display" FROM encounter_class_reference WHERE UPPER(tbl."ENCOUNTER_CLASS_CODE_DESCRIPTION") = UPPER("Display") AND UPPER(tbl."ENCOUNTER_CLASS_CODE") = UPPER("Code"))
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '86b4a49e-7378-5159-9f41-b005208c31bc',
           'Combination Not Matching',
           issue_row,
           issue_column,
           invalid_value,
           'Invalid value "' || invalid_value || '" found in ' || issue_column,
           'The ENCOUNTER_CLASS_CODE "' || invalid_value || '" of ENCOUNTER_CLASS_CODE_DESCRIPTION "' || dependent_value || '" is not matching with the ENCOUNTER_CLASS_CODE of ENCOUNTER_CLASS_CODE_DESCRIPTION in reference data'
      FROM valid_field_combination_in_all_rows;
WITH valid_field_combination_in_all_rows AS (
  SELECT 	'ENCOUNTER_CLASS_CODE_DESCRIPTION' AS issue_column,
      tbl."ENCOUNTER_CLASS_CODE_DESCRIPTION" AS invalid_value,
      tbl."ENCOUNTER_CLASS_CODE" AS dependent_value,
      tbl.src_file_row_number AS issue_row
  FROM screening_20240307  tbl
  WHERE tbl."ENCOUNTER_CLASS_CODE_DESCRIPTION" is not null
  and tbl."ENCOUNTER_CLASS_CODE" is not null
  and NOT EXISTS ( SELECT "Code" FROM encounter_class_reference WHERE UPPER(tbl."ENCOUNTER_CLASS_CODE") = UPPER("Code") AND UPPER(tbl."ENCOUNTER_CLASS_CODE_DESCRIPTION") = UPPER("Display"))
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '86b4a49e-7378-5159-9f41-b005208c31bc',
           'Combination Not Matching',
           issue_row,
           issue_column,
           invalid_value,
           'Invalid value "' || invalid_value || '" found in ' || issue_column,
           'The ENCOUNTER_CLASS_CODE_DESCRIPTION "' || invalid_value || '" of ENCOUNTER_CLASS_CODE "' || dependent_value || '" is not matching with the ENCOUNTER_CLASS_CODE_DESCRIPTION of ENCOUNTER_CLASS_CODE in reference data'
      FROM valid_field_combination_in_all_rows;
WITH mandatory_value AS (
    SELECT 'ENCOUNTER_CLASS_CODE_SYSTEM' AS issue_column,
           "ENCOUNTER_CLASS_CODE_SYSTEM" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "screening_20240307"
     WHERE "ENCOUNTER_CLASS_CODE_SYSTEM" IS NULL
        OR TRIM("ENCOUNTER_CLASS_CODE_SYSTEM") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '86b4a49e-7378-5159-9f41-b005208c31bc',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH allowed_values AS (
    SELECT 'ENCOUNTER_CLASS_CODE_SYSTEM' AS issue_column,
           "ENCOUNTER_CLASS_CODE_SYSTEM" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "screening_20240307"
     WHERE "ENCOUNTER_CLASS_CODE_SYSTEM" NOT IN ('http://terminology.hl7.org/ValueSet/v3-ActEncounterCode')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '86b4a49e-7378-5159-9f41-b005208c31bc',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''http://terminology.hl7.org/ValueSet/v3-ActEncounterCode'')',
           'Use only allowed values ''http://terminology.hl7.org/ValueSet/v3-ActEncounterCode'' in ' || issue_column
      FROM allowed_values;
WITH valid_encounter_class_in_all_rows AS (
    SELECT 'ENCOUNTER_CLASS_CODE_DESCRIPTION' AS issue_column,
           sr."ENCOUNTER_CLASS_CODE_DESCRIPTION" AS invalid_value,
           sr.src_file_row_number AS issue_row
      FROM screening_20240307 sr
      LEFT JOIN encounter_class_reference ecr
      ON UPPER(sr.ENCOUNTER_CLASS_CODE_DESCRIPTION) = UPPER(ecr.Display)
     WHERE sr.ENCOUNTER_CLASS_CODE_DESCRIPTION IS NOT NULL
      AND ecr.Display IS NULL
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '86b4a49e-7378-5159-9f41-b005208c31bc',
           'Invalid ENCOUNTER CLASS CODE DESCRIPTION',
           issue_row,
           issue_column,
           invalid_value,
           'Invalid ENCOUNTER CLASS CODE DESCRIPTION "' || invalid_value || '" found in ' || issue_column,
           'Validate ENCOUNTER CLASS CODE DESCRIPTION with encounter class reference data'
      FROM valid_encounter_class_in_all_rows;
WITH mandatory_value AS (
    SELECT 'ENCOUNTER_STATUS_CODE' AS issue_column,
           "ENCOUNTER_STATUS_CODE" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "screening_20240307"
     WHERE "ENCOUNTER_STATUS_CODE" IS NULL
        OR TRIM("ENCOUNTER_STATUS_CODE") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '86b4a49e-7378-5159-9f41-b005208c31bc',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH valid_encounter_status_code_in_all_rows AS (
    SELECT 'ENCOUNTER_STATUS_CODE' AS issue_column,
           sr."ENCOUNTER_STATUS_CODE" AS invalid_value,
           sr.src_file_row_number AS issue_row
      FROM screening_20240307 sr
      LEFT JOIN encounter_status_code_reference ecr
      ON UPPER(sr.ENCOUNTER_STATUS_CODE) = UPPER(ecr.Code)
     WHERE sr.ENCOUNTER_STATUS_CODE IS NOT NULL
      AND ecr.Code IS NULL
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '86b4a49e-7378-5159-9f41-b005208c31bc',
           'Invalid ENCOUNTER STATUS CODE',
           issue_row,
           issue_column,
           invalid_value,
           'Invalid ENCOUNTER STATUS CODE "' || invalid_value || '" found in ' || issue_column,
           'Validate ENCOUNTER STATUS CODE with encounter status reference data'
      FROM valid_encounter_status_code_in_all_rows;
WITH valid_encounter_status_code_in_all_rows AS (
    SELECT 'ENCOUNTER_STATUS_CODE_DESCRIPTION' AS issue_column,
           sr."ENCOUNTER_STATUS_CODE_DESCRIPTION" AS invalid_value,
           sr.src_file_row_number AS issue_row
      FROM screening_20240307 sr
      LEFT JOIN encounter_status_code_reference ecr
      ON UPPER(sr.ENCOUNTER_STATUS_CODE_DESCRIPTION) = UPPER(ecr.Display)
     WHERE sr.ENCOUNTER_STATUS_CODE_DESCRIPTION IS NOT NULL
      AND ecr.Display IS NULL
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '86b4a49e-7378-5159-9f41-b005208c31bc',
           'Invalid ENCOUNTER STATUS CODE DESCRIPTION',
           issue_row,
           issue_column,
           invalid_value,
           'Invalid ENCOUNTER STATUS CODE DESCRIPTION "' || invalid_value || '" found in ' || issue_column,
           'Validate ENCOUNTER STATUS CODE DESCRIPTION with encounter status reference data'
      FROM valid_encounter_status_code_in_all_rows;
WITH valid_field_combination_in_all_rows AS (
  SELECT 	'ENCOUNTER_STATUS_CODE' AS issue_column,
      tbl."ENCOUNTER_STATUS_CODE" AS invalid_value,
      tbl."ENCOUNTER_STATUS_CODE_DESCRIPTION" AS dependent_value,
      tbl.src_file_row_number AS issue_row
  FROM screening_20240307  tbl
  WHERE tbl."ENCOUNTER_STATUS_CODE" is not null
  and tbl."ENCOUNTER_STATUS_CODE_DESCRIPTION" is not null
  and NOT EXISTS ( SELECT "Display" FROM encounter_status_code_reference WHERE UPPER(tbl."ENCOUNTER_STATUS_CODE_DESCRIPTION") = UPPER("Display") AND UPPER(tbl."ENCOUNTER_STATUS_CODE") = UPPER("Code"))
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '86b4a49e-7378-5159-9f41-b005208c31bc',
           'Combination Not Matching',
           issue_row,
           issue_column,
           invalid_value,
           'Invalid value "' || invalid_value || '" found in ' || issue_column,
           'The ENCOUNTER_STATUS_CODE "' || invalid_value || '" of ENCOUNTER_STATUS_CODE_DESCRIPTION "' || dependent_value || '" is not matching with the ENCOUNTER_STATUS_CODE of ENCOUNTER_STATUS_CODE_DESCRIPTION in reference data'
      FROM valid_field_combination_in_all_rows;
WITH valid_field_combination_in_all_rows AS (
  SELECT 	'ENCOUNTER_STATUS_CODE_DESCRIPTION' AS issue_column,
      tbl."ENCOUNTER_STATUS_CODE_DESCRIPTION" AS invalid_value,
      tbl."ENCOUNTER_STATUS_CODE" AS dependent_value,
      tbl.src_file_row_number AS issue_row
  FROM screening_20240307  tbl
  WHERE tbl."ENCOUNTER_STATUS_CODE_DESCRIPTION" is not null
  and tbl."ENCOUNTER_STATUS_CODE" is not null
  and NOT EXISTS ( SELECT "Code" FROM encounter_status_code_reference WHERE UPPER(tbl."ENCOUNTER_STATUS_CODE") = UPPER("Code") AND UPPER(tbl."ENCOUNTER_STATUS_CODE_DESCRIPTION") = UPPER("Display"))
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '86b4a49e-7378-5159-9f41-b005208c31bc',
           'Combination Not Matching',
           issue_row,
           issue_column,
           invalid_value,
           'Invalid value "' || invalid_value || '" found in ' || issue_column,
           'The ENCOUNTER_STATUS_CODE_DESCRIPTION "' || invalid_value || '" of ENCOUNTER_STATUS_CODE "' || dependent_value || '" is not matching with the ENCOUNTER_STATUS_CODE_DESCRIPTION of ENCOUNTER_STATUS_CODE in reference data'
      FROM valid_field_combination_in_all_rows;
WITH mandatory_value AS (
    SELECT 'ENCOUNTER_STATUS_CODE_SYSTEM' AS issue_column,
           "ENCOUNTER_STATUS_CODE_SYSTEM" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "screening_20240307"
     WHERE "ENCOUNTER_STATUS_CODE_SYSTEM" IS NULL
        OR TRIM("ENCOUNTER_STATUS_CODE_SYSTEM") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '86b4a49e-7378-5159-9f41-b005208c31bc',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH allowed_values AS (
    SELECT 'ENCOUNTER_STATUS_CODE_SYSTEM' AS issue_column,
           "ENCOUNTER_STATUS_CODE_SYSTEM" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "screening_20240307"
     WHERE "ENCOUNTER_STATUS_CODE_SYSTEM" NOT IN ('http://hl7.org/fhir/encounter-status')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '86b4a49e-7378-5159-9f41-b005208c31bc',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''http://hl7.org/fhir/encounter-status'')',
           'Use only allowed values ''http://hl7.org/fhir/encounter-status'' in ' || issue_column
      FROM allowed_values;
WITH valid_encounter_type_code_in_all_rows AS (
    SELECT 'ENCOUNTER_TYPE_CODE' AS issue_column,
           sr."ENCOUNTER_TYPE_CODE" AS invalid_value,
           sr.src_file_row_number AS issue_row
      FROM screening_20240307 sr
      LEFT JOIN encounter_type_code_reference ecr
      ON UPPER(sr.ENCOUNTER_TYPE_CODE) = UPPER(ecr.Code)
     WHERE sr.ENCOUNTER_TYPE_CODE IS NOT NULL
      AND ecr.Code IS NULL
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '86b4a49e-7378-5159-9f41-b005208c31bc',
           'Invalid ENCOUNTER TYPE CODE',
           issue_row,
           issue_column,
           invalid_value,
           'Invalid ENCOUNTER TYPE CODE "' || invalid_value || '" found in ' || issue_column,
           'Validate ENCOUNTER TYPE CODE with encounter type reference data'
      FROM valid_encounter_type_code_in_all_rows;
WITH allowed_values AS (
    SELECT 'ENCOUNTER_TYPE_CODE_SYSTEM' AS issue_column,
           "ENCOUNTER_TYPE_CODE_SYSTEM" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "screening_20240307"
     WHERE "ENCOUNTER_TYPE_CODE_SYSTEM" NOT IN ('SNOMED-CT', 'SNOMED', 'http://snomed.info/sct')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '86b4a49e-7378-5159-9f41-b005208c31bc',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''SNOMED-CT'', ''SNOMED'', ''http://snomed.info/sct'')',
           'Use only allowed values ''SNOMED-CT'', ''SNOMED'', ''http://snomed.info/sct'' in ' || issue_column
      FROM allowed_values;
WITH valid_encounter_type_code_in_all_rows AS (
    SELECT 'ENCOUNTER_TYPE_CODE_DESCRIPTION' AS issue_column,
           sr."ENCOUNTER_TYPE_CODE_DESCRIPTION" AS invalid_value,
           sr.src_file_row_number AS issue_row
      FROM screening_20240307 sr
      LEFT JOIN encounter_type_code_reference ecr
      ON UPPER(sr.ENCOUNTER_TYPE_CODE_DESCRIPTION) = UPPER(ecr.Display)
     WHERE sr.ENCOUNTER_TYPE_CODE_DESCRIPTION IS NOT NULL
      AND ecr.Display IS NULL
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '86b4a49e-7378-5159-9f41-b005208c31bc',
           'Invalid ENCOUNTER TYPE CODE DESCRIPTION',
           issue_row,
           issue_column,
           invalid_value,
           'Invalid ENCOUNTER TYPE CODE DESCRIPTION "' || invalid_value || '" found in ' || issue_column,
           'Validate ENCOUNTER TYPE CODE DESCRIPTION with encounter type reference data'
      FROM valid_encounter_type_code_in_all_rows;
WITH valid_field_combination_in_all_rows AS (
  SELECT 	'ENCOUNTER_TYPE_CODE' AS issue_column,
      tbl."ENCOUNTER_TYPE_CODE" AS invalid_value,
      tbl."ENCOUNTER_TYPE_CODE_DESCRIPTION" AS dependent_value,
      tbl.src_file_row_number AS issue_row
  FROM screening_20240307  tbl
  WHERE tbl."ENCOUNTER_TYPE_CODE" is not null
  and tbl."ENCOUNTER_TYPE_CODE_DESCRIPTION" is not null
  and NOT EXISTS ( SELECT "Display" FROM encounter_type_code_reference WHERE UPPER(tbl."ENCOUNTER_TYPE_CODE_DESCRIPTION") = UPPER("Display") AND UPPER(tbl."ENCOUNTER_TYPE_CODE") = UPPER("Code"))
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '86b4a49e-7378-5159-9f41-b005208c31bc',
           'Combination Not Matching',
           issue_row,
           issue_column,
           invalid_value,
           'Invalid value "' || invalid_value || '" found in ' || issue_column,
           'The ENCOUNTER_TYPE_CODE "' || invalid_value || '" of ENCOUNTER_TYPE_CODE_DESCRIPTION "' || dependent_value || '" is not matching with the ENCOUNTER_TYPE_CODE of ENCOUNTER_TYPE_CODE_DESCRIPTION in reference data'
      FROM valid_field_combination_in_all_rows;
WITH valid_field_combination_in_all_rows AS (
  SELECT 	'ENCOUNTER_TYPE_CODE_DESCRIPTION' AS issue_column,
      tbl."ENCOUNTER_TYPE_CODE_DESCRIPTION" AS invalid_value,
      tbl."ENCOUNTER_TYPE_CODE" AS dependent_value,
      tbl.src_file_row_number AS issue_row
  FROM screening_20240307  tbl
  WHERE tbl."ENCOUNTER_TYPE_CODE_DESCRIPTION" is not null
  and tbl."ENCOUNTER_TYPE_CODE" is not null
  and NOT EXISTS ( SELECT "Code" FROM encounter_type_code_reference WHERE UPPER(tbl."ENCOUNTER_TYPE_CODE") = UPPER("Code") AND UPPER(tbl."ENCOUNTER_TYPE_CODE_DESCRIPTION") = UPPER("Display"))
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '86b4a49e-7378-5159-9f41-b005208c31bc',
           'Combination Not Matching',
           issue_row,
           issue_column,
           invalid_value,
           'Invalid value "' || invalid_value || '" found in ' || issue_column,
           'The ENCOUNTER_TYPE_CODE_DESCRIPTION "' || invalid_value || '" of ENCOUNTER_TYPE_CODE "' || dependent_value || '" is not matching with the ENCOUNTER_TYPE_CODE_DESCRIPTION of ENCOUNTER_TYPE_CODE in reference data'
      FROM valid_field_combination_in_all_rows;
WITH mandatory_value AS (
    SELECT 'SCREENING_STATUS_CODE' AS issue_column,
           "SCREENING_STATUS_CODE" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "screening_20240307"
     WHERE "SCREENING_STATUS_CODE" IS NULL
        OR TRIM("SCREENING_STATUS_CODE") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '86b4a49e-7378-5159-9f41-b005208c31bc',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH valid_screening_status_code_in_all_rows AS (
    SELECT 'SCREENING_STATUS_CODE' AS issue_column,
           sr."SCREENING_STATUS_CODE" AS invalid_value,
           sr.src_file_row_number AS issue_row
      FROM screening_20240307 sr
      LEFT JOIN screening_status_code_reference ref
      ON UPPER(sr.SCREENING_STATUS_CODE) = UPPER(ref.Code)
     WHERE sr.SCREENING_STATUS_CODE IS NOT NULL
      AND ref.Code IS NULL
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '86b4a49e-7378-5159-9f41-b005208c31bc',
           'Invalid SCREENING STATUS CODE',
           issue_row,
           issue_column,
           invalid_value,
           'Invalid SCREENING STATUS CODE "' || invalid_value || '" found in ' || issue_column,
           'Validate SCREENING STATUS CODE with screening status code reference data'
      FROM valid_screening_status_code_in_all_rows;
WITH valid_screening_status_code_in_all_rows AS (
    SELECT 'SCREENING_STATUS_CODE_DESCRIPTION' AS issue_column,
           sr."SCREENING_STATUS_CODE_DESCRIPTION" AS invalid_value,
           sr.src_file_row_number AS issue_row
      FROM screening_20240307 sr
      LEFT JOIN screening_status_code_reference ecr
      ON UPPER(sr.SCREENING_STATUS_CODE_DESCRIPTION) = UPPER(ecr.Display)
     WHERE sr.SCREENING_STATUS_CODE_DESCRIPTION IS NOT NULL
      AND ecr.Display IS NULL
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '86b4a49e-7378-5159-9f41-b005208c31bc',
           'Invalid SCREENING STATUS CODE',
           issue_row,
           issue_column,
           invalid_value,
           'Invalid SCREENING STATUS CODE "' || invalid_value || '" found in ' || issue_column,
           'Validate SCREENING STATUS CODE with screening status code reference data'
      FROM valid_screening_status_code_in_all_rows;
WITH valid_field_combination_in_all_rows AS (
  SELECT 	'SCREENING_STATUS_CODE' AS issue_column,
      tbl."SCREENING_STATUS_CODE" AS invalid_value,
      tbl."SCREENING_STATUS_CODE_DESCRIPTION" AS dependent_value,
      tbl.src_file_row_number AS issue_row
  FROM screening_20240307  tbl
  WHERE tbl."SCREENING_STATUS_CODE" is not null
  and tbl."SCREENING_STATUS_CODE_DESCRIPTION" is not null
  and NOT EXISTS ( SELECT "Display" FROM screening_status_code_reference WHERE UPPER(tbl."SCREENING_STATUS_CODE_DESCRIPTION") = UPPER("Display") AND UPPER(tbl."SCREENING_STATUS_CODE") = UPPER("Code"))
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '86b4a49e-7378-5159-9f41-b005208c31bc',
           'Combination Not Matching',
           issue_row,
           issue_column,
           invalid_value,
           'Invalid value "' || invalid_value || '" found in ' || issue_column,
           'The SCREENING_STATUS_CODE "' || invalid_value || '" of SCREENING_STATUS_CODE_DESCRIPTION "' || dependent_value || '" is not matching with the SCREENING_STATUS_CODE of SCREENING_STATUS_CODE_DESCRIPTION in reference data'
      FROM valid_field_combination_in_all_rows;
WITH valid_field_combination_in_all_rows AS (
  SELECT 	'SCREENING_STATUS_CODE_DESCRIPTION' AS issue_column,
      tbl."SCREENING_STATUS_CODE_DESCRIPTION" AS invalid_value,
      tbl."SCREENING_STATUS_CODE" AS dependent_value,
      tbl.src_file_row_number AS issue_row
  FROM screening_20240307  tbl
  WHERE tbl."SCREENING_STATUS_CODE_DESCRIPTION" is not null
  and tbl."SCREENING_STATUS_CODE" is not null
  and NOT EXISTS ( SELECT "Code" FROM screening_status_code_reference WHERE UPPER(tbl."SCREENING_STATUS_CODE") = UPPER("Code") AND UPPER(tbl."SCREENING_STATUS_CODE_DESCRIPTION") = UPPER("Display"))
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '86b4a49e-7378-5159-9f41-b005208c31bc',
           'Combination Not Matching',
           issue_row,
           issue_column,
           invalid_value,
           'Invalid value "' || invalid_value || '" found in ' || issue_column,
           'The SCREENING_STATUS_CODE_DESCRIPTION "' || invalid_value || '" of SCREENING_STATUS_CODE "' || dependent_value || '" is not matching with the SCREENING_STATUS_CODE_DESCRIPTION of SCREENING_STATUS_CODE in reference data'
      FROM valid_field_combination_in_all_rows;
WITH mandatory_value AS (
    SELECT 'SCREENING_STATUS_CODE_SYSTEM' AS issue_column,
           "SCREENING_STATUS_CODE_SYSTEM" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "screening_20240307"
     WHERE "SCREENING_STATUS_CODE_SYSTEM" IS NULL
        OR TRIM("SCREENING_STATUS_CODE_SYSTEM") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '86b4a49e-7378-5159-9f41-b005208c31bc',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH allowed_values AS (
    SELECT 'SCREENING_STATUS_CODE_SYSTEM' AS issue_column,
           "SCREENING_STATUS_CODE_SYSTEM" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "screening_20240307"
     WHERE "SCREENING_STATUS_CODE_SYSTEM" NOT IN ('http://hl7.org/fhir/observation-status')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '86b4a49e-7378-5159-9f41-b005208c31bc',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''http://hl7.org/fhir/observation-status'')',
           'Use only allowed values ''http://hl7.org/fhir/observation-status'' in ' || issue_column
      FROM allowed_values;
WITH valid_screening_question_answer_mandatory_values_in_all_rows AS (
      SELECT  'ANSWER_CODE' AS issue_column,
              "ANSWER_CODE" AS invalid_value,
              src_file_row_number AS issue_row
        FROM screening_20240307
        WHERE (ANSWER_CODE IS NULL OR TRIM("ANSWER_CODE") = '')
        AND src_file_row_number
        NOT IN(
          Select src_file_row_number
            FROM screening_20240307
            Where UPPER(QUESTION_CODE_DESCRIPTION)
            IN ('TOTAL SAFETY SCORE',
            'CALCULATED WEEKLY PHYSICAL ACTIVITY',
            'CALCULATED MENTAL HEALTH SCORE')
        )
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '86b4a49e-7378-5159-9f41-b005208c31bc',
           'Invalid value in ANSWER_CODE',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field "' || issue_column || '" is empty',
           'The required field value ANSWER_CODE is missing'
      FROM valid_screening_question_answer_mandatory_values_in_all_rows;
WITH valid_screening_question_answer_mandatory_values_in_all_rows AS (
      SELECT  'ANSWER_CODE_SYSTEM_NAME' AS issue_column,
              "ANSWER_CODE_SYSTEM_NAME" AS invalid_value,
              src_file_row_number AS issue_row
        FROM screening_20240307
        WHERE (ANSWER_CODE_SYSTEM_NAME IS NULL OR TRIM("ANSWER_CODE_SYSTEM_NAME") = '')
        AND src_file_row_number
        NOT IN(
          Select src_file_row_number
            FROM screening_20240307
            Where UPPER(QUESTION_CODE_DESCRIPTION)
            IN ('TOTAL SAFETY SCORE',
            'CALCULATED WEEKLY PHYSICAL ACTIVITY',
            'CALCULATED MENTAL HEALTH SCORE')
        )
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '86b4a49e-7378-5159-9f41-b005208c31bc',
           'Invalid value in ANSWER_CODE_SYSTEM_NAME',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field "' || issue_column || '" is empty',
           'The required field value ANSWER_CODE_SYSTEM_NAME is missing'
      FROM valid_screening_question_answer_mandatory_values_in_all_rows;
WITH valid_screening_question_answer_mandatory_values_in_all_rows AS (
      SELECT  'QUESTION_CODE' AS issue_column,
              "QUESTION_CODE" AS invalid_value,
              src_file_row_number AS issue_row
        FROM screening_20240307
        WHERE (QUESTION_CODE IS NULL OR TRIM("QUESTION_CODE") = '')
        AND src_file_row_number
        NOT IN(
          Select src_file_row_number
            FROM screening_20240307
            Where UPPER(QUESTION_CODE_DESCRIPTION)
            IN ('TOTAL SAFETY SCORE',
            'CALCULATED WEEKLY PHYSICAL ACTIVITY',
            'CALCULATED MENTAL HEALTH SCORE')
        )
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '86b4a49e-7378-5159-9f41-b005208c31bc',
           'Invalid value in QUESTION_CODE',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field "' || issue_column || '" is empty',
           'The required field value QUESTION_CODE is missing'
      FROM valid_screening_question_answer_mandatory_values_in_all_rows;
WITH valid_screening_question_answer_mandatory_values_in_all_rows AS (
      SELECT  'QUESTION_CODE_SYSTEM_NAME' AS issue_column,
              "QUESTION_CODE_SYSTEM_NAME" AS invalid_value,
              src_file_row_number AS issue_row
        FROM screening_20240307
        WHERE (QUESTION_CODE_SYSTEM_NAME IS NULL OR TRIM("QUESTION_CODE_SYSTEM_NAME") = '')
        AND src_file_row_number
        NOT IN(
          Select src_file_row_number
            FROM screening_20240307
            Where UPPER(QUESTION_CODE_DESCRIPTION)
            IN ('TOTAL SAFETY SCORE',
            'CALCULATED WEEKLY PHYSICAL ACTIVITY',
            'CALCULATED MENTAL HEALTH SCORE')
        )
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '86b4a49e-7378-5159-9f41-b005208c31bc',
           'Invalid value in QUESTION_CODE_SYSTEM_NAME',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field "' || issue_column || '" is empty',
           'The required field value QUESTION_CODE_SYSTEM_NAME is missing'
      FROM valid_screening_question_answer_mandatory_values_in_all_rows;
WITH valid_screening_question_answer_mandatory_values_in_all_rows AS (
      SELECT  'SCREENING_CODE_DESCRIPTION' AS issue_column,
              "SCREENING_CODE_DESCRIPTION" AS invalid_value,
              src_file_row_number AS issue_row
        FROM screening_20240307
        WHERE (SCREENING_CODE_DESCRIPTION IS NULL OR TRIM("SCREENING_CODE_DESCRIPTION") = '')
        AND src_file_row_number
        NOT IN(
          Select src_file_row_number
            FROM screening_20240307
            Where UPPER(QUESTION_CODE_DESCRIPTION)
            IN ('TOTAL SAFETY SCORE',
            'CALCULATED WEEKLY PHYSICAL ACTIVITY',
            'CALCULATED MENTAL HEALTH SCORE')
        )
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '86b4a49e-7378-5159-9f41-b005208c31bc',
           'Invalid value in SCREENING_CODE_DESCRIPTION',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field "' || issue_column || '" is empty',
           'The required field value SCREENING_CODE_DESCRIPTION is missing'
      FROM valid_screening_question_answer_mandatory_values_in_all_rows;
WITH valid_screening_question_answer_mandatory_values_in_all_rows AS (
      SELECT  'SCREENING_CODE_SYSTEM_NAME' AS issue_column,
              "SCREENING_CODE_SYSTEM_NAME" AS invalid_value,
              src_file_row_number AS issue_row
        FROM screening_20240307
        WHERE (SCREENING_CODE_SYSTEM_NAME IS NULL OR TRIM("SCREENING_CODE_SYSTEM_NAME") = '')
        AND src_file_row_number
        NOT IN(
          Select src_file_row_number
            FROM screening_20240307
            Where UPPER(QUESTION_CODE_DESCRIPTION)
            IN ('TOTAL SAFETY SCORE',
            'CALCULATED WEEKLY PHYSICAL ACTIVITY',
            'CALCULATED MENTAL HEALTH SCORE')
        )
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '86b4a49e-7378-5159-9f41-b005208c31bc',
           'Invalid value in SCREENING_CODE_SYSTEM_NAME',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field "' || issue_column || '" is empty',
           'The required field value SCREENING_CODE_SYSTEM_NAME is missing'
      FROM valid_screening_question_answer_mandatory_values_in_all_rows;
WITH valid_screening_question_answer_mandatory_values_in_all_rows AS (
      SELECT  'SCREENING_CODE' AS issue_column,
              "SCREENING_CODE" AS invalid_value,
              src_file_row_number AS issue_row
        FROM screening_20240307
        WHERE (SCREENING_CODE IS NULL OR TRIM("SCREENING_CODE") = '')
        AND src_file_row_number
        NOT IN(
          Select src_file_row_number
            FROM screening_20240307
            Where UPPER(QUESTION_CODE_DESCRIPTION)
            IN ('TOTAL SAFETY SCORE',
            'CALCULATED WEEKLY PHYSICAL ACTIVITY',
            'CALCULATED MENTAL HEALTH SCORE')
        )
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '86b4a49e-7378-5159-9f41-b005208c31bc',
           'Invalid value in SCREENING_CODE',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field "' || issue_column || '" is empty',
           'The required field value SCREENING_CODE is missing'
      FROM valid_screening_question_answer_mandatory_values_in_all_rows;
WITH mandatory_value AS (
    SELECT 'QUESTION_CODE_DESCRIPTION' AS issue_column,
           "QUESTION_CODE_DESCRIPTION" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "screening_20240307"
     WHERE "QUESTION_CODE_DESCRIPTION" IS NULL
        OR TRIM("QUESTION_CODE_DESCRIPTION") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '86b4a49e-7378-5159-9f41-b005208c31bc',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH valid_answer_code_in_all_rows AS (
  SELECT 'ANSWER_CODE' AS issue_column,
    scr."ANSWER_CODE" AS invalid_value,
    scr."QUESTION_CODE" AS invalid_question_value,
    scr.SCREENING_CODE AS invalid_screening_value,
    scr.src_file_row_number AS issue_row
    FROM screening_20240307 scr
    LEFT OUTER JOIN ahc_cross_walk crw
      ON UPPER(scr.SCREENING_CODE) = UPPER(crw.SCREENING_CODE)
      AND UPPER(scr.QUESTION_CODE) = UPPER(crw.QUESTION_CODE)
      AND UPPER(scr.ANSWER_CODE) = UPPER(crw.ANSWER_CODE)
    WHERE scr.SCREENING_CODE IS NOT NULL
      AND scr.QUESTION_CODE IS NOT NULL
      AND scr.ANSWER_CODE IS NOT NULL
      AND crw.ANSWER_CODE IS NULL
)

INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '86b4a49e-7378-5159-9f41-b005208c31bc',
           'Invalid Answer Code',
           issue_row,
           issue_column,
           invalid_value,
           'Provided Screening Code "' || invalid_screening_value || '", Question Code "' || invalid_question_value || '" and Answer Code "' || invalid_value || '" are not matching with the reference data found in ' || issue_column,
           'Validate Screening Code, Question Code and Answer Code with ahc cross walk reference data'
      FROM valid_answer_code_in_all_rows;
WITH allowed_values AS (
    SELECT 'SCREENING_CODE' AS issue_column,
           "SCREENING_CODE" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "screening_20240307"
     WHERE "SCREENING_CODE" NOT IN ('96777-8', '97023-6')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '86b4a49e-7378-5159-9f41-b005208c31bc',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''96777-8'', ''97023-6'')',
           'Use only allowed values ''96777-8'', ''97023-6'' in ' || issue_column
      FROM allowed_values;
WITH allowed_values AS (
    SELECT 'SCREENING_CODE_SYSTEM_NAME' AS issue_column,
           "SCREENING_CODE_SYSTEM_NAME" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "screening_20240307"
     WHERE "SCREENING_CODE_SYSTEM_NAME" NOT IN ('LN', 'LOINC', 'http://loinc.org')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '86b4a49e-7378-5159-9f41-b005208c31bc',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''LN'', ''LOINC'', ''http://loinc.org'')',
           'Use only allowed values ''LN'', ''LOINC'', ''http://loinc.org'' in ' || issue_column
      FROM allowed_values;
WITH mandatory_value AS (
    SELECT 'RECORDED_TIME' AS issue_column,
           "RECORDED_TIME" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "screening_20240307"
     WHERE "RECORDED_TIME" IS NULL
        OR TRIM("RECORDED_TIME") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '86b4a49e-7378-5159-9f41-b005208c31bc',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH valid_date_time_in_all_rows AS (
        SELECT  'RECORDED_TIME' AS issue_column,
              "RECORDED_TIME" AS invalid_value,
              src_file_row_number AS issue_row
        FROM "screening_20240307"
        WHERE "RECORDED_TIME" IS NOT NULL
        AND "RECORDED_TIME" NOT SIMILAR TO '([0-9]([0-9]([0-9][1-9]|[1-9]0)|[1-9]00)|[1-9]000)-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])T([01][0-9]|2[0-3]):[0-5][0-9]:([0-5][0-9]|60)(\.[0-9]+)?(Z|(\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00))$'
        OR TRY_CAST("RECORDED_TIME" AS TIMESTAMP) IS NULL
  )
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '86b4a49e-7378-5159-9f41-b005208c31bc',
           'Invalid Date',
           issue_row,
           issue_column,
           invalid_value,
           'Invalid timestamp "' || invalid_value || '" found in ' || issue_column,
           'Please be sure to provide both a valid date and time.'
      FROM valid_date_time_in_all_rows;
WITH mandatory_value AS (
    SELECT 'SDOH_DOMAIN' AS issue_column,
           "SDOH_DOMAIN" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "screening_20240307"
     WHERE "SDOH_DOMAIN" IS NULL
        OR TRIM("SDOH_DOMAIN") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '86b4a49e-7378-5159-9f41-b005208c31bc',
           'Missing Mandatory Value',
           issue_row,
           issue_column,
           invalid_value,
           'Mandatory field ' || issue_column || ' is empty',
           'Provide a value for ' || issue_column
      FROM mandatory_value;
WITH valid_sdoh_domain_in_all_rows AS (
  SELECT DISTINCT scr.SDOH_DOMAIN AS invalid_value,
    'SDOH_DOMAIN' AS issue_column,
    scr.src_file_row_number AS issue_row
  FROM screening_20240307 scr
  LEFT JOIN ahc_cross_walk cw
  ON UPPER(scr.SDOH_DOMAIN) = UPPER(cw.SDOH_DOMAIN)
  WHERE cw.SDOH_DOMAIN IS NULL
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '86b4a49e-7378-5159-9f41-b005208c31bc',
           'Invalid SDOH DOMAIN',
           issue_row,
           issue_column,
           invalid_value,
           'Invalid SDOH DOMAIN "' || invalid_value || '" found in ' || issue_column,
           'Validate SDOH DOMAIN with ahc cross walk reference data'
      FROM valid_sdoh_domain_in_all_rows;
WITH valid_question_code_for_screening_code_in_all_rows AS (
  SELECT DISTINCT scr.SCREENING_CODE AS issue_screening_value, scr.QUESTION_CODE AS invalid_value, 'QUESTION_CODE' AS issue_column, scr.src_file_row_number AS issue_row
  FROM screening_20240307 scr
  LEFT JOIN ahc_cross_walk cw ON UPPER(scr.QUESTION_CODE) = UPPER(cw.QUESTION_CODE)
  AND UPPER(scr.SCREENING_CODE) = UPPER(cw.SCREENING_CODE)
  WHERE cw.QUESTION_CODE IS NULL
  AND cw.SCREENING_CODE IS NOT NULL
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '86b4a49e-7378-5159-9f41-b005208c31bc',
           'Invalid Question Code',
           issue_row,
           issue_column,
           invalid_value,
           'Invalid Question Code "' || invalid_value || '" found in ' || issue_column,
           'Validate Question Code with ahc cross walk reference data'
      FROM valid_question_code_for_screening_code_in_all_rows;
WITH mandatory_value AS (
    SELECT 'ANSWER_CODE_DESCRIPTION' AS issue_column,
           "ANSWER_CODE_DESCRIPTION" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "screening_20240307"
     WHERE "ANSWER_CODE_DESCRIPTION" IS NULL
        OR TRIM("ANSWER_CODE_DESCRIPTION") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '86b4a49e-7378-5159-9f41-b005208c31bc',
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
      FROM "screening_20240307"
     WHERE "QUESTION_CODE_SYSTEM_NAME" NOT IN ('LN','LOINC','http://loinc.org')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '86b4a49e-7378-5159-9f41-b005208c31bc',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''LN'',''LOINC'',''http://loinc.org'')',
           'Use only allowed values ''LN'',''LOINC'',''http://loinc.org'' in ' || issue_column
      FROM allowed_values;
WITH allowed_values AS (
    SELECT 'ANSWER_CODE_SYSTEM_NAME' AS issue_column,
           "ANSWER_CODE_SYSTEM_NAME" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "screening_20240307"
     WHERE "ANSWER_CODE_SYSTEM_NAME" NOT IN ('LN','LOINC','http://loinc.org')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '86b4a49e-7378-5159-9f41-b005208c31bc',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''LN'',''LOINC'',''http://loinc.org'')',
           'Use only allowed values ''LN'',''LOINC'',''http://loinc.org'' in ' || issue_column
      FROM allowed_values;
WITH mandatory_value AS (
    SELECT 'POTENTIAL_NEED_INDICATED' AS issue_column,
           "POTENTIAL_NEED_INDICATED" AS invalid_value,
           src_file_row_number AS issue_row
      FROM "screening_20240307"
     WHERE "POTENTIAL_NEED_INDICATED" IS NULL
        OR TRIM("POTENTIAL_NEED_INDICATED") = ''
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '86b4a49e-7378-5159-9f41-b005208c31bc',
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
      FROM "screening_20240307"
     WHERE "POTENTIAL_NEED_INDICATED" NOT IN ('Yes','No','NA','yes','no','na')
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '86b4a49e-7378-5159-9f41-b005208c31bc',
           'Invalid Value',
           issue_row,
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' not in allowed list (''Yes'',''No'',''NA'',''yes'',''no'',''na'')',
           'Use only allowed values ''Yes'',''No'',''NA'',''yes'',''no'',''na'' in ' || issue_column
      FROM allowed_values;
WITH valid_screening_potential_need_indicated_question_answer_values_in_all_rows AS (
  SELECT  'POTENTIAL_NEED_INDICATED' AS issue_column,
          coalesce(scr."POTENTIAL_NEED_INDICATED",'NULL') AS invalid_value,
          scr.ANSWER_CODE AS invalid_answer_value,
          scr.QUESTION_CODE AS invalid_question_value,
          scr.SCREENING_CODE AS invalid_screening_value,
          scr.src_file_row_number AS issue_row
  FROM screening_20240307 scr
  LEFT JOIN ahc_cross_walk acw
    ON UPPER(scr.SCREENING_CODE) = UPPER(acw.SCREENING_CODE)
    AND UPPER(scr.QUESTION_CODE) = UPPER(acw.QUESTION_CODE)
    AND UPPER(scr.ANSWER_CODE) = UPPER(acw.ANSWER_CODE)
    AND UPPER(scr."POTENTIAL_NEED_INDICATED") = UPPER(acw."POTENTIAL_NEED_INDICATED")
  WHERE acw."POTENTIAL_NEED_INDICATED" IS NULL
  AND  UPPER(scr.QUESTION_CODE_DESCRIPTION)
  NOT IN(
    'TOTAL SAFETY SCORE',
    'CALCULATED WEEKLY PHYSICAL ACTIVITY',
    'CALCULATED MENTAL HEALTH SCORE'
  )
)
INSERT INTO orch_session_issue (orch_session_issue_id, session_id, session_entry_id, issue_type, issue_row, issue_column, invalid_value, issue_message, remediation)
    SELECT uuid(),
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '86b4a49e-7378-5159-9f41-b005208c31bc',
           'Invalid value in POTENTIAL_NEED_INDICATED',
           issue_row,
           issue_column,
           invalid_value,
           'Provided Potential Need Indicated "' || invalid_value || '", Screening Code "' || invalid_screening_value || '", Question Code "' || invalid_question_value || '" and Answer Code "' || invalid_answer_value || '" are not matching with the reference data found in ' || issue_column,
           'Validate Potential Need Indicated, Screening Code, Question Code and Answer Code with ahc cross walk reference data'
      FROM valid_screening_potential_need_indicated_question_answer_values_in_all_rows;
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('4c4f9b8e-e50f-5da7-9901-3ef393fa8abe', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '86b4a49e-7378-5159-9f41-b005208c31bc', 'ATTEMPT_CSV_ASSURANCE', 'ASSURED_CSV', NULL, 'ScreeningCsvFileIngestSource.assuranceSQL', (CURRENT_TIMESTAMP), NULL);
    
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('2d193f6b-b33f-5f8b-8281-da48e6bceaaf', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'e6951d0b-be59-58c3-8a04-01181208c601', 'INGESTED_CSV', 'ATTEMPT_CSV_ASSURANCE', NULL, 'AhcCrossWalkCsvFileIngestSource.assuranceSQL', (CURRENT_TIMESTAMP), NULL);

-- add field validation

INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('d0b4aa83-f90e-55af-a33f-11508a4abe46', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'e6951d0b-be59-58c3-8a04-01181208c601', 'ATTEMPT_CSV_ASSURANCE', 'ASSURED_CSV', NULL, 'AhcCrossWalkCsvFileIngestSource.assuranceSQL', (CURRENT_TIMESTAMP), NULL);
      
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('7d8ecb6e-190a-5c47-b730-41cbb9d35145', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'e8b3dab4-5058-5c79-8088-45b423119149', 'INGESTED_CSV', 'ATTEMPT_CSV_ASSURANCE', NULL, 'EncounterClassReferenceCsvFileIngestSource.assuranceSQL', (CURRENT_TIMESTAMP), NULL);

-- add field validation

INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('3110b11b-c624-5429-936e-7fde7c9d81d0', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'e8b3dab4-5058-5c79-8088-45b423119149', 'ATTEMPT_CSV_ASSURANCE', 'ASSURED_CSV', NULL, 'EncounterClassReferenceCsvFileIngestSource.assuranceSQL', (CURRENT_TIMESTAMP), NULL);
      
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('effcdab8-9c23-5403-ac83-f79f6f89b302', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '6fcd9df5-34cf-5c09-8fb5-e73617e28d73', 'INGESTED_CSV', 'ATTEMPT_CSV_ASSURANCE', NULL, 'EncounterStatusCodeReferenceCsvFileIngestSource.assuranceSQL', (CURRENT_TIMESTAMP), NULL);

-- add field validation

INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('29a0ddf8-06dc-5eb4-986d-4cbaf262d706', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '6fcd9df5-34cf-5c09-8fb5-e73617e28d73', 'ATTEMPT_CSV_ASSURANCE', 'ASSURED_CSV', NULL, 'EncounterStatusCodeReferenceCsvFileIngestSource.assuranceSQL', (CURRENT_TIMESTAMP), NULL);
      
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('7210b304-8af5-537d-be03-2b8bb421337d', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'a92a6466-6fe4-58d7-8948-e2e09dc2fec2', 'INGESTED_CSV', 'ATTEMPT_CSV_ASSURANCE', NULL, 'EncounterTypeCodeReferenceCsvFileIngestSource.assuranceSQL', (CURRENT_TIMESTAMP), NULL);

-- add field validation

INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('d35451d3-0948-57b5-b76a-f702f9e67874', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'a92a6466-6fe4-58d7-8948-e2e09dc2fec2', 'ATTEMPT_CSV_ASSURANCE', 'ASSURED_CSV', NULL, 'EncounterTypeCodeReferenceCsvFileIngestSource.assuranceSQL', (CURRENT_TIMESTAMP), NULL);
      
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('397748ba-bd27-56b6-8272-a45f9caeaf64', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '4f7e4436-c5f6-5ba1-9793-580ab66789fb', 'INGESTED_CSV', 'ATTEMPT_CSV_ASSURANCE', NULL, 'ScreeningStatusCodeReferenceCsvFileIngestSource.assuranceSQL', (CURRENT_TIMESTAMP), NULL);

-- add field validation

INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('b16b3cbe-15fc-5abd-8060-3ac63cbcdd4f', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '4f7e4436-c5f6-5ba1-9793-580ab66789fb', 'ATTEMPT_CSV_ASSURANCE', 'ASSURED_CSV', NULL, 'ScreeningStatusCodeReferenceCsvFileIngestSource.assuranceSQL', (CURRENT_TIMESTAMP), NULL);
      
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('485754a8-39a0-5f12-96bc-6e869590e1e9', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '6202ec4a-f3d5-5302-9ed6-9cb59a5b2818', 'INGESTED_CSV', 'ATTEMPT_CSV_ASSURANCE', NULL, 'GenderIdentityReferenceCsvFileIngestSource.assuranceSQL', (CURRENT_TIMESTAMP), NULL);

-- add field validation

INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('a8d1b1bd-8eb4-5138-9be5-e990a57810dd', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '6202ec4a-f3d5-5302-9ed6-9cb59a5b2818', 'ATTEMPT_CSV_ASSURANCE', 'ASSURED_CSV', NULL, 'GenderIdentityReferenceCsvFileIngestSource.assuranceSQL', (CURRENT_TIMESTAMP), NULL);
      
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('09b84d82-4502-5597-99c1-a190fb056033', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '9f13dd7d-9ff8-509d-b716-cde856c5f0f0', 'INGESTED_CSV', 'ATTEMPT_CSV_ASSURANCE', NULL, 'AdministrativeSexReferenceCsvFileIngestSource.assuranceSQL', (CURRENT_TIMESTAMP), NULL);

-- add field validation

INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('0bca199b-8c63-5c2a-ab22-6bad71bd6709', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '9f13dd7d-9ff8-509d-b716-cde856c5f0f0', 'ATTEMPT_CSV_ASSURANCE', 'ASSURED_CSV', NULL, 'AdministrativeSexReferenceCsvFileIngestSource.assuranceSQL', (CURRENT_TIMESTAMP), NULL);
      
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('1a02c252-e9e3-5a86-8ec9-54e0cb66e62b', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '413ec5cd-eee9-5c62-90a5-6670f8b9ddff', 'INGESTED_CSV', 'ATTEMPT_CSV_ASSURANCE', NULL, 'SexAtBirthReferenceCsvFileIngestSource.assuranceSQL', (CURRENT_TIMESTAMP), NULL);

-- add field validation

INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('e5ea573e-da81-5b03-b6cf-ed23ac97cac8', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '413ec5cd-eee9-5c62-90a5-6670f8b9ddff', 'ATTEMPT_CSV_ASSURANCE', 'ASSURED_CSV', NULL, 'SexAtBirthReferenceCsvFileIngestSource.assuranceSQL', (CURRENT_TIMESTAMP), NULL);
      
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('3392e5a3-5c3e-5fbe-9dc0-08c6b4a4cc99', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '17cedd6e-e794-5b45-9790-c4ba2483cc1e', 'INGESTED_CSV', 'ATTEMPT_CSV_ASSURANCE', NULL, 'SexualOrientationReferenceCsvFileIngestSource.assuranceSQL', (CURRENT_TIMESTAMP), NULL);

-- add field validation

INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('4af56de7-f296-5409-bf50-dfa7e8917037', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '17cedd6e-e794-5b45-9790-c4ba2483cc1e', 'ATTEMPT_CSV_ASSURANCE', 'ASSURED_CSV', NULL, 'SexualOrientationReferenceCsvFileIngestSource.assuranceSQL', (CURRENT_TIMESTAMP), NULL);
      
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('4b7b09fc-4ad4-5311-92d1-7c7a0550d0aa', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '35c62034-5b20-5891-8d38-3e9b051dec6e', 'INGESTED_CSV', 'ATTEMPT_CSV_ASSURANCE', NULL, 'BusinessRulesReferenceCsvFileIngestSource.assuranceSQL', (CURRENT_TIMESTAMP), NULL);

-- add field validation

INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('733415e1-8989-5184-84c2-15c99a45ac85', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '35c62034-5b20-5891-8d38-3e9b051dec6e', 'ATTEMPT_CSV_ASSURANCE', 'ASSURED_CSV', NULL, 'BusinessRulesReferenceCsvFileIngestSource.assuranceSQL', (CURRENT_TIMESTAMP), NULL);
      
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('ddd5157b-0daf-5a61-bcd3-cda46ece2d09', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'c420c3ba-ddbc-582b-9cdf-361497beb034', 'INGESTED_CSV', 'ATTEMPT_CSV_ASSURANCE', NULL, 'RaceReferenceCsvFileIngestSource.assuranceSQL', (CURRENT_TIMESTAMP), NULL);

-- add field validation

INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('06369bd0-47ee-5066-bbce-a751235b365d', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'c420c3ba-ddbc-582b-9cdf-361497beb034', 'ATTEMPT_CSV_ASSURANCE', 'ASSURED_CSV', NULL, 'RaceReferenceCsvFileIngestSource.assuranceSQL', (CURRENT_TIMESTAMP), NULL);
      
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('841b1d15-81a7-5865-8dee-86f56e93ad92', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '5a941253-b661-5282-a5e6-97cbfe5dfb32', 'INGESTED_CSV', 'ATTEMPT_CSV_ASSURANCE', NULL, 'EthnicityReferenceCsvFileIngestSource.assuranceSQL', (CURRENT_TIMESTAMP), NULL);

-- add field validation

INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('8d5985ba-457f-5b4f-9541-a05f175ac801', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '5a941253-b661-5282-a5e6-97cbfe5dfb32', 'ATTEMPT_CSV_ASSURANCE', 'ASSURED_CSV', NULL, 'EthnicityReferenceCsvFileIngestSource.assuranceSQL', (CURRENT_TIMESTAMP), NULL);
      
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('ff91aafa-9001-50c0-980b-5de3eb4b68d7', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'b63bd83d-959a-5a5f-8d60-08b84bf16c90', 'INGESTED_CSV', 'ATTEMPT_CSV_ASSURANCE', NULL, 'PreferredLanguageReferenceCsvFileIngestSource.assuranceSQL', (CURRENT_TIMESTAMP), NULL);

-- add field validation

INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('5c69bb0b-3196-5fa8-8a31-e4d76f77767b', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'b63bd83d-959a-5a5f-8d60-08b84bf16c90', 'ATTEMPT_CSV_ASSURANCE', 'ASSURED_CSV', NULL, 'PreferredLanguageReferenceCsvFileIngestSource.assuranceSQL', (CURRENT_TIMESTAMP), NULL);
      
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('3703c7d0-bd0c-5341-a7f9-8c4fa611ebf2', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'f626602e-8be5-5e8c-824c-bdde91b22817', 'INGESTED_CSV', 'ATTEMPT_CSV_ASSURANCE', NULL, 'SdohDomainReferenceCsvFileIngestSource.assuranceSQL', (CURRENT_TIMESTAMP), NULL);

-- add field validation

INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('5feab441-8a14-5c12-92d9-1f1ebd2d9205', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'f626602e-8be5-5e8c-824c-bdde91b22817', 'ATTEMPT_CSV_ASSURANCE', 'ASSURED_CSV', NULL, 'SdohDomainReferenceCsvFileIngestSource.assuranceSQL', (CURRENT_TIMESTAMP), NULL);
      
```
No STDOUT emitted by `ensureContent` (status: `0`).

No STDERR emitted by `ensureContent`.

    

## emitResources

```sql
-- preambleSQL
SET autoinstall_known_extensions=true;
SET autoload_known_extensions=true;
-- end preambleSQL
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('05e8feaa-0bed-5909-a817-39812494b361', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', NULL, 'NONE', 'ENTER(prepareInit)', NULL, 'rsEE.beforeCell', ('2024-03-28T06:13:55.179Z'), NULL);
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('8f460419-7b80-516d-8919-84520950f612', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', NULL, 'EXIT(prepareInit)', 'ENTER(init)', NULL, 'rsEE.afterCell', ('2024-03-28T06:13:55.179Z'), NULL);
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('1931dfcc-e8fc-597d-b1bc-65b4287e6fdf', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', NULL, 'EXIT(init)', 'ENTER(ingest)', NULL, 'rsEE.afterCell', ('2024-03-28T06:13:55.179Z'), NULL);
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('334b7ece-79ec-5ea1-b98b-bb09d0e2b234', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', NULL, 'EXIT(ingest)', 'ENTER(ensureContent)', NULL, 'rsEE.afterCell', ('2024-03-28T06:13:55.179Z'), NULL);
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('4426d5b2-0661-5a83-9e90-36f1a5666cf8', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', NULL, 'EXIT(ensureContent)', 'ENTER(emitResources)', NULL, 'rsEE.afterCell', ('2024-03-28T06:13:55.179Z'), NULL);

-- removed SQLPage and execution diagnostics SQL DML from diagnostics Markdown

CREATE VIEW orch_session_issue_classification AS
WITH cte_business_rule AS (
  SELECT worksheet as worksheet,
      field as field,
      required as required,
      "Resolved by QE/QCS" as resolved_by_qe_qcs,
      CONCAT(
          CASE WHEN UPPER("True Rejection") = 'YES' THEN 'REJECTION' ELSE '' END,
          CASE WHEN UPPER("Warning Layer") = 'YES' THEN 'WARNING' ELSE '' END
      ) AS record_action
  FROM
      "ingestion-center".main.business_rules
)
--select * from cte_business_rule

SELECT
  -- Including all other columns from 'orch_session'
  ises.* EXCLUDE (orch_started_at, orch_finished_at),
  -- TODO: Casting known timestamp columns to text so emit to Excel works with GDAL (spatial)
    -- strftime(timestamptz orch_started_at, '%Y-%m-%d %H:%M:%S') AS orch_started_at,
    -- strftime(timestamptz orch_finished_at, '%Y-%m-%d %H:%M:%S') AS orch_finished_at,
  -- Including all columns from 'orch_session_entry'
  isee.* EXCLUDE (session_id),
  -- Including all other columns from 'orch_session_issue'
  isi.* EXCLUDE (session_id, session_entry_id),
  CASE
    WHEN
        UPPER(isi.issue_type) = 'MISSING COLUMN'
      THEN
        'STRUCTURAL ISSUE'
      ELSE
        br.record_action
    END
  AS disposition,
  case when UPPER(br.resolved_by_qe_qcs) = 'YES' then 'Resolved By QE/QCS' else null end AS remediation
  FROM orch_session AS ises
  JOIN orch_session_entry AS isee ON ises.orch_session_id = isee.session_id
  LEFT JOIN orch_session_issue AS isi ON isee.orch_session_entry_id = isi.session_entry_id
  --LEFT JOIN business_rules br ON isi.issue_column = br.FIELD
  LEFT OUTER JOIN cte_business_rule br ON br.field = isi.issue_column
  WHERE isi.orch_session_issue_id IS NOT NULL
;

ATTACH '/home/alan/workspaces/github.com/alan-francis/1115-hub/support/assurance/ahc-hrsn-elt/screening/results-test-e2e/resource.sqlite.db' AS resource_db (TYPE SQLITE);

-- copy relevant orchestration engine admin tables into the the attached database
CREATE TABLE resource_db.device AS SELECT * FROM device;
CREATE TABLE resource_db.orch_session AS SELECT * FROM orch_session;
CREATE TABLE resource_db.orch_session_entry AS SELECT * FROM orch_session_entry;
CREATE TABLE resource_db.orch_session_state AS SELECT * FROM orch_session_state;
CREATE TABLE resource_db.orch_session_exec AS SELECT * FROM orch_session_exec;
CREATE TABLE resource_db.orch_session_issue AS SELECT * FROM orch_session_issue;
CREATE TABLE resource_db.sqlpage_files AS SELECT * FROM sqlpage_files;

-- export content tables from DuckDb into the attached database (nature-dependent)
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('a5b8b3ab-b0e7-5f5c-b38b-60bca388de0b', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '8b7c669c-1795-5f6b-8f3a-3e502b74c628', 'ASSURED_CSV', 'EXIT(AdminDemographicCsvFileIngestSource)', NULL, 'AdminDemographicCsvFileIngestSource.exportResourceSQL', (CURRENT_TIMESTAMP), NULL);

CREATE TABLE IF NOT EXISTS demographic_data AS SELECT * FROM admin_demographics_20240307 WHERE 0=1;
INSERT INTO demographic_data SELECT * FROM admin_demographics_20240307;

CREATE TABLE resource_db.admin_demographics_20240307 AS SELECT * FROM admin_demographics_20240307;

CREATE TABLE IF NOT EXISTS resource_db.demographic_data AS SELECT * FROM admin_demographics_20240307 WHERE 0=1;
INSERT INTO resource_db.demographic_data SELECT * FROM admin_demographics_20240307;



  INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('66b21a3e-5135-5007-9061-14c2b6d33383', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '8b7c669c-1795-5f6b-8f3a-3e502b74c628', 'ATTEMPT_CSV_EXPORT', 'EXIT(ScreeningCsvFileIngestSource)', NULL, 'AdminDemographicCsvFileIngestSource.exportResourceSQL', (CURRENT_TIMESTAMP), NULL);
  
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('7b50928a-200f-531a-9a0f-759de4ff1fe6', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '591191c7-f693-5957-8734-ac87151ca981', 'ASSURED_CSV', 'EXIT(QeAdminDataCsvFileIngestSource)', NULL, 'QeAdminDataCsvFileIngestSource.exportResourceSQL', (CURRENT_TIMESTAMP), NULL);

CREATE TABLE IF NOT EXISTS qe_admin_data AS SELECT * FROM qe_admin_data_20240307 WHERE 0=1;
INSERT INTO qe_admin_data SELECT * FROM qe_admin_data_20240307;

CREATE TABLE resource_db.qe_admin_data_20240307 AS SELECT * FROM qe_admin_data_20240307;

CREATE TABLE IF NOT EXISTS resource_db.qe_admin_data AS SELECT * FROM qe_admin_data_20240307 WHERE 0=1;
INSERT INTO resource_db.qe_admin_data SELECT * FROM qe_admin_data_20240307;

  INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('87e8ac07-4d2f-55b3-9656-983edb280b85', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '591191c7-f693-5957-8734-ac87151ca981', 'ATTEMPT_CSV_EXPORT', 'EXIT(ScreeningCsvFileIngestSource)', NULL, 'QeAdminDataCsvFileIngestSource.exportResourceSQL', (CURRENT_TIMESTAMP), NULL);
  
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('8e71e5ae-3d3f-53e4-bb52-332047079934', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '86b4a49e-7378-5159-9f41-b005208c31bc', 'ASSURED_CSV', 'EXIT(ScreeningCsvFileIngestSource)', NULL, 'ScreeningCsvFileIngestSource.exportResourceSQL', (CURRENT_TIMESTAMP), NULL);

CREATE TABLE IF NOT EXISTS screening AS SELECT * FROM screening_20240307 WHERE 0=1;
INSERT INTO screening SELECT * FROM screening_20240307;

CREATE TABLE resource_db.screening_20240307 AS SELECT * FROM screening_20240307;

CREATE TABLE IF NOT EXISTS resource_db.screening AS SELECT * FROM screening_20240307 WHERE 0=1;
INSERT INTO resource_db.screening SELECT * FROM screening_20240307;

-- try sqltofhir Visual Studio Code extension for writing FHIR resources with SQL.
-- see https://marketplace.visualstudio.com/items?itemName=arkhn.sqltofhir-vscode
CREATE VIEW IF NOT EXISTS screening_fhir AS
  SELECT tab_screening.PAT_MRN_ID, CONCAT(tab_demograph.FIRST_NAME,' ', tab_demograph.LAST_NAME) as display_name, json_object(
        'resourceType', 'Observation',
        'id', tab_screening.ENCOUNTER_ID,
        'status', 'final',
        'code', json_object(
            'coding', json_array(
                json_object(
                    'system', tab_screening.QUESTION_CODE_SYSTEM_NAME,
                    'code', tab_screening.QUESTION_CODE,
                    'display', tab_screening.QUESTION_CODE_DESCRIPTION
                )
            )
        ),
        'subject', json_object(
            'reference', 'Patient/' || tab_screening.PAT_MRN_ID,
            'display',  CONCAT(tab_demograph.FIRST_NAME,' ', tab_demograph.LAST_NAME)
        ),
        'effectiveDateTime', tab_screening.RECORDED_TIME,
        'valueString', tab_screening.ANSWER_CODE_DESCRIPTION,
        'performer', json_array(
            json_object(
                'reference', 'Practitioner/' || tab_screening.session_id
            )
        ),
        'context', json_object(
            'reference', 'Encounter/' || tab_screening.ENCOUNTER_ID
        )
    ) AS FHIR_Observation
  FROM screening_20240307 as tab_screening LEFT JOIN admin_demographics_20240307 as tab_demograph
  ON tab_screening.PAT_MRN_ID = tab_demograph.PAT_MRN_ID;

CREATE VIEW IF NOT EXISTS resource_db.screening_fhir AS
  SELECT tab_screening.PAT_MRN_ID, CONCAT(tab_demograph.FIRST_NAME,' ', tab_demograph.LAST_NAME) as display_name, json_object(
        'resourceType', 'Observation',
        'id', tab_screening.ENCOUNTER_ID,
        'status', 'final',
        'code', json_object(
            'coding', json_array(
                json_object(
                    'system', tab_screening.QUESTION_CODE_SYSTEM_NAME,
                    'code', tab_screening.QUESTION_CODE,
                    'display', tab_screening.QUESTION_CODE_DESCRIPTION
                )
            )
        ),
        'subject', json_object(
            'reference', 'Patient/' || tab_screening.PAT_MRN_ID,
            'display',  CONCAT(tab_demograph.FIRST_NAME,' ', tab_demograph.LAST_NAME)
        ),
        'effectiveDateTime', tab_screening.RECORDED_TIME,
        'valueString', tab_screening.ANSWER_CODE_DESCRIPTION,
        'performer', json_array(
            json_object(
                'reference', 'Practitioner/' || tab_screening.session_id
            )
        ),
        'context', json_object(
            'reference', 'Encounter/' || tab_screening.ENCOUNTER_ID
        )
    ) AS FHIR_Observation
  FROM screening_20240307 as tab_screening LEFT JOIN admin_demographics_20240307 as tab_demograph
  ON tab_screening.PAT_MRN_ID = tab_demograph.PAT_MRN_ID;

        -- TODO: Need to fill out subject->display, source->display, questionnaire
CREATE VIEW IF NOT EXISTS resource_db.screening_fhir_questionnaire AS
  SELECT tab_screening.PAT_MRN_ID, CONCAT(tab_demograph.FIRST_NAME,' ', tab_demograph.LAST_NAME) as display_name, json_object(
        'resourceType', 'QuestionnaireResponse',
        'id', tab_screening.ENCOUNTER_ID,
        'status', 'completed',
        'questionnaire', '',
        '_questionnaire', json_object(
            'extension', json_array(
                json_object(
                    'url', tab_screening.QUESTION_CODE_SYSTEM_NAME,
                    'valueString', tab_screening.QUESTION_CODE
                )
            )
        ),
        'subject', json_object(
            'reference', 'Patient/' || tab_screening.PAT_MRN_ID,
            'display',  CONCAT(tab_demograph.FIRST_NAME,' ', tab_demograph.LAST_NAME)
        ),
        'authored', tab_screening.RECORDED_TIME,
        'source', json_object(
            'reference', 'Patient/' || tab_screening.PAT_MRN_ID,
            'display',  CONCAT(tab_demograph.FIRST_NAME,' ', tab_demograph.LAST_NAME)
        ),
        'item', json_array(
            json_object(
                'linkId', tab_screening.QUESTION_CODE,
                'text', tab_screening.QUESTION_CODE_DESCRIPTION,
                'answer',  json_array(
                  json_object(
                      'valueCoding', json_object(
                        'system', 'http://loinc.org',
                        'code', tab_screening.ANSWER_CODE,
                        'display', tab_screening.ANSWER_CODE_DESCRIPTION
                      )
                  )
                )
            )
        )
    ) AS FHIR_Questionnaire
  FROM screening_20240307 as tab_screening LEFT JOIN admin_demographics_20240307 as tab_demograph
  ON tab_screening.PAT_MRN_ID = tab_demograph.PAT_MRN_ID;

  INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('f96d2ad2-011f-583d-a66c-912a24a3ba02', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '86b4a49e-7378-5159-9f41-b005208c31bc', 'ATTEMPT_CSV_EXPORT', 'EXIT(ScreeningCsvFileIngestSource)', NULL, 'ScreeningCsvFileIngestSource.exportResourceSQL', (CURRENT_TIMESTAMP), NULL);
  
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('911da40d-2914-515a-a1af-bc271400a941', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'e6951d0b-be59-58c3-8a04-01181208c601', 'ASSURED_CSV', 'EXIT(AhcCrossWalkCsvFileIngestSource)', NULL, 'AhcCrossWalkCsvFileIngestSource.exportResourceSQL', (CURRENT_TIMESTAMP), NULL);

CREATE TABLE IF NOT EXISTS resource_db.ahc_cross_walk AS SELECT * FROM ahc_cross_walk WHERE 0=1;
INSERT INTO resource_db.ahc_cross_walk SELECT * FROM ahc_cross_walk;

  INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('d1c6a09a-1860-5a69-a8a5-f60b9da20bfb', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'e6951d0b-be59-58c3-8a04-01181208c601', 'ATTEMPT_CSV_EXPORT', 'EXIT(AhcCrossWalkCsvFileIngestSource)', NULL, 'AhcCrossWalkCsvFileIngestSource.exportResourceSQL', (CURRENT_TIMESTAMP), NULL);
  
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('97be58f2-3e10-5998-ba7e-0b32a6a275f1', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'e8b3dab4-5058-5c79-8088-45b423119149', 'ASSURED_CSV', 'EXIT(EncounterClassReferenceCsvFileIngestSource)', NULL, 'EncounterClassReferenceCsvFileIngestSource.exportResourceSQL', (CURRENT_TIMESTAMP), NULL);

CREATE TABLE IF NOT EXISTS resource_db.encounter_class_reference AS SELECT * FROM encounter_class_reference WHERE 0=1;
INSERT INTO resource_db.encounter_class_reference SELECT * FROM encounter_class_reference;

  INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('38538c24-a1dc-5765-9f34-4a90edd2e761', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'e8b3dab4-5058-5c79-8088-45b423119149', 'ATTEMPT_CSV_EXPORT', 'EXIT(EncounterClassReferenceCsvFileIngestSource)', NULL, 'EncounterClassReferenceCsvFileIngestSource.exportResourceSQL', (CURRENT_TIMESTAMP), NULL);
  
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('60584314-a117-562c-91cc-06c86d72dab4', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '6fcd9df5-34cf-5c09-8fb5-e73617e28d73', 'ASSURED_CSV', 'EXIT(EncounterStatusCodeReferenceCsvFileIngestSource)', NULL, 'EncounterStatusCodeReferenceCsvFileIngestSource.exportResourceSQL', (CURRENT_TIMESTAMP), NULL);

CREATE TABLE IF NOT EXISTS resource_db.encounter_status_code_reference AS SELECT * FROM encounter_status_code_reference WHERE 0=1;
INSERT INTO resource_db.encounter_status_code_reference SELECT * FROM encounter_status_code_reference;

  INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('71a4b830-f2be-5d34-a391-86464458ca19', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '6fcd9df5-34cf-5c09-8fb5-e73617e28d73', 'ATTEMPT_CSV_EXPORT', 'EXIT(EncounterStatusCodeReferenceCsvFileIngestSource)', NULL, 'EncounterStatusCodeReferenceCsvFileIngestSource.exportResourceSQL', (CURRENT_TIMESTAMP), NULL);
  
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('7a584364-ca4c-5ced-b0a0-8f71991d5f28', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'a92a6466-6fe4-58d7-8948-e2e09dc2fec2', 'ASSURED_CSV', 'EXIT(EncounterTypeCodeReferenceCsvFileIngestSource)', NULL, 'EncounterTypeCodeReferenceCsvFileIngestSource.exportResourceSQL', (CURRENT_TIMESTAMP), NULL);

CREATE TABLE IF NOT EXISTS resource_db.encounter_type_code_reference AS SELECT * FROM encounter_type_code_reference WHERE 0=1;
INSERT INTO resource_db.encounter_type_code_reference SELECT * FROM encounter_type_code_reference;

  INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('6f50dd74-790c-567a-a2fb-5e16efa6aae9', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'a92a6466-6fe4-58d7-8948-e2e09dc2fec2', 'ATTEMPT_CSV_EXPORT', 'EXIT(EncounterTypeCodeReferenceCsvFileIngestSource)', NULL, 'EncounterTypeCodeReferenceCsvFileIngestSource.exportResourceSQL', (CURRENT_TIMESTAMP), NULL);
  
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('dd442cc8-5a36-58e3-82ed-67dcbab0750b', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '4f7e4436-c5f6-5ba1-9793-580ab66789fb', 'ASSURED_CSV', 'EXIT(ScreeningStatusCodeReferenceCsvFileIngestSource)', NULL, 'ScreeningStatusCodeReferenceCsvFileIngestSource.exportResourceSQL', (CURRENT_TIMESTAMP), NULL);

CREATE TABLE IF NOT EXISTS resource_db.screening_status_code_reference AS SELECT * FROM screening_status_code_reference WHERE 0=1;
INSERT INTO resource_db.screening_status_code_reference SELECT * FROM screening_status_code_reference;

  INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('b7a3625c-4dca-5044-96a7-febbf5f5262b', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '4f7e4436-c5f6-5ba1-9793-580ab66789fb', 'ATTEMPT_CSV_EXPORT', 'EXIT(ScreeningStatusCodeReferenceCsvFileIngestSource)', NULL, 'ScreeningStatusCodeReferenceCsvFileIngestSource.exportResourceSQL', (CURRENT_TIMESTAMP), NULL);
  
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('f01ab940-7bfd-57f3-841d-605f8fdc5d35', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '6202ec4a-f3d5-5302-9ed6-9cb59a5b2818', 'ASSURED_CSV', 'EXIT(GenderIdentityReferenceCsvFileIngestSource)', NULL, 'GenderIdentityReferenceCsvFileIngestSource.exportResourceSQL', (CURRENT_TIMESTAMP), NULL);

CREATE TABLE IF NOT EXISTS resource_db.gender_identity_reference AS SELECT * FROM gender_identity_reference WHERE 0=1;
INSERT INTO resource_db.gender_identity_reference SELECT * FROM gender_identity_reference;

  INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('41a7cb10-5653-5519-9830-830f6f4d1c00', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '6202ec4a-f3d5-5302-9ed6-9cb59a5b2818', 'ATTEMPT_CSV_EXPORT', 'EXIT(GenderIdentityReferenceCsvFileIngestSource)', NULL, 'GenderIdentityReferenceCsvFileIngestSource.exportResourceSQL', (CURRENT_TIMESTAMP), NULL);
  
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('03c779cd-4dbf-5bc3-809c-0ffd0acd335e', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '9f13dd7d-9ff8-509d-b716-cde856c5f0f0', 'ASSURED_CSV', 'EXIT(AdministrativeSexReferenceCsvFileIngestSource)', NULL, 'AdministrativeSexReferenceCsvFileIngestSource.exportResourceSQL', (CURRENT_TIMESTAMP), NULL);

CREATE TABLE IF NOT EXISTS resource_db.administrative_sex_reference AS SELECT * FROM administrative_sex_reference WHERE 0=1;
INSERT INTO resource_db.administrative_sex_reference SELECT * FROM administrative_sex_reference;

  INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('5b4ded31-916d-55fb-9445-337490d4c899', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '9f13dd7d-9ff8-509d-b716-cde856c5f0f0', 'ATTEMPT_CSV_EXPORT', 'EXIT(AdministrativeSexReferenceCsvFileIngestSource)', NULL, 'AdministrativeSexReferenceCsvFileIngestSource.exportResourceSQL', (CURRENT_TIMESTAMP), NULL);
  
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('f5d36456-24b6-5f5d-b2ea-34b45b25daff', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '413ec5cd-eee9-5c62-90a5-6670f8b9ddff', 'ASSURED_CSV', 'EXIT(SexAtBirthReferenceCsvFileIngestSource)', NULL, 'SexAtBirthReferenceCsvFileIngestSource.exportResourceSQL', (CURRENT_TIMESTAMP), NULL);

CREATE TABLE IF NOT EXISTS resource_db.sex_at_birth_reference AS SELECT * FROM sex_at_birth_reference WHERE 0=1;
INSERT INTO resource_db.sex_at_birth_reference SELECT * FROM sex_at_birth_reference;

  INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('b2e62a65-826d-543d-924e-408abed17024', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '413ec5cd-eee9-5c62-90a5-6670f8b9ddff', 'ATTEMPT_CSV_EXPORT', 'EXIT(SexAtBirthReferenceCsvFileIngestSource)', NULL, 'SexAtBirthReferenceCsvFileIngestSource.exportResourceSQL', (CURRENT_TIMESTAMP), NULL);
  
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('43ac6d27-22fb-5346-b791-2490c94c583b', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '17cedd6e-e794-5b45-9790-c4ba2483cc1e', 'ASSURED_CSV', 'EXIT(SexualOrientationReferenceCsvFileIngestSource)', NULL, 'SexualOrientationReferenceCsvFileIngestSource.exportResourceSQL', (CURRENT_TIMESTAMP), NULL);

CREATE TABLE IF NOT EXISTS resource_db.sexual_orientation_reference AS SELECT * FROM sexual_orientation_reference WHERE 0=1;
INSERT INTO resource_db.sexual_orientation_reference SELECT * FROM sexual_orientation_reference;

  INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('9339cfc5-6d28-5af3-b24d-ce65468217f0', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '17cedd6e-e794-5b45-9790-c4ba2483cc1e', 'ATTEMPT_CSV_EXPORT', 'EXIT(SexualOrientationReferenceCsvFileIngestSource)', NULL, 'SexualOrientationReferenceCsvFileIngestSource.exportResourceSQL', (CURRENT_TIMESTAMP), NULL);
  
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('1f1b0f3a-1f20-5bea-ab3d-b9c3198f7caf', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '35c62034-5b20-5891-8d38-3e9b051dec6e', 'ASSURED_CSV', 'EXIT(BusinessRulesReferenceCsvFileIngestSource)', NULL, 'BusinessRulesReferenceCsvFileIngestSource.exportResourceSQL', (CURRENT_TIMESTAMP), NULL);

CREATE TABLE IF NOT EXISTS resource_db.business_rules AS SELECT * FROM business_rules WHERE 0=1;
INSERT INTO resource_db.business_rules SELECT * FROM business_rules;

  INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('692ae517-84a0-5673-8bc9-23513d5dd5c3', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '35c62034-5b20-5891-8d38-3e9b051dec6e', 'ATTEMPT_CSV_EXPORT', 'EXIT(BusinessRulesReferenceCsvFileIngestSource)', NULL, 'BusinessRulesReferenceCsvFileIngestSource.exportResourceSQL', (CURRENT_TIMESTAMP), NULL);
  
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('959f85d1-98fa-5db2-b027-2e3591331d25', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'c420c3ba-ddbc-582b-9cdf-361497beb034', 'ASSURED_CSV', 'EXIT(RaceReferenceCsvFileIngestSource)', NULL, 'RaceReferenceCsvFileIngestSource.exportResourceSQL', (CURRENT_TIMESTAMP), NULL);

CREATE TABLE IF NOT EXISTS resource_db.race_reference AS SELECT * FROM race_reference WHERE 0=1;
INSERT INTO resource_db.race_reference SELECT * FROM race_reference;

  INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('b6f5c4dc-436c-5670-82a5-a8c4ce994aab', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'c420c3ba-ddbc-582b-9cdf-361497beb034', 'ATTEMPT_CSV_EXPORT', 'EXIT(RaceReferenceCsvFileIngestSource)', NULL, 'RaceReferenceCsvFileIngestSource.exportResourceSQL', (CURRENT_TIMESTAMP), NULL);
  
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('f2efd09b-b028-540e-92db-e62e3dea8c0c', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '5a941253-b661-5282-a5e6-97cbfe5dfb32', 'ASSURED_CSV', 'EXIT(EthnicityReferenceCsvFileIngestSource)', NULL, 'EthnicityReferenceCsvFileIngestSource.exportResourceSQL', (CURRENT_TIMESTAMP), NULL);

CREATE TABLE IF NOT EXISTS resource_db.ethnicity_reference AS SELECT * FROM ethnicity_reference WHERE 0=1;
INSERT INTO resource_db.ethnicity_reference SELECT * FROM ethnicity_reference;

  INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('74f20f37-133a-5885-b2ed-9bce4f22c4cc', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '5a941253-b661-5282-a5e6-97cbfe5dfb32', 'ATTEMPT_CSV_EXPORT', 'EXIT(EthnicityReferenceCsvFileIngestSource)', NULL, 'EthnicityReferenceCsvFileIngestSource.exportResourceSQL', (CURRENT_TIMESTAMP), NULL);
  
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('2a88176d-f8d1-5fdc-a744-78ba817ba6b0', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'b63bd83d-959a-5a5f-8d60-08b84bf16c90', 'ASSURED_CSV', 'EXIT(PreferredLanguageReferenceCsvFileIngestSource)', NULL, 'PreferredLanguageReferenceCsvFileIngestSource.exportResourceSQL', (CURRENT_TIMESTAMP), NULL);

CREATE TABLE IF NOT EXISTS resource_db.preferred_language_reference AS SELECT * FROM preferred_language_reference WHERE 0=1;
INSERT INTO resource_db.preferred_language_reference SELECT * FROM preferred_language_reference;

  INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('3c6edc83-eefd-5ed1-91e1-cd964a533db1', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'b63bd83d-959a-5a5f-8d60-08b84bf16c90', 'ATTEMPT_CSV_EXPORT', 'EXIT(PreferredLanguageReferenceCsvFileIngestSource)', NULL, 'PreferredLanguageReferenceCsvFileIngestSource.exportResourceSQL', (CURRENT_TIMESTAMP), NULL);
  
INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('d4edbc9c-c336-5cbe-92de-c92dd609d36b', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'f626602e-8be5-5e8c-824c-bdde91b22817', 'ASSURED_CSV', 'EXIT(SdohDomainReferenceCsvFileIngestSource)', NULL, 'SdohDomainReferenceCsvFileIngestSource.exportResourceSQL', (CURRENT_TIMESTAMP), NULL);

CREATE TABLE IF NOT EXISTS resource_db.sdoh_domain_reference AS SELECT * FROM sdoh_domain_reference WHERE 0=1;
INSERT INTO resource_db.sdoh_domain_reference SELECT * FROM sdoh_domain_reference;

  INSERT INTO "orch_session_state" ("orch_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('1afa1d65-e5f0-544a-af1f-57d0b944c3b3', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'f626602e-8be5-5e8c-824c-bdde91b22817', 'ATTEMPT_CSV_EXPORT', 'EXIT(SdohDomainReferenceCsvFileIngestSource)', NULL, 'SdohDomainReferenceCsvFileIngestSource.exportResourceSQL', (CURRENT_TIMESTAMP), NULL);
  ;


DETACH DATABASE resource_db;

CREATE VIEW IF NOT EXISTS fhir_bundle AS
  WITH cte_fhir_patient AS (
    SELECT adt.pat_mrn_id,json_object('fullUrl', CONCAT(adt.FACILITY_ID,'-',adt.PAT_MRN_ID),
      'resource', json_object(
            'resourceType', 'Patient',
            'id', CONCAT(adt.FACILITY_ID,'-',adt.PAT_MRN_ID),
            'meta', json_object(
              'lastUpdated',(SELECT MAX(scr.RECORDED_TIME) FROM screening scr WHERE adt.FACILITY_ID = scr.FACILITY_ID),
              'profile', json_array('http://shinny.org/StructureDefinition/shinny-patient')
            ),
            CASE WHEN PREFERRED_LANGUAGE_CODE IS NOT NULL THEN 'language' ELSE NULL END, PREFERRED_LANGUAGE_CODE,
            CASE WHEN (RACE_CODE_SYSTEM_NAME IS NOT NULL AND RACE_CODE IS NOT NULL AND RACE_CODE_DESCRIPTION IS NOT NULL) OR (ETHNICITY_CODE_SYSTEM_NAME IS NOT NULL AND ETHNICITY_CODE IS NOT NULL AND ETHNICITY_CODE_DESCRIPTION IS NOT NULL) OR (SEX_AT_BIRTH_CODE_SYSTEM IS NOT NULL AND SEX_AT_BIRTH_CODE IS NOT NULL AND SEX_AT_BIRTH_CODE_DESCRIPTION IS NOT NULL) THEN 'extension' ELSE NULL END, json_array(
                            CASE WHEN RACE_CODE_SYSTEM_NAME IS NOT NULL AND RACE_CODE IS NOT NULL AND RACE_CODE_DESCRIPTION IS NOT NULL THEN json_object(
                                'extension', json_array(
                                              json_object(
                                                  'url','ombCategory',
                                                  'valueCoding',json_object(
                                                              'system',RACE_CODE_SYSTEM_NAME,
                                                              'code',CAST(RACE_CODE AS TEXT),
                                                              'display',RACE_CODE_DESCRIPTION
                                                              )
                                                          )
                                          ),
                                'url', 'http://hl7.org/fhir/us/core/StructureDefinition/us-core-race'
                              ) END,
                              CASE WHEN ETHNICITY_CODE_SYSTEM_NAME IS NOT NULL AND ETHNICITY_CODE IS NOT NULL AND ETHNICITY_CODE_DESCRIPTION IS NOT NULL THEN json_object(
                                'extension',json_array(
                                              json_object(
                                                  'url','ombCategory',
                                                  'valueCoding',json_object(
                                                                'system',ETHNICITY_CODE_SYSTEM_NAME,
                                                                'code',CAST(ETHNICITY_CODE AS TEXT),
                                                                'display',ETHNICITY_CODE_DESCRIPTION
                                                                )
                                                          )
                                        ),
                                  'url', 'http://hl7.org/fhir/us/core/StructureDefinition/us-core-ethnicity'
                            ) END,
                            CASE WHEN SEX_AT_BIRTH_CODE_SYSTEM IS NOT NULL AND SEX_AT_BIRTH_CODE IS NOT NULL AND SEX_AT_BIRTH_CODE_DESCRIPTION IS NOT NULL THEN json_object(
                                    'url','http://hl7.org/fhir/us/core/StructureDefinition/us-core-birthsex',
                                    'valueCode',CAST(SEX_AT_BIRTH_CODE AS TEXT)

                          ) END,
                            CASE WHEN SEXUAL_ORIENTATION_CODE_SYSTEM_NAME IS NOT NULL AND SEXUAL_ORIENTATION_CODE IS NOT NULL AND SEXUAL_ORIENTATION_DESCRIPTION IS NOT NULL THEN json_object(
                                    'url','http://shinny.org/StructureDefinition/shinny-sexual-orientation',
                                    'valueCodeableConcept',json_object('coding', json_array(json_object(
                                                  'system',SEXUAL_ORIENTATION_CODE_SYSTEM_NAME,
                                                  'code',SEXUAL_ORIENTATION_CODE,
                                                  'display',SEXUAL_ORIENTATION_DESCRIPTION
                                                  )))

                          ) END),
            'identifier', json_array(
                            json_object(
                                'type', json_object(
                                    'coding', json_array(json_object('system', 'http://terminology.hl7.org/CodeSystem/v2-0203', 'code', 'MR')),
                                    'text', 'Medical Record Number'
                                ),
                                'system', adt.FACILITY_ID,
                                'value', qat.PAT_MRN_ID,
                                'assigner', json_object('reference', 'Organization/' || qat.FACILITY_ID)
                            ),
                            CASE
                                WHEN MEDICAID_CIN != '' THEN
                                    json_object(
                                        'type', json_object(
                                            'coding', json_array(json_object('system', 'http://terminology.hl7.org/CodeSystem/v2-0203', 'code', 'MA'))
                                        ),
                                        'system', 'http://www.medicaid.gov/',
                                        'value', MEDICAID_CIN,
                                        'assigner', json_object('reference', 'Organization/2.16.840.1.113883.3.249')
                                    )
                                ELSE NULL
                            END,
                            CASE
                                WHEN adt.MPI_ID IS NOT NULL THEN
                                    json_object(
                                        'type', json_object(
                                            'coding', json_array(json_object('system', 'http://terminology.hl7.org/CodeSystem/v2-0203', 'code', 'PN'))
                                        ),
                                        'system', 'http://www.acme.com/identifiers/patient',
                                        'value', CAST(adt.MPI_ID AS TEXT)
                                    )
                                ELSE NULL
                            END
                        ),
            CASE WHEN FIRST_NAME IS NOT NULL THEN 'name' ELSE NULL END, json_array(json_object(
              CASE WHEN FIRST_NAME IS NOT NULL THEN 'text' ELSE NULL END, CONCAT(FIRST_NAME,' ', MIDDLE_NAME,' ', LAST_NAME),
              CASE WHEN LAST_NAME IS NOT NULL THEN 'family' ELSE NULL END, LAST_NAME,
              'given', json_array(FIRST_NAME,CASE WHEN MIDDLE_NAME IS NOT NULL THEN MIDDLE_NAME END))
            ),
            CASE WHEN ADMINISTRATIVE_SEX_CODE IS NOT NULL THEN 'gender' ELSE NULL END, ADMINISTRATIVE_SEX_CODE,
            CASE WHEN PAT_BIRTH_DATE IS NOT NULL THEN 'birthDate' ELSE NULL END, PAT_BIRTH_DATE,
            CASE WHEN CITY IS NOT NULL AND CITY != '' IS NOT NULL AND STATE IS NOT NULL AND STATE != '' THEN 'address' ELSE NULL END, json_array(
                json_object(
                  CASE WHEN ADDRESS1 IS NOT NULL AND ADDRESS1 != '' IS NOT NULL THEN 'text' ELSE NULL END, CONCAT(ADDRESS1, ' ', ADDRESS2),
                  CASE WHEN ADDRESS1 IS NOT NULL AND ADDRESS1 != '' IS NOT NULL THEN 'line' ELSE NULL END, json_array(ADDRESS1, ADDRESS2),
                  'city', CITY,
                  'state', STATE,
                  CASE WHEN ZIP IS NOT NULL AND CAST(ZIP AS TEXT) != '' IS NOT NULL THEN 'postalCode' ELSE NULL END, CAST(ZIP AS TEXT)
              )
            ),
            CASE WHEN PREFERRED_LANGUAGE_CODE IS NOT NULL THEN 'communication' ELSE NULL END, json_array(
              json_object('language', json_object(
                'coding', json_array(
                  json_object(
                    'code', PREFERRED_LANGUAGE_CODE
                  )
                )
              ),
                'preferred', true
            ))
      )) AS FHIR_Patient
  FROM demographic_data adt LEFT JOIN qe_admin_data qat
  ON adt.PAT_MRN_ID = qat.PAT_MRN_ID
  ),
  cte_fhir_consent AS (
    SELECT adt.pat_mrn_id,json_object('fullUrl', CONCAT('consentFor',adt.PAT_MRN_ID),
      'resource', json_object(
            'resourceType', 'Consent',
            'id', CONCAT('consentFor',adt.PAT_MRN_ID),
            'meta', json_object(
              'lastUpdated',(SELECT MAX(scr.RECORDED_TIME) FROM screening scr WHERE adt.FACILITY_ID = scr.FACILITY_ID),
              'profile', json_array('http://shinny.org/StructureDefinition/shin-ny-organization')
            ),
            'status','active',
            'scope', json_object('coding',json_array(json_object('code','treatment')),'text','treatment'),
            'category', json_array(json_object(
              'coding',json_array(
                json_object('display', 'Patient Consent',
                'code', '59284-0',
                'system','http://loinc.org')
              )
            )),
            'patient', json_object(
              'reference', CONCAT('Patient/',adt.PAT_MRN_ID)
            ),
            'dateTime',(SELECT MAX(scr.RECORDED_TIME) FROM screening scr WHERE adt.FACILITY_ID = scr.FACILITY_ID),
            'organization', json_array(json_object('reference', 'Organization/' || qat.FACILITY_ID))


      )
    ) AS FHIR_Consent
  FROM demographic_data adt LEFT JOIN qe_admin_data qat
  ON adt.PAT_MRN_ID = qat.PAT_MRN_ID
  ),
  cte_fhir_org AS (
    SELECT qed.PAT_MRN_ID, JSON_OBJECT(
      'fullUrl', LOWER(REPLACE(qed.FACILITY_LONG_NAME, ' ', '-')) || '-' || LOWER(REPLACE(qed.ORGANIZATION_TYPE, ' ', '-')) || '-' || LOWER(REPLACE(qed.FACILITY_ID, ' ', '-')),
      'resource', JSON_OBJECT(
          'resourceType', 'Organization',
          'id', qed.FACILITY_ID,
          'meta', JSON_OBJECT(
              'lastUpdated', (SELECT MAX(scr.RECORDED_TIME) FROM screening scr WHERE qed.FACILITY_ID = scr.FACILITY_ID),
              'profile', JSON_ARRAY('http://shinny.org/StructureDefinition/shin-ny-organization')
          ),
          'identifier', JSON_ARRAY(
              JSON_OBJECT(
                  'system', qed.FACILITY_ID,
                  'value', LOWER(REPLACE(qed.FACILITY_LONG_NAME, ' ', '-')) || '-' || LOWER(REPLACE(qed.ORGANIZATION_TYPE, ' ', '-')) || '-' || LOWER(REPLACE(qed.FACILITY_ID, ' ', '-'))
              )
          ),
          'active', true,
          CASE WHEN qed.ORGANIZATION_TYPE IS NOT NULL THEN 'type' ELSE NULL END, JSON_ARRAY(
              JSON_OBJECT(
                  'coding', JSON_ARRAY(
                      JSON_OBJECT(
                          'system', 'http://terminology.hl7.org/CodeSystem/organization-type',
                          'code', qed.ORGANIZATION_TYPE,
                          'display', qed.ORGANIZATION_TYPE
                      )
                  )
              )
          ),
          'name', qed.FACILITY_LONG_NAME,
          'address', JSON_ARRAY(
              JSON_OBJECT(
                  'text', CONCAT(qed.FACILITY_ADDRESS1,' ', qed.FACILITY_ADDRESS2),
                  'city', qed.FACILITY_CITY,
                  'state', qed.FACILITY_STATE,
                  'postalCode', CAST(qed.FACILITY_ZIP AS TEXT)
              )
          )
      )
  ) AS FHIR_Organization
  FROM qe_admin_data qed WHERE qed.FACILITY_ID!='' AND qed.FACILITY_ID iS NOT NULL ORDER BY qed.FACILITY_ID),
  derived_from_cte AS (
    SELECT
        parent_question_code,
        parent_question_sl_no,
        json_group_array(json_object('reference', derived_reference)) AS derived_from_references
    FROM (
        SELECT
            acw.QUESTION_CODE AS parent_question_code,
            acw.QUESTION_SLNO AS parent_question_sl_no,
            CONCAT('Observation/ObservationResponseQuestion_', acw_sub.QUESTION_SLNO) AS derived_reference
        FROM
            ahc_cross_walk acw
        INNER JOIN ahc_cross_walk acw_sub ON acw_sub."QUESTION_SLNO_REFERENCE" = acw.QUESTION_SLNO
        GROUP BY
            acw.QUESTION_CODE,
            acw.QUESTION_SLNO,
            acw_sub.QUESTION_SLNO
    ) AS distinct_references
    GROUP BY
        parent_question_code,
        parent_question_sl_no
  ),
  cte_fhir_observation AS (
    SELECT scr.PAT_MRN_ID, JSON_OBJECT(
      'fullUrl', CONCAT('observationResponseQuestion_',acw.QUESTION_SLNO),
      'resource', JSON_OBJECT(
        'resourceType', 'Observation',
            'id', CONCAT('observationResponseQuestion_',acw.QUESTION_SLNO),
            'meta', JSON_OBJECT(
                'lastUpdated', RECORDED_TIME,
                'profile', JSON_ARRAY('http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse')
            ),
            'status', SCREENING_STATUS_CODE,
            'category', json_array(json_object('coding',json_array(json_object('system','http://terminology.hl7.org/CodeSystem/observation-category','code','social-history','display','Social History'))),json_object('coding',json_array(json_object('system','http://terminology.hl7.org/CodeSystem/observation-category','code','survey','display','Survey'))),json_object('coding',json_array(json_object('system','http://hl7.org/fhir/us/sdoh-clinicalcare/CodeSystem/SDOHCC-CodeSystemTemporaryCodes','code',CASE WHEN sdr.Code IS NOT NULL AND sdr.Code != '' THEN sdr.Code ELSE 'sdoh-category-unspecified' END,'display',CASE WHEN sdr.Display IS NOT NULL AND sdr.Display != '' THEN sdr.Display ELSE 'SDOH Category Unspecified' END)))),
            CASE WHEN QUESTION_CODE_DESCRIPTION IS NOT NULL THEN 'code' ELSE NULL END, json_object(
              'coding', json_array(json_object(CASE WHEN QUESTION_CODE_SYSTEM_NAME IS NOT NULL THEN 'system' ELSE NULL END,QUESTION_CODE_SYSTEM_NAME,CASE WHEN scr.QUESTION_CODE IS NOT NULL THEN 'code' ELSE NULL END,scr.QUESTION_CODE,CASE WHEN QUESTION_CODE_DESCRIPTION IS NOT NULL THEN 'display' ELSE NULL END,QUESTION_CODE_DESCRIPTION))
            ),
            'subject', json_object('reference',CONCAT('Patient/',PAT_MRN_ID)),
            'effectiveDateTime', RECORDED_TIME,
            'issued', RECORDED_TIME,
            'valueCodeableConcept',CASE WHEN acw.CALCULATED_FIELD = 1 THEN json_object('coding',json_array(json_object('system','http://unitsofmeasure.org','code',acw."UCUM_UNITS",'display',ANSWER_CODE_DESCRIPTION))) ELSE json_object('coding',json_array(json_object('system','http://loinc.org','code',scr.ANSWER_CODE,'display',ANSWER_CODE_DESCRIPTION))) END,
            CASE WHEN acw.CALCULATED_FIELD = 1 THEN 'derivedFrom' ELSE NULL END, COALESCE(df.derived_from_references, json_array()),
            'interpretation',json_array(json_object('coding',json_array(json_object('system','http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation','code','POS','display','Positive'))))
        )
  ) AS FHIR_Observation
  FROM screening scr LEFT JOIN sdoh_domain_reference sdr ON scr.SDOH_DOMAIN = sdr.Display LEFT JOIN (SELECT DISTINCT QUESTION_CODE, QUESTION_SLNO, "UCUM_UNITS", CALCULATED_FIELD FROM ahc_cross_walk) acw ON acw.QUESTION_SLNO = scr.src_file_row_number LEFT JOIN derived_from_cte df ON df.parent_question_sl_no = scr.src_file_row_number WHERE acw.QUESTION_SLNO IS NOT NULL ORDER BY acw.QUESTION_SLNO),
  cte_fhir_encounter AS (
    SELECT DISTINCT ON (CONCAT(scr.ENCOUNTER_ID,scr.FACILITY_ID,'_',scr.PAT_MRN_ID)) scr.PAT_MRN_ID, JSON_OBJECT(
      'fullUrl', CASE WHEN scr.ENCOUNTER_ID IS NOT NULL THEN scr.ENCOUNTER_ID ELSE CONCAT('encounter_',scr.FACILITY_ID,'_',scr.PAT_MRN_ID) END,
      'resource', JSON_OBJECT(
        'resourceType', 'Encounter',
        'id', CASE WHEN scr.ENCOUNTER_ID IS NOT NULL THEN scr.ENCOUNTER_ID ELSE CONCAT('encounter_',scr.FACILITY_ID,'_',scr.PAT_MRN_ID) END,
        'meta', JSON_OBJECT(
            'lastUpdated', RECORDED_TIME,
            'profile', JSON_ARRAY('http://shinny.org/StructureDefinition/shin-ny-encounter')
        ),
        'status', CASE WHEN ENCOUNTER_STATUS_CODE IS NOT NULL THEN ENCOUNTER_STATUS_CODE ELSE 'unknown' END,
        'class', json_object('system',ENCOUNTER_CLASS_CODE_SYSTEM,CASE WHEN ENCOUNTER_CLASS_CODE IS NOT NULL THEN 'code' ELSE NULL END,ENCOUNTER_CLASS_CODE),
        'type', json_array(json_object('coding',json_array(json_object('system',ENCOUNTER_TYPE_CODE_SYSTEM,CASE WHEN ENCOUNTER_TYPE_CODE IS NOT NULL THEN 'code' ELSE NULL END,  CAST(ENCOUNTER_TYPE_CODE AS TEXT),'display', ENCOUNTER_TYPE_CODE_DESCRIPTION  )),'text',ENCOUNTER_TYPE_CODE_DESCRIPTION)),
        'subject', json_object('reference',CONCAT('Patient/',scr.FACILITY_ID,'-',scr.PAT_MRN_ID))
      )
  ) AS FHIR_Encounter
  FROM screening scr LEFT JOIN cte_fhir_patient ON scr.PAT_MRN_ID=cte_fhir_patient.PAT_MRN_ID ORDER BY scr.ENCOUNTER_ID, scr.RECORDED_TIME DESC)
  SELECT cte.PAT_MRN_ID, json_object(
    'resourceType', 'Bundle',
    'id', CONCAT('5b267520-ecca-11ee-b7b5-91e1e5c22e35','_',PAT_MRN_ID),
    'type', 'transaction',
    'meta', JSON_OBJECT(
        'lastUpdated', (SELECT MAX(scr.RECORDED_TIME) FROM screening scr)
    ),
    'timestamp', '2024-03-28T06:13:55.186Z',
    'entry', json(json_group_array(cte.json_data))
    ) AS FHIR_Bundle
    FROM (
      SELECT PAT_MRN_ID, FHIR_Organization AS json_data FROM cte_fhir_org
      UNION ALL
      SELECT PAT_MRN_ID, FHIR_Patient AS json_data FROM cte_fhir_patient
      UNION ALL
      SELECT PAT_MRN_ID, FHIR_Observation AS json_data FROM cte_fhir_observation
      UNION ALL
      SELECT PAT_MRN_ID, FHIR_Encounter AS json_data FROM cte_fhir_encounter
      UNION ALL
      SELECT PAT_MRN_ID, FHIR_Consent AS json_data FROM cte_fhir_consent
    ) AS cte
    GROUP BY cte.PAT_MRN_ID;

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
COPY (SELECT * FROM orch_session_issue_classification) TO '/home/alan/workspaces/github.com/alan-francis/1115-hub/support/assurance/ahc-hrsn-elt/screening/results-test-e2e/diagnostics.xlsx' WITH (FORMAT GDAL, DRIVER 'xlsx');
```
No STDOUT emitted by `emitDiagnostics` (status: `0`).

No STDERR emitted by `emitDiagnostics`.

    

## jsonResult_5

```sql
-- preambleSQL
SET autoinstall_known_extensions=true;
SET autoload_known_extensions=true;
-- end preambleSQL
SELECT PAT_MRN_ID, FHIR_Bundle as FHIR FROM fhir_bundle
        
```
### `jsonResult_5` STDOUT (status: `0`)
```json
[{"PAT_MRN_ID":"healthelink-20240305-testcase3-MRN","FHIR":"{\"resourceType\":\"Bundle\",\"id\":\"5b267520-ecca-11ee-b7b5-91e1e5c22e35_healthelink-20240305-testcase3-MRN\",\"type\":\"transaction\",\"meta\":{\"lastUpdated\":\"03/05/94 13:08\"},\"timestamp\":\"2024-03-28T06:13:55.186Z\",\"entry\":[{\"fullUrl\":\"albany-medical-center-hospital-amc\",\"resource\":{\"resourceType\":\"Organization\",\"id\":\"AMC\",\"meta\":{\"lastUpdated\":\"03/05/94 13:08\",\"profile\":[\"http://shinny.org/StructureDefinition/shin-ny-organization\"]},\"identifier\":[{\"system\":\"AMC\",\"value\":\"albany-medical-center-hospital-amc\"}],\"active\":true,\"type\":[{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/organization-type\",\"code\":\"Hospital\",\"display\":\"Hospital\"}]}],\"name\":\"Albany Medical Center\",\"address\":[{\"text\":\"43 New Scotland Ave \",\"city\":\"Albany\",\"state\":\"New York\",\"postalCode\":\"12208\"}]}},{\"fullUrl\":\"consentForhealthelink-20240305-testcase3-MRN\",\"resource\":{\"resourceType\":\"Consent\",\"id\":\"consentForhealthelink-20240305-testcase3-MRN\",\"meta\":{\"lastUpdated\":\"03/05/94 13:08\",\"profile\":[\"http://shinny.org/StructureDefinition/shin-ny-organization\"]},\"status\":\"active\",\"scope\":{\"coding\":[{\"code\":\"treatment\"}],\"text\":\"treatment\"},\"category\":[{\"coding\":[{\"display\":\"Patient Consent\",\"code\":\"59284-0\",\"system\":\"http://loinc.org\"}]}],\"patient\":{\"reference\":\"Patient/healthelink-20240305-testcase3-MRN\"},\"dateTime\":\"03/05/94 13:08\",\"organization\":[{\"reference\":\"Organization/AMC\"}]}},{\"fullUrl\":\"AMC-healthelink-20240305-testcase3-MRN\",\"resource\":{\"resourceType\":\"Patient\",\"id\":\"AMC-healthelink-20240305-testcase3-MRN\",\"meta\":{\"lastUpdated\":\"03/05/94 13:08\",\"profile\":[\"http://shinny.org/StructureDefinition/shinny-patient\"]},\"language\":\"myv\",\"extension\":[{\"extension\":[{\"url\":\"ombCategory\",\"valueCoding\":{\"system\":\"urn:oid:2.16.840.1.113883.6.238\",\"code\":\"1142-9\",\"display\":\"Coquille\"}}],\"url\":\"http://hl7.org/fhir/us/core/StructureDefinition/us-core-race\"},{\"extension\":[{\"url\":\"ombCategory\",\"valueCoding\":{\"system\":\"urn:oid:2.16.840.1.113883.6.238\",\"code\":\"2137-8\",\"display\":\"Spaniard\"}}],\"url\":\"http://hl7.org/fhir/us/core/StructureDefinition/us-core-ethnicity\"},{\"url\":\"http://hl7.org/fhir/us/core/StructureDefinition/us-core-birthsex\",\"valueCode\":\"UNK\"},{\"url\":\"http://shinny.org/StructureDefinition/shinny-sexual-orientation\",\"valueCodeableConcept\":{\"coding\":[{\"system\":\"http://snomed.info/sct\",\"code\":\"20430005\",\"display\":\"Heterosexual\"}]}}],\"identifier\":[{\"type\":{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/v2-0203\",\"code\":\"MR\"}],\"text\":\"Medical Record Number\"},\"system\":\"AMC\",\"value\":\"healthelink-20240305-testcase3-MRN\",\"assigner\":{\"reference\":\"Organization/AMC\"}},{\"type\":{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/v2-0203\",\"code\":\"MA\"}]},\"system\":\"http://www.medicaid.gov/\",\"value\":\"QK65113X\",\"assigner\":{\"reference\":\"Organization/2.16.840.1.113883.3.249\"}},{\"type\":{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/v2-0203\",\"code\":\"PN\"}]},\"system\":\"http://www.acme.com/identifiers/patient\",\"value\":\"healthelinkH0QF7VFUQO\"}],\"name\":[{\"text\":\"Summer Nathaniel Bautista\",\"family\":\"Bautista\",\"given\":[\"Summer\",\"Nathaniel\"]}],\"gender\":\"UNK\",\"birthDate\":\"2004-06-20\",\"address\":[{\"text\":\"519 Larsen Ports Apt. 379 Suite 11\",\"line\":[\"519 Larsen Ports Apt. 379\",\"Suite 11\"],\"city\":\"North Tonawanda\",\"state\":\"NY\",\"postalCode\":\"14120\"}],\"communication\":[{\"language\":{\"coding\":[{\"code\":\"myv\"}]},\"preferred\":true}]}},{\"fullUrl\":\"healthelinkGYNB8RC1AS\",\"resource\":{\"resourceType\":\"Encounter\",\"id\":\"healthelinkGYNB8RC1AS\",\"meta\":{\"lastUpdated\":\"01/27/02 15:42\",\"profile\":[\"http://shinny.org/StructureDefinition/shin-ny-encounter\"]},\"status\":\"entered-in-error\",\"class\":{\"system\":\"http://terminology.hl7.org/CodeSystem/v3-ActCode\",\"code\":\"ACUTE\"},\"type\":[{\"coding\":[{\"system\":\"http://snomed.info/sct\",\"code\":\"32166003\",\"display\":\"History taking, self-administered, questionnaire\"}],\"text\":\"History taking, self-administered, questionnaire\"}],\"subject\":{\"reference\":\"Patient/AMC-healthelink-20240305-testcase3-MRN\"}}},{\"fullUrl\":\"healthelink19VCFAQISN\",\"resource\":{\"resourceType\":\"Encounter\",\"id\":\"healthelink19VCFAQISN\",\"meta\":{\"lastUpdated\":\"03/05/94 13:08\",\"profile\":[\"http://shinny.org/StructureDefinition/shin-ny-encounter\"]},\"status\":\"entered-in-error\",\"class\":{\"system\":\"http://terminology.hl7.org/CodeSystem/v3-ActCode\",\"code\":\"ACUTE\"},\"type\":[{\"coding\":[{\"system\":\"http://snomed.info/sct\",\"code\":\"32166003\",\"display\":\"History taking, self-administered, questionnaire\"}],\"text\":\"History taking, self-administered, questionnaire\"}],\"subject\":{\"reference\":\"Patient/AMC-healthelink-20240305-testcase3-MRN\"}}},{\"fullUrl\":\"observationResponseQuestion_1\",\"resource\":{\"resourceType\":\"Observation\",\"id\":\"observationResponseQuestion_1\",\"meta\":{\"lastUpdated\":\"01/27/02 15:42\",\"profile\":[\"http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse\"]},\"status\":\"unknown\",\"category\":[{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/observation-category\",\"code\":\"social-history\",\"display\":\"Social History\"}]},{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/observation-category\",\"code\":\"survey\",\"display\":\"Survey\"}]},{\"coding\":[{\"system\":\"http://hl7.org/fhir/us/sdoh-clinicalcare/CodeSystem/SDOHCC-CodeSystemTemporaryCodes\",\"code\":\"sdoh-category-unspecified\",\"display\":\"SDOH Category Unspecified\"}]}],\"code\":{\"coding\":[{\"system\":\"http://loinc.org\",\"code\":\"71802-3\",\"display\":\"What is your living situation today?\"}]},\"subject\":{\"reference\":\"Patient/healthelink-20240305-testcase3-MRN\"},\"effectiveDateTime\":\"01/27/02 15:42\",\"issued\":\"01/27/02 15:42\",\"valueCodeableConcept\":{\"coding\":[{\"system\":\"http://loinc.org\",\"code\":\"LA31994-9\",\"display\":\"I have a place to live today, but I am worried about losing it in the future\"}]},\"interpretation\":[{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation\",\"code\":\"POS\",\"display\":\"Positive\"}]}]}},{\"fullUrl\":\"observationResponseQuestion_2\",\"resource\":{\"resourceType\":\"Observation\",\"id\":\"observationResponseQuestion_2\",\"meta\":{\"lastUpdated\":\"01/27/02 15:42\",\"profile\":[\"http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse\"]},\"status\":\"unknown\",\"category\":[{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/observation-category\",\"code\":\"social-history\",\"display\":\"Social History\"}]},{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/observation-category\",\"code\":\"survey\",\"display\":\"Survey\"}]},{\"coding\":[{\"system\":\"http://hl7.org/fhir/us/sdoh-clinicalcare/CodeSystem/SDOHCC-CodeSystemTemporaryCodes\",\"code\":\"sdoh-category-unspecified\",\"display\":\"SDOH Category Unspecified\"}]}],\"code\":{\"coding\":[{\"system\":\"http://loinc.org\",\"code\":\"96778-6\",\"display\":\"Think about the place you live. Do you have problems with any of the following?\"}]},\"subject\":{\"reference\":\"Patient/healthelink-20240305-testcase3-MRN\"},\"effectiveDateTime\":\"01/27/02 15:42\",\"issued\":\"01/27/02 15:42\",\"valueCodeableConcept\":{\"coding\":[{\"system\":\"http://loinc.org\",\"code\":\"LA31997-2\",\"display\":\"Lead paint or pipes\"}]},\"interpretation\":[{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation\",\"code\":\"POS\",\"display\":\"Positive\"}]}]}},{\"fullUrl\":\"observationResponseQuestion_3\",\"resource\":{\"resourceType\":\"Observation\",\"id\":\"observationResponseQuestion_3\",\"meta\":{\"lastUpdated\":\"01/27/02 15:42\",\"profile\":[\"http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse\"]},\"status\":\"unknown\",\"category\":[{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/observation-category\",\"code\":\"social-history\",\"display\":\"Social History\"}]},{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/observation-category\",\"code\":\"survey\",\"display\":\"Survey\"}]},{\"coding\":[{\"system\":\"http://hl7.org/fhir/us/sdoh-clinicalcare/CodeSystem/SDOHCC-CodeSystemTemporaryCodes\",\"code\":\"food-insecurity\",\"display\":\"Food Insecurity\"}]}],\"code\":{\"coding\":[{\"system\":\"http://loinc.org\",\"code\":\"88122-7\",\"display\":\"Within the past 12 months, you worried that your food would run out before you got money to buy more.\"}]},\"subject\":{\"reference\":\"Patient/healthelink-20240305-testcase3-MRN\"},\"effectiveDateTime\":\"01/27/02 15:42\",\"issued\":\"01/27/02 15:42\",\"valueCodeableConcept\":{\"coding\":[{\"system\":\"http://loinc.org\",\"code\":\"LA6729-3\",\"display\":\"Sometimes true\"}]},\"interpretation\":[{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation\",\"code\":\"POS\",\"display\":\"Positive\"}]}]}},{\"fullUrl\":\"observationResponseQuestion_4\",\"resource\":{\"resourceType\":\"Observation\",\"id\":\"observationResponseQuestion_4\",\"meta\":{\"lastUpdated\":\"01/27/02 15:42\",\"profile\":[\"http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse\"]},\"status\":\"unknown\",\"category\":[{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/observation-category\",\"code\":\"social-history\",\"display\":\"Social History\"}]},{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/observation-category\",\"code\":\"survey\",\"display\":\"Survey\"}]},{\"coding\":[{\"system\":\"http://hl7.org/fhir/us/sdoh-clinicalcare/CodeSystem/SDOHCC-CodeSystemTemporaryCodes\",\"code\":\"food-insecurity\",\"display\":\"Food Insecurity\"}]}],\"code\":{\"coding\":[{\"system\":\"http://loinc.org\",\"code\":\"88123-5\",\"display\":\"Within the past 12 months, the food you bought just didn't last and you didn't have money to get more.\"}]},\"subject\":{\"reference\":\"Patient/healthelink-20240305-testcase3-MRN\"},\"effectiveDateTime\":\"01/27/02 15:42\",\"issued\":\"01/27/02 15:42\",\"valueCodeableConcept\":{\"coding\":[{\"system\":\"http://loinc.org\",\"code\":\"LA6729-3\",\"display\":\"Sometimes true\"}]},\"interpretation\":[{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation\",\"code\":\"POS\",\"display\":\"Positive\"}]}]}},{\"fullUrl\":\"observationResponseQuestion_5\",\"resource\":{\"resourceType\":\"Observation\",\"id\":\"observationResponseQuestion_5\",\"meta\":{\"lastUpdated\":\"01/27/02 15:42\",\"profile\":[\"http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse\"]},\"status\":\"unknown\",\"category\":[{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/observation-category\",\"code\":\"social-history\",\"display\":\"Social History\"}]},{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/observation-category\",\"code\":\"survey\",\"display\":\"Survey\"}]},{\"coding\":[{\"system\":\"http://hl7.org/fhir/us/sdoh-clinicalcare/CodeSystem/SDOHCC-CodeSystemTemporaryCodes\",\"code\":\"transportation-insecurity\",\"display\":\"Transportation Insecurity\"}]}],\"code\":{\"coding\":[{\"system\":\"http://loinc.org\",\"code\":\"93030-5\",\"display\":\"In the past 12 months, has lack of reliable transportation kept you from medical appointments, meetings, work or from getting things needed for daily living?\"}]},\"subject\":{\"reference\":\"Patient/healthelink-20240305-testcase3-MRN\"},\"effectiveDateTime\":\"01/27/02 15:42\",\"issued\":\"01/27/02 15:42\",\"valueCodeableConcept\":{\"coding\":[{\"system\":\"http://loinc.org\",\"code\":\"LA33-6\",\"display\":\"Yes\"}]},\"interpretation\":[{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation\",\"code\":\"POS\",\"display\":\"Positive\"}]}]}},{\"fullUrl\":\"observationResponseQuestion_6\",\"resource\":{\"resourceType\":\"Observation\",\"id\":\"observationResponseQuestion_6\",\"meta\":{\"lastUpdated\":\"01/27/02 15:42\",\"profile\":[\"http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse\"]},\"status\":\"unknown\",\"category\":[{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/observation-category\",\"code\":\"social-history\",\"display\":\"Social History\"}]},{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/observation-category\",\"code\":\"survey\",\"display\":\"Survey\"}]},{\"coding\":[{\"system\":\"http://hl7.org/fhir/us/sdoh-clinicalcare/CodeSystem/SDOHCC-CodeSystemTemporaryCodes\",\"code\":\"sdoh-category-unspecified\",\"display\":\"SDOH Category Unspecified\"}]}],\"code\":{\"coding\":[{\"system\":\"http://loinc.org\",\"code\":\"96779-4\",\"display\":\"In the past 12 months has the electric, gas, oil, or water company threatened to shut off services in your home?\"}]},\"subject\":{\"reference\":\"Patient/healthelink-20240305-testcase3-MRN\"},\"effectiveDateTime\":\"01/27/02 15:42\",\"issued\":\"01/27/02 15:42\",\"valueCodeableConcept\":{\"coding\":[{\"system\":\"http://loinc.org\",\"code\":\"LA32002-0\",\"display\":\"Already shut off\"}]},\"interpretation\":[{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation\",\"code\":\"POS\",\"display\":\"Positive\"}]}]}},{\"fullUrl\":\"observationResponseQuestion_7\",\"resource\":{\"resourceType\":\"Observation\",\"id\":\"observationResponseQuestion_7\",\"meta\":{\"lastUpdated\":\"01/27/02 15:42\",\"profile\":[\"http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse\"]},\"status\":\"unknown\",\"category\":[{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/observation-category\",\"code\":\"social-history\",\"display\":\"Social History\"}]},{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/observation-category\",\"code\":\"survey\",\"display\":\"Survey\"}]},{\"coding\":[{\"system\":\"http://hl7.org/fhir/us/sdoh-clinicalcare/CodeSystem/SDOHCC-CodeSystemTemporaryCodes\",\"code\":\"sdoh-category-unspecified\",\"display\":\"SDOH Category Unspecified\"}]}],\"code\":{\"coding\":[{\"system\":\"http://loinc.org\",\"code\":\"95618-5\",\"display\":\"How often does anyone, including family and friends, physically hurt you?\"}]},\"subject\":{\"reference\":\"Patient/healthelink-20240305-testcase3-MRN\"},\"effectiveDateTime\":\"01/27/02 15:42\",\"issued\":\"01/27/02 15:42\",\"valueCodeableConcept\":{\"coding\":[{\"system\":\"http://loinc.org\",\"code\":\"LA10066-1\",\"display\":\"Rarely\"}]},\"interpretation\":[{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation\",\"code\":\"POS\",\"display\":\"Positive\"}]}]}},{\"fullUrl\":\"observationResponseQuestion_8\",\"resource\":{\"resourceType\":\"Observation\",\"id\":\"observationResponseQuestion_8\",\"meta\":{\"lastUpdated\":\"01/27/02 15:42\",\"profile\":[\"http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse\"]},\"status\":\"unknown\",\"category\":[{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/observation-category\",\"code\":\"social-history\",\"display\":\"Social History\"}]},{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/observation-category\",\"code\":\"survey\",\"display\":\"Survey\"}]},{\"coding\":[{\"system\":\"http://hl7.org/fhir/us/sdoh-clinicalcare/CodeSystem/SDOHCC-CodeSystemTemporaryCodes\",\"code\":\"sdoh-category-unspecified\",\"display\":\"SDOH Category Unspecified\"}]}],\"code\":{\"coding\":[{\"system\":\"http://loinc.org\",\"code\":\"95617-7\",\"display\":\"How often does anyone, including family and friends, insult or talk down to you?\"}]},\"subject\":{\"reference\":\"Patient/healthelink-20240305-testcase3-MRN\"},\"effectiveDateTime\":\"01/27/02 15:42\",\"issued\":\"01/27/02 15:42\",\"valueCodeableConcept\":{\"coding\":[{\"system\":\"http://loinc.org\",\"code\":\"LA6270-8\",\"display\":\"Never\"}]},\"interpretation\":[{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation\",\"code\":\"POS\",\"display\":\"Positive\"}]}]}},{\"fullUrl\":\"observationResponseQuestion_9\",\"resource\":{\"resourceType\":\"Observation\",\"id\":\"observationResponseQuestion_9\",\"meta\":{\"lastUpdated\":\"01/27/02 15:42\",\"profile\":[\"http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse\"]},\"status\":\"unknown\",\"category\":[{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/observation-category\",\"code\":\"social-history\",\"display\":\"Social History\"}]},{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/observation-category\",\"code\":\"survey\",\"display\":\"Survey\"}]},{\"coding\":[{\"system\":\"http://hl7.org/fhir/us/sdoh-clinicalcare/CodeSystem/SDOHCC-CodeSystemTemporaryCodes\",\"code\":\"sdoh-category-unspecified\",\"display\":\"SDOH Category Unspecified\"}]}],\"code\":{\"coding\":[{\"system\":\"http://loinc.org\",\"code\":\"95616-9\",\"display\":\"How often does anyone, including family and friends, threaten you with harm?\"}]},\"subject\":{\"reference\":\"Patient/healthelink-20240305-testcase3-MRN\"},\"effectiveDateTime\":\"01/27/02 15:42\",\"issued\":\"01/27/02 15:42\",\"valueCodeableConcept\":{\"coding\":[{\"system\":\"http://loinc.org\",\"code\":\"LA16644-9\",\"display\":\"Fairly often\"}]},\"interpretation\":[{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation\",\"code\":\"POS\",\"display\":\"Positive\"}]}]}},{\"fullUrl\":\"observationResponseQuestion_10\",\"resource\":{\"resourceType\":\"Observation\",\"id\":\"observationResponseQuestion_10\",\"meta\":{\"lastUpdated\":\"01/27/02 15:42\",\"profile\":[\"http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse\"]},\"status\":\"unknown\",\"category\":[{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/observation-category\",\"code\":\"social-history\",\"display\":\"Social History\"}]},{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/observation-category\",\"code\":\"survey\",\"display\":\"Survey\"}]},{\"coding\":[{\"system\":\"http://hl7.org/fhir/us/sdoh-clinicalcare/CodeSystem/SDOHCC-CodeSystemTemporaryCodes\",\"code\":\"sdoh-category-unspecified\",\"display\":\"SDOH Category Unspecified\"}]}],\"code\":{\"coding\":[{\"system\":\"http://loinc.org\",\"code\":\"95615-1\",\"display\":\"How often does anyone, including family and friends, scream or curse at you?\"}]},\"subject\":{\"reference\":\"Patient/healthelink-20240305-testcase3-MRN\"},\"effectiveDateTime\":\"01/27/02 15:42\",\"issued\":\"01/27/02 15:42\",\"valueCodeableConcept\":{\"coding\":[{\"system\":\"http://loinc.org\",\"code\":\"LA10082-8\",\"display\":\"Sometimes\"}]},\"interpretation\":[{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation\",\"code\":\"POS\",\"display\":\"Positive\"}]}]}},{\"fullUrl\":\"observationResponseQuestion_11\",\"resource\":{\"resourceType\":\"Observation\",\"id\":\"observationResponseQuestion_11\",\"meta\":{\"lastUpdated\":\"01/27/02 15:42\",\"profile\":[\"http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse\"]},\"status\":\"unknown\",\"category\":[{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/observation-category\",\"code\":\"social-history\",\"display\":\"Social History\"}]},{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/observation-category\",\"code\":\"survey\",\"display\":\"Survey\"}]},{\"coding\":[{\"system\":\"http://hl7.org/fhir/us/sdoh-clinicalcare/CodeSystem/SDOHCC-CodeSystemTemporaryCodes\",\"code\":\"sdoh-category-unspecified\",\"display\":\"SDOH Category Unspecified\"}]}],\"code\":{\"coding\":[{\"system\":\"http://loinc.org\",\"code\":\"95614-4\",\"display\":\"Total Safety Score\"}]},\"subject\":{\"reference\":\"Patient/healthelink-20240305-testcase3-MRN\"},\"effectiveDateTime\":\"01/27/02 15:42\",\"issued\":\"01/27/02 15:42\",\"valueCodeableConcept\":{\"coding\":[{\"system\":\"http://unitsofmeasure.org\",\"code\":\"{score}\",\"display\":\"10\"}]},\"derivedFrom\":[{\"reference\":\"Observation/ObservationResponseQuestion_10\"},{\"reference\":\"Observation/ObservationResponseQuestion_9\"},{\"reference\":\"Observation/ObservationResponseQuestion_8\"},{\"reference\":\"Observation/ObservationResponseQuestion_7\"}],\"interpretation\":[{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation\",\"code\":\"POS\",\"display\":\"Positive\"}]}]}},{\"fullUrl\":\"observationResponseQuestion_12\",\"resource\":{\"resourceType\":\"Observation\",\"id\":\"observationResponseQuestion_12\",\"meta\":{\"lastUpdated\":\"03/05/94 13:08\",\"profile\":[\"http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse\"]},\"status\":\"unknown\",\"category\":[{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/observation-category\",\"code\":\"social-history\",\"display\":\"Social History\"}]},{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/observation-category\",\"code\":\"survey\",\"display\":\"Survey\"}]},{\"coding\":[{\"system\":\"http://hl7.org/fhir/us/sdoh-clinicalcare/CodeSystem/SDOHCC-CodeSystemTemporaryCodes\",\"code\":\"financial-insecurity\",\"display\":\"Financial Insecurity\"}]}],\"code\":{\"coding\":[{\"system\":\"http://loinc.org\",\"code\":\"76513-1\",\"display\":\"How hard is it for you to pay for the very basics like food, housing, medical care, and heating? Would you say it is\"}]},\"subject\":{\"reference\":\"Patient/healthelink-20240305-testcase3-MRN\"},\"effectiveDateTime\":\"03/05/94 13:08\",\"issued\":\"03/05/94 13:08\",\"valueCodeableConcept\":{\"coding\":[{\"system\":\"http://loinc.org\",\"code\":\"LA15832-1\",\"display\":\"Very hard\"}]},\"interpretation\":[{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation\",\"code\":\"POS\",\"display\":\"Positive\"}]}]}},{\"fullUrl\":\"observationResponseQuestion_13\",\"resource\":{\"resourceType\":\"Observation\",\"id\":\"observationResponseQuestion_13\",\"meta\":{\"lastUpdated\":\"03/05/94 13:08\",\"profile\":[\"http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse\"]},\"status\":\"unknown\",\"category\":[{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/observation-category\",\"code\":\"social-history\",\"display\":\"Social History\"}]},{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/observation-category\",\"code\":\"survey\",\"display\":\"Survey\"}]},{\"coding\":[{\"system\":\"http://hl7.org/fhir/us/sdoh-clinicalcare/CodeSystem/SDOHCC-CodeSystemTemporaryCodes\",\"code\":\"employment-status\",\"display\":\"Employment Status\"}]}],\"code\":{\"coding\":[{\"system\":\"http://loinc.org\",\"code\":\"96780-2\",\"display\":\"Do you want help finding or keeping work or a job?\"}]},\"subject\":{\"reference\":\"Patient/healthelink-20240305-testcase3-MRN\"},\"effectiveDateTime\":\"03/05/94 13:08\",\"issued\":\"03/05/94 13:08\",\"valueCodeableConcept\":{\"coding\":[{\"system\":\"http://loinc.org\",\"code\":\"LA31983-2\",\"display\":\"I do not need or want help\"}]},\"interpretation\":[{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation\",\"code\":\"POS\",\"display\":\"Positive\"}]}]}},{\"fullUrl\":\"observationResponseQuestion_14\",\"resource\":{\"resourceType\":\"Observation\",\"id\":\"observationResponseQuestion_14\",\"meta\":{\"lastUpdated\":\"03/05/94 13:08\",\"profile\":[\"http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse\"]},\"status\":\"unknown\",\"category\":[{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/observation-category\",\"code\":\"social-history\",\"display\":\"Social History\"}]},{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/observation-category\",\"code\":\"survey\",\"display\":\"Survey\"}]},{\"coding\":[{\"system\":\"http://hl7.org/fhir/us/sdoh-clinicalcare/CodeSystem/SDOHCC-CodeSystemTemporaryCodes\",\"code\":\"social-connection\",\"display\":\"Social Connection\"}]}],\"code\":{\"coding\":[{\"system\":\"http://loinc.org\",\"code\":\"96781-0\",\"display\":\"If for any reason you need help with day-to-day activities such as bathing, preparing meals, shopping, managing finances, etc., do you get the help you need?\"}]},\"subject\":{\"reference\":\"Patient/healthelink-20240305-testcase3-MRN\"},\"effectiveDateTime\":\"03/05/94 13:08\",\"issued\":\"03/05/94 13:08\",\"valueCodeableConcept\":{\"coding\":[{\"system\":\"http://loinc.org\",\"code\":\"LA31979-0\",\"display\":\"I need a lot more help\"}]},\"interpretation\":[{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation\",\"code\":\"POS\",\"display\":\"Positive\"}]}]}},{\"fullUrl\":\"observationResponseQuestion_15\",\"resource\":{\"resourceType\":\"Observation\",\"id\":\"observationResponseQuestion_15\",\"meta\":{\"lastUpdated\":\"03/05/94 13:08\",\"profile\":[\"http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse\"]},\"status\":\"unknown\",\"category\":[{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/observation-category\",\"code\":\"social-history\",\"display\":\"Social History\"}]},{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/observation-category\",\"code\":\"survey\",\"display\":\"Survey\"}]},{\"coding\":[{\"system\":\"http://hl7.org/fhir/us/sdoh-clinicalcare/CodeSystem/SDOHCC-CodeSystemTemporaryCodes\",\"code\":\"social-connection\",\"display\":\"Social Connection\"}]}],\"code\":{\"coding\":[{\"system\":\"http://loinc.org\",\"code\":\"93159-2\",\"display\":\"How often do you feel lonely or isolated from those around you?\"}]},\"subject\":{\"reference\":\"Patient/healthelink-20240305-testcase3-MRN\"},\"effectiveDateTime\":\"03/05/94 13:08\",\"issued\":\"03/05/94 13:08\",\"valueCodeableConcept\":{\"coding\":[{\"system\":\"http://loinc.org\",\"code\":\"LA10044-8\",\"display\":\"Often\"}]},\"interpretation\":[{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation\",\"code\":\"POS\",\"display\":\"Positive\"}]}]}},{\"fullUrl\":\"observationResponseQuestion_16\",\"resource\":{\"resourceType\":\"Observation\",\"id\":\"observationResponseQuestion_16\",\"meta\":{\"lastUpdated\":\"03/05/94 13:08\",\"profile\":[\"http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse\"]},\"status\":\"unknown\",\"category\":[{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/observation-category\",\"code\":\"social-history\",\"display\":\"Social History\"}]},{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/observation-category\",\"code\":\"survey\",\"display\":\"Survey\"}]},{\"coding\":[{\"system\":\"http://hl7.org/fhir/us/sdoh-clinicalcare/CodeSystem/SDOHCC-CodeSystemTemporaryCodes\",\"code\":\"sdoh-category-unspecified\",\"display\":\"SDOH Category Unspecified\"}]}],\"code\":{\"coding\":[{\"system\":\"http://loinc.org\",\"code\":\"97027-7\",\"display\":\"Do you speak a language other than English at home?\"}]},\"subject\":{\"reference\":\"Patient/healthelink-20240305-testcase3-MRN\"},\"effectiveDateTime\":\"03/05/94 13:08\",\"issued\":\"03/05/94 13:08\",\"valueCodeableConcept\":{\"coding\":[{\"system\":\"http://loinc.org\",\"code\":\"LA32-8\",\"display\":\"No\"}]},\"interpretation\":[{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation\",\"code\":\"POS\",\"display\":\"Positive\"}]}]}},{\"fullUrl\":\"observationResponseQuestion_17\",\"resource\":{\"resourceType\":\"Observation\",\"id\":\"observationResponseQuestion_17\",\"meta\":{\"lastUpdated\":\"03/05/94 13:08\",\"profile\":[\"http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse\"]},\"status\":\"unknown\",\"category\":[{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/observation-category\",\"code\":\"social-history\",\"display\":\"Social History\"}]},{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/observation-category\",\"code\":\"survey\",\"display\":\"Survey\"}]},{\"coding\":[{\"system\":\"http://hl7.org/fhir/us/sdoh-clinicalcare/CodeSystem/SDOHCC-CodeSystemTemporaryCodes\",\"code\":\"sdoh-category-unspecified\",\"display\":\"SDOH Category Unspecified\"}]}],\"code\":{\"coding\":[{\"system\":\"http://loinc.org\",\"code\":\"96782-8\",\"display\":\"Do you want help with school or training? For example, starting or completing job training or getting a high school diploma, GED or equivalent.\"}]},\"subject\":{\"reference\":\"Patient/healthelink-20240305-testcase3-MRN\"},\"effectiveDateTime\":\"03/05/94 13:08\",\"issued\":\"03/05/94 13:08\",\"valueCodeableConcept\":{\"coding\":[{\"system\":\"http://loinc.org\",\"code\":\"LA33-6\",\"display\":\"Yes\"}]},\"interpretation\":[{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation\",\"code\":\"POS\",\"display\":\"Positive\"}]}]}},{\"fullUrl\":\"observationResponseQuestion_18\",\"resource\":{\"resourceType\":\"Observation\",\"id\":\"observationResponseQuestion_18\",\"meta\":{\"lastUpdated\":\"03/05/94 13:08\",\"profile\":[\"http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse\"]},\"status\":\"unknown\",\"category\":[{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/observation-category\",\"code\":\"social-history\",\"display\":\"Social History\"}]},{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/observation-category\",\"code\":\"survey\",\"display\":\"Survey\"}]},{\"coding\":[{\"system\":\"http://hl7.org/fhir/us/sdoh-clinicalcare/CodeSystem/SDOHCC-CodeSystemTemporaryCodes\",\"code\":\"sdoh-category-unspecified\",\"display\":\"SDOH Category Unspecified\"}]}],\"code\":{\"coding\":[{\"system\":\"http://loinc.org\",\"code\":\"89555-7\",\"display\":\"In the last 30 days, other than the activities you did for work, on average, how many days per week did you engage in moderate exercise (like walking fast, running, jogging, dancing, swimming, biking, or other similar activities)\"}]},\"subject\":{\"reference\":\"Patient/healthelink-20240305-testcase3-MRN\"},\"effectiveDateTime\":\"03/05/94 13:08\",\"issued\":\"03/05/94 13:08\",\"valueCodeableConcept\":{\"coding\":[{\"system\":\"http://loinc.org\",\"code\":\"LA6113-0\",\"display\":\"2\"}]},\"interpretation\":[{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation\",\"code\":\"POS\",\"display\":\"Positive\"}]}]}},{\"fullUrl\":\"observationResponseQuestion_19\",\"resource\":{\"resourceType\":\"Observation\",\"id\":\"observationResponseQuestion_19\",\"meta\":{\"lastUpdated\":\"03/05/94 13:08\",\"profile\":[\"http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse\"]},\"status\":\"unknown\",\"category\":[{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/observation-category\",\"code\":\"social-history\",\"display\":\"Social History\"}]},{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/observation-category\",\"code\":\"survey\",\"display\":\"Survey\"}]},{\"coding\":[{\"system\":\"http://hl7.org/fhir/us/sdoh-clinicalcare/CodeSystem/SDOHCC-CodeSystemTemporaryCodes\",\"code\":\"sdoh-category-unspecified\",\"display\":\"SDOH Category Unspecified\"}]}],\"code\":{\"coding\":[{\"system\":\"http://loinc.org\",\"code\":\"68516-4\",\"display\":\"On average, how many minutes did you usually spend exercising at this level on one of those days?\"}]},\"subject\":{\"reference\":\"Patient/healthelink-20240305-testcase3-MRN\"},\"effectiveDateTime\":\"03/05/94 13:08\",\"issued\":\"03/05/94 13:08\",\"valueCodeableConcept\":{\"coding\":[{\"system\":\"http://loinc.org\",\"code\":\"LA28853-2\",\"display\":\"60\"}]},\"interpretation\":[{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation\",\"code\":\"POS\",\"display\":\"Positive\"}]}]}},{\"fullUrl\":\"observationResponseQuestion_20\",\"resource\":{\"resourceType\":\"Observation\",\"id\":\"observationResponseQuestion_20\",\"meta\":{\"lastUpdated\":\"03/05/94 13:08\",\"profile\":[\"http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse\"]},\"status\":\"unknown\",\"category\":[{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/observation-category\",\"code\":\"social-history\",\"display\":\"Social History\"}]},{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/observation-category\",\"code\":\"survey\",\"display\":\"Survey\"}]},{\"coding\":[{\"system\":\"http://hl7.org/fhir/us/sdoh-clinicalcare/CodeSystem/SDOHCC-CodeSystemTemporaryCodes\",\"code\":\"sdoh-category-unspecified\",\"display\":\"SDOH Category Unspecified\"}]}],\"code\":{\"coding\":[{\"display\":\"Calculated weekly physical activity\"}]},\"subject\":{\"reference\":\"Patient/healthelink-20240305-testcase3-MRN\"},\"effectiveDateTime\":\"03/05/94 13:08\",\"issued\":\"03/05/94 13:08\",\"valueCodeableConcept\":{\"coding\":[{\"system\":\"http://unitsofmeasure.org\",\"code\":\"min/wk\",\"display\":\"120\"}]},\"derivedFrom\":[{\"reference\":\"Observation/ObservationResponseQuestion_18\"},{\"reference\":\"Observation/ObservationResponseQuestion_19\"}],\"interpretation\":[{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation\",\"code\":\"POS\",\"display\":\"Positive\"}]}]}},{\"fullUrl\":\"observationResponseQuestion_21\",\"resource\":{\"resourceType\":\"Observation\",\"id\":\"observationResponseQuestion_21\",\"meta\":{\"lastUpdated\":\"03/05/94 13:08\",\"profile\":[\"http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse\"]},\"status\":\"unknown\",\"category\":[{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/observation-category\",\"code\":\"social-history\",\"display\":\"Social History\"}]},{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/observation-category\",\"code\":\"survey\",\"display\":\"Survey\"}]},{\"coding\":[{\"system\":\"http://hl7.org/fhir/us/sdoh-clinicalcare/CodeSystem/SDOHCC-CodeSystemTemporaryCodes\",\"code\":\"sdoh-category-unspecified\",\"display\":\"SDOH Category Unspecified\"}]}],\"code\":{\"coding\":[{\"system\":\"http://loinc.org\",\"code\":\"68517-2\",\"display\":\"How many times in the past 12 months have you had 5 or more drinks in a day (males) or 4 or more drinks in a day (females)?\"}]},\"subject\":{\"reference\":\"Patient/healthelink-20240305-testcase3-MRN\"},\"effectiveDateTime\":\"03/05/94 13:08\",\"issued\":\"03/05/94 13:08\",\"valueCodeableConcept\":{\"coding\":[{\"system\":\"http://loinc.org\",\"code\":\"LA6270-8\",\"display\":\"Never\"}]},\"interpretation\":[{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation\",\"code\":\"POS\",\"display\":\"Positive\"}]}]}},{\"fullUrl\":\"observationResponseQuestion_22\",\"resource\":{\"resourceType\":\"Observation\",\"id\":\"observationResponseQuestion_22\",\"meta\":{\"lastUpdated\":\"03/05/94 13:08\",\"profile\":[\"http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse\"]},\"status\":\"unknown\",\"category\":[{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/observation-category\",\"code\":\"social-history\",\"display\":\"Social History\"}]},{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/observation-category\",\"code\":\"survey\",\"display\":\"Survey\"}]},{\"coding\":[{\"system\":\"http://hl7.org/fhir/us/sdoh-clinicalcare/CodeSystem/SDOHCC-CodeSystemTemporaryCodes\",\"code\":\"sdoh-category-unspecified\",\"display\":\"SDOH Category Unspecified\"}]}],\"code\":{\"coding\":[{\"system\":\"http://loinc.org\",\"code\":\"96842-0\",\"display\":\"How many times in the past 12 months have you used tobacco products (like cigarettes, cigars, snuff, chew, electronic cigarettes)?\"}]},\"subject\":{\"reference\":\"Patient/healthelink-20240305-testcase3-MRN\"},\"effectiveDateTime\":\"03/05/94 13:08\",\"issued\":\"03/05/94 13:08\",\"valueCodeableConcept\":{\"coding\":[{\"system\":\"http://loinc.org\",\"code\":\"LA18891-4\",\"display\":\"Weekly\"}]},\"interpretation\":[{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation\",\"code\":\"POS\",\"display\":\"Positive\"}]}]}},{\"fullUrl\":\"observationResponseQuestion_23\",\"resource\":{\"resourceType\":\"Observation\",\"id\":\"observationResponseQuestion_23\",\"meta\":{\"lastUpdated\":\"03/05/94 13:08\",\"profile\":[\"http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse\"]},\"status\":\"unknown\",\"category\":[{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/observation-category\",\"code\":\"social-history\",\"display\":\"Social History\"}]},{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/observation-category\",\"code\":\"survey\",\"display\":\"Survey\"}]},{\"coding\":[{\"system\":\"http://hl7.org/fhir/us/sdoh-clinicalcare/CodeSystem/SDOHCC-CodeSystemTemporaryCodes\",\"code\":\"sdoh-category-unspecified\",\"display\":\"SDOH Category Unspecified\"}]}],\"code\":{\"coding\":[{\"system\":\"http://loinc.org\",\"code\":\"95530-2\",\"display\":\"How many times in the past year have you used prescription drugs for non-medical reasons?\"}]},\"subject\":{\"reference\":\"Patient/healthelink-20240305-testcase3-MRN\"},\"effectiveDateTime\":\"03/05/94 13:08\",\"issued\":\"03/05/94 13:08\",\"valueCodeableConcept\":{\"coding\":[{\"system\":\"http://loinc.org\",\"code\":\"LA26460-8\",\"display\":\"Once or Twice\"}]},\"interpretation\":[{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation\",\"code\":\"POS\",\"display\":\"Positive\"}]}]}},{\"fullUrl\":\"observationResponseQuestion_24\",\"resource\":{\"resourceType\":\"Observation\",\"id\":\"observationResponseQuestion_24\",\"meta\":{\"lastUpdated\":\"03/05/94 13:08\",\"profile\":[\"http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse\"]},\"status\":\"unknown\",\"category\":[{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/observation-category\",\"code\":\"social-history\",\"display\":\"Social History\"}]},{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/observation-category\",\"code\":\"survey\",\"display\":\"Survey\"}]},{\"coding\":[{\"system\":\"http://hl7.org/fhir/us/sdoh-clinicalcare/CodeSystem/SDOHCC-CodeSystemTemporaryCodes\",\"code\":\"sdoh-category-unspecified\",\"display\":\"SDOH Category Unspecified\"}]}],\"code\":{\"coding\":[{\"system\":\"http://loinc.org\",\"code\":\"68524-8\",\"display\":\"How many times in the past year have you used illegal drugs?\"}]},\"subject\":{\"reference\":\"Patient/healthelink-20240305-testcase3-MRN\"},\"effectiveDateTime\":\"03/05/94 13:08\",\"issued\":\"03/05/94 13:08\",\"valueCodeableConcept\":{\"coding\":[{\"system\":\"http://loinc.org\",\"code\":\"LA6270-8\",\"display\":\"Never\"}]},\"interpretation\":[{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation\",\"code\":\"POS\",\"display\":\"Positive\"}]}]}},{\"fullUrl\":\"observationResponseQuestion_25\",\"resource\":{\"resourceType\":\"Observation\",\"id\":\"observationResponseQuestion_25\",\"meta\":{\"lastUpdated\":\"03/05/94 13:08\",\"profile\":[\"http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse\"]},\"status\":\"unknown\",\"category\":[{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/observation-category\",\"code\":\"social-history\",\"display\":\"Social History\"}]},{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/observation-category\",\"code\":\"survey\",\"display\":\"Survey\"}]},{\"coding\":[{\"system\":\"http://hl7.org/fhir/us/sdoh-clinicalcare/CodeSystem/SDOHCC-CodeSystemTemporaryCodes\",\"code\":\"sdoh-category-unspecified\",\"display\":\"SDOH Category Unspecified\"}]}],\"code\":{\"coding\":[{\"system\":\"http://loinc.org\",\"code\":\"44250-9\",\"display\":\"Little interest or pleasure in doing things?\"}]},\"subject\":{\"reference\":\"Patient/healthelink-20240305-testcase3-MRN\"},\"effectiveDateTime\":\"03/05/94 13:08\",\"issued\":\"03/05/94 13:08\",\"valueCodeableConcept\":{\"coding\":[{\"system\":\"http://loinc.org\",\"code\":\"LA6571-9\",\"display\":\"Nearly every day\"}]},\"interpretation\":[{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation\",\"code\":\"POS\",\"display\":\"Positive\"}]}]}},{\"fullUrl\":\"observationResponseQuestion_26\",\"resource\":{\"resourceType\":\"Observation\",\"id\":\"observationResponseQuestion_26\",\"meta\":{\"lastUpdated\":\"03/05/94 13:08\",\"profile\":[\"http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse\"]},\"status\":\"unknown\",\"category\":[{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/observation-category\",\"code\":\"social-history\",\"display\":\"Social History\"}]},{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/observation-category\",\"code\":\"survey\",\"display\":\"Survey\"}]},{\"coding\":[{\"system\":\"http://hl7.org/fhir/us/sdoh-clinicalcare/CodeSystem/SDOHCC-CodeSystemTemporaryCodes\",\"code\":\"sdoh-category-unspecified\",\"display\":\"SDOH Category Unspecified\"}]}],\"code\":{\"coding\":[{\"system\":\"http://loinc.org\",\"code\":\"44255-8\",\"display\":\"Feeling down, depressed, or hopeless?\"}]},\"subject\":{\"reference\":\"Patient/healthelink-20240305-testcase3-MRN\"},\"effectiveDateTime\":\"03/05/94 13:08\",\"issued\":\"03/05/94 13:08\",\"valueCodeableConcept\":{\"coding\":[{\"system\":\"http://loinc.org\",\"code\":\"LA6569-3\",\"display\":\"Several days\"}]},\"interpretation\":[{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation\",\"code\":\"POS\",\"display\":\"Positive\"}]}]}},{\"fullUrl\":\"observationResponseQuestion_27\",\"resource\":{\"resourceType\":\"Observation\",\"id\":\"observationResponseQuestion_27\",\"meta\":{\"lastUpdated\":\"03/05/94 13:08\",\"profile\":[\"http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse\"]},\"status\":\"unknown\",\"category\":[{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/observation-category\",\"code\":\"social-history\",\"display\":\"Social History\"}]},{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/observation-category\",\"code\":\"survey\",\"display\":\"Survey\"}]},{\"coding\":[{\"system\":\"http://hl7.org/fhir/us/sdoh-clinicalcare/CodeSystem/SDOHCC-CodeSystemTemporaryCodes\",\"code\":\"sdoh-category-unspecified\",\"display\":\"SDOH Category Unspecified\"}]}],\"code\":{\"coding\":[{\"display\":\"Calculated mental health score\"}]},\"subject\":{\"reference\":\"Patient/healthelink-20240305-testcase3-MRN\"},\"effectiveDateTime\":\"03/05/94 13:08\",\"issued\":\"03/05/94 13:08\",\"valueCodeableConcept\":{\"coding\":[{\"system\":\"http://unitsofmeasure.org\",\"code\":\"{score}\",\"display\":\"4\"}]},\"derivedFrom\":[{\"reference\":\"Observation/ObservationResponseQuestion_26\"},{\"reference\":\"Observation/ObservationResponseQuestion_25\"}],\"interpretation\":[{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation\",\"code\":\"POS\",\"display\":\"Positive\"}]}]}},{\"fullUrl\":\"observationResponseQuestion_28\",\"resource\":{\"resourceType\":\"Observation\",\"id\":\"observationResponseQuestion_28\",\"meta\":{\"lastUpdated\":\"03/05/94 13:08\",\"profile\":[\"http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse\"]},\"status\":\"unknown\",\"category\":[{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/observation-category\",\"code\":\"social-history\",\"display\":\"Social History\"}]},{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/observation-category\",\"code\":\"survey\",\"display\":\"Survey\"}]},{\"coding\":[{\"system\":\"http://hl7.org/fhir/us/sdoh-clinicalcare/CodeSystem/SDOHCC-CodeSystemTemporaryCodes\",\"code\":\"stress\",\"display\":\"Stress\"}]}],\"code\":{\"coding\":[{\"system\":\"http://loinc.org\",\"code\":\"93038-8\",\"display\":\"Stress means a situation in which a person feels tense, restless, nervous, or anxious, or is unable to sleep at night because his or her mind is troubled all the time. Do you feel this kind of stress these days?\"}]},\"subject\":{\"reference\":\"Patient/healthelink-20240305-testcase3-MRN\"},\"effectiveDateTime\":\"03/05/94 13:08\",\"issued\":\"03/05/94 13:08\",\"valueCodeableConcept\":{\"coding\":[{\"system\":\"http://loinc.org\",\"code\":\"LA13902-4\",\"display\":\"Quite a bit\"}]},\"interpretation\":[{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation\",\"code\":\"POS\",\"display\":\"Positive\"}]}]}},{\"fullUrl\":\"observationResponseQuestion_29\",\"resource\":{\"resourceType\":\"Observation\",\"id\":\"observationResponseQuestion_29\",\"meta\":{\"lastUpdated\":\"03/05/94 13:08\",\"profile\":[\"http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse\"]},\"status\":\"unknown\",\"category\":[{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/observation-category\",\"code\":\"social-history\",\"display\":\"Social History\"}]},{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/observation-category\",\"code\":\"survey\",\"display\":\"Survey\"}]},{\"coding\":[{\"system\":\"http://hl7.org/fhir/us/sdoh-clinicalcare/CodeSystem/SDOHCC-CodeSystemTemporaryCodes\",\"code\":\"sdoh-category-unspecified\",\"display\":\"SDOH Category Unspecified\"}]}],\"code\":{\"coding\":[{\"system\":\"http://loinc.org\",\"code\":\"69858-9\",\"display\":\"Because of a physical, mental, or emotional condition, do you have serious difficulty concentrating, remembering, or making decisions?\"}]},\"subject\":{\"reference\":\"Patient/healthelink-20240305-testcase3-MRN\"},\"effectiveDateTime\":\"03/05/94 13:08\",\"issued\":\"03/05/94 13:08\",\"valueCodeableConcept\":{\"coding\":[{\"system\":\"http://loinc.org\",\"code\":\"LA33-6\",\"display\":\"Yes\"}]},\"interpretation\":[{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation\",\"code\":\"POS\",\"display\":\"Positive\"}]}]}},{\"fullUrl\":\"observationResponseQuestion_30\",\"resource\":{\"resourceType\":\"Observation\",\"id\":\"observationResponseQuestion_30\",\"meta\":{\"lastUpdated\":\"03/05/94 13:08\",\"profile\":[\"http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse\"]},\"status\":\"unknown\",\"category\":[{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/observation-category\",\"code\":\"social-history\",\"display\":\"Social History\"}]},{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/observation-category\",\"code\":\"survey\",\"display\":\"Survey\"}]},{\"coding\":[{\"system\":\"http://hl7.org/fhir/us/sdoh-clinicalcare/CodeSystem/SDOHCC-CodeSystemTemporaryCodes\",\"code\":\"sdoh-category-unspecified\",\"display\":\"SDOH Category Unspecified\"}]}],\"code\":{\"coding\":[{\"system\":\"http://loinc.org\",\"code\":\"69861-3\",\"display\":\"Because of a physical, mental, or emotional condition, do you have difficulty doing errands alone such as visiting a physician's office or shopping\"}]},\"subject\":{\"reference\":\"Patient/healthelink-20240305-testcase3-MRN\"},\"effectiveDateTime\":\"03/05/94 13:08\",\"issued\":\"03/05/94 13:08\",\"valueCodeableConcept\":{\"coding\":[{\"system\":\"http://loinc.org\",\"code\":\"LA32-8\",\"display\":\"No\"}]},\"interpretation\":[{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation\",\"code\":\"POS\",\"display\":\"Positive\"}]}]}}]}"}]

```
No STDERR emitted by `jsonResult_5`.

    