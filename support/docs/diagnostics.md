# Overview

This document provides an overview of the files and folders present in the
diagnostics package. The diagnostics package includes files and folders in the
`/egress/<SESSION_ID>` file path. The following are the main files and folders
available inside each package:

- `/.consumed` folder.
- `/.workflow` folder.
- `session.json` file.
- `fhir-<pat_mrn_id>-<encounter_id>.json` file.
- `resource.sqlite.db` database file.
- `fhir-result-fhir-<pat_mrn_id>-<encounter_id>.json` file.
- `fhir.http` file.
- `diagnostics.md` file.
- `diagnostics.xlsx` file.
- `diagnostics.json` file.

# Session Data (/egress/<SESSION_ID>/session.json)

This JSON file contains metadata and configuration details about the diagnostics
session. It includes information about ingress paths, initialization timestamp,
session ID, source files being processed, FHIR json validated results and more.
We need to verify these data first for getting the progress of the session and
to know the result of each stages. Below are the fields in the session.

## Fields

- `ingressPaths`: Paths for ingressing data into the system.
  - `home`: The home directory for ingressing data.
- `initAt`: The timestamp when the session was initialized.
- `sessionID`: The unique identifier for the session.
- `src`: An array of source files being processed in the session.
  - `fsPath`: The filesystem path of the source file.
  - `watchPath`: Information about the watch path for the file.
    - `pathID`: The identifier of the path.
    - `rootPath`: The root path being watched.
  - `draining`: Indicates if the file is being drained (processed).
- `version`: The version of the application used for the session.
- `consumed`: An array of activities performed on the consumed files.
  - `activity`: The type of activity performed (e.g., move).
  - `fsPath`: The filesystem path of the file on which the activity was
    performed.
- `stdErrsEncountered`: Information about any standard errors encountered during
  the session.
- `diagsMarkdown`: The path to the Markdown file containing diagnostics
  information.
- `duckDb`: Information about the DuckDB database containing raw ingested
  content and validation tables.
- `sqliteDB`: Information about the SQLite database containing aggregated
  content and validation tables.
- `referenceDataHome`: The path to the home directory for reference data.
- `publishFhirURL`: The URL for publishing FHIR data.
- `publishFhirResult`: An array of results from publishing FHIR data.
  - `response`: The response from the FHIR publishing endpoint.
  - `fhirJsonStructValid`: Indicates if the FHIR JSON structure is valid.
  - `fhirFileName`: The name of the file containing the FHIR JSON data.
- `finalizeAt`: The timestamp when the session was finalized.

# Diagnostics .xlsx (/egress/<SESSION_ID>/diagnostics.xlsx)

An overview of the issues, validations and remediations from the session is
recorded in the `diagnostics.xlsx` file, where we can investigate the content &
structural errors especially with the csv files ingested in the session.
Following are the fields which are present in the file.

## Fields

- `orch_session_id`: The unique identifier for the orchestration session.
- `device_id`: The identifier of the device from which the data was collected.
- `version`: The version of the 1115-hub application used to collect the data.
- `elaboration`: A numerical value representing the level of detail in the
  diagnostics data.
- `args_json`: JSON-encoded arguments passed to the diagnostics tool.
- `diagnostics_json`: JSON-encoded diagnostics data.
- `diagnostics_md`: Markdown-formatted diagnostics data for human-readable
  presentation.
- `orch_session_entry_id`: The unique identifier for the entry in the
  orchestration session.
- `ingest_src`: The source from which the diagnostics data was ingested.
- `ingest_table_name`: The name of the table into which the diagnostics data was
  ingested.
- `elaboration:1`: A numerical value representing an additional level of detail
  in the diagnostics data.
- `orch_session_issue_id`: The unique identifier for an issue detected in the
  orchestration session.
- `issue_type`: The type of issue detected.
- `issue_message`: A message describing the issue.
- `issue_row`: The row number in the data CSV where the issue was detected.
- `issue_column`: The column name in the data where the issue was detected.
- `invalid_value`: The value that was identified as invalid during diagnostics.
- `remediation`: Suggested remediation steps for resolving the issue.
- `elaboration:2`: Another numerical value representing an additional level of
  detail in the diagnostics data.
- `disposition`: The final disposition of the diagnostics data (e.g., warning,
  rejection).
- `remediation:1`: Additional suggested remediation steps for resolving the
  issue needed from QE/QCS side.

# FHIR JSON Data (/egress/<SESSION_ID>/fhir-<pat_mrn_id>-<encounter_id>.json)

These generated FHIR JSON files follow the pattern
`fhir-<pat_mrn_id>-<encounter_id>.json` and contains FHIR (Fast Healthcare
Interoperability Resources) data in JSON format. It typically includes a bundle
of FHIR resources such as Consent, Patient, Organization, Encounter, and
Observation.

## Fields

