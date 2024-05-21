FROM maven:3.9.6-amazoncorretto-21-debian
# Avoid prompts from apt during build
ENV DEBIAN_FRONTEND=noninteractive
# Update packages and install necessary dependencies
RUN apt-get update
RUN apt-get install -y curl unzip wget sqlite3 git cron
RUN rm -rf /var/lib/apt/lists/*

RUN java --version
RUN mvn --version

# Clone the specified GitHub repository
WORKDIR /app
ARG REPO_URL
ARG TAG
RUN git clone --depth 1 --branch ${TAG} ${REPO_URL}

# open the port for the fhir server
EXPOSE 8080

# start the fhir server
WORKDIR /app/1115-hub/src/service/fhir-server-prime

CMD ["mvn", "spring-boot:run", "-Dspring-boot.run.arguments=--server.port=8080 --server.host=0.0.0.0"]