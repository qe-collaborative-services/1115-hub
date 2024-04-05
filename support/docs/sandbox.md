# Setup and Testing Instructions for 1115-hub

This document provides step-by-step instructions for setting up and testing the
1115-hub project on both Windows and Debian machines. The 1115-hub project is
designed to facilitate the processing and analysis of healthcare data, and these
instructions will help you get started with the necessary tools and
configurations.

## On a Windows Machine:

1. **Install Docker Desktop**: Ensure Docker Desktop is installed and running on
   your Windows laptop. You can download it from the
   [Official Docker website](https://docs.docker.com/desktop/install/windows-install/).

2. **Install git on machine**: Download the latest (2.44.0) 64-bit version of
   Git for Windows from the
   [Official website](https://git-scm.com/download/win).

3. **Run PowerShell Script**: Open a PowerShell Window and execute the following
   commands:

   ```powershell
   git clone https://github.com/qe-collaborative-services/1115-hub.git
   cd 1115-hub/support/infrastructure/containers
   docker-compose build --no-cache
   docker-compose up -d
   ```

4. **For file transfer**: Download the latest WinSCP for Windows from the
   [Official website](https://winscp.net/eng/download.php#google_vignette).

5. **Connection Credentials**:
   ```plaintext
   Use the credentials received for the sFTP connection
   port: 2222
   host: localhost
   ```

6. **Testing Process**: Connect to WinSCP and put the test files into the
   **ingress** folder. Synthetic sample files are available in the repository at
   [`1115-hub/support/assurance/ahc-hrsn-elt/screening/synthetic-content`](https://github.com/qe-collaborative-services/1115-hub/tree/main/support/assurance/ahc-hrsn-elt/screening/synthetic-content).

## On a Debian Machine:

1. **Install Docker and Docker Compose**:
   ```bash
   sudo apt-get update
   sudo apt-get install docker.io
   sudo apt-get install docker-compose
   ```

2. **Install git on machine**:
   ```bash
   sudo apt-get install git
   ```

3. **Run Bash Script**: Open a terminal and execute the following commands:
   ```bash
   git clone https://github.com/qe-collaborative-services/1115-hub.git
   cd 1115-hub/support/infrastructure/containers 
   docker-compose build --no-cache
   docker-compose up -d
   ```

4. **For file transfer**: Install FileZilla on a Debian machine:
   ```bash
   sudo apt-get install filezilla
   ```

5. **Connection Credentials**:
   ```plaintext
   Use the credentials received for the sFTP connection
   port: 2222
   host: localhost
   ```

6. **Testing Process**: Connect to FileZilla and put the test files into the
   **ingress** folder. Synthetic sample files are available in the repository at
   [`1115-hub/support/assurance/ahc-hrsn-elt/screening/synthetic-content`](https://github.com/qe-collaborative-services/1115-hub/tree/main/support/assurance/ahc-hrsn-elt/screening/synthetic-content).
