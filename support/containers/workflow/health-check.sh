#!/bin/bash

# Path to the file containing the health status
health_status_file="/doctor_log.txt"

# Listen for connections and respond
while true; do
  # Read the content of the health status file
  health_status_content=$(<"$health_status_file")
  
  # Calculate the content length
  content_length=${#health_status_content}

  # Using netcat to listen on port 8080 and respond with the content of health_status.txt
  echo -e "HTTP/1.1 200 OK\nContent-Length: $content_length\nConnection: close\n\n$health_status_content" | nc -l -p 8082 -N
done