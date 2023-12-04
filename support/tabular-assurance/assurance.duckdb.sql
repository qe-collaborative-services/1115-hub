-- usage:
-- $ rm -f test-results/assurance-issues.xlsx test-results/assurance-diagnostics.sqlite.db
-- $ cat assurance.duckdb.sql | duckdb ":memory:"

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
    remediation VARCHAR
);

-- `exprX` means that when a SQL generator is used, those should be expressions:
-- expr1: `example_concat_fail2` is CSV Source File Temp Table Name
-- expr2: 'test-fixture/example-fail2.duckdb.csv' is the CSV Source File

INSERT INTO ingest_session (ingest_session_id, ingest_src, ingest_table_name) 
                    VALUES (uuid(), 'test-fixture/example-fail2.duckdb.csv', 'example_concat_fail2');

-- uncomment below to see session details
-- SELECT * FROM ingest_session;

-- ingest the entire CSV file into memory
CREATE TEMPORARY TABLE example_concat_fail2 /* expr1 */ AS 
  SELECT *, 
         row_number() OVER () as src_file_row_number, 
         (SELECT ingest_session_id from ingest_session LIMIT 1) as ingest_session_id
    FROM read_csv_auto('test-fixture/example-fail2.duckdb.csv' /* expr2 */, header = true);

-- show the table that was read in
-- SELECT * FROM example_concat_fail2 /* expr1 */;

-- Assuming required columns are 'column1', 'column2', 'column3'
WITH required_column_names_in_src AS (
    SELECT column_name
    FROM (VALUES ('column1'), ('column2'), ('column3'),
                 ('column4'), ('column5'), ('column6'),
                 ('column7'), ('column8'), ('column9')) AS required(column_name)
    WHERE required.column_name NOT IN (
        SELECT column_name 
          FROM information_schema.columns 
         WHERE table_name = (SELECT ingest_table_name FROM ingest_session LIMIT 1))
)
INSERT INTO ingest_issue (session_id, issue_type, issue_message, remediation)
    SELECT (SELECT ingest_session_id FROM ingest_session LIMIT 1),
           'Missing Column',
           'Required column ' || column_name || ' is missing in the CSV file.',
           'Ensure the CSV contains the column ' || column_name
      FROM required_column_names_in_src;

-- NOTE: If the above does not pass, meaning not all columns with the proper
--       names are present, do not run the queries below because they assume
--       proper names and existence of columns.

WITH numeric_value_in_all_rows AS (
    SELECT 'column4' AS issue_column,
           column4 AS invalid_value,
           src_file_row_number AS issue_row
      FROM example_concat_fail2 /* expr1 */
     WHERE column4 IS NOT NULL 
       AND column4 NOT SIMILAR TO '^[+-]?[0-9]+$'
)
INSERT INTO ingest_issue (session_id, issue_row, issue_type, issue_column, invalid_value, issue_message, remediation)
    SELECT (SELECT ingest_session_id from ingest_session LIMIT 1),
           issue_row,
           'Data Type Mismatch',
           issue_column,
           invalid_value,
           'Non-integer value "' || invalid_value || '" found in ' || issue_column,
           'Convert non-integer values to INTEGER.'
      FROM numeric_value_in_all_rows;

WITH proper_dot_com_email_address_in_all_rows AS (
    SELECT 'column2' AS issue_column,
           column2 AS invalid_value,
           src_file_row_number AS issue_row
      FROM example_concat_fail2
     WHERE column2 IS NOT NULL
       AND column2 NOT SIMILAR TO '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.com$'
)
INSERT INTO ingest_issue (session_id, issue_row, issue_type, issue_column, invalid_value, issue_message, remediation)
    SELECT (SELECT ingest_session_id FROM ingest_session LIMIT 1),
            issue_row,
            'Format Mismatch',
            issue_column,
            invalid_value,
            'Invalid email format "' || invalid_value || '" in ' || issue_column,
            'Correct the email format.'
       FROM proper_dot_com_email_address_in_all_rows;

WITH range_assurance AS (
    SELECT 'column5' AS issue_column,
           column5 AS invalid_value,
           src_file_row_number AS issue_row
      FROM example_concat_fail2
     WHERE column5::INT < 10 OR column5::INT > 100
)
INSERT INTO ingest_issue (session_id, issue_row, issue_type, issue_column, invalid_value, issue_message, remediation)
    SELECT (SELECT ingest_session_id FROM ingest_session LIMIT 1),
           issue_row,
           'Range Violation',
           issue_column,
           invalid_value,
           'Value ' || invalid_value || ' in ' || issue_column || ' out of range (10-100)',
           'Ensure values in column5 are between 10 and 100.'
      FROM range_assurance;

WITH unique_value_assurance AS (
    SELECT 'column6' AS issue_column,
           column6 AS invalid_value,
           src_file_row_number AS issue_row
      FROM example_concat_fail2
     WHERE column6 IN (
          SELECT column6 
            FROM example_concat_fail2 
        GROUP BY column6 
          HAVING COUNT(*) > 1
      )
)
INSERT INTO ingest_issue (session_id, issue_row, issue_type, issue_column, invalid_value, issue_message, remediation)
    SELECT (SELECT ingest_session_id FROM ingest_session LIMIT 1),
           issue_row,
           'Unique Value Violation',
           issue_column,
           invalid_value,
           'Duplicate value "' || invalid_value || '" found in ' || issue_column,
           'Ensure each value in column6 is unique.'
    FROM unique_value_assurance;

WITH mandatory_value_assurance AS (
    SELECT 'column7' AS issue_column,
           src_file_row_number AS issue_row
      FROM example_concat_fail2
     WHERE column7 is NULL 
        OR TRIM(column7) = ''
)
INSERT INTO ingest_issue (session_id, issue_row, issue_type, issue_column, issue_message, remediation)
    SELECT (SELECT ingest_session_id FROM ingest_session LIMIT 1),
           issue_row,
           'Missing Mandatory Value',
           issue_column,
           'Mandatory field ' || issue_column || ' is empty.',
           'Provide a value for ' || issue_column
      FROM mandatory_value_assurance;

SELECT * FROM ingest_issue;

ATTACH 'test-results/assurance-diagnostics.sqlite.db' AS sqlite_state_db (TYPE SQLITE);

CREATE TABLE sqlite_state_db.example_concat_fail2 /* expr1 */ AS 
    SELECT * FROM example_concat_fail2 /* expr1 */;

CREATE TABLE sqlite_state_db.ingest_session AS 
    SELECT * FROM ingest_session;

CREATE TABLE sqlite_state_db.ingest_issue AS 
    SELECT * FROM ingest_issue;

DETACH DATABASE sqlite_state_db;

INSTALL spatial; -- Only needed once per DuckDB connection
LOAD spatial; -- Only needed once per DuckDB connection

COPY ingest_issue TO 'test-results/assurance-issues.xlsx' WITH (FORMAT GDAL, DRIVER 'xlsx');
