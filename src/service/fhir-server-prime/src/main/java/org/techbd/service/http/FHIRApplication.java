package org.techbd.service.http;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.server.ConfigurableWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;

import java.net.InetAddress;
import java.util.Collections;

@SpringBootApplication
public class FHIRApplication implements ApplicationRunner, WebServerFactoryCustomizer<ConfigurableWebServerFactory> {

	@Value("${server.port}")
	private int port;

	@Value("${server.host}")
	private InetAddress host;

	public static void main(String[] args) {
		SpringApplication app = new SpringApplication(FHIRApplication.class);
		app.setDefaultProperties(Collections
				.singletonMap("server.port", "8080"));
		app.setDefaultProperties(Collections.singletonMap("server.host", "localhost"));
		app.run(args);
	}

	@Override
	public void run(ApplicationArguments args) throws Exception {

	}

	@Override
	public void customize(ConfigurableWebServerFactory factory) {
		factory.setPort(port);
		factory.setAddress(host);
	}
}