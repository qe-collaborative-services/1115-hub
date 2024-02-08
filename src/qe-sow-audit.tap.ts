#!/usr/bin/env -S deno run

import * as c from "./compliance.ts";

const sowGCB = new c.SowComplianceBuilder();

await sowGCB.phase1.compliance(
  async function* (c) {
    yield c.ok("Signed SOW");
    yield c.notOk(
      "Setting up secure transfer capabilities from the screening  contributor to the QE",
    );
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
  },
);

console.log(
  Deno.args.find((a) => a == "--html")
    ? sowGCB.tapContentHTML()
    : (Deno.args.find((a) => a == "--md")
      ? sowGCB.tapContentMarkdown()
      : (Deno.args.find((a) => a == "--json")
        ? sowGCB.tapContentJSON()
        : sowGCB.tapContentText())),
);
