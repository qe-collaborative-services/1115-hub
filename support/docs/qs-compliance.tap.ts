#!/usr/bin/env -S deno run

//import * as tap from "../../../../netspective-labs/sql-aide/lib/tap/mod.ts";
import { TapComplianceBuilder } from "https://raw.githubusercontent.com/netspective-labs/sql-aide/v0.13.7/lib/tap/mod.ts";

console.log((await new TapComplianceBuilder<
  {
    "Audit Note": string;
    "Jira Ticket"?: string;
    "Pull Request"?: string;
  }
>().subject("Requirements & Specifications", async function* (c) {
  yield c.ok("SCF Control ID: SYS.01 - Requirement #1234 completed");
  yield c.ok("SCF Control ID: SYS.02 - Requirement #1235 completed");
  yield c.notOk("SCF Control ID: SYS.03 - Requirement #1236 incomplete", {
    diagnostics: {
      "Audit Note":
        "Pending minor revisions. See comments in Jira ticket ABC-123",
      "Jira Ticket": "ABC-123",
      "Pull Request": new URL("https://github.com/repo/pull/789").toString(),
    },
  });
})).tapContentText());
