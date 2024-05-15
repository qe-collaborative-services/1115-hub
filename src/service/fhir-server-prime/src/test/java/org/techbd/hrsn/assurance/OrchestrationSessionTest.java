package org.techbd.hrsn.assurance;

import ca.uhn.fhir.context.FhirContext;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;

import static org.junit.jupiter.api.Assertions.*;

import org.apache.commons.configuration.ConfigurationException;
import org.apache.commons.configuration.PropertiesConfiguration;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.net.URISyntaxException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import org.techbd.hrsn.assurance.Globals.ValidationEngine;

class OrchestrationSessionTest {

    private OrchestrationSession session;
    private static String shinnyDataLakeApiImpGuideProfileUri;
    private static String fhirJsonFolderPath;

    // Initialize the OrchestrationSession with required parameters
    private static String qeIdentifier = "healthelink";
    private static String orchSessionId = "TestSessionId";
    private static String deviceId = "TestDeviceId";
    private static String version = "0.20.0";

    @BeforeEach
    void setUp() {

        FhirContext ctx = FhirContext.forR4();
        session = new OrchestrationSession(qeIdentifier, ctx, orchSessionId, deviceId, version);

        // Set up the profile URI and folder path for validation
        try {
            PropertiesConfiguration config = new PropertiesConfiguration("application.properties");
            shinnyDataLakeApiImpGuideProfileUri = config.getString("shinnyDataLakeApiImpGuideProfileUri");
            fhirJsonFolderPath = config.getString("fhirJsonFolderPath");
        } catch (ConfigurationException e) {
            e.printStackTrace();
        }
        if (shinnyDataLakeApiImpGuideProfileUri == null) {
            shinnyDataLakeApiImpGuideProfileUri = "https://djq7jdt8kb490.cloudfront.net/1115/StructureDefinition-SHINNYBundleProfile.json";
        }
        assertNotNull(shinnyDataLakeApiImpGuideProfileUri);
    }

    @Test
    void testBundleShinnyHealtheconnectionsUnhappyPath() {
        String jsonBody;
        try {
            jsonBody = new String(Files.readAllBytes(Paths.get(getClass().getResource("fhir-fixture-shinny-healtheconnections-unhappy-path.json").toURI())), StandardCharsets.UTF_8);
            session.validateBundle(jsonBody, shinnyDataLakeApiImpGuideProfileUri, ValidationEngine.HAPI);
        } catch (IOException | URISyntaxException e) {
            e.printStackTrace();
        }

        assertFalse(session.entries.isEmpty());
    }

    @Test
    void testBundleShinnyHealtheconnectionsUnhappyPathIsValidSession() {
        String jsonBody;
        try {
            jsonBody = new String(Files.readAllBytes(Paths.get(getClass().getResource("fhir-fixture-shinny-healtheconnections-unhappy-path.json").toURI())), StandardCharsets.UTF_8);
            //session.entries.get(0).getOperationOutcome()
            session.validateBundle(jsonBody, shinnyDataLakeApiImpGuideProfileUri, ValidationEngine.HAPI);
        } catch (IOException | URISyntaxException e) {
            e.printStackTrace();
        }

        assertEquals(session.getOrchSessionId(), orchSessionId);
        assertEquals(session.getVersion(), version);
        assertEquals(session.getDeviceId(), deviceId);
    }

    @Test
    void testBundleShinnyHealtheconnectionsUnhappyPathCheckError() {
        String jsonBody;
        try {
            jsonBody = new String(Files.readAllBytes(Paths.get(getClass().getResource("fhir-fixture-shinny-healtheconnections-unhappy-path.json").toURI())), StandardCharsets.UTF_8);
            //session.entries.get(0).getOperationOutcome()
            session.validateBundle(jsonBody, shinnyDataLakeApiImpGuideProfileUri, ValidationEngine.HAPI);
        } catch (IOException | URISyntaxException e) {
            e.printStackTrace();
        }
        ArrayList<Exception> ex = session.entries.get(0).getExceptions();
        assertNotNull(ex);
    }

    @Test
    void testBundleShinnyHealtheconnectionsHappyPathCheckError() {
        String jsonBody;
        try {
            jsonBody = new String(Files.readAllBytes(Paths.get(getClass().getResource("fhir-fixture-shinny-impl-guide-sample.json").toURI())), StandardCharsets.UTF_8);
            //session.entries.get(0).getOperationOutcome()
            session.validateBundle(jsonBody, shinnyDataLakeApiImpGuideProfileUri, ValidationEngine.HAPI);
        } catch (IOException | URISyntaxException e) {
            e.printStackTrace();
        }
        ArrayList<Exception> exceptions = session.entries.get(0).getExceptions();
        assertEquals(exceptions.size(), 0);
    }
}
