FROM node AS kong-konga-database-setup
WORKDIR /app
WORKDIR /app
COPY ./scripts/database .
RUN apt update && apt install -y curl jq iputils-ping traceroute lsb-release && \
    npm install &&  \
    ln -sf /bin/bash /bin/sh
#This line is needed to make it possible to run in a interactive mode
ENV ENV="/root/.profile"  
ENTRYPOINT ["node","/app/modules/main.js"]


FROM node AS kong-konga-configurations-setup
WORKDIR /app
COPY ./scripts/initialSetup .
RUN apt update && apt install -y curl jq iputils-ping traceroute lsb-release && \
    npm install &&  \
    ln -sf /bin/bash /bin/sh
#This line is needed to make it possible to run in a interactive mode
ENV ENV="/root/.profile"   
ENTRYPOINT ["node","/app/modules/main.js"]

FROM node AS kong-konga-elk-setup
WORKDIR /app
COPY ./scripts/initialSetup .
RUN apt update && apt install -y curl jq iputils-ping traceroute lsb-release && \
    npm install &&  \
    ln -sf /bin/bash /bin/sh
#This line is needed to make it possible to run in a interactive mode
ENV ENV="/root/.profile"   
ENTRYPOINT ["node","/app/modules/main.js"]

FROM kong AS kong-migrations
USER root
WORKDIR /
COPY ./scripts/docker-migration-entrypoint.sh .
RUN apt update && apt install python3 nano -y && \
    chmod +x docker-migration-entrypoint.sh && \
    chown -R kong:kong /usr/local/kong &&  \
    apt autoremove -y && \
    ln -sf /bin/bash /bin/sh
USER kong
ENTRYPOINT ["./docker-migration-entrypoint.sh"]


