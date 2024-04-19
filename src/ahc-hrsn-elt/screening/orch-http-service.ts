// orch-http-service.ts
import { Command } from "https://deno.land/x/cliffy@v1.0.0-rc.3/command/mod.ts";
import {
  Application,
  Context,
  Router,
} from "https://deno.land/x/oak@v12.6.2/mod.ts";
import JSZip from "npm:jszip";
import { path } from "./deps.ts";

async function orchestrateFiles(inputPath: string, outputPath: string) {
  console.log(`Orchestrating files from ${inputPath} to ${outputPath}`);
}

const runServer = async (host: string, port: number, shinnyFhirUrl: string) => {
  const app = new Application();
  const router = new Router();

  router.post("/orchestrate.zip", async (context: Context) => {
    if (!context.request.hasBody) {
      context.response.status = 400;
      context.response.body = "No data submitted";
      return;
    }

    const bodyResult = context.request.body({ type: "form-data" });
    const formData = await bodyResult.value.read();
    const zipFile = formData.files ? formData.files[0] : "";
    if (zipFile && zipFile.filename) {
      const qeName = formData.fields.qe ? formData.fields.qe : "healthelink";
      const zip = new JSZip();
      // Read the file from the filename path
      const zipData = await Deno.readFile(zipFile.filename);
      const unzippedData = await zip.loadAsync(zipData);
      // Container path would /SFTP/healthelink/egress/
      const tempIngressTxPath = path.join(
        Deno.cwd(),
        "SFTP",
        qeName,
        "egress",
        "ingress-tx",
      );
      //Make ingress-tx directory
      await Deno.mkdir(tempIngressTxPath, { recursive: true });

      await Promise.all(
        Object.keys(unzippedData.files).map(async (fileName) => {
          const file = unzippedData.files[fileName];
          if (!file.dir) {
            const content = await file.async("uint8array");
            const filePath = path.join(tempIngressTxPath, fileName);
            await Deno.writeFile(filePath, content);
          }
        }),
      );

      const tempEgressPath = path.join(
        Deno.cwd(),
        "SFTP",
        qeName,
        "egress",
      );
      //Call the orchestration function
      await orchestrateFiles(tempIngressTxPath, tempEgressPath);

      const resultZip = new JSZip();
      for await (const entry of Deno.readDir(tempIngressTxPath)) {
        const entryPath = path.join(tempIngressTxPath, entry.name);
        const data = await Deno.readFile(entryPath);
        resultZip.file(entry.name, data);
      }
      const zipBuffer = await resultZip.generateAsync({ type: "uint8array" });
      // Specify the final ZIP file path
      const finalZipPath = path.join(tempEgressPath, zipFile.originalName);

      // Save the ZIP file to the path
      await Deno.writeFile(finalZipPath, zipBuffer);
      context.response.body = "ZIP file processed and saved successfully.";
      context.response.type = "application/zip";
      // Use below code to emit the zip file
      // context.response.body = zipBuffer;
      // context.response.type = "application/zip";
    } else {
      context.response.status = 400;
      context.response.body = "No ZIP file found in the request";
    }
  });

  app.use(router.routes());
  app.use(router.allowedMethods());

  console.log(`Server running on ${host}:${port}`);
  await app.listen({ hostname: host, port: port });
};

await new Command()
  .name("orch-http-service")
  .description("HTTP service for orchestrating ZIP file processing.")
  .option("-p, --port [port:number]", "Port to run the HTTP server on.", {
    default: 8000,
    value: (port) => {
      const parsedPort = Number(port);
      if (isNaN(parsedPort) || parsedPort < 1 || parsedPort > 65535) {
        throw new Error("Port must be a number between 1 and 65535.");
      }
      return parsedPort;
    },
  })
  .option("-H, --host <host:string>", "Host for the HTTP server.", {
    default: "127.0.0.1",
  })
  .option("--shinny-fhir-url <url:string>", "SHIN-NY FHIR endpoint URL.", {
    default: "https://default-fhir-url.com",
  })
  .action(({ host, port, shinnyFhirUrl }) => {
    runServer(host, port, shinnyFhirUrl);
  })
  .parse(Deno.args);
