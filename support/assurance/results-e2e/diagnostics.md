---
rootPath: ./support/assurance/synthetic-content
src:
  - '**/*.{csv,xlsx}'
icDeterministicPk: true
icDb: support/assurance/results-e2e/ingestion-center.duckdb
resourceDb: support/assurance/results-e2e/resource.sqlite.db
diagsXlsx: support/assurance/results-e2e/diagnostics.xlsx
diagsMd: support/assurance/results-e2e/diagnostics.md
diagsDagPuml: support/assurance/results-e2e/dag.puml
duckdbCmd: duckdb

---
# Ingest Diagnostics

## init
```sql
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
```


## ensureStructure-0
```sql
INSERT INTO "ingest_session_entry" ("ingest_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('1931dfcc-e8fc-597d-b1bc-65b4287e6fdf', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/synthetic-content/ahc-hrsn-valid-01.xlsx', 'ahc_hrsn_valid_01_admin_demographic', NULL);  
-- ingest 'Admin_Demographic' into ahc_hrsn_valid_01_admin_demographic

-- emit the errors for the given session (sheet) so it can be picked up
SELECT * FROM ingest_session_issue WHERE session_id = '05269d28-15ae-5bd6-bd88-f949ccfa52d7' and session_entry_id = '1931dfcc-e8fc-597d-b1bc-65b4287e6fdf';
```


## ensureStructure-1
```sql
INSERT INTO "ingest_session_entry" ("ingest_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('8b7c669c-1795-5f6b-8f3a-3e502b74c628', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/synthetic-content/ahc-hrsn-valid-01.xlsx', 'ahc_hrsn_valid_01_screening', NULL);  
-- ingest 'Screening' into ahc_hrsn_valid_01_screening

-- emit the errors for the given session (sheet) so it can be picked up
SELECT * FROM ingest_session_issue WHERE session_id = '05269d28-15ae-5bd6-bd88-f949ccfa52d7' and session_entry_id = '8b7c669c-1795-5f6b-8f3a-3e502b74c628';
```


## ensureStructure-2
```sql
INSERT INTO "ingest_session_entry" ("ingest_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('7b979b68-7227-53fd-b689-e4fe153afb76', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/synthetic-content/ahc-hrsn-valid-01.xlsx', 'ahc_hrsn_valid_01_q_e_admin_data', NULL);  
-- ingest 'QE_Admin_Data' into ahc_hrsn_valid_01_q_e_admin_data

-- emit the errors for the given session (sheet) so it can be picked up
SELECT * FROM ingest_session_issue WHERE session_id = '05269d28-15ae-5bd6-bd88-f949ccfa52d7' and session_entry_id = '7b979b68-7227-53fd-b689-e4fe153afb76';
```


## ensureStructure-3
```sql
INSERT INTO "ingest_session_entry" ("ingest_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('abf5c680-a135-5d89-b871-fa5b9b99aed6', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/synthetic-content/synthetic-fail.csv', 'synthetic_fail', NULL);

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
           'abf5c680-a135-5d89-b871-fa5b9b99aed6',
           'Missing Column',
           'Required column ' || column_name || ' is missing in synthetic_fail.',
           'Ensure synthetic_fail contains the column "' || column_name || '"'
      FROM required_column_names_in_src;

-- emit the errors for the given session (file) so it can be picked up
SELECT * FROM ingest_session_issue WHERE session_id = '05269d28-15ae-5bd6-bd88-f949ccfa52d7' and session_entry_id = 'abf5c680-a135-5d89-b871-fa5b9b99aed6';
```

