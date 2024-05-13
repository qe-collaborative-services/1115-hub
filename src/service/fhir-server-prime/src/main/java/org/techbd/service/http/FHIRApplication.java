package org.techbd.service.http;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class FHIRApplication {

	public static void main(String[] args) {
		try {
			SpringApplication.run(FHIRApplication.class, args);
			// Code that may throw an exception
		} catch (Exception ex) {
			ex.printStackTrace();
		}
	}
}