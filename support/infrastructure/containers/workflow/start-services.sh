#!/bin/bash

# Kill any existing cron processes to avoid conflicts
pkill cron

# Remove any stale lock file that might be preventing cron from starting
rm -f /var/run/crond.pid

# Start the health check endpoint in the background
/bin/bash /health-check.sh &

# Start cron in the foreground
cron -f