- `resourceType`: The type of FHIR resource, in this case, a Bundle.
- `id`: The unique identifier for the bundle.
- `type`: The type of bundle, typically "transaction" for FHIR transactions.
- `meta`: Metadata about the bundle, including the last updated timestamp.
- `timestamp`: The timestamp when the bundle was created.
- `entry`: An array of entries, each representing a FHIR resource included in
  the bundle. Common resources include:
  - `Consent`: Represents a patient's consent for treatment.
  - `Patient`: Contains demographic information about the patient.
  - `Organization`: Represents the healthcare organization.
  - `Encounter`: Represents a healthcare encounter.
  - `Observation`: Represents observations or assessments made about the
    patient.

Each entry in the bundle contains the following fields:

- `fullUrl`: The full URL of the entry.
- `resource`: The FHIR resource object, which varies depending on the type of
  resource (e.g., Patient, Organization, Observation).

Each resource object contains fields specific to its resource type. For example,
a Patient resource may include fields such as `name`, `gender`, `birthDate`, and
`address`.

# FHIR Result JSON Data (/egress/<SESSION_ID>/fhir-result-fhir-<pat_mrn_id>-<encounter_id>.json)

The FHIR JSON file follows the pattern
`fhir-result-fhir-<pat_mrn_id>-<encounter_id>.json`. This file contains the
response from the FHIR publishing endpoint for each of the corresponding
`fhir-<pat_mrn_id>-<encounter_id>.json`. This can be used to verify the success
or failure of FHIR transactions.

# FHIR HTTP File (/egress/<SESSION_ID>/fhir.http)

The `fhir.http` file contains HTTP request data related to FHIR transactions
that occurred during the diagnostics session. This file is useful for debugging
and analyzing the interactions with FHIR servers, especially in the development
sandbox.

## Contents

The file typically contains a series of HTTP requests and responses, including:

- `HTTP request headers and body`, showing the details of the FHIR request sent
  to the server.
- `HTTP response headers and body`, showing the response received from the FHIR
  server, including any FHIR resources or error messages.

# SQLite Database (/egress/<SESSION_ID>/resource.sqlite.db)

The `resource.sqlite.db` file is a SQLite database that contains the content and
admin tables. It is used to store and manage data processed during the
diagnostics session.

## Tables

The database contains various tables, each serving a specific purpose in the
context of the diagnostics package. Common tables include:

- `Admin Tables`: These tables contain information related to the diagnostics
  session, validation of the data processed during the session. They include
  details about any issues or errors encountered and their respective
  remediation steps.
- `Content Tables`: These tables store individual and aggregated data derived
  from the raw data ingested during the diagnostics session. They provide a
  consolidated view of the data for further analysis and processing.

# Diagnostics .md (/egress/<SESSION_ID>/diagnostics.md)

The `diagnostics.md` file is a Markdown file that contains detailed information
about the diagnostics session. It includes various sections that outline the
steps and actions taken during the session, as well as any issues or errors
encountered. This file can be used to review and understand the steps taken
during a diagnostics session, as well as to troubleshoot any issues that may
have arisen.

## Contents

- `workflowPaths`: Paths used during the diagnostics session for ingressing,
  processing, and egressing data.
- `walkRootPaths`: Paths that were walked during the session to collect data.
- `referenceDataHome`: The path to the directory containing reference data used
  during the session.
- `sources`: A list of source files processed during the session, including
  their URIs, nature (e.g., CSV), table names, and any ingestion issues.
- `init`: SQL statements and other actions taken during the initialization phase
  of the session.
- `ingest`: Details about the ingestion of data, including SQL statements and
  state management diagnostics.
- `ensureContent`: Actions taken to ensure the content is as expected.
- `emitResources`: Details about the emission of resources during the session.
- `emitDiagnostics`: Information about the diagnostics emitted during the
  session.
- `jsonResult_5`: Example of a JSON result from a specific step in the session,
  including STDOUT and status.

# Diagnostics .json (/egress/<SESSION_ID>/diagnostics.json)

The `diagnostics.json` file contains detailed information about the diagnostics
session in JSON format. It includes data about the workflow paths, sources
processed, and diagnostics details for each step of the session.

## Fields

- `args`: Arguments and configuration settings used during the diagnostics
  session.
  - `workflowPaths`: Paths used for ingressing, processing, and egressing data.
  - `walkRootPaths`: Paths that were walked during the session to collect data.
  - `referenceDataHome`: The path to the directory containing reference data.
  - `sources`: A list of source files processed during the session, including
    their URIs, nature (CSV, JSON, etc.), table names, and any ingestion issues.

- `diags`: An array of diagnostics entries, each containing information about a
  specific step in the session.
  - `insertable`: An object containing details about the execution of a step,
    such as the identity, code, SQL statements, session ID, and any narrative or
    error messages.

# .consumed folder (/egress/<SESSION_ID>/.consumed)

This folder contains all the files that were put into the /ingress folders and
were successfully ingested. There could be a single or multiple sets of .csv
data files.

# .workflow folder (/egress/<SESSION_ID>/.workflow)

This folder contains the duckdb file `ingestion-center.duckdb`. The
`ingestion-center.duckdb` is a DuckDB database that contains the content and
admin tables. It is used to store and manage data processed during the
diagnostics session.
