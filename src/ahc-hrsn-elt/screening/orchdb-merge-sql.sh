#!/bin/bash

# This script helps combine or merge data from multiple DuckDB database files
# created across orchestration sessions into a single DuckDB database. The
# script does not execute any actions, but prepares SQL to be executed.

# to find all DuckDB files in the current directory and prepare SQL for merging
# $ ./orchdb-merge-sql.sh

# to find all DuckDB files in the current directory and merge them into a single DuckDB file
# $ rm -f merged.duckdb && ./orchdb-merge-sql.sh | duckdb merged.duckdb

# to find all DuckDB files in the current directory and merge them into a single MotherDuck cloud instance
# $ ./orchdb-merge-sql.sh | duckdb md:merged

# Default root directory to the current working directory or use the provided argument
root_directory="${1:-$(pwd)}"

# List of tables to process (assuming that the same tables exist in all databases)
declare -a tables=("demographic_data" "qe_admin_data" "screening" "orch_session" "orch_session_entry" "orch_session_exec" "orch_session_issue" "orch_session_state")

# Initialize flag for checking the first database processing
first_database=1

# Initialize a counter for generating unique suffixes
suffix_counter=0

# Function to sanitize database aliases and add a unique suffix
sanitize_alias() {
    local raw_alias="$1"
    local sanitized_alias=$(echo "$raw_alias" | sed 's/[^a-zA-Z0-9]/_/g' | sed 's/^\([0-9]\)/_\1/')
    echo "${sanitized_alias}_${suffix_counter}"
}

# Begin transaction
echo "BEGIN TRANSACTION;"

# Find all .duckdb files and handle them
while read -r db_file; do
    raw_db_alias=$(basename "$db_file" .duckdb)
    db_alias=$(sanitize_alias "$raw_db_alias")
    suffix_counter=$((suffix_counter + 1)) # Increment suffix counter for each file

    # Attach database
    echo "ATTACH '$db_file' AS $db_alias;"

    # Generate SQL commands for each table
    for table in "${tables[@]}"; do
        if [ $first_database -eq 1 ]; then
            # For the first database, create the table in the main database using the structure from the attached DB
            echo "CREATE TABLE main.$table AS SELECT * FROM $db_alias.main.$table;"
        else
            # For subsequent databases, just insert data
            echo "INSERT INTO main.$table SELECT * FROM $db_alias.main.$table;"
        fi
    done

    # Detach the database after processing
    echo "DETACH $db_alias;"

    # After processing the first database, switch the flag off
    if [ $first_database -eq 1 ]; then
        first_database=0
    fi
done < <(find "$root_directory" -type f -name '*.duckdb')

# Commit transaction
echo "COMMIT;"
