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
