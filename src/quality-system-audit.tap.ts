#!/usr/bin/env -S deno run

import { nyecSdlcEvidence, tap } from "./compliance.ts";

const qsCB = nyecSdlcEvidence();
const { nyecSDLC } = qsCB;

// deno-fmt-ignore
await nyecSDLC["4.1 Document Software Development"].compliance((c) => {
  c.ok("4.1.1 The approval and results of the developed software request shall be documented.");
  c.ok("4.1.2 A documented audit trail, maintained at a Business Unit level, containing relevant information shall always be maintained.");
  c.notOk("4.1.3 Information resources documentation is used for reference purposes in various scenarios (e.g. further development of existing information resources as well as ensuring adequate knowledge transfer in the event of the original developer and/or development house being unavailable).", {
    diagnostics: {
      "Audit Note":
        "Pending minor revisions. See comments in Jira ticket ABC-123",
      "Jira Ticket": "ABC-123",
    },
  });
});

await nyecSDLC["4.2 Risk Management"].compliance((c) => {
  c.ok("SCF Control ID: SYS.01 - Requirement #1234 completed");
  c.ok("SCF Control ID: SYS.02 - Requirement #1235 completed");
  c.notOk("SCF Control ID: SYS.03 - Requirement #1236 incomplete", {
    diagnostics: {
      "Audit Note":
        "Pending minor revisions. See comments in Jira ticket ABC-123",
      "Jira Ticket": "ABC-123",
      "Pull Request": new URL("https://github.com/repo/pull/789")
        .toString(),
    },
  });
});

console.log(
  tap.emittableTapContent(
    qsCB.tapContent(),
    Deno.args.length ? Deno.args[0] as tap.TapFormat : undefined,
  ),
);
