FROM node:18-alpine AS build
WORKDIR /n-oms-backend

COPY ["package.json","./"]
COPY [".npmrc","./"]
RUN npm install
RUN npm install pm2 -g
COPY . .
RUN npm run build

FROM node:18-alpine

WORKDIR /n-oms-backend
COPY ["package.json","./"]
COPY [".npmrc","./"]
RUN npm install --only=production
RUN npm install pm2 -g
COPY --from=build /n-oms-backend/bin ./bin

CMD [ "pm2-runtime", "./bin/app.js" ]