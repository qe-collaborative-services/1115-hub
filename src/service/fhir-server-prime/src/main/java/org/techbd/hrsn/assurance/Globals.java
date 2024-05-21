package org.techbd.hrsn.assurance;

import java.io.InputStream;
import java.util.Properties;

public class Globals {

    public enum ValidationEngine {
        HAPI,
        INFERNO,
        HL7_OFFICIAL
    }

    public enum ShinnyDataLakeSubmissionStatus {
        NOT_SUBMITTED,
        STARTED,
        ASYNC_IN_PROGRESS,
        ASYNC_FAILED,
        FINISHED
    }

        public static String getProverty(String key) {
        String propertyVal = ""; // Default value if reading from properties file fails

        try (InputStream input = FHIRBundleValidator.class.getClassLoader()
                .getResourceAsStream("application.properties")) {
            Properties prop = new Properties();
            prop.load(input);
            propertyVal = prop.getProperty(key);
        } catch (Exception e) {
        }
        return propertyVal;
    }
}
