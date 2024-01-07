import { fs, path, SQLa_orch as o, SQLa_orch_duckdb as ddbo } from "./deps.ts";
import * as sg from "./governance.ts";

// @deno-types="https://cdn.sheetjs.com/xlsx-0.20.1/package/types/index.d.ts"
import * as xlsx from "https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs";

export const excelWorkbookSheetNames = [
  "Admin_Demographic",
  "Screening",
  "QE_Admin_Data",
] as const;
export type ExcelWorkbookSheetName = typeof excelWorkbookSheetNames[number];

export class ExcelSheetTodoIngestSource<SheetName extends string>
  implements
    o.ExcelSheetIngestSource<SheetName, string, ddbo.DuckDbOrchEmitContext> {
  readonly nature = "Excel Workbook Sheet";
  readonly tableName: string;
  constructor(
    readonly uri: string,
    readonly sheetName: SheetName,
    readonly govn: ddbo.DuckDbOrchGovernance,
  ) {
    this.tableName = govn.toSnakeCase(
      path.basename(uri, ".xlsx") + "_" + sheetName,
    );
  }

  workflow(): ReturnType<
    o.ExcelSheetIngestSource<
      string,
      string,
      ddbo.DuckDbOrchEmitContext
    >["workflow"]
  > {
    return {
      ingestSQL: async (issac) =>
        // deno-fmt-ignore
        this.govn.SQL`
          -- required by IngestEngine, setup the ingestion entry for logging
          ${await issac.sessionEntryInsertDML()}
        
          ${await issac.issueInsertDML(`Excel workbook '${path.basename(this.uri)}' sheet '${this.sheetName}' has not been implemented yet.`, "TODO")}`,

      assuranceSQL: () =>
        this.govn.SQL`-- Sheet '${this.sheetName}' ingestion not implemented.`,

      exportResourceSQL: (targetSchema: string) =>
        this.govn.SQL`
          --  Sheet '${this.sheetName}' exportResourceSQL(${targetSchema})`,
    };
  }
}

export class ScreeningExcelSheetIngestSource<TableName extends string>
  implements
    o.ExcelSheetIngestSource<
      "Screening",
      TableName,
      ddbo.DuckDbOrchEmitContext
    > {
  readonly nature = "Excel Workbook Sheet";
  readonly sheetName = "Screening";
  readonly tableName: TableName;
  constructor(
    readonly uri: string,
    readonly govn: ddbo.DuckDbOrchGovernance,
  ) {
    this.tableName = govn.toSnakeCase(
      path.basename(uri, ".xlsx") + "_" + this.sheetName,
    ) as TableName;
  }

  workflow(
    sessionID: string,
    sessionEntryID: string,
  ): ReturnType<
    o.ExcelSheetIngestSource<
      "Screening",
      TableName,
      ddbo.DuckDbOrchEmitContext
    >["workflow"]
  > {
    const sar = new sg.ScreeningAssuranceRules(
      this.tableName,
      sessionID,
      sessionEntryID,
      this.govn,
    );

    return {
      ingestSQL: async (issac) => await this.ingestSQL(issac, sar),
      assuranceSQL: async () => await this.assuranceSQL(),
      exportResourceSQL: async (targetSchema) =>
        await this.exportResourceSQL(targetSchema),
    };
  }

  async ingestSQL(
    issac: o.IngestSourceStructAssuranceContext<ddbo.DuckDbOrchEmitContext>,
    sar: sg.ScreeningAssuranceRules<string>,
  ) {
    const { sheetName, tableName, uri } = this;
    const { sessionID, sessionEntryID } = sar;

    // deno-fmt-ignore
    return this.govn.SQL`
      -- required by IngestEngine, setup the ingestion entry for logging
      ${await issac.sessionEntryInsertDML()}
     
      -- ingest Excel workbook sheet '${sheetName}' into ${tableName} using spatial plugin
      INSTALL spatial; LOAD spatial;

      -- be sure to add src_file_row_number and session_id columns to each row
      -- because assurance CTEs require them
      CREATE TABLE ${tableName} AS
        SELECT *, row_number() OVER () as src_file_row_number, '${sessionID}' as session_id, '${sessionEntryID}' as session_entry_id
          FROM st_read('${uri}', layer='${sheetName}', open_options=['HEADERS=FORCE', 'FIELD_TYPES=AUTO']);          
      
      ${sar.requiredColumnNames()}`
  }

  // deno-lint-ignore require-await
  async assuranceSQL() {
    // deno-fmt-ignore
    return this.govn.SQL`-- Sheet '${this.sheetName}' has no assurance SQL in Excel workbook '${path.basename(this.uri)}'`;
  }

  // deno-lint-ignore require-await
  async exportResourceSQL(targetSchema: string) {
    const { govn } = this;

    // deno-fmt-ignore
    return govn.SQL`-- Sheet '${this.sheetName}' exportResourceSQL(${targetSchema})`;
  }
}

export function ingestExcelSourcesSupplier(
  govn: ddbo.DuckDbOrchGovernance,
): o.IngestFsPatternSourcesSupplier<
  | ScreeningExcelSheetIngestSource<string>
  | ExcelSheetTodoIngestSource<string>
  | o.ErrorIngestSource<ddbo.DuckDbOrchGovernance, ddbo.DuckDbOrchEmitContext>
> {
  return {
    pattern: path.globToRegExp("**/*.xlsx", {
      extended: true,
      globstar: true,
    }),
    sources: (entry: fs.WalkEntry) => {
      const uri = entry.path;
      const sources: (
        | ScreeningExcelSheetIngestSource<string>
        | ExcelSheetTodoIngestSource<string>
        | o.ErrorIngestSource<
          ddbo.DuckDbOrchGovernance,
          ddbo.DuckDbOrchEmitContext
        >
      )[] = [];

      const sheetsExpected: Record<
        ExcelWorkbookSheetName,
        () =>
          | ExcelSheetTodoIngestSource<string>
          | ScreeningExcelSheetIngestSource<string>
      > = {
        "Admin_Demographic": () =>
          new ExcelSheetTodoIngestSource(
            uri,
            "Admin_Demographic",
            govn,
          ),
        "Screening": () => new ScreeningExcelSheetIngestSource(uri, govn),
        "QE_Admin_Data": () =>
          new ExcelSheetTodoIngestSource(uri, "QE_Admin_Data", govn),
      };

      try {
        const wb = xlsx.readFile(entry.path);

        // deno-fmt-ignore
        const sheetNotFound = (name: string) =>
          Error(`Excel workbook sheet '${name}' not found in '${path.basename(entry.path)}' (available: ${wb.SheetNames.join(", ")})`);

        let sheetsFound = 0;
        const expectedSheetNames = Object.keys(sheetsExpected);
        for (const expectedSN of expectedSheetNames) {
          if (wb.SheetNames.find((sn) => sn == expectedSN)) {
            sheetsFound++;
          } else {
            sources.push(
              new o.ErrorIngestSource<
                ddbo.DuckDbOrchGovernance,
                ddbo.DuckDbOrchEmitContext
              >(
                uri,
                sheetNotFound(expectedSN),
                "Sheet Missing",
                govn,
              ),
            );
          }
        }

        if (expectedSheetNames.length == sheetsFound) {
          for (const newSourceInstance of Object.values(sheetsExpected)) {
            sources.push(newSourceInstance());
          }
        }
      } catch (err) {
        sources.push(
          new o.ErrorIngestSource<
            ddbo.DuckDbOrchGovernance,
            ddbo.DuckDbOrchEmitContext
          >(entry.path, err, "ERROR", govn),
        );
      }
      return sources;
    },
  };
}
