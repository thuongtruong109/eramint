FROM node:20.19.5-alpine

WORKDIR /usr/app

RUN npm install --global pm2

COPY ./package*.json ./

RUN npm install

RUN chown -R node:node /usr/app

COPY ./ ./

# Build app
#RUN npm run build

EXPOSE 3000

USER node

CMD [ "pm2-runtime", "start", "npm", "--", "run", "dev" ]