### stdout
```sh
[{"ingest_session_issue_id":"ee46526a-9f69-4a96-bb27-49686052e88d","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"abf5c680-a135-5d89-b871-fa5b9b99aed6","issue_type":"Missing Column","issue_message":"Required column PAT_MRN_ID is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"PAT_MRN_ID\"","elaboration":null},
{"ingest_session_issue_id":"2df02c26-aafa-439c-8a4e-25d06594ecec","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"abf5c680-a135-5d89-b871-fa5b9b99aed6","issue_type":"Missing Column","issue_message":"Required column FACILITY is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"FACILITY\"","elaboration":null},
{"ingest_session_issue_id":"aa7d545f-44b1-44e1-9bb4-19cd5f546fe1","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"abf5c680-a135-5d89-b871-fa5b9b99aed6","issue_type":"Missing Column","issue_message":"Required column FIRST_NAME is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"FIRST_NAME\"","elaboration":null},
{"ingest_session_issue_id":"6e8740c5-a310-43f4-9f6a-5e1fcefd593a","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"abf5c680-a135-5d89-b871-fa5b9b99aed6","issue_type":"Missing Column","issue_message":"Required column LAST_NAME is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"LAST_NAME\"","elaboration":null},
{"ingest_session_issue_id":"17d6b56d-401e-4b9f-8e0d-f14ea4acb9cf","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"abf5c680-a135-5d89-b871-fa5b9b99aed6","issue_type":"Missing Column","issue_message":"Required column PAT_BIRTH_DATE is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"PAT_BIRTH_DATE\"","elaboration":null},
{"ingest_session_issue_id":"6e491873-4bee-419b-ac32-a4e197b08af7","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"abf5c680-a135-5d89-b871-fa5b9b99aed6","issue_type":"Missing Column","issue_message":"Required column MEDICAID_CIN is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"MEDICAID_CIN\"","elaboration":null},
{"ingest_session_issue_id":"e0d78939-95b2-4192-8563-c754d2d9d005","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"abf5c680-a135-5d89-b871-fa5b9b99aed6","issue_type":"Missing Column","issue_message":"Required column ENCOUNTER_ID is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"ENCOUNTER_ID\"","elaboration":null},
{"ingest_session_issue_id":"cf1f16a6-d6b6-4911-91b0-9c58de54fe2e","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"abf5c680-a135-5d89-b871-fa5b9b99aed6","issue_type":"Missing Column","issue_message":"Required column SURVEY is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"SURVEY\"","elaboration":null},
{"ingest_session_issue_id":"08279ef6-d306-41b0-bc89-bea7082dab4b","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"abf5c680-a135-5d89-b871-fa5b9b99aed6","issue_type":"Missing Column","issue_message":"Required column SURVEY_ID is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"SURVEY_ID\"","elaboration":null},
{"ingest_session_issue_id":"639d7a2d-ae56-4781-bb27-a4a78d93e8f9","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"abf5c680-a135-5d89-b871-fa5b9b99aed6","issue_type":"Missing Column","issue_message":"Required column RECORDED_TIME is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"RECORDED_TIME\"","elaboration":null},
{"ingest_session_issue_id":"c641b870-146c-4c83-aaab-25bef5a6d8c2","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"abf5c680-a135-5d89-b871-fa5b9b99aed6","issue_type":"Missing Column","issue_message":"Required column QUESTION is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"QUESTION\"","elaboration":null},
{"ingest_session_issue_id":"6ca51b67-f5b0-4740-ba6a-da04f78bb29c","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"abf5c680-a135-5d89-b871-fa5b9b99aed6","issue_type":"Missing Column","issue_message":"Required column MEAS_VALUE is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"MEAS_VALUE\"","elaboration":null},
{"ingest_session_issue_id":"d22b8447-8a95-4acf-8a0e-f481dc753384","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"abf5c680-a135-5d89-b871-fa5b9b99aed6","issue_type":"Missing Column","issue_message":"Required column QUESTION_CODE is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"QUESTION_CODE\"","elaboration":null},
{"ingest_session_issue_id":"f2a2098e-d972-499a-a6b5-b2534f8e9f3e","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"abf5c680-a135-5d89-b871-fa5b9b99aed6","issue_type":"Missing Column","issue_message":"Required column QUESTION_CODE_SYSTEM_NAME is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"QUESTION_CODE_SYSTEM_NAME\"","elaboration":null},
{"ingest_session_issue_id":"802c10aa-c19e-4cb7-aafb-2453db9a223c","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"abf5c680-a135-5d89-b871-fa5b9b99aed6","issue_type":"Missing Column","issue_message":"Required column ANSWER_CODE is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"ANSWER_CODE\"","elaboration":null},
{"ingest_session_issue_id":"8e0e2d3d-8008-4bf5-b6c2-647d84e99062","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"abf5c680-a135-5d89-b871-fa5b9b99aed6","issue_type":"Missing Column","issue_message":"Required column ANSWER_CODE_SYSTEM_NAME is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"ANSWER_CODE_SYSTEM_NAME\"","elaboration":null},
{"ingest_session_issue_id":"adf245ec-9702-4e34-8a27-8abc33008086","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"abf5c680-a135-5d89-b871-fa5b9b99aed6","issue_type":"Missing Column","issue_message":"Required column SDOH_DOMAIN is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"SDOH_DOMAIN\"","elaboration":null},
{"ingest_session_issue_id":"a5ef1f33-5dc6-41f9-804c-9be497b2390d","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"abf5c680-a135-5d89-b871-fa5b9b99aed6","issue_type":"Missing Column","issue_message":"Required column NEED_INDICATED is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"NEED_INDICATED\"","elaboration":null},
{"ingest_session_issue_id":"a6eb8a02-a539-4ab7-b952-236fb606a616","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"abf5c680-a135-5d89-b871-fa5b9b99aed6","issue_type":"Missing Column","issue_message":"Required column VISIT_PART_2_FLAG is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"VISIT_PART_2_FLAG\"","elaboration":null},
{"ingest_session_issue_id":"ddec9cc9-0c30-4e89-92fd-99edb00d7838","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"abf5c680-a135-5d89-b871-fa5b9b99aed6","issue_type":"Missing Column","issue_message":"Required column VISIT_OMH_FLAG is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"VISIT_OMH_FLAG\"","elaboration":null},
{"ingest_session_issue_id":"b093d914-cde6-41dc-b90a-4d5b0bf33e1b","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"abf5c680-a135-5d89-b871-fa5b9b99aed6","issue_type":"Missing Column","issue_message":"Required column VISIT_OPWDD_FLAG is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"VISIT_OPWDD_FLAG\"","elaboration":null}]

```

