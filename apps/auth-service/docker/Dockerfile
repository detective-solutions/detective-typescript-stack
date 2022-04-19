# Handle dependencies (mostly from cache if unchanged)
FROM node:lts-alpine AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
ENV NODE_ENV=production
RUN npm ci --audit=false
RUN rm package*.json

# Handle actual code (mostly not from cache)
FROM dependencies AS code
COPY ./dist/apps/auth-service ./
RUN rm main.js.map

# Set up actual production container
FROM code
# Run application as node default user
RUN chown -R node:node /app
USER node

EXPOSE 1111
CMD node ./main.js
