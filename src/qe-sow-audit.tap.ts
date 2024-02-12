#!/usr/bin/env -S deno run

import * as c from "./compliance.ts";

const sowGCB = new c.SowComplianceBuilder();

await sowGCB.phase1.compliance(async function* (c) {
  yield c.ok("Signed SOW");
  yield c.notOk(
    "QE management of user credentials and permissions, ensuring that only authorized users can access the SFTP server for file transfers.",
  );
  yield c.notOk(
    "Files received via SFTP must be securely stored with appropriate access controls in place to maintain data integrity and confidentiality.",
  );
  yield c.notOk(
    "All received files must be encrypted during transmission to and from the SFTP server. Encryption standards and protocols should be in compliance with jointly-agreed security measures.",
  );
  yield c.notOk(
    "Upon successful file receipt, QEs are required to automatically forward these files to Data Quality Evaluation at their own QE or at QCS. Timing will be determined in collaboration with the QEs and decided by QCS and NYeC.",
  );
  yield c.notOk(
    "Each Qualified Entity (QE) is required to submit a thorough test plan designed to validate the successful implementation of the SFTP objectives and execute this test plan. QEs are strongly encouraged to collaborate in the development of their test plans. NYeC must approve each QEs test plan, and it is encouraged for multiple QEs to utilize a shared document for this purpose.",
  );
  yield c.notOkParent(
    "Each QE will submit a runbook that describes how this system operate. This run book will be reviewed by NYeC, and QEs will finalize for production. If QEs already have an SFTP run book, that can be submitted.",
    {
      subtests: async (sb) => {
        await sb.notOk(
          "Introduction: A brief overview of the service, its purpose, and the intended audience for the runbook.",
        );
        await sb.notOk(
          "Participant Feedback: Document the end-to-end process for providing feedback to sources on any data quality issues. In the future, QEs will use the SHIN-NY quality assurance specification to define when feedback is needed.",
        );
        await sb.notOk(
          "System Architecture: A diagram or detailed description of the system's architecture, including how files will be automatically moved from the screening contributor to the QE to QCS or to the SHIN-NY Data Lake.",
        );
        await sb.notOk(
          "Authentication & Authorization: If the QE is using their current means and methods for user administration, this section can be left blank.  If the QE has modified their processes in support of 1115, describe the user provisioning processes related to 1115.",
        );
        await sb.notOk(
          "Onboarding New Data Submitters: A step-by-step guide to onboard a new data submitter, including setting up authentication, system configurations, and permissions. Checklists for validation tests that new submitters must pass to be considered fully onboarded. If such a checklist exists, provide a reference.",
        );
        await sb.notOk(
          "Monitoring and Logging: Describe how you will ensure that files all submitted by 1115 sources are dutifully and accurately submitted to QCS or the SHIN-NY Data Lake.",
        );
        await sb.notOk(
          "Incident Response: If the process for 1115 data submission issues are in some way distinct/unique from how all other incidents are handled, describe the variances.",
        );
        await sb.notOk(
          "Compliance and Auditing: If the process for 1115 data submission compliance and auditing is in some way distinct/unique from how all other incidents are handled, describe the variances.",
        );
        return {
          body: sb.content,
          title: "subtasks",
          plan: sb.plan(),
        };
      },
    },
  );

  yield c.notOk(
    "Each QE will complete all screening tests successfully using their SFTP.",
  );
  yield c.notOk(
    "Each QE will submit feedback to screeners that is consistent with SHIN-NY feedback utilizing their SFTP.",
  );
  yield c.notOkParent(
    "Local MPI: Updates to QE MPIs with any new patients or patient information from 1115 Waiver screenings.",
    {
      subtests: async (sb) => {
        await sb.notOk(
          "Each QE develops an MPI for all test screenings and submits to SHIN-NY Data Lake.",
        );
        return {
          body: sb.content,
          title: "subtasks",
          plan: sb.plan(),
        };
      },
    },
  );
  yield c.notOkParent(
    "Data Quality Evaluation and Mapping: A service capable of evaluating the quality of submitted 1115 screening data, either in text or API format.",
    {
      subtests: async (sb) => {
        await sb.notOk(
          "Each QE uses validation rules developed by NYeC and in collaboration with QEs to ensure each flat file meets criteria. If it does not, QE will provide feedback to screeners and not pass along a JSON to the SHIN-NY Data Lake until issues are fixed.",
        );
        await sb.notOk(
          "QE successfully has completed each validation for every test.",
        );
        return {
          body: sb.content,
          title: "subtasks",
          plan: sb.plan(),
        };
      },
    },
  );

  yield c.notOkParent(
    "File to JSON processing: A service capable of converting files with multiple lines of 1115 screening data to FHIR compliance JSON files, for submission to data lake.",
    {
      subtests: async (sb) => {
        await sb.notOk(
          "All tests with no data quality issues have been converted to FHIR JSON and submitted to the SHIN-NY Data Lake.",
        );
        await sb.notOk("All tests match the generated example FHIR JSON.");
        await sb.notOkParent("All of the following items are in place", {
          subtests: async (sb2) => {
            await sb2.notOk(
              "File Acceptance: The service must be capable of accepting files in CSV format.",
            );
            await sb2.notOk(
              "File Parsing: Each line of the file must be parsed to extract the relevant data.",
            );
            await sb2.notOk(
              "Data Transformation: The parsed data must be transformed into FHIR-compliant JSON format as per the specifications provided by the Gravity Pilot Project.",
            );
            await sb2.notOk(
              "Logging of Submission Outcome: The service must log the success or failure of each item submitted to the data lake.",
            );
            await sb2.notOk(
              "Review of Unsuccessful Submissions: The QE or QCS must develop internal means and methods to review, all data that was not successfully placed into the data lake.  The QE or QCS will then work with a combination of NYeC and the submitter to remediate those deficiencies.",
            );
            await sb2.notOk(
              "Error Handling: The service should handle errors gracefully and notify the administrators for manual intervention, if required.",
            );
            await sb2.notOk(
              "User Feedback: End-users should receive confirmation (email or some other means and method), indicating the success or failure of the data submission process.  QE and QCS must establish means and methods to exchange PHI with submitters where necessary for troubleshooting.",
            );
            return {
              body: sb2.content,
              title: "subtasks",
              plan: sb2.plan(),
            };
          },
        });
        await sb.notOk(
          "Each QE will submit a run book that describes how JSON processing will operate. This run book will be reviewed by NYeC, and QEs will finalize for production. If QEs already have a JSON processing run book, that can be submitted.",
        );
        return {
          body: sb.content,
          title: "subtasks",
          plan: sb.plan(),
        };
      },
    },
  );
});

console.log(
  Deno.args.find((a) => a == "--html")
    ? sowGCB.tapContentHTML()
    : Deno.args.find((a) => a == "--md")
    ? sowGCB.tapContentMarkdown()
    : Deno.args.find((a) => a == "--json")
    ? sowGCB.tapContentJSON()
    : sowGCB.tapContentText(),
);
