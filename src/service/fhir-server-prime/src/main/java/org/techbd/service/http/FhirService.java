package org.techbd.service.http;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.techbd.hrsn.assurance.FHIRBundleValidator;
import org.techbd.hrsn.assurance.Globals;
import org.techbd.hrsn.assurance.Globals.ShinnyDataLakeSubmissionStatus;
import org.techbd.hrsn.assurance.OrchestrationSession;

import java.net.MalformedURLException;
import java.net.URL;
import java.time.Instant;

@Service
public class FhirService {
    private WebClient webClient;

    private final static Logger log = LoggerFactory.getLogger(FhirController.class);

    @Autowired
    public FhirService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl(Globals.getProverty("shinnyDataLakeApiUri"))
                .build();
    }

    public String getMetadata() {
        String version = FHIRBundleValidator.getInstance().getVersionFromProperties();

        Instant now = Instant.now();
        String curTime = Globals.formatInstant(now);

        String fhirServerUrl = Globals.getProverty("fhirServerUrl");
        String operationDefinitionBaseUrl = Globals.getProverty("operationDefinitionBaseUrl");

        return "<CapabilityStatement xmlns=\"http://hl7.org/fhir\">\n" + //
                "    <status value=\"active\"></status>\n" + //
                "    <date value=" + curTime + "></date>\n" + //
                "    <publisher value=\"TechBD\"></publisher>\n" + //
                "    <kind value=\"instance\"></kind>\n" + //
                "    <software>\n" + //
                "        <name value=\"1115-Hub FHIR Server\"></name>\n" + //
                "        <version value=\"" + version + "\"></version>\n" + //
                "    </software>\n" + //
                "    <implementation>\n" + //
                "        <description value=\"1115-Hub FHIR\"></description>\n" + //
                "        <url value=" + fhirServerUrl + "></url>\n" + //
                "    </implementation>\n" + //
                "    <fhirVersion value=\"4.0.1\"></fhirVersion>\n" + //
                "    <format value=\"application/fhir+xml\"></format>\n" + //
                "    <format value=\"application/fhir+json\"></format>\n" + //
                "    <rest>\n" + //
                "        <mode value=\"server\"></mode>\n" + //
                "        <resource>\n" + //
                "            <type value=\"Bundle\"></type>\n" + //
                "            <profile value=\"https://djq7jdt8kb490.cloudfront.net/1115/StructureDefinition-SHINNYBundleProfile.json\"></profile>\n"
                + //
                "            <interaction>\n" + //
                "                <code value=\"create\"></code>\n" + //
                "            </interaction>\n" + //
                "            <interaction>\n" + //
                "                <code value=\"search-type\"></code>\n" + //
                "            </interaction>\n" + //
                "            <searchParam>\n" + //
                "                <name value=\"name\"></name>\n" + //
                "                <type value=\"string\"></type>\n" + //
                "            </searchParam>\n" + //
                "        </resource>\n" + //
                "        <resource>\n" + //
                "            <type value=\"OperationDefinition\"></type>\n" + //
                "            <profile value=\"http://hl7.org/fhir/StructureDefinition/OperationDefinition\"></profile>\n"
                + //
                "            <interaction>\n" + //
                "                <code value=\"read\"></code>\n" + //
                "            </interaction>\n" + //
                "        </resource>\n" + //
                "        <resource>\n" + //
                "            <type value=\"StructureDefinition\"></type>\n" + //
                "            <profile value=\"http://hl7.org/fhir/StructureDefinition/StructureDefinition\"></profile>\n"
                + //
                "            <interaction>\n" + //
                "                <code value=\"read\"></code>\n" + //
                "            </interaction>\n" + //
                "            <interaction>\n" + //
                "                <code value=\"search-type\"></code>\n" + //
                "            </interaction>\n" + //
                "        </resource>\n" + //
                "        <operation>\n" + //
                "            <name value=\"validate\"></name>\n" + //
                "            <definition value=" + operationDefinitionBaseUrl
                + "/OperationDefinition/Bundle--validate\"></definition>\n"
                + //
                "        </operation>\n" + //
                "    </rest>\n" + //
                "</CapabilityStatement>";
    }

    public String getDiagnostics(String sessionId) {
        return FHIRBundleValidator.getInstance().diagnosticsOperation(sessionId);
    }

    public String validateFhirResourceData(String jsonData, String qeIdentifier, String validationEngine, String sessionId) {
        return FHIRBundleValidator.getInstance().validateFhirResource(jsonData, qeIdentifier, sessionId, validationEngine);
    }

    @Async
    public String validateBundleAndSave(String jsonData, String qeIdentifier, String apiUrl, String validationEngine, String sessionId) {
        // POST
        // https://40lafnwsw7.execute-api.us-east-1.amazonaws.com/dev?processingAgent=QE
        // Make the POST request asynchronously

        // Validate process
        FHIRBundleValidator.getInstance().validateFhirResource(jsonData, qeIdentifier, sessionId, validationEngine);

        // Prepare Target API URI
        String targetApiUrl = null;
        if (apiUrl != null && !apiUrl.isEmpty()) {
            targetApiUrl = apiUrl;
            this.webClient = WebClient.builder()
                    .baseUrl(apiUrl) // Set the base URL
                    .build();
        } else {
            targetApiUrl = Globals.getProverty("shinnyDataLakeApiUri");
        }
        String host = null, path = null;
        try {
            URL url = new URL(targetApiUrl);
            host = url.getHost();
            path = url.getPath();
        } catch (MalformedURLException e) {
            log.error("Exception in parsing shinnyDataLakeApiUri: ", e);
        }

        OrchestrationSession session = FHIRBundleValidator.getInstance().findSessionByKey(sessionId);
        session.setShinnyDataLakeSubmissionStatus(ShinnyDataLakeSubmissionStatus.STARTED);
        session.setShinnyDataLakeSubmissionStartTime(System.currentTimeMillis());
        // Invoke the API URL
        webClient.post()
                .uri(path + "?processingAgent=" + qeIdentifier)
                .body(BodyInserters.fromValue(jsonData))
                .retrieve()
                .bodyToMono(String.class)
                .subscribe(response -> {
                    // TODO: Process the response here, and save to db.
                    session.setShinnyDataLakeSubmissionStatus(ShinnyDataLakeSubmissionStatus.FINISHED);
                    session.setShinnyDataLakeSubmissionEndTime(System.currentTimeMillis());
                    session.httpRequestResponse.setResponseFhirAPIDetails(response);
                }, (Throwable error) -> { // Explicitly specify the type Throwable

                    session.setShinnyDataLakeSubmissionStatus(ShinnyDataLakeSubmissionStatus.ASYNC_FAILED);
                    session.setShinnyDataLakeSubmissionEndTime(System.currentTimeMillis());
                    if (error instanceof WebClientResponseException responseException) {
                        log.error("Exception from shinnyDataLakeApiUri: ", responseException);
                        // TODO: Process the response here, and save to db.
                        if (responseException.getStatusCode() == HttpStatus.FORBIDDEN) {
                            // Handle 403 Forbidden err
                            session.getShinnyDataLakeSubmissionData().put(sessionId, responseException.getMessage());
                        } else if (responseException.getStatusCode() == HttpStatus.UNAUTHORIZED) {
                            // Handle 403 Forbidden error
                            session.getShinnyDataLakeSubmissionData().put(sessionId, responseException.getMessage());
                        } else {
                            // Handle other types of WebClientResponseException
                            session.getShinnyDataLakeSubmissionData().put(sessionId, responseException.getMessage());
                        }
                    } else {
                        // Handle other types of exceptions
                        session.getShinnyDataLakeSubmissionData().put(sessionId, error.getMessage());
                    }
                });

                session.setShinnyDataLakeSubmissionStatus(ShinnyDataLakeSubmissionStatus.ASYNC_IN_PROGRESS);
        return "API invoked";
    }

    public String adminValidate(String jsonData, String qeIdentifier, String validationEngine) {
        return FHIRBundleValidator.getInstance().adminValidate(jsonData, qeIdentifier, validationEngine);
    }
}