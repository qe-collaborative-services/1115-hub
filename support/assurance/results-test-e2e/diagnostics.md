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


## ingestCsvSources-0
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
[{"ingest_session_issue_id":"55b85aad-7260-4431-883f-7d41ec2d4976","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"abf5c680-a135-5d89-b871-fa5b9b99aed6","issue_type":"Missing Column","issue_message":"Required column PAT_MRN_ID is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"PAT_MRN_ID\"","elaboration":null},
{"ingest_session_issue_id":"350dfaaa-8fd0-44f3-afe4-d47fa695766d","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"abf5c680-a135-5d89-b871-fa5b9b99aed6","issue_type":"Missing Column","issue_message":"Required column FACILITY is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"FACILITY\"","elaboration":null},
{"ingest_session_issue_id":"25f7c4b0-43d9-4eaf-b9ed-a187ca2c3e5f","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"abf5c680-a135-5d89-b871-fa5b9b99aed6","issue_type":"Missing Column","issue_message":"Required column FIRST_NAME is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"FIRST_NAME\"","elaboration":null},
{"ingest_session_issue_id":"b7b4195d-63fb-40d0-8ff7-dda5c3fcf442","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"abf5c680-a135-5d89-b871-fa5b9b99aed6","issue_type":"Missing Column","issue_message":"Required column LAST_NAME is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"LAST_NAME\"","elaboration":null},
{"ingest_session_issue_id":"9f8fc4cd-367e-432b-affa-6fe0b1e67bf6","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"abf5c680-a135-5d89-b871-fa5b9b99aed6","issue_type":"Missing Column","issue_message":"Required column PAT_BIRTH_DATE is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"PAT_BIRTH_DATE\"","elaboration":null},
{"ingest_session_issue_id":"8e06e7ea-196c-486e-b7e6-7b4f535eec2e","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"abf5c680-a135-5d89-b871-fa5b9b99aed6","issue_type":"Missing Column","issue_message":"Required column MEDICAID_CIN is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"MEDICAID_CIN\"","elaboration":null},
{"ingest_session_issue_id":"f049d1e6-2aa3-4a15-93a3-33cc5bca57ed","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"abf5c680-a135-5d89-b871-fa5b9b99aed6","issue_type":"Missing Column","issue_message":"Required column ENCOUNTER_ID is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"ENCOUNTER_ID\"","elaboration":null},
{"ingest_session_issue_id":"153e41e0-4a67-4fd3-af1f-087856d3371e","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"abf5c680-a135-5d89-b871-fa5b9b99aed6","issue_type":"Missing Column","issue_message":"Required column SURVEY is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"SURVEY\"","elaboration":null},
{"ingest_session_issue_id":"22e180a6-6225-48fe-84b7-1ed2bb1f806f","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"abf5c680-a135-5d89-b871-fa5b9b99aed6","issue_type":"Missing Column","issue_message":"Required column SURVEY_ID is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"SURVEY_ID\"","elaboration":null},
{"ingest_session_issue_id":"a4e9a61d-a286-44fa-a432-2e720d47afb6","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"abf5c680-a135-5d89-b871-fa5b9b99aed6","issue_type":"Missing Column","issue_message":"Required column RECORDED_TIME is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"RECORDED_TIME\"","elaboration":null},
{"ingest_session_issue_id":"146fefee-4116-4a59-8088-01ceb9e1b716","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"abf5c680-a135-5d89-b871-fa5b9b99aed6","issue_type":"Missing Column","issue_message":"Required column QUESTION is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"QUESTION\"","elaboration":null},
{"ingest_session_issue_id":"eeecfbc8-3dbf-4fc0-aeb4-49c0257f4209","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"abf5c680-a135-5d89-b871-fa5b9b99aed6","issue_type":"Missing Column","issue_message":"Required column MEAS_VALUE is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"MEAS_VALUE\"","elaboration":null},
{"ingest_session_issue_id":"7b018870-eb0a-4d7d-a9ed-f44803279428","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"abf5c680-a135-5d89-b871-fa5b9b99aed6","issue_type":"Missing Column","issue_message":"Required column QUESTION_CODE is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"QUESTION_CODE\"","elaboration":null},
{"ingest_session_issue_id":"4b4e5dd4-e3ba-4e15-9ef4-04e415f82617","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"abf5c680-a135-5d89-b871-fa5b9b99aed6","issue_type":"Missing Column","issue_message":"Required column QUESTION_CODE_SYSTEM_NAME is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"QUESTION_CODE_SYSTEM_NAME\"","elaboration":null},
{"ingest_session_issue_id":"ad5bf60c-020d-4eb1-b1a1-77963de52973","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"abf5c680-a135-5d89-b871-fa5b9b99aed6","issue_type":"Missing Column","issue_message":"Required column ANSWER_CODE is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"ANSWER_CODE\"","elaboration":null},
{"ingest_session_issue_id":"f05fc09f-5a14-4046-8c93-07590efbf2fb","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"abf5c680-a135-5d89-b871-fa5b9b99aed6","issue_type":"Missing Column","issue_message":"Required column ANSWER_CODE_SYSTEM_NAME is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"ANSWER_CODE_SYSTEM_NAME\"","elaboration":null},
{"ingest_session_issue_id":"930b1a02-88fb-4877-b29b-e23b11b23c37","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"abf5c680-a135-5d89-b871-fa5b9b99aed6","issue_type":"Missing Column","issue_message":"Required column SDOH_DOMAIN is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"SDOH_DOMAIN\"","elaboration":null},
{"ingest_session_issue_id":"1cd964d1-a2c5-41c3-b1f5-99e6d4ed52c2","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"abf5c680-a135-5d89-b871-fa5b9b99aed6","issue_type":"Missing Column","issue_message":"Required column NEED_INDICATED is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"NEED_INDICATED\"","elaboration":null},
{"ingest_session_issue_id":"9a07efc3-7387-407d-b26b-d855f2d5e7fc","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"abf5c680-a135-5d89-b871-fa5b9b99aed6","issue_type":"Missing Column","issue_message":"Required column VISIT_PART_2_FLAG is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"VISIT_PART_2_FLAG\"","elaboration":null},
{"ingest_session_issue_id":"183835d4-6a89-42bf-b776-7df1549912fd","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"abf5c680-a135-5d89-b871-fa5b9b99aed6","issue_type":"Missing Column","issue_message":"Required column VISIT_OMH_FLAG is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"VISIT_OMH_FLAG\"","elaboration":null},
{"ingest_session_issue_id":"bf4668a9-d79d-4069-835e-b3ed8779facf","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"abf5c680-a135-5d89-b871-fa5b9b99aed6","issue_type":"Missing Column","issue_message":"Required column VISIT_OPWDD_FLAG is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"VISIT_OPWDD_FLAG\"","elaboration":null}]

