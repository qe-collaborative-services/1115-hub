
import ca.uhn.fhir.context.FhirContext;
import org.techbd.OrchestrationSession;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import static org.junit.jupiter.api.Assertions.*;

import org.apache.commons.configuration.ConfigurationException;
import org.apache.commons.configuration.PropertiesConfiguration;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;

class OrchestrationSessionTest {

    private OrchestrationSession session;
    private static String shinnyDataLakeApiImpGuideProfileUri;
    private static String fhirJsonFolderPath;

    @BeforeEach
    void setUp() {
        // Initialize the OrchestrationSession with required parameters
        String qeIdentifier = "healthelink";
        String orchSessionId = "TestSessionId";
        String deviceId = "TestDeviceId";
        String version = "0.20.0";
        FhirContext ctx = FhirContext.forR4();
        session = new OrchestrationSession(qeIdentifier,ctx, orchSessionId, deviceId, version);

        // Set up the profile URI and folder path for validation
        try {
            PropertiesConfiguration config = new PropertiesConfiguration("application.properties");
            shinnyDataLakeApiImpGuideProfileUri = config.getString("shinnyDataLakeApiImpGuideProfileUri");
            fhirJsonFolderPath = config.getString("fhirJsonFolderPath");
        } catch (ConfigurationException e) {
            e.printStackTrace();
        }
    }

    @Test
    void testBundleValidation() {
        assertNotNull(shinnyDataLakeApiImpGuideProfileUri);
        assertNotNull(fhirJsonFolderPath);

        // Get a list of files in the folder
        File folder = new File(fhirJsonFolderPath);
        File[] files = folder.listFiles();
        assertNotNull(files);

        // Iterate over each file and validate the bundle
        for (File file : files) {
            if (file.isFile() && file.getName().endsWith(".json")) {
                try {
                    System.out.println("Start processing " + file.getName());
                    String jsonBody = readFileContent(file);
                    session.validateBundle(jsonBody, shinnyDataLakeApiImpGuideProfileUri);
                    System.out.println("Finished processing " + file.getName());
                    // assertFalse(session.entries.isEmpty(), "Validation failed for file: " + file.getName());

                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }
        assertFalse(session.entries.isEmpty());
    }

    // Method to read file content
    private String readFileContent(File file) throws IOException {
        StringBuilder contentBuilder = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
            String line;
            while ((line = reader.readLine()) != null) {
                contentBuilder.append(line).append("\n");
            }
        }
        return contentBuilder.toString();
    }
}
