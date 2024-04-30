# HAPI FHIR Plain Server

## Prerequisites (Sandbox)

Before getting started, ensure you have the following prerequisites:

1. **Java 17:** This project requires Java 17 (or greather than 17)to be
   installed. You can check your Java version by running:

   ```
   java --version
   ```

   If you don't have Java 17 installed, you can download and install it from
   [here](https://adoptopenjdk.net/?variant=openjdk17&jvmVariant=hotspot).

2. **Maven:** Make sure you have Apache Maven installed. You can check your
   Maven version by running:

   ```
   mvn --version
   ```

   If you don't have Maven installed, you can download it from
   [here](https://maven.apache.org/download.cgi).

## Cloning the Repository

To clone this repository, navigate to the folder where you want to store the
project and run:

```
git clone https://github.com/qe-collaborative-services/1115-hub.git
```

Then, navigate to the Java project folder:

```
cd 1115-hub/src/service/fhir-server-prime
```

## Running the Project

- Run the following command to compile the project and start a local testing
  server that runs it:

```
mvn jetty:run -Djetty.port=8080 -Djetty.host=localhost
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
