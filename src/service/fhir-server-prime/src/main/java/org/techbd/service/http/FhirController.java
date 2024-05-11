package org.techbd.service.http;

import ca.uhn.fhir.rest.api.MethodOutcome;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
public class FhirController {
    @Autowired
    private FhirService fhirService;

    @GetMapping("/metadata")
    public String getMetadata() {
        return fhirService.getMetadata();
    }

    @GetMapping("/admin/diagnostics/{sessionId}")
    public String getDiagnostics(@PathVariable String sessionId,
            @RequestHeader("TECH_BD_FHIR_SERVICE_QE_IDENTIFIER") String qeIdentifier) {
        System.out.println("qeIdentifier: " + qeIdentifier);
        return fhirService.getDiagnostics(sessionId);
    }

    /**
     * @param qeValue      The JSON input
     * @param qeIdentifier This value is from the TECH_BD_FHIR_SERVICE_QE_IDENTIFIER
     *                     header
     * @return The JSON response
     */
    @PostMapping("/Bundle/$validate")
    public String validateBundle(@RequestBody String qeValue,
            @RequestHeader("TECH_BD_FHIR_SERVICE_QE_IDENTIFIER") String qeIdentifier) {
        return fhirService.validateFhirResourceData(qeValue, qeIdentifier);
    }

    /**
     * @param qeValue      The JSON input
     * @param qeIdentifier This value is from the TECH_BD_FHIR_SERVICE_QE_IDENTIFIER
     *                     header
     * @return The HTML response
     */
    @PostMapping("/admin/validate")
    public String validateBundleAdmin(@RequestBody String qeValue,
            @RequestHeader("TECH_BD_FHIR_SERVICE_QE_IDENTIFIER") String qeIdentifier) {
        return fhirService.adminValidate(qeValue, qeIdentifier);
    }

}
