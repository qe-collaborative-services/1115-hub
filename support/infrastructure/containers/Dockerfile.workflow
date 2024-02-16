# Dockerfile for Deno, DuckDB, and SQLite server
FROM debian:bullseye-slim

# Install curl, unzip, wget, and SQLite
RUN apt-get update && apt-get install -y curl unzip wget sqlite3 && rm -rf /var/lib/apt/lists/*

# Install Deno
RUN curl -fsSL https://deno.land/x/install/install.sh | sh
ENV PATH="/root/.deno/bin:$PATH"

# Install DuckDB
RUN wget -qO- https://github.com/duckdb/duckdb/releases/latest/download/duckdb_cli-linux-amd64.zip > duckdb.zip && \
    unzip duckdb.zip -d /usr/local/bin/ && \
    chmod +x /usr/local/bin/duckdb && \
    rm duckdb.zip

# Set working directory to a common volume
WORKDIR /data

CMD ["bash"]
