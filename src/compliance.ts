import * as tap from "../../../netspective-labs/sql-aide/lib/tap/mod.ts";
export * as tap from "../../../netspective-labs/sql-aide/lib/tap/mod.ts";

// import * as tap from "https://raw.githubusercontent.com/netspective-labs/sql-aide/v0.13.10/lib/tap/mod.ts";
// export * as tap from "https://raw.githubusercontent.com/netspective-labs/sql-aide/v0.13.10/lib/tap/mod.ts";

// deno-lint-ignore no-explicit-any
type Any = any;

export type AuditResults = {
  readonly "Audit Note"?: string;
  readonly "Jira Ticket"?: string;
};

export type AuditSoftwareResults = AuditResults & {
  readonly "Pull Request"?: string;
};

export function qsSubjectArea<
  Area extends string,
  Auditable extends AuditResults,
>(
  area: Area,
  descr: string,
  tcb = new (class extends tap.TapComplianceBuilder<Area, Auditable> {
    constructor() {
      super(false); // don't include a header
    }

    // wraps this.subject so that "subject area" title doesn't need to be passed
    async compliance<
      Topic extends string,
      TopicDiagnosable extends tap.Diagnostics,
    >(
      elems: (
        bb: tap.BodyBuilder<Topic, TopicDiagnosable>,
      ) => void | Promise<void>,
    ) {
      await this.subject<Topic, TopicDiagnosable>(area, elems);
      return this;
    }
  })(),
) {
  return { area, descr, tcb };
}

// Define the constant and let TypeScript infer the type with 'as const' so
// that we can use keyof to get the proper entries in a type-safe manner
export const qualitySystemSubjectAreas = [
  qsSubjectArea(
    "Outcomes Management",
    `Arguably the most important subject area, emphasizing importance of
     determining expected outcomes and objectives of the solution, rather than
     just focusing on technical requirements and specifications. It integrates
     aspects of traditional Requirements Management by ensuring that the
     solution not only meets the technical requirements but also aligns with
     the broader business goals and customer expectations.

     This approach involves a thorough understanding of the end-user needs,
     desired functionality, and the impact the software is expected to have.
     It also entails setting clear, measurable outcomes and ensuring that the
     software development process is geared towards achieving these outcomes,
     thus ensuring a more holistic approach to software development.`,
  ),
  qsSubjectArea<"Design and Development", AuditSoftwareResults>(
    "Design and Development",
    `Covering aspects of software design, architecture, and development
     processes, including adherence to coding standards and effective
     development methodologies.`,
  ),
  qsSubjectArea(
    "Testing and Quality Assurance",
    `Focusing on various forms of testing to identify and rectify bugs and
     defects and ensuring that the software meets quality standards
     throughout its development.`,
  ),
  qsSubjectArea(
    "Configuration Management",
    `Managing changes to software products, including version control and
     tracking of changes.`,
  ),
  qsSubjectArea(
    "Risk Management",
    `Identifying, analyzing, and mitigating risks associated with software
     development.`,
  ),
  qsSubjectArea(
    "Project Management",
    `Ensuring that the software project is delivered on time, within budget,
     and according to the project plan.`,
  ),
  qsSubjectArea(
    "Compliance and Standards Adherence",
    `Ensuring compliance with relevant industry standards and regulations.`,
  ),
  qsSubjectArea(
    "Documentation and Records Management",
    `Keeping accurate records and documentation throughout the software
     development lifecycle.`,
  ),
] as const;

export type QualitySysComplianceSubjectArea =
  (typeof qualitySystemSubjectAreas)[number]["area"];

export type QualitySysComplianceBuilderType = {
  [K in QualitySysComplianceSubjectArea]: Extract<
    (typeof qualitySystemSubjectAreas)[number],
    { area: K }
  >["tcb"];
};

export class QualitySysComplianceBuilder {
  readonly builders: QualitySysComplianceBuilderType;

  constructor() {
    this.builders = {} as QualitySysComplianceBuilderType;
    for (const sa of qualitySystemSubjectAreas) {
      // coersion required because areas are dynamic but we force type-safety
      (this.builders[sa.area] as Any) = sa.tcb;
    }
  }

  tapContent() {
    const tcb = new tap.TapComplianceBuilder();
    for (const sa of qualitySystemSubjectAreas) {
      tcb.bb.content.push(
        ...sa.tcb.bb.content.filter(
          (c) => c.nature === "test-case",
        ),
      );
    }
    return tcb.tapContent();
  }

  tapContentText() {
    return tap.stringify(this.tapContent());
  }

  tapContentHTML() {
    return tap.tapContentHTML(this.tapContent());
  }

  tapContentMarkdown() {
    return tap.tapContentMarkdown(this.tapContent());
  }

  tapContentJSON() {
    return JSON.stringify(this.tapContent(), null, "  ");
  }
}

