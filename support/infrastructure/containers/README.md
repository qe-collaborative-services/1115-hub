# SFTP and Workflow Processing Servers Setup

This guide covers the setup for an SFTP server and a processing server using
Docker. The setup involves two Docker containers: one running an SFTP server and
another running a processing server with Deno, DuckDB, and SQLite installed.
These containers share a volume to facilitate file transfers and processing.

## File Descriptions

- `Dockerfile.sftp`: Builds the Docker image for the SFTP server to handle
  ingress/egress of files.
- `Dockerfile.workflow`: Builds the Docker image for the processing server with
  Deno, DuckDB, and SQLite.
- `docker-compose.yml`: Orchestrates the setup, linking the two Docker
  containers and shared volumes.

## Setup Instructions

### On a Windows Laptop

1. **Install Docker Desktop**: Ensure Docker Desktop is installed and running on
   your Windows laptop. Download it from the official Docker website.
2. **Clone the repository**: Clone or download the repository containing the
   Dockerfiles and `docker-compose.yml`.
3. **Open a terminal**: Navigate to the directory containing the cloned or
   downloaded files.
4. **Build and Run**: Execute `docker-compose up --build` to build the images
   and start the containers.

### On a Virtual Machine (VM)

1. **Install Docker**: Ensure Docker and Docker Compose are installed on the VM.
   Use the official Docker installation guide for the VM's operating system.
2. **Transfer files**: Copy the Dockerfiles and `docker-compose.yml` to the VM.
3. **SSH into the VM**: Use an SSH client to connect to your VM.
4. **Build and Run**: Navigate to the directory containing the files and run
   `docker-compose up --build`.

### In an AWS Environment with ECS or Fargate

1. **Prepare the Docker Images**:
   - Build the Docker images locally or in a CI/CD pipeline.
   - Push the images to Amazon ECR (Elastic Container Registry). Use
     `aws ecr create-repository` to create repositories for each image if
     needed.

2. **Create an ECS Task Definition**:
   - Go to the ECS console and create a new task definition.
   - For each container, specify the image URL from ECR, memory and CPU
     requirements, and set the volume mount points. Use `/home` for the SFTP
     server and `/data` for the processing server.

3. **Create an ECS Cluster**:
   - Choose the Fargate launch type if you prefer serverless or EC2 if you want
     more control over the hosting environment.
   - Follow the prompts to configure networking and security settings.

4. **Run the Task**:
   - Once the cluster is set up, you can run the task by specifying the task
     definition and desired count.
   - Configure the task's network settings to ensure the SFTP port (22) is
     accessible.

5. **Access and Operate**:
   - Use the public IP or domain name (if configured) to access the SFTP server.
   - Monitor logs and performance directly from the ECS console or CloudWatch.

## Notes

- Ensure to configure security settings, such as SSH keys and networking rules,
  according to your environment's requirements.
- For AWS ECS, you might need to adjust IAM roles and policies to allow ECS
  tasks to access ECR images and other AWS resources.
