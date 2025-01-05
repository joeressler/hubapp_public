FROM node:18-alpine as build

WORKDIR /app

# Add node user and set permissions
RUN addgroup -g 1001 nodegroup && \
    adduser -D -u 1001 -G nodegroup nodeuser && \
    mkdir -p /app/node_modules && \
    chown -R nodeuser:nodegroup /app

USER nodeuser

# Copy package files
COPY --chown=nodeuser:nodegroup package*.json ./
RUN npm ci

# Copy source code and build
COPY --chown=nodeuser:nodegroup . .
RUN npm run build

# Serve the app
FROM node:18-alpine
WORKDIR /app
COPY --from=build /app/build /app/build
RUN npm install -g serve
RUN apk add --no-cache curl
CMD ["serve", "-s", "build"]

EXPOSE 3000