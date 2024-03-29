# Use Debian 11 (Bullseye) slim as the base image
FROM debian:bullseye-slim
# Avoid prompts from apt during build
ENV DEBIAN_FRONTEND=noninteractive
# Declare REPO_URL as a build-time argument
ARG REPO_URL
# Update packages and install necessary dependencies
RUN apt-get update
RUN apt-get install -y curl unzip wget sqlite3 git cron
RUN rm -rf /var/lib/apt/lists/*

# Install Deno
ARG DENO_VERSION=1.41.0
RUN curl -fsSL https://deno.land/x/install/install.sh | DENO_VERSION=1.41.0 sh
ENV PATH="/root/.deno/bin:$PATH"

# Install DuckDB
RUN wget -qO- https://github.com/duckdb/duckdb/releases/download/v0.9.2/duckdb_cli-linux-amd64.zip >duckdb.zip
RUN unzip duckdb.zip -d /usr/local/bin/
RUN chmod +x /usr/local/bin/duckdb
RUN export PATH=$PATH:/usr/local/bin
RUN rm duckdb.zip

# Clone the specified GitHub repository
WORKDIR /app
RUN git clone ${REPO_URL}

# Run a Deno script from the cloned repo and store its output in a log file
RUN deno run -A ./1115-hub/support/bin/doctor.ts > doctor_log.txt

# Define system PATH in crontab
RUN echo "PATH=/usr/local/bin:/usr/bin:/bin" >> /etc/cron.d/1115-hub

# create a cron job for each qe1-6 to run the deno script
RUN echo "*/5 * * * * cd /app/1115-hub; /root/.deno/bin/deno run -A ./src/ahc-hrsn-elt/screening/orchctl.ts --qe bronx --publish-fhir 40lafnwsw7.execute-api.us-east-1.amazonaws.com/dev --publish-fhir-qe-id BRONX >> /SFTP/observe/log/bronx.log 2>&1" >> /etc/cron.d/1115-hub && \
    echo "*/5 * * * * cd /app/1115-hub; /root/.deno/bin/deno run -A ./src/ahc-hrsn-elt/screening/orchctl.ts --qe healtheconn --publish-fhir 40lafnwsw7.execute-api.us-east-1.amazonaws.com/dev --publish-fhir-qe-id HEALTHECONN >> /SFTP/observe/log/healtheconn.log 2>&1" >> /etc/cron.d/1115-hub && \
    echo "*/5 * * * * cd /app/1115-hub; /root/.deno/bin/deno run -A ./src/ahc-hrsn-elt/screening/orchctl.ts --qe grrhio --publish-fhir 40lafnwsw7.execute-api.us-east-1.amazonaws.com/dev --publish-fhir-qe-id GRRHIO >> /SFTP/observe/log/grrhio.log 2>&1" >> /etc/cron.d/1115-hub && \
    echo "*/5 * * * * cd /app/1115-hub; /root/.deno/bin/deno run -A ./src/ahc-hrsn-elt/screening/orchctl.ts --qe healthix --publish-fhir 40lafnwsw7.execute-api.us-east-1.amazonaws.com/dev --publish-fhir-qe-id HEALTHIX >> /SFTP/observe/log/healthix.log 2>&1" >> /etc/cron.d/1115-hub && \
    echo "*/5 * * * * cd /app/1115-hub; /root/.deno/bin/deno run -A ./src/ahc-hrsn-elt/screening/orchctl.ts --qe healthelink --publish-fhir 40lafnwsw7.execute-api.us-east-1.amazonaws.com/dev --publish-fhir-qe-id HEALTHELINK >> /SFTP/observe/log/healthelink.log 2>&1" >> /etc/cron.d/1115-hub && \
    echo "*/5 * * * * cd /app/1115-hub; /root/.deno/bin/deno run -A ./src/ahc-hrsn-elt/screening/orchctl.ts --qe hixny --publish-fhir 40lafnwsw7.execute-api.us-east-1.amazonaws.com/dev --publish-fhir-qe-id HIXNY >> /SFTP/observe/log/hixny.log 2>&1" >> /etc/cron.d/1115-hub

RUN chmod 0644 /etc/cron.d/1115-hub
RUN crontab /etc/cron.d/1115-hub

# Run the cron job
RUN service cron start

# keep container open with cron
CMD ["cron", "-f"]