FROM node:18-alpine AS development
WORKDIR /app

RUN addgroup -g 1001 nodegroup && \
    adduser -D -u 1001 -G nodegroup nodeuser && \
    mkdir -p /app/node_modules && \
    chown -R nodeuser:nodegroup /app

USER nodeuser

COPY --chown=nodeuser:nodegroup package*.json ./
RUN npm ci && npm cache clean --force

COPY --chown=nodeuser:nodegroup . .
EXPOSE 3000
CMD ["npm", "start"]

FROM node:18-alpine AS build
WORKDIR /app

# Add node user and set permissions
RUN addgroup -g 1001 nodegroup && \
    adduser -D -u 1001 -G nodegroup nodeuser && \
    mkdir -p /app/node_modules && \
    chown -R nodeuser:nodegroup /app

USER nodeuser

# Copy package files and install dependencies
COPY --chown=nodeuser:nodegroup package*.json ./
RUN npm ci && npm cache clean --force

# Copy source code and build the app
COPY --chown=nodeuser:nodegroup . .
RUN npm run build

# Serve static files and proxy /api + /voice to backend containers
FROM node:18-alpine
WORKDIR /app
COPY --from=build /app/build /app/build
COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/server.js /app/server.js
RUN npm install --no-save express@^4.22.2 http-proxy-middleware@^2.0.9
EXPOSE 3000
CMD ["node", "server.js"]