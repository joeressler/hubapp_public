FROM node:20-alpine AS build
WORKDIR /app

RUN addgroup -g 1001 nodegroup && \
    adduser -D -u 1001 -G nodegroup nodeuser && \
    mkdir -p /app/node_modules && \
    chown -R nodeuser:nodegroup /app

USER nodeuser

COPY --chown=nodeuser:nodegroup package*.json ./
RUN npm ci --no-audit --no-fund && npm cache clean --force

COPY --chown=nodeuser:nodegroup . .

ARG REACT_APP_RECAPTCHA_PUBLIC_KEY=
ARG REACT_APP_SENTRY_DSN=
ENV REACT_APP_RECAPTCHA_PUBLIC_KEY=$REACT_APP_RECAPTCHA_PUBLIC_KEY \
    REACT_APP_SENTRY_DSN=$REACT_APP_SENTRY_DSN \
    GENERATE_SOURCEMAP=false \
    CI=false

RUN npm run build && rm -rf node_modules && npm cache clean --force

FROM node:20-alpine AS production
WORKDIR /app

RUN addgroup -g 1001 nodegroup && \
    adduser -D -u 1001 -G nodegroup nodeuser

COPY --chown=nodeuser:nodegroup package*.json ./
COPY --from=build --chown=nodeuser:nodegroup /app/build ./build
COPY --from=build --chown=nodeuser:nodegroup /app/server.js ./server.js

RUN npm ci --omit=dev --no-audit --no-fund && \
    npm cache clean --force && \
    apk add --no-cache curl && \
    chown -R nodeuser:nodegroup /app

USER nodeuser
ENV NODE_ENV=production
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1
CMD ["node", "server.js"]

FROM node:20-alpine AS development
WORKDIR /app

RUN addgroup -g 1001 nodegroup && \
    adduser -D -u 1001 -G nodegroup nodeuser && \
    mkdir -p /app/node_modules && \
    chown -R nodeuser:nodegroup /app

USER nodeuser

COPY --chown=nodeuser:nodegroup package*.json ./
RUN npm ci --no-audit --no-fund && npm cache clean --force

COPY --chown=nodeuser:nodegroup . .
EXPOSE 3000
CMD ["npm", "start"]
