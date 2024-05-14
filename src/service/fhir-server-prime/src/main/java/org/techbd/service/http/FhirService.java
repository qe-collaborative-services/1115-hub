package org.techbd.service.http;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.techbd.hrsn.assurance.FHIRBundleValidator;

import java.net.MalformedURLException;
import java.net.URL;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class FhirService {
    private WebClient webClient;

    @Autowired
    public FhirService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl(FHIRBundleValidator.getInstance().getProverty("shinnyDataLakeApiUri"))
                .build();
    }

    public String getMetadata() {
        String version = FHIRBundleValidator.getInstance().getVersionFromProperties();

        ZonedDateTime currentTime = ZonedDateTime.now(ZoneId.of("UTC"));
        // Format the time in the desired format
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm z");
        String curTime = currentTime.format(formatter);
        String fhirServerUrl = FHIRBundleValidator.getInstance().getProverty("fhirServerUrl");
        String operationDefinitionBaseUrl = FHIRBundleValidator.getInstance().getProverty("operationDefinitionBaseUrl");

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

    public String validateFhirResourceData(String jsonData, String qeIdentifier) {
        return FHIRBundleValidator.getInstance().validateFhirResource(jsonData, qeIdentifier);
    }

    @Async
    public String validateBundleAndSave(String jsonData, String qeIdentifier, String apiUrl) {
        // POST
        // https://40lafnwsw7.execute-api.us-east-1.amazonaws.com/dev?processingAgent=QE
        // Make the POST request asynchronously

        // Validate process
        FHIRBundleValidator.getInstance().validateFhirResource(jsonData, qeIdentifier);

        // Prepare Target API URI
        String targetApiUrl = null;
        if (apiUrl != null && !apiUrl.isEmpty()) {
            targetApiUrl = apiUrl;
            this.webClient = WebClient.builder()
                    .baseUrl(apiUrl) // Set the base URL
                    .build();
        } else {
            targetApiUrl = FHIRBundleValidator.getInstance().getProverty("shinnyDataLakeApiUri");
        }
        String host = null, path = null;
        try {
            URL url = new URL(targetApiUrl);
            host = url.getHost();
            path = url.getPath();
        } catch (MalformedURLException e) {
            e.printStackTrace();
        }

        // Invoke the API URL
        webClient.post()
                .uri(path + "=" + qeIdentifier)
                .body(BodyInserters.fromValue(jsonData))
                .retrieve()
                .bodyToMono(String.class)
                .subscribe(response -> {
                    // TODO: Process the response here, and save to db.
                }, (Throwable error) -> { // Explicitly specify the type Throwable
                    if (error instanceof WebClientResponseException) {
                        // TODO: Process the response here, and save to db.
                        WebClientResponseException responseException = (WebClientResponseException) error;
                        if (responseException.getStatusCode() == HttpStatus.FORBIDDEN) {
                            // Handle 403 Forbidden err
                        } else if (responseException.getStatusCode() == HttpStatus.UNAUTHORIZED) {
                            // Handle 403 Forbidden error
                        } else {
                            // Handle other types of WebClientResponseException
                        }
                    } else {
                        // Handle other types of exceptions
                    }
                });
        return "API invoked";
    }

    public String adminValidate(String jsonData, String qeIdentifier) {
        return FHIRBundleValidator.getInstance().adminValidate(jsonData, qeIdentifier);
    }
}