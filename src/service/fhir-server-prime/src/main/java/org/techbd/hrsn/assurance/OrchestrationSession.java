package org.techbd.hrsn.assurance;

import ca.uhn.fhir.context.FhirContext;
import ca.uhn.fhir.parser.IParser;
import ca.uhn.fhir.parser.StrictErrorHandler;
import ca.uhn.fhir.validation.FhirValidator;
import ca.uhn.fhir.validation.ValidationOptions;
import ca.uhn.fhir.validation.ValidationResult;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import org.hl7.fhir.instance.model.api.IBaseResource;
import org.hl7.fhir.r4.model.OperationOutcome;
import org.techbd.hrsn.assurance.Globals.ShinnyDataLakeSubmissionStatus;
import org.techbd.hrsn.assurance.Globals.ValidationEngine;

import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

class OrchestrationSessionHelpers {

    public static JsonObject jsonStringToJsonObject(String jsonString) {
        Gson gson = new Gson();
        return gson.fromJson(jsonString, JsonObject.class);
    }

    // Convert JsonObject to JSON string
    public static String jsonObjectToJsonString(JsonObject jsonObject) {
        Gson gson = new GsonBuilder().setPrettyPrinting().disableHtmlEscaping().create();
        return gson.toJson(jsonObject);
    }

    public static String getCurrentTimestamp() {
        Instant currentTimestamp = Instant.now();
        DateTimeFormatter formatter = DateTimeFormatter.ISO_INSTANT;
        return formatter.format(currentTimestamp);
    }
}

interface Bundleable {
    public String toJson();
}

class BaseBundle {
    protected String payload;
    protected ArrayList<Exception> exceptions; // TODO: store in JSON
    protected ValidationEngine validationEngine;

    protected ArrayList<Exception> getExceptions() {
        return exceptions;
    }

    protected ValidationEngine getValidationEngine() {
        return validationEngine;
    }
}

class OrchestrationSessionHapiValidationEngineEntryBundle extends BaseBundle implements Bundleable {

    private final IParser parser;
    private final FhirValidator validator;
    private final ValidationOptions options;
    private IBaseResource resource;
    private ValidationResult result; // TODO : store in JSON
    private OperationOutcome operationOutcome; // TODO: store in JSON

    public OrchestrationSessionHapiValidationEngineEntryBundle(String payload, IParser parser, FhirValidator validator,
            ValidationOptions options) {
        this.payload = payload;
        this.parser = parser;
        this.validator = validator;
        this.options = options;
        this.exceptions = new ArrayList<>();
        super.validationEngine = ValidationEngine.HAPI;
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
        String operaionOutcomeResult = parser.encodeResourceToString(this.operationOutcome);
        JsonObject json = new JsonObject();
        Gson gson = new Gson();
        json.add("outcome", gson.fromJson(operaionOutcomeResult, JsonObject.class));
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

        operationOutcome = (OperationOutcome) result.toOperationOutcome();

        return true;
    }

}

class OrchestrationSessionHl7ValidationEngineEntryBundle extends BaseBundle implements Bundleable {

    private final IParser parser;
    private final FhirValidator validator;
    private final ValidationOptions options;
    private IBaseResource resource;
    private ValidationResult result; // TODO : store in JSON
    private OperationOutcome operationOutcome; // TODO: store in JSON

    public OrchestrationSessionHl7ValidationEngineEntryBundle(String payload, IParser parser, FhirValidator validator,
            ValidationOptions options) {
        this.payload = payload;
        this.parser = parser;
        this.validator = validator;
        this.options = options;
        this.exceptions = new ArrayList<>();
        super.validationEngine = ValidationEngine.HAPI;
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
        String operaionOutcomeResult = parser.encodeResourceToString(this.operationOutcome);
        JsonObject json = new JsonObject();
        Gson gson = new Gson();
        json.add("outcome", gson.fromJson(operaionOutcomeResult, JsonObject.class));
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

        operationOutcome = (OperationOutcome) result.toOperationOutcome();

        return true;
    }

}

public class OrchestrationSession {
    private final String orchSessionId; // TODO : store in JSON
    private final String deviceId; // TODO : store in JSON
    private final String version; // TODO : store in JSON
    private final String qeIdentifier; // TODO : store in JSON
    private final Date orchStartedAt = new Date(); // TODO : store in JSON
    private final FhirContext ctx;
    private final IParser parser; // Initialize the parser in constructor
    public ArrayList<BaseBundle> entries = new ArrayList<>();
    private Date orchFinishedAt; // TODO : store in JSON
    private ShinnyDataLakeSubmissionStatus shinnyDataLakeSubmissionStatus; // Holds the session status
    private long shinnyDataLakeSubmissionStartTime; // Holds the async call start time in milli sec
    private long shinnyDataLakeSubmissionEndTime; // Holds the async call end time in milli sec
    private Map<String, String> shinnyDataLakeSubmissionData = new HashMap<>();
    private String validationEngine;

    public String getQeIdentifier() {
        return qeIdentifier;
    }

    public Map<String, String> getShinnyDataLakeSubmissionData() {
        return shinnyDataLakeSubmissionData;
    }

    public void setShinnyDataLakeSubmissionData(Map<String, String> shinnyDataLakeSubmissionData) {
        this.shinnyDataLakeSubmissionData = shinnyDataLakeSubmissionData;
    }

