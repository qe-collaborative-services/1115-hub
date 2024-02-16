# Use Debian 11 (Bullseye) slim as the base image
FROM debian:bullseye-slim

# Avoid prompts from apt during build
ENV DEBIAN_FRONTEND=noninteractive

# Update packages and install necessary dependencies
RUN apt-get update && apt-get install -y \
    curl \
    unzip \
    wget \
    sqlite3 \
    git \
    cron \
    && rm -rf /var/lib/apt/lists/*

# Install Deno
RUN curl -fsSL https://deno.land/x/install/install.sh | sh
ENV PATH="/root/.deno/bin:$PATH"

# Install DuckDB
RUN wget -qO- https://github.com/duckdb/duckdb/releases/latest/download/duckdb_cli-linux-amd64.zip > duckdb.zip && \
    unzip duckdb.zip -d /usr/local/bin/ && \
    chmod +x /usr/local/bin/duckdb && \
    rm duckdb.zip

# Clone the specified GitHub repository
WORKDIR /app
RUN git clone https://github.com/qe-collaborative-services/1115-hub.git

# Run a Deno script from the cloned repo and store its output in a log file
RUN deno run -A ./1115-hub/support/bin/doctor.ts > doctor_log.txt

# Setup dynamic crontab entries for running a Deno script at staggered minutes for users qe1 through qe6
RUN mkdir -p /etc/cron.d && \
    for i in {1..6}; do \
        echo "$((i-1)) * * * * cd /home/qe$i/SFTP && deno run -A /app/1115-hub/src/ahc-hrsn-elt/screening/orchctl.ts >> /var/log/cron_qe$i.log 2>&1" >> /etc/cron.d/deno_cron; \
    done && \
    chmod 0644 /etc/cron.d/deno_cron && \
    crontab /etc/cron.d/deno_cron && \
    touch /var/log/cron_qe{1..6}.log

# Ensure cron is running in the foreground to keep the container alive
CMD ["cron", "-f"]
