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
INSERT INTO "ingest_session_entry" ("ingest_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('1931dfcc-e8fc-597d-b1bc-65b4287e6fdf', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/synthetic-content/synthetic-fail.csv', 'synthetic_fail', NULL);

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
           '1931dfcc-e8fc-597d-b1bc-65b4287e6fdf', 
           'Missing Column',
           'Required column ' || column_name || ' is missing in synthetic_fail.',
           'Ensure synthetic_fail contains the column "' || column_name || '"'
      FROM required_column_names_in_src;
-- emit the errors for the given session (file) so it can be picked up
SELECT * FROM ingest_session_issue WHERE session_id = '05269d28-15ae-5bd6-bd88-f949ccfa52d7' and session_entry_id = '1931dfcc-e8fc-597d-b1bc-65b4287e6fdf';
```

### stdout
```sh
[{"ingest_session_issue_id":"13c4e9f5-a997-4bc4-b288-229fac323743","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"1931dfcc-e8fc-597d-b1bc-65b4287e6fdf","issue_type":"Missing Column","issue_message":"Required column PAT_MRN_ID is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"PAT_MRN_ID\"","elaboration":null},
{"ingest_session_issue_id":"fd422802-0aa4-42b0-9f03-be41f4ed9209","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"1931dfcc-e8fc-597d-b1bc-65b4287e6fdf","issue_type":"Missing Column","issue_message":"Required column FACILITY is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"FACILITY\"","elaboration":null},
{"ingest_session_issue_id":"57bf879d-01e5-4a58-ba91-d8ec09d5ea25","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"1931dfcc-e8fc-597d-b1bc-65b4287e6fdf","issue_type":"Missing Column","issue_message":"Required column FIRST_NAME is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"FIRST_NAME\"","elaboration":null},
{"ingest_session_issue_id":"7d705dd6-749e-47b1-85dd-3dd80a3db07d","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"1931dfcc-e8fc-597d-b1bc-65b4287e6fdf","issue_type":"Missing Column","issue_message":"Required column LAST_NAME is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"LAST_NAME\"","elaboration":null},
{"ingest_session_issue_id":"7a98b6c3-1029-49fe-a012-5410c047b5f7","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"1931dfcc-e8fc-597d-b1bc-65b4287e6fdf","issue_type":"Missing Column","issue_message":"Required column PAT_BIRTH_DATE is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"PAT_BIRTH_DATE\"","elaboration":null},
{"ingest_session_issue_id":"e838bf03-3662-479c-807b-67dc82807894","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"1931dfcc-e8fc-597d-b1bc-65b4287e6fdf","issue_type":"Missing Column","issue_message":"Required column MEDICAID_CIN is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"MEDICAID_CIN\"","elaboration":null},
{"ingest_session_issue_id":"dc8f2619-a858-4919-9aaf-247258dc2b9f","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"1931dfcc-e8fc-597d-b1bc-65b4287e6fdf","issue_type":"Missing Column","issue_message":"Required column ENCOUNTER_ID is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"ENCOUNTER_ID\"","elaboration":null},
{"ingest_session_issue_id":"672d7e08-fa67-487e-b918-a8d4ecac7666","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"1931dfcc-e8fc-597d-b1bc-65b4287e6fdf","issue_type":"Missing Column","issue_message":"Required column SURVEY is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"SURVEY\"","elaboration":null},
{"ingest_session_issue_id":"b7a5765d-c5fd-4c1a-92da-6d745d9eeeea","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"1931dfcc-e8fc-597d-b1bc-65b4287e6fdf","issue_type":"Missing Column","issue_message":"Required column SURVEY_ID is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"SURVEY_ID\"","elaboration":null},
{"ingest_session_issue_id":"df085c56-2765-4af2-94e4-bcb892465220","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"1931dfcc-e8fc-597d-b1bc-65b4287e6fdf","issue_type":"Missing Column","issue_message":"Required column RECORDED_TIME is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"RECORDED_TIME\"","elaboration":null},
{"ingest_session_issue_id":"bacb167a-f7bd-43dd-a197-558533a35f4c","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"1931dfcc-e8fc-597d-b1bc-65b4287e6fdf","issue_type":"Missing Column","issue_message":"Required column QUESTION is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"QUESTION\"","elaboration":null},
{"ingest_session_issue_id":"d15803aa-1572-44b4-b810-87086cb927a1","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"1931dfcc-e8fc-597d-b1bc-65b4287e6fdf","issue_type":"Missing Column","issue_message":"Required column MEAS_VALUE is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"MEAS_VALUE\"","elaboration":null},
{"ingest_session_issue_id":"2143ad8a-59c4-45cc-95c2-8c214f79db14","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"1931dfcc-e8fc-597d-b1bc-65b4287e6fdf","issue_type":"Missing Column","issue_message":"Required column QUESTION_CODE is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"QUESTION_CODE\"","elaboration":null},
{"ingest_session_issue_id":"a31fefbb-fd30-4172-998b-5a995aea82f2","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"1931dfcc-e8fc-597d-b1bc-65b4287e6fdf","issue_type":"Missing Column","issue_message":"Required column QUESTION_CODE_SYSTEM_NAME is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"QUESTION_CODE_SYSTEM_NAME\"","elaboration":null},
{"ingest_session_issue_id":"b6ba1fd8-557c-4962-92e8-64871fe4679d","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"1931dfcc-e8fc-597d-b1bc-65b4287e6fdf","issue_type":"Missing Column","issue_message":"Required column ANSWER_CODE is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"ANSWER_CODE\"","elaboration":null},
{"ingest_session_issue_id":"a61ff79e-e62d-4c62-a46d-569f9b1251a9","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"1931dfcc-e8fc-597d-b1bc-65b4287e6fdf","issue_type":"Missing Column","issue_message":"Required column ANSWER_CODE_SYSTEM_NAME is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"ANSWER_CODE_SYSTEM_NAME\"","elaboration":null},
{"ingest_session_issue_id":"8da3591f-d2c3-43b4-b9fd-3f2623c13159","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"1931dfcc-e8fc-597d-b1bc-65b4287e6fdf","issue_type":"Missing Column","issue_message":"Required column SDOH_DOMAIN is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"SDOH_DOMAIN\"","elaboration":null},
{"ingest_session_issue_id":"2c869e67-7c57-4507-a49e-95e07db97ded","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"1931dfcc-e8fc-597d-b1bc-65b4287e6fdf","issue_type":"Missing Column","issue_message":"Required column NEED_INDICATED is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"NEED_INDICATED\"","elaboration":null},
{"ingest_session_issue_id":"2723f065-fbad-48b7-91ac-3293096530c4","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"1931dfcc-e8fc-597d-b1bc-65b4287e6fdf","issue_type":"Missing Column","issue_message":"Required column VISIT_PART_2_FLAG is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"VISIT_PART_2_FLAG\"","elaboration":null},
{"ingest_session_issue_id":"3e1d73c2-6202-43ef-89d3-57081c4920ae","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"1931dfcc-e8fc-597d-b1bc-65b4287e6fdf","issue_type":"Missing Column","issue_message":"Required column VISIT_OMH_FLAG is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"VISIT_OMH_FLAG\"","elaboration":null},
{"ingest_session_issue_id":"e0510630-a5b9-4b28-81b3-287035f04a5e","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"1931dfcc-e8fc-597d-b1bc-65b4287e6fdf","issue_type":"Missing Column","issue_message":"Required column VISIT_OPWDD_FLAG is missing in synthetic_fail.","issue_row":null,"issue_column":null,"invalid_value":null,"remediation":"Ensure synthetic_fail contains the column \"VISIT_OPWDD_FLAG\"","elaboration":null}]

```

## ensureStructure-1
```sql
INSERT INTO "ingest_session_entry" ("ingest_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('8b7c669c-1795-5f6b-8f3a-3e502b74c628', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/synthetic-content/ahc-hrsn-12-12-2023-valid.csv', 'ahc_hrsn_12_12_2023_valid', NULL);

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
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628', 
           'Missing Column',
           'Required column ' || column_name || ' is missing in ahc_hrsn_12_12_2023_valid.',
           'Ensure ahc_hrsn_12_12_2023_valid contains the column "' || column_name || '"'
      FROM required_column_names_in_src;
-- emit the errors for the given session (file) so it can be picked up
SELECT * FROM ingest_session_issue WHERE session_id = '05269d28-15ae-5bd6-bd88-f949ccfa52d7' and session_entry_id = '8b7c669c-1795-5f6b-8f3a-3e502b74c628';
```


## ensureStructure-2
```sql
INSERT INTO "ingest_session_entry" ("ingest_session_entry_id", "session_id", "ingest_src", "ingest_table_name", "elaboration") VALUES ('7b979b68-7227-53fd-b689-e4fe153afb76', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', 'support/assurance/synthetic-content/ahc-hrsn-valid-01.xlsx', 'ahc_hrsn_valid_01', NULL);

INSERT INTO "ingest_session_issue" ("ingest_session_issue_id", "session_id", "session_entry_id", "issue_type", "issue_message", "issue_row", "issue_column", "invalid_value", "remediation", "elaboration") VALUES ('abf5c680-a135-5d89-b871-fa5b9b99aed6', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', '7b979b68-7227-53fd-b689-e4fe153afb76', 'Structural', 'Unknown file type', NULL, NULL, 'support/assurance/synthetic-content/ahc-hrsn-valid-01.xlsx', NULL, NULL);
-- emit the errors for the given session (file) so it can be picked up
SELECT * FROM ingest_session_issue WHERE session_id = '05269d28-15ae-5bd6-bd88-f949ccfa52d7' and session_entry_id = '7b979b68-7227-53fd-b689-e4fe153afb76';
```

### stdout
```sh
[{"ingest_session_issue_id":"abf5c680-a135-5d89-b871-fa5b9b99aed6","session_id":"05269d28-15ae-5bd6-bd88-f949ccfa52d7","session_entry_id":"7b979b68-7227-53fd-b689-e4fe153afb76","issue_type":"Structural","issue_message":"Unknown file type","issue_row":null,"issue_column":null,"invalid_value":"support/assurance/synthetic-content/ahc-hrsn-valid-01.xlsx","remediation":null,"elaboration":null}]

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
           '8b7c669c-1795-5f6b-8f3a-3e502b74c628', 
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
INSERT INTO "ingest_session_state" ("ingest_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('05e8feaa-0bed-5909-a817-39812494b361', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', NULL, 'NONE', 'INIT', NULL, NULL, (make_timestamp(2023, 11, 3, 14, 51, 39.903)), NULL);
INSERT INTO "ingest_session_state" ("ingest_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('8f460419-7b80-516d-8919-84520950f612', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', NULL, 'INIT', 'ENTER(init)', NULL, NULL, (make_timestamp(2023, 11, 3, 14, 51, 39.903)), NULL);
INSERT INTO "ingest_session_state" ("ingest_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('7bab389e-54af-5a13-a39f-079abdc73a48', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', NULL, 'ENTER(init)', 'EXIT(init)', NULL, NULL, (make_timestamp(2023, 11, 3, 14, 51, 39.903)), NULL);
INSERT INTO "ingest_session_state" ("ingest_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('168a34c7-d043-5ec4-a84a-c961f1a301ef', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', NULL, 'EXIT(init)', 'ENTER(ensureStructure)', NULL, NULL, (make_timestamp(2023, 11, 3, 14, 51, 39.903)), NULL);
INSERT INTO "ingest_session_state" ("ingest_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('641dff51-97fd-56b3-8443-c1ed568a6d66', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', NULL, 'ENTER(ensureStructure)', 'EXIT(ensureStructure)', NULL, NULL, (make_timestamp(2023, 11, 3, 14, 51, 39.903)), NULL);
INSERT INTO "ingest_session_state" ("ingest_session_state_id", "session_id", "session_entry_id", "from_state", "to_state", "transition_result", "transition_reason", "transitioned_at", "elaboration") VALUES ('d70a4700-6b40-52fc-a7a2-69ef0d7f69ff', '05269d28-15ae-5bd6-bd88-f949ccfa52d7', NULL, 'EXIT(ensureStructure)', 'ENTER(ensureContent)', NULL, NULL, (make_timestamp(2023, 11, 3, 14, 51, 39.903)), NULL);

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
