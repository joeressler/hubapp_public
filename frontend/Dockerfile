FROM node:18-alpine as build

WORKDIR /app

# Add node user and set permissions
RUN addgroup -g 1001 nodegroup && \
    adduser -D -u 1001 -G nodegroup nodeuser && \
    mkdir -p /app/node_modules && \
    chown -R nodeuser:nodegroup /app

USER nodeuser

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Serve the app
FROM node:18-alpine
WORKDIR /app
COPY --from=build /app/build /app/build
RUN npm install -g serve
RUN apk add --no-cache curl
CMD ["serve", "-s", "build"]

EXPOSE 3000