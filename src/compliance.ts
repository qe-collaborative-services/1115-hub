// import * as tap from "../../../netspective-labs/sql-aide/lib/tap/mod.ts";
// export * as tap from "../../../netspective-labs/sql-aide/lib/tap/mod.ts";

import * as tap from "https://raw.githubusercontent.com/netspective-labs/sql-aide/v0.13.8/lib/tap/mod.ts";
export * as tap from "https://raw.githubusercontent.com/netspective-labs/sql-aide/v0.13.8/lib/tap/mod.ts";

// deno-lint-ignore no-explicit-any
type Any = any;

export type AuditResults = {
  readonly "Audit Note"?: string;
  readonly "Jira Ticket"?: string;
};

export type AuditSoftwareResults = AuditResults & {
  readonly "Pull Request"?: string;
};

export function subjectArea<
  Area extends string,
  Auditable extends AuditResults,
>(
  area: Area,
  descr: string,
  tcb = new (class extends tap.TapComplianceBuilder<Area, Auditable> {
    constructor() {
      super(false); // don't include a header
    }

    async compliance(
      elems: (
        factory: tap.BodyFactory<Auditable>,
      ) => AsyncGenerator<tap.TestSuiteElement<Auditable>>,
    ) {
      await this.subject(area, elems);
      return this;
    }
  })(),
) {
  return { area, descr, tcb };
}

// Define the constant and let TypeScript infer the type with 'as const' so
// that we can use keyof to get the proper entries in a type-safe manner
export const qualitySystemSubjectAreas = [
  subjectArea(
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
  subjectArea<"Design and Development", AuditSoftwareResults>(
    "Design and Development",
    `Covering aspects of software design, architecture, and development
     processes, including adherence to coding standards and effective
     development methodologies.`,
  ),
  subjectArea(
    "Testing and Quality Assurance",
    `Focusing on various forms of testing to identify and rectify bugs and
     defects and ensuring that the software meets quality standards
     throughout its development.`,
  ),
  subjectArea(
    "Configuration Management",
    `Managing changes to software products, including version control and
     tracking of changes.`,
  ),
  subjectArea(
    "Risk Management",
    `Identifying, analyzing, and mitigating risks associated with software
     development.`,
  ),
  subjectArea(
    "Project Management",
    `Ensuring that the software project is delivered on time, within budget,
     and according to the project plan.`,
  ),
  subjectArea(
    "Compliance and Standards Adherence",
    `Ensuring compliance with relevant industry standards and regulations.`,
  ),
  subjectArea(
    "Documentation and Records Management",
    `Keeping accurate records and documentation throughout the software
     development lifecycle.`,
  ),
] as const;

export type ComplianceSubjectArea =
  typeof qualitySystemSubjectAreas[number]["area"];

export type ComplianceBuilderType = {
  [K in ComplianceSubjectArea]: Extract<
    typeof qualitySystemSubjectAreas[number],
    { area: K }
  >["tcb"];
};

export class GovernedComplianceBuilder {
  readonly builders: ComplianceBuilderType;

  constructor() {
    this.builders = {} as ComplianceBuilderType;
    for (const sa of qualitySystemSubjectAreas) {
      // coersion required because areas are dynamic but we force type-safety
      (this.builders[sa.area] as Any) = sa.tcb;
    }
  }

  tapContent() {
    const tcb = new tap.TapComplianceBuilder();
    for (const sa of qualitySystemSubjectAreas) {
      tcb.contentBuilder.bb.content.push(
        ...sa.tcb.contentBuilder.bb.content.filter((c) =>
          c.nature === "test-case"
        ),
      );
    }
    return tcb.tapContent();
  }

  tapContentText() {
    return tap.stringify(this.tapContent());
  }
}
