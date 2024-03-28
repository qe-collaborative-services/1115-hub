# Use Debian 11 (Bullseye) slim as the base image
FROM debian:bullseye-slim
# Avoid prompts from apt during build
ENV DEBIAN_FRONTEND=noninteractive
# Declare REPO_URL as a build-time argument
ARG REPO_URL
# Update packages and install necessary dependencies
RUN apt-get update
RUN apt-get install -y curl unzip wget sqlite3 git cron netcat procps
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
RUN deno run -A ./1115-hub/support/bin/doctor.ts >/doctor_log.txt

# Define system PATH in crontab and setup cron jobs
COPY crontab /etc/cron.d/1115-hub
RUN echo "PATH=/usr/local/bin:/usr/bin:/bin" >>/etc/cron.d/1115-hub
RUN chmod 0644 /etc/cron.d/1115-hub
RUN crontab /etc/cron.d/1115-hub

EXPOSE 8082

# Add the health check script
COPY health-check.sh /health-check.sh
RUN chmod +x /health-check.sh

# Add the startup script to start cron and then do other tasks
COPY start-services.sh /start-services.sh
RUN chmod +x /start-services.sh

# run the health check script in the background
CMD ["/start-services.sh"]
