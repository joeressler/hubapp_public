FROM node:18-alpine as build
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

# Use a lightweight server to serve the static files
FROM node:18-alpine
WORKDIR /app
COPY --from=build /app/build /app/build
COPY --from=build /app/package.json /app/package.json
RUN npm install -g serve
EXPOSE 3000
CMD ["serve", "-s", "build"]