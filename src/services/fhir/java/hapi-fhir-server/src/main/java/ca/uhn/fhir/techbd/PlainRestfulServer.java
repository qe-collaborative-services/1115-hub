package ca.uhn.fhir.techbd;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;

import ca.uhn.fhir.context.FhirContext;
import ca.uhn.fhir.rest.server.RestfulServer;

@WebServlet("/*")
public class PlainRestfulServer extends RestfulServer {

	@Override
	protected void initialize() throws ServletException {
		// Create a context for the appropriate version
		setFhirContext(FhirContext.forR4());
		
		// Register resource providers
		registerProvider(new FHIRBundleValidator());

	}
}
