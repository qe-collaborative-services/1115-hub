package org.techbd.hrsn.assurance;

import ca.uhn.fhir.context.FhirContext;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;

import static org.junit.jupiter.api.Assertions.*;

import org.apache.commons.configuration.ConfigurationException;
import org.apache.commons.configuration.PropertiesConfiguration;

import java.io.IOException;
import java.net.InetAddress;
import java.net.URL;
import java.net.UnknownHostException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Scanner;

import org.techbd.hrsn.assurance.Globals.ValidationEngine;

class ValidationEnginesTest {
    public static String textFromURL(final String requestURL) throws IOException {
        try (final Scanner scanner = new Scanner(new URL(requestURL).openStream(), StandardCharsets.UTF_8.toString())) {
            scanner.useDelimiter("\\A");
            return scanner.hasNext() ? scanner.next() : "";
        }
    }

    public String fixtureContent(final String filename) throws IOException {
        return ValidationEnginesTest.textFromURL(
                "https://raw.githubusercontent.com/tech-by-design/docs.techbd.org/main/assurance/1115-waiver/ahc-hrsn/screening/regression-test-prime/fhir-service-prime/src/2024-05-16/"
                        + filename);
    }

    private static String qeIdentifier = "unspecified";
    private static String orchSessionId = "d1b1749a-dee4-470b-9232-29287dfe475b";
    private static String version = "latest-unitest";

    private OrchestrationSession session;
    private String shinnyDataLakeApiImpGuideProfileUri;
    private String deviceId;

    @BeforeEach
    void setUp() throws UnknownHostException {
        this.deviceId = InetAddress.getLocalHost().getHostName();

        FhirContext ctx = FhirContext.forR4();
        session = new OrchestrationSession(qeIdentifier, ctx, orchSessionId, deviceId, version);

        // Set up the profile URI and folder path for validation
        try {
            PropertiesConfiguration config = new PropertiesConfiguration("application.properties");
            shinnyDataLakeApiImpGuideProfileUri = config.getString("shinnyDataLakeApiImpGuideProfileUri");
        } catch (ConfigurationException e) {
            e.printStackTrace();
        }
        if (shinnyDataLakeApiImpGuideProfileUri == null) {
            shinnyDataLakeApiImpGuideProfileUri = "https://djq7jdt8kb490.cloudfront.net/1115/StructureDefinition-SHINNYBundleProfile.json";
        }
        assertNotNull(shinnyDataLakeApiImpGuideProfileUri);
    }

    @Test
    void testBundleShinnyHealtheconnectionsUnhappyPath() throws IOException {
        session.validateBundle(this.fixtureContent("fhir-fixture-shinny-healtheconnections-unhappy-path.json"),
                shinnyDataLakeApiImpGuideProfileUri, ValidationEngine.HAPI);
        assertFalse(session.entries.isEmpty());
    }

    @Test
    void testBundleShinnyHealtheconnectionsUnhappyPathIsValidSession() throws IOException {
        session.validateBundle(this.fixtureContent("fhir-fixture-shinny-healtheconnections-unhappy-path.json"),
                shinnyDataLakeApiImpGuideProfileUri, ValidationEngine.HAPI);

        assertFalse(session.entries.isEmpty());
        assertEquals(session.getOrchSessionId(), orchSessionId);
        assertEquals(session.getVersion(), version);
        assertEquals(session.getDeviceId(), deviceId);

        ArrayList<Exception> ex = session.entries.get(0).getExceptions();
        assertNotNull(ex);
    }

    @Test
    void testBundleShinnyHealtheconnectionsHappyPathCheckError() throws IOException {
        session.validateBundle(this.fixtureContent("fhir-fixture-shinny-impl-guide-sample.json"),
                shinnyDataLakeApiImpGuideProfileUri, ValidationEngine.HAPI);
        ArrayList<Exception> exceptions = session.entries.get(0).getExceptions();
        assertEquals(exceptions.size(), 0);
    }
}
