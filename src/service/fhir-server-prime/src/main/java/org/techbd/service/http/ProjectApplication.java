package org.techbd.service.http;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ProjectApplication {

	public static void main(String[] args) {
		try {
			SpringApplication.run(ProjectApplication.class, args);
			// Code that may throw an exception
		} catch (Exception ex) {
			ex.printStackTrace();
		}
	}

}
