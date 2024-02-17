# Use Debian 11 (Bullseye) slim as the base image
FROM debian:bullseye-slim

# Avoid prompts from apt during build
ENV DEBIAN_FRONTEND=noninteractive

# Update packages and install necessary dependencies
RUN apt-get update
RUN apt-get install -y curl unzip wget sqlite3 git cron
RUN rm -rf /var/lib/apt/lists/*

# Install Deno
RUN curl -fsSL https://deno.land/x/install/install.sh | sh
ENV PATH="/root/.deno/bin:$PATH"

# Install DuckDB
RUN wget -qO- https://github.com/duckdb/duckdb/releases/latest/download/duckdb_cli-linux-amd64.zip >duckdb.zip
RUN unzip duckdb.zip -d /usr/local/bin/
RUN chmod +x /usr/local/bin/duckdb
RUN rm duckdb.zip

# Clone the specified GitHub repository
WORKDIR /app
RUN git clone https://github.com/qe-collaborative-services/1115-hub.git

# Run a Deno script from the cloned repo and store its output in a log file
RUN deno run -A ./1115-hub/support/bin/doctor.ts >doctor_log.txt

# Corrected Dockerfile snippet to create crontab entries and log files using a single RUN instruction
RUN mkdir -p /etc/cron.d && \
    touch /etc/cron.d/deno_cron && \
    for i in $(seq 1 6); do \
        echo "* * * * * cd /SFTP/qe$i/ingress && deno run -A /app/1115-hub/src/ahc-hrsn-elt/screening/orchctl.ts >> /var/log/cron_qe$i.log 2>&1" >> /etc/cron.d/deno_cron; \
        touch /var/log/cron_qe$i.log; \
    done && \
    chmod 0644 /etc/cron.d/deno_cron && \
    crontab /etc/cron.d/deno_cron


# Ensure cron is running in the foreground to keep the container alive
CMD ["cron", "-f"]
