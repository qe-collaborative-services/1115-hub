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


INSERT INTO ingest_session (ingest_session_id) VALUES ('13170394-f85f-4cb1-9bf5-abb57a1fe535');
```


## structuralSQL
```sql
INSERT INTO ingest_session_entry (ingest_session_entry_id, session_id, ingest_src, ingest_table_name) 
                          VALUES ('17f7028a-3094-449e-ba22-a62e7940f6c2', '13170394-f85f-4cb1-9bf5-abb57a1fe535', '/home/snshah/workspaces/github.com/qe-collaborative-services/1115-hub/src/synthetic-content/synthetic-fail.csv', 'synthetic_fail');

CREATE TABLE synthetic_fail AS
  SELECT *, row_number() OVER () as src_file_row_number, '13170394-f85f-4cb1-9bf5-abb57a1fe535'
    FROM read_csv_auto('/home/snshah/workspaces/github.com/qe-collaborative-services/1115-hub/src/synthetic-content/synthetic-fail.csv', header=true);

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
                 '13170394-f85f-4cb1-9bf5-abb57a1fe535', 
                 '17f7028a-3094-449e-ba22-a62e7940f6c2', 
                 'Missing Column',
                 'Required column ' || column_name || ' is missing in synthetic_fail.',
                 'Ensure synthetic_fail contains the column "' || column_name || '"'
            FROM required_column_names_in_src;
              -- emit the errors for the given session (file) so it can be picked up
              SELECT * FROM ingest_session_issue WHERE session_id = '13170394-f85f-4cb1-9bf5-abb57a1fe535' and session_entry_id = '17f7028a-3094-449e-ba22-a62e7940f6c2';
