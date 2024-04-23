package ca.uhn.fhir.techbd;

import ca.uhn.fhir.context.FhirContext;
import ca.uhn.fhir.parser.IParser;
import ca.uhn.fhir.rest.annotation.Search;
import ca.uhn.fhir.rest.annotation.Validate;
import ca.uhn.fhir.rest.param.StringParam;
import ca.uhn.fhir.rest.server.IResourceProvider;
import ca.uhn.fhir.rest.server.exceptions.UnprocessableEntityException;

import org.hl7.fhir.r4.model.Patient;
import org.hl7.fhir.r4.model.Patient.PatientCommunicationComponent;
import org.hl7.fhir.r4.model.codesystems.OrganizationType;
import org.hl7.fhir.r4.model.Extension;
import org.hl7.fhir.r4.model.Address;
import org.hl7.fhir.r4.model.Bundle;
import org.hl7.fhir.r4.model.Bundle.BundleEntryComponent;
import org.hl7.fhir.r4.model.CodeSystem;
import org.hl7.fhir.r4.model.CodeType;
import org.hl7.fhir.r4.model.CodeableConcept;
import org.hl7.fhir.r4.model.Coding;
import org.hl7.fhir.r4.model.Encounter;
import org.hl7.fhir.r4.model.HumanName;
import org.hl7.fhir.r4.model.IdType;
import org.hl7.fhir.r4.model.Identifier;
import org.apache.commons.configuration.ConfigurationException;
import org.apache.commons.configuration.PropertiesConfiguration;
//import org.hl7.fhir.dstu3.model.Consent;
import org.hl7.fhir.r4.model.Consent;
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

import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@RestController
public class FHIRBundleValidator implements IResourceProvider {

    private static String folderPath;
    private static String profile;
    private static String zipFileName;
    static FhirContext context = FhirContext.forR4();

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
        zipFileName = config.getString("zipFileName");
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

    @Create
    public MethodOutcome createBundle(@ResourceParam Bundle thebundle, @IdParam(optional = true) IIdType id,
            @OptionalParam(name = "x") String xValue) {

        // Accessing x parameter from URL
        if (xValue != null) {
            // Process x parameter if needed
            System.out.println("Value of x parameter: " + xValue);
        }
        if (thebundle.getIdentifier().getValue().isEmpty()) {
            /*
             * It is also possible to pass an OperationOutcome resource
             * to the UnprocessableEntityException if you want to return
             * a custom populated OperationOutcome. Otherwise, a simple one
             * is created using the string supplied below.
             */
            throw new UnprocessableEntityException(Msg.code(636) + "No identifier supplied");
        }
        // Pass the bundle to create CSV files
        createAhcHrsnEltArtifacts(thebundle, false);

        // This method returns a MethodOutcome object
        MethodOutcome retVal = new MethodOutcome();
        retVal.setId(new IdType("Bundle", thebundle.getIdentifier().getValue(), "1"));

        // Can also add an OperationOutcome resource to return
        // This part is optional though:
        OperationOutcome outcome = new OperationOutcome();
        outcome.addIssue().setDiagnostics("One minor issue detected");
        retVal.setOperationOutcome(outcome);
        return retVal;
    }

    // ahc-hrsn-elt
    private static void createAhcHrsnEltArtifacts(Bundle bundle, boolean zipFlag) {
        // Create CSV files for each type of data
        createScreeningCsv(bundle);
        createQeAdminDataCsv(bundle);
        createDemographicDataCsv(bundle);

        String[] fileNames = { "SCREENING.csv", "QE_ADMIN_DATA.csv", "DEMOGRAPHIC_DATA.csv" };

        // Specify the name of the output zip file
        String zipFilePath = folderPath + zipFileName;

        // Create the zip file
        try (FileOutputStream fos = new FileOutputStream(zipFilePath);
                ZipOutputStream zos = new ZipOutputStream(fos)) {

            // Iterate over the list of file names
            for (String fileName : fileNames) {
                // Create a FileInputStream to read each CSV file
                try (FileInputStream fis = new FileInputStream(folderPath + fileName)) {
                    // Create a new zip entry
                    ZipEntry zipEntry = new ZipEntry(fileName);
                    // Add the zip entry to the zip output stream
                    zos.putNextEntry(zipEntry);

                    // Write the contents of the CSV file to the zip output stream
                    byte[] buffer = new byte[1024];
                    int length;
                    while ((length = fis.read(buffer)) >= 0) {
                        zos.write(buffer, 0, length);
                    }
                    // Close the zip entry
                    zos.closeEntry();
                }
            }

            // Close the zip output stream
            zos.finish();
            System.out.println("Zip file created successfully!");

            // If zipFlag is false, convert the zip file to base64 string
            if (!zipFlag) {
                byte[] zipFileContent = Files.readAllBytes(Paths.get(zipFilePath));
                String base64String = Base64.getEncoder().encodeToString(zipFileContent);
                System.out.println("Base64 representation of the zip file:");
                System.out.println(base64String);

                // TODO; REMOVE THIS BLOCK ONCE CHECK WHETHER UNZIPPING WORK PROPERLY
                /*
                 * byte[] zipBytes = Base64.getDecoder().decode(base64String);
                 * String zipFileName1 = "output_unzipped.zip";
                 * String zipFilePath1 = folderPath + zipFileName1;
                 * try (FileOutputStream fos1 = new FileOutputStream(zipFilePath1)) {
                 * fos1.write(zipBytes); // Use fos1 here instead of fos
                 * System.out.println("Unzipped base 64 string");
                 * } catch (IOException e) {
                 * e.printStackTrace();
                 * }
                 */

            }

        } catch (IOException e) {
            e.printStackTrace();
        }

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
                // Extracting encounter information and appending to CSV builder
                encounterId = encounter.getId();

                // Extracting Encounter Class information
                if (encounter.hasClass_()) {
                    encounterClassCode = encounter.getClass_().getCode();
                    encounterClassCodeDescription = encounter.getClass_().getDisplay();
                    encounterClassCodeSystem = encounter.getClass_().getSystem();
                }

                // Extracting Encounter Status information
                if (encounter.hasStatus()) {
                    encounterStatusCode = encounter.getStatus().toCode();
                    encounterStatusCodeDescription = encounter.getStatus().getDisplay();
                    encounterStatusCodeSystem = "http://hl7.org/fhir/R4/valueset-encounter-status.html"; // Assuming a
                                                                                                         // default
                                                                                                         // value
                }

                // Extracting Encounter Type information
                if (!encounter.getType().isEmpty()) {
                    encounterTypeCode = encounter.getType().get(0).getCodingFirstRep().getCode();
                    encounterTypeCodeDescription = encounter.getType().get(0).getCodingFirstRep().getDisplay();
                    encounterTypeCodeSystem = encounter.getType().get(0).getCodingFirstRep().getSystem();
                }

            }

        }
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

                        // TODO:
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

                    sexAtBirthCodeDescription = "";
                    sexAtBirthCodeSystem = "";

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
