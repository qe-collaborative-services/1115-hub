## Steps to test the .http files through CLI

- Install the `httpyac CLI` through the node package manager.

`npm install -g httpyac`

- After installing the httpyac, go to the folder where we need to run the test
  cases.

`cd support/assurance/ahc-hrsn-elt/screening/results-test-e2e/fhir-service/2024-05-06/`

- Once you are in the correct folder path run the below command

`httpyac send  fhir-service.test.http --all >> fhir-service-result.txt`

- Executing the above command will store all the test case result output in the
  `fhir-service-result.txt` file.

This directory contains several files that are integral to the functionality and
testing of our FHIR service. Below is a description of each file and its purpose
within the project.

### fhir-service.test.http

This file is crucial for verifying and testing the FHIR service. It interacts
with two primary API endpoints (/Bundle/$validate & /Bundle/) to ensure they are
functioning correctly. This files also needs an .env file for storing the
environmental variables like host name & port.

`Purpose`: Provides automated tests for the FHIR service endpoints using HTTP
requests.

#### Test Scenarios:

- `Capability Statement Check`: Ensures the server is correctly advertising its
  capabilities.
- `Bundle Validation (Happy Path)`: Tests valid FHIR Bundle submissions for
  expected successful responses.
- `Bundle Validation (Unhappy Path)`: Ensures proper handling of invalid FHIR
  Bundle submissions.
- `Bundle Submission (Happy Path)`: Verifies that valid Bundle submissions are
  accepted and appropriately stored by the server.
- `Bundle Submission (Unhappy Path)`: Checks error handling for invalid Bundle
  submissions.

### fhir-fixture-shinny-impl-guide-sample.json

This JSON file contains sample data compliant with the implementation guidelines
of our FHIR service. It is used within the .http tests to simulate valid data
submission.

### fhir-fixture-unhappy-path-01.json

This JSON file provides deliberately flawed FHIR data used to test the error
handling capabilities of our FHIR service endpoints.

### fhir-fixture-shinny-bronx-unhappy-path.json

This JSON file from Bronx provides the FHIR data which has some errors.

### fhir-fixture-shinny-healtheconnections-unhappy-path.json

This JSON file from Healtheconnections provides the FHIR data which has some
errors.

### fhir-service-result.txt

The `fhir-service-result.txt` file captures the responses from various API calls
to a FHIR service. This file is essential for understanding how the server
behaves under different test conditions and provides a record of HTTP responses
for each tested endpoint.

`Purpose`: To log the outcomes of HTTP requests made to the FHIR service for
testing and verification purposes.

`Content`: This file includes the results of several test scenarios that target
the FHIR server's ability to handle and validate FHIR Bundles, both correctly
and incorrectly formatted.

#### Test Outcomes Documented

- `Capability Statement Retrieval`: Validates that the server is operational and
  correctly provides its FHIR capabilities. Checks for appropriate response
  headers and body content including the server's software version and supported
  FHIR version.

- `Bundle Validation (Happy Path)`: Tests the server’s capability to validate a
  correctly formatted FHIR Bundle. Ensures that the server responds with the
  appropriate OperationOutcome resource type indicating a successful validation.

- `Bundle Validation (Unhappy Path)`: Intentionally submits a poorly formatted
  FHIR Bundle to test error handling. Records the server's error response,
  ensuring it identifies and communicates validation errors correctly.

- `Bundle Submission (Happy Path)`: Verifies that the server accepts and
  correctly processes a valid FHIR Bundle submission. Checks for correct status
  codes and response content to confirm successful resource creation.

- `Bundle Submission (Unhappy Path)`: Similar to the unhappy path for
  validation, this test submits an incorrect FHIR Bundle to observe how the
  server handles submission errors. Details the server's responses to ensure it
  appropriately flags and reports submission errors.
