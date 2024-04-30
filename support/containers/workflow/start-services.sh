#!/bin/bash

# Kill any existing cron processes to avoid conflicts
pkill -9 cron
sleep 2
# Remove any stale lock file that might be preventing cron from starting
rm -f /var/run/crond.pid
if pgrep cron; then
    echo "Failed to kill cron processes."
    exit 1
fi
echo "Cron processes have been killed."

# start the crontab script
/bin/bash /create-crontab.sh
echo "Crontab script has been executed."
chmod 0644 /etc/cron.d/1115-hub
echo "Cron file has been made executable."
crontab /etc/cron.d/1115-hub
echo "Cron file has been added to crontab."

# Start the health check endpoint in the background
/bin/bash /health-check.sh &
echo "Health check endpoint has been started."

# Start cron in the foreground
cron -f

