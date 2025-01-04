FROM node:18-alpine
WORKDIR /app

# Add node user and set permissions
RUN addgroup -g 1001 nodegroup && \
    adduser -D -u 1001 -G nodegroup nodeuser && \
    mkdir -p /app/node_modules && \
    chown -R nodeuser:nodegroup /app

USER nodeuser

# Copy package files
COPY --chown=nodeuser:nodegroup package*.json ./
RUN npm ci && \
    npm install @babel/plugin-proposal-private-property-in-object --save-dev && \
    npm cache clean --force

# Copy source code
COPY --chown=nodeuser:nodegroup . .

# Add environment variables for development
ENV NODE_ENV=production \
    WDS_SOCKET_PORT=0 \
    WATCHPACK_POLLING=true \
    CHOKIDAR_USEPOLLING=true

# Expose development port
EXPOSE 3000
CMD ["npm", "start"]