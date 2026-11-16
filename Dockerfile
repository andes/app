ARG NODE_VERSION=18-alpine
FROM node:${NODE_VERSION} AS build

# El workflow no pasa build-args: queda prod.
ARG ENVIRONMENT=prod
ENV ENV=${ENVIRONMENT}

WORKDIR /usr/src/app

COPY package.json package-lock.json webpack.config.js ./
RUN npm ci

COPY . .
RUN cp src/environments/apiKeyMaps.ts.example src/environments/apiKeyMaps.ts
RUN npm run "build:${ENV}"

# La imagen solo lleva el dist. El nginx que lo sirve es el de integración.
FROM scratch
COPY --from=build /usr/src/app/dist /usr/src/app/dist
