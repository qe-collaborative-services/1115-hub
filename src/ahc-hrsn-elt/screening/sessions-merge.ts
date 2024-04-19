import { Command } from "https://deno.land/x/cliffy@v1.0.0-rc.3/command/mod.ts";
import { dax, fs } from "./deps.ts";

await new Command()
  .name("session-merge")
  .description(
    "A cli command to merge the egress/<sessionId>/.workflow/ingestion-center.duckdb instances.",
  )
  .version("v1.0.0")
  .option("--egress-root <path>", "Directory with egress folders", {
    required: true,
  })
  .option("--dest-db <path>", "The destination db file for merged content", {
    required: true,
  })
  .option("--tables <dump>", "The tables that need to be merged", {
    default:
      "demographic_data qe_admin_data screening ahc_cross_walk encounter_class_reference encounter_status_code_reference encounter_type_code_reference ethnicity_reference gender_identity_reference screening_status_code_reference sdoh_domain_reference sex_at_birth_reference sexual_orientation_reference race_reference encounter_type_code_reference encounter_status_code_reference encounter_class_reference business_rules administrative_sex_reference orch_session orch_session_entry orch_session_exec orch_session_issue orch_session_state preferred_language_reference",
  })
  .action(
    async (
      { egressRoot, destDb, tables },
    ) => {
      let firstIcDB = true;
      for await (const dirEntry of Deno.readDir(egressRoot)) {
        if (dirEntry.isDirectory) {
          const icDB =
            `${egressRoot}/${dirEntry.name}/.workflow/ingestion-center.duckdb`;
          if (fs.existsSync(icDB)) {
            if (firstIcDB) {
              await dax.$`duckdb ${icDB} .dump ${tables} | duckdb ${destDb}`;
              firstIcDB = false;
            } else {
              await dax
                .$`duckdb ${icDB} .dump ${tables} | grep '^INSERT INTO' | duckdb ${destDb}`;
            }
          }
        }
        console.log("Basic listing:", dirEntry.name);
      }
    },
  )
  .parse();
