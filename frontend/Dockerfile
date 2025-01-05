FROM node:18-alpine as build

WORKDIR /app

# Add node user and set permissions
RUN addgroup -g 1001 nodegroup && \
    adduser -D -u 1001 -G nodegroup nodeuser

# Create and set permissions for node_modules
RUN mkdir -p /app/node_modules && \
    chown -R nodeuser:nodegroup /app

# Switch to nodeuser
USER nodeuser

# Copy package files with correct ownership
COPY --chown=nodeuser:nodegroup package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY --chown=nodeuser:nodegroup . .

# Build the application
RUN npm run build

# Serve the app
FROM node:18-alpine
WORKDIR /app
COPY --from=build /app/build /app/build
RUN npm install -g serve && \
    apk add --no-cache curl

# Add non-root user
RUN addgroup -g 1001 nodegroup && \
    adduser -D -u 1001 -G nodegroup nodeuser && \
    chown -R nodeuser:nodegroup /app

USER nodeuser

EXPOSE 3000
CMD ["serve", "-s", "build"]