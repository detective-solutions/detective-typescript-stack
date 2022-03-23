FROM node:lts-alpine

WORKDIR /app
COPY ./dist/apps/auth-service .

ENV NODE_ENV=production
ENV PORT=1111

EXPOSE ${PORT}

RUN npm install --production
CMD node ./main.js
