package org.techbd.hrsn.assurance;

import java.io.InputStream;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
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

    public static String formatInstant(Instant instant) {
        instant = instant.truncatedTo(ChronoUnit.MICROS);

        // Convert the Instant to ZonedDateTime in the system default time zone
        ZonedDateTime zonedDateTime = instant.atZone(ZoneId.systemDefault());

        // Create a formatter for the desired format
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSSSSS");

        // Format the ZonedDateTime and return the result
        return zonedDateTime.format(formatter);
    }
}
