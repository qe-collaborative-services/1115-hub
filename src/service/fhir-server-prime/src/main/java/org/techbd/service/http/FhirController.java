package org.techbd.service.http;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.techbd.hrsn.assurance.Globals;

import jakarta.servlet.http.HttpServletResponse;

import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.http.HttpStatus;

import org.commonmark.node.Node;
import org.commonmark.parser.Parser;
import org.commonmark.renderer.html.HtmlRenderer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
public class FhirController {
    @Autowired
    private FhirService fhirService;

    private final static Logger log = LoggerFactory.getLogger(FhirController.class);

    private final ResourceLoader resourceLoader;

    public FhirController(ResourceLoader resourceLoader) {
        this.resourceLoader = resourceLoader;
    }

    @GetMapping("/metadata")
    public String getMetadata() {
        return fhirService.getMetadata();
    }

    @GetMapping("/admin/diagnostics/{sessionId}")
    public String getDiagnostics(@PathVariable String sessionId,
            @RequestHeader(name = "TECH_BD_FHIR_SERVICE_QE_IDENTIFIER", required = false) String qeIdentifier) {
        return fhirService.getDiagnostics(sessionId);
    }

    @GetMapping("/admin/diagnostics")
    public String getAdminDiagnostics(
            /*@RequestHeader("TECH_BD_FHIR_SERVICE_QE_IDENTIFIER") String qeIdentifier*/) {
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
            @RequestHeader("TECH_BD_FHIR_SERVICE_QE_IDENTIFIER") String qeIdentifier,
            @RequestHeader(name = "TECH_BD_FHIR_SERVICE_VALIDATION_ENGINE", required = false) String validationEngine,
            @RequestAttribute("sessionId") String sessionId) {
        validationEngine = "HAPI";
        return fhirService.validateFhirResourceData(qeValue, qeIdentifier, validationEngine, sessionId);
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
            @RequestHeader(name = "TECH_BD_FHIR_SERVICE_SHINNY_DATALAKE_API_URL", required = false) String apiUrl,
            @RequestHeader(name = "TECH_BD_FHIR_SERVICE_VALIDATION_ENGINE", required = false) String validationEngine,
            @RequestAttribute("sessionId") String sessionId) {
        validationEngine = "HAPI";
        return fhirService.validateBundleAndSave(qeValue, qeIdentifier, apiUrl, validationEngine, sessionId);
    }

    /**
     * @param qeValue      The JSON input
     * @param qeIdentifier This value is from the TECH_BD_FHIR_SERVICE_QE_IDENTIFIER
     *                     header
     * @return The HTML response
     */
    @PostMapping("/admin/validate")
    public String validateBundleAdmin(@RequestBody String qeValue,
            @RequestHeader("TECH_BD_FHIR_SERVICE_QE_IDENTIFIER") String qeIdentifier,
            @RequestHeader(name = "TECH_BD_FHIR_SERVICE_VALIDATION_ENGINE", required = false) String validationEngine) {
        validationEngine = "HAPI";
        return fhirService.adminValidate(qeValue, qeIdentifier, validationEngine);
    }

    @GetMapping("/")
    public void home(HttpServletResponse response) throws IOException {
        String swaggerUrl = Globals.getProverty("springdoc.swagger-ui.path");
        response.sendRedirect(swaggerUrl);
    }
}