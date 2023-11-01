ARG NODE_VERSION=14-alpine

FROM node:${NODE_VERSION}
ARG ENVIRONMENT=prod
ENV ENV=${ENVIRONMENT}

ENV node_env=development


WORKDIR /usr/src/app
COPY package.json package-lock.json webpack.config.js ./ 

RUN npm install

COPY . .
RUN cp src/environments/apiKeyMaps.ts.example src/environments/apiKeyMaps.ts
RUN cp projects/portal/src/environments/configuracion.ts.example projects/portal/src/environments/configuracion.ts 
RUN npm run "build:${ENV}"

