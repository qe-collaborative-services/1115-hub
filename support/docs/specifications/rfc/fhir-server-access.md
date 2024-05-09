# RFC: Deployment Models for TechBD's FHIR Server API Service

## Abstract

This RFC details two deployment models for the FHIR Server API service offered
by TechBD, tailored for Qualified Entities (QEs): the CNAME Model and the API
Gateway Model.

## 1. Introduction

TechBD’s FHIR Server API service is available to QEs using two flexible
deployment models:

- **CNAME Model**: Leverages DNS CNAME records for domain aliasing.
- **API Gateway Model**: Utilizes an API Gateway to forward requests to the
  centralized FHIR server.

## 2. CNAME Model

### 2.1 Description

This model enables a QE to alias their domain to TechBD’s FHIR server via a
CNAME record, making the service appear as if hosted by the QE.

### 2.2 Technical Steps

1. **DNS Configuration**: The QE sets up a CNAME record pointing to TechBD’s
   domain.
2. **Server Recognition**: TechBD configures its server to recognize requests
   from the QE’s domain.

### 2.3 Trade-offs

- **Pros**:
  - Quick deployment requires a one-time DNS server update by Ops personnel and
    minimizes the need for developer or engineering talent.
  - Minimal infrastructure overhead dramatically simplifies QE operations.
  - All observability (logging), authentication, security, and functionality is
    handled by TechBD.

- **Cons**:
  - Limited customization options may hinder some QE developer needs.

## 3. API Gateway Model

### 3.1 Description

QEs deploy an API Gateway that manages and forwards JSON requests to TechBD’s
centralized FHIR server, offering greater control over the data flow.

### 3.2 Technical Steps

1. **Gateway Deployment**: The QE installs and configures a general purpose API
   Gateway such as Kong or a FHIR-specific API gateway.
2. **Request Forwarding**: The gateway is set up to forward requests to TechBD
   and send responses back to SCNs.

### 3.3 Trade-offs

- **Pros**:
  - Greater control enhances both developer and operations experiences.
  - Customizable request handling supports complex implementations.

- **Cons**:
  - Higher complexity and cost can strain QE resources.
  - QE has increased responsibility for observability (logging), maintenance and
    security.

## 4. References

- TechBD FHIR API documentation
- DNS and CNAME configuration guidelines
- API Gateway technical specifications