export type TaskEvidenceStrategy<Strategy extends string> = {
  readonly strategy: Strategy;
  readonly description: string;
};

export function taskEvidenceStrategy<Strategy extends string>(
  strategy: Strategy,
  description: string,
): TaskEvidenceStrategy<Strategy> {
  return { strategy, description };
}

const evidenceTBD = taskEvidenceStrategy(
  "TODO",
  "evidence strategy to be determined (TBD)",
);
const humanEvidence = taskEvidenceStrategy(
  "human",
  "must be performed by humans and has no easy machine evidence",
);
const securedFtpServer = taskEvidenceStrategy(
  "secured-ftp-site",
  "the existence and proper operation of a secured FTP server",
);
const docPublicEvidence = taskEvidenceStrategy(
  "document-public",
  "the existence of a document (with public URL) suffices as evidence",
);
const docSensitiveEvidence = taskEvidenceStrategy(
  "document-sensitive",
  "the existence of a document (private access) suffices as evidence",
);
const infraDeployedEvidence = taskEvidenceStrategy(
  "infra-deployed",
  "machine evidence from deployed software",
);
const softwareEvidence = taskEvidenceStrategy(
  "software",
  "evidence comes from the code itself",
);

export function sowPhase1Task<Task extends string, Strategy extends string>(
  task: Task,
  evidenceStrategy: TaskEvidenceStrategy<Strategy>,
) {
  return { task, evidenceStrategy };
}

export function sowPhase1Subtask<
  Subtask extends string,
  Strategy extends string,
>(
  task: Subtask,
  evidenceStrategy: TaskEvidenceStrategy<Strategy>,
) {
  return sowPhase1Task<Subtask, Strategy>(task, evidenceStrategy);
}

export function sowPhase1TaskWithSubtasks<
  Task extends string,
  Strategy extends string,
  Subtask extends string,
>(
  task: Task,
  evidenceStrategy: TaskEvidenceStrategy<Strategy>,
  args: {
    readonly subtasks: ReturnType<typeof sowPhase1Subtask<Subtask, Strategy>>[];
  },
) {
  return { task, evidenceStrategy, subtasks: args.subtasks };
}

export const sowPhase1Tasks = [
  sowPhase1Task("Signed SOW", docSensitiveEvidence),
  sowPhase1Task(
    "File Receipt – Setting up secure transfer capabilities from the screening  contributor to the QE: Setting up transfer capabilities to enable the safe and encrypted transfer of data files, including but not limited to 1115 screenings.",
    securedFtpServer,
  ),
  sowPhase1Task(
    "QE management of user credentials and permissions, ensuring that only authorized users can access the SFTP server for file transfers.",
    evidenceTBD,
  ),
  sowPhase1Task(
    "Files received via SFTP must be securely stored with appropriate access controls in place to maintain data integrity and confidentiality.",
    evidenceTBD,
  ),
  sowPhase1Task(
    "All received files must be encrypted during transmission to and from the SFTP server. Encryption standards and protocols should be in compliance with jointly-agreed security measures.",
    evidenceTBD,
  ),
  sowPhase1Task(
    "Upon successful file receipt, QEs are required to automatically forward these files to Data Quality Evaluation at their own QE or at QCS. Timing will be determined in collaboration with the QEs and decided by QCS and NYeC.",
    evidenceTBD,
  ),
  sowPhase1Task(
    "Each Qualified Entity (QE) is required to submit a thorough test plan designed to validate the successful implementation of the SFTP objectives and execute this test plan. QEs are strongly encouraged to collaborate in the development of their test plans. NYeC must approve each QEs test plan, and it is encouraged for multiple QEs to utilize a shared document for this purpose.",
    evidenceTBD,
  ),
  sowPhase1TaskWithSubtasks(
    "Each QE will submit a runbook that describes how this system operate. This run book will be reviewed by NYeC, and QEs will finalize for production. If QEs already have an SFTP run book, that can be submitted.",
    evidenceTBD,
    {
      subtasks: [
        sowPhase1Subtask(
          "Introduction: A brief overview of the service, its purpose, and the intended audience for the runbook.",
          evidenceTBD,
        ),
        sowPhase1Subtask(
          "Participant Feedback: Document the end-to-end process for providing feedback to sources on any data quality issues. In the future, QEs will use the SHIN-NY quality assurance specification to define when feedback is needed.",
          evidenceTBD,
        ),
        sowPhase1Subtask(
          "System Architecture: A diagram or detailed description of the system's architecture, including how files will be automatically moved from the screening contributor to the QE to QCS or to the SHIN-NY Data Lake.",
          evidenceTBD,
        ),
        sowPhase1Subtask(
          "Authentication & Authorization: If the QE is using their current means and methods for user administration, this section can be left blank.  If the QE has modified their processes in support of 1115, describe the user provisioning processes related to 1115.",
          evidenceTBD,
        ),
        sowPhase1Subtask(
          "Onboarding New Data Submitters: A step-by-step guide to onboard a new data submitter, including setting up authentication, system configurations, and permissions. Checklists for validation tests that new submitters must pass to be considered fully onboarded. If such a checklist exists, provide a reference.",
          evidenceTBD,
        ),
        sowPhase1Subtask(
          "Monitoring and Logging: Describe how you will ensure that files all submitted by 1115 sources are dutifully and accurately submitted to QCS or the SHIN-NY Data Lake.",
          evidenceTBD,
        ),
        sowPhase1Subtask(
          "Incident Response: If the process for 1115 data submission issues are in some way distinct/unique from how all other incidents are handled, describe the variances.",
          evidenceTBD,
        ),
        sowPhase1Subtask(
          "Compliance and Auditing: If the process for 1115 data submission compliance and auditing is in some way distinct/unique from how all other incidents are handled, describe the variances.",
          evidenceTBD,
        ),
      ],
    },
  ),
  sowPhase1Task(
    "Each QE will complete all screening tests successfully using their SFTP.",
    evidenceTBD,
  ),
  sowPhase1Task(
    "Each QE will submit feedback to screeners that is consistent with SHIN-NY feedback utilizing their SFTP.",
    evidenceTBD,
  ),
  sowPhase1Task(
    "Local MPI: Updates to QE MPIs with any new patients or patient information from 1115 Waiver screenings.",
    evidenceTBD,
  ),
  sowPhase1Task(
    "Data Quality Evaluation and Mapping: A service capable of evaluating the quality of submitted 1115 screening data, either in text or API format.",
    evidenceTBD,
  ),
  sowPhase1Task(
    "File to JSON processing: A service capable of converting files with multiple lines of 1115 screening data to FHIR compliance JSON files, for submission to data lake.",
    evidenceTBD,
  ),
] as const;