    public String findShinnyDataLakeSubmissionDataByKey(String key) {
        for (Map.Entry<String, String> entry : shinnyDataLakeSubmissionData.entrySet()) {
            if (entry.getKey().equals(key)) {
                return entry.getValue();
            }
        }
        // Key not found
        return null;
    }

    // should be completly independent of hhtp
    public OrchestrationSession(String qeIdentifier, FhirContext ctx, String orchSessionId, String deviceId,
            String version, String validationEngine) {
        this.qeIdentifier = qeIdentifier;
        this.ctx = ctx;
        this.orchSessionId = orchSessionId;
        this.deviceId = deviceId;
        this.version = version;
        this.parser = ctx.newJsonParser(); // Updated code
        this.parser.setParserErrorHandler(new StrictErrorHandler());
        this.validationEngine = validationEngine;
    }

    public ShinnyDataLakeSubmissionStatus getShinnyDataLakeSubmissionStatus() {
        return shinnyDataLakeSubmissionStatus;
    }

    public void setShinnyDataLakeSubmissionStatus(ShinnyDataLakeSubmissionStatus sessionStatus) {
        this.shinnyDataLakeSubmissionStatus = sessionStatus;
    }

    public long getShinnyDataLakeSubmissionStartTime() {
        return shinnyDataLakeSubmissionStartTime;
    }

    public void setShinnyDataLakeSubmissionStartTime(long asyncStartTime) {
        this.shinnyDataLakeSubmissionStartTime = asyncStartTime;
    }

    public long getShinnyDataLakeSubmissionEndTime() {
        return shinnyDataLakeSubmissionEndTime;
    }

    public void setShinnyDataLakeSubmissionEndTime(long asyncEndTime) {
        this.shinnyDataLakeSubmissionEndTime = asyncEndTime;
    }

    public JsonObject toJsonObject(boolean useFullData) {
        // TODO: Date orchFinishedAt
        orchFinishedAt = new Date();
        JsonObject jsonBaseObject = new JsonObject();
        jsonBaseObject.addProperty("resourceType", "OperationOutcome");
        JsonObject jsonObject = new JsonObject();
        jsonObject.addProperty("orchSessionId", orchSessionId);
        jsonObject.addProperty("deviceId", deviceId);
        jsonObject.addProperty("version", version);
        if(null != validationEngine) {
            jsonObject.addProperty("validationEngine", validationEngine);
        } else {
            System.out.println("validationEngine is null");
        }
        jsonObject.addProperty("orchStartedAt", orchStartedAt.toString());
        if (shinnyDataLakeSubmissionStatus == null) {
            jsonObject.addProperty("shinnyDataLakeSubmissionStatus", "");
        } else {
            jsonObject.addProperty("shinnyDataLakeSubmissionStatus", shinnyDataLakeSubmissionStatus.name());
        }
        jsonObject.addProperty("shinnyDataLakeSubmissionStartTime", shinnyDataLakeSubmissionStartTime);
        jsonObject.addProperty("shinnyDataLakeSubmissionEndTime", shinnyDataLakeSubmissionEndTime);
        jsonObject.addProperty("shinnyDataLakeSubmissionProcessTIme",
                shinnyDataLakeSubmissionEndTime - shinnyDataLakeSubmissionStartTime);

        if (useFullData) {
            // Create a JSON array to hold the entry objects
            JsonArray entriesArray = new JsonArray();
            for (BaseBundle entry : entries) {
                if(entry instanceof OrchestrationSessionHapiValidationEngineEntryBundle) {
                    OrchestrationSessionHapiValidationEngineEntryBundle bundle = (OrchestrationSessionHapiValidationEngineEntryBundle) entry;
                    JsonObject entryJson = bundle.toJsonObject();
                    entriesArray.add(entryJson);
                }
            }

            // Add the array of entry objects to the main JSON object
            jsonObject.add("entries", entriesArray);
        }
        jsonObject.addProperty("orchFinishedAt", orchFinishedAt != null ? orchFinishedAt.toString() : null);

        jsonBaseObject.add("techbdSession", jsonObject);
        return jsonBaseObject;
    }

    public String toJson() {
        return OrchestrationSessionHelpers.jsonObjectToJsonString(this.toJsonObject(true));

    }

    public String toJsonMinimal() {
        return OrchestrationSessionHelpers.jsonObjectToJsonString(this.toJsonObject(false));

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

    // TODO: Add enum parameter for validationEngine : HAPI (default), INFERNO, HL7
    public void validateBundle(String payload, String profileUrl, ValidationEngine ve) {
        this.validationEngine = ve.name();
        // Perform bundle validation logic
        // Create OrchestrationEntry instances for each validation outcome

        // Create a validator
        FhirValidator validator = ctx.newValidator();

        // Create ValidationOptions and specify the profile
        ValidationOptions options = new ValidationOptions();
        options.addProfile(profileUrl);
        // Create an OrchestrationEntry instance to store the validation outcome
        OrchestrationSessionHapiValidationEngineEntryBundle entry = new OrchestrationSessionHapiValidationEngineEntryBundle(payload, this.parser, validator,
                options);
        entry.validate();
        entries.add(entry);
    }
}