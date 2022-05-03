# node:lts-alpine.3.15
FROM node@sha256:bb776153f81d6e931211e3cadd7eef92c811e7086993b685d1f40242d486b9bb

# Set up container environment
WORKDIR /app
ENV NODE_ENV=production

# Install dependencies
COPY ./dist/apps/auth-service/package.json package-lock.json ./
RUN npm ci --audit=false
RUN rm package*.json

# Copy built code
COPY ./dist/apps/auth-service ./

# Run application as node default user (instead of root)
RUN chown -R node:node /app
USER node

EXPOSE 1111
CMD node ./main.js
