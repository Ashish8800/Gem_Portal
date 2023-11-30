FROM node:20-alpine

WORKDIR /backend

COPY package*.json ./

RUN npm i

COPY . .

EXPOSE 5008

CMD [ "node", "index.js" ]
