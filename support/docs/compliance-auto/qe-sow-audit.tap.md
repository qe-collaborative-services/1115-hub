- ✅ Signed SOW
- ❌ QE management of user credentials and permissions, ensuring that only authorized users can access the SFTP server for file transfers.
- ❌ Files received via SFTP must be securely stored with appropriate access controls in place to maintain data integrity and confidentiality.
- ❌ All received files must be encrypted during transmission to and from the SFTP server. Encryption standards and protocols should be in compliance with jointly-agreed security measures.
- ❌ Upon successful file receipt, QEs are required to automatically forward these files to Data Quality Evaluation at their own QE or at QCS. Timing will be determined in collaboration with the QEs and decided by QCS and NYeC.
- ❌ Each Qualified Entity (QE) is required to submit a thorough test plan designed to validate the successful implementation of the SFTP objectives and execute this test plan. QEs are strongly encouraged to collaborate in the development of their test plans. NYeC must approve each QEs test plan, and it is encouraged for multiple QEs to utilize a shared document for this purpose.
- ❌ Each QE will submit a runbook that describes how this system operate. This run book will be reviewed by NYeC, and QEs will finalize for production. If QEs already have an SFTP run book, that can be submitted.
  - Subtests:
    - ❌ Introduction: A brief overview of the service, its purpose, and the intended audience for the runbook.
    - ❌ Participant Feedback: Document the end-to-end process for providing feedback to sources on any data quality issues. In the future, QEs will use the SHIN-NY quality assurance specification to define when feedback is needed.
    - ❌ System Architecture: A diagram or detailed description of the system's architecture, including how files will be automatically moved from the screening contributor to the QE to QCS or to the SHIN-NY Data Lake.
    - ❌ Authentication & Authorization: If the QE is using their current means and methods for user administration, this section can be left blank.  If the QE has modified their processes in support of 1115, describe the user provisioning processes related to 1115.
    - ❌ Onboarding New Data Submitters: A step-by-step guide to onboard a new data submitter, including setting up authentication, system configurations, and permissions. Checklists for validation tests that new submitters must pass to be considered fully onboarded. If such a checklist exists, provide a reference.
    - ❌ Monitoring and Logging: Describe how you will ensure that files all submitted by 1115 sources are dutifully and accurately submitted to QCS or the SHIN-NY Data Lake.
    - ❌ Incident Response: If the process for 1115 data submission issues are in some way distinct/unique from how all other incidents are handled, describe the variances.
    - ❌ Compliance and Auditing: If the process for 1115 data submission compliance and auditing is in some way distinct/unique from how all other incidents are handled, describe the variances.

- ❌ Each QE will complete all screening tests successfully using their SFTP.
- ❌ Each QE will submit feedback to screeners that is consistent with SHIN-NY feedback utilizing their SFTP.
- ❌ Local MPI: Updates to QE MPIs with any new patients or patient information from 1115 Waiver screenings.
  - Subtests:
    - ❌ Each QE develops an MPI for all test screenings and submits to SHIN-NY Data Lake.

- ❌ Data Quality Evaluation and Mapping: A service capable of evaluating the quality of submitted 1115 screening data, either in text or API format.
  - Subtests:
    - ❌ Each QE uses validation rules developed by NYeC and in collaboration with QEs to ensure each flat file meets criteria. If it does not, QE will provide feedback to screeners and not pass along a JSON to the SHIN-NY Data Lake until issues are fixed.
    - ❌ QE successfully has completed each validation for every test.

- ❌ File to JSON processing: A service capable of converting files with multiple lines of 1115 screening data to FHIR compliance JSON files, for submission to data lake.
  - Subtests:
    - ❌ All tests with no data quality issues have been converted to FHIR JSON and submitted to the SHIN-NY Data Lake.
    - ❌ All tests match the generated example FHIR JSON.
    - ❌ All of the following items are in place
      - Subtests:
        - ❌ File Acceptance: The service must be capable of accepting files in CSV format.
        - ❌ File Parsing: Each line of the file must be parsed to extract the relevant data.
        - ❌ Data Transformation: The parsed data must be transformed into FHIR-compliant JSON format as per the specifications provided by the Gravity Pilot Project.
        - ❌ Logging of Submission Outcome: The service must log the success or failure of each item submitted to the data lake.
        - ❌ Review of Unsuccessful Submissions: The QE or QCS must develop internal means and methods to review, all data that was not successfully placed into the data lake.  The QE or QCS will then work with a combination of NYeC and the submitter to remediate those deficiencies.
        - ❌ Error Handling: The service should handle errors gracefully and notify the administrators for manual intervention, if required.
        - ❌ User Feedback: End-users should receive confirmation (email or some other means and method), indicating the success or failure of the data submission process.  QE and QCS must establish means and methods to exchange PHI with submitters where necessary for troubleshooting.

    - ❌ Each QE will submit a run book that describes how JSON processing will operate. This run book will be reviewed by NYeC, and QEs will finalize for production. If QEs already have a JSON processing run book, that can be submitted.


