# Handle dependencies (mostly from cache if unchanged)
FROM node@sha256:38bc06c682ae1f89f4c06a5f40f7a07ae438ca437a2a04cf773e66960b2d75bc AS dependencies
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
