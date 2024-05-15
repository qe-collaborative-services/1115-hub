package org.techbd.service.http;

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
        return fhirService.getDiagnostics(sessionId);
    }

    @GetMapping("/admin/diagnostics")
    public String getAdminDiagnostics(
            @RequestHeader("TECH_BD_FHIR_SERVICE_QE_IDENTIFIER") String qeIdentifier) {
        return fhirService.getDiagnostics(null);
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
     * @param qeIdentifier This value is from the
     *                     TECH_BD_FHIR_SERVICE_SHINNY_DATALAKE_API_URL
     *                     header
     *                     This header value must be like
     *                     https://40lafnwsw7.execute-api.us-east-1.amazonaws.com/dev?processingAgent=
     * @return The JSON response
     */
    @PostMapping("/Bundle/")
    public String validateBundleAndSave(@RequestBody String qeValue,
            @RequestParam("qe") String qeIdentifier,
            @RequestHeader(name = "TECH_BD_FHIR_SERVICE_SHINNY_DATALAKE_API_URL", required = false) String apiUrl) {
        return fhirService.validateBundleAndSave(qeValue, qeIdentifier, apiUrl);
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