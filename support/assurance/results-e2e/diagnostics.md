# Ingest Diagnostics

## initDDL
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


INSERT INTO ingest_session (ingest_session_id) VALUES ('b588e64b-0f4d-4652-b493-1cc58046c7a3');
```


## structuralSQL
```sql
INSERT INTO ingest_session_entry (ingest_session_entry_id, session_id, ingest_src, ingest_table_name) 
                          VALUES ('e651a4ea-4066-4a6a-af95-bd9fa4572fca', 'b588e64b-0f4d-4652-b493-1cc58046c7a3', 'support/assurance/synthetic-content/synthetic-fail.csv', 'synthetic_fail');

CREATE TABLE synthetic_fail AS
  SELECT *, row_number() OVER () as src_file_row_number, 'b588e64b-0f4d-4652-b493-1cc58046c7a3'
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
                 'b588e64b-0f4d-4652-b493-1cc58046c7a3', 
                 'e651a4ea-4066-4a6a-af95-bd9fa4572fca', 
                 'Missing Column',
                 'Required column ' || column_name || ' is missing in synthetic_fail.',
                 'Ensure synthetic_fail contains the column "' || column_name || '"'
            FROM required_column_names_in_src;
              -- emit the errors for the given session (file) so it can be picked up
              SELECT * FROM ingest_session_issue WHERE session_id = 'b588e64b-0f4d-4652-b493-1cc58046c7a3' and session_entry_id = 'e651a4ea-4066-4a6a-af95-bd9fa4572fca';
