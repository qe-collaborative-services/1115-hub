## **1115-hub Reference Files**

## **administrative-sex-reference.csv**

**Source:** https://terminology.hl7.org/5.5.0/CodeSystem-v3-AdministrativeGender.html

**Purpose Of file:** To ensure accurate medical documentation based on a person's anatomical or biological sex assigned at birth.

## **ahc-cross-walk.csv**

**Source:** [https://github.com/qe-collaborative-services/1115-hub/blob/main/support/docs/specifications/ahc-hrsn-elt/screening/ahc-hrsn-2024-03-08-omnibus-rules.xlsx](https://github.com/qe-collaborative-services/1115-hub/blob/main/support/docs/specifications/ahc-hrsn-elt/screening/ahc-hrsn-2024-03-08-omnibus-rules.xlsx)

**Purpose Of file:** This file is used as a reference data for the ahc hrns screening data (https://www.cms.gov/priorities/innovation/files/worksheets/ahcm-screeningtool.pdf)

**Changes from the original:**

- Added QUESTION_SLNO for identifying the Observation: The observation name need to display in FHIR Bundle as ObservationResponseQuestion_{QUESTION_SLNO}.
- Added QUESTION_SLNO_REFERENCE: In Score Reference , we need to add the calculation QUESTION_SLNO and which is used to relate the score
- Added CALCULATED_FIELD: The calculated field is used as a flag to identify the particular question is a calculation {TRUE}
- Score Field: Remove the calculation logic from Score field and need to add that as a Business Logic Removed leading and trailing spaces from each column
- Removed calculation descriptions from Score Field
- Added {Score} in UCUM Unit in Q20
- Changed the field Name from UCUM Units to UCUM_UNITS

## **business-rules.csv**
**Source:** [https://github.com/qe-collaborative-services/1115-hub/blob/main/support/docs/specifications/ahc-hrsn-elt/screening/ahc-hrsn-2024-03-08-omnibus-rules.xlsx](https://github.com/qe-collaborative-services/1115-hub/blob/main/support/docs/specifications/ahc-hrsn-elt/screening/ahc-hrsn-2024-03-08-omnibus-rules.xlsx)

**Purpose Of file:** Which defines the rules for validating, verifying, and converting the data from the input files

## **encounter-class-reference.csv**

**Source:** [http://terminology.hl7.org/CodeSystem/v3-ActCode](http://terminology.hl7.org/CodeSystem/v3-ActCode)

**Purpose Of file:**  To categorize patient-provider interactions for billing and reimbursement purposes


## **encounter-status-code-reference.csv**

**Source:** [http://hl7.org/fhir/encounter-status](http://hl7.org/fhir/encounter-status)

**Purpose Of file:** To denote the current state or status of a patient encounter, such as scheduled, in progress, completed, or cancelled.


## **encounter-type-code-reference.csv**

**Source:**  [http://hl7.org/fhir/us/core/ValueSet/us-core-encounter-type](http://hl7.org/fhir/us/core/ValueSet/us-core-encounter-type)

**Purpose Of file:** To classify the nature or purpose of patient-provider interactions, such as outpatient visit, inpatient admission, or emergency room visit.

## **ethnicity-reference.csv**
  

**Source:**  [http://hl7.org/fhir/us/core/StructureDefinition/us-core-ethnicity](http://hl7.org/fhir/us/core/StructureDefinition/us-core-ethnicity)

**Purpose Of file:** To capture demographic data for understanding healthcare disparities, tailoring treatment, and ensuring culturally competent care

## **gender-identity-reference.csv**

**Source:**  [https://github.com/qe-collaborative-services/1115-hub/blob/main/src/ahc-hrsn-elt/reference-data/gender-identity-reference.csv](https://github.com/qe-collaborative-services/1115-hub/blob/main/src/ahc-hrsn-elt/reference-data/gender-identity-reference.csv )

**Purpose Of file:** [Provided within the omnibus-rule workbook as separate sheet (GENDER_IDENTITY)](http://snomed.info/sct)
To respect individual identity, provide inclusive care, and address specific healthcare needs.

## **preferred-language-reference.csv**  

**Source:**  [https://www.loc.gov/standards/iso639-2/php/code_list.php](https://www.loc.gov/standards/iso639-2/php/code_list.php)

**Purpose Of file:** To ensure effective communication and delivery of care for patients with diverse linguistic backgrounds.

## **race-reference.csv**
**Source:**  [http://hl7.org/fhir/us/core/StructureDefinition/us-core-race](http://hl7.org/fhir/us/core/StructureDefinition/us-core-race)

**Purpose Of file:** To understand and address health disparities among diverse population groups, improving healthcare equity and outcomes. 

## **screening-status-code-reference.csv**

**Source:**  [https://hl7.org/fhir/codesystem-observation-status.html](https://hl7.org/fhir/codesystem-observation-status.html)

**Purpose Of file:** To track and manage preventive health screenings for various conditions, facilitating early detection and intervention.

## **sdoh-domain-reference.csv**

**Source:**  [http://hl7.org/fhir/us/sdoh-clinicalcare/STU2.1/CodeSystem-SDOHCC-CodeSystemTemporaryCodes.html](http://hl7.org/fhir/us/sdoh-clinicalcare/STU2.1/CodeSystem-SDOHCC-CodeSystemTemporaryCodes.html)

**Purpose Of file:** To address non-medical factors such as socioeconomic status, education, and environment that influence health outcomes and disparities

## **sex-at-birth-reference.csv**


**Source:**  [https://terminology.hl7.org/5.5.0/CodeSystem-v3-AdministrativeGender.html](https://terminology.hl7.org/5.5.0/CodeSystem-v3-AdministrativeGender.html)

**Purpose Of file:** To provide accurate medical information for diagnosis, treatment, and research, considering biological differences between sexes.

## **sexual-orientation-reference.csv**


**Source:**  [https://djq7jdt8kb490.cloudfront.net/1115/StructureDefinition-shinny-patient-definitions.html#Patient.extension:sexual-orientation](https://djq7jdt8kb490.cloudfront.net/1115/StructureDefinition-shinny-patient-definitions.html#Patient.extension:sexual-orientation)

**Purpose Of file:** To ensure culturally competent care and address specific health needs of individuals, promoting inclusivity and tailored healthcare services.