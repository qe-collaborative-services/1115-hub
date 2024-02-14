<!-- NYeC 1115 Waiver Phase 1 Statement of Work (SOW) Compliance -->
- ✅ Signed SOW
- ❌ File Receipt - Setting up secure transfer capabilities from the screening  contributor to the QE: Setting up transfer capabilities to enable the safe and encrypted transfer of data files, including but not limited to 1115 screenings.
- ❌ QE management of user credentials and permissions, ensuring that only authorized users can access the SFTP server for file transfers.
- ❌ Files received via SFTP must be securely stored with appropriate access controls in place to maintain data integrity and confidentiality.
- ❌ All received files must be encrypted during transmission to and from the SFTP server. Encryption standards and protocols should be in compliance with jointly-agreed security measures.
- ❌ Upon successful file receipt, QEs are required to automatically forward these files to Data Quality Evaluation at their own QE or at QCS. Timing will be determined in collaboration with the QEs and decided by QCS and NYeC.
- ❌ Each Qualified Entity (QE) is required to submit a thorough test plan designed to validate the successful implementation of the SFTP objectives and execute this test plan. QEs are strongly encouraged to collaborate in the development of their test plans. NYeC must approve each QEs test plan, and it is encouraged for multiple QEs to utilize a shared document for this purpose.
- ✅ Each QE will submit a runbook that describes how this system operate.
  - Subtests:
    - ❌ Authentication & Authorization: If the QE is using their current means and methods for user administration, this section can be left blank.  If the QE has modified their processes in support of 1115, describe the user provisioning processes related to 1115.
    - ❌ Compliance and Auditing: If the process for 1115 data submission compliance and auditing is in some way distinct/unique from how all other incidents are handled, describe the variances.

- ❌ Each QE will complete all screening tests successfully using their SFTP.
- ❌ Each QE will submit feedback to screeners that is consistent with SHIN-NY feedback utilizing their SFTP.
- ❌ Each QE develops an MPI for all test screenings and submits to SHIN-NY Data Lake.
- ✅ Data Quality Evaluation and Mapping: A service capable of evaluating the quality of submitted 1115 screening data, either in text or API format.
  - Subtests:
    - ❌ Each QE uses validation rules developed by NYeC and in collaboration with QEs to ensure each flat file meets criteria. If it does not, QE will provide feedback to screeners and not pass along a JSON to the SHIN-NY Data Lake until issues are fixed.
    - ❌ QE successfully has completed each validation for every test.

- ✅ File to JSON processing: A service capable of converting files with multiple lines of 1115 screening data to FHIR compliance JSON files, for submission to data lake.
  - Subtests:
    - ❌ File Acceptance: The service must be capable of accepting files in CSV format.
    - ❌ File Parsing: Each line of the file must be parsed to extract the relevant data.
    - ❌ Data Transformation: The parsed data must be transformed into FHIR-compliant JSON format as per the specifications provided by the Gravity Pilot Project.
    - ❌ Logging of Submission Outcome: The service must log the success or failure of each item submitted to the data lake.
    - ❌ Review of Unsuccessful Submissions: The QE or QCS must develop internal means and methods to review, all data that was not successfully placed into the data lake.  The QE or QCS will then work with a combination of NYeC and the submitter to remediate those deficiencies.
    - ❌ Error Handling: The service should handle errors gracefully and notify the administrators for manual intervention, if required.
    - ❌ User Feedback: End-users should receive confirmation (email or some other means and method), indicating the success or failure of the data submission process.  QE and QCS must establish means and methods to exchange PHI with submitters where necessary for troubleshooting.


