package ca.uhn.fhir.techbd;

public class Msg {
    public static String code(int errorCode) {
        return "Error code: " + errorCode + " - ";
    }
}