export type SowPhase1Task = (typeof sowPhase1Tasks)[number]["task"];

// subclass BodyFactory to make task-names (in `ok` and `notOk` type-safe)
export class SowPhase1BodyFactory<
  Describable extends SowPhase1Task,
  Diagnosable extends tap.Diagnostics,
> {
  readonly bb = new tap.BodyBuilder<Describable, Diagnosable>();
  readonly bf = new tap.BodyFactory<Describable, Diagnosable>();

  ok(
    description: Describable,
    init?: tap.TestCaseBuilderArgs<Describable, Diagnosable>,
  ) {
    return this.bf.ok(description, init);
  }

  notOk(
    description: Describable,
    init?: tap.TestCaseBuilderArgs<Describable, Diagnosable>,
  ) {
    return this.bf.notOk(description, init);
  }

  async okParent<
    SubtestDescribable extends string,
    SubtestDiagnosable extends tap.Diagnostics,
  >(
    description: Describable,
    init: tap.ParentTestCaseBuilderArgs<
      Describable,
      Diagnosable,
      SubtestDescribable,
      SubtestDiagnosable
    >,
  ) {
    return await this.bf.okParent<SubtestDescribable, SubtestDiagnosable>(
      description,
      init,
    );
  }

  async notOkParent<
    SubtestDescribable extends string,
    SubtestDiagnosable extends tap.Diagnostics,
  >(
    description: Describable,
    init: tap.ParentTestCaseBuilderArgs<
      Describable,
      Diagnosable,
      SubtestDescribable,
      SubtestDiagnosable
    >,
  ) {
    return await this.bf.notOkParent<SubtestDescribable, SubtestDiagnosable>(
      description,
      init,
    );
  }

  async compliance(
    elems: (
      factory: SowPhase1BodyFactory<Describable, Diagnosable>,
    ) => AsyncGenerator<tap.TestSuiteElement<Describable, Diagnosable>>,
  ) {
    const yielded = await Array.fromAsync(elems(this));
    for (const ey of yielded) {
      this.bb.content.push(ey);
    }
  }
}

export class SowComplianceBuilder<
  Describable extends SowPhase1Task,
  Diagnosable extends tap.Diagnostics,
> {
  readonly phase1 = new SowPhase1BodyFactory<Describable, Diagnosable>();

  constructor() {}

  tapContent() {
    const tcb = new tap.TapComplianceBuilder(false);
    tcb.bb.content.push(
      ...this.phase1.bb.content.filter((c) => c.nature === "test-case"),
    );
    return tcb.tapContent();
  }

  tapContentText() {
    return tap.stringify(this.tapContent());
  }

  tapContentHTML() {
    return tap.tapContentHTML(this.tapContent());
  }

  tapContentMarkdown() {
    return tap.tapContentMarkdown(this.tapContent());
  }

  tapContentJSON() {
    return JSON.stringify(this.tapContent(), null, "  ");
  }
}
