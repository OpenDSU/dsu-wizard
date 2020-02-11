FROM node:12.14.0

RUN git clone https://github.com/PrivateSky/psk-release.git

RUN cd psk-release && \
    git checkout d864b6ea40bb5c8db9838c453aa417745964cffe && \
    npm install --unsafe-perm &&\
    npm run build

RUN mkdir modules && \
    cd modules && \
    git clone https://github.com/PrivateSky/csb-wizard && \
    cd csb-wizard && \
    git checkout ac004d8d11c30a5fdf2e2a5f0016435bb62baec4

RUN chmod 711 psk-release/psknode/bin/virtualMq.sh
RUN chmod 711 psk-release/psknode/bin/csbwizard.sh
RUN cd psk-release && echo './psknode/bin/virtualMq.sh --port=8080 --folder="../tmp" & \n./psknode/bin/csbwizard.sh --port=80 --folder="../tmp"' >> startup-script.sh
RUN cd psk-release && cat startup-script.sh

EXPOSE 8080/tcp 80/tcp

CMD cd psk-release && \
    bash startup-script.sh
	
