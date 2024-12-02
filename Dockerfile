# Stage 1: Build React frontend
FROM node:18 AS frontend-build
WORKDIR /app/frontend

# Copy package files for caching
COPY frontend/package.json frontend/package-lock.json ./

# Clean install dependencies and clear npm cache
RUN npm cache clean --force && \
    rm -rf node_modules && \
    npm install

# Copy all frontend files
COPY frontend/src ./src
COPY frontend/public ./public
COPY frontend/tsconfig.json ./
COPY frontend/*.d.ts ./

# Set NODE_ENV to production for optimal build
ENV NODE_ENV=production
ENV CI=false
ENV GENERATE_SOURCEMAP=false

# Build frontend with reduced output
RUN npm run build

# Stage 2: Python backend with frontend build
FROM python:3.12.3-bullseye

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    netcat-openbsd \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy Python dependencies and install them
COPY requirements.txt .
RUN pip install -r requirements.txt --no-cache-dir

# Create config directory and ensure it exists
RUN mkdir -p /app/config

# Copy the rest of the backend code
COPY backend ./backend
COPY modules ./modules
COPY utils ./utils
COPY storage ./storage

# Set environment variables
ENV FLASK_APP=backend/app.py
ENV PYTHONPATH=/app
ENV FLASK_ENV=development

# Copy the built frontend from stage 1
COPY --from=frontend-build /app/frontend/build ./frontend/build

EXPOSE 8080

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/api/health || exit 1

# Start the Flask application
CMD ["flask", "run", "--host", "0.0.0.0", "--port", "8080"]