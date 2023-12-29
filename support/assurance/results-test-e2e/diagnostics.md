---
rootPaths:
  - support/assurance/synthetic-content
icDb: support/assurance/results-test-e2e/ingestion-center.duckdb
diagsMd: support/assurance/results-test-e2e/diagnostics.md
diagsXlsx: support/assurance/results-test-e2e/diagnostics.xlsx
resourceDb: support/assurance/results-test-e2e/resource.sqlite.db
---
# Ingest Diagnostics

## prepareAdminInfra
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


INSERT INTO "ingest_session" ("ingest_session_id", "ingest_started_at", "ingest_finished_at", "elaboration") VALUES ('05269d28-15ae-5bd6-bd88-f949ccfa52d7', NULL, NULL, NULL);

-- no after-init SQL found
```


## ingest-0
```sql
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "ingest_session_entry" ("ingest_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('8b7c669c-1795-5f6b-8f3a-3e502b74c628', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/synthetic-content/ahc-hrsn-valid-01.xlsx', 'ahc_hrsn_valid_01_admin_demographic', NULL);
        
INSERT INTO "ingest_session_issue" ("ingest_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('7b979b68-7227-53fd-b689-e4fe153afb76', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '8b7c669c-1795-5f6b-8f3a-3e502b74c628', 'Structural', 'Excel workbook ''ahc-hrsn-valid-01.xlsx'' sheet ''Admin_Demographic'' has no workflow', NULL, NULL, 'support/assurance/synthetic-content/ahc-hrsn-valid-01.xlsx', NULL, NULL);;

-- required by IngestEngine, emit the errors for the given session (file) so it can be picked up
SELECT * FROM ingest_session_issue WHERE session_id = '05269d28-15ae-5bd6-bd88-f949ccfa52d7' and session_entry_id = '8b7c669c-1795-5f6b-8f3a-3e502b74c628';
```

### stdout
```sh
[{"ingest_session_issue_id":"7b979b68-7227-53fd-b689-e4fe153afb76","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"8b7c669c-1795-5f6b-8f3a-3e502b74c628","issue_type":"Structural","issue_message":"Excel workbook 'ahc-hrsn-valid-01.xlsx' sheet 'Admin_Demographic' has no workflow","issue_row":null,"issue_column":null,"invalid_value":"support/assurance/synthetic-content/ahc-hrsn-valid-01.xlsx","remediation":null,"elaboration":null}]

```

## ingest-1
```sql
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "ingest_session_entry" ("ingest_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('abf5c680-a135-5d89-b871-fa5b9b99aed6', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/synthetic-content/ahc-hrsn-valid-01.xlsx', 'ahc_hrsn_valid_01_screening', NULL);
     
-- ingest 'Screening' into ahc_hrsn_valid_01_screening

-- required by IngestEngine, emit the errors for the given session (file) so it can be picked up
SELECT * FROM ingest_session_issue WHERE session_id = '05269d28-15ae-5bd6-bd88-f949ccfa52d7' and session_entry_id = 'abf5c680-a135-5d89-b871-fa5b9b99aed6';
```


## ingest-2
```sql
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "ingest_session_entry" ("ingest_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('641dff51-97fd-56b3-8443-c1ed568a6d66', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/synthetic-content/ahc-hrsn-valid-01.xlsx', 'ahc_hrsn_valid_01_q_e_admin_data', NULL);
        
INSERT INTO "ingest_session_issue" ("ingest_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('d70a4700-6b40-52fc-a7a2-69ef0d7f69ff', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '641dff51-97fd-56b3-8443-c1ed568a6d66', 'Structural', 'Excel workbook ''ahc-hrsn-valid-01.xlsx'' sheet ''QE_Admin_Data'' has no workflow', NULL, NULL, 'support/assurance/synthetic-content/ahc-hrsn-valid-01.xlsx', NULL, NULL);;

-- required by IngestEngine, emit the errors for the given session (file) so it can be picked up
SELECT * FROM ingest_session_issue WHERE session_id = '05269d28-15ae-5bd6-bd88-f949ccfa52d7' and session_entry_id = '641dff51-97fd-56b3-8443-c1ed568a6d66';
```

### stdout
```sh
[{"ingest_session_issue_id":"d70a4700-6b40-52fc-a7a2-69ef0d7f69ff","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"641dff51-97fd-56b3-8443-c1ed568a6d66","issue_type":"Structural","issue_message":"Excel workbook 'ahc-hrsn-valid-01.xlsx' sheet 'QE_Admin_Data' has no workflow","issue_row":null,"issue_column":null,"invalid_value":"support/assurance/synthetic-content/ahc-hrsn-valid-01.xlsx","remediation":null,"elaboration":null}]

```

## ingest-3
```sql
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "ingest_session_entry" ("ingest_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('47277588-99e8-59f5-8384-b24344a86073', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/synthetic-content/synthetic-fail.csv', 'synthetic_fail', NULL);

CREATE TABLE synthetic_fail AS
  SELECT *, row_number() OVER () as src_file_row_number, '05269d28-15ae-5bd6-bd88-f949ccfa52d7'
    FROM read_csv_auto('support/assurance/synthetic-content/synthetic-fail.csv', header=true);

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
           '47277588-99e8-59f5-8384-b24344a86073',
           'Missing Column',
           'Required column ' || column_name || ' is missing in synthetic_fail.',
           'Ensure synthetic_fail contains the column "' || column_name || '"'
      FROM required_column_names_in_src;

-- required by IngestEngine, emit the errors for the given session (file) so it can be picked up
SELECT * FROM ingest_session_issue WHERE session_id = '05269d28-15ae-5bd6-bd88-f949ccfa52d7' and session_entry_id = '47277588-99e8-59f5-8384-b24344a86073';
```

### stdout
```sh
[{"ingest_session_issue_id":"9f5496ef-85e3-4c2d-a626-d1701c1b517e","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"47277588-99e8-59f5-8384-b24344a86073","issue_type":"Missing Column","issue_message":"Required column PAT_MRN_ID is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"PAT_MRN_ID\"","elaboration":null},
{"ingest_session_issue_id":"dca6daec-9721-42ed-82b9-43db619cc21d","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"47277588-99e8-59f5-8384-b24344a86073","issue_type":"Missing Column","issue_message":"Required column FACILITY is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"FACILITY\"","elaboration":null},
{"ingest_session_issue_id":"a70d0353-1947-4eaf-a3f3-fefef8f46951","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"47277588-99e8-59f5-8384-b24344a86073","issue_type":"Missing Column","issue_message":"Required column FIRST_NAME is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"FIRST_NAME\"","elaboration":null},
{"ingest_session_issue_id":"b0fae2fb-a7d7-407e-b2b0-4a4f4ff1bcdf","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"47277588-99e8-59f5-8384-b24344a86073","issue_type":"Missing Column","issue_message":"Required column LAST_NAME is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"LAST_NAME\"","elaboration":null},
{"ingest_session_issue_id":"36d64901-b8b9-41fa-b276-fe6d3ab1ae50","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"47277588-99e8-59f5-8384-b24344a86073","issue_type":"Missing Column","issue_message":"Required column PAT_BIRTH_DATE is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"PAT_BIRTH_DATE\"","elaboration":null},
{"ingest_session_issue_id":"37cb75e4-0f81-4224-9b7a-3bf177d9e559","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"47277588-99e8-59f5-8384-b24344a86073","issue_type":"Missing Column","issue_message":"Required column MEDICAID_CIN is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"MEDICAID_CIN\"","elaboration":null},
{"ingest_session_issue_id":"8f9d9a6b-f441-43e7-906f-ea5e98e8a88a","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"47277588-99e8-59f5-8384-b24344a86073","issue_type":"Missing Column","issue_message":"Required column ENCOUNTER_ID is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"ENCOUNTER_ID\"","elaboration":null},
{"ingest_session_issue_id":"10b1e6f8-6005-453d-8407-a318259dba02","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"47277588-99e8-59f5-8384-b24344a86073","issue_type":"Missing Column","issue_message":"Required column SURVEY is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"SURVEY\"","elaboration":null},
{"ingest_session_issue_id":"834ce794-a560-4165-89c1-431e5705d34f","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"47277588-99e8-59f5-8384-b24344a86073","issue_type":"Missing Column","issue_message":"Required column SURVEY_ID is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"SURVEY_ID\"","elaboration":null},
{"ingest_session_issue_id":"18b89a50-72d4-4af8-a8d6-d16ff759b55b","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"47277588-99e8-59f5-8384-b24344a86073","issue_type":"Missing Column","issue_message":"Required column RECORDED_TIME is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"RECORDED_TIME\"","elaboration":null},
{"ingest_session_issue_id":"b5c45442-d6a7-495a-85b1-f8096277834e","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"47277588-99e8-59f5-8384-b24344a86073","issue_type":"Missing Column","issue_message":"Required column QUESTION is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"QUESTION\"","elaboration":null},
{"ingest_session_issue_id":"4c2640a5-389e-4be9-b7f8-c0fe91f754a1","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"47277588-99e8-59f5-8384-b24344a86073","issue_type":"Missing Column","issue_message":"Required column MEAS_VALUE is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"MEAS_VALUE\"","elaboration":null},
{"ingest_session_issue_id":"f986543b-fdfb-4783-b2b4-b3467fd4b327","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"47277588-99e8-59f5-8384-b24344a86073","issue_type":"Missing Column","issue_message":"Required column QUESTION_CODE is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"QUESTION_CODE\"","elaboration":null},
{"ingest_session_issue_id":"6a6ada6d-19ea-46ad-9243-73220149093a","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"47277588-99e8-59f5-8384-b24344a86073","issue_type":"Missing Column","issue_message":"Required column QUESTION_CODE_SYSTEM_NAME is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"QUESTION_CODE_SYSTEM_NAME\"","elaboration":null},
{"ingest_session_issue_id":"ace7f024-1654-42d0-8dcf-de51c240813b","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"47277588-99e8-59f5-8384-b24344a86073","issue_type":"Missing Column","issue_message":"Required column ANSWER_CODE is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"ANSWER_CODE\"","elaboration":null},
{"ingest_session_issue_id":"69ea64e9-bacb-4d8a-877e-237519e018e6","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"47277588-99e8-59f5-8384-b24344a86073","issue_type":"Missing Column","issue_message":"Required column ANSWER_CODE_SYSTEM_NAME is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"ANSWER_CODE_SYSTEM_NAME\"","elaboration":null},
{"ingest_session_issue_id":"8b7860cb-cc90-4206-94af-d23d7e6a6fa1","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"47277588-99e8-59f5-8384-b24344a86073","issue_type":"Missing Column","issue_message":"Required column SDOH_DOMAIN is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"SDOH_DOMAIN\"","elaboration":null},
{"ingest_session_issue_id":"351bac81-55a5-4f9b-9278-a1eea4b4c76b","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"47277588-99e8-59f5-8384-b24344a86073","issue_type":"Missing Column","issue_message":"Required column NEED_INDICATED is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"NEED_INDICATED\"","elaboration":null},
{"ingest_session_issue_id":"a2fef3ef-49ad-4927-98a3-d972a0d6f07e","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"47277588-99e8-59f5-8384-b24344a86073","issue_type":"Missing Column","issue_message":"Required column VISIT_PART_2_FLAG is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"VISIT_PART_2_FLAG\"","elaboration":null},
{"ingest_session_issue_id":"4750ee31-19b8-425a-86e1-82038754991b","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"47277588-99e8-59f5-8384-b24344a86073","issue_type":"Missing Column","issue_message":"Required column VISIT_OMH_FLAG is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"VISIT_OMH_FLAG\"","elaboration":null},
{"ingest_session_issue_id":"975d3ca8-81e3-43f2-9860-8f8bff05262f","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"47277588-99e8-59f5-8384-b24344a86073","issue_type":"Missing Column","issue_message":"Required column VISIT_OPWDD_FLAG is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"VISIT_OPWDD_FLAG\"","elaboration":null}]

```

## ingest-4
```sql
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "ingest_session_entry" ("ingest_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('58b22e99-5854-53bf-adbe-08e67df99b85', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/synthetic-content/synthetic-fail-excel-01.xlsx', 'ERROR', NULL);
INSERT INTO "ingest_session_issue" ("ingest_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('a26ce332-3ced-5623-861d-23a2ef78e4a9', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '58b22e99-5854-53bf-adbe-08e67df99b85', 'Sheet Missing', 'Excel workbook sheet ''Admin_Demographic'' not found in ''synthetic-fail-excel-01.xlsx'' (available: Sheet1)', NULL, NULL, 'support/assurance/synthetic-content/synthetic-fail-excel-01.xlsx', NULL, NULL);;
-- required by IngestEngine, emit the errors for the given session (file) so it can be picked up
SELECT * FROM ingest_session_issue WHERE session_id = '05269d28-15ae-5bd6-bd88-f949ccfa52d7' and session_entry_id = '58b22e99-5854-53bf-adbe-08e67df99b85';
```

### stdout
```sh
[{"ingest_session_issue_id":"a26ce332-3ced-5623-861d-23a2ef78e4a9","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"58b22e99-5854-53bf-adbe-08e67df99b85","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet 'Admin_Demographic' not found in 'synthetic-fail-excel-01.xlsx' (available: Sheet1)","issue_row":null,"issue_column":null,"invalid_value":"support/assurance/synthetic-content/synthetic-fail-excel-01.xlsx","remediation":null,"elaboration":null}]

```

## ingest-5
```sql
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "ingest_session_entry" ("ingest_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('bc0c03b5-d1ba-5301-850f-5e4c42c1bf09', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/synthetic-content/synthetic-fail-excel-01.xlsx', 'ERROR', NULL);
INSERT INTO "ingest_session_issue" ("ingest_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('ae477ba1-c7f1-5f34-847a-50bddb7130aa', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'bc0c03b5-d1ba-5301-850f-5e4c42c1bf09', 'Sheet Missing', 'Excel workbook sheet ''Screening'' not found in ''synthetic-fail-excel-01.xlsx'' (available: Sheet1)', NULL, NULL, 'support/assurance/synthetic-content/synthetic-fail-excel-01.xlsx', NULL, NULL);;
-- required by IngestEngine, emit the errors for the given session (file) so it can be picked up
SELECT * FROM ingest_session_issue WHERE session_id = '05269d28-15ae-5bd6-bd88-f949ccfa52d7' and session_entry_id = 'bc0c03b5-d1ba-5301-850f-5e4c42c1bf09';
```

### stdout
```sh
[{"ingest_session_issue_id":"ae477ba1-c7f1-5f34-847a-50bddb7130aa","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"bc0c03b5-d1ba-5301-850f-5e4c42c1bf09","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet 'Screening' not found in 'synthetic-fail-excel-01.xlsx' (available: Sheet1)","issue_row":null,"issue_column":null,"invalid_value":"support/assurance/synthetic-content/synthetic-fail-excel-01.xlsx","remediation":null,"elaboration":null}]

```

## ingest-6
```sql
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "ingest_session_entry" ("ingest_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/synthetic-content/synthetic-fail-excel-01.xlsx', 'ERROR', NULL);
INSERT INTO "ingest_session_issue" ("ingest_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839', 'Sheet Missing', 'Excel workbook sheet ''QE_Admin_Data'' not found in ''synthetic-fail-excel-01.xlsx'' (available: Sheet1)', NULL, NULL, 'support/assurance/synthetic-content/synthetic-fail-excel-01.xlsx', NULL, NULL);;
-- required by IngestEngine, emit the errors for the given session (file) so it can be picked up
SELECT * FROM ingest_session_issue WHERE session_id = '05269d28-15ae-5bd6-bd88-f949ccfa52d7' and session_entry_id = '8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839';
```

### stdout
```sh
[{"ingest_session_issue_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","issue_type":"Sheet Missing","issue_message":"Excel workbook sheet 'QE_Admin_Data' not found in 'synthetic-fail-excel-01.xlsx' (available: Sheet1)","issue_row":null,"issue_column":null,"invalid_value":"support/assurance/synthetic-content/synthetic-fail-excel-01.xlsx","remediation":null,"elaboration":null}]

```

## ingest-7
```sql
-- required by IngestEngine, setup the ingestion entry for logging
INSERT INTO "ingest_session_entry" ("ingest_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('7ef8bdeb-fd56-5eb9-a09b-ef15ce18dc49', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/synthetic-content/ahc-hrsn-12-12-2023-valid.csv', 'ahc_hrsn_12_12_2023_valid', NULL);

CREATE TABLE ahc_hrsn_12_12_2023_valid AS
  SELECT *, row_number() OVER () as src_file_row_number, '05269d28-15ae-5bd6-bd88-f949ccfa52d7'
    FROM read_csv_auto('support/assurance/synthetic-content/ahc-hrsn-12-12-2023-valid.csv', header=true);

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
           '7ef8bdeb-fd56-5eb9-a09b-ef15ce18dc49',
           'Missing Column',
           'Required column ' || column_name || ' is missing in ahc_hrsn_12_12_2023_valid.',
           'Ensure ahc_hrsn_12_12_2023_valid contains the column "' || column_name || '"'
      FROM required_column_names_in_src;

-- required by IngestEngine, emit the errors for the given session (file) so it can be picked up
SELECT * FROM ingest_session_issue WHERE session_id = '05269d28-15ae-5bd6-bd88-f949ccfa52d7' and session_entry_id = '7ef8bdeb-fd56-5eb9-a09b-ef15ce18dc49';
```


## ensureContent
```sql
-- Sheet 'Screening' not found in Excel workbook 'ahc-hrsn-valid-01.xlsx'
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
INSERT INTO "ingest_session_state" ("ingest_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('05e8feaa-0bed-5909-a817-39812494b361', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', NULL, 'NONE', 'ENTER(prepareAdminInfra)', NULL, NULL, (make_timestamp(2023, 11, 5, 17, 10, 13.246)), NULL);
INSERT INTO "ingest_session_state" ("ingest_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('8f460419-7b80-516d-8919-84520950f612', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', NULL, 'ENTER(prepareAdminInfra)', 'EXIT(prepareAdminInfra)', NULL, NULL, (make_timestamp(2023, 11, 5, 17, 10, 13.246)), NULL);
INSERT INTO "ingest_session_state" ("ingest_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('7bab389e-54af-5a13-a39f-079abdc73a48', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', NULL, 'EXIT(prepareAdminInfra)', 'ENTER(walkSources)', NULL, NULL, (make_timestamp(2023, 11, 5, 17, 10, 13.246)), NULL);
INSERT INTO "ingest_session_state" ("ingest_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('168a34c7-d043-5ec4-a84a-c961f1a301ef', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', NULL, 'ENTER(walkSources)', 'EXIT(walkSources)', NULL, NULL, (make_timestamp(2023, 11, 5, 17, 10, 13.246)), NULL);
INSERT INTO "ingest_session_state" ("ingest_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('1931dfcc-e8fc-597d-b1bc-65b4287e6fdf', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', NULL, 'EXIT(walkSources)', 'ENTER(ingest)', NULL, NULL, (make_timestamp(2023, 11, 5, 17, 10, 13.246)), NULL);
INSERT INTO "ingest_session_state" ("ingest_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('591191c7-f693-5957-8734-ac87151ca981', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', NULL, 'ENTER(ingest)', 'EXIT(ingest)', NULL, NULL, (make_timestamp(2023, 11, 5, 17, 10, 13.246)), NULL);
INSERT INTO "ingest_session_state" ("ingest_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('3b4eb0e5-6239-537a-8e67-e50e172e72a2', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', NULL, 'EXIT(ingest)', 'ENTER(ensureContent)', NULL, NULL, (make_timestamp(2023, 11, 5, 17, 10, 13.246)), NULL);

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
