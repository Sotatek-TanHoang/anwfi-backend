#FROM node:12-alpine
FROM 487168310572.dkr.ecr.eu-west-1.amazonaws.com/baseimage:latest
RUN mkdir /code \
    && apk update && apk add curl
WORKDIR /code
COPY package*.json ./
RUN npm i -g @adonisjs/cli \
    && npm install && npm cache clean --force
COPY . .
RUN cp .env.uat.example .env
EXPOSE 8456
CMD [ "node", "server" ]