```

### stdout
```sh
[{"ingest_session_issue_id":"c068f5ee-1d33-4d3e-93fb-b416ae9878c6","session_id":"13170394-f85f-4cb1-9bf5-abb57a1fe535","session_entry_id":"17f7028a-3094-449e-ba22-a62e7940f6c2","issue_type":"Missing Column","issue_message":"Required column PAT_MRN_ID is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"PAT_MRN_ID\"","elaboration":null},
{"ingest_session_issue_id":"3816d3c4-615a-4159-af49-8b0ac3505c2c","session_id":"13170394-f85f-4cb1-9bf5-abb57a1fe535","session_entry_id":"17f7028a-3094-449e-ba22-a62e7940f6c2","issue_type":"Missing Column","issue_message":"Required column FACILITY is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"FACILITY\"","elaboration":null},
{"ingest_session_issue_id":"fa7976a5-d876-4c1c-b2f5-2ad1448deae7","session_id":"13170394-f85f-4cb1-9bf5-abb57a1fe535","session_entry_id":"17f7028a-3094-449e-ba22-a62e7940f6c2","issue_type":"Missing Column","issue_message":"Required column FIRST_NAME is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"FIRST_NAME\"","elaboration":null},
{"ingest_session_issue_id":"5881d45c-28d2-47f2-a05f-5e36cb198b1f","session_id":"13170394-f85f-4cb1-9bf5-abb57a1fe535","session_entry_id":"17f7028a-3094-449e-ba22-a62e7940f6c2","issue_type":"Missing Column","issue_message":"Required column LAST_NAME is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"LAST_NAME\"","elaboration":null},
{"ingest_session_issue_id":"f4514cfc-b13f-4206-8ee9-a33bf7431c2d","session_id":"13170394-f85f-4cb1-9bf5-abb57a1fe535","session_entry_id":"17f7028a-3094-449e-ba22-a62e7940f6c2","issue_type":"Missing Column","issue_message":"Required column PAT_BIRTH_DATE is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"PAT_BIRTH_DATE\"","elaboration":null},
{"ingest_session_issue_id":"09b781ff-8295-4e14-b0dd-54a663cce68b","session_id":"13170394-f85f-4cb1-9bf5-abb57a1fe535","session_entry_id":"17f7028a-3094-449e-ba22-a62e7940f6c2","issue_type":"Missing Column","issue_message":"Required column MEDICAID_CIN is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"MEDICAID_CIN\"","elaboration":null},
{"ingest_session_issue_id":"14f9dd7e-fa2b-467b-a8e4-76d520279889","session_id":"13170394-f85f-4cb1-9bf5-abb57a1fe535","session_entry_id":"17f7028a-3094-449e-ba22-a62e7940f6c2","issue_type":"Missing Column","issue_message":"Required column ENCOUNTER_ID is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"ENCOUNTER_ID\"","elaboration":null},
{"ingest_session_issue_id":"830b82ad-9ea0-4c9b-88d3-68ee5b729ef9","session_id":"13170394-f85f-4cb1-9bf5-abb57a1fe535","session_entry_id":"17f7028a-3094-449e-ba22-a62e7940f6c2","issue_type":"Missing Column","issue_message":"Required column SURVEY is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"SURVEY\"","elaboration":null},
{"ingest_session_issue_id":"b41bd2fb-a7fd-47aa-b8b1-59f334a1292d","session_id":"13170394-f85f-4cb1-9bf5-abb57a1fe535","session_entry_id":"17f7028a-3094-449e-ba22-a62e7940f6c2","issue_type":"Missing Column","issue_message":"Required column SURVEY_ID is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"SURVEY_ID\"","elaboration":null},
{"ingest_session_issue_id":"7b0dee68-3be8-4c78-a389-b9cfb9341a21","session_id":"13170394-f85f-4cb1-9bf5-abb57a1fe535","session_entry_id":"17f7028a-3094-449e-ba22-a62e7940f6c2","issue_type":"Missing Column","issue_message":"Required column RECORDED_TIME is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"RECORDED_TIME\"","elaboration":null},
{"ingest_session_issue_id":"8fd815cb-044d-4c07-8b21-3aa71011081a","session_id":"13170394-f85f-4cb1-9bf5-abb57a1fe535","session_entry_id":"17f7028a-3094-449e-ba22-a62e7940f6c2","issue_type":"Missing Column","issue_message":"Required column QUESTION is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"QUESTION\"","elaboration":null},
{"ingest_session_issue_id":"20db168b-0809-4577-b971-6800dc54a172","session_id":"13170394-f85f-4cb1-9bf5-abb57a1fe535","session_entry_id":"17f7028a-3094-449e-ba22-a62e7940f6c2","issue_type":"Missing Column","issue_message":"Required column MEAS_VALUE is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"MEAS_VALUE\"","elaboration":null},
{"ingest_session_issue_id":"52c5464f-9177-4222-b040-2ce15c0dfe0f","session_id":"13170394-f85f-4cb1-9bf5-abb57a1fe535","session_entry_id":"17f7028a-3094-449e-ba22-a62e7940f6c2","issue_type":"Missing Column","issue_message":"Required column QUESTION_CODE is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"QUESTION_CODE\"","elaboration":null},
{"ingest_session_issue_id":"c3d95d32-7e19-41ee-a50c-e9050ac8aa91","session_id":"13170394-f85f-4cb1-9bf5-abb57a1fe535","session_entry_id":"17f7028a-3094-449e-ba22-a62e7940f6c2","issue_type":"Missing Column","issue_message":"Required column QUESTION_CODE_SYSTEM_NAME is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"QUESTION_CODE_SYSTEM_NAME\"","elaboration":null},
{"ingest_session_issue_id":"ae1bfd08-8dba-4ac6-af06-4146652103b2","session_id":"13170394-f85f-4cb1-9bf5-abb57a1fe535","session_entry_id":"17f7028a-3094-449e-ba22-a62e7940f6c2","issue_type":"Missing Column","issue_message":"Required column ANSWER_CODE is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"ANSWER_CODE\"","elaboration":null},
{"ingest_session_issue_id":"fec983db-2fa6-4e52-896a-c4aad4b55acc","session_id":"13170394-f85f-4cb1-9bf5-abb57a1fe535","session_entry_id":"17f7028a-3094-449e-ba22-a62e7940f6c2","issue_type":"Missing Column","issue_message":"Required column ANSWER_CODE_SYSTEM_NAME is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"ANSWER_CODE_SYSTEM_NAME\"","elaboration":null},
{"ingest_session_issue_id":"1fcc02a2-a6fd-4772-b4ff-1aa8e479243a","session_id":"13170394-f85f-4cb1-9bf5-abb57a1fe535","session_entry_id":"17f7028a-3094-449e-ba22-a62e7940f6c2","issue_type":"Missing Column","issue_message":"Required column SDOH_DOMAIN is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"SDOH_DOMAIN\"","elaboration":null},
{"ingest_session_issue_id":"178d80fb-3194-4861-b8b0-b6de8e328503","session_id":"13170394-f85f-4cb1-9bf5-abb57a1fe535","session_entry_id":"17f7028a-3094-449e-ba22-a62e7940f6c2","issue_type":"Missing Column","issue_message":"Required column NEED_INDICATED is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"NEED_INDICATED\"","elaboration":null},
{"ingest_session_issue_id":"0015bcba-48dd-423b-827b-add7c961f9cd","session_id":"13170394-f85f-4cb1-9bf5-abb57a1fe535","session_entry_id":"17f7028a-3094-449e-ba22-a62e7940f6c2","issue_type":"Missing Column","issue_message":"Required column VISIT_PART_2_FLAG is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"VISIT_PART_2_FLAG\"","elaboration":null},
{"ingest_session_issue_id":"6c7a8fb3-9060-49cd-83d3-bfd1545a659c","session_id":"13170394-f85f-4cb1-9bf5-abb57a1fe535","session_entry_id":"17f7028a-3094-449e-ba22-a62e7940f6c2","issue_type":"Missing Column","issue_message":"Required column VISIT_OMH_FLAG is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"VISIT_OMH_FLAG\"","elaboration":null},
{"ingest_session_issue_id":"9bdb92a7-5571-4821-b11e-e8e01c9e2337","session_id":"13170394-f85f-4cb1-9bf5-abb57a1fe535","session_entry_id":"17f7028a-3094-449e-ba22-a62e7940f6c2","issue_type":"Missing Column","issue_message":"Required column VISIT_OPWDD_FLAG is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"VISIT_OPWDD_FLAG\"","elaboration":null}]