```

## ingestCsvSources-1
```sql
INSERT INTO "ingest_session_entry" ("ingest_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('641dff51-97fd-56b3-8443-c1ed568a6d66', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/synthetic-content/ahc-hrsn-12-12-2023-valid.csv', 'ahc_hrsn_12_12_2023_valid', NULL);

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
           '641dff51-97fd-56b3-8443-c1ed568a6d66',
           'Missing Column',
           'Required column ' || column_name || ' is missing in ahc_hrsn_12_12_2023_valid.',
           'Ensure ahc_hrsn_12_12_2023_valid contains the column "' || column_name || '"'
      FROM required_column_names_in_src;

-- emit the errors for the given session (file) so it can be picked up
SELECT * FROM ingest_session_issue WHERE session_id = '05269d28-15ae-5bd6-bd88-f949ccfa52d7' and session_entry_id = '641dff51-97fd-56b3-8443-c1ed568a6d66';
```


## ingestExcelSources-0
```sql
INSERT INTO "ingest_session_entry" ("ingest_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('58b22e99-5854-53bf-adbe-08e67df99b85', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/synthetic-content/ahc-hrsn-valid-01.xlsx', 'ahc_hrsn_valid_01_admin_demographic', NULL);

-- ingest 'Admin_Demographic' into ahc_hrsn_valid_01_admin_demographic

-- emit the errors for the given session (file) so it can be picked up
SELECT * FROM ingest_session_issue WHERE session_id = '05269d28-15ae-5bd6-bd88-f949ccfa52d7' and session_entry_id = '58b22e99-5854-53bf-adbe-08e67df99b85';
```


## ingestExcelSources-1
```sql
INSERT INTO "ingest_session_entry" ("ingest_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('a26ce332-3ced-5623-861d-23a2ef78e4a9', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/synthetic-content/ahc-hrsn-valid-01.xlsx', 'ahc_hrsn_valid_01_screening', NULL);

-- ingest 'Screening' into ahc_hrsn_valid_01_screening

-- emit the errors for the given session (file) so it can be picked up
SELECT * FROM ingest_session_issue WHERE session_id = '05269d28-15ae-5bd6-bd88-f949ccfa52d7' and session_entry_id = 'a26ce332-3ced-5623-861d-23a2ef78e4a9';
```


## ingestExcelSources-2
```sql
INSERT INTO "ingest_session_entry" ("ingest_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('bc0c03b5-d1ba-5301-850f-5e4c42c1bf09', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/synthetic-content/ahc-hrsn-valid-01.xlsx', 'ahc_hrsn_valid_01_q_e_admin_data', NULL);

-- ingest 'QE_Admin_Data' into ahc_hrsn_valid_01_q_e_admin_data

-- emit the errors for the given session (file) so it can be picked up
SELECT * FROM ingest_session_issue WHERE session_id = '05269d28-15ae-5bd6-bd88-f949ccfa52d7' and session_entry_id = 'bc0c03b5-d1ba-5301-850f-5e4c42c1bf09';
```


## ingestExcelSources-3
```sql
INSERT INTO "ingest_session_entry" ("ingest_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('ae477ba1-c7f1-5f34-847a-50bddb7130aa', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/synthetic-content/synthetic-fail-excel-01.xlsx', 'synthetic_fail_excel_01_admin_demographic', NULL);
INSERT INTO "ingest_session_issue" ("ingest_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'ae477ba1-c7f1-5f34-847a-50bddb7130aa', 'Structural', 'Sheet ''Admin_Demographic'' not found in Excel workbook ''synthetic-fail-excel-01.xlsx''', NULL, NULL, 'support/assurance/synthetic-content/synthetic-fail-excel-01.xlsx', NULL, NULL);;
    
-- emit the errors for the given session (file) so it can be picked up
SELECT * FROM ingest_session_issue WHERE session_id = '05269d28-15ae-5bd6-bd88-f949ccfa52d7' and session_entry_id = 'ae477ba1-c7f1-5f34-847a-50bddb7130aa';
```

### stdout
```sh
[{"ingest_session_issue_id":"8aad9cfa-b1a2-5fb1-a6ab-613a79a7e839","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"ae477ba1-c7f1-5f34-847a-50bddb7130aa","issue_type":"Structural","issue_message":"Sheet 'Admin_Demographic' not found in Excel workbook 'synthetic-fail-excel-01.xlsx'","issue_row":null,"issue_column":null,"invalid_value":"support/assurance/synthetic-content/synthetic-fail-excel-01.xlsx","remediation":null,"elaboration":null}]

```

## ingestExcelSources-4
```sql
INSERT INTO "ingest_session_entry" ("ingest_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/synthetic-content/synthetic-fail-excel-01.xlsx', 'synthetic_fail_excel_01_screening', NULL);
INSERT INTO "ingest_session_issue" ("ingest_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('7ef8bdeb-fd56-5eb9-a09b-ef15ce18dc49', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0', 'Structural', 'Sheet ''Screening'' not found in Excel workbook ''synthetic-fail-excel-01.xlsx''', NULL, NULL, 'support/assurance/synthetic-content/synthetic-fail-excel-01.xlsx', NULL, NULL);;
    
-- emit the errors for the given session (file) so it can be picked up
SELECT * FROM ingest_session_issue WHERE session_id = '05269d28-15ae-5bd6-bd88-f949ccfa52d7' and session_entry_id = 'b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0';
```

### stdout
```sh
[{"ingest_session_issue_id":"7ef8bdeb-fd56-5eb9-a09b-ef15ce18dc49","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"b41ccd27-9a4f-5cc8-9c5d-b55242d90fb0","issue_type":"Structural","issue_message":"Sheet 'Screening' not found in Excel workbook 'synthetic-fail-excel-01.xlsx'","issue_row":null,"issue_column":null,"invalid_value":"support/assurance/synthetic-content/synthetic-fail-excel-01.xlsx","remediation":null,"elaboration":null}]

```

## ingestExcelSources-5
```sql
INSERT INTO "ingest_session_entry" ("ingest_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('591191c7-f693-5957-8734-ac87151ca981', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/synthetic-content/synthetic-fail-excel-01.xlsx', 'synthetic_fail_excel_01_q_e_admin_data', NULL);
INSERT INTO "ingest_session_issue" ("ingest_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('3b4eb0e5-6239-537a-8e67-e50e172e72a2', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '591191c7-f693-5957-8734-ac87151ca981', 'Structural', 'Sheet ''QE_Admin_Data'' not found in Excel workbook ''synthetic-fail-excel-01.xlsx''', NULL, NULL, 'support/assurance/synthetic-content/synthetic-fail-excel-01.xlsx', NULL, NULL);;
    
-- emit the errors for the given session (file) so it can be picked up
SELECT * FROM ingest_session_issue WHERE session_id = '05269d28-15ae-5bd6-bd88-f949ccfa52d7' and session_entry_id = '591191c7-f693-5957-8734-ac87151ca981';
```

### stdout
```sh
[{"ingest_session_issue_id":"3b4eb0e5-6239-537a-8e67-e50e172e72a2","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"591191c7-f693-5957-8734-ac87151ca981","issue_type":"Structural","issue_message":"Sheet 'QE_Admin_Data' not found in Excel workbook 'synthetic-fail-excel-01.xlsx'","issue_row":null,"issue_column":null,"invalid_value":"support/assurance/synthetic-content/synthetic-fail-excel-01.xlsx","remediation":null,"elaboration":null}]

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
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7',
           '641dff51-97fd-56b3-8443-c1ed568a6d66',
           'Data Type Mismatch',
           issue_row,
           issue_column,
           invalid_value,
           'Non-integer value "' || invalid_value || '" found in ' || issue_column,
           'Convert non-integer values to INTEGER'
      FROM numeric_value_in_all_rows;
-- ensure Excel Workbook Sheet content 'ahc_hrsn_valid_01_admin_demographic'
-- ensure Excel Workbook Sheet content 'ahc_hrsn_valid_01_screening'
-- ensure Excel Workbook Sheet content 'ahc_hrsn_valid_01_q_e_admin_data'
```


## emitResources
```sql
INSERT INTO "ingest_session_state" ("ingest_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('05e8feaa-0bed-5909-a817-39812494b361', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', NULL, 'NONE', 'ENTER(potentialSources)', NULL, NULL, (make_timestamp(2023, 11, 4, 20, 58, 5.800)), NULL);
INSERT INTO "ingest_session_state" ("ingest_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('8f460419-7b80-516d-8919-84520950f612', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', NULL, 'ENTER(potentialSources)', 'EXIT(potentialSources)', NULL, NULL, (make_timestamp(2023, 11, 4, 20, 58, 5.801)), NULL);
INSERT INTO "ingest_session_state" ("ingest_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('7bab389e-54af-5a13-a39f-079abdc73a48', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', NULL, 'EXIT(potentialSources)', 'ENTER(prepareAdminInfra)', NULL, NULL, (make_timestamp(2023, 11, 4, 20, 58, 5.801)), NULL);
INSERT INTO "ingest_session_state" ("ingest_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('168a34c7-d043-5ec4-a84a-c961f1a301ef', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', NULL, 'ENTER(prepareAdminInfra)', 'EXIT(prepareAdminInfra)', NULL, NULL, (make_timestamp(2023, 11, 4, 20, 58, 5.801)), NULL);
INSERT INTO "ingest_session_state" ("ingest_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('1931dfcc-e8fc-597d-b1bc-65b4287e6fdf', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', NULL, 'EXIT(prepareAdminInfra)', 'ENTER(walkSources)', NULL, NULL, (make_timestamp(2023, 11, 4, 20, 58, 5.801)), NULL);
INSERT INTO "ingest_session_state" ("ingest_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('8b7c669c-1795-5f6b-8f3a-3e502b74c628', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', NULL, 'ENTER(walkSources)', 'EXIT(walkSources)', NULL, NULL, (make_timestamp(2023, 11, 4, 20, 58, 5.801)), NULL);
INSERT INTO "ingest_session_state" ("ingest_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('7b979b68-7227-53fd-b689-e4fe153afb76', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', NULL, 'EXIT(walkSources)', 'ENTER(ingestCsvSources)', NULL, NULL, (make_timestamp(2023, 11, 4, 20, 58, 5.801)), NULL);
INSERT INTO "ingest_session_state" ("ingest_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('d70a4700-6b40-52fc-a7a2-69ef0d7f69ff', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', NULL, 'ENTER(ingestCsvSources)', 'EXIT(ingestCsvSources)', NULL, NULL, (make_timestamp(2023, 11, 4, 20, 58, 5.801)), NULL);
INSERT INTO "ingest_session_state" ("ingest_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('47277588-99e8-59f5-8384-b24344a86073', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', NULL, 'EXIT(ingestCsvSources)', 'ENTER(ingestExcelSources)', NULL, NULL, (make_timestamp(2023, 11, 4, 20, 58, 5.801)), NULL);
INSERT INTO "ingest_session_state" ("ingest_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('071f8fe1-4899-5c71-9c86-7d7377661d45', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', NULL, 'ENTER(ingestExcelSources)', 'EXIT(ingestExcelSources)', NULL, NULL, (make_timestamp(2023, 11, 4, 20, 58, 5.801)), NULL);
INSERT INTO "ingest_session_state" ("ingest_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('86b4a49e-7378-5159-9f41-b005208c31bc', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', NULL, 'EXIT(ingestExcelSources)', 'ENTER(ensureContent)', NULL, NULL, (make_timestamp(2023, 11, 4, 20, 58, 5.801)), NULL);

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
