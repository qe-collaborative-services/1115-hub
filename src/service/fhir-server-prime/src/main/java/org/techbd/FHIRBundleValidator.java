package org.techbd;

import ca.uhn.fhir.context.FhirContext;
import ca.uhn.fhir.parser.IParser;
import ca.uhn.fhir.rest.annotation.Search;
import ca.uhn.fhir.rest.annotation.Validate;
import ca.uhn.fhir.rest.param.StringParam;
import ca.uhn.fhir.rest.server.IResourceProvider;
import ca.uhn.fhir.rest.server.exceptions.UnprocessableEntityException;

import org.hl7.fhir.r4.model.Patient;
import org.hl7.fhir.r4.model.Patient.PatientCommunicationComponent;
import org.hl7.fhir.r4.model.Extension;
import org.hl7.fhir.r4.model.Address;
import org.hl7.fhir.r4.model.Bundle;
import org.hl7.fhir.r4.model.Bundle.BundleEntryComponent;
import org.hl7.fhir.r4.model.CodeType;
import org.hl7.fhir.r4.model.CodeableConcept;
import org.hl7.fhir.r4.model.Coding;
import org.hl7.fhir.r4.model.Encounter;
import org.hl7.fhir.r4.model.HumanName;
import org.hl7.fhir.r4.model.IdType;
import org.hl7.fhir.r4.model.Identifier;
import org.hl7.fhir.r4.model.Observation;
import org.apache.commons.configuration.ConfigurationException;
import org.apache.commons.configuration.PropertiesConfiguration;
import org.hl7.fhir.r4.model.Consent;
import org.hl7.fhir.r4.model.DateTimeType;
import org.hl7.fhir.instance.model.api.IBaseResource;
import org.hl7.fhir.instance.model.api.IIdType;

import ca.uhn.fhir.rest.annotation.Create;
import ca.uhn.fhir.rest.annotation.IdParam;
import ca.uhn.fhir.rest.annotation.OptionalParam;
import ca.uhn.fhir.rest.annotation.RequiredParam;
import ca.uhn.fhir.rest.annotation.ResourceParam;
import org.hl7.fhir.r4.model.OperationOutcome;
import org.hl7.fhir.r4.model.Organization;
import org.springframework.web.bind.annotation.RestController;
import ca.uhn.fhir.rest.api.MethodOutcome;
import ca.uhn.fhir.rest.api.ValidationModeEnum;

import ca.uhn.fhir.parser.LenientErrorHandler;
import ca.uhn.fhir.parser.StrictErrorHandler;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Statement;
import java.time.Instant;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.UUID;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
import com.google.gson.JsonObject; // Import JsonObject from Gson library

@RestController
public class FHIRBundleValidator implements IResourceProvider {

    private static String folderPath;
    private static String profile;
    // private static String zipFileName;
    static FhirContext context = FhirContext.forR4();
    private static Connection conn;

    /**
     * Constructor
     */
    public FHIRBundleValidator() {
        PropertiesConfiguration config = new PropertiesConfiguration();
        try {
            config.load("application.properties");
        } catch (ConfigurationException e) {
            e.printStackTrace();
        }
        // Load values fom application.properties
        folderPath = config.getString("folderPath");
        profile = config.getString("profile");
        // zipFileName = config.getString("zipFileName");
        try {
            conn = DatabaseConnector.connect();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    @Override
    public Class<? extends IBaseResource> getResourceType() {
        return Bundle.class;
    }

    @Search
    public List<Bundle> searchByName(@RequiredParam(name = Patient.SP_NAME) StringParam name) {
        List<Bundle> results = new ArrayList<>();
        return results;
    }

    @SuppressWarnings("deprecation")
    @Create
    public MethodOutcome createBundle(@ResourceParam Bundle theBundle, @ResourceParam String jsonBody,
            @IdParam(optional = true) IIdType id,
            @OptionalParam(name = "x") String xValue) {

        // Accessing x parameter from URL
        if (xValue != null) {
            // Process x parameter if needed
            System.out.println("Value of x parameter: " + xValue);
        }

        // Initialize session variables
        UUID sessionId = UUID.randomUUID();
        Instant sessionStartTime = Instant.now();
        Instant sessionEndTime = Instant.now();

        // Set up FHIR parser with LenientErrorHandler
        FhirContext ctx = FhirContext.forR4();
        IParser parser = ctx.newJsonParser();
        parser.setParserErrorHandler(new LenientErrorHandler());
        parser.setParserErrorHandler(new StrictErrorHandler());

        // Parse the JSON text into a FHIR resource
        IBaseResource resource = parser.parseResource(jsonBody);

        // Validate the bundle before creating resources
        MethodOutcome validationOutcome = validateBundle((Bundle) resource, ValidationModeEnum.CREATE, profile);
        OperationOutcome operationOutcome = (OperationOutcome) validationOutcome.getOperationOutcome();

        // If validation fails, return the OperationOutcome
        if (operationOutcome != null && !operationOutcome.getIssue().isEmpty()) {
            // Set session end time before throwing exception
            sessionEndTime = Instant.now();
            throw new UnprocessableEntityException(operationOutcome);
        }

        // If the bundle does not have an identifier, throw an exceptionyour_version
        if (theBundle.getIdentifier().getValue().isEmpty()) {
            // Set session end time before throwing exception
            sessionEndTime = Instant.now();
            throw new UnprocessableEntityException(Msg.code(636) + "No identifier supplied");
        }

        // Pass the bundle to create CSV files
        createAhcHrsnEltArtifacts(theBundle, false);

        // Set session end time
        sessionEndTime = Instant.now();

        // Prepare the MethodOutcome for the created bundle
        MethodOutcome retVal = new MethodOutcome();
        OperationOutcome successOutcome = new OperationOutcome();
        successOutcome.addIssue().setDiagnostics("Bundle creation successful");
        // retVal.setOperationOutcome(successOutcome);

        /*
         * // Create JSON structure for session information
         * JsonObject sessionJson = new JsonObject();
         * sessionJson.addProperty("sessionId", sessionId.toString());
         * sessionJson.addProperty("sessionStartTime", sessionStartTime.toString());
         * sessionJson.addProperty("profile", profile);
         * sessionJson.addProperty("version", "4.0");
         * sessionJson.addProperty("sessionEndTime", sessionEndTime.toString());
         * System.out.println(sessionJson);
         * 
         * // Add more child elements as needed
         * System.out.println("successOutcome a) : " + successOutcome);
         * // Convert sessionJson to a string and set it in the OperationOutcome
         * successOutcome.addChild(sessionJson.toString());
         * System.out.println("successOutcome b) : " + successOutcome);
         * return retVal.setOperationOutcome(successOutcome);
         */
        return retVal;
    }

    private static void createAhcHrsnEltArtifacts(Bundle bundle, boolean zipFlag) {
        // Create CSV files for each type of data
        createScreeningCsv(bundle);
        createQeAdminDataCsv(bundle);
        createDemographicDataCsv(bundle);

        // insertScreeningData(bundle);
        insertScreeningJson(bundle, conn);

    }

    private static void createScreeningCsv(Bundle bundle) {
        // Initialize CSV builder
        StringBuilder csvBuilder = new StringBuilder();

        // Header row for SCREENING.csv
        csvBuilder.append("PAT_MRN_ID|FACILITY_ID|ENCOUNTER_ID|ENCOUNTER_CLASS_CODE|ENCOUNTER_CLASS_CODE_DESCRIPTION|" +
                "ENCOUNTER_CLASS_CODE_SYSTEM|ENCOUNTER_STATUS_CODE|ENCOUNTER_STATUS_CODE_DESCRIPTION|" +
                "ENCOUNTER_STATUS_CODE_SYSTEM|ENCOUNTER_TYPE_CODE|ENCOUNTER_TYPE_CODE_DESCRIPTION|" +
                "ENCOUNTER_TYPE_CODE_SYSTEM|SCREENING_STATUS_CODE|SCREENING_STATUS_CODE_DESCRIPTION|" +
                "SCREENING_STATUS_CODE_SYSTEM|SCREENING_CODE|SCREENING_CODE_DESCRIPTION|SCREENING_CODE_SYSTEM_NAME|" +
                "RECORDED_TIME|QUESTION_CODE|QUESTION_CODE_DESCRIPTION|QUESTION_CODE_SYSTEM_NAME|UCUM_UNITS|" +
                "SDOH_DOMAIN|PARENT_QUESTION_CODE|ANSWER_CODE|ANSWER_CODE_DESCRIPTION|ANSWER_CODE_SYSTEM_NAME|POTENTIAL_NEED_INDICATED\n");

        String patMrnId = "";
        String facilityId = "";
        String encounterId = "";
        String encounterClassCode = "";
        String encounterClassCodeDescription = "";
        String encounterClassCodeSystem = "";
        String encounterStatusCode = "";
        String encounterStatusCodeDescription = "";
        String encounterStatusCodeSystem = "";
        String encounterTypeCode = "";
        String encounterTypeCodeDescription = "";
        String encounterTypeCodeSystem = "";
        String screeningStatusCode = "";
        String screeningStatusCodeDescription = "";
        String screeningStatusCodeSystem = "";
        String screeningCode = "";
        String screeningCodeDescription = "";
        String screeningCodeSystemName = "";
        String recordedTime = "";
        String questionCode = "";
        String questionCodeDescription = "";
        String questionCodeSystemName = "";
        String ucumUnits = "";
        String sdohDomain = "";
        String parentQuestionCode = "";
        String answerCode = "";
        String answerCodeDescription = "";
        String answerCodeSystemName = "";
        String potentialNeedIndicated = "";

        // Iterate through bundle entries
        for (BundleEntryComponent entry : bundle.getEntry()) {
            if (entry.getResource() instanceof Patient) {
                Patient patient = (Patient) entry.getResource();
                // Extracting patient information
                if (patient.hasName() && !patient.getName().isEmpty()) {
                }
                List<Identifier> identifiers = patient.getIdentifier();
                for (Identifier identifier : identifiers) {
                    String system = identifier.getType().getCodingFirstRep().getCode();
                    String value = identifier.getValue();

                    if (system != null && value != null) {
                        if (system.equals("MR")) { // PAT MRN ID
                            patMrnId = value;
                        }
                    }
                }

            } else if (entry.getResource() instanceof Organization) {
                Organization organization = (Organization) entry.getResource();
                facilityId = organization.getId(); // Assuming id is the facility ID
            } else if (entry.getResource() instanceof Encounter) {
                Encounter encounter = (Encounter) entry.getResource();
                // Extracting encounter information
                encounterId = encounter.getId();
                if (encounter.hasClass_()) {
                    encounterClassCode = encounter.getClass_().getCode();
                    encounterClassCodeDescription = encounter.getClass_().getDisplay();
                    encounterClassCodeSystem = encounter.getClass_().getSystem();
                }
                if (encounter.hasStatus()) {
                    encounterStatusCode = encounter.getStatus().toCode();
                    encounterStatusCodeDescription = encounter.getStatus().getDisplay();
                    encounterStatusCodeSystem = "http://hl7.org/fhir/R4/valueset-encounter-status.html"; // Assuming a
                                                                                                         // default
                                                                                                         // value
                }
                if (!encounter.getType().isEmpty()) {
                    encounterTypeCode = encounter.getType().get(0).getCodingFirstRep().getCode();
                    encounterTypeCodeDescription = encounter.getType().get(0).getCodingFirstRep().getDisplay();
                    encounterTypeCodeSystem = encounter.getType().get(0).getCodingFirstRep().getSystem();
                }
            } else if (entry.getResource() instanceof Observation) {
                Observation observation = (Observation) entry.getResource();

                // Resetting observation-specific variables for each observation
                screeningStatusCode = "";
                screeningStatusCodeDescription = "";
                screeningStatusCodeSystem = "";
                screeningCode = "";
                screeningCodeDescription = "";
                screeningCodeSystemName = "";
                recordedTime = "";
                questionCode = "";
                questionCodeDescription = "";
                questionCodeSystemName = "";
                ucumUnits = "";
                sdohDomain = "";
                parentQuestionCode = "";
                answerCode = "";
                answerCodeDescription = "";
                answerCodeSystemName = "";
                potentialNeedIndicated = "";

                // Extracting observation-specific information
                if (!observation.getInterpretation().isEmpty() && observation.getInterpretation().get(0).hasCoding()) {
                    Coding screeningStatusCoding = observation.getInterpretation().get(0).getCodingFirstRep();
                    screeningStatusCode = screeningStatusCoding.getCode();
                    screeningStatusCodeDescription = screeningStatusCoding.getDisplay();
                    screeningStatusCodeSystem = screeningStatusCoding.getSystem();
                }
                if (observation.hasCode() && observation.getCode().hasCoding()) {
                    Coding screeningCoding = observation.getCode().getCodingFirstRep();
                    screeningCode = screeningCoding.getCode();
                    screeningCodeDescription = screeningCoding.getDisplay();
                    screeningCodeSystemName = screeningCoding.getSystem();
                }
                if (observation.hasEffectiveDateTimeType()) {
                    DateTimeType recordedDateTimeType = observation.getEffectiveDateTimeType();
                    recordedTime = recordedDateTimeType.getValueAsString();
                }
                if (observation.hasCode() && observation.getCode().hasCoding()) {
                    Coding questionCoding = observation.getCode().getCodingFirstRep();
                    questionCode = questionCoding.getCode();
                    questionCodeDescription = questionCoding.getDisplay();
                    questionCodeSystemName = questionCoding.getSystem();
                }
                if (observation.hasValueCodeableConcept()) {
                    CodeableConcept valueCodeableConcept = observation.getValueCodeableConcept();
                    for (Coding coding : valueCodeableConcept.getCoding()) {
                        ucumUnits = coding.getCode();
                        break; // Assuming there's only one coding
                    }
                }

                // TODO: the code is not equaling with the URL . Need to check
                for (Coding coding : observation.getCategoryFirstRep().getCoding()) {
                    if (coding.getSystem().equals(
                            "http://hl7.org/fhir/us/sdoh-clinicalcare/CodeSystem/SDOHCC-CodeSystemTemporaryCodes")) {
                        sdohDomain = coding.getSystem();
                        break;
                    }
                }

                parentQuestionCode = ""; // #TODO:

                // Extracting answer code, description, and system name
                if (observation.hasValueCodeableConcept()) {
                    CodeableConcept valueCodeableConcept = observation.getValueCodeableConcept();
                    for (Coding coding : valueCodeableConcept.getCoding()) {
                        answerCode = coding.getCode();
                        answerCodeDescription = coding.getDisplay();
                        answerCodeSystemName = coding.getSystem();
                        // Assuming only one coding is present
                        break;
                    }
                }

                // Appending patient and encounter information
                csvBuilder.append(patMrnId).append("|");
                csvBuilder.append(facilityId).append("|");
                csvBuilder.append(encounterId).append("|");
                csvBuilder.append(encounterClassCode).append("|");
                csvBuilder.append(encounterClassCodeDescription).append("|");
                csvBuilder.append(encounterClassCodeSystem).append("|");
                csvBuilder.append(encounterStatusCode).append("|");
                csvBuilder.append(encounterStatusCodeDescription).append("|");
                csvBuilder.append(encounterStatusCodeSystem).append("|");
                csvBuilder.append(encounterTypeCode).append("|");
                csvBuilder.append(encounterTypeCodeDescription).append("|");
                csvBuilder.append(encounterTypeCodeSystem).append("|");

                // Appending observation-specific information
                csvBuilder.append(screeningStatusCode).append("|");
                csvBuilder.append(screeningStatusCodeDescription).append("|");
                csvBuilder.append(screeningStatusCodeSystem).append("|");
                csvBuilder.append(screeningCode).append("|");
                csvBuilder.append(screeningCodeDescription).append("|");
                csvBuilder.append(screeningCodeSystemName).append("|");
                csvBuilder.append(recordedTime).append("|");
                csvBuilder.append(questionCode).append("|");
                csvBuilder.append(questionCodeDescription).append("|");
                csvBuilder.append(questionCodeSystemName).append("|");
                csvBuilder.append(ucumUnits).append("|");
                csvBuilder.append(sdohDomain).append("|");
                csvBuilder.append(parentQuestionCode).append("|");
                csvBuilder.append(answerCode).append("|");
                csvBuilder.append(answerCodeDescription).append("|");
                csvBuilder.append(answerCodeSystemName).append("|");
                csvBuilder.append(potentialNeedIndicated).append("|");

                csvBuilder.append("\n");
            }
        }

        // Write CSV data to file (or handle as needed)
        try (FileWriter writer = new FileWriter(folderPath + "SCREENING.csv")) {
            writer.write(csvBuilder.toString());
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private static void createQeAdminDataCsv(Bundle bundle) {
        // Initialize CSV builder
        StringBuilder csvBuilder = new StringBuilder();

        // Header row for QE_ADMIN_DATA.csv
        csvBuilder.append("PAT_MRN_ID|FACILITY_ID|FACILITY_LONG_NAME|ORGANIZATION_TYPE|" +
                "FACILITY_ADDRESS1|FACILITY_ADDRESS2|FACILITY_CITY|FACILITY_STATE|FACILITY_ZIP|" +
                "VISIT_PART_2_FLAG|VISIT_OMH_FLAG|VISIT_OPWDD_FLAG\n");

        String patMrnId = "";
        String facilityId = "";
        String facilityLongName = "";
        String organizationType = "";
        String facilityAddress1 = "";
        String facilityAddress2 = "";
        String facilityCity = "";
        String facilityState = "";
        String facilityZip = "";
        String visitPart2Flag = "";
        String visitOmhFlag = "";
        String visitOpwddFlag = "";

        // Iterate through bundle entries
        for (BundleEntryComponent entry : bundle.getEntry()) {
            // Extract relevant data from bundle entry for QE_ADMIN_DATA.csv
            // Append data to CSV builder
            // Extracting patient information

            if (entry.getResource() instanceof Patient) {
                Patient patient = (Patient) entry.getResource();
                // Extracting patient information
                if (patient.hasName() && !patient.getName().isEmpty()) {
                }
                List<Identifier> identifiers = patient.getIdentifier();
                for (Identifier identifier : identifiers) {
                    String system = identifier.getType().getCodingFirstRep().getCode();
                    String value = identifier.getValue();

                    if (system != null && value != null) {
                        if (system.equals("MR")) { // PAT MRN ID
                            patMrnId = value;
                        }
                    }
                }

            } else if (entry.getResource() instanceof Organization) {
                Organization organization = (Organization) entry.getResource();
                // Extracting organization information and appending to CSV builder
                facilityId = organization.getId(); // Assuming id is the facility ID
                facilityLongName = organization.getName();
                organizationType = "";
                for (CodeableConcept type : organization.getType()) {
                    for (Coding coding : type.getCoding()) {
                        organizationType = coding.getDisplay();
                        break; // Assuming there's only one coding
                    }
                }

                if (!organization.getAddress().isEmpty()) {
                    Address address = organization.getAddressFirstRep();
                    if (address.hasLine()) {
                        facilityAddress1 = address.getLine().get(0).getValue();
                        if (address.getLine().size() > 1) {
                            facilityAddress2 = address.getLine().get(1).getValue();
                        }
                    }
                    facilityCity = address.getCity();
                    facilityState = address.getState();
                    facilityZip = address.getPostalCode();
                }

            }

            visitPart2Flag = "No";
            visitOmhFlag = "No";
            visitOpwddFlag = "No";

        }

        csvBuilder.append(patMrnId).append("|");
        csvBuilder.append(facilityId).append("|");
        csvBuilder.append(facilityLongName).append("|");
        csvBuilder.append(organizationType).append("|");
        csvBuilder.append(facilityAddress1).append("|");
        csvBuilder.append(facilityAddress2).append("|");
        csvBuilder.append(facilityCity).append("|");
        csvBuilder.append(facilityState).append("|");
        csvBuilder.append(facilityZip).append("|");
        csvBuilder.append(visitPart2Flag).append("|");
        csvBuilder.append(visitOmhFlag).append("|");
        csvBuilder.append(visitOpwddFlag).append("|");
        csvBuilder.append("\n");
        // Write CSV data to file (or handle as needed)
        try (FileWriter writer = new FileWriter(folderPath + "QE_ADMIN_DATA.csv")) {
            writer.write(csvBuilder.toString());
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private static void createDemographicDataCsv(Bundle bundle) {
        // Initialize CSV builder
        StringBuilder csvBuilder = new StringBuilder();

        // Header row for DEMOGRAPHIC_DATA.csv
        csvBuilder.append("MPI_ID|PAT_MRN_ID|FACILITY_ID|CONSENT|FIRST_NAME|MIDDLE_NAME|LAST_NAME|" +
                "ADMINISTRATIVE_SEX_CODE|ADMINISTRATIVE_SEX_CODE_DESCRIPTION|ADMINISTRATIVE_SEX_CODE_SYSTEM|" +
                "SEX_AT_BIRTH_CODE|SEX_AT_BIRTH_CODE_DESCRIPTION|SEX_AT_BIRTH_CODE_SYSTEM|PAT_BIRTH_DATE|" +
                "ADDRESS1|ADDRESS2|CITY|STATE|ZIP|GENDER_IDENTITY_CODE|GENDER_IDENTITY_CODE_DESCRIPTION|" +
                "GENDER_IDENTITY_CODE_SYSTEM_NAME|SEXUAL_ORIENTATION_CODE|SEXUAL_ORIENTATION_DESCRIPTION|" +
                "SEXUAL_ORIENTATION_CODE_SYSTEM_NAME|PREFERRED_LANGUAGE_CODE|PREFERRED_LANGUAGE_DESCRIPTION|" +
                "PREFERRED_LANGUAGE_CODE_SYSTEM_NAME|RACE_CODE|RACE_CODE_DESCRIPTION|RACE_CODE_SYSTEM_NAME|" +
                "ETHNICITY_CODE|ETHNICITY_CODE_DESCRIPTION|ETHNICITY_CODE_SYSTEM_NAME|MEDICAID_CIN\n");

        String mpiId = "";
        String patMrnId = "";
        String facilityId = "";
        String isConsent = "";
        String firstName = "";
        String middleName = "";
        String lastName = "";
        String administrativeSexCode = "";
        String administrativeSexCodeDescription = "";
        String administrativeSexCodeSystem = "";
        String sexAtBirthCode = "";
        String sexAtBirthCodeDescription = "";
        String sexAtBirthCodeSystem = "";
        String patBirthDate = "";
        String address1 = "";
        String address2 = "";
        String city = "";
        String state = "";
        String zip = "";
        String genderIdentityCode = "";
        String genderIdentityCodeDescription = "";
        String genderIdentityCodeSystemName = "";
        String sexualOrientationCode = "";
        String sexualOrientationDescription = "";
        String sexualOrientationCodeSystemName = "";
        String preferredLanguageCode = "";
        String preferredLanguageDescription = "";
        String preferredLanguageCodeSystemName = "";
        String raceCode = "";
        String raceCodeDescription = "";
        String raceCodeSystemName = "";
        String ethnicityCode = "";
        String ethnicityCodeDescription = "";
        String ethnicityCodeSystemName = "";
        String medicaidCin = "";

        // Iterate through bundle entries
        for (BundleEntryComponent entry : bundle.getEntry()) {
            // Extract relevant data from bundle entry for DEMOGRAPHIC_DATA.csv
            // Append data to CSV builder
            // Extracting patient information
            if (entry.getResource() instanceof Consent) {
                Consent consent = (Consent) entry.getResource();
                // Extracting consent information
                if (consent.hasId() && !consent.isEmpty()) {
                    isConsent = "true";
                }

            } else if (entry.getResource() instanceof Patient) {
                Patient patient = (Patient) entry.getResource();
                if (patient.hasName() && !patient.getName().isEmpty()) {
                    HumanName name = patient.getName().get(0); // Assuming there's only one name
                    // consent = name.getGiven().get(0).getValue();

                    List<Identifier> identifiers = patient.getIdentifier();
                    for (Identifier identifier : identifiers) {
                        String system = identifier.getType().getCodingFirstRep().getCode();
                        String value = identifier.getValue();

                        if (system != null && value != null) {
                            if (system.equals("PN")) { // MPI ID
                                mpiId = value;
                            } else if (system.equals("MR")) { // PAT MRN ID
                                patMrnId = value;
                            } else if (system.equals("MA")) { // Medicaid CIN
                                medicaidCin = value;
                            }
                        }
                    }

                    facilityId = patient.getIdentifier().get(0).getAssigner().toString();
                    firstName = name.getGiven().get(0).getValue();
                    middleName = name.getGiven().get(1).getValue();
                    lastName = name.getFamily();

                    Extension sexualOrientationExtension = patient
                            .getExtensionByUrl("http://shinny.org/StructureDefinition/shinny-sexual-orientation");

                    if (sexualOrientationExtension != null && sexualOrientationExtension.hasValue()
                            && sexualOrientationExtension.getValue() instanceof CodeableConcept) {
                        CodeableConcept sexualOrientationCodeableConcept = (CodeableConcept) sexualOrientationExtension
                                .getValue();
                        for (Coding coding : sexualOrientationCodeableConcept.getCoding()) {
                            administrativeSexCode = coding.getCode();
                            administrativeSexCodeDescription = coding.getDisplay();
                            administrativeSexCodeSystem = coding.getSystem(); // This is the administrative sex code
                                                                              // system
                            break; // Assuming there's only one coding
                        }
                    }
                    Extension sexAtBirthExtension = patient
                            .getExtensionByUrl("http://hl7.org/fhir/us/core/StructureDefinition/us-core-birthsex");

                    if (sexAtBirthExtension != null && sexAtBirthExtension.hasValue()
                            && sexAtBirthExtension.getValue() instanceof CodeType) {
                        CodeType sexAtBirthCodeType = (CodeType) sexAtBirthExtension.getValue();
                        sexAtBirthCode = sexAtBirthCodeType.getValue();
                        sexAtBirthCodeSystem = sexAtBirthCodeType.getSystem();
                        sexAtBirthCodeDescription = sexAtBirthCodeType.getDisplay();

                        // TODO: to verify sexAtBirthCodeSystem and sexAtBirthCodeDescription
                        /*
                         * if (!sexAtBirthCode.isEmpty()) {
                         * CodeSystem sexAtBirthCodeSystemCode =
                         * context.fetchCodeSystem(sexAtBirthCode); // Assuming context is the FHIR
                         * context
                         * if (sexAtBirthCodeSystemCode != null) {
                         * sexAtBirthCodeDescription = sexAtBirthCodeSystemCode.getDescription();
                         * sexAtBirthCodeSystem = sexAtBirthCodeSystemCode.getUrl();
                         * }
                         * }
                         */
                    }

                    patBirthDate = patient.getBirthDate().toString();
                    address1 = patient.getAddress().get(0).getLine().toString();
                    address2 = "";
                    city = patient.getAddress().get(0).getCity();
                    state = patient.getAddress().get(0).getState();
                    zip = patient.getAddress().get(0).getPostalCode();

                    sexualOrientationExtension = patient
                            .getExtensionByUrl("http://shinny.org/StructureDefinition/shinny-sexual-orientation");
                    sexualOrientationCode = "";
                    sexualOrientationDescription = "";
                    sexualOrientationCodeSystemName = "";

                    if (sexualOrientationExtension != null && sexualOrientationExtension.hasValue()
                            && sexualOrientationExtension.getValue() instanceof CodeableConcept) {
                        CodeableConcept sexualOrientationCodeableConcept = (CodeableConcept) sexualOrientationExtension
                                .getValue();
                        for (Coding coding : sexualOrientationCodeableConcept.getCoding()) {
                            sexualOrientationCode = coding.getCode();
                            sexualOrientationDescription = coding.getDisplay();
                            sexualOrientationCodeSystemName = coding.getSystem();
                            break; // Assuming there's only one coding
                        }
                    }

                    Extension genderIdentityExtension = patient
                            .getExtensionByUrl("http://shinny.org/StructureDefinition/us-core-genderIdentity");

                    if (genderIdentityExtension != null && genderIdentityExtension.hasValue()
                            && genderIdentityExtension.getValue() instanceof CodeableConcept) {
                        CodeableConcept genderIdentityCodeableConcept = (CodeableConcept) genderIdentityExtension
                                .getValue();
                        for (Coding coding : genderIdentityCodeableConcept.getCoding()) {
                            genderIdentityCode = coding.getCode();
                            genderIdentityCodeDescription = coding.getDisplay();
                            genderIdentityCodeSystemName = coding.getSystem();
                            break; // Assuming there's only one coding
                        }
                    }

                    PatientCommunicationComponent preferredLanguageCommunication = patient.getCommunicationFirstRep();
                    CodeableConcept preferredLanguageCodeableConcept = preferredLanguageCommunication.getLanguage();

                    preferredLanguageCode = "";
                    preferredLanguageDescription = "";
                    preferredLanguageCodeSystemName = "";

                    if (preferredLanguageCodeableConcept != null) {
                        for (Coding coding : preferredLanguageCodeableConcept.getCoding()) {
                            preferredLanguageCode = coding.getCode();
                            preferredLanguageDescription = coding.getDisplay();
                            preferredLanguageCodeSystemName = coding.getSystem();
                            break; // Assuming there's only one coding
                        }
                    }

                    // Extracting race information
                    Extension raceExtension = patient
                            .getExtensionByUrl("http://hl7.org/fhir/us/core/StructureDefinition/us-core-race");

                    if (raceExtension != null && raceExtension.hasValue()
                            && raceExtension.getValue() instanceof CodeableConcept) {
                        CodeableConcept raceCodeableConcept = (CodeableConcept) raceExtension.getValue();
                        for (Coding coding : raceCodeableConcept.getCoding()) {
                            raceCode = coding.getCode();
                            raceCodeDescription = coding.getDisplay();
                            raceCodeSystemName = coding.getSystem();
                            break; // Assuming there's only one coding
                        }
                    }

                    ethnicityCode = "";
                    ethnicityCodeDescription = "";
                    ethnicityCodeSystemName = "";

                    // Extracting ethnicity information
                    Extension ethnicityExtension = patient
                            .getExtensionByUrl("http://hl7.org/fhir/us/core/StructureDefinition/us-core-ethnicity");

                    if (ethnicityExtension != null && ethnicityExtension.hasValue()
                            && ethnicityExtension.getValue() instanceof CodeableConcept) {
                        CodeableConcept ethnicityCodeableConcept = (CodeableConcept) ethnicityExtension.getValue();
                        for (Coding coding : ethnicityCodeableConcept.getCoding()) {
                            ethnicityCode = coding.getCode();
                            ethnicityCodeDescription = coding.getDisplay();
                            ethnicityCodeSystemName = coding.getSystem();
                            break; // Assuming there's only one coding
                        }
                    }

                }

            }
        }
        // Appending patient information to CSV builder
        csvBuilder.append(mpiId).append("|");
        csvBuilder.append(patMrnId).append("|");
        csvBuilder.append(facilityId).append("|");
        csvBuilder.append(isConsent).append("|");
        csvBuilder.append(firstName).append("|");
        csvBuilder.append(middleName).append("|");
        csvBuilder.append(lastName).append("|");
        csvBuilder.append(administrativeSexCode).append("|");
        csvBuilder.append(administrativeSexCodeDescription).append("|");
        csvBuilder.append(administrativeSexCodeSystem).append("|");
        csvBuilder.append(sexAtBirthCode).append("|");
        csvBuilder.append(sexAtBirthCodeDescription).append("|");
        csvBuilder.append(sexAtBirthCodeSystem).append("|");
        csvBuilder.append(patBirthDate).append("|");
        csvBuilder.append(address1).append("|");
        csvBuilder.append(address2).append("|");
        csvBuilder.append(city).append("|");
        csvBuilder.append(state).append("|");
        csvBuilder.append(zip).append("|");
        csvBuilder.append(genderIdentityCode).append("|");
        csvBuilder.append(genderIdentityCodeDescription).append("|");
        csvBuilder.append(genderIdentityCodeSystemName).append("|");
        csvBuilder.append(sexualOrientationCode).append("|");
        csvBuilder.append(sexualOrientationDescription).append("|");
        csvBuilder.append(sexualOrientationCodeSystemName).append("|");
        csvBuilder.append(preferredLanguageCode).append("|");
        csvBuilder.append(preferredLanguageDescription).append("|");
        csvBuilder.append(preferredLanguageCodeSystemName).append("|");
        csvBuilder.append(raceCode).append("|");
        csvBuilder.append(raceCodeDescription).append("|");
        csvBuilder.append(raceCodeSystemName).append("|");
        csvBuilder.append(ethnicityCode).append("|");
        csvBuilder.append(ethnicityCodeDescription).append("|");
        csvBuilder.append(ethnicityCodeSystemName).append("|");
        csvBuilder.append(medicaidCin).append("|");
        csvBuilder.append("\n");
        // Write CSV data to file (or handle as needed)
        try (FileWriter writer = new FileWriter(folderPath + "DEMOGRAPHIC_DATA.csv")) {
            writer.write(csvBuilder.toString());
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
    // JAVA STARTS

    private static void insertScreeningData(Bundle bundle) {
        try (Statement stmt = conn.createStatement()) {
            stmt.execute("CREATE TABLE IF NOT EXISTS screeningfhir (" +
                    "PAT_MRN_ID VARCHAR," +
                    "FACILITY_ID VARCHAR," +
                    "ENCOUNTER_ID VARCHAR," +
                    "ENCOUNTER_CLASS_CODE VARCHAR," +
                    "ENCOUNTER_CLASS_CODE_DESCRIPTION VARCHAR," +
                    "ENCOUNTER_CLASS_CODE_SYSTEM VARCHAR," +
                    "ENCOUNTER_STATUS_CODE VARCHAR," +
                    "ENCOUNTER_STATUS_CODE_DESCRIPTION VARCHAR," +
                    "ENCOUNTER_STATUS_CODE_SYSTEM VARCHAR," +
                    "ENCOUNTER_TYPE_CODE VARCHAR," +
                    "ENCOUNTER_TYPE_CODE_DESCRIPTION VARCHAR," +
                    "ENCOUNTER_TYPE_CODE_SYSTEM VARCHAR," +
                    "SCREENING_STATUS_CODE VARCHAR," +
                    "SCREENING_STATUS_CODE_DESCRIPTION VARCHAR," +
                    "SCREENING_STATUS_CODE_SYSTEM VARCHAR," +
                    "SCREENING_CODE VARCHAR," +
                    "SCREENING_CODE_DESCRIPTION VARCHAR," +
                    "SCREENING_CODE_SYSTEM_NAME VARCHAR," +
                    "RECORDED_TIME VARCHAR," +
                    "QUESTION_CODE VARCHAR," +
                    "QUESTION_CODE_DESCRIPTION VARCHAR," +
                    "QUESTION_CODE_SYSTEM_NAME VARCHAR," +
                    "UCUM_UNITS VARCHAR," +
                    "SDOH_DOMAIN VARCHAR," +
                    "PARENT_QUESTION_CODE VARCHAR," +
                    "ANSWER_CODE VARCHAR," +
                    "ANSWER_CODE_DESCRIPTION VARCHAR," +
                    "ANSWER_CODE_SYSTEM_NAME VARCHAR," +
                    "POTENTIAL_NEED_INDICATED VARCHAR)");
        } catch (SQLException e) {
            e.printStackTrace();
        }
        String patMrnId = "";
        String facilityId = "";
        String encounterId = "";
        String encounterClassCode = "";
        String encounterClassCodeDescription = "";
        String encounterClassCodeSystem = "";
        String encounterStatusCode = "";
        String encounterStatusCodeDescription = "";
        String encounterStatusCodeSystem = "";
        String encounterTypeCode = "";
        String encounterTypeCodeDescription = "";
        String encounterTypeCodeSystem = "";
        String screeningStatusCode = "";
        String screeningStatusCodeDescription = "";
        String screeningStatusCodeSystem = "";
        String screeningCode = "";
        String screeningCodeDescription = "";
        String screeningCodeSystemName = "";
        String recordedTime = "";
        String questionCode = "";
        String questionCodeDescription = "";
        String questionCodeSystemName = "";
        String ucumUnits = "";
        String sdohDomain = "";
        String parentQuestionCode = "";
        String answerCode = "";
        String answerCodeDescription = "";
        String answerCodeSystemName = "";
        String potentialNeedIndicated = "";
        // Iterate through bundle entries
        for (BundleEntryComponent entry : bundle.getEntry()) {
            if (entry.getResource() instanceof Patient) {
                Patient patient = (Patient) entry.getResource();
                // Extracting patient information
                if (patient.hasName() && !patient.getName().isEmpty()) {
                }
                List<Identifier> identifiers = patient.getIdentifier();
                for (Identifier identifier : identifiers) {
                    String system = identifier.getType().getCodingFirstRep().getCode();
                    String value = identifier.getValue();

                    if (system != null && value != null) {
                        if (system.equals("MR")) { // PAT MRN ID
                            patMrnId = value;
                        }
                    }
                }

            } else if (entry.getResource() instanceof Organization) {
                Organization organization = (Organization) entry.getResource();
                facilityId = organization.getId(); // Assuming id is the facility ID
            } else if (entry.getResource() instanceof Encounter) {
                Encounter encounter = (Encounter) entry.getResource();
                // Extracting encounter information
                encounterId = encounter.getId();
                if (encounter.hasClass_()) {
                    encounterClassCode = encounter.getClass_().getCode();
                    encounterClassCodeDescription = encounter.getClass_().getDisplay();
                    encounterClassCodeSystem = encounter.getClass_().getSystem();
                }
                if (encounter.hasStatus()) {
                    encounterStatusCode = encounter.getStatus().toCode();
                    encounterStatusCodeDescription = encounter.getStatus().getDisplay();
                    encounterStatusCodeSystem = "http://hl7.org/fhir/R4/valueset-encounter-status.html"; // Assuming a
                                                                                                         // default
                                                                                                         // value
                }
                if (!encounter.getType().isEmpty()) {
                    encounterTypeCode = encounter.getType().get(0).getCodingFirstRep().getCode();
                    encounterTypeCodeDescription = encounter.getType().get(0).getCodingFirstRep().getDisplay();
                    encounterTypeCodeSystem = encounter.getType().get(0).getCodingFirstRep().getSystem();
                }
            } else if (entry.getResource() instanceof Observation) {
                Observation observation = (Observation) entry.getResource();

                // Resetting observation-specific variables for each observation
                screeningStatusCode = "";
                screeningStatusCodeDescription = "";
                screeningStatusCodeSystem = "";
                screeningCode = "";
                screeningCodeDescription = "";
                screeningCodeSystemName = "";
                recordedTime = "";
                questionCode = "";
                questionCodeDescription = "";
                questionCodeSystemName = "";
                ucumUnits = "";
                sdohDomain = "";
                parentQuestionCode = "";
                answerCode = "";
                answerCodeDescription = "";
                answerCodeSystemName = "";
                potentialNeedIndicated = "";

                // Extracting observation-specific information
                if (!observation.getInterpretation().isEmpty() && observation.getInterpretation().get(0).hasCoding()) {
                    Coding screeningStatusCoding = observation.getInterpretation().get(0).getCodingFirstRep();
                    screeningStatusCode = screeningStatusCoding.getCode();
                    screeningStatusCodeDescription = screeningStatusCoding.getDisplay();
                    screeningStatusCodeSystem = screeningStatusCoding.getSystem();
                }
                if (observation.hasCode() && observation.getCode().hasCoding()) {
                    Coding screeningCoding = observation.getCode().getCodingFirstRep();
                    screeningCode = screeningCoding.getCode();
                    screeningCodeDescription = screeningCoding.getDisplay();
                    screeningCodeSystemName = screeningCoding.getSystem();
                }
                if (observation.hasEffectiveDateTimeType()) {
                    DateTimeType recordedDateTimeType = observation.getEffectiveDateTimeType();
                    recordedTime = recordedDateTimeType.getValueAsString();
                }
                if (observation.hasCode() && observation.getCode().hasCoding()) {
                    Coding questionCoding = observation.getCode().getCodingFirstRep();
                    questionCode = questionCoding.getCode();
                    questionCodeDescription = questionCoding.getDisplay();
                    questionCodeSystemName = questionCoding.getSystem();
                }
                if (observation.hasValueCodeableConcept()) {
                    CodeableConcept valueCodeableConcept = observation.getValueCodeableConcept();
                    for (Coding coding : valueCodeableConcept.getCoding()) {
                        ucumUnits = coding.getCode();
                        break; // Assuming there's only one coding
                    }
                }

                // TODO: the code is not equaling with the URL . Need to check
                for (Coding coding : observation.getCategoryFirstRep().getCoding()) {
                    if (coding.getSystem().equals(
                            "http://hl7.org/fhir/us/sdoh-clinicalcare/CodeSystem/SDOHCC-CodeSystemTemporaryCodes")) {
                        sdohDomain = coding.getSystem();
                        break;
                    }
                }

                parentQuestionCode = ""; // #TODO:

                // Extracting answer code, description, and system name
                if (observation.hasValueCodeableConcept()) {
                    CodeableConcept valueCodeableConcept = observation.getValueCodeableConcept();
                    for (Coding coding : valueCodeableConcept.getCoding()) {
                        answerCode = coding.getCode();
                        answerCodeDescription = coding.getDisplay();
                        answerCodeSystemName = coding.getSystem();
                        // Assuming only one coding is present
                        break;
                    }
                }

                // Insert observation data into the DuckDB database
                String sql = "INSERT INTO screeningfhir VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
                    pstmt.setString(1, patMrnId);
                    pstmt.setString(2, facilityId);
                    pstmt.setString(3, encounterId);
                    pstmt.setString(4, encounterClassCode);
                    pstmt.setString(5, encounterClassCodeDescription);
                    pstmt.setString(6, encounterClassCodeSystem);
                    pstmt.setString(7, encounterStatusCode);
                    pstmt.setString(8, encounterStatusCodeDescription);
                    pstmt.setString(9, encounterStatusCodeSystem);
                    pstmt.setString(10, encounterTypeCode);
                    pstmt.setString(11, encounterTypeCodeDescription);
                    pstmt.setString(12, encounterTypeCodeSystem);
                    pstmt.setString(13, screeningStatusCode);
                    pstmt.setString(14, screeningStatusCodeDescription);
                    pstmt.setString(15, screeningStatusCodeSystem);
                    pstmt.setString(16, screeningCode);
                    pstmt.setString(17, screeningCodeDescription);
                    pstmt.setString(18, screeningCodeSystemName);
                    pstmt.setString(19, recordedTime);
                    pstmt.setString(20, questionCode);
                    pstmt.setString(21, questionCodeDescription);
                    pstmt.setString(22, questionCodeSystemName);
                    pstmt.setString(23, ucumUnits);
                    pstmt.setString(24, sdohDomain);
                    pstmt.setString(25, parentQuestionCode);
                    pstmt.setString(26, answerCode);
                    pstmt.setString(27, answerCodeDescription);
                    pstmt.setString(28, answerCodeSystemName);
                    pstmt.setString(29, potentialNeedIndicated);

                    // Execute the insert statement
                    pstmt.executeUpdate();
                } catch (SQLException e) {
                    e.printStackTrace();
                }

            }
        }
    }

    public static void insertScreeningJson(Bundle bundle, Connection conn) {
        try {
            // Serialize the bundle to JSON
            String jsonText = context.newJsonParser().encodeResourceToString(bundle);

            // Create the table with the primary key using SERIAL for auto-incrementing
            try (PreparedStatement stmt = conn.prepareStatement(
                    "CREATE TABLE IF NOT EXISTS screeningjson (" +
                            "PK SERIAL PRIMARY KEY," +
                            "JSON_TEXT TEXT)")) {
                stmt.executeUpdate();
            }

            // Insert the serialized bundle JSON into the PostgreSQL database
            String sql = "INSERT INTO screeningjson (JSON_TEXT) VALUES (?)";
            try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
                pstmt.setString(1, jsonText);
                pstmt.executeUpdate();
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    // JAVA ENDS

    // @Validate
    public MethodOutcome validateBundle(
            @ResourceParam Bundle theBundle,
            @Validate.Mode ValidationModeEnum theMode,
            @Validate.Profile String theProfile) {
        System.out.println(
                "Inside the function validateBundle......................." + theBundle.getIdentifier().getValue());
        // Actually do our validation: The UnprocessableEntityException
        // results in an HTTP 422, which is appropriate for business rule failure
        System.out.println("Profile path  :" + theProfile);
        if (theBundle.getIdentifier().isEmpty()) {
            /*
             * It is also possible to pass an OperationOutcome resource
             * to the UnprocessableEntityException if you want to return
             * a custom populated OperationOutcome. Otherwise, a simple one
             * is created using the string supplied below.
             */
            System.out.println("INVALID BUNDLE.");
            throw new UnprocessableEntityException(Msg.code(639) + "No identifier supplied");
        }
        System.out.println("VALID BUNDLE.");

        // This method returns a MethodOutcome object
        MethodOutcome retVal = new MethodOutcome();

        // You may also add an OperationOutcome resource to return
        /*
         * // This part is optional though:
         * OperationOutcome outcome = new OperationOutcome();
         * outcome.addIssue().setSeverity(IssueSeverity.WARNING).
         * setDiagnostics("One minor issue detected");
         * retVal.setOperationOutcome(outcome);
         */
        return retVal;
    }

    @Validate
    public MethodOutcome validateFhirResource(@ResourceParam String jsonBody) {

        // Parse the JSON text into a FHIR resource
        FhirContext ctx = FhirContext.forR4();
        IParser parser = ctx.newJsonParser();
        MethodOutcome outcome = null;
        IBaseResource resource = null;
        // Parse with (default) lenient error handler
        parser.setParserErrorHandler(new LenientErrorHandler());

        // Parse with strict error handler
        parser.setParserErrorHandler(new StrictErrorHandler());
        // try{
        resource = parser.parseResource(jsonBody);
        // } catch (DataFormatException e) {
        // e.printStackTrace();
        // return outcome;
        // }

        // Read and parse the StructureDefinition from a file
        ValidationModeEnum mode = ValidationModeEnum.CREATE;
        outcome = validateBundle((Bundle) resource, mode, profile);

        // Handle the validation result
        OperationOutcome operationOutcome = (OperationOutcome) outcome.getOperationOutcome();
        System.out.println("operationOutcome: " + operationOutcome);
        return outcome;

    }
}
