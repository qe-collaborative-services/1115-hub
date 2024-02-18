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
RUN git clone https://github.com/softservesoftware/1115-hub.git

# Run a Deno script from the cloned repo and store its output in a log file
RUN deno run -A ./1115-hub/support/bin/doctor.ts >doctor_log.txt

# create a cron job for each qe1-6 to run the deno script
RUN echo "* * * * * deno run -A /app/1115-hub/src/ahc-hrsn-elt/screening/orchctl.ts --qe=qe1" > /etc/cron.d/1115-hub
RUN echo "* * * * * deno run -A /app/1115-hub/src/ahc-hrsn-elt/screening/orchctl.ts --qe=qe2" > /etc/cron.d/1115-hub
RUN echo "* * * * * deno run -A /app/1115-hub/src/ahc-hrsn-elt/screening/orchctl.ts --qe=qe3" > /etc/cron.d/1115-hub
RUN echo "* * * * * deno run -A /app/1115-hub/src/ahc-hrsn-elt/screening/orchctl.ts --qe=qe4" > /etc/cron.d/1115-hub
RUN echo "* * * * * deno run -A /app/1115-hub/src/ahc-hrsn-elt/screening/orchctl.ts --qe=qe5" > /etc/cron.d/1115-hub
RUN echo "* * * * * deno run -A /app/1115-hub/src/ahc-hrsn-elt/screening/orchctl.ts --qe=qe6" > /etc/cron.d/1115-hub
RUN chmod 0644 /etc/cron.d/1115-hub
RUN crontab /etc/cron.d/1115-hub

# Run the cron job
RUN service cron start



# keep container open with cron
CMD ["cron", "-f"]

# CMD ["deno", "run", "-A", "/app/1115-hub/src/ahc-hrsn-elt/screening/orchctl.ts"]
