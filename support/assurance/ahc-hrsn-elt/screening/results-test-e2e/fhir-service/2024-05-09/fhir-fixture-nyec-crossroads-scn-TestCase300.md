# File evaluation against various validators

## Files tested 

- [fhir-fixture-nyec-crossroads-scn-TestCase300.json](fhir-fixture-nyec-crossroads-scn-TestCase300.json)

## NYeC expectations 

```json

{
  "testcase": 300,
  "csvoutputS3Bucket": "certification-engine-output",
  "testcasetype": "POSITIVE",
  "expectedResult": "Test Case 300 should succcessfully be processed by the QE and forwarded to NYeC.  The MPI for the patient should be added to the Patient resource."
}
```

## Legacy Inferno public site

[https://inferno.healthit.gov/validator/](https://inferno.healthit.gov/validator/)

```
Validated the uploaded resource against the http://shinny.org/StructureDefinition/SHINNYBundleProfile StructureDefinition
Validation errors:
Bundle: Bundle.link: max allowed = 0, but found 1 (from http://shinny.org/StructureDefinition/SHINNYBundleProfile|0.3) on line 1. 
Bundle: Bundle.timestamp: minimum required = 1, but only found 0 (from http://shinny.org/StructureDefinition/SHINNYBundleProfile|0.3) on line 1. 
Bundle: Bundle.total: max allowed = 0, but found 1 (from http://shinny.org/StructureDefinition/SHINNYBundleProfile|0.3) on line 1. 
Bundle: Constraint failed: bdl-1: 'total only when a search or history' (defined in http://hl7.org/fhir/StructureDefinition/Bundle) on line 1. 
Bundle.id: Invalid Resource id: Invalid Characters ('0978bab8-c510-455c-8f10-f6772c0143f6_1793') on line 3. 
Bundle.meta: Unknown profile http://shinny.org/StructureDefinition/SHINNYMeta on line 4. 
Bundle.entry[0].resource/*Patient/CNYSCN~bronx-20240417-testcase1-MRN*/.id: Invalid Resource id: Invalid Characters ('CNYSCN~bronx-20240417-testcase1-MRN') on line 23. 
Bundle.entry[2].resource/*Encounter/cnyscn~bronxxbgu1so3y4*/.id: Invalid Resource id: Invalid Characters ('cnyscn~bronxxbgu1so3y4') on line 146. 
Bundle.entry[2].resource/*Encounter/cnyscn~bronxxbgu1so3y4*/.type[0].coding[0].code: Unknown code '405672008' in the CodeSystem 'http://snomed.info/sct' version '1.0.0' on line 175. 
Bundle.entry[2].resource/*Encounter/cnyscn~bronxxbgu1so3y4*/.period: Constraint failed: per-1: 'If present, start SHALL have a lower value than end' on line 189. 
Bundle.entry[3].resource/*Consent/Consent_CNYSCN~bronx-20240417-testcase1-MRN*/: Constraint failed: ppc-1: 'Either a Policy or PolicyRule' on line 211. 
Bundle.entry[3].resource/*Consent/Consent_CNYSCN~bronx-20240417-testcase1-MRN*/.id: Invalid Resource id: Invalid Characters ('Consent_CNYSCN~bronx-20240417-testcase1-MRN') on line 213. 
Bundle.entry[3].resource/*Consent/Consent_CNYSCN~bronx-20240417-testcase1-MRN*/.category[0].coding[0].display: Wrong Display Name 'Patient Consent' for http://loinc.org#59284-0. Valid display is one of 14 choices: 'Consent Document', 'Consent' (en-US), '?????' (zh-CN), '????' (zh-CN), '??' (zh-CN), '?????? ???????' (zh-CN), '?? ??????' (zh-CN), '??? - ?? ?????????????????????????????????????????????????????????????????????????????????????????????????????' (zh-CN), '???' (zh-CN), '?? ???' (zh-CN), '????? ????' (zh-CN), '??????' (zh-CN), '???????? ??' (zh-CN) or 'Documentazione dell'ontologia Osservazione Punto nel tempo (episodio)' (it-IT) (for the language(s) '--') on line 228. 
Bundle.entry[4].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_1*/.id: Invalid Resource id: Invalid Characters ('dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_1') on line 260. 
Bundle.entry[4].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_1*/.code.coding[0].display: Wrong Display Name 'How hard is it for you to pay for the very basics like food, housing, medical care, and heating? Would you say it is' for http://loinc.org#76513-1. Valid display is one of 2 choices: 'How hard is it for you to pay for the very basics like food, housing, medical care, and heating' or 'How hard is it for you to pay for the very basics like food, housing, medical care, and heating?' (en-US) (for the language(s) '--') on line 305. 
Bundle.entry[4].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_1*/.effective.ofType(dateTime): If a date has a time, it must have a timezone on line 321. 
Bundle.entry[5].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_2*/.id: Invalid Resource id: Invalid Characters ('dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_2') on line 341. 
Bundle.entry[5].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_2*/.code.coding[0].display: Wrong Display Name 'On average, how many minutes did you usually spend exercising at this level on one of those days?' for http://loinc.org#68516-4. Valid display is one of 2 choices: 'On those days that you engage in moderate to strenuous exercise, how many minutes, on average, do you exercise' or 'On those days that you engage in moderate to strenuous exercise, how many minutes, on average, do you exercise?' (en-US) (for the language(s) '--') on line 386. 
Bundle.entry[5].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_2*/.effective.ofType(dateTime): If a date has a time, it must have a timezone on line 402. 
Bundle.entry[6].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_3*/.id: Invalid Resource id: Invalid Characters ('dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_3') on line 422. 
Bundle.entry[6].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_3*/.code.coding[0].display: Wrong Display Name 'Do you speak a language other than English at home?' for http://loinc.org#97027-7. Valid display is 'Speaks a language other than English at home' (for the language(s) '--') on line 467. 
Bundle.entry[6].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_3*/.effective.ofType(dateTime): If a date has a time, it must have a timezone on line 483. 
Bundle.entry[7].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_4*/.id: Invalid Resource id: Invalid Characters ('dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_4') on line 503. 
Bundle.entry[7].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_4*/.code.coding[0].display: Wrong Display Name 'Little interest or pleasure in doing things?' for http://loinc.org#44250-9. Valid display is 'Little interest or pleasure in doing things in last 2 weeks' (for the language(s) '--') on line 548. 
Bundle.entry[7].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_4*/.effective.ofType(dateTime): If a date has a time, it must have a timezone on line 564. 
Bundle.entry[8].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_5*/.id: Invalid Resource id: Invalid Characters ('dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_5') on line 584. 
Bundle.entry[8].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_5*/.code.coding[0].display: Wrong Display Name 'How often do you feel lonely or isolated from those around you?' for http://loinc.org#93159-2. Valid display is 'How often do you feel lonely or isolated from those around you during assessment period [CMS Assessment]' (for the language(s) '--') on line 629. 
Bundle.entry[8].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_5*/.effective.ofType(dateTime): If a date has a time, it must have a timezone on line 645. 
Bundle.entry[9].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_6*/.id: Invalid Resource id: Invalid Characters ('dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_6') on line 665. 
Bundle.entry[9].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_6*/.code.coding[0].display: Wrong Display Name 'How many times in the past 12 months have you used tobacco products (like cigarettes, cigars, snuff, chew, electronic cigarettes)?' for http://loinc.org#96842-0. Valid display is one of 32 choices: 'How often have you used any tobacco product in past 12 months', 'Tobacco freq 12Mo' (en-US), '1?' (zh-CN), '4??? ???' (zh-CN), '?????' (zh-CN), '???' (zh-CN), '??????????' (zh-CN), '????' (zh-CN), '???????' (zh-CN), '??' (zh-CN), '??? ??????' (zh-CN), '??? - ?? ???????????' (zh-CN), '??/??' (zh-CN), '???????????' (zh-CN), '???????????(????)' (zh-CN), '????????' (zh-CN), '?????(????)' (zh-CN), '????????(????) ????????? ?????????.????' (zh-CN), '?????????.?????' (zh-CN), '?????????.??????' (zh-CN), '?????????.??' (zh-CN), '?????????.???' (zh-CN), '?????????.????' (zh-CN), '???????????.????' (zh-CN), '???????????.?????' (zh-CN), '???????????.??????' (zh-CN), '???????????.??' (zh-CN), '???????????.???' (zh-CN), '???????????.???? ??????????? ???12???1????????????????????????????????????????? ????' (zh-CN), '??????' (zh-CN), '?????? ???????' (zh-CN) or 'Anamnesi Indice numerico paziente Quanto spesso ha usato qualsiasi prodotto del tabacco nei 12 mesi passati' (it-IT) (for the language(s) '--') on line 710. 
Bundle.entry[9].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_6*/.effective.ofType(dateTime): If a date has a time, it must have a timezone on line 726. 
Bundle.entry[10].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_7*/.id: Invalid Resource id: Invalid Characters ('dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_7') on line 746. 
Bundle.entry[10].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_7*/.effective.ofType(dateTime): If a date has a time, it must have a timezone on line 807. 
Bundle.entry[11].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_8*/.id: Invalid Resource id: Invalid Characters ('dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_8') on line 827. 
Bundle.entry[11].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_8*/.effective.ofType(dateTime): If a date has a time, it must have a timezone on line 888. 
Bundle.entry[12].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_9*/.id: Invalid Resource id: Invalid Characters ('dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_9') on line 908. 
Bundle.entry[12].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_9*/.code.coding[0].display: Wrong Display Name 'Do you want help with school or training? For example, starting or completing job training or getting a high school diploma, GED or equivalent.' for http://loinc.org#96782-8. Valid display is 'Wants help with school or training' (for the language(s) '--') on line 953. 
Bundle.entry[12].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_9*/.effective.ofType(dateTime): If a date has a time, it must have a timezone on line 969. 
Bundle.entry[13].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_10*/.id: Invalid Resource id: Invalid Characters ('dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_10') on line 989. 
Bundle.entry[13].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_10*/.code.coding[0].display: Wrong Display Name 'In the last 30 days, other than the activities you did for work, on average, how many days per week did you engage in moderate exercise (like walking fast, running, jogging, dancing, swimming, biking, or other similar activities)' for http://loinc.org#89555-7. Valid display is 'How many days per week did you engage in moderate to strenuous physical activity in the last 30 days' (for the language(s) '--') on line 1034. 
Bundle.entry[13].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_10*/.effective.ofType(dateTime): If a date has a time, it must have a timezone on line 1050. 
Bundle.entry[14].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_11*/.id: Invalid Resource id: Invalid Characters ('dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_11') on line 1070. 
Bundle.entry[14].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_11*/.code.coding[0].display: Wrong Display Name 'Feeling down, depressed, or hopeless?' for http://loinc.org#44255-8. Valid display is 'Feeling down, depressed, or hopeless in last 2 weeks' (for the language(s) '--') on line 1115. 
Bundle.entry[14].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_11*/.effective.ofType(dateTime): If a date has a time, it must have a timezone on line 1131. 
Bundle.entry[15].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_12*/.id: Invalid Resource id: Invalid Characters ('dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_12') on line 1151. 
Bundle.entry[15].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_12*/.code.coding[0].display: Wrong Display Name 'How many times in the past year have you used prescription drugs for non-medical reasons?' for http://loinc.org#95530-2. Valid display is one of 29 choices: 'Prescription drug use for non-medical reasons in the past year', 'Prescription drug use 1Y' (en-US), '??' (zh-CN), '12??' (zh-CN), '4???' (zh-CN), '52???' (zh-CN), '52? ???' (zh-CN), '?????' (zh-CN), '???' (zh-CN), '??????????' (zh-CN), '????' (zh-CN), '???????' (zh-CN), '??? ??????' (zh-CN), '??? - ?? ????????? ?????????.????' (zh-CN), '?????????.?????' (zh-CN), '?????????.??????' (zh-CN), '?????????.??' (zh-CN), '?????????.???' (zh-CN), '?????????.????' (zh-CN), '???????????.????' (zh-CN), '???????????.?????' (zh-CN), '???????????.??????' (zh-CN), '???????????.??' (zh-CN), '???????????.???' (zh-CN), '???????????.???? ??????????? ?????????????????????????????????????????????????????????????????????????????????????????????????????' (zh-CN), '?? ?? ??' (zh-CN), '?? ??? ??????? ??? ??' (zh-CN), '???? ?? ????????????????????????????????? ??? ?????1??1Y??????????????????????' (zh-CN) or 'Anamnesi Osservazione paziente Uso di farmaci su prescrizione per motivi non medici nell'anno passato' (it-IT) (for the language(s) '--') on line 1196. 
Bundle.entry[15].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_12*/.effective.ofType(dateTime): If a date has a time, it must have a timezone on line 1212. 
Bundle.entry[16].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_13*/.id: Invalid Resource id: Invalid Characters ('dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_13') on line 1232. 
Bundle.entry[16].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_13*/.code.coding[0].display: Wrong Display Name 'Do you want help finding or keeping work or a job?' for http://loinc.org#96780-2. Valid display is 'Wants help finding or keeping work or a job' (for the language(s) '--') on line 1277. 
Bundle.entry[16].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_13*/.effective.ofType(dateTime): If a date has a time, it must have a timezone on line 1293. 
Bundle.entry[17].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_14*/.id: Invalid Resource id: Invalid Characters ('dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_14') on line 1313. 
Bundle.entry[17].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_14*/.code.coding[0].display: Wrong Display Name 'No Information' for http://terminology.hl7.org/CodeSystem/v3-NullFlavor#NI - should be 'NoInformation' (en) (for the language(s) '--') on line 1358. 
Bundle.entry[17].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_14*/.effective.ofType(dateTime): If a date has a time, it must have a timezone on line 1374. 
Bundle.entry[18].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_15*/.id: Invalid Resource id: Invalid Characters ('dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_15') on line 1392. 
Bundle.entry[18].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_15*/.code.coding[0].display: Wrong Display Name 'How many times in the past year have you used illegal drugs?' for http://loinc.org#68524-8. Valid display is one of 35 choices: 'How many times in the past year have you used an illegal drug or used a prescription medication for non-medical reasons', 'Illegal drug non-med reason past Y nRate' (en-US), 'How many times in the past year have you used an illegal drug or used a prescription medication for non-medical reasons?' (en-US), 'A ? ??' (zh-CN), '??' (zh-CN), '12??' (zh-CN), '4???' (zh-CN), '52???' (zh-CN), '52? ??????' (zh-CN), '??? - ?? ???????????' (zh-CN), '??/??' (zh-CN), '?????' (zh-CN), '???????????' (zh-CN), '???????????(????)' (zh-CN), '????????' (zh-CN), '?????(????)' (zh-CN), '????????(????) ????????? ?????????.????' (zh-CN), '?????????.?????' (zh-CN), '?????????.??????' (zh-CN), '?????????.??' (zh-CN), '?????????.???' (zh-CN), '?????????.????' (zh-CN), '???????????.????' (zh-CN), '???????????.?????' (zh-CN), '???????????.??????' (zh-CN), '???????????.??' (zh-CN), '???????????.???' (zh-CN), '???????????.???? ??????????? ???????' (zh-CN), '???' (zh-CN), '??????? ?????1??????????????????????????????????????????????? ????' (zh-CN), '????' (zh-CN), '???? ?? ??' (zh-CN), '?? ??? ??????? ??? ??' (zh-CN), '???? ?? ???' (zh-CN) or 'Anamnesi Indice numerico paziente' (it-IT) (for the language(s) '--') on line 1437. 
Bundle.entry[18].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_15*/.effective.ofType(dateTime): If a date has a time, it must have a timezone on line 1453. 
Bundle.entry[19].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_16*/.id: Invalid Resource id: Invalid Characters ('dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_16') on line 1473. 
Bundle.entry[19].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_16*/.code.coding[0].display: Wrong Display Name 'How many times in the past 12 months have you had 5 or more drinks in a day (males) or 4 or more drinks in a day (females)?' for http://loinc.org#68517-2. Valid display is one of 2 choices: 'How many times in the past year have you have X or more drinks in a day' or 'How many times in the past year have you have X or more drinks in a day?' (en-US) (for the language(s) '--') on line 1518. 
Bundle.entry[19].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_16*/.effective.ofType(dateTime): If a date has a time, it must have a timezone on line 1534. 
Bundle.entry[20].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_17*/.id: Invalid Resource id: Invalid Characters ('dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_17') on line 1554. 
Bundle.entry[20].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_17*/.code.coding[0].display: Wrong Display Name 'Stress means a situation in which a person feels tense, restless, nervous, or anxious, or is unable to sleep at night because his or her mind is troubled all the time. Do you feel this kind of stress these days?' for http://loinc.org#93038-8. Valid display is one of 13 choices: 'Stress level', 'Stress level' (en-US), '???' (zh-CN), '?????' (zh-CN), '??????????' (zh-CN), '????' (zh-CN), '???????' (zh-CN), '??' (zh-CN), '??? ??????' (zh-CN), '??? - ?? ?????????????????????????????????????????????????????????????????????????????????????????????????????' (zh-CN), '?? ??' (zh-CN), '?? ?? ?? ????????????????????????????????????????? ? ??' (zh-CN) or 'Clinico Osservazione paziente Punto nel tempo (episodio)' (it-IT) (for the language(s) '--') on line 1599. 
Bundle.entry[20].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_17*/.effective.ofType(dateTime): If a date has a time, it must have a timezone on line 1615. 
Bundle.entry[21].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_18*/.id: Invalid Resource id: Invalid Characters ('dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_18') on line 1635. 
Bundle.entry[21].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_18*/.code.coding[0].display: Wrong Display Name 'If for any reason you need help with day-to-day activities such as bathing, preparing meals, shopping, managing finances, etc., do you get the help you need?' for http://loinc.org#96781-0. Valid display is 'Able to get help with daily activities when needed' (for the language(s) '--') on line 1680. 
Bundle.entry[21].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_18*/.effective.ofType(dateTime): If a date has a time, it must have a timezone on line 1696. 
Bundle.entry[22].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_19*/.id: Invalid Resource id: Invalid Characters ('dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_19') on line 1716. 
Bundle.entry[22].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_19*/.code.coding[0].display: Wrong Display Name 'No Information' for http://terminology.hl7.org/CodeSystem/v3-NullFlavor#NI - should be 'NoInformation' (en) (for the language(s) '--') on line 1761. 
Bundle.entry[22].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_19*/.effective.ofType(dateTime): If a date has a time, it must have a timezone on line 1777. 
Bundle.entry[23].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_Grouper1*/.id: Invalid Resource id: Invalid Characters ('dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_Grouper1') on line 1803. 
Bundle.entry[23].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_Grouper1*/.effective.ofType(dateTime): If a date has a time, it must have a timezone on line 1914. 
Validation warnings:
Bundle.meta.profile[0]: Profile reference 'http://shinny.org/StructureDefinition/shin-ny-encounter' has not been checked because it could not be found, and the validator is set to not fetch unknown profiles on line 1. 
Bundle.type: ValueSet http://shinny.org/ValueSet/SHINNYBundleTypeVS not found on line 10. 
Bundle.entry[0].resource/*Patient/CNYSCN~bronx-20240417-testcase1-MRN*/.meta.profile[0]: Profile reference 'http://shinny.org/StructureDefinition/shinny-patient' has not been checked because it could not be found, and the validator is set to not fetch unknown profiles on line 21. 
Bundle.entry[0].resource/*Patient/CNYSCN~bronx-20240417-testcase1-MRN*/.identifier[1].type: None of the codings provided are in the value set 'IdentifierType' (http://hl7.org/fhir/ValueSet/identifier-type|4.0.1), and a coding should come from this value set unless it has no suitable code (note that the validator cannot judge what is suitable) (codes = http://terminology.hl7.org/CodeSystem/v2-0203#PN) on line 77. 
Bundle.entry[0].request.method: ValueSet http://shinny.org/ValueSet/SHINNYHTTPVerbsVS not found on line 120. 
Bundle.entry[1].resource/*Organization/CNYSCN*/.meta.profile[0]: Profile reference 'http://shinny.org/StructureDefinition/shin-ny-organization' has not been checked because it could not be found, and the validator is set to not fetch unknown profiles on line 126. 
Bundle.entry[1].resource/*Organization/CNYSCN*/: Constraint failed: dom-6: 'A resource should have narrative for robust management' (defined in http://hl7.org/fhir/StructureDefinition/DomainResource) (Best Practice Recommendation) on line 126. 
Bundle.entry[1].request.method: ValueSet http://shinny.org/ValueSet/SHINNYHTTPVerbsVS not found on line 138. 
Bundle.entry[2].resource/*Encounter/cnyscn~bronxxbgu1so3y4*/.meta.profile[0]: Profile reference 'http://shinny.org/StructureDefinition/shin-ny-encounter' has not been checked because it could not be found, and the validator is set to not fetch unknown profiles on line 144. 
Bundle.entry[2].resource/*Encounter/cnyscn~bronxxbgu1so3y4*/: Constraint failed: dom-6: 'A resource should have narrative for robust management' (defined in http://hl7.org/fhir/StructureDefinition/DomainResource) (Best Practice Recommendation) on line 144. 
Bundle.entry[2].resource/*Encounter/cnyscn~bronxxbgu1so3y4*/.identifier[0].type: None of the codings provided are in the value set 'IdentifierType' (http://hl7.org/fhir/ValueSet/identifier-type|4.0.1), and a coding should come from this value set unless it has no suitable code (note that the validator cannot judge what is suitable) (codes = http://terminology.hl7.org/CodeSystem/v2-0203#VN) on line 155. 
Bundle.entry[2].request.method: ValueSet http://shinny.org/ValueSet/SHINNYHTTPVerbsVS not found on line 205. 
Bundle.entry[3].resource/*Consent/Consent_CNYSCN~bronx-20240417-testcase1-MRN*/: Constraint failed: dom-6: 'A resource should have narrative for robust management' (defined in http://hl7.org/fhir/StructureDefinition/DomainResource) (Best Practice Recommendation) on line 211. 
Bundle.entry[3].resource/*Consent/Consent_CNYSCN~bronx-20240417-testcase1-MRN*/.scope: None of the codings provided are in the value set 'Consent Scope Codes' (http://hl7.org/fhir/ValueSet/consent-scope|4.0.1), and a coding should come from this value set unless it has no suitable code (note that the validator cannot judge what is suitable) (codes = null#treatment) on line 218. 
Bundle.entry[3].resource/*Consent/Consent_CNYSCN~bronx-20240417-testcase1-MRN*/.scope.coding[0]: Coding has no system. A code with no system has no defined meaning, and it cannot be validated. A system should be provided on line 218. 
Bundle.entry[3].resource/*Consent/Consent_CNYSCN~bronx-20240417-testcase1-MRN*/.category[0]: None of the codings provided are in the value set 'Consent Category Codes' (http://hl7.org/fhir/ValueSet/consent-category|4.0.1), and a coding should come from this value set unless it has no suitable code (note that the validator cannot judge what is suitable) (codes = http://loinc.org#59284-0) on line 228. 
Bundle.entry[3].request.method: ValueSet http://shinny.org/ValueSet/SHINNYHTTPVerbsVS not found on line 252. 
Bundle.entry[4].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_1*/: Best Practice Recommendation: In general, all observations should have a performer on line 258. 
Bundle.entry[4].resource: Best Practice Recommendation: In general, all observations should have a performer on line 258. 
Bundle.entry[4].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_1*/.meta.profile[0]: Profile reference 'http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse' has not been checked because it could not be found, and the validator is set to not fetch unknown profiles on line 258. 
Bundle.entry[4].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_1*/: Constraint failed: dom-6: 'A resource should have narrative for robust management' (defined in http://hl7.org/fhir/StructureDefinition/DomainResource) (Best Practice Recommendation) on line 258. 
Bundle.entry[4].request.method: ValueSet http://shinny.org/ValueSet/SHINNYHTTPVerbsVS not found on line 333. 
Bundle.entry[5].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_2*/: Best Practice Recommendation: In general, all observations should have a performer on line 339. 
Bundle.entry[5].resource: Best Practice Recommendation: In general, all observations should have a performer on line 339. 
Bundle.entry[5].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_2*/.meta.profile[0]: Profile reference 'http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse' has not been checked because it could not be found, and the validator is set to not fetch unknown profiles on line 339. 
Bundle.entry[5].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_2*/: Constraint failed: dom-6: 'A resource should have narrative for robust management' (defined in http://hl7.org/fhir/StructureDefinition/DomainResource) (Best Practice Recommendation) on line 339. 
Bundle.entry[5].request.method: ValueSet http://shinny.org/ValueSet/SHINNYHTTPVerbsVS not found on line 414. 
Bundle.entry[6].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_3*/: Best Practice Recommendation: In general, all observations should have a performer on line 420. 
Bundle.entry[6].resource: Best Practice Recommendation: In general, all observations should have a performer on line 420. 
Bundle.entry[6].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_3*/.meta.profile[0]: Profile reference 'http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse' has not been checked because it could not be found, and the validator is set to not fetch unknown profiles on line 420. 
Bundle.entry[6].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_3*/: Constraint failed: dom-6: 'A resource should have narrative for robust management' (defined in http://hl7.org/fhir/StructureDefinition/DomainResource) (Best Practice Recommendation) on line 420. 
Bundle.entry[6].request.method: ValueSet http://shinny.org/ValueSet/SHINNYHTTPVerbsVS not found on line 495. 
Bundle.entry[7].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_4*/: Best Practice Recommendation: In general, all observations should have a performer on line 501. 
Bundle.entry[7].resource: Best Practice Recommendation: In general, all observations should have a performer on line 501. 
Bundle.entry[7].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_4*/.meta.profile[0]: Profile reference 'http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse' has not been checked because it could not be found, and the validator is set to not fetch unknown profiles on line 501. 
Bundle.entry[7].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_4*/: Constraint failed: dom-6: 'A resource should have narrative for robust management' (defined in http://hl7.org/fhir/StructureDefinition/DomainResource) (Best Practice Recommendation) on line 501. 
Bundle.entry[7].request.method: ValueSet http://shinny.org/ValueSet/SHINNYHTTPVerbsVS not found on line 576. 
Bundle.entry[8].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_5*/: Best Practice Recommendation: In general, all observations should have a performer on line 582. 
Bundle.entry[8].resource: Best Practice Recommendation: In general, all observations should have a performer on line 582. 
Bundle.entry[8].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_5*/.meta.profile[0]: Profile reference 'http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse' has not been checked because it could not be found, and the validator is set to not fetch unknown profiles on line 582. 
Bundle.entry[8].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_5*/: Constraint failed: dom-6: 'A resource should have narrative for robust management' (defined in http://hl7.org/fhir/StructureDefinition/DomainResource) (Best Practice Recommendation) on line 582. 
Bundle.entry[8].request.method: ValueSet http://shinny.org/ValueSet/SHINNYHTTPVerbsVS not found on line 657. 
Bundle.entry[9].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_6*/: Best Practice Recommendation: In general, all observations should have a performer on line 663. 
Bundle.entry[9].resource: Best Practice Recommendation: In general, all observations should have a performer on line 663. 
Bundle.entry[9].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_6*/.meta.profile[0]: Profile reference 'http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse' has not been checked because it could not be found, and the validator is set to not fetch unknown profiles on line 663. 
Bundle.entry[9].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_6*/: Constraint failed: dom-6: 'A resource should have narrative for robust management' (defined in http://hl7.org/fhir/StructureDefinition/DomainResource) (Best Practice Recommendation) on line 663. 
Bundle.entry[9].request.method: ValueSet http://shinny.org/ValueSet/SHINNYHTTPVerbsVS not found on line 738. 
Bundle.entry[10].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_7*/: Best Practice Recommendation: In general, all observations should have a performer on line 744. 
Bundle.entry[10].resource: Best Practice Recommendation: In general, all observations should have a performer on line 744. 
Bundle.entry[10].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_7*/.meta.profile[0]: Profile reference 'http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse' has not been checked because it could not be found, and the validator is set to not fetch unknown profiles on line 744. 
Bundle.entry[10].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_7*/: Constraint failed: dom-6: 'A resource should have narrative for robust management' (defined in http://hl7.org/fhir/StructureDefinition/DomainResource) (Best Practice Recommendation) on line 744. 
Bundle.entry[10].request.method: ValueSet http://shinny.org/ValueSet/SHINNYHTTPVerbsVS not found on line 819. 
Bundle.entry[11].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_8*/: Best Practice Recommendation: In general, all observations should have a performer on line 825. 
Bundle.entry[11].resource: Best Practice Recommendation: In general, all observations should have a performer on line 825. 
Bundle.entry[11].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_8*/.meta.profile[0]: Profile reference 'http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse' has not been checked because it could not be found, and the validator is set to not fetch unknown profiles on line 825. 
Bundle.entry[11].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_8*/: Constraint failed: dom-6: 'A resource should have narrative for robust management' (defined in http://hl7.org/fhir/StructureDefinition/DomainResource) (Best Practice Recommendation) on line 825. 
Bundle.entry[11].request.method: ValueSet http://shinny.org/ValueSet/SHINNYHTTPVerbsVS not found on line 900. 
Bundle.entry[12].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_9*/: Best Practice Recommendation: In general, all observations should have a performer on line 906. 
Bundle.entry[12].resource: Best Practice Recommendation: In general, all observations should have a performer on line 906. 
Bundle.entry[12].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_9*/.meta.profile[0]: Profile reference 'http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse' has not been checked because it could not be found, and the validator is set to not fetch unknown profiles on line 906. 
Bundle.entry[12].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_9*/: Constraint failed: dom-6: 'A resource should have narrative for robust management' (defined in http://hl7.org/fhir/StructureDefinition/DomainResource) (Best Practice Recommendation) on line 906. 
Bundle.entry[12].request.method: ValueSet http://shinny.org/ValueSet/SHINNYHTTPVerbsVS not found on line 981. 
Bundle.entry[13].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_10*/: Best Practice Recommendation: In general, all observations should have a performer on line 987. 
Bundle.entry[13].resource: Best Practice Recommendation: In general, all observations should have a performer on line 987. 
Bundle.entry[13].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_10*/.meta.profile[0]: Profile reference 'http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse' has not been checked because it could not be found, and the validator is set to not fetch unknown profiles on line 987. 
Bundle.entry[13].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_10*/: Constraint failed: dom-6: 'A resource should have narrative for robust management' (defined in http://hl7.org/fhir/StructureDefinition/DomainResource) (Best Practice Recommendation) on line 987. 
Bundle.entry[13].request.method: ValueSet http://shinny.org/ValueSet/SHINNYHTTPVerbsVS not found on line 1062. 
Bundle.entry[14].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_11*/: Best Practice Recommendation: In general, all observations should have a performer on line 1068. 
Bundle.entry[14].resource: Best Practice Recommendation: In general, all observations should have a performer on line 1068. 
Bundle.entry[14].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_11*/.meta.profile[0]: Profile reference 'http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse' has not been checked because it could not be found, and the validator is set to not fetch unknown profiles on line 1068. 
Bundle.entry[14].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_11*/: Constraint failed: dom-6: 'A resource should have narrative for robust management' (defined in http://hl7.org/fhir/StructureDefinition/DomainResource) (Best Practice Recommendation) on line 1068. 
Bundle.entry[14].request.method: ValueSet http://shinny.org/ValueSet/SHINNYHTTPVerbsVS not found on line 1143. 
Bundle.entry[15].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_12*/: Best Practice Recommendation: In general, all observations should have a performer on line 1149. 
Bundle.entry[15].resource: Best Practice Recommendation: In general, all observations should have a performer on line 1149. 
Bundle.entry[15].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_12*/.meta.profile[0]: Profile reference 'http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse' has not been checked because it could not be found, and the validator is set to not fetch unknown profiles on line 1149. 
Bundle.entry[15].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_12*/: Constraint failed: dom-6: 'A resource should have narrative for robust management' (defined in http://hl7.org/fhir/StructureDefinition/DomainResource) (Best Practice Recommendation) on line 1149. 
Bundle.entry[15].request.method: ValueSet http://shinny.org/ValueSet/SHINNYHTTPVerbsVS not found on line 1224. 
Bundle.entry[16].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_13*/: Best Practice Recommendation: In general, all observations should have a performer on line 1230. 
Bundle.entry[16].resource: Best Practice Recommendation: In general, all observations should have a performer on line 1230. 
Bundle.entry[16].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_13*/.meta.profile[0]: Profile reference 'http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse' has not been checked because it could not be found, and the validator is set to not fetch unknown profiles on line 1230. 
Bundle.entry[16].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_13*/: Constraint failed: dom-6: 'A resource should have narrative for robust management' (defined in http://hl7.org/fhir/StructureDefinition/DomainResource) (Best Practice Recommendation) on line 1230. 
Bundle.entry[16].request.method: ValueSet http://shinny.org/ValueSet/SHINNYHTTPVerbsVS not found on line 1305. 
Bundle.entry[17].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_14*/: Best Practice Recommendation: In general, all observations should have a performer on line 1311. 
Bundle.entry[17].resource: Best Practice Recommendation: In general, all observations should have a performer on line 1311. 
Bundle.entry[17].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_14*/.meta.profile[0]: Profile reference 'http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse' has not been checked because it could not be found, and the validator is set to not fetch unknown profiles on line 1311. 
Bundle.entry[17].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_14*/: Constraint failed: dom-6: 'A resource should have narrative for robust management' (defined in http://hl7.org/fhir/StructureDefinition/DomainResource) (Best Practice Recommendation) on line 1311. 
Bundle.entry[17].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_14*/.value.ofType(CodeableConcept).coding[0]: Coding has no system. A code with no system has no defined meaning, and it cannot be validated. A system should be provided on line 1375. 
Bundle.entry[17].request.method: ValueSet http://shinny.org/ValueSet/SHINNYHTTPVerbsVS not found on line 1384. 
Bundle.entry[18].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_15*/: Best Practice Recommendation: In general, all observations should have a performer on line 1390. 
Bundle.entry[18].resource: Best Practice Recommendation: In general, all observations should have a performer on line 1390. 
Bundle.entry[18].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_15*/.meta.profile[0]: Profile reference 'http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse' has not been checked because it could not be found, and the validator is set to not fetch unknown profiles on line 1390. 
Bundle.entry[18].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_15*/: Constraint failed: dom-6: 'A resource should have narrative for robust management' (defined in http://hl7.org/fhir/StructureDefinition/DomainResource) (Best Practice Recommendation) on line 1390. 
Bundle.entry[18].request.method: ValueSet http://shinny.org/ValueSet/SHINNYHTTPVerbsVS not found on line 1465. 
Bundle.entry[19].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_16*/: Best Practice Recommendation: In general, all observations should have a performer on line 1471. 
Bundle.entry[19].resource: Best Practice Recommendation: In general, all observations should have a performer on line 1471. 
Bundle.entry[19].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_16*/.meta.profile[0]: Profile reference 'http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse' has not been checked because it could not be found, and the validator is set to not fetch unknown profiles on line 1471. 
Bundle.entry[19].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_16*/: Constraint failed: dom-6: 'A resource should have narrative for robust management' (defined in http://hl7.org/fhir/StructureDefinition/DomainResource) (Best Practice Recommendation) on line 1471. 
Bundle.entry[19].request.method: ValueSet http://shinny.org/ValueSet/SHINNYHTTPVerbsVS not found on line 1546. 
Bundle.entry[20].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_17*/: Best Practice Recommendation: In general, all observations should have a performer on line 1552. 
Bundle.entry[20].resource: Best Practice Recommendation: In general, all observations should have a performer on line 1552. 
Bundle.entry[20].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_17*/.meta.profile[0]: Profile reference 'http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse' has not been checked because it could not be found, and the validator is set to not fetch unknown profiles on line 1552. 
Bundle.entry[20].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_17*/: Constraint failed: dom-6: 'A resource should have narrative for robust management' (defined in http://hl7.org/fhir/StructureDefinition/DomainResource) (Best Practice Recommendation) on line 1552. 
Bundle.entry[20].request.method: ValueSet http://shinny.org/ValueSet/SHINNYHTTPVerbsVS not found on line 1627. 
Bundle.entry[21].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_18*/: Best Practice Recommendation: In general, all observations should have a performer on line 1633. 
Bundle.entry[21].resource: Best Practice Recommendation: In general, all observations should have a performer on line 1633. 
Bundle.entry[21].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_18*/.meta.profile[0]: Profile reference 'http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse' has not been checked because it could not be found, and the validator is set to not fetch unknown profiles on line 1633. 
Bundle.entry[21].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_18*/: Constraint failed: dom-6: 'A resource should have narrative for robust management' (defined in http://hl7.org/fhir/StructureDefinition/DomainResource) (Best Practice Recommendation) on line 1633. 
Bundle.entry[21].request.method: ValueSet http://shinny.org/ValueSet/SHINNYHTTPVerbsVS not found on line 1708. 
Bundle.entry[22].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_19*/: Best Practice Recommendation: In general, all observations should have a performer on line 1714. 
Bundle.entry[22].resource: Best Practice Recommendation: In general, all observations should have a performer on line 1714. 
Bundle.entry[22].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_19*/.meta.profile[0]: Profile reference 'http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse' has not been checked because it could not be found, and the validator is set to not fetch unknown profiles on line 1714. 
Bundle.entry[22].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_19*/: Constraint failed: dom-6: 'A resource should have narrative for robust management' (defined in http://hl7.org/fhir/StructureDefinition/DomainResource) (Best Practice Recommendation) on line 1714. 
Bundle.entry[22].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_19*/.value.ofType(CodeableConcept).coding[0]: Coding has no system. A code with no system has no defined meaning, and it cannot be validated. A system should be provided on line 1778. 
Bundle.entry[22].request.method: ValueSet http://shinny.org/ValueSet/SHINNYHTTPVerbsVS not found on line 1795. 
Bundle.entry[23].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_Grouper1*/: Best Practice Recommendation: In general, all observations should have a performer on line 1801. 
Bundle.entry[23].resource: Best Practice Recommendation: In general, all observations should have a performer on line 1801. 
Bundle.entry[23].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_Grouper1*/.meta.profile[0]: Profile reference 'http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse' has not been checked because it could not be found, and the validator is set to not fetch unknown profiles on line 1801. 
Bundle.entry[23].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_Grouper1*/: Constraint failed: dom-6: 'A resource should have narrative for robust management' (defined in http://hl7.org/fhir/StructureDefinition/DomainResource) (Best Practice Recommendation) on line 1801. 
Bundle.entry[23].request.method: ValueSet http://shinny.org/ValueSet/SHINNYHTTPVerbsVS not found on line 1976. 
Validation information:
Bundle.entry[0].resource/*Patient/CNYSCN~bronx-20240417-testcase1-MRN*/.meta.profile[0]: Canonical URL 'http://shinny.org/StructureDefinition/shinny-patient' does not resolve on line 27. 
Bundle.entry[0].resource/*Patient/CNYSCN~bronx-20240417-testcase1-MRN*/.extension[0]: Unknown extension http://shinny.org/StructureDefinition/us-core-race on line 35. 
Bundle.entry[0].resource/*Patient/CNYSCN~bronx-20240417-testcase1-MRN*/.extension[1]: Unknown extension http://shinny.org/StructureDefinition/us-core-ethnicity on line 48. 
Bundle.entry[1].resource/*Organization/CNYSCN*/.meta.profile[0]: Canonical URL 'http://shinny.org/StructureDefinition/shin-ny-organization' does not resolve on line 132. 
Bundle.entry[2].resource/*Encounter/cnyscn~bronxxbgu1so3y4*/.meta.profile[0]: Canonical URL 'http://shinny.org/StructureDefinition/shin-ny-encounter' does not resolve on line 150. 
Bundle.entry[2].resource/*Encounter/cnyscn~bronxxbgu1so3y4*/.type[0]: Reference to draft CodeSystem http://snomed.info/sct|1.0.0 on line 175. 
Bundle.entry[2].resource/*Encounter/cnyscn~bronxxbgu1so3y4*/.subject: Details for Patient/CNYSCN~bronx-20240417-testcase1-MRN matching against profile http://hl7.org/fhir/StructureDefinition/Patient|4.0.1 on line 186. 
Bundle.entry[3].resource/*Consent/Consent_CNYSCN~bronx-20240417-testcase1-MRN*/.patient: Details for Patient/CNYSCN~bronx-20240417-testcase1-MRN matching against profile http://hl7.org/fhir/StructureDefinition/Patient|4.0.1 on line 239. 
Bundle.entry[4].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_1*/.meta.profile[0]: Canonical URL 'http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse' does not resolve on line 264. 
Bundle.entry[4].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_1*/.category[2].coding[0]: A definition for CodeSystem 'http://hl7.org/fhir/us/sdoh-clinicalcare/CodeSystem/SDOHCC-CodeSystemTemporaryCodes' could not be found, so the code cannot be validated on line 294. 
Bundle.entry[4].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_1*/.subject: Details for Patient/CNYSCN~bronx-20240417-testcase1-MRN matching against profile http://hl7.org/fhir/StructureDefinition/Patient|4.0.1 on line 315. 
Bundle.entry[4].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_1*/.encounter: Details for Encounter/cnyscn~bronxxbgu1so3y4 matching against profile http://hl7.org/fhir/StructureDefinition/Encounter|4.0.1 on line 318. 
Bundle.entry[5].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_2*/.meta.profile[0]: Canonical URL 'http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse' does not resolve on line 345. 
Bundle.entry[5].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_2*/.category[2].coding[0]: A definition for CodeSystem 'http://hl7.org/fhir/us/sdoh-clinicalcare/CodeSystem/SDOHCC-CodeSystemTemporaryCodes' could not be found, so the code cannot be validated on line 375. 
Bundle.entry[5].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_2*/.subject: Details for Patient/CNYSCN~bronx-20240417-testcase1-MRN matching against profile http://hl7.org/fhir/StructureDefinition/Patient|4.0.1 on line 396. 
Bundle.entry[5].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_2*/.encounter: Details for Encounter/cnyscn~bronxxbgu1so3y4 matching against profile http://hl7.org/fhir/StructureDefinition/Encounter|4.0.1 on line 399. 
Bundle.entry[6].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_3*/.meta.profile[0]: Canonical URL 'http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse' does not resolve on line 426. 
Bundle.entry[6].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_3*/.category[2].coding[0]: A definition for CodeSystem 'http://hl7.org/fhir/us/sdoh-clinicalcare/CodeSystem/SDOHCC-CodeSystemTemporaryCodes' could not be found, so the code cannot be validated on line 456. 
Bundle.entry[6].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_3*/.subject: Details for Patient/CNYSCN~bronx-20240417-testcase1-MRN matching against profile http://hl7.org/fhir/StructureDefinition/Patient|4.0.1 on line 477. 
Bundle.entry[6].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_3*/.encounter: Details for Encounter/cnyscn~bronxxbgu1so3y4 matching against profile http://hl7.org/fhir/StructureDefinition/Encounter|4.0.1 on line 480. 
Bundle.entry[7].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_4*/.meta.profile[0]: Canonical URL 'http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse' does not resolve on line 507. 
Bundle.entry[7].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_4*/.category[2].coding[0]: A definition for CodeSystem 'http://hl7.org/fhir/us/sdoh-clinicalcare/CodeSystem/SDOHCC-CodeSystemTemporaryCodes' could not be found, so the code cannot be validated on line 537. 
Bundle.entry[7].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_4*/.subject: Details for Patient/CNYSCN~bronx-20240417-testcase1-MRN matching against profile http://hl7.org/fhir/StructureDefinition/Patient|4.0.1 on line 558. 
Bundle.entry[7].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_4*/.encounter: Details for Encounter/cnyscn~bronxxbgu1so3y4 matching against profile http://hl7.org/fhir/StructureDefinition/Encounter|4.0.1 on line 561. 
Bundle.entry[8].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_5*/.meta.profile[0]: Canonical URL 'http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse' does not resolve on line 588. 
Bundle.entry[8].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_5*/.category[2].coding[0]: A definition for CodeSystem 'http://hl7.org/fhir/us/sdoh-clinicalcare/CodeSystem/SDOHCC-CodeSystemTemporaryCodes' could not be found, so the code cannot be validated on line 618. 
Bundle.entry[8].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_5*/.subject: Details for Patient/CNYSCN~bronx-20240417-testcase1-MRN matching against profile http://hl7.org/fhir/StructureDefinition/Patient|4.0.1 on line 639. 
Bundle.entry[8].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_5*/.encounter: Details for Encounter/cnyscn~bronxxbgu1so3y4 matching against profile http://hl7.org/fhir/StructureDefinition/Encounter|4.0.1 on line 642. 
Bundle.entry[9].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_6*/.meta.profile[0]: Canonical URL 'http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse' does not resolve on line 669. 
Bundle.entry[9].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_6*/.category[2].coding[0]: A definition for CodeSystem 'http://hl7.org/fhir/us/sdoh-clinicalcare/CodeSystem/SDOHCC-CodeSystemTemporaryCodes' could not be found, so the code cannot be validated on line 699. 
Bundle.entry[9].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_6*/.subject: Details for Patient/CNYSCN~bronx-20240417-testcase1-MRN matching against profile http://hl7.org/fhir/StructureDefinition/Patient|4.0.1 on line 720. 
Bundle.entry[9].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_6*/.encounter: Details for Encounter/cnyscn~bronxxbgu1so3y4 matching against profile http://hl7.org/fhir/StructureDefinition/Encounter|4.0.1 on line 723. 
Bundle.entry[10].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_7*/.meta.profile[0]: Canonical URL 'http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse' does not resolve on line 750. 
Bundle.entry[10].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_7*/.category[2].coding[0]: A definition for CodeSystem 'http://hl7.org/fhir/us/sdoh-clinicalcare/CodeSystem/SDOHCC-CodeSystemTemporaryCodes' could not be found, so the code cannot be validated on line 780. 
Bundle.entry[10].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_7*/.subject: Details for Patient/CNYSCN~bronx-20240417-testcase1-MRN matching against profile http://hl7.org/fhir/StructureDefinition/Patient|4.0.1 on line 801. 
Bundle.entry[10].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_7*/.encounter: Details for Encounter/cnyscn~bronxxbgu1so3y4 matching against profile http://hl7.org/fhir/StructureDefinition/Encounter|4.0.1 on line 804. 
Bundle.entry[11].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_8*/.meta.profile[0]: Canonical URL 'http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse' does not resolve on line 831. 
Bundle.entry[11].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_8*/.category[2].coding[0]: A definition for CodeSystem 'http://hl7.org/fhir/us/sdoh-clinicalcare/CodeSystem/SDOHCC-CodeSystemTemporaryCodes' could not be found, so the code cannot be validated on line 861. 
Bundle.entry[11].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_8*/.subject: Details for Patient/CNYSCN~bronx-20240417-testcase1-MRN matching against profile http://hl7.org/fhir/StructureDefinition/Patient|4.0.1 on line 882. 
Bundle.entry[11].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_8*/.encounter: Details for Encounter/cnyscn~bronxxbgu1so3y4 matching against profile http://hl7.org/fhir/StructureDefinition/Encounter|4.0.1 on line 885. 
Bundle.entry[12].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_9*/.meta.profile[0]: Canonical URL 'http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse' does not resolve on line 912. 
Bundle.entry[12].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_9*/.category[2].coding[0]: A definition for CodeSystem 'http://hl7.org/fhir/us/sdoh-clinicalcare/CodeSystem/SDOHCC-CodeSystemTemporaryCodes' could not be found, so the code cannot be validated on line 942. 
Bundle.entry[12].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_9*/.subject: Details for Patient/CNYSCN~bronx-20240417-testcase1-MRN matching against profile http://hl7.org/fhir/StructureDefinition/Patient|4.0.1 on line 963. 
Bundle.entry[12].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_9*/.encounter: Details for Encounter/cnyscn~bronxxbgu1so3y4 matching against profile http://hl7.org/fhir/StructureDefinition/Encounter|4.0.1 on line 966. 
Bundle.entry[13].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_10*/.meta.profile[0]: Canonical URL 'http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse' does not resolve on line 993. 
Bundle.entry[13].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_10*/.category[2].coding[0]: A definition for CodeSystem 'http://hl7.org/fhir/us/sdoh-clinicalcare/CodeSystem/SDOHCC-CodeSystemTemporaryCodes' could not be found, so the code cannot be validated on line 1023. 
Bundle.entry[13].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_10*/.subject: Details for Patient/CNYSCN~bronx-20240417-testcase1-MRN matching against profile http://hl7.org/fhir/StructureDefinition/Patient|4.0.1 on line 1044. 
Bundle.entry[13].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_10*/.encounter: Details for Encounter/cnyscn~bronxxbgu1so3y4 matching against profile http://hl7.org/fhir/StructureDefinition/Encounter|4.0.1 on line 1047. 
Bundle.entry[14].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_11*/.meta.profile[0]: Canonical URL 'http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse' does not resolve on line 1074. 
Bundle.entry[14].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_11*/.category[2].coding[0]: A definition for CodeSystem 'http://hl7.org/fhir/us/sdoh-clinicalcare/CodeSystem/SDOHCC-CodeSystemTemporaryCodes' could not be found, so the code cannot be validated on line 1104. 
Bundle.entry[14].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_11*/.subject: Details for Patient/CNYSCN~bronx-20240417-testcase1-MRN matching against profile http://hl7.org/fhir/StructureDefinition/Patient|4.0.1 on line 1125. 
Bundle.entry[14].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_11*/.encounter: Details for Encounter/cnyscn~bronxxbgu1so3y4 matching against profile http://hl7.org/fhir/StructureDefinition/Encounter|4.0.1 on line 1128. 
Bundle.entry[15].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_12*/.meta.profile[0]: Canonical URL 'http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse' does not resolve on line 1155. 
Bundle.entry[15].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_12*/.category[2].coding[0]: A definition for CodeSystem 'http://hl7.org/fhir/us/sdoh-clinicalcare/CodeSystem/SDOHCC-CodeSystemTemporaryCodes' could not be found, so the code cannot be validated on line 1185. 
Bundle.entry[15].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_12*/.subject: Details for Patient/CNYSCN~bronx-20240417-testcase1-MRN matching against profile http://hl7.org/fhir/StructureDefinition/Patient|4.0.1 on line 1206. 
Bundle.entry[15].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_12*/.encounter: Details for Encounter/cnyscn~bronxxbgu1so3y4 matching against profile http://hl7.org/fhir/StructureDefinition/Encounter|4.0.1 on line 1209. 
Bundle.entry[16].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_13*/.meta.profile[0]: Canonical URL 'http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse' does not resolve on line 1236. 
Bundle.entry[16].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_13*/.category[2].coding[0]: A definition for CodeSystem 'http://hl7.org/fhir/us/sdoh-clinicalcare/CodeSystem/SDOHCC-CodeSystemTemporaryCodes' could not be found, so the code cannot be validated on line 1266. 
Bundle.entry[16].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_13*/.subject: Details for Patient/CNYSCN~bronx-20240417-testcase1-MRN matching against profile http://hl7.org/fhir/StructureDefinition/Patient|4.0.1 on line 1287. 
Bundle.entry[16].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_13*/.encounter: Details for Encounter/cnyscn~bronxxbgu1so3y4 matching against profile http://hl7.org/fhir/StructureDefinition/Encounter|4.0.1 on line 1290. 
Bundle.entry[17].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_14*/.meta.profile[0]: Canonical URL 'http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse' does not resolve on line 1317. 
Bundle.entry[17].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_14*/.category[2].coding[0]: A definition for CodeSystem 'http://hl7.org/fhir/us/sdoh-clinicalcare/CodeSystem/SDOHCC-CodeSystemTemporaryCodes' could not be found, so the code cannot be validated on line 1347. 
Bundle.entry[17].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_14*/.subject: Details for Patient/CNYSCN~bronx-20240417-testcase1-MRN matching against profile http://hl7.org/fhir/StructureDefinition/Patient|4.0.1 on line 1368. 
Bundle.entry[17].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_14*/.encounter: Details for Encounter/cnyscn~bronxxbgu1so3y4 matching against profile http://hl7.org/fhir/StructureDefinition/Encounter|4.0.1 on line 1371. 
Bundle.entry[18].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_15*/.meta.profile[0]: Canonical URL 'http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse' does not resolve on line 1396. 
Bundle.entry[18].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_15*/.category[2].coding[0]: A definition for CodeSystem 'http://hl7.org/fhir/us/sdoh-clinicalcare/CodeSystem/SDOHCC-CodeSystemTemporaryCodes' could not be found, so the code cannot be validated on line 1426. 
Bundle.entry[18].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_15*/.subject: Details for Patient/CNYSCN~bronx-20240417-testcase1-MRN matching against profile http://hl7.org/fhir/StructureDefinition/Patient|4.0.1 on line 1447. 
Bundle.entry[18].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_15*/.encounter: Details for Encounter/cnyscn~bronxxbgu1so3y4 matching against profile http://hl7.org/fhir/StructureDefinition/Encounter|4.0.1 on line 1450. 
Bundle.entry[19].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_16*/.meta.profile[0]: Canonical URL 'http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse' does not resolve on line 1477. 
Bundle.entry[19].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_16*/.category[2].coding[0]: A definition for CodeSystem 'http://hl7.org/fhir/us/sdoh-clinicalcare/CodeSystem/SDOHCC-CodeSystemTemporaryCodes' could not be found, so the code cannot be validated on line 1507. 
Bundle.entry[19].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_16*/.subject: Details for Patient/CNYSCN~bronx-20240417-testcase1-MRN matching against profile http://hl7.org/fhir/StructureDefinition/Patient|4.0.1 on line 1528. 
Bundle.entry[19].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_16*/.encounter: Details for Encounter/cnyscn~bronxxbgu1so3y4 matching against profile http://hl7.org/fhir/StructureDefinition/Encounter|4.0.1 on line 1531. 
Bundle.entry[20].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_17*/.meta.profile[0]: Canonical URL 'http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse' does not resolve on line 1558. 
Bundle.entry[20].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_17*/.category[2].coding[0]: A definition for CodeSystem 'http://hl7.org/fhir/us/sdoh-clinicalcare/CodeSystem/SDOHCC-CodeSystemTemporaryCodes' could not be found, so the code cannot be validated on line 1588. 
Bundle.entry[20].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_17*/.subject: Details for Patient/CNYSCN~bronx-20240417-testcase1-MRN matching against profile http://hl7.org/fhir/StructureDefinition/Patient|4.0.1 on line 1609. 
Bundle.entry[20].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_17*/.encounter: Details for Encounter/cnyscn~bronxxbgu1so3y4 matching against profile http://hl7.org/fhir/StructureDefinition/Encounter|4.0.1 on line 1612. 
Bundle.entry[21].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_18*/.meta.profile[0]: Canonical URL 'http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse' does not resolve on line 1639. 
Bundle.entry[21].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_18*/.category[2].coding[0]: A definition for CodeSystem 'http://hl7.org/fhir/us/sdoh-clinicalcare/CodeSystem/SDOHCC-CodeSystemTemporaryCodes' could not be found, so the code cannot be validated on line 1669. 
Bundle.entry[21].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_18*/.subject: Details for Patient/CNYSCN~bronx-20240417-testcase1-MRN matching against profile http://hl7.org/fhir/StructureDefinition/Patient|4.0.1 on line 1690. 
Bundle.entry[21].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_18*/.encounter: Details for Encounter/cnyscn~bronxxbgu1so3y4 matching against profile http://hl7.org/fhir/StructureDefinition/Encounter|4.0.1 on line 1693. 
Bundle.entry[22].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_19*/.meta.profile[0]: Canonical URL 'http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse' does not resolve on line 1720. 
Bundle.entry[22].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_19*/.category[2].coding[0]: A definition for CodeSystem 'http://hl7.org/fhir/us/sdoh-clinicalcare/CodeSystem/SDOHCC-CodeSystemTemporaryCodes' could not be found, so the code cannot be validated on line 1750. 
Bundle.entry[22].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_19*/.subject: Details for Patient/CNYSCN~bronx-20240417-testcase1-MRN matching against profile http://hl7.org/fhir/StructureDefinition/Patient|4.0.1 on line 1771. 
Bundle.entry[22].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_19*/.encounter: Details for Encounter/cnyscn~bronxxbgu1so3y4 matching against profile http://hl7.org/fhir/StructureDefinition/Encounter|4.0.1 on line 1774. 
Bundle.entry[22].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_19*/.derivedFrom[0]: Details for Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_4 matching against profile http://hl7.org/fhir/StructureDefinition/Observation|4.0.1 on line 1786. 
Bundle.entry[22].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_19*/.derivedFrom[1]: Details for Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_11 matching against profile http://hl7.org/fhir/StructureDefinition/Observation|4.0.1 on line 1789. 
Bundle.entry[23].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_Grouper1*/.meta.profile[0]: Canonical URL 'http://hl7.org/fhir/us/sdoh-clinicalcare/StructureDefinition/SDOHCC-ObservationScreeningResponse' does not resolve on line 1807. 
Bundle.entry[23].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_Grouper1*/.category[2].coding[0]: A definition for CodeSystem 'http://hl7.org/fhir/us/sdoh-clinicalcare/CodeSystem/SDOHCC-CodeSystemTemporaryCodes' could not be found, so the code cannot be validated on line 1837. 
Bundle.entry[23].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_Grouper1*/.category[3].coding[0]: A definition for CodeSystem 'http://hl7.org/fhir/us/sdoh-clinicalcare/CodeSystem/SDOHCC-CodeSystemTemporaryCodes' could not be found, so the code cannot be validated on line 1847. 
Bundle.entry[23].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_Grouper1*/.category[4].coding[0]: A definition for CodeSystem 'http://hl7.org/fhir/us/sdoh-clinicalcare/CodeSystem/SDOHCC-CodeSystemTemporaryCodes' could not be found, so the code cannot be validated on line 1857. 
Bundle.entry[23].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_Grouper1*/.category[5].coding[0]: A definition for CodeSystem 'http://hl7.org/fhir/us/sdoh-clinicalcare/CodeSystem/SDOHCC-CodeSystemTemporaryCodes' could not be found, so the code cannot be validated on line 1867. 
Bundle.entry[23].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_Grouper1*/.category[6].coding[0]: A definition for CodeSystem 'http://hl7.org/fhir/us/sdoh-clinicalcare/CodeSystem/SDOHCC-CodeSystemTemporaryCodes' could not be found, so the code cannot be validated on line 1877. 
Bundle.entry[23].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_Grouper1*/.category[7].coding[0]: A definition for CodeSystem 'http://hl7.org/fhir/us/sdoh-clinicalcare/CodeSystem/SDOHCC-CodeSystemTemporaryCodes' could not be found, so the code cannot be validated on line 1887. 
Bundle.entry[23].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_Grouper1*/.subject: Details for Patient/CNYSCN~bronx-20240417-testcase1-MRN matching against profile http://hl7.org/fhir/StructureDefinition/Patient|4.0.1 on line 1908. 
Bundle.entry[23].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_Grouper1*/.encounter: Details for Encounter/cnyscn~bronxxbgu1so3y4 matching against profile http://hl7.org/fhir/StructureDefinition/Encounter|4.0.1 on line 1911. 
Bundle.entry[23].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_Grouper1*/.hasMember[0]: Details for Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_1 matching against profile http://hl7.org/fhir/StructureDefinition/Observation|4.0.1 on line 1916. 
Bundle.entry[23].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_Grouper1*/.hasMember[1]: Details for Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_2 matching against profile http://hl7.org/fhir/StructureDefinition/Observation|4.0.1 on line 1919. 
Bundle.entry[23].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_Grouper1*/.hasMember[2]: Details for Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_3 matching against profile http://hl7.org/fhir/StructureDefinition/Observation|4.0.1 on line 1922. 
Bundle.entry[23].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_Grouper1*/.hasMember[3]: Details for Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_4 matching against profile http://hl7.org/fhir/StructureDefinition/Observation|4.0.1 on line 1925. 
Bundle.entry[23].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_Grouper1*/.hasMember[4]: Details for Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_5 matching against profile http://hl7.org/fhir/StructureDefinition/Observation|4.0.1 on line 1928. 
Bundle.entry[23].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_Grouper1*/.hasMember[5]: Details for Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_6 matching against profile http://hl7.org/fhir/StructureDefinition/Observation|4.0.1 on line 1931. 
Bundle.entry[23].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_Grouper1*/.hasMember[6]: Details for Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_7 matching against profile http://hl7.org/fhir/StructureDefinition/Observation|4.0.1 on line 1934. 
Bundle.entry[23].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_Grouper1*/.hasMember[7]: Details for Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_8 matching against profile http://hl7.org/fhir/StructureDefinition/Observation|4.0.1 on line 1937. 
Bundle.entry[23].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_Grouper1*/.hasMember[8]: Details for Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_9 matching against profile http://hl7.org/fhir/StructureDefinition/Observation|4.0.1 on line 1940. 
Bundle.entry[23].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_Grouper1*/.hasMember[9]: Details for Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_10 matching against profile http://hl7.org/fhir/StructureDefinition/Observation|4.0.1 on line 1943. 
Bundle.entry[23].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_Grouper1*/.hasMember[10]: Details for Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_11 matching against profile http://hl7.org/fhir/StructureDefinition/Observation|4.0.1 on line 1946. 
Bundle.entry[23].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_Grouper1*/.hasMember[11]: Details for Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_12 matching against profile http://hl7.org/fhir/StructureDefinition/Observation|4.0.1 on line 1949. 
Bundle.entry[23].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_Grouper1*/.hasMember[12]: Details for Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_13 matching against profile http://hl7.org/fhir/StructureDefinition/Observation|4.0.1 on line 1952. 
Bundle.entry[23].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_Grouper1*/.hasMember[13]: Details for Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_14 matching against profile http://hl7.org/fhir/StructureDefinition/Observation|4.0.1 on line 1955. 
Bundle.entry[23].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_Grouper1*/.hasMember[14]: Details for Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_15 matching against profile http://hl7.org/fhir/StructureDefinition/Observation|4.0.1 on line 1958. 
Bundle.entry[23].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_Grouper1*/.hasMember[15]: Details for Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_16 matching against profile http://hl7.org/fhir/StructureDefinition/Observation|4.0.1 on line 1961. 
Bundle.entry[23].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_Grouper1*/.hasMember[16]: Details for Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_17 matching against profile http://hl7.org/fhir/StructureDefinition/Observation|4.0.1 on line 1964. 
Bundle.entry[23].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_Grouper1*/.hasMember[17]: Details for Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_18 matching against profile http://hl7.org/fhir/StructureDefinition/Observation|4.0.1 on line 1967. 
Bundle.entry[23].resource/*Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_Grouper1*/.hasMember[18]: Details for Observation/dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_19 matching against profile http://hl7.org/fhir/StructureDefinition/Observation|4.0.1 on line 1970. 


```
### Official Public Site

[https://validator.fhir.org//](https://validator.fhir.org/)

```json

Error received from validation server: 500

```

### Official Local Site

```json

Error received from validation server: 500

```

## Custom 1115 FHIR Server.

```json
{
  "resourceType": "OperationOutcome",
  "issue": [
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-pattern-valid: Value '0978bab8-c510-455c-8f10-f6772c0143f6_1793' is not facet-valid with respect to pattern '[A-Za-z0-9\\-\\.]{1,64}' for type 'id-primitive'.",
      "location": [
        "Line[1] Col[91]",
        "Line 1, Col 91"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-attribute.3: The value '0978bab8-c510-455c-8f10-f6772c0143f6_1793' of attribute 'value' on element 'id' is not valid with respect to its type, 'id-primitive'.",
      "location": [
        "Line[1] Col[91]",
        "Line 1, Col 91"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-pattern-valid: Value 'CNYSCN~bronx-20240417-testcase1-MRN' is not facet-valid with respect to pattern '[A-Za-z0-9\\-\\.]{1,64}' for type 'id-primitive'.",
      "location": [
        "Line[1] Col[876]",
        "Line 1, Col 876"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-attribute.3: The value 'CNYSCN~bronx-20240417-testcase1-MRN' of attribute 'value' on element 'id' is not valid with respect to its type, 'id-primitive'.",
      "location": [
        "Line[1] Col[876]",
        "Line 1, Col 876"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-pattern-valid: Value 'cnyscn~bronxxbgu1so3y4' is not facet-valid with respect to pattern '[A-Za-z0-9\\-\\.]{1,64}' for type 'id-primitive'.",
      "location": [
        "Line[1] Col[4117]",
        "Line 1, Col 4117"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-attribute.3: The value 'cnyscn~bronxxbgu1so3y4' of attribute 'value' on element 'id' is not valid with respect to its type, 'id-primitive'.",
      "location": [
        "Line[1] Col[4117]",
        "Line 1, Col 4117"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-pattern-valid: Value 'Consent_CNYSCN~bronx-20240417-testcase1-MRN' is not facet-valid with respect to pattern '[A-Za-z0-9\\-\\.]{1,64}' for type 'id-primitive'.",
      "location": [
        "Line[1] Col[5711]",
        "Line 1, Col 5711"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-attribute.3: The value 'Consent_CNYSCN~bronx-20240417-testcase1-MRN' of attribute 'value' on element 'id' is not valid with respect to its type, 'id-primitive'.",
      "location": [
        "Line[1] Col[5711]",
        "Line 1, Col 5711"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-pattern-valid: Value 'dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_1' is not facet-valid with respect to pattern '[A-Za-z0-9\\-\\.]{1,64}' for type 'id-primitive'.",
      "location": [
        "Line[1] Col[6762]",
        "Line 1, Col 6762"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-attribute.3: The value 'dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_1' of attribute 'value' on element 'id' is not valid with respect to its type, 'id-primitive'.",
      "location": [
        "Line[1] Col[6762]",
        "Line 1, Col 6762"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-pattern-valid: Value '1969-12-31T19:00:00' is not facet-valid with respect to pattern '([0-9]([0-9]([0-9][1-9]|[1-9]0)|[1-9]00)|[1-9]000)(-(0[1-9]|1[0-2])(-(0[0-9]|[1-2][0-9]|3[0-1])(T([01][0-9]|2[0-3]):[0-5][0-9]:([0-5][0-9]|60)(\\.[0-9]+)?(Z|(\\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00)))?)?)?' for type 'dateTime-primitive'.",
      "location": [
        "Line[1] Col[8431]",
        "Line 1, Col 8431"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-attribute.3: The value '1969-12-31T19:00:00' of attribute 'value' on element 'effectiveDateTime' is not valid with respect to its type, 'dateTime-primitive'.",
      "location": [
        "Line[1] Col[8431]",
        "Line 1, Col 8431"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-pattern-valid: Value 'dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_2' is not facet-valid with respect to pattern '[A-Za-z0-9\\-\\.]{1,64}' for type 'id-primitive'.",
      "location": [
        "Line[1] Col[9024]",
        "Line 1, Col 9024"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-attribute.3: The value 'dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_2' of attribute 'value' on element 'id' is not valid with respect to its type, 'id-primitive'.",
      "location": [
        "Line[1] Col[9024]",
        "Line 1, Col 9024"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-pattern-valid: Value '1969-12-31T19:00:00' is not facet-valid with respect to pattern '([0-9]([0-9]([0-9][1-9]|[1-9]0)|[1-9]00)|[1-9]000)(-(0[1-9]|1[0-2])(-(0[0-9]|[1-2][0-9]|3[0-1])(T([01][0-9]|2[0-3]):[0-5][0-9]:([0-5][0-9]|60)(\\.[0-9]+)?(Z|(\\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00)))?)?)?' for type 'dateTime-primitive'.",
      "location": [
        "Line[1] Col[10670]",
        "Line 1, Col 10670"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-attribute.3: The value '1969-12-31T19:00:00' of attribute 'value' on element 'effectiveDateTime' is not valid with respect to its type, 'dateTime-primitive'.",
      "location": [
        "Line[1] Col[10670]",
        "Line 1, Col 10670"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-pattern-valid: Value 'dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_3' is not facet-valid with respect to pattern '[A-Za-z0-9\\-\\.]{1,64}' for type 'id-primitive'.",
      "location": [
        "Line[1] Col[11252]",
        "Line 1, Col 11252"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-attribute.3: The value 'dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_3' of attribute 'value' on element 'id' is not valid with respect to its type, 'id-primitive'.",
      "location": [
        "Line[1] Col[11252]",
        "Line 1, Col 11252"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-pattern-valid: Value '1969-12-31T19:00:00' is not facet-valid with respect to pattern '([0-9]([0-9]([0-9][1-9]|[1-9]0)|[1-9]00)|[1-9]000)(-(0[1-9]|1[0-2])(-(0[0-9]|[1-2][0-9]|3[0-1])(T([01][0-9]|2[0-3]):[0-5][0-9]:([0-5][0-9]|60)(\\.[0-9]+)?(Z|(\\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00)))?)?)?' for type 'dateTime-primitive'.",
      "location": [
        "Line[1] Col[12806]",
        "Line 1, Col 12806"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-attribute.3: The value '1969-12-31T19:00:00' of attribute 'value' on element 'effectiveDateTime' is not valid with respect to its type, 'dateTime-primitive'.",
      "location": [
        "Line[1] Col[12806]",
        "Line 1, Col 12806"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-pattern-valid: Value 'dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_4' is not facet-valid with respect to pattern '[A-Za-z0-9\\-\\.]{1,64}' for type 'id-primitive'.",
      "location": [
        "Line[1] Col[13386]",
        "Line 1, Col 13386"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-attribute.3: The value 'dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_4' of attribute 'value' on element 'id' is not valid with respect to its type, 'id-primitive'.",
      "location": [
        "Line[1] Col[13386]",
        "Line 1, Col 13386"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-pattern-valid: Value '1969-12-31T19:00:00' is not facet-valid with respect to pattern '([0-9]([0-9]([0-9][1-9]|[1-9]0)|[1-9]00)|[1-9]000)(-(0[1-9]|1[0-2])(-(0[0-9]|[1-2][0-9]|3[0-1])(T([01][0-9]|2[0-3]):[0-5][0-9]:([0-5][0-9]|60)(\\.[0-9]+)?(Z|(\\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00)))?)?)?' for type 'dateTime-primitive'.",
      "location": [
        "Line[1] Col[14926]",
        "Line 1, Col 14926"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-attribute.3: The value '1969-12-31T19:00:00' of attribute 'value' on element 'effectiveDateTime' is not valid with respect to its type, 'dateTime-primitive'.",
      "location": [
        "Line[1] Col[14926]",
        "Line 1, Col 14926"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-pattern-valid: Value 'dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_5' is not facet-valid with respect to pattern '[A-Za-z0-9\\-\\.]{1,64}' for type 'id-primitive'.",
      "location": [
        "Line[1] Col[15517]",
        "Line 1, Col 15517"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-attribute.3: The value 'dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_5' of attribute 'value' on element 'id' is not valid with respect to its type, 'id-primitive'.",
      "location": [
        "Line[1] Col[15517]",
        "Line 1, Col 15517"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-pattern-valid: Value '1969-12-31T19:00:00' is not facet-valid with respect to pattern '([0-9]([0-9]([0-9][1-9]|[1-9]0)|[1-9]00)|[1-9]000)(-(0[1-9]|1[0-2])(-(0[0-9]|[1-2][0-9]|3[0-1])(T([01][0-9]|2[0-3]):[0-5][0-9]:([0-5][0-9]|60)(\\.[0-9]+)?(Z|(\\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00)))?)?)?' for type 'dateTime-primitive'.",
      "location": [
        "Line[1] Col[17071]",
        "Line 1, Col 17071"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-attribute.3: The value '1969-12-31T19:00:00' of attribute 'value' on element 'effectiveDateTime' is not valid with respect to its type, 'dateTime-primitive'.",
      "location": [
        "Line[1] Col[17071]",
        "Line 1, Col 17071"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-pattern-valid: Value 'dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_6' is not facet-valid with respect to pattern '[A-Za-z0-9\\-\\.]{1,64}' for type 'id-primitive'.",
      "location": [
        "Line[1] Col[17660]",
        "Line 1, Col 17660"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-attribute.3: The value 'dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_6' of attribute 'value' on element 'id' is not valid with respect to its type, 'id-primitive'.",
      "location": [
        "Line[1] Col[17660]",
        "Line 1, Col 17660"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-pattern-valid: Value '1969-12-31T19:00:00' is not facet-valid with respect to pattern '([0-9]([0-9]([0-9][1-9]|[1-9]0)|[1-9]00)|[1-9]000)(-(0[1-9]|1[0-2])(-(0[0-9]|[1-2][0-9]|3[0-1])(T([01][0-9]|2[0-3]):[0-5][0-9]:([0-5][0-9]|60)(\\.[0-9]+)?(Z|(\\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00)))?)?)?' for type 'dateTime-primitive'.",
      "location": [
        "Line[1] Col[19372]",
        "Line 1, Col 19372"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-attribute.3: The value '1969-12-31T19:00:00' of attribute 'value' on element 'effectiveDateTime' is not valid with respect to its type, 'dateTime-primitive'.",
      "location": [
        "Line[1] Col[19372]",
        "Line 1, Col 19372"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-pattern-valid: Value 'dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_7' is not facet-valid with respect to pattern '[A-Za-z0-9\\-\\.]{1,64}' for type 'id-primitive'.",
      "location": [
        "Line[1] Col[19965]",
        "Line 1, Col 19965"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-attribute.3: The value 'dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_7' of attribute 'value' on element 'id' is not valid with respect to its type, 'id-primitive'.",
      "location": [
        "Line[1] Col[19965]",
        "Line 1, Col 19965"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-pattern-valid: Value '1969-12-31T19:00:00' is not facet-valid with respect to pattern '([0-9]([0-9]([0-9][1-9]|[1-9]0)|[1-9]00)|[1-9]000)(-(0[1-9]|1[0-2])(-(0[0-9]|[1-2][0-9]|3[0-1])(T([01][0-9]|2[0-3]):[0-5][0-9]:([0-5][0-9]|60)(\\.[0-9]+)?(Z|(\\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00)))?)?)?' for type 'dateTime-primitive'.",
      "location": [
        "Line[1] Col[21711]",
        "Line 1, Col 21711"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-attribute.3: The value '1969-12-31T19:00:00' of attribute 'value' on element 'effectiveDateTime' is not valid with respect to its type, 'dateTime-primitive'.",
      "location": [
        "Line[1] Col[21711]",
        "Line 1, Col 21711"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-pattern-valid: Value 'dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_8' is not facet-valid with respect to pattern '[A-Za-z0-9\\-\\.]{1,64}' for type 'id-primitive'.",
      "location": [
        "Line[1] Col[22291]",
        "Line 1, Col 22291"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-attribute.3: The value 'dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_8' of attribute 'value' on element 'id' is not valid with respect to its type, 'id-primitive'.",
      "location": [
        "Line[1] Col[22291]",
        "Line 1, Col 22291"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-pattern-valid: Value '1969-12-31T19:00:00' is not facet-valid with respect to pattern '([0-9]([0-9]([0-9][1-9]|[1-9]0)|[1-9]00)|[1-9]000)(-(0[1-9]|1[0-2])(-(0[0-9]|[1-2][0-9]|3[0-1])(T([01][0-9]|2[0-3]):[0-5][0-9]:([0-5][0-9]|60)(\\.[0-9]+)?(Z|(\\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00)))?)?)?' for type 'dateTime-primitive'.",
      "location": [
        "Line[1] Col[24011]",
        "Line 1, Col 24011"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-attribute.3: The value '1969-12-31T19:00:00' of attribute 'value' on element 'effectiveDateTime' is not valid with respect to its type, 'dateTime-primitive'.",
      "location": [
        "Line[1] Col[24011]",
        "Line 1, Col 24011"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-pattern-valid: Value 'dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_9' is not facet-valid with respect to pattern '[A-Za-z0-9\\-\\.]{1,64}' for type 'id-primitive'.",
      "location": [
        "Line[1] Col[24591]",
        "Line 1, Col 24591"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-attribute.3: The value 'dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_9' of attribute 'value' on element 'id' is not valid with respect to its type, 'id-primitive'.",
      "location": [
        "Line[1] Col[24591]",
        "Line 1, Col 24591"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-pattern-valid: Value '1969-12-31T19:00:00' is not facet-valid with respect to pattern '([0-9]([0-9]([0-9][1-9]|[1-9]0)|[1-9]00)|[1-9]000)(-(0[1-9]|1[0-2])(-(0[0-9]|[1-2][0-9]|3[0-1])(T([01][0-9]|2[0-3]):[0-5][0-9]:([0-5][0-9]|60)(\\.[0-9]+)?(Z|(\\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00)))?)?)?' for type 'dateTime-primitive'.",
      "location": [
        "Line[1] Col[26329]",
        "Line 1, Col 26329"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-attribute.3: The value '1969-12-31T19:00:00' of attribute 'value' on element 'effectiveDateTime' is not valid with respect to its type, 'dateTime-primitive'.",
      "location": [
        "Line[1] Col[26329]",
        "Line 1, Col 26329"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-pattern-valid: Value 'dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_10' is not facet-valid with respect to pattern '[A-Za-z0-9\\-\\.]{1,64}' for type 'id-primitive'.",
      "location": [
        "Line[1] Col[26910]",
        "Line 1, Col 26910"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-attribute.3: The value 'dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_10' of attribute 'value' on element 'id' is not valid with respect to its type, 'id-primitive'.",
      "location": [
        "Line[1] Col[26910]",
        "Line 1, Col 26910"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-pattern-valid: Value '1969-12-31T19:00:00' is not facet-valid with respect to pattern '([0-9]([0-9]([0-9][1-9]|[1-9]0)|[1-9]00)|[1-9]000)(-(0[1-9]|1[0-2])(-(0[0-9]|[1-2][0-9]|3[0-1])(T([01][0-9]|2[0-3]):[0-5][0-9]:([0-5][0-9]|60)(\\.[0-9]+)?(Z|(\\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00)))?)?)?' for type 'dateTime-primitive'.",
      "location": [
        "Line[1] Col[28821]",
        "Line 1, Col 28821"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-attribute.3: The value '1969-12-31T19:00:00' of attribute 'value' on element 'effectiveDateTime' is not valid with respect to its type, 'dateTime-primitive'.",
      "location": [
        "Line[1] Col[28821]",
        "Line 1, Col 28821"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-pattern-valid: Value 'dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_11' is not facet-valid with respect to pattern '[A-Za-z0-9\\-\\.]{1,64}' for type 'id-primitive'.",
      "location": [
        "Line[1] Col[29404]",
        "Line 1, Col 29404"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-attribute.3: The value 'dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_11' of attribute 'value' on element 'id' is not valid with respect to its type, 'id-primitive'.",
      "location": [
        "Line[1] Col[29404]",
        "Line 1, Col 29404"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-pattern-valid: Value '1969-12-31T19:00:00' is not facet-valid with respect to pattern '([0-9]([0-9]([0-9][1-9]|[1-9]0)|[1-9]00)|[1-9]000)(-(0[1-9]|1[0-2])(-(0[0-9]|[1-2][0-9]|3[0-1])(T([01][0-9]|2[0-3]):[0-5][0-9]:([0-5][0-9]|60)(\\.[0-9]+)?(Z|(\\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00)))?)?)?' for type 'dateTime-primitive'.",
      "location": [
        "Line[1] Col[30931]",
        "Line 1, Col 30931"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-attribute.3: The value '1969-12-31T19:00:00' of attribute 'value' on element 'effectiveDateTime' is not valid with respect to its type, 'dateTime-primitive'.",
      "location": [
        "Line[1] Col[30931]",
        "Line 1, Col 30931"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-pattern-valid: Value 'dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_12' is not facet-valid with respect to pattern '[A-Za-z0-9\\-\\.]{1,64}' for type 'id-primitive'.",
      "location": [
        "Line[1] Col[31529]",
        "Line 1, Col 31529"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-attribute.3: The value 'dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_12' of attribute 'value' on element 'id' is not valid with respect to its type, 'id-primitive'.",
      "location": [
        "Line[1] Col[31529]",
        "Line 1, Col 31529"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-pattern-valid: Value '1969-12-31T19:00:00' is not facet-valid with respect to pattern '([0-9]([0-9]([0-9][1-9]|[1-9]0)|[1-9]00)|[1-9]000)(-(0[1-9]|1[0-2])(-(0[0-9]|[1-2][0-9]|3[0-1])(T([01][0-9]|2[0-3]):[0-5][0-9]:([0-5][0-9]|60)(\\.[0-9]+)?(Z|(\\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00)))?)?)?' for type 'dateTime-primitive'.",
      "location": [
        "Line[1] Col[33160]",
        "Line 1, Col 33160"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-attribute.3: The value '1969-12-31T19:00:00' of attribute 'value' on element 'effectiveDateTime' is not valid with respect to its type, 'dateTime-primitive'.",
      "location": [
        "Line[1] Col[33160]",
        "Line 1, Col 33160"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-pattern-valid: Value 'dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_13' is not facet-valid with respect to pattern '[A-Za-z0-9\\-\\.]{1,64}' for type 'id-primitive'.",
      "location": [
        "Line[1] Col[33764]",
        "Line 1, Col 33764"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-attribute.3: The value 'dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_13' of attribute 'value' on element 'id' is not valid with respect to its type, 'id-primitive'.",
      "location": [
        "Line[1] Col[33764]",
        "Line 1, Col 33764"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-pattern-valid: Value '1969-12-31T19:00:00' is not facet-valid with respect to pattern '([0-9]([0-9]([0-9][1-9]|[1-9]0)|[1-9]00)|[1-9]000)(-(0[1-9]|1[0-2])(-(0[0-9]|[1-2][0-9]|3[0-1])(T([01][0-9]|2[0-3]):[0-5][0-9]:([0-5][0-9]|60)(\\.[0-9]+)?(Z|(\\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00)))?)?)?' for type 'dateTime-primitive'.",
      "location": [
        "Line[1] Col[35293]",
        "Line 1, Col 35293"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-attribute.3: The value '1969-12-31T19:00:00' of attribute 'value' on element 'effectiveDateTime' is not valid with respect to its type, 'dateTime-primitive'.",
      "location": [
        "Line[1] Col[35293]",
        "Line 1, Col 35293"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-pattern-valid: Value 'dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_14' is not facet-valid with respect to pattern '[A-Za-z0-9\\-\\.]{1,64}' for type 'id-primitive'.",
      "location": [
        "Line[1] Col[35902]",
        "Line 1, Col 35902"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-attribute.3: The value 'dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_14' of attribute 'value' on element 'id' is not valid with respect to its type, 'id-primitive'.",
      "location": [
        "Line[1] Col[35902]",
        "Line 1, Col 35902"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-pattern-valid: Value '1969-12-31T19:00:00' is not facet-valid with respect to pattern '([0-9]([0-9]([0-9][1-9]|[1-9]0)|[1-9]00)|[1-9]000)(-(0[1-9]|1[0-2])(-(0[0-9]|[1-2][0-9]|3[0-1])(T([01][0-9]|2[0-3]):[0-5][0-9]:([0-5][0-9]|60)(\\.[0-9]+)?(Z|(\\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00)))?)?)?' for type 'dateTime-primitive'.",
      "location": [
        "Line[1] Col[37434]",
        "Line 1, Col 37434"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-attribute.3: The value '1969-12-31T19:00:00' of attribute 'value' on element 'effectiveDateTime' is not valid with respect to its type, 'dateTime-primitive'.",
      "location": [
        "Line[1] Col[37434]",
        "Line 1, Col 37434"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-pattern-valid: Value 'dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_15' is not facet-valid with respect to pattern '[A-Za-z0-9\\-\\.]{1,64}' for type 'id-primitive'.",
      "location": [
        "Line[1] Col[37947]",
        "Line 1, Col 37947"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-attribute.3: The value 'dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_15' of attribute 'value' on element 'id' is not valid with respect to its type, 'id-primitive'.",
      "location": [
        "Line[1] Col[37947]",
        "Line 1, Col 37947"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-pattern-valid: Value '1969-12-31T19:00:00' is not facet-valid with respect to pattern '([0-9]([0-9]([0-9][1-9]|[1-9]0)|[1-9]00)|[1-9]000)(-(0[1-9]|1[0-2])(-(0[0-9]|[1-2][0-9]|3[0-1])(T([01][0-9]|2[0-3]):[0-5][0-9]:([0-5][0-9]|60)(\\.[0-9]+)?(Z|(\\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00)))?)?)?' for type 'dateTime-primitive'.",
      "location": [
        "Line[1] Col[39520]",
        "Line 1, Col 39520"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-attribute.3: The value '1969-12-31T19:00:00' of attribute 'value' on element 'effectiveDateTime' is not valid with respect to its type, 'dateTime-primitive'.",
      "location": [
        "Line[1] Col[39520]",
        "Line 1, Col 39520"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-pattern-valid: Value 'dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_16' is not facet-valid with respect to pattern '[A-Za-z0-9\\-\\.]{1,64}' for type 'id-primitive'.",
      "location": [
        "Line[1] Col[40109]",
        "Line 1, Col 40109"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-attribute.3: The value 'dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_16' of attribute 'value' on element 'id' is not valid with respect to its type, 'id-primitive'.",
      "location": [
        "Line[1] Col[40109]",
        "Line 1, Col 40109"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-pattern-valid: Value '1969-12-31T19:00:00' is not facet-valid with respect to pattern '([0-9]([0-9]([0-9][1-9]|[1-9]0)|[1-9]00)|[1-9]000)(-(0[1-9]|1[0-2])(-(0[0-9]|[1-2][0-9]|3[0-1])(T([01][0-9]|2[0-3]):[0-5][0-9]:([0-5][0-9]|60)(\\.[0-9]+)?(Z|(\\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00)))?)?)?' for type 'dateTime-primitive'.",
      "location": [
        "Line[1] Col[41808]",
        "Line 1, Col 41808"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-attribute.3: The value '1969-12-31T19:00:00' of attribute 'value' on element 'effectiveDateTime' is not valid with respect to its type, 'dateTime-primitive'.",
      "location": [
        "Line[1] Col[41808]",
        "Line 1, Col 41808"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-pattern-valid: Value 'dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_17' is not facet-valid with respect to pattern '[A-Za-z0-9\\-\\.]{1,64}' for type 'id-primitive'.",
      "location": [
        "Line[1] Col[42397]",
        "Line 1, Col 42397"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-attribute.3: The value 'dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_17' of attribute 'value' on element 'id' is not valid with respect to its type, 'id-primitive'.",
      "location": [
        "Line[1] Col[42397]",
        "Line 1, Col 42397"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-pattern-valid: Value '1969-12-31T19:00:00' is not facet-valid with respect to pattern '([0-9]([0-9]([0-9][1-9]|[1-9]0)|[1-9]00)|[1-9]000)(-(0[1-9]|1[0-2])(-(0[0-9]|[1-2][0-9]|3[0-1])(T([01][0-9]|2[0-3]):[0-5][0-9]:([0-5][0-9]|60)(\\.[0-9]+)?(Z|(\\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00)))?)?)?' for type 'dateTime-primitive'.",
      "location": [
        "Line[1] Col[44215]",
        "Line 1, Col 44215"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-attribute.3: The value '1969-12-31T19:00:00' of attribute 'value' on element 'effectiveDateTime' is not valid with respect to its type, 'dateTime-primitive'.",
      "location": [
        "Line[1] Col[44215]",
        "Line 1, Col 44215"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-pattern-valid: Value 'dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_18' is not facet-valid with respect to pattern '[A-Za-z0-9\\-\\.]{1,64}' for type 'id-primitive'.",
      "location": [
        "Line[1] Col[44810]",
        "Line 1, Col 44810"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-attribute.3: The value 'dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_18' of attribute 'value' on element 'id' is not valid with respect to its type, 'id-primitive'.",
      "location": [
        "Line[1] Col[44810]",
        "Line 1, Col 44810"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-pattern-valid: Value '1969-12-31T19:00:00' is not facet-valid with respect to pattern '([0-9]([0-9]([0-9][1-9]|[1-9]0)|[1-9]00)|[1-9]000)(-(0[1-9]|1[0-2])(-(0[0-9]|[1-2][0-9]|3[0-1])(T([01][0-9]|2[0-3]):[0-5][0-9]:([0-5][0-9]|60)(\\.[0-9]+)?(Z|(\\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00)))?)?)?' for type 'dateTime-primitive'.",
      "location": [
        "Line[1] Col[46553]",
        "Line 1, Col 46553"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-attribute.3: The value '1969-12-31T19:00:00' of attribute 'value' on element 'effectiveDateTime' is not valid with respect to its type, 'dateTime-primitive'.",
      "location": [
        "Line[1] Col[46553]",
        "Line 1, Col 46553"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-pattern-valid: Value 'dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_19' is not facet-valid with respect to pattern '[A-Za-z0-9\\-\\.]{1,64}' for type 'id-primitive'.",
      "location": [
        "Line[1] Col[47158]",
        "Line 1, Col 47158"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-attribute.3: The value 'dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_19' of attribute 'value' on element 'id' is not valid with respect to its type, 'id-primitive'.",
      "location": [
        "Line[1] Col[47158]",
        "Line 1, Col 47158"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-pattern-valid: Value '1969-12-31T19:00:00' is not facet-valid with respect to pattern '([0-9]([0-9]([0-9][1-9]|[1-9]0)|[1-9]00)|[1-9]000)(-(0[1-9]|1[0-2])(-(0[0-9]|[1-2][0-9]|3[0-1])(T([01][0-9]|2[0-3]):[0-5][0-9]:([0-5][0-9]|60)(\\.[0-9]+)?(Z|(\\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00)))?)?)?' for type 'dateTime-primitive'.",
      "location": [
        "Line[1] Col[48685]",
        "Line 1, Col 48685"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-attribute.3: The value '1969-12-31T19:00:00' of attribute 'value' on element 'effectiveDateTime' is not valid with respect to its type, 'dateTime-primitive'.",
      "location": [
        "Line[1] Col[48685]",
        "Line 1, Col 48685"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-pattern-valid: Value 'dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_Grouper1' is not facet-valid with respect to pattern '[A-Za-z0-9\\-\\.]{1,64}' for type 'id-primitive'.",
      "location": [
        "Line[1] Col[49429]",
        "Line 1, Col 49429"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-attribute.3: The value 'dd9f3a5bc72ea5a576a1a9117cd2a34d_obs3_Grouper1' of attribute 'value' on element 'id' is not valid with respect to its type, 'id-primitive'.",
      "location": [
        "Line[1] Col[49429]",
        "Line 1, Col 49429"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-pattern-valid: Value '2005-02-18T00:00:00' is not facet-valid with respect to pattern '([0-9]([0-9]([0-9][1-9]|[1-9]0)|[1-9]00)|[1-9]000)(-(0[1-9]|1[0-2])(-(0[0-9]|[1-2][0-9]|3[0-1])(T([01][0-9]|2[0-3]):[0-5][0-9]:([0-5][0-9]|60)(\\.[0-9]+)?(Z|(\\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00)))?)?)?' for type 'dateTime-primitive'.",
      "location": [
        "Line[1] Col[52402]",
        "Line 1, Col 52402"
      ]
    },
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "cvc-attribute.3: The value '2005-02-18T00:00:00' of attribute 'value' on element 'effectiveDateTime' is not valid with respect to its type, 'dateTime-primitive'.",
      "location": [
        "Line[1] Col[52402]",
        "Line 1, Col 52402"
      ]
    }
  ]
}

```