```

### stdout
```sh
[{"ingest_session_issue_id":"61de82d9-81d2-4e36-ad94-fdba4e09b92c","session_id":"b588e64b-0f4d-4652-b493-1cc58046c7a3","session_entry_id":"e651a4ea-4066-4a6a-af95-bd9fa4572fca","issue_type":"Missing Column","issue_message":"Required column PAT_MRN_ID is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"PAT_MRN_ID\"","elaboration":null},
{"ingest_session_issue_id":"39fa1eb5-2127-4f2f-ac8a-44d70e3c0643","session_id":"b588e64b-0f4d-4652-b493-1cc58046c7a3","session_entry_id":"e651a4ea-4066-4a6a-af95-bd9fa4572fca","issue_type":"Missing Column","issue_message":"Required column FACILITY is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"FACILITY\"","elaboration":null},
{"ingest_session_issue_id":"ced02b99-c1ad-4cc1-8b3d-9b07f30cf603","session_id":"b588e64b-0f4d-4652-b493-1cc58046c7a3","session_entry_id":"e651a4ea-4066-4a6a-af95-bd9fa4572fca","issue_type":"Missing Column","issue_message":"Required column FIRST_NAME is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"FIRST_NAME\"","elaboration":null},
{"ingest_session_issue_id":"3bc8b78f-68c6-421f-bd7e-31fddc4f8b25","session_id":"b588e64b-0f4d-4652-b493-1cc58046c7a3","session_entry_id":"e651a4ea-4066-4a6a-af95-bd9fa4572fca","issue_type":"Missing Column","issue_message":"Required column LAST_NAME is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"LAST_NAME\"","elaboration":null},
{"ingest_session_issue_id":"9571ff4e-1aca-41ff-801d-469a911a081d","session_id":"b588e64b-0f4d-4652-b493-1cc58046c7a3","session_entry_id":"e651a4ea-4066-4a6a-af95-bd9fa4572fca","issue_type":"Missing Column","issue_message":"Required column PAT_BIRTH_DATE is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"PAT_BIRTH_DATE\"","elaboration":null},
{"ingest_session_issue_id":"31df5ca8-09d9-4144-addb-03ccb645ce53","session_id":"b588e64b-0f4d-4652-b493-1cc58046c7a3","session_entry_id":"e651a4ea-4066-4a6a-af95-bd9fa4572fca","issue_type":"Missing Column","issue_message":"Required column MEDICAID_CIN is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"MEDICAID_CIN\"","elaboration":null},
{"ingest_session_issue_id":"c7b36a7a-cf9b-4db4-83b1-e7c88648370c","session_id":"b588e64b-0f4d-4652-b493-1cc58046c7a3","session_entry_id":"e651a4ea-4066-4a6a-af95-bd9fa4572fca","issue_type":"Missing Column","issue_message":"Required column ENCOUNTER_ID is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"ENCOUNTER_ID\"","elaboration":null},
{"ingest_session_issue_id":"cb98c50f-979b-4a01-b738-2cb41be35bc3","session_id":"b588e64b-0f4d-4652-b493-1cc58046c7a3","session_entry_id":"e651a4ea-4066-4a6a-af95-bd9fa4572fca","issue_type":"Missing Column","issue_message":"Required column SURVEY is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"SURVEY\"","elaboration":null},
{"ingest_session_issue_id":"ff433581-43c0-46ca-b9b8-59d11f9b7c55","session_id":"b588e64b-0f4d-4652-b493-1cc58046c7a3","session_entry_id":"e651a4ea-4066-4a6a-af95-bd9fa4572fca","issue_type":"Missing Column","issue_message":"Required column SURVEY_ID is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"SURVEY_ID\"","elaboration":null},
{"ingest_session_issue_id":"454ee3e9-bdfb-4a1e-bb75-24c6ff3393ca","session_id":"b588e64b-0f4d-4652-b493-1cc58046c7a3","session_entry_id":"e651a4ea-4066-4a6a-af95-bd9fa4572fca","issue_type":"Missing Column","issue_message":"Required column RECORDED_TIME is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"RECORDED_TIME\"","elaboration":null},
{"ingest_session_issue_id":"bedb2365-801e-4da9-952e-d87801e25365","session_id":"b588e64b-0f4d-4652-b493-1cc58046c7a3","session_entry_id":"e651a4ea-4066-4a6a-af95-bd9fa4572fca","issue_type":"Missing Column","issue_message":"Required column QUESTION is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"QUESTION\"","elaboration":null},
{"ingest_session_issue_id":"0dd103ce-8047-4567-b433-3591c9d113f4","session_id":"b588e64b-0f4d-4652-b493-1cc58046c7a3","session_entry_id":"e651a4ea-4066-4a6a-af95-bd9fa4572fca","issue_type":"Missing Column","issue_message":"Required column MEAS_VALUE is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"MEAS_VALUE\"","elaboration":null},
{"ingest_session_issue_id":"72dc07af-0c2e-4c52-9a28-f34cc03b8730","session_id":"b588e64b-0f4d-4652-b493-1cc58046c7a3","session_entry_id":"e651a4ea-4066-4a6a-af95-bd9fa4572fca","issue_type":"Missing Column","issue_message":"Required column QUESTION_CODE is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"QUESTION_CODE\"","elaboration":null},
{"ingest_session_issue_id":"fb0318cb-8bf1-4d08-881f-f2ea63dfee60","session_id":"b588e64b-0f4d-4652-b493-1cc58046c7a3","session_entry_id":"e651a4ea-4066-4a6a-af95-bd9fa4572fca","issue_type":"Missing Column","issue_message":"Required column QUESTION_CODE_SYSTEM_NAME is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"QUESTION_CODE_SYSTEM_NAME\"","elaboration":null},
{"ingest_session_issue_id":"ed9c2b9a-de2a-4202-a133-beac12a8d66c","session_id":"b588e64b-0f4d-4652-b493-1cc58046c7a3","session_entry_id":"e651a4ea-4066-4a6a-af95-bd9fa4572fca","issue_type":"Missing Column","issue_message":"Required column ANSWER_CODE is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"ANSWER_CODE\"","elaboration":null},
{"ingest_session_issue_id":"abcb7e43-7726-4000-bd0a-d76330a98b3c","session_id":"b588e64b-0f4d-4652-b493-1cc58046c7a3","session_entry_id":"e651a4ea-4066-4a6a-af95-bd9fa4572fca","issue_type":"Missing Column","issue_message":"Required column ANSWER_CODE_SYSTEM_NAME is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"ANSWER_CODE_SYSTEM_NAME\"","elaboration":null},
{"ingest_session_issue_id":"2f945700-6f2d-443c-b9cc-c2ef76d72afd","session_id":"b588e64b-0f4d-4652-b493-1cc58046c7a3","session_entry_id":"e651a4ea-4066-4a6a-af95-bd9fa4572fca","issue_type":"Missing Column","issue_message":"Required column SDOH_DOMAIN is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"SDOH_DOMAIN\"","elaboration":null},
{"ingest_session_issue_id":"5f47293f-97d8-4bee-a90e-7eedd5d515bf","session_id":"b588e64b-0f4d-4652-b493-1cc58046c7a3","session_entry_id":"e651a4ea-4066-4a6a-af95-bd9fa4572fca","issue_type":"Missing Column","issue_message":"Required column NEED_INDICATED is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"NEED_INDICATED\"","elaboration":null},
{"ingest_session_issue_id":"d4de0bbf-89cd-480a-b280-be41fe73ca95","session_id":"b588e64b-0f4d-4652-b493-1cc58046c7a3","session_entry_id":"e651a4ea-4066-4a6a-af95-bd9fa4572fca","issue_type":"Missing Column","issue_message":"Required column VISIT_PART_2_FLAG is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"VISIT_PART_2_FLAG\"","elaboration":null},
{"ingest_session_issue_id":"9e7173a6-e3b9-49d4-aac0-5dba9d94b68b","session_id":"b588e64b-0f4d-4652-b493-1cc58046c7a3","session_entry_id":"e651a4ea-4066-4a6a-af95-bd9fa4572fca","issue_type":"Missing Column","issue_message":"Required column VISIT_OMH_FLAG is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"VISIT_OMH_FLAG\"","elaboration":null},
{"ingest_session_issue_id":"efc42a9d-f48a-4c46-9a98-be8df45c43ab","session_id":"b588e64b-0f4d-4652-b493-1cc58046c7a3","session_entry_id":"e651a4ea-4066-4a6a-af95-bd9fa4572fca","issue_type":"Missing Column","issue_message":"Required column VISIT_OPWDD_FLAG is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"VISIT_OPWDD_FLAG\"","elaboration":null}]

