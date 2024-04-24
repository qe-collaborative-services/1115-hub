# HAPI FHIR Plain Server Skeleton

To try this project out:

- Run the following command to compile the project and start a local testing
  server that runs it:

```
mvn jetty:run
```

- Test that your server is running by fetching its CapabilityStatement:

  http://localhost:8080/metadata

- Try validating a Bunlde resource from your server using the following URL:

  http://localhost:8080/Bundle/$validate

- Try submitting a Bunlde resource from your server using the following URL:

  http://localhost:8080/Bundle/?x=y

# Project Structure

This project follows the default Maven directory structure, specifically keeping
the code under `src/main/java`. Here's why we stick to this convention:

## Benefits of Default Structure

**1. Standardized Layout:**

- The default structure is widely adopted in Java development, making it easier
  for others familiar with Maven to understand and navigate our project.

**2. IDE Integration:**

- Tools like IntelliJ IDEA seamlessly integrate with the standard Maven layout,
  enhancing features such as auto-completion and project navigation.

**3. Maintainability:**

- Adhering to the standard layout facilitates onboarding of new developers, as
  they can easily locate project components.

**4. Maven Plugins:**

- Many Maven plugins rely on the default directory structure. Altering it could
  lead to build errors or require additional configuration.

By maintaining the existing structure, we ensure compatibility with common
development tools and plugins, while promoting consistency and ease of
collaboration within our project.
