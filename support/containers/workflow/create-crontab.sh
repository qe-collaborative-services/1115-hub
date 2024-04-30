\
#!/bin/bash
echo "Debug: QE_NAMES='$QE_NAMES', ORCHCTL_CRON='$ORCHCTL_CRON', FHIR_ENDPOINT='$FHIR_ENDPOINT'"

# Ensure that QE_NAMES and ORCHCTL_CRON variables are provided
if [[ -z "$QE_NAMES" || -z "$ORCHCTL_CRON" || -z "$FHIR_ENDPOINT" ]]; then
    echo "Environment variables QE_NAMES, FHIR_ENDPOINT and ORCHCTL_CRON must be set."
    exit 1
fi

# Iterate over the QE_NAMES, treating it as a space-separated list
IFS=' ' read -r -a qe_names_array <<< "$QE_NAMES"

# define the file name and path
crontab_file="/etc/cron.d/1115-hub"
rm -f "$crontab_file"

# add path to crontab
echo "PATH=/usr/local/bin:/usr/bin:/bin" > "$crontab_file"


for qe_name in "${qe_names_array[@]}"; do
    
    # write the following to the crontab file for each qe:
    QE_UPPER=$(echo $qe_name | tr '[:lower:]' '[:upper:]')

    # 0 * * * * cd /app/1115-hub; /root/.deno/bin/deno run -A ./src/ahc-hrsn-elt/screening/orchctl.ts --qe bronx --publish-fhir 40lafnwsw7.execute-api.us-east-1.amazonaws.com/dev --publish-fhir-qe-id BRONX >> /SFTP/observe/log/bronx.log 2>&1
    echo "$ORCHCTL_CRON cd /app/1115-hub; /root/.deno/bin/deno run -A ./src/ahc-hrsn-elt/screening/orchctl.ts --qe $qe_name --publish-fhir $FHIR_ENDPOINT --publish-fhir-qe-id $QE_UPPER >> /SFTP/observe/log/$qe_name.log 2>&1" >> "$crontab_file"
done

# add the health check cron job
echo "0 * * * * cd /app/1115-hub; /root/.deno/bin/deno run -A ./support/bin/doctor.ts >> /doctor_log.txt 2>&1" >> "$crontab_file"

echo "Cron file has been created."