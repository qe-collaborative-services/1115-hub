package org.techbd;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import ca.uhn.fhir.context.FhirContext;

import org.hl7.fhir.instance.model.api.IBaseResource;
import ca.uhn.fhir.parser.StrictErrorHandler;
import org.hl7.fhir.r4.model.OperationOutcome;
import ca.uhn.fhir.validation.ValidationResult;
import ca.uhn.fhir.validation.FhirValidator;
import ca.uhn.fhir.validation.ValidationOptions;

import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Date;

import ca.uhn.fhir.parser.IParser;

class OrchestrationSessionHelpers {
    // json payload,
    /*
     * public JsonObject toJson() {
     * //
     * return null;
     * }
     */
    public static JsonObject jsonStringToJsonObject(String jsonString) {
        Gson gson = new Gson();
        return gson.fromJson(jsonString, JsonObject.class);
    }

    // Convert JsonObject to JSON string
    public static String jsonObjectToJsonString(JsonObject jsonObject) {
        Gson gson = new Gson();
        return gson.toJson(jsonObject);
    }

    public static String getCurrentTimestamp() {
        Instant currentTimestamp = Instant.now();
        DateTimeFormatter formatter = DateTimeFormatter.ISO_INSTANT;
        return formatter.format(currentTimestamp);
    }
}

class OrchestrationSessionEntryBundle {

    private IParser parser;
    private IBaseResource resource;
    private ValidationResult result; // TODO : store in JSON
    private OperationOutcome operationOutcome; // TODO: store in JSON
    private String payload;
    private FhirValidator validator;
    private ValidationOptions options;
    private ArrayList<Exception> exceptions; // TODO: store in JSON

    public OrchestrationSessionEntryBundle(String payload, IParser parser, FhirValidator validator,
            ValidationOptions options) {
        this.payload = payload;
        this.parser = parser;
        this.validator = validator;
        this.options = options;
        this.exceptions = new ArrayList<>();
    }

    public JsonObject toJsonObject() {
        JsonObject jsonObject = new JsonObject();

        // Add result to JSON
        if (result != null) {
            jsonObject.add("result", resultToJson());
        }

        // Add operationOutcome to JSON
        if (operationOutcome != null) {
            jsonObject.add("operationOutcome", operationOutcomeToJson());
        }

        // Add exceptions to JSON
        if (exceptions != null && !exceptions.isEmpty()) {
            JsonArray exceptionsArray = new JsonArray();
            for (Exception exception : exceptions) {
                exceptionsArray.add(exception.getMessage());
            }
            jsonObject.add("exceptions", exceptionsArray);
        }

        return jsonObject;
    }

    public String toJson() {
        return OrchestrationSessionHelpers.jsonObjectToJsonString(this.toJsonObject());

    }

    private JsonObject resultToJson() {
        JsonObject json = new JsonObject();
        // Customize the conversion of ValidationResult to JSON based on your
        // requirements
        // For example:
        json.addProperty("isSuccessful", this.result.isSuccessful());
        // Add more properties as needed
        return json;
    }

    // Helper method to convert OperationOutcome to JSON
    private JsonObject operationOutcomeToJson() {
        JsonObject json = new JsonObject();
        // json.addProperty("outcome", this.operationOutcome);
        return json;
    }

    public OperationOutcome getOperationOutcome() {
        return operationOutcome;
    }

    public boolean validate() {
        // Perform bundle validation logic
        // Create OrchestrationEntry instances for each validation outcome
        System.out.println("validateBundle : ");

        try {
            resource = parser.parseResource(payload);
            // Validate the resource with the specified profile
            this.result = validator.validateWithResult(resource, this.options);
        } catch (Exception e) {
            exceptions.add(e);
            return false;
        }

        this.operationOutcome = (OperationOutcome) result.toOperationOutcome();

        return true;
    }

}

public class OrchestrationSession {
    private String orchSessionId; // TODO : store in JSON
    private String deviceId; // TODO : store in JSON
    private String version; // TODO : store in JSON

    private String qeIdentifier; // TODO : store in JSON
    private Date orchStartedAt = new Date(); // TODO : store in JSON
    private Date orchFinishedAt; // TODO : store in JSON
    private FhirContext ctx;
    private IParser parser; // Initialize the parser in constructor
    public ArrayList<OrchestrationSessionEntryBundle> entries = new ArrayList<>();

    // should be completly independent of hhtp
    public OrchestrationSession(String qeIdentifier, FhirContext ctx, String orchSessionId, String deviceId,
            String version) {
        this.qeIdentifier = qeIdentifier;
        this.ctx = ctx;
        this.orchSessionId = orchSessionId;
        this.deviceId = deviceId;
        this.version = version;
        this.parser = ctx.newJsonParser(); // Updated code
        this.parser.setParserErrorHandler(new StrictErrorHandler());
    }

    public JsonObject toJsonObject() {
        // TODO: Date orchFinishedAt
        orchFinishedAt = new Date();
        JsonObject jsonObject = new JsonObject();
        jsonObject.addProperty("orchSessionId", orchSessionId.toString());
        jsonObject.addProperty("deviceId", deviceId);
        jsonObject.addProperty("version", version);
        jsonObject.addProperty("orchStartedAt", orchStartedAt.toString());
        for (OrchestrationSessionEntryBundle entry : entries) {
            jsonObject.addProperty("entries", entry.toJson());
        }
        jsonObject.addProperty("orchFinishedAt", orchFinishedAt != null ? orchFinishedAt.toString() : null);
        return jsonObject;
    }

    public String toJson() {
        return OrchestrationSessionHelpers.jsonObjectToJsonString(this.toJsonObject());

    }

    public String getOrchSessionId() {
        return orchSessionId;
    }

    public String getDeviceId() {
        return deviceId;
    }

    public String getVersion() {
        return version;
    }

    public Date getOrchStartedAt() {
        return orchStartedAt;
    }

    public Date getOrchFinishedAt() {
        return orchFinishedAt;
    }

    public void validateBundle(String payload, String profileUrl) {
        // Perform bundle validation logic
        // Create OrchestrationEntry instances for each validation outcome

        // Create a validator
        FhirValidator validator = ctx.newValidator();

        // Create ValidationOptions and specify the profile
        ValidationOptions options = new ValidationOptions();
        options.addProfile(profileUrl);
        // Create an OrchestrationEntry instance to store the validation outcome
        OrchestrationSessionEntryBundle entry = new OrchestrationSessionEntryBundle(payload, this.parser, validator,
                options);
        entry.validate();
        entries.add(entry);

        System.out.println(entry);

    }

    /*
     * public void createBundle(String payload, String profileUri) {
     * // Parse the FHIR JSON payload into a Bundle resource
     * Bundle bundle = parser.parseResource(Bundle.class, payload);
     * 
     * // Optionally, you can validate the Bundle against a profile
     * if (profileUri != null && !profileUri.isEmpty()) {
     * FhirValidator validator = ctx.newValidator();
     * ValidationResult result = validator.validateWithResult(bundle,
     * new ValidationOptions().addProfile(profileUri));
     * if (!result.isSuccessful()) {
     * System.out.println("Validation against profile failed.");
     * return;
     * }
     * }
     * 
     * // Serialize the Bundle back to JSON
     * String serializedBundle = parser.encodeResourceToString(bundle);
     * 
     * // Print the serialized JSON representation of the Bundle
     * System.out.println(serializedBundle);
     * }
     */

}