## ensureStructure-4
```sql
INSERT INTO "ingest_session_entry" ("ingest_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('641dff51-97fd-56b3-8443-c1ed568a6d66', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/synthetic-content/synthetic-fail-excel-01.xlsx', 'synthetic_fail_excel_01_admin_demographic', NULL);  
INSERT INTO "ingest_session_issue" ("ingest_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('58b22e99-5854-53bf-adbe-08e67df99b85', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '641dff51-97fd-56b3-8443-c1ed568a6d66', 'Structural', 'Sheet ''Admin_Demographic'' not found in Excel workbook ''synthetic-fail-excel-01.xlsx''', NULL, NULL, 'support/assurance/synthetic-content/synthetic-fail-excel-01.xlsx', NULL, NULL);;

-- emit the errors for the given session (sheet) so it can be picked up
SELECT * FROM ingest_session_issue WHERE session_id = '05269d28-15ae-5bd6-bd88-f949ccfa52d7' and session_entry_id = '641dff51-97fd-56b3-8443-c1ed568a6d66';
```

### stdout
```sh
[{"ingest_session_issue_id":"58b22e99-5854-53bf-adbe-08e67df99b85","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"641dff51-97fd-56b3-8443-c1ed568a6d66","issue_type":"Structural","issue_message":"Sheet 'Admin_Demographic' not found in Excel workbook 'synthetic-fail-excel-01.xlsx'","issue_row":null,"issue_column":null,"invalid_value":"support/assurance/synthetic-content/synthetic-fail-excel-01.xlsx","remediation":null,"elaboration":null}]

```

## ensureStructure-5
```sql
INSERT INTO "ingest_session_entry" ("ingest_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('d70a4700-6b40-52fc-a7a2-69ef0d7f69ff', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/synthetic-content/synthetic-fail-excel-01.xlsx', 'synthetic_fail_excel_01_screening', NULL);  
INSERT INTO "ingest_session_issue" ("ingest_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('a26ce332-3ced-5623-861d-23a2ef78e4a9', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'd70a4700-6b40-52fc-a7a2-69ef0d7f69ff', 'Structural', 'Sheet ''Screening'' not found in Excel workbook ''synthetic-fail-excel-01.xlsx''', NULL, NULL, 'support/assurance/synthetic-content/synthetic-fail-excel-01.xlsx', NULL, NULL);;

-- emit the errors for the given session (sheet) so it can be picked up
SELECT * FROM ingest_session_issue WHERE session_id = '05269d28-15ae-5bd6-bd88-f949ccfa52d7' and session_entry_id = 'd70a4700-6b40-52fc-a7a2-69ef0d7f69ff';
```

### stdout
```sh
[{"ingest_session_issue_id":"a26ce332-3ced-5623-861d-23a2ef78e4a9","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"d70a4700-6b40-52fc-a7a2-69ef0d7f69ff","issue_type":"Structural","issue_message":"Sheet 'Screening' not found in Excel workbook 'synthetic-fail-excel-01.xlsx'","issue_row":null,"issue_column":null,"invalid_value":"support/assurance/synthetic-content/synthetic-fail-excel-01.xlsx","remediation":null,"elaboration":null}]

```

## ensureStructure-6
```sql
INSERT INTO "ingest_session_entry" ("ingest_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('47277588-99e8-59f5-8384-b24344a86073', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/synthetic-content/synthetic-fail-excel-01.xlsx', 'synthetic_fail_excel_01_q_e_admin_data', NULL);  
INSERT INTO "ingest_session_issue" ("ingest_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('bc0c03b5-d1ba-5301-850f-5e4c42c1bf09', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '47277588-99e8-59f5-8384-b24344a86073', 'Structural', 'Sheet ''QE_Admin_Data'' not found in Excel workbook ''synthetic-fail-excel-01.xlsx''', NULL, NULL, 'support/assurance/synthetic-content/synthetic-fail-excel-01.xlsx', NULL, NULL);;

-- emit the errors for the given session (sheet) so it can be picked up
SELECT * FROM ingest_session_issue WHERE session_id = '05269d28-15ae-5bd6-bd88-f949ccfa52d7' and session_entry_id = '47277588-99e8-59f5-8384-b24344a86073';
```

