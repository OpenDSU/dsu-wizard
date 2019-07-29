FROM node:latest

RUN git clone https://github.com/PrivateSky/privatesky.git

RUN cd privatesky && \
    npm install --unsafe-perm &&\
    npm run build

RUN cd privatesky && echo './psknode/bin/virtualMq.sh --port=8080 --folder="../tmp" & \n./psknode/bin/csbwizard.sh --port=80 --folder="../tmp"' >> startup-script.sh
RUN cd privatesky && cat startup-script.sh

EXPOSE 8080/tcp 80/tcp

CMD cd privatesky && \
    rm -rf node_modules && \
    npm run update && \
    bash startup-script.sh
	
