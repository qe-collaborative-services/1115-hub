---
rootPath: ./support/assurance/synthetic-content
src:
  - '**/*.csv'
icDeterministicPk: true
icDb: support/assurance/results-e2e/ingestion-center.duckdb
resourceDb: support/assurance/results-e2e/resource.sqlite.db
diagsXlsx: support/assurance/results-e2e/diagnostics.xlsx
diagsMd: support/assurance/results-e2e/diagnostics.md
diagsDagPuml: support/assurance/results-e2e/dag.puml
duckdbCmd: duckdb

---

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


INSERT INTO ingest_session (ingest_session_id) VALUES ('05269d28-15ae-5bd6-bd88-f949ccfa52d7');
```

## structuralSQL

```sql
INSERT INTO ingest_session_entry (ingest_session_entry_id, session_id, ingest_src, ingest_table_name) 
                          VALUES ('05e8feaa-0bed-5909-a817-39812494b361', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/synthetic-content/synthetic-fail.csv', 'synthetic_fail');

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
           '05e8feaa-0bed-5909-a817-39812494b361', 
           'Missing Column',
           'Required column ' || column_name || ' is missing in synthetic_fail.',
           'Ensure synthetic_fail contains the column "' || column_name || '"'
      FROM required_column_names_in_src;
-- emit the errors for the given session (file) so it can be picked up
SELECT * FROM ingest_session_issue WHERE session_id = '05269d28-15ae-5bd6-bd88-f949ccfa52d7' and session_entry_id = '05e8feaa-0bed-5909-a817-39812494b361';
```

### stdout

```sh
[{"ingest_session_issue_id":"00b35d99-0357-428a-b000-b72facf22db3","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"05e8feaa-0bed-5909-a817-39812494b361","issue_type":"Missing Column","issue_message":"Required column PAT_MRN_ID is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"PAT_MRN_ID\"","elaboration":null},
{"ingest_session_issue_id":"f5354f01-5056-499b-9650-ad0e34c26863","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"05e8feaa-0bed-5909-a817-39812494b361","issue_type":"Missing Column","issue_message":"Required column FACILITY is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"FACILITY\"","elaboration":null},
{"ingest_session_issue_id":"e75bfd1c-54cc-4ee4-a89c-66d96d99721e","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"05e8feaa-0bed-5909-a817-39812494b361","issue_type":"Missing Column","issue_message":"Required column FIRST_NAME is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"FIRST_NAME\"","elaboration":null},
{"ingest_session_issue_id":"731be840-49de-42d4-8565-381b050d6cdf","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"05e8feaa-0bed-5909-a817-39812494b361","issue_type":"Missing Column","issue_message":"Required column LAST_NAME is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"LAST_NAME\"","elaboration":null},
{"ingest_session_issue_id":"5f71dfd2-e6e9-4584-ad56-cf1ef5a6d362","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"05e8feaa-0bed-5909-a817-39812494b361","issue_type":"Missing Column","issue_message":"Required column PAT_BIRTH_DATE is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"PAT_BIRTH_DATE\"","elaboration":null},
{"ingest_session_issue_id":"03780194-cdff-40ca-bd7f-bfe75a98a13a","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"05e8feaa-0bed-5909-a817-39812494b361","issue_type":"Missing Column","issue_message":"Required column MEDICAID_CIN is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"MEDICAID_CIN\"","elaboration":null},
{"ingest_session_issue_id":"c088fb5f-c642-47ee-a94a-923160c9b8e0","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"05e8feaa-0bed-5909-a817-39812494b361","issue_type":"Missing Column","issue_message":"Required column ENCOUNTER_ID is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"ENCOUNTER_ID\"","elaboration":null},
{"ingest_session_issue_id":"c469e10f-2238-4d5e-8331-eecdd585444d","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"05e8feaa-0bed-5909-a817-39812494b361","issue_type":"Missing Column","issue_message":"Required column SURVEY is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"SURVEY\"","elaboration":null},
{"ingest_session_issue_id":"6ac837ca-e253-471b-a5c7-6ae567ca5f35","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"05e8feaa-0bed-5909-a817-39812494b361","issue_type":"Missing Column","issue_message":"Required column SURVEY_ID is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"SURVEY_ID\"","elaboration":null},
{"ingest_session_issue_id":"ca168835-8342-42de-949e-1784c845e974","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"05e8feaa-0bed-5909-a817-39812494b361","issue_type":"Missing Column","issue_message":"Required column RECORDED_TIME is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"RECORDED_TIME\"","elaboration":null},
{"ingest_session_issue_id":"5bdd1fba-43eb-40f0-9092-fad37fbf389d","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"05e8feaa-0bed-5909-a817-39812494b361","issue_type":"Missing Column","issue_message":"Required column QUESTION is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"QUESTION\"","elaboration":null},
{"ingest_session_issue_id":"29fa6165-e7b9-48b3-8d8c-8e6a856212f2","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"05e8feaa-0bed-5909-a817-39812494b361","issue_type":"Missing Column","issue_message":"Required column MEAS_VALUE is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"MEAS_VALUE\"","elaboration":null},
{"ingest_session_issue_id":"d8c262e0-63f5-4259-9b81-241941064f59","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"05e8feaa-0bed-5909-a817-39812494b361","issue_type":"Missing Column","issue_message":"Required column QUESTION_CODE is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"QUESTION_CODE\"","elaboration":null},
{"ingest_session_issue_id":"12fd13c1-5de0-4a55-8147-981ac46c4847","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"05e8feaa-0bed-5909-a817-39812494b361","issue_type":"Missing Column","issue_message":"Required column QUESTION_CODE_SYSTEM_NAME is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"QUESTION_CODE_SYSTEM_NAME\"","elaboration":null},
{"ingest_session_issue_id":"cb71e860-f8ce-40bf-8d91-e04bec3d031c","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"05e8feaa-0bed-5909-a817-39812494b361","issue_type":"Missing Column","issue_message":"Required column ANSWER_CODE is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"ANSWER_CODE\"","elaboration":null},
{"ingest_session_issue_id":"7c832afd-6bef-4368-89f5-e298e3805273","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"05e8feaa-0bed-5909-a817-39812494b361","issue_type":"Missing Column","issue_message":"Required column ANSWER_CODE_SYSTEM_NAME is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"ANSWER_CODE_SYSTEM_NAME\"","elaboration":null},
{"ingest_session_issue_id":"57d4c2bb-6a85-45e9-9fc8-f7c6e9aa96ec","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"05e8feaa-0bed-5909-a817-39812494b361","issue_type":"Missing Column","issue_message":"Required column SDOH_DOMAIN is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"SDOH_DOMAIN\"","elaboration":null},
{"ingest_session_issue_id":"3dc1ccee-0f2b-4cd9-853d-090170a60e9c","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"05e8feaa-0bed-5909-a817-39812494b361","issue_type":"Missing Column","issue_message":"Required column NEED_INDICATED is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"NEED_INDICATED\"","elaboration":null},
{"ingest_session_issue_id":"d71957d5-8dc8-4b91-93c7-869cdd440180","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"05e8feaa-0bed-5909-a817-39812494b361","issue_type":"Missing Column","issue_message":"Required column VISIT_PART_2_FLAG is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"VISIT_PART_2_FLAG\"","elaboration":null},
{"ingest_session_issue_id":"e8423fd1-6505-4199-85cf-5bab26b212ba","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"05e8feaa-0bed-5909-a817-39812494b361","issue_type":"Missing Column","issue_message":"Required column VISIT_OMH_FLAG is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"VISIT_OMH_FLAG\"","elaboration":null},
{"ingest_session_issue_id":"f2f6b6e3-bdcc-4de4-9134-b8565a3c8779","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"05e8feaa-0bed-5909-a817-39812494b361","issue_type":"Missing Column","issue_message":"Required column VISIT_OPWDD_FLAG is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"VISIT_OPWDD_FLAG\"","elaboration":null}]
```

## structuralSQL (1)

```sql
INSERT INTO ingest_session_entry (ingest_session_entry_id, session_id, ingest_src, ingest_table_name) 
                          VALUES ('8f460419-7b80-516d-8919-84520950f612', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/synthetic-content/ahc-hrsn-12-12-2023-valid.csv', 'ahc_hrsn_12_12_2023_valid');

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
           '8f460419-7b80-516d-8919-84520950f612', 
           'Missing Column',
           'Required column ' || column_name || ' is missing in ahc_hrsn_12_12_2023_valid.',
           'Ensure ahc_hrsn_12_12_2023_valid contains the column "' || column_name || '"'
      FROM required_column_names_in_src;
-- emit the errors for the given session (file) so it can be picked up
SELECT * FROM ingest_session_issue WHERE session_id = '05269d28-15ae-5bd6-bd88-f949ccfa52d7' and session_entry_id = '8f460419-7b80-516d-8919-84520950f612';
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
           '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 
           '8f460419-7b80-516d-8919-84520950f612', 
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
ATTACH 'support/assurance/results-e2e/resource.sqlite.db' AS resource_db (TYPE SQLITE);

CREATE TABLE resource_db.ingest_session AS SELECT * FROM ingest_session;
CREATE TABLE resource_db.ingest_session_entry AS SELECT * FROM ingest_session_entry;
CREATE TABLE resource_db.ingest_session_state AS SELECT * FROM ingest_session_state;
CREATE TABLE resource_db.ingest_session_issue AS SELECT * FROM ingest_session_issue;

CREATE TABLE resource_db.ahc_hrsn_12_12_2023_valid AS SELECT * FROM ahc_hrsn_12_12_2023_valid;

DETACH DATABASE resource_db;
```

## unknown

```sql
INSTALL spatial; -- Only needed once per DuckDB connection
LOAD spatial; -- Only needed once per DuckDB connection
-- TODO: join with ingest_session table to give all the results in one sheet
COPY (SELECT * FROM ingest_session_issue) TO 'support/assurance/results-e2e/diagnostics.xlsx' WITH (FORMAT GDAL, DRIVER 'xlsx');
```
