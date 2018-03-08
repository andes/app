ARG NODE_VERSION=8.9-alpine
FROM node:${NODE_VERSION}

RUN npm install -g typescript nodemon

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

EXPOSE 4200

CMD [ "npm", "run", "ng", "--", "serve", "--host",  "0.0.0.0"  ]

