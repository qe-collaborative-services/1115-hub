# Use Debian 11 (Bullseye) slim as the base image
FROM debian:bullseye-slim
# Avoid prompts from apt during build
ENV DEBIAN_FRONTEND=noninteractive
# Update packages and install necessary dependencies
RUN apt-get update
RUN apt-get install -y curl unzip wget sqlite3 git cron netcat procps unzip zip
RUN rm -rf /var/lib/apt/lists/*

# Install SDKMAN
RUN curl -s "https://get.sdkman.io" | bash

# Activate SDKMAN
RUN bash -c "source \"$HOME/.sdkman/bin/sdkman-init.sh\""

# Install Java and Maven using SDKMAN
RUN bash -c "source \"$HOME/.sdkman/bin/sdkman-init.sh\" && sdk install java 21.0.3-amzn && sdk default java 21.0.3-amzn"
RUN bash -c "source \"$HOME/.sdkman/bin/sdkman-init.sh\" && sdk install maven 3.9.6 && sdk default maven 3.9.6"

# Setup Environment Variable
ENV PATH="/root/.sdkman/candidates/java/current/bin:/root/.sdkman/candidates/maven/current/bin:${PATH}"
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