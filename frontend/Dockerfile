FROM node:20-alpine as build

WORKDIR /code

COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm i
RUN npm i cors
COPY . .
RUN npm run build

FROM nginx:1.22-alpine3.17-slim as prod

COPY --from=build /code/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# FROM node:14-alpine

# WORKDIR /frontend

# COPY package*.json ./

# RUN npm install

# COPY . .

# EXPOSE 3107
# CMD ["npm", "start"]