```

## structuralSQL (1)
```sql
INSERT INTO ingest_session_entry (ingest_session_entry_id, session_id, ingest_src, ingest_table_name) 
                          VALUES ('babf7812-8031-4404-bd0c-d5bde182d5a2', 'b588e64b-0f4d-4652-b493-1cc58046c7a3', 'support/assurance/synthetic-content/ahc-hrsn-12-12-2023-valid.csv', 'ahc_hrsn_12_12_2023_valid');

CREATE TABLE ahc_hrsn_12_12_2023_valid AS
  SELECT *, row_number() OVER () as src_file_row_number, 'b588e64b-0f4d-4652-b493-1cc58046c7a3'
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
                 'b588e64b-0f4d-4652-b493-1cc58046c7a3', 
                 'babf7812-8031-4404-bd0c-d5bde182d5a2', 
                 'Missing Column',
                 'Required column ' || column_name || ' is missing in ahc_hrsn_12_12_2023_valid.',
                 'Ensure ahc_hrsn_12_12_2023_valid contains the column "' || column_name || '"'
            FROM required_column_names_in_src;
              -- emit the errors for the given session (file) so it can be picked up
              SELECT * FROM ingest_session_issue WHERE session_id = 'b588e64b-0f4d-4652-b493-1cc58046c7a3' and session_entry_id = 'babf7812-8031-4404-bd0c-d5bde182d5a2';
```


## contentSQL
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
                 'b588e64b-0f4d-4652-b493-1cc58046c7a3', 
                 'babf7812-8031-4404-bd0c-d5bde182d5a2', 
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

        INSTALL spatial; -- Only needed once per DuckDB connection
        LOAD spatial; -- Only needed once per DuckDB connection
        -- TODO: join with ingest_session table to give all the results in one sheet
        COPY (SELECT * FROM ingest_session_issue) TO 'support/assurance/results-e2e/diagnostics.xlsx' WITH (FORMAT GDAL, DRIVER 'xlsx');
```


## emitResources
```sql

        ATTACH 'support/assurance/results-e2e/resource.sqlite.db' AS resource_db (TYPE SQLITE);

        CREATE TABLE resource_db.ingest_session AS SELECT * FROM ingest_session;
CREATE TABLE resource_db.ingest_session_entry AS SELECT * FROM ingest_session_entry;
CREATE TABLE resource_db.ingest_session_state AS SELECT * FROM ingest_session_state;
CREATE TABLE resource_db.ingest_session_issue AS SELECT * FROM ingest_session_issue;

        CREATE TABLE resource_db.ahc_hrsn_12_12_2023_valid AS SELECT * FROM ahc_hrsn_12_12_2023_valid;

        DETACH DATABASE resource_db;
```
