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

Before running the project, you need to configure the application properties in
the `src/main/resources/application.properties` file.

Here are the required properties:

- `shinnyDataLakeApiImpGuideProfileUri`: This property specifies the URI of the
  FHIR Implementation Guide profile.

Ensure you provide the appropriate values for these properties in the
`application.properties` file before running the project.

Once the properties are configured, run the following command to compile the
project and start a local testing server that runs it:

```
mvn jetty:run -Djetty.port=8080 -Djetty.host=localhost
```

#### Command Breakdown

To start the Jetty server using Maven, you use the following command:

Let's break down each part of the command:

1. **`mvn`**: This is the command-line interface for Apache Maven, a build
   automation tool primarily used for Java projects. It's used to execute Maven
   commands.

2. **`jetty:run`**: This part specifies the Maven goal to execute. In this case,
   it's the `run` goal of the Jetty Maven Plugin. The Jetty plugin integrates
   Jetty, a lightweight Java-based web server and servlet container, with Maven,
   allowing you to run your web application during the Maven build process.

3. **`-Djetty.port=8080`**: This is a system property passed to Maven using the
   `-D` flag. It specifies the port on which the Jetty server will listen for
   incoming connections. In this case, it sets the port to `8080`, which is a
   commonly used port for web servers.

4. **`-Djetty.host=localhost`**: Similar to the previous argument, this is
   another system property passed to Maven using the `-D` flag. It specifies the
   host or IP address on which the Jetty server will bind to. In this case, it
   sets the host to `localhost`, which means the server will only accept
   connections originating from the same machine.

# Test the endpoints

To test your server endpoints using http yac, follow these steps:

1. Ensure you have the `vscode-httpyac` Visual Studio Code extension installed.

2. Open the `fhir-service.test.http` file located in the root directory of your
   Java project.

3. Update the URL placeholders in the file with the actual endpoints you want to
   test. The placeholders might be represented as `{{$dotenv HOST}}` and
   `{{$dotenv PORT}}`. By default it is localhost and 8080.

4. Run the tests using the `vscode-httpyac` extension in Visual Studio Code.
   This extension will execute the HTTP requests defined in
   `fhir-service.test.http` and display the results of the tests.

5. Verify that the tests pass for both success and failure scenarios.

By following these steps, you can easily test your server endpoints and verify
their behavior using http yac.

- Test that your server is running by fetching its CapabilityStatement:

  http://localhost:8080/metadata

- Validating a Bunlde resource from your server using the following URL:

  http://localhost:8080/Bundle/$validate

- Submitting a Bunlde resource from your server using the following URL:

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