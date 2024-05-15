package org.techbd.hrsn.assurance;

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
}
