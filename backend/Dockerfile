FROM node:20-alpine

WORKDIR /backend

COPY package*.json ./

RUN npm i
RUN npm i cors

COPY . .

EXPOSE 5008

CMD [ "node", "index.js" ]