```

## structuralSQL (1)
```sql
INSERT INTO ingest_session_entry (ingest_session_entry_id, session_id, ingest_src, ingest_table_name) 
                          VALUES ('02549d8e-6730-451e-b47a-c6100f6d47a0', '13170394-f85f-4cb1-9bf5-abb57a1fe535', '/home/snshah/workspaces/github.com/qe-collaborative-services/1115-hub/src/synthetic-content/ahc-hrsn-12-12-2023-valid.csv', 'ahc_hrsn_12_12_2023_valid');

CREATE TABLE ahc_hrsn_12_12_2023_valid AS
  SELECT *, row_number() OVER () as src_file_row_number, '13170394-f85f-4cb1-9bf5-abb57a1fe535'
    FROM read_csv_auto('/home/snshah/workspaces/github.com/qe-collaborative-services/1115-hub/src/synthetic-content/ahc-hrsn-12-12-2023-valid.csv', header=true);

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
                 '13170394-f85f-4cb1-9bf5-abb57a1fe535', 
                 '02549d8e-6730-451e-b47a-c6100f6d47a0', 
                 'Missing Column',
                 'Required column ' || column_name || ' is missing in ahc_hrsn_12_12_2023_valid.',
                 'Ensure ahc_hrsn_12_12_2023_valid contains the column "' || column_name || '"'
            FROM required_column_names_in_src;
              -- emit the errors for the given session (file) so it can be picked up
              SELECT * FROM ingest_session_issue WHERE session_id = '13170394-f85f-4cb1-9bf5-abb57a1fe535' and session_entry_id = '02549d8e-6730-451e-b47a-c6100f6d47a0';
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
                 '13170394-f85f-4cb1-9bf5-abb57a1fe535', 
                 '02549d8e-6730-451e-b47a-c6100f6d47a0', 
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
