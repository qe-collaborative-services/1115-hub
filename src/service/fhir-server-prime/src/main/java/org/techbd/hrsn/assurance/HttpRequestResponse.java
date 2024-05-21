package org.techbd.hrsn.assurance;

import java.util.HashMap;

public class HttpRequestResponse {

    // Request details
    private String requestHost;
    private String requestIp;
    private String requestMethod;
    private String requestUrl;
    private HashMap<String, String> requestHeaders;
    private String requestBody;

    // Response details
    private int responseStatusCode;
    private String responseStatusDetails;

    private String responseFhirAPIDetails;

    public String getResponseFhirAPIDetails() {
        return responseFhirAPIDetails;
    }

    public void setResponseFhirAPIDetails(String responseFhirAPIDetails) {
        this.responseFhirAPIDetails = responseFhirAPIDetails;
    }

    public String getResponseStatusDetails() {
        return responseStatusDetails;
    }

    public void setResponseStatusDetails(String responseStatusDetails) {
        this.responseStatusDetails = responseStatusDetails;
    }

    private HashMap<String, String> responseHeaders;
    private String responseBody;

    // Constructor
    public HttpRequestResponse() {}

    // Getter and Setter for requestMethod
    public String getRequestMethod() {
        return requestMethod;
    }

    public void setRequestMethod(String requestMethod) {
        this.requestMethod = requestMethod;
    }

    // Getter and Setter for requestUrl
    public String getRequestUrl() {
        return requestUrl;
    }

    public void setRequestUrl(String requestUrl) {
        this.requestUrl = requestUrl;
    }

    // Getter and Setter for requestHeaders
    public HashMap<String, String> getRequestHeaders() {
        return requestHeaders;
    }

    public void setRequestHeaders(HashMap<String, String> requestHeaders) {
        this.requestHeaders = requestHeaders;
    }

    // Getter and Setter for requestBody
    public String getRequestBody() {
        return requestBody;
    }

    public void setRequestBody(String requestBody) {
        this.requestBody = requestBody;
    }

    // Getter and Setter for responseStatusCode
    public int getResponseStatusCode() {
        return responseStatusCode;
    }

    public void setResponseStatusCode(int responseStatusCode) {
        this.responseStatusCode = responseStatusCode;
    }

    // Getter and Setter for responseHeaders
    public HashMap<String, String> getResponseHeaders() {
        return responseHeaders;
    }

    public void setResponseHeaders(HashMap<String, String> responseHeaders) {
        this.responseHeaders = responseHeaders;
    }

    // Getter and Setter for responseBody
    public String getResponseBody() {
        return responseBody;
    }

    public void setResponseBody(String responseBody) {
        this.responseBody = responseBody;
    }

    public String getRequestHost() {
        return requestHost;
    }

    public void setRequestHost(String requestHost) {
        this.requestHost = requestHost;
    }

    public String getRequestIp() {
        return requestIp;
    }

    public void setRequestIp(String requestIp) {
        this.requestIp = requestIp;
    }
}