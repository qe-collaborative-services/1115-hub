// import * as tap from "../../../netspective-labs/sql-aide/lib/tap/mod.ts";
// export * as tap from "../../../netspective-labs/sql-aide/lib/tap/mod.ts";

import * as tap from "https://raw.githubusercontent.com/netspective-labs/sql-aide/v0.13.14/lib/tap/mod.ts";
export * as tap from "https://raw.githubusercontent.com/netspective-labs/sql-aide/v0.13.14/lib/tap/mod.ts";

// deno-lint-ignore no-explicit-any
type Any = any;

export type AuditEvidence = {
  readonly "Audit Note"?: string;
  readonly "Jira Ticket"?: string;
};

export type AuditSoftwareResults = AuditEvidence & {
  readonly "Pull Request"?: string;
};

export function nyecCS<Area extends string, Evidence extends AuditEvidence>(
  area: Area,
  descr?: string,
) {
  return tap.TapComplianceBuilder.strategy<Area, Evidence>(area, descr);
}

export function nyecParentCS<
  Area extends string,
  AreaEvidence extends AuditEvidence,
  Topic extends string,
  TopicEvidence extends AuditEvidence,
>(
  area: Area,
  descr: string,
  topics: ReturnType<typeof nyecCS<Topic, TopicEvidence>>[],
) {
  return tap.complianceParentStrategy<Area, AreaEvidence, Topic, TopicEvidence>(
    area,
    descr,
    topics,
  );
}

// Subject areas are mapped to Software Development Lifecycle (SDLC) Policy
// Version 2024.1
const nyecSdlcPolicies = [
  nyecParentCS(
    "4.1 Document Software Development",
    `All phases of the software development cycle shall be logged, whether 
     approved or rejected, in a standardized, central system. The approval
     and results of the developed software request shall be documented.`,
    [
      nyecCS(
        `4.1.1 The approval and results of the developed software request shall be documented.`,
      ),
      nyecCS(
        `4.1.2 A documented audit trail, maintained at a Business Unit level, containing relevant information shall always be maintained.`,
        `This should include change request documentation, change authorization, and the outcome of
         the change. No single person should be able to effect changes to 
         production information systems without the approval of other authorized
         personnel.`,
      ),
      nyecCS(
        `4.1.3 Information resources documentation is used for reference purposes in various scenarios (e.g. further development of existing information resources as well as ensuring adequate knowledge transfer in the event of the original developer and/or development house being unavailable).`,
        `It is therefore imperative that information resources documentation is
         complete, accurate and kept up to date with the latest changes. 
         Policies and procedures, affected by software changes, shall be updated
         on completion of each change.`,
      ),
    ],
  ),
  nyecCS<"4.2 Risk Management", AuditSoftwareResults>(
    "4.2 Risk Management",
    `A risk assessment shall be performed for new software and dependent on the outcome, 
     an impact assessment should be performed.`,
  ),
  nyecCS(
    "Testing and Quality Assurance",
    `Focusing on various forms of testing to identify and rectify bugs and
     defects and ensuring that the software meets quality standards
     throughout its development.`,
  ),
  nyecCS(
    "Configuration Management",
    `Managing changes to software products, including version control and
     tracking of changes.`,
  ),
  nyecCS(
    "Risk Management",
    `Identifying, analyzing, and mitigating risks associated with software
     development.`,
  ),
  nyecCS(
    "Project Management",
    `Ensuring that the software project is delivered on time, within budget,
     and according to the project plan.`,
  ),
  nyecCS(
    "Compliance and Standards Adherence",
    `Ensuring compliance with relevant industry standards and regulations.`,
  ),
  nyecCS(
    "Documentation and Records Management",
    `Keeping accurate records and documentation throughout the software
     development lifecycle.`,
  ),
] as const;

export function nyecSdlcEvidence() {
  type SubjectArea = (typeof nyecSdlcPolicies)[number]["area"];
  type Builder = {
    [K in SubjectArea]: Extract<
      (typeof nyecSdlcPolicies)[number],
      { area: K }
    >["tcb"];
  };

  // nyecSDLC is just a convenient way of access policies by subject area
  const nyecSDLC = {} as Builder;
  for (const sa of nyecSdlcPolicies) {
    // coersion required because areas are dynamic but we force type-safety
    (nyecSDLC[sa.area] as Any) = sa.tcb;
  }

  return {
    nyecSDLC,
    nyecSdlcPolicies,
    tapContent: () =>
      tap.TapComplianceBuilder.merged(nyecSdlcPolicies.map((sdlc) => sdlc.tcb)),
  };
}

