# Use Debian 11 (Bullseye) slim as the base image
FROM debian:bullseye-slim
# Avoid prompts from apt during build
ENV DEBIAN_FRONTEND=noninteractive
# Update packages and install necessary dependencies
RUN apt-get update
RUN apt-get install -y curl unzip wget sqlite3 git cron netcat procps openjdk-17-jdk maven
RUN rm -rf /var/lib/apt/lists/*

# make sure java and maven are in the path
ENV PATH="/usr/lib/jvm/java-17-openjdk-amd64/bin:/usr/share/maven/bin:$PATH"
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
CMD ["mvn", "clean", "install", "jetty:run"]

