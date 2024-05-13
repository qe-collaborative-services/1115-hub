package org.techbd.service.http;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;

import org.springframework.stereotype.Service;
import org.techbd.hrsn.assurance.FHIRBundleValidator;

@Service
public class FhirService {

    // @Autowired
    // private FHIRBundleValidator validator;

    public String getMetadata() {
        String version = FHIRBundleValidator.getInstance().getVersionFromProperties();
        return "<CapabilityStatement xmlns=\"http://hl7.org/fhir\">\n" + //
                "    <status value=\"active\"></status>\n" + //
                "    <date value=\"2024-05-10T10:23:24+00:00\"></date>\n" + //
                "    <publisher value=\"TechBD\"></publisher>\n" + //
                "    <kind value=\"instance\"></kind>\n" + //
                "    <software>\n" + //
                "        <name value=\"1115-Hub FHIR Server\"></name>\n" + //
                "        <version value=\"" + version + "\"></version>\n" + //
                "    </software>\n" + //
                "    <implementation>\n" + //
                "        <description value=\"115-Hub FHIR\"></description>\n" + //
                "        <url value=\"https://synthetic.fhir.api.devl.techbd.org\"></url>\n" + //
                "    </implementation>\n" + //
                "    <fhirVersion value=\"4.0.1\"></fhirVersion>\n" + //
                "    <format value=\"application/fhir+xml\"></format>\n" + //
                "    <format value=\"application/fhir+json\"></format>\n" + //
                "    <rest>\n" + //
                "        <mode value=\"server\"></mode>\n" + //
                "        <resource>\n" + //
                "            <type value=\"Bundle\"></type>\n" + //
                "            <profile value=\"https://djq7jdt8kb490.cloudfront.net/1115/StructureDefinition-SHINNYBundleProfile.json\"></profile>\n"
                + //
                "            <interaction>\n" + //
                "                <code value=\"create\"></code>\n" + //
                "            </interaction>\n" + //
                "            <interaction>\n" + //
                "                <code value=\"search-type\"></code>\n" + //
                "            </interaction>\n" + //
                "            <searchParam>\n" + //
                "                <name value=\"name\"></name>\n" + //
                "                <type value=\"string\"></type>\n" + //
                "            </searchParam>\n" + //
                "        </resource>\n" + //
                "        <resource>\n" + //
                "            <type value=\"OperationDefinition\"></type>\n" + //
                "            <profile value=\"http://hl7.org/fhir/StructureDefinition/OperationDefinition\"></profile>\n"
                + //
                "            <interaction>\n" + //
                "                <code value=\"read\"></code>\n" + //
                "            </interaction>\n" + //
                "        </resource>\n" + //
                "        <resource>\n" + //
                "            <type value=\"StructureDefinition\"></type>\n" + //
                "            <profile value=\"http://hl7.org/fhir/StructureDefinition/StructureDefinition\"></profile>\n"
                + //
                "            <interaction>\n" + //
                "                <code value=\"read\"></code>\n" + //
                "            </interaction>\n" + //
                "            <interaction>\n" + //
                "                <code value=\"search-type\"></code>\n" + //
                "            </interaction>\n" + //
                "        </resource>\n" + //
                "        <operation>\n" + //
                "            <name value=\"validate\"></name>\n" + //
                "            <definition value=\"http://10.0.165.83:8080/OperationDefinition/Bundle--validate\"></definition>\n"
                + //
                "        </operation>\n" + //
                "    </rest>\n" + //
                "</CapabilityStatement>";
    }

    public String getDiagnostics(String sessionId) {
        return FHIRBundleValidator.getInstance().diagnosticsOperation(sessionId);
    }

    public String validateFhirResourceData(String jsonData, String qeIdentifier) {
        return FHIRBundleValidator.getInstance().validateFhirResource(jsonData, qeIdentifier);
    }

    public String adminValidate(String jsonData, String qeIdentifier) {
        return FHIRBundleValidator.getInstance().adminValidate(jsonData, qeIdentifier);
    }
}
