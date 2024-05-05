# Use Debian 11 (Bullseye) slim as the base image
FROM debian:bullseye-slim
# Avoid prompts from apt during build
ENV DEBIAN_FRONTEND=noninteractive
# Update packages and install necessary dependencies
RUN apt-get update
RUN apt-get install -y curl unzip wget sqlite3 git cron netcat procps
RUN rm -rf /var/lib/apt/lists/*

# Install Deno
ARG DENO_VERSION=1.41.0
RUN curl -fsSL https://deno.land/x/install/install.sh | DENO_VERSION=1.41.0 sh
ENV PATH="/root/.deno/bin:$PATH"

# Install DuckDB
RUN wget -qO- https://github.com/duckdb/duckdb/releases/download/v0.10.2/duckdb_cli-linux-amd64.zip >duckdb.zip
RUN unzip duckdb.zip -d /usr/local/bin/
RUN chmod +x /usr/local/bin/duckdb
RUN export PATH=$PATH:/usr/local/bin
RUN rm duckdb.zip

# Clone the specified GitHub repository
WORKDIR /app
ARG REPO_URL
ARG TAG
RUN git clone --depth 1 --branch ${TAG} ${REPO_URL}

# run deno check to install required dependencies
RUN deno cache ./1115-hub/src/ahc-hrsn-elt/screening/orchctl.ts
RUN deno check --config ./1115-hub/deno.jsonc ./1115-hub/src/ahc-hrsn-elt/screening/orchctl.ts

# Run a Deno script from the cloned repo and store its output in a log file
RUN deno run -A ./1115-hub/support/bin/doctor.ts >/doctor_log.txt

EXPOSE 8082

ARG QE_NAMES
ARG TAG
ARG DATE
ARG INTERVAL
ARG ORCHCTL_CRON
ARG FHIR_ENDPOINT

ENV QE_NAMES=${QE_NAMES}
ENV TAG=${TAG}
ENV DATE=${DATE}
ENV INTERVAL=${INTERVAL}
ENV ORCHCTL_CRON=${ORCHCTL_CRON}
ENV FHIR_ENDPOINT=${FHIR_ENDPOINT}

RUN echo "Debug: QE_NAMES='$QE_NAMES', ORCHCTL_CRON='$ORCHCTL_CRON', FHIR_ENDPOINT='$FHIR_ENDPOINT'"

# Ensure that QE_NAMES, version, date, and ORCHCTL_CRON variables are provided
# Use bash to execute the command
RUN /bin/bash -c "if [[ -z \"$QE_NAMES\" || -z \"$ORCHCTL_CRON\" || -z \"$FHIR_ENDPOINT\" ]]; then \
        echo \"Environment variables QE_NAMES, TAG, DATE, DEPLOYMENT_DOMAIN, SEMAPHORE, ORCHCTL_CRON must be set.\"; \
        exit 1; \
    fi"

# Iterate over the QE_NAMES, treating it as a space-separated list 
RUN /bin/bash -c "IFS=' ' read -r -a qe_names_array <<< \"$QE_NAMES\";"

# define the file name and path
ENV crontab_file=/etc/cron.d/1115-hub
RUN touch $crontab_file


# add path to crontab
RUN echo "PATH=/usr/local/bin:/usr/bin:/bin" >> $crontab_file

RUN /bin/bash -c "\
    IFS=' ' read -r -a qe_names_array <<< \"$QE_NAMES\"; \
    for qe_name in \${qe_names_array[@]}; do \
        QE_UPPER=\$(echo \$qe_name | tr '[:lower:]' '[:upper:]'); \
        echo \"\$ORCHCTL_CRON cd /app/1115-hub; /root/.deno/bin/deno run -A ./src/ahc-hrsn-elt/screening/orchctl.ts --qe \$qe_name --publish-fhir \$FHIR_ENDPOINT --publish-fhir-qe-id \$QE_UPPER >> /SFTP/observe/log/\$qe_name.log 2>&1\" >> \"\$crontab_file\"; \
    done"


RUN /bin/bash -c "echo '0 * * * * cd /app/1115-hub; /root/.deno/bin/deno run -A ./support/bin/doctor.ts >> /doctor_log.txt 2>&1' >> /etc/cron.d/1115-hub"

RUN /bin/bash -c "\
    health_status_file="/doctor_log.txt"\
    while true; do \
        health_status_content=$(<"$health_status_file") \
        content_length=${#health_status_content} \
        echo -e "HTTP/1.1 200 OK\nContent-Length: $content_length\nConnection: close\n\n$health_status_content" | nc -l -p 8082 -N \
    done" &

RUN chmod 0644 /etc/cron.d/1115-hub
RUN crontab /etc/cron.d/1115-hub

# Run the cron job
RUN service cron start

CMD ["cron", "-f"]
