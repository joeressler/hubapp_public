# Stage 1: Build React frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend

# Copy only package files first for better layer caching
COPY frontend/package*.json ./

# Install ALL dependencies (including dev dependencies) for build
RUN npm ci && \
    npm install @babel/plugin-proposal-private-property-in-object --save-dev && \
    npm cache clean --force

# Copy only necessary frontend files
COPY frontend/src ./src
COPY frontend/public ./public
COPY frontend/tsconfig.json ./
COPY frontend/*.d.ts ./

# Build frontend with optimizations
ENV NODE_ENV=production \
    CI=false \
    GENERATE_SOURCEMAP=false

RUN npm run build

# Stage 2: Python backend with frontend build
FROM python:3.11-slim-bullseye

WORKDIR /app

# Install only necessary system dependencies including MySQL dev packages
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    netcat-openbsd \
    curl \
    pkg-config \
    default-libmysqlclient-dev \
    build-essential \
    gcc \
    python3-dev \
    libffi-dev \
    && rm -rf /var/lib/apt/lists/* && \
    pip install --no-cache-dir --upgrade pip setuptools wheel

# Copy and install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Create necessary directories and set permissions
RUN mkdir -p /app/config /app/storage && \
    chmod 755 /app/storage

# Copy backend files with new structure
COPY backend ./backend

# Set environment variables
ENV FLASK_APP=backend/app.py \
    PYTHONPATH=/app \
    FLASK_ENV=production \
    PYTHONUNBUFFERED=1

# Copy the built frontend from stage 1
COPY --from=frontend-build /app/frontend/build ./frontend/build

EXPOSE 8080

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/api/health || exit 1

# Start the Flask application
CMD ["flask", "run", "--host", "0.0.0.0", "--port", "8080"]