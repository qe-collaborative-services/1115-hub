-- usage:
-- $ duckdb ":memory:" -init assurance.duckdb.sql

CREATE TABLE ingest_issue (
    issue_src VARCHAR,
    issue_type VARCHAR,
    issue_column VARCHAR,
    issue_row INT,
    issue_message VARCHAR,
    remediation VARCHAR
);

-- `exprX` means that when a SQL generator is used, those should be expressions:
-- expr1: "tempTableName" example_concat_fail1
-- expr2: "srcFileName" 'test-fixture/example-fail1.duckdb.csv'

-- ingest the entire CSV file into memory
CREATE TEMPORARY TABLE example_concat_fail1 /* expr1 */ AS 
  SELECT *, 
         row_number() OVER () as src_file_row_number, 
         'test-fixture/example-fail1.duckdb.csv' /* expr2 */ as src_file_name 
    FROM read_csv_auto('test-fixture/example-fail1.duckdb.csv' /* expr2 */, header = true);

-- show the table that was read in
-- SELECT * FROM example_concat_fail1 /* expr1 */;

-- check if specific column names were in the source
-- replace ('column1'), ('column2'), ('column3') with your expected column names
INSERT INTO ingest_issue (issue_src, issue_type, issue_column, issue_message, remediation)
  SELECT 'test-fixture/example-fail1.duckdb.csv' /* expr2 */,
         'Missing Column',
         required_column,
         'Required column is missing in the CSV file.',
         'Ensure the CSV contains the column.'
    FROM (VALUES ('column1'), ('column2'), ('column3'), ('column4')) AS required_columns(required_column)
   WHERE required_column NOT IN (
       SELECT column_name 
         FROM information_schema.columns 
        WHERE table_name = 'example_concat_fail1' /* expr1 */);

-- check that column1 datatype was detected as VARCHAR (TEXT)
INSERT INTO ingest_issue (issue_src, issue_type, issue_column, issue_row, issue_message, remediation)
    SELECT src_file_name,
           'Data Type Mismatch',
           'column1',
           'Data type for column1 is not INTEGER, actual type: ' || 
               (SELECT data_type FROM information_schema.columns WHERE table_name = 'example_concat_fail1' /* expr1 */ AND column_name = 'column1'),           
           'Data type for column1 is not TEXT.',
           'Convert column1 to TEXT.'
      FROM example_concat_fail1 /* expr1 */
     WHERE 'column1' NOT IN (
        SELECT column_name 
          FROM information_schema.columns 
         WHERE table_name = 'example_concat_fail1' /* expr1 */ 
           AND data_type = 'VARCHAR');

-- check that row values in column3 is a concatenation of columns 1 and 1
INSERT INTO ingest_issue (issue_src, issue_type, issue_column, issue_row, issue_message, remediation)
    SELECT src_file_name,
           'Data Type Mismatch',
           'column3',
           src_file_row_number,
           '"' || column3 || '" should be "' || concat(column1, column2) || '"',
           'Ensure all values in column3 are a concatenation of columns 1 and 2'
      FROM example_concat_fail1 /* expr1 */
     WHERE column3 IS NOT NULL 
       AND column3 != concat(column1, column2);

-- check that rows values in column4 datatype are numeric
INSERT INTO ingest_issue (issue_src, issue_type, issue_column, issue_row, issue_message, remediation)
    SELECT src_file_name,
           'Data Type Mismatch',
           'column4',
           src_file_row_number,
           '"' || column4 || '" is not an INTEGER',
           'Ensure all values in column4 are integer values'
      FROM example_concat_fail1 /* expr1 */
     WHERE column4 IS NOT NULL 
       AND column4 NOT SIMILAR TO '^[+-]?[0-9]+$';

-- Check column2 matches a regular expression (example: email at any `.com` address)
INSERT INTO ingest_issue (issue_src, issue_type, issue_column, issue_row, issue_message, remediation)
    SELECT src_file_name,
           'Format Mismatch',
           'column5',
           src_file_row_number,
           '"' || column5 || '" in column5 is not a proper email format.',
           'Ensure column2 contains valid email addresses.'
      FROM example_concat_fail1 /* expr1 */
     WHERE column5 IS NOT NULL 
       AND column5 NOT SIMILAR TO '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.com$';

SELECT * FROM ingest_issue;

ATTACH 'test-results/assurance-state.sqlite.db' AS sqlite_state_db (TYPE SQLITE);

CREATE TABLE sqlite_state_db.example_concat_fail1 /* expr1 */ AS 
    SELECT * FROM example_concat_fail1 /* expr1 */;

CREATE TABLE sqlite_state_db.ingest_issue AS 
    SELECT * FROM ingest_issue;

DETACH DATABASE sqlite_state_db;

INSTALL spatial; -- Only needed once per DuckDB connection
LOAD spatial; -- Only needed once per DuckDB connection

COPY ingest_issue TO 'test-results/assurance-issues.xlsx' WITH (FORMAT GDAL, DRIVER 'xlsx');