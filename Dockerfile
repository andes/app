ARG NODE_VERSION=8.9-alpine
FROM node:${NODE_VERSION}

RUN npm install -g typescript @angular/cli@1.4.0 nodemon

WORKDIR /usr/src/app

COPY package.json ./

RUN npm install

COPY . .

EXPOSE 4200

CMD [ "ng", "serve", "--host",  "0.0.0.0"  ]

