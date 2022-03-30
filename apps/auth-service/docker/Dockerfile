FROM node:lts-alpine AS base
RUN apk update && apk upgrade

FROM base AS code
WORKDIR /app
COPY ./dist/apps/auth-service .
COPY ./package-lock.json .
RUN npm ci --audit=false
RUN rm package*.json && rm main.js.map

FROM code AS final
ENV NODE_ENV=production
EXPOSE 1111
CMD node ./main.js