export class Nyec111WaiverPhase1SowBuilder
  extends tap.TapContentBuilder<string, tap.Diagnostics> {
  constructor(header = true) {
    super();
    if (header) this.header();
  }

  header(
    content = "NYeC 1115 Waiver Phase 1 Statement of Work (SOW) Compliance",
  ) {
    this.bb.comment(content);
    return this;
  }

  readonly tasksPrime = [
    "Signed SOW",
    "File Receipt - Setting up secure transfer capabilities from the screening  contributor to the QE: Setting up transfer capabilities to enable the safe and encrypted transfer of data files, including but not limited to 1115 screenings.",
    "QE management of user credentials and permissions, ensuring that only authorized users can access the SFTP server for file transfers.",
    "Files received via SFTP must be securely stored with appropriate access controls in place to maintain data integrity and confidentiality.",
    "All received files must be encrypted during transmission to and from the SFTP server. Encryption standards and protocols should be in compliance with jointly-agreed security measures.",
    "Upon successful file receipt, QEs are required to automatically forward these files to Data Quality Evaluation at their own QE or at QCS. Timing will be determined in collaboration with the QEs and decided by QCS and NYeC.",
    "Each Qualified Entity (QE) is required to submit a thorough test plan designed to validate the successful implementation of the SFTP objectives and execute this test plan. QEs are strongly encouraged to collaborate in the development of their test plans. NYeC must approve each QEs test plan, and it is encouraged for multiple QEs to utilize a shared document for this purpose.",
    "Each QE will complete all screening tests successfully using their SFTP.",
    "Each QE will submit feedback to screeners that is consistent with SHIN-NY feedback utilizing their SFTP.",
    "Each QE develops an MPI for all test screenings and submits to SHIN-NY Data Lake.",
  ] as const;

  readonly qeRunbookSubtasks = [
    "Introduction: A brief overview of the service, its purpose, and the intended audience for the runbook.",
    "Participant Feedback: Document the end-to-end process for providing feedback to sources on any data quality issues. In the future, QEs will use the SHIN-NY quality assurance specification to define when feedback is needed.",
    "System Architecture: A diagram or detailed description of the system's architecture, including how files will be automatically moved from the screening contributor to the QE to QCS or to the SHIN-NY Data Lake.",
    "Authentication & Authorization: If the QE is using their current means and methods for user administration, this section can be left blank.  If the QE has modified their processes in support of 1115, describe the user provisioning processes related to 1115.",
    "Onboarding New Data Submitters: A step-by-step guide to onboard a new data submitter, including setting up authentication, system configurations, and permissions. Checklists for validation tests that new submitters must pass to be considered fully onboarded. If such a checklist exists, provide a reference.",
    "Monitoring and Logging: Describe how you will ensure that files all submitted by 1115 sources are dutifully and accurately submitted to QCS or the SHIN-NY Data Lake.",
    "Incident Response: If the process for 1115 data submission issues are in some way distinct/unique from how all other incidents are handled, describe the variances.",
    "Compliance and Auditing: If the process for 1115 data submission compliance and auditing is in some way distinct/unique from how all other incidents are handled, describe the variances.",
  ] as const;

  readonly dataQualitySubtasks = [
    "Each QE uses validation rules developed by NYeC and in collaboration with QEs to ensure each flat file meets criteria. If it does not, QE will provide feedback to screeners and not pass along a JSON to the SHIN-NY Data Lake until issues are fixed.",
    "QE successfully has completed each validation for every test.",
  ] as const;

  readonly fhirOutputSubtasks = [
    "File Acceptance: The service must be capable of accepting files in CSV format.",
    "File Parsing: Each line of the file must be parsed to extract the relevant data.",
    "Data Transformation: The parsed data must be transformed into FHIR-compliant JSON format as per the specifications provided by the Gravity Pilot Project.",
    "Logging of Submission Outcome: The service must log the success or failure of each item submitted to the data lake.",
    "Review of Unsuccessful Submissions: The QE or QCS must develop internal means and methods to review, all data that was not successfully placed into the data lake.  The QE or QCS will then work with a combination of NYeC and the submitter to remediate those deficiencies.",
    "Error Handling: The service should handle errors gracefully and notify the administrators for manual intervention, if required.",
    "User Feedback: End-users should receive confirmation (email or some other means and method), indicating the success or failure of the data submission process.  QE and QCS must establish means and methods to exchange PHI with submitters where necessary for troubleshooting.",
  ] as const;

  async evidence(
    supplier: (
      bb: tap.BodyBuilder<
        typeof this.tasksPrime[number],
        tap.Diagnostics
      >,
    ) => void | Promise<void>,
  ) {
    const bb = new tap.BodyBuilder<
      typeof this.tasksPrime[number],
      tap.Diagnostics
    >();
    await supplier(bb);
    this.bb.content.push(...bb.content);
  }

  async qeRunbook(
    init?: Parameters<
      typeof this.bb.okParent<
        typeof this.qeRunbookSubtasks[number],
        tap.Diagnostics
      >
    >[1],
  ) {
    return await this.bb.okParent<
      typeof this.qeRunbookSubtasks[number],
      tap.Diagnostics
    >(
      "Each QE will submit a runbook that describes how this system operate.",
      init as Any, // TODO: fixme
    );
  }

  async dataQuality(
    init?: Parameters<
      typeof this.bb.okParent<
        typeof this.dataQualitySubtasks[number],
        tap.Diagnostics
      >
    >[1],
  ) {
    return await this.bb.okParent<
      typeof this.dataQualitySubtasks[number],
      tap.Diagnostics
    >(
      "Data Quality Evaluation and Mapping: A service capable of evaluating the quality of submitted 1115 screening data, either in text or API format.",
      init as Any, // TODO: fixme
    );
  }

  async fhirOutput(
    init?: Parameters<
      typeof this.bb.okParent<
        typeof this.fhirOutputSubtasks[number],
        tap.Diagnostics
      >
    >[1],
  ) {
    return await this.bb.okParent<
      typeof this.fhirOutputSubtasks[number],
      tap.Diagnostics
    >(
      "File to JSON processing: A service capable of converting files with multiple lines of 1115 screening data to FHIR compliance JSON files, for submission to data lake.",
      init as Any, // TODO: fixme
    );
  }

  async compliance(
    initSupplier: (
      bb: tap.BodyBuilder<
        typeof this.tasksPrime[number],
        tap.Diagnostics
      >,
      builder: typeof this,
    ) =>
      | void
      | Promise<void>,
  ) {
    await initSupplier(
      // we "fake" this to allow type-safety in caller
      this.bb as tap.BodyBuilder<
        typeof this.tasksPrime[number],
        tap.Diagnostics
      >,
      this,
    );
    return this;
  }
}
