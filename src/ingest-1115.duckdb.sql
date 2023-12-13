-- usage:
-- $ rm -f ingested/ingest-1115-issues.xlsx ingested/ingest-1115.sqlite.db
-- $ cat src/ingest-1115.duckdb.sql | duckdb ":memory:"

CREATE TABLE ingest_session (
    ingest_session_id VARCHAR NOT NULL,
    ingest_src VARCHAR NOT NULL,
    ingest_table_name VARCHAR NOT NULL,
);

CREATE TABLE ingest_issue (
    session_id VARCHAR NOT NULL,
    issue_row INT,
    issue_type VARCHAR NOT NULL,
    issue_column VARCHAR,
    invalid_value VARCHAR,
    issue_message VARCHAR NOT NULL,
    remediation VARCHAR,
    elaboration VARCHAR,
);

INSERT INTO ingest_session (ingest_session_id, ingest_src, ingest_table_name) 
                    VALUES (uuid(), 'src/ahc-hrsn-12-12-2023-valid.csv', 'ahc_hrsn_valid');

-- uncomment below to see session details
-- SELECT * FROM ingest_session;

-- ingest the entire CSV file into memory
CREATE TEMPORARY TABLE ahc_hrsn_valid AS 
  SELECT *, 
         row_number() OVER () as src_file_row_number, 
         (SELECT ingest_session_id from ingest_session LIMIT 1) as ingest_session_id
    FROM read_csv_auto('src/ahc-hrsn-12-12-2023-valid.csv', header = true);

-- show the table that was read in
-- SELECT * FROM ahc_hrsn_valid;

WITH required_column_names_in_src AS (
    SELECT column_name
      FROM (VALUES ('PAT_MRN_ID'), ('FACILITY'), ('FIRST_NAME'),
                   ('LAST_NAME'), ('PAT_BIRTH_DATE'), ('MEDICAID_CIN'),
                   ('ENCOUNTER_ID'), ('SURVEY'), ('SURVEY_ID'),
                   ('RECORDED_TIME'), ('QUESTION'), ('MEAS_VALUE'),
                   ('QUESTION_CODE'), ('QUESTION_CODE_SYSTEM_NAME'), ('ANSWER_CODE'),
                   ('ANSWER_CODE_SYSTEM_NAME'), ('SDOH_DOMAIN'), ('NEED_INDICATED'),
                   ('VISIT_PART_2_FLAG'), ('VISIT_OMH_FLAG'), ('VISIT_OPWDD_FLAG')) AS required(column_name)
    WHERE required.column_name NOT IN (
        SELECT upper(trim(column_name))
          FROM information_schema.columns 
         WHERE table_name = (SELECT ingest_table_name FROM ingest_session LIMIT 1))
)
INSERT INTO ingest_issue (session_id, issue_type, issue_message, remediation)
    SELECT (SELECT ingest_session_id FROM ingest_session LIMIT 1),
           'Missing Column',
           'Required column ' || column_name || ' is missing in the CSV file.',
           'Ensure the CSV contains the column "' || column_name || '"'
      FROM required_column_names_in_src;

SELECT * FROM ingest_issue;

-- TODO:
-- * validate business rule 1
-- * validate business rule 2
-- * validate business rule 3
-- * etc.

ATTACH 'ingested/ingest-1115.sqlite.db' AS sqlite_state_db (TYPE SQLITE);

CREATE TABLE sqlite_state_db.ahc_hrsn_valid AS 
    SELECT * FROM ahc_hrsn_valid;

CREATE TABLE sqlite_state_db.ingest_session AS 
    SELECT * FROM ingest_session;

CREATE TABLE sqlite_state_db.ingest_issue AS 
    SELECT * FROM ingest_issue;

DETACH DATABASE sqlite_state_db;

INSTALL spatial; -- Only needed once per DuckDB connection
LOAD spatial; -- Only needed once per DuckDB connection

COPY ingest_issue TO 'ingested/ingest-1115-issues.xlsx' WITH (FORMAT GDAL, DRIVER 'xlsx');
