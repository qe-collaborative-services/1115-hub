package org.techbd.service.http;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;

import org.springframework.stereotype.Service;
import org.techbd.hrsn.assurance.FHIRBundleValidator;

@Service
public class HapiFhirService {

    // @Autowired
    // private FHIRBundleValidator validator;

    public String getMetadata() {
        String metadata = null;
        try {
            metadata = new String(
                    Files.readAllBytes(Paths.get(getClass().getResource("fhir-service-metadata.xml").toURI())),
                    StandardCharsets.UTF_8);
        } catch (Exception e) {
            System.out.println("Error");
            e.printStackTrace();
        }
        return metadata;
    }

    public String getDiagnostics(String sessionId) {
        return FHIRBundleValidator.getInstance().diagnosticsOperation(sessionId);
    }

    public String validateFhirResourceData(String jsonData, String qeIdentifier) {
        return FHIRBundleValidator.getInstance().validateFhirResource(jsonData, qeIdentifier);
    }

    public String adminValidate(String jsonData, String qeIdentifier) {
        return FHIRBundleValidator.getInstance().adminValidate(jsonData, qeIdentifier);
    }
}