### stdout
```sh
[{"ingest_session_issue_id":"bc0c03b5-d1ba-5301-850f-5e4c42c1bf09","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"47277588-99e8-59f5-8384-b24344a86073","issue_type":"Structural","issue_message":"Sheet 'QE_Admin_Data' not found in Excel workbook 'synthetic-fail-excel-01.xlsx'","issue_row":null,"issue_column":null,"invalid_value":"support/assurance/synthetic-content/synthetic-fail-excel-01.xlsx","remediation":null,"elaboration":null}]

```

## ensureStructure-7
```sql
INSERT INTO "ingest_session_entry" ("ingest_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('ae477ba1-c7f1-5f34-847a-50bddb7130aa', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/synthetic-content/ahc-hrsn-12-12-2023-valid.csv', 'ahc_hrsn_12_12_2023_valid', NULL);

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
           'ae477ba1-c7f1-5f34-847a-50bddb7130aa',
           'Missing Column',
           'Required column ' || column_name || ' is missing in ahc_hrsn_12_12_2023_valid.',
           'Ensure ahc_hrsn_12_12_2023_valid contains the column "' || column_name || '"'
      FROM required_column_names_in_src;

-- emit the errors for the given session (file) so it can be picked up
SELECT * FROM ingest_session_issue WHERE session_id = '05269d28-15ae-5bd6-bd88-f949ccfa52d7' and session_entry_id = 'ae477ba1-c7f1-5f34-847a-50bddb7130aa';
```


## ensureContent
```sql
-- excel workbook content assurance ahc_hrsn_valid_01_admin_demographic
-- excel workbook content assurance ahc_hrsn_valid_01_screening
-- excel workbook content assurance ahc_hrsn_valid_01_q_e_admin_data
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
           'ae477ba1-c7f1-5f34-847a-50bddb7130aa',
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
INSERT INTO "ingest_session_state" ("ingest_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('05e8feaa-0bed-5909-a817-39812494b361', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', NULL, 'NONE', 'INIT', NULL, NULL, (make_timestamp(2023, 11, 3, 23, 13, 46.186)), NULL);
INSERT INTO "ingest_session_state" ("ingest_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('8f460419-7b80-516d-8919-84520950f612', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', NULL, 'INIT', 'ENTER(init)', NULL, NULL, (make_timestamp(2023, 11, 3, 23, 13, 46.186)), NULL);
INSERT INTO "ingest_session_state" ("ingest_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('7bab389e-54af-5a13-a39f-079abdc73a48', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', NULL, 'ENTER(init)', 'EXIT(init)', NULL, NULL, (make_timestamp(2023, 11, 3, 23, 13, 46.186)), NULL);
INSERT INTO "ingest_session_state" ("ingest_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('168a34c7-d043-5ec4-a84a-c961f1a301ef', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', NULL, 'EXIT(init)', 'ENTER(ensureStructure)', NULL, NULL, (make_timestamp(2023, 11, 3, 23, 13, 46.186)), NULL);
INSERT INTO "ingest_session_state" ("ingest_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', NULL, 'ENTER(ensureStructure)', 'EXIT(ensureStructure)', NULL, NULL, (make_timestamp(2023, 11, 3, 23, 13, 46.186)), NULL);
INSERT INTO "ingest_session_state" ("ingest_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', NULL, 'EXIT(ensureStructure)', 'ENTER(ensureContent)', NULL, NULL, (make_timestamp(2023, 11, 3, 23, 13, 46.186)), NULL);

ATTACH 'support/assurance/results-e2e/resource.sqlite.db' AS resource_db (TYPE SQLITE);

CREATE TABLE resource_db.ingest_session AS SELECT * FROM ingest_session;
CREATE TABLE resource_db.ingest_session_entry AS SELECT * FROM ingest_session_entry;
CREATE TABLE resource_db.ingest_session_state AS SELECT * FROM ingest_session_state;
CREATE TABLE resource_db.ingest_session_issue AS SELECT * FROM ingest_session_issue;

-- {contentResult.map(cr => `CREATE TABLE resource_db.${cr.iaSqlSupplier.tableName} AS SELECT * FROM ${cr.tableName}`).join(";")};

DETACH DATABASE resource_db;
```


## unknown
```sql
INSTALL spatial; -- Only needed once per DuckDB connection
LOAD spatial; -- Only needed once per DuckDB connection
-- TODO: join with ingest_session table to give all the results in one sheet
COPY (SELECT * FROM ingest_session_issue) TO 'support/assurance/results-e2e/diagnostics.xlsx' WITH (FORMAT GDAL, DRIVER 'xlsx');
```
