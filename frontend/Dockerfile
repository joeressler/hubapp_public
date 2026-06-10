FROM node:18-alpine AS build
WORKDIR /app

RUN addgroup -g 1001 nodegroup && \
    adduser -D -u 1001 -G nodegroup nodeuser && \
    mkdir -p /app/node_modules && \
    chown -R nodeuser:nodegroup /app

USER nodeuser

COPY --chown=nodeuser:nodegroup package*.json ./
RUN npm ci && npm cache clean --force

COPY --chown=nodeuser:nodegroup . .

# CRA treats ESLint warnings as errors when CI=true (common in Docker/CI environments)
ENV CI=false
RUN npm run build

FROM node:18-alpine AS production
WORKDIR /app

RUN addgroup -g 1001 nodegroup && \
    adduser -D -u 1001 -G nodegroup nodeuser

COPY --from=build /app/build ./build
COPY --from=build /app/server.js ./server.js
RUN npm install --no-save express@^4.22.2 http-proxy-middleware@^2.0.9 && \
    apk add --no-cache curl && \
    chown -R nodeuser:nodegroup /app

USER nodeuser
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1
CMD ["node", "server.js"]

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
