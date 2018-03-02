FROM node:8.9-alpine

WORKDIR /usr/src/app

RUN npm install -g typescript @angular/cli@1.4.0

COPY package.json ./

RUN npm install

COPY . .

EXPOSE 4200

CMD [ "ng", "serve", "--host",  "0.0.0.0"  ]

