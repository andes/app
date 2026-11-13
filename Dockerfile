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

FROM nginx:alpine

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

EXPOSE 80
