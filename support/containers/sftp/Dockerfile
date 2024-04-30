# Use the atmoz/sftp image as the base
FROM atmoz/sftp

ARG QE_NAMES
ARG TAG
ARG DATE 
ARG ORCHCTL_CRON

ENV QE_NAMES=${QE_NAMES}
ENV TAG=${TAG}
ENV DATE=${DATE}
ENV ORCHCTL_CRON=${ORCHCTL_CRON}


# Install netcat for health checking purposes
RUN apt-get update && \
    apt-get install -y netcat && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# add the users conf file
COPY users.conf /etc/sftp/users.conf

# Add the start script
COPY start-services.sh /usr/local/bin/start-services.sh
RUN chmod +x /usr/local/bin/start-services.sh

# Add the health check script
COPY health-check.sh /health-check.sh
RUN chmod +x /health-check.sh

COPY README-template.md /README-template.md
COPY create-readme.sh /create-readme.sh
RUN chmod +x /create-readme.sh

# expose the health check port
EXPOSE 8081
# expose the sftp port
EXPOSE 22


ENTRYPOINT ["/usr/local/bin/start-services.sh"]