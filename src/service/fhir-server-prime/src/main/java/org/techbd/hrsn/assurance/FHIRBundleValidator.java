package org.techbd.hrsn.assurance;

import ca.uhn.fhir.context.FhirContext;
import ca.uhn.fhir.parser.IParser;
import ca.uhn.fhir.parser.LenientErrorHandler;
import ca.uhn.fhir.parser.StrictErrorHandler;
import ca.uhn.fhir.rest.annotation.*;
import ca.uhn.fhir.rest.api.MethodOutcome;
import ca.uhn.fhir.rest.api.ValidationModeEnum;
import ca.uhn.fhir.rest.param.StringParam;
import ca.uhn.fhir.rest.server.exceptions.UnprocessableEntityException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import org.apache.commons.configuration.ConfigurationException;
import org.apache.commons.configuration.PropertiesConfiguration;
import org.hl7.fhir.instance.model.api.IBaseResource;
import org.hl7.fhir.instance.model.api.IIdType;
import org.hl7.fhir.r4.model.*;
import org.hl7.fhir.r4.model.Bundle.BundleEntryComponent;
import org.hl7.fhir.r4.model.OperationOutcome.IssueSeverity;
import org.hl7.fhir.r4.model.Patient.PatientCommunicationComponent;
import org.techbd.hrsn.assurance.Globals.ShinnyDataLakeSubmissionStatus;
import org.techbd.hrsn.assurance.Globals.ValidationEngine;

import java.io.InputStream;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Statement;
import java.text.SimpleDateFormat;
import java.time.Instant;
import java.util.*;

// TODO: create  FHIRValidationFilter class to manage filter rules for any errors or warnings that should be removed 

//@RestController

public class FHIRBundleValidator {

    static FhirContext context = FhirContext.forR4();
    private static FHIRBundleValidator instance;
    private static String shinnyDataLakeApiImpGuideProfileUri;
    private static Connection conn;
    private static String resourceId = null;
    private static String deviceId;
    private static String version;

    private final Map<String, OrchestrationSession> sessions = new HashMap<>();

    public FHIRBundleValidator() {
        PropertiesConfiguration config = new PropertiesConfiguration();
        try {
            config.load("application.properties");
        } catch (ConfigurationException e) {
            e.printStackTrace();
        }
        // Load values fom application.properties
        shinnyDataLakeApiImpGuideProfileUri = config.getString("shinnyDataLakeApiImpGuideProfileUri");
        FHIRBundleValidator.deviceId = config.getString("deviceId");
        FHIRBundleValidator.version = getVersionFromProperties();
    }

    public static FHIRBundleValidator getInstance() {
        // Lazy initialization: create instance only when needed
        if (instance == null) {
            instance = new FHIRBundleValidator();
        }
        return instance;
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
            if (entry.getResource() instanceof Patient patient) {
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

            } else if (entry.getResource() instanceof Organization organization) {
                facilityId = organization.getId(); // Assuming id is the facility ID
            } else if (entry.getResource() instanceof Encounter encounter) {
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
            } else if (entry.getResource() instanceof Observation observation) {

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

            if (entry.getResource() instanceof Patient patient) {
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

            } else if (entry.getResource() instanceof Organization organization) {
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
            if (entry.getResource() instanceof Consent consent) {
                // Extracting consent information
                if (consent.hasId() && !consent.isEmpty()) {
                    isConsent = "true";
                }

            } else if (entry.getResource() instanceof Patient patient) {
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
                            && sexualOrientationExtension
                                    .getValue() instanceof CodeableConcept sexualOrientationCodeableConcept) {
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
                            && sexAtBirthExtension.getValue() instanceof CodeType sexAtBirthCodeType) {
                        sexAtBirthCode = sexAtBirthCodeType.getValue();
                        sexAtBirthCodeSystem = sexAtBirthCodeType.getSystem();
                        sexAtBirthCodeDescription = sexAtBirthCodeType.getDisplay();

                        // TODO: to verify sexAtBirthCodeSystem and sexAtBirthCodeDescriptio
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
                            && sexualOrientationExtension
                                    .getValue() instanceof CodeableConcept sexualOrientationCodeableConcept) {
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
                            && genderIdentityExtension
                                    .getValue() instanceof CodeableConcept genderIdentityCodeableConcept) {
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
                            && raceExtension.getValue() instanceof CodeableConcept raceCodeableConcept) {
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
                            && ethnicityExtension.getValue() instanceof CodeableConcept ethnicityCodeableConcept) {
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

    }

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
            if (entry.getResource() instanceof Patient patient) {
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

            } else if (entry.getResource() instanceof Organization organization) {
                facilityId = organization.getId(); // Assuming id is the facility ID
            } else if (entry.getResource() instanceof Encounter encounter) {
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
            } else if (entry.getResource() instanceof Observation observation) {

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

    public static String convertJsonToHtml(String json) {
        JsonElement jsonElement = JsonParser.parseString(json);
        return convertJsonElementToHtml(jsonElement);
    }

    private static String convertJsonElementToHtml(JsonElement jsonElement) {
        StringBuilder html = new StringBuilder();
        if (jsonElement.isJsonObject()) {
            html.append("<ul>");
            JsonObject jsonObject = jsonElement.getAsJsonObject();
            for (String key : jsonObject.keySet()) {
                html.append("<li><strong>").append(key).append(":</strong> ");
                html.append(convertJsonElementToHtml(jsonObject.get(key)));
                html.append("</li>");
            }
            html.append("</ul>");
        } else {
            html.append(jsonElement.getAsString());
        }
        return html.toString();
    }
    // JAVA STARTS

    public static String prettyPrintJsonUsingDefaultPrettyPrinter(String uglyJsonString)
            throws JsonProcessingException {
        ObjectMapper objectMapper = new ObjectMapper();
        Object jsonObject = objectMapper.readValue(uglyJsonString, Object.class);
        String prettyJson = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(jsonObject);
        return prettyJson;
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
            @OptionalParam(name = "x") String xValue,
            @OptionalParam(name = "qe") String qeId) {

        // Accessing x parameter from URL
        if (xValue != null) {
            // Process x parameter if needed
            System.out.println("Value of x parameter: " + xValue);
        }
        if (qeId != null) {
            // Process x parameter if needed
            System.out.println("Value of qe parameter: " + qeId);
        }

        // Initialize session variables
        Instant sessionStartTime = Instant.now();
        Instant sessionEndTime = Instant.now();

        // Set up FHIR parser with LenientErrorHandler
        FhirContext ctx = FhirContext.forR4();
        IParser parser = ctx.newJsonParser();
        parser.setParserErrorHandler(new LenientErrorHandler());
        parser.setParserErrorHandler(new StrictErrorHandler());

        // Parse the JSON text into a FHIR resource
        IBaseResource resource = parser.parseResource(jsonBody);

        resourceId = resource.getIdElement().getValue();
        System.out.println(resourceId);

        // Validate the bundle before creating resources
        MethodOutcome validationOutcome = validateBundle((Bundle) resource, ValidationModeEnum.CREATE,
                shinnyDataLakeApiImpGuideProfileUri);
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
            throw new UnprocessableEntityException("No identifier supplied");
        }

        // Pass the bundle to create CSV files
        createAhcHrsnEltArtifacts(theBundle, false);

        // Set session end time
        sessionEndTime = Instant.now();

        MethodOutcome retVal = new MethodOutcome();
        retVal.setId(new IdType("Bundle", theBundle.getIdentifier().getValue(), "4.0"));

        // Can also add an OperationOutcome resource to return
        // This part is optional though:
        OperationOutcome outcome = new OperationOutcome();
        // outcome.addIssue().setSeverity(IssueSeverity.WARNING).setDiagnostics("One
        // minor issue detected");

        // return retVal;

        JsonObject sessionJson = new JsonObject();
        sessionJson.addProperty("sessionStartTime", sessionStartTime.toString());
        sessionJson.addProperty("profile", shinnyDataLakeApiImpGuideProfileUri);
        sessionJson.addProperty("version", "4.0");
        sessionJson.addProperty("sessionEndTime", sessionEndTime.toString());

        // Serialize the JsonObject to a string
        String sessionJsonString = sessionJson.toString();

        outcome.addIssue().setSeverity(IssueSeverity.ERROR).setDiagnostics(sessionJsonString);
        retVal.setOperationOutcome(outcome);

        return retVal;
    }

    // @Validate
    public MethodOutcome validateBundle(
            @ResourceParam Bundle theBundle,
            @Validate.Mode ValidationModeEnum theMode,
            @Validate.Profile String theProfile) {

        MethodOutcome retVal = new MethodOutcome();
        OperationOutcome outcome = new OperationOutcome();
        retVal.setOperationOutcome(outcome);
        return retVal;
    }

    // public public MethodOutcome validateFhirResource(@ResourceParam String
    // jsonBody,
    // @RequestParam(value = "qe", required = false) String qeValue) {
    // @Validate
    // return json string
    public String validateFhirResource(String jsonBody, String qeIdentifier, String sessionId) {
        OrchestrationSession session = new OrchestrationSession(qeIdentifier,
                context, sessionId, FHIRBundleValidator.deviceId,
                FHIRBundleValidator.version);
        session.setShinnyDataLakeSubmissionStatus(ShinnyDataLakeSubmissionStatus.NOT_SUBMITTED);
        session.validateBundle(jsonBody, shinnyDataLakeApiImpGuideProfileUri, ValidationEngine.HAPI);
        this.sessions.put(sessionId, session);
        System.out.println("Session: " + session);
        String formattedSession = null;
        try {
            formattedSession = prettyPrintJsonUsingDefaultPrettyPrinter(session.toJson());
            System.out.println(formattedSession);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
        return formattedSession;
    }

    // @Operation(name = "$admin_validate", idempotent = true)
    public String adminValidate(/* @ResourceParam */ String jsonBody, String qeIdentifier) {
        System.out.println(" adminValidate");

        String sessionId = UUID.randomUUID().toString();
        OrchestrationSession session = new OrchestrationSession(qeIdentifier,
                context, sessionId, FHIRBundleValidator.deviceId,
                FHIRBundleValidator.version);
        session.validateBundle(jsonBody, shinnyDataLakeApiImpGuideProfileUri, ValidationEngine.HAPI);
        this.sessions.put(sessionId, session);
        OperationOutcome operationOutcome = session.entries.get(0).getOperationOutcome();
        MethodOutcome outcome = new MethodOutcome();
        outcome.setOperationOutcome(operationOutcome);

        String json = session.toJson();
        System.out.println("json : " + json);
        // Convert JSON to HTML
        String html = convertJsonToHtml(json);
        // Display HTML
        System.out.println("html : " + html);
        return html;

    }

    // TODO:
    @Read()
    public Bundle getResourceById(@IdParam IdType theId) {
        System.out.println(theId);

        return null;
    }

    public String getVersionFromProperties() {
        return getProverty("application.version");
    }

    public String getProverty(String key) {
        String propertyVal = ""; // Default value if reading from properties file fails

        try (InputStream input = FHIRBundleValidator.class.getClassLoader()
                .getResourceAsStream("application.properties")) {
            Properties prop = new Properties();
            prop.load(input);
            propertyVal = prop.getProperty(key);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return propertyVal;
    }

    public String diagnosticsOperation(String sessionId) {
        if (sessionId == null) {
            return getAllSessionsAsHtml();
        } else {
            return getSessionAsHtml(sessionId);
        }
    }

    private String getSessionAsHtml(String sessionId) {
        OrchestrationSession session = findSessionByKey(sessionId);

            StringBuilder html = new StringBuilder();
            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

            if (session != null) {
                            html.append("<!DOCTYPE html>\n");
            html.append("<html lang=\"en\">\n");

            html.append("<link rel=\"stylesheet\" href=\"https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/styles/default.min.css\">\n");
            html.append("<script src=\"https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/highlight.min.js\"></script>\n");
            html.append("\n<!-- and it's easy to individually load additional languages -->\n");
            html.append("<script src=\"https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/languages/go.min.js\"></script>\n");
            html.append("\n<script>hljs.highlightAll();</script>");

            html.append("<head>\n");
            html.append("    <meta charset=\"UTF-8\">\n");
            html.append("    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n");
            html.append("    <title>Details of Session</title>\n");
            html.append("    <style>\n");
            html.append("        body {\n");
            html.append("            font-family: Arial, sans-serif;\n");
            html.append("            margin: 20px;\n");
            html.append("        }\n");
            html.append("        h1 {\n");
            html.append("            text-align: left;\n");
            html.append("        }\n");
            html.append("        table {\n");
            html.append("            width: 50%;\n");
            html.append("            margin: 0 auto;\n");
            html.append("            border-collapse: collapse;\n");
            html.append("        }\n");
            html.append("        th, td {\n");
            html.append("            border: 1px solid #ddd;\n");
            html.append("            padding: 8px;\n");
            html.append("            text-align: left;\n");
            html.append("        }\n");
            html.append("        th {\n");
            html.append("            background-color: #f2f2f2;\n");
            html.append("        }\n");
            html.append("    </style>\n");
            html.append("</head>\n");
            html.append("<body>\n");
            html.append("    <h1>Details of Session</h1>\n");
            html.append("    <table>\n");
            html.append("        <tbody>\n");
            html.append("            <tr>\n");
            html.append("                <td>Session Id</td>\n");
            html.append("                <td>" + session.getOrchSessionId() + "</td>\n");
            html.append("            </tr>\n");
            html.append("            <tr>\n");
            html.append("                <td>QE Identifier</td>\n");
            html.append("                <td>" + session.getQeIdentifier() + "</td>\n");
            html.append("            </tr>\n");
            html.append("            <tr>\n");
            html.append("                <td>Device Id</td>\n");
            html.append("                <td>" + session.getDeviceId() + "</td>\n");
            html.append("            </tr>\n");
            html.append("            <tr>\n");
            html.append("                <td>Version</td>\n");
            html.append("                <td>" + session.getVersion() + "</td>\n");
            html.append("            </tr>\n");
            html.append("            <tr>\n");
            html.append("                <td>Orchestration started at</td>\n");
            html.append("                <td>" + session.getOrchStartedAt() + "</td>\n");
            html.append("            </tr>\n");
            html.append("                <td>Orchestration finished at</td>\n");
            html.append("                <td>" + session.getOrchFinishedAt() + "</td>\n");
            html.append("            </tr>\n");
            html.append("            <tr>\n");
            html.append("                <td>DataLake submission status</td>\n");
            html.append("                <td>" + session.getShinnyDataLakeSubmissionStatus() + "</td>\n");
            html.append("            </tr>\n");
            html.append("            <tr>\n");
            html.append("                <td>DataLake submission start time</td>\n");
            if (session.getShinnyDataLakeSubmissionStartTime() != 0) {
                html.append("            <td>" + dateFormat.format(new Date(session.getShinnyDataLakeSubmissionStartTime())) + "</td>\n");
            } else {
            html.append("                <td></td>\n");
            }
            html.append("            </tr>\n");
            html.append("            <tr>\n");
            html.append("                <td>DataLake submission end time</td>\n");
            if (session.getShinnyDataLakeSubmissionStartTime() != 0) {
                html.append("            <td>" + dateFormat.format(new Date(session.getShinnyDataLakeSubmissionEndTime())) + "</td>\n");
            } else {
            html.append("                <td></td>\n");
            }
            html.append("            </tr>\n");
            html.append("            <tr>\n");
            html.append("                <td>DataLake submission process time</td>\n");
            html.append("                <td>" + (session.getShinnyDataLakeSubmissionEndTime() - session.getShinnyDataLakeSubmissionStartTime()) + " ms</td>\n");
            html.append("            </tr>\n");
            html.append("            <tr>\n");
            html.append("                <td>DataLake Submission Response</td>\n");
            html.append("                <td>" + session.findShinnyDataLakeSubmissionDataByKey(sessionId) + "</td>\n");
            html.append("            </tr>\n");
            html.append("            <tr>\n");
            html.append("                <td>Validation Exceptions</td>\n");
            html.append("                <td>" + "" + "</td>\n");
            html.append("            </tr>\n");
            html.append("            <tr>\n");
            html.append("                <td>The full session data</td>\n");
            String fullData = "";
            try {
                fullData = prettyPrintJsonUsingDefaultPrettyPrinter(session.toJson());
            } catch (JsonProcessingException e) {
                fullData = "Error while parsing the session data";
            }
            html.append("                <td><pre><code class=\"language-html\">" + fullData + "</code></pre></td>\n");
            html.append("            </tr>\n");
            html.append("        </tbody>\n");
            html.append("    </table>\n");
            html.append("</body>\n");
            html.append("</html>\n");
            } else {
                // Session not found
                html.append("<!DOCTYPE html>\n");
                html.append("<html lang=\"en\">\n");
                html.append("<head>\n");
                html.append("    <meta charset=\"UTF-8\">\n");
                html.append("    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n");
                html.append("    <title>Details of Session</title>\n");
                html.append("    <style>\n");
                html.append("        body {\n");
                html.append("            font-family: Arial, sans-serif;\n");
                html.append("            margin: 20px;\n");
                html.append("        }\n");
                html.append("        h1 {\n");
                html.append("            text-align: center;\n");
                html.append("        }\n");
                html.append("        table {\n");
                html.append("            width: 50%;\n");
                html.append("            margin: 0 auto;\n");
                html.append("            border-collapse: collapse;\n");
                html.append("        }\n");
                html.append("        th, td {\n");
                html.append("            border: 1px solid #ddd;\n");
                html.append("            padding: 8px;\n");
                html.append("            text-align: center;\n");
                html.append("        }\n");
                html.append("        th {\n");
                html.append("            background-color: #f2f2f2;\n");
                html.append("        }\n");
                html.append("    </style>\n");
                html.append("</head>\n");
                html.append("<body>\n");
                html.append("    <h1>Details of Session</h1>\n");
                html.append("    <table>\n");
                html.append("        <tbody>\n");
                html.append("            <tr>\n");
                html.append("                <td>No matching session</td>\n");
                html.append("            </tr>\n");
                html.append("        </tbody>\n");
                html.append("    </table>\n");
                html.append("</body>\n");
                html.append("</html>\n");
            }

            return html.toString();
    }

    public String getAllSessionsAsHtml() {
        StringBuilder html = new StringBuilder();

        html.append("<!DOCTYPE html>\n");
        html.append("<html lang=\"en\">\n");
        html.append("<head>\n");
        html.append("    <meta charset=\"UTF-8\">\n");
        html.append("    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n");
        html.append("    <title>Admin Diagnostics</title>\n");
        html.append("    <style>\n");
        html.append("        body {\n");
        html.append("            font-family: Arial, sans-serif;\n");
        html.append("            margin: 20px;\n");
        html.append("        }\n");
        html.append("        h1 {\n");
        html.append("            text-align: center;\n");
        html.append("        }\n");
        html.append("        table {\n");
        html.append("            width: 100%;\n");
        html.append("            border-collapse: collapse;\n");
        html.append("            margin: 20px 0;\n");
        html.append("        }\n");
        html.append("        th, td {\n");
        html.append("            border: 1px solid #ddd;\n");
        html.append("            padding: 8px;\n");
        html.append("            text-align: center;\n");
        html.append("        }\n");
        html.append("        th {\n");
        html.append("            background-color: #f2f2f2;\n");
        html.append("        }\n");
        html.append("    </style>\n");
        html.append("</head>\n");
        html.append("<body>\n");
        html.append("    <h1>Admin Diagnostics</h1>\n");
        html.append("    <table>\n");
        html.append("        <thead>\n");
        html.append("            <tr>\n");
        html.append("                <th>Session Id</th>\n");
        html.append("                <th>QE Identifier</th>\n");
        html.append("                <th>Device Id</th>\n");
        html.append("                <th>Version</th>\n");
        html.append("                <th>Started At</th>\n");
        html.append("                <th>DataLake Submission Status</th>\n");
        html.append("                <th>DataLake Submission Start Time</th>\n");
        html.append("                <th>DataLake Submission End Time</th>\n");
        html.append("                <th>DataLake Submission Process TIme (ms)</th>\n");
        html.append("            </tr>\n");
        html.append("        </thead>\n");
        html.append("        <tbody>\n");

        if(sessions.size() == 0) {
                html.append("            <tr>\n");
                html.append("No data in session.\n");
                html.append("            </tr>\n");
        } else {
            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            for (Map.Entry<String, OrchestrationSession> entry : sessions.entrySet()) {
                OrchestrationSession session = entry.getValue();
                html.append("            <tr>\n");
                //html.append("                <td>" + session.getOrchSessionId() + "</td>\n");

                html.append("                <td><a href=\"/admin/diagnostics/"+ session.getOrchSessionId() +"\">" + session.getOrchSessionId() + "</a></td>\n");
                html.append("                <td>" + session.getQeIdentifier() + "</td>\n");
                html.append("                <td>" + session.getDeviceId() + "</td>\n");
                html.append("                <td>" + session.getVersion() + "</td>\n");
                html.append("                <td>" + session.getOrchStartedAt() + "</td>\n");
                html.append("                <td>" + session.getShinnyDataLakeSubmissionStatus() + "</td>\n");
                if (session.getShinnyDataLakeSubmissionStartTime() != 0) {
                    html.append("                <td>" + dateFormat.format(new Date(session.getShinnyDataLakeSubmissionStartTime())) + "</td>\n");
                } else {
                html.append("                <td></td>\n");
                }
                if (session.getShinnyDataLakeSubmissionStartTime() != 0) {
                    html.append("                <td>" + dateFormat.format(new Date(session.getShinnyDataLakeSubmissionEndTime())) + "</td>\n");
                } else {
                html.append("                <td></td>\n");
                }
                html.append("                <td>" + (session.getShinnyDataLakeSubmissionEndTime() - session.getShinnyDataLakeSubmissionStartTime()) + " ms</td>\n");
            }
        }
        
        html.append("        </tbody>\n");
        html.append("    </table>\n");
        html.append("</body>\n");
        html.append("</html>\n");

        return html.toString();
    }

    public OrchestrationSession findSessionByKey(String key) {
        for (Map.Entry<String, OrchestrationSession> entry : sessions.entrySet()) {
            if (entry.getKey().equals(key)) {
                return entry.getValue();
            }
        }
        // Key not found
        return null;
    }

}