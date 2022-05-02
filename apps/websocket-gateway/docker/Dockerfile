FROM node@sha256:38bc06c682ae1f89f4c06a5f40f7a07ae438ca437a2a04cf773e66960b2d75bc

# Set up container environment
WORKDIR /app
ENV NODE_ENV=production

# Install dependencies
COPY ./dist/apps/websocket-gateway/package.json package-lock.json ./
RUN npm ci --audit=false
RUN rm package*.json

# Copy built code
COPY ./dist/apps/websocket-gateway ./

# Run application as node default user (instead of root)
RUN chown -R node:node /app
USER node

EXPOSE 1111
CMD node ./main.js
