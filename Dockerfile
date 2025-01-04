# Stage 1: Build React frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend

# Copy only package files first for better layer caching
COPY frontend/package*.json ./

# Install ALL dependencies (including dev dependencies) for build
RUN npm ci && \
    npm install @babel/plugin-proposal-private-property-in-object --save-dev && \
    npm cache clean --force

# Copy frontend files
COPY frontend/src ./src
COPY frontend/public ./public
COPY frontend/tsconfig.json ./
COPY frontend/*.d.ts ./

# Build frontend with optimizations
ENV NODE_ENV=production \
    CI=false \
    GENERATE_SOURCEMAP=false

RUN npm run build && \
    echo "Frontend build contents:" && \
    ls -la build/ && \
    echo "Static folder contents:" && \
    ls -la build/static/

# Stage 2: Python backend
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
    tree \
    libcrypt1 \
    openssl \
    && rm -rf /var/lib/apt/lists/* && \
    pip install --no-cache-dir --upgrade pip setuptools wheel

# Copy and install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Create necessary directories and set permissions
RUN mkdir -p /app/frontend/build /app/config /app/storage && \
    chmod 755 /app/storage

# Copy backend files
COPY backend ./backend

# Set environment variables
ENV FLASK_APP=backend/app.py \
    PYTHONPATH=/app \
    FLASK_ENV=production \
    PYTHONUNBUFFERED=1

# Copy the built frontend from stage 1
COPY --from=frontend-build /app/frontend/build /app/frontend/build

# Verify the copied files
RUN echo "Copied frontend build contents:" && \
    ls -la /app/frontend/build/ && \
    echo "Static folder contents:" && \
    ls -la /app/frontend/build/static/ && \
    echo "Full directory structure:" && \
    tree /app/frontend/build/

EXPOSE 8080

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/api/health || exit 1

# Start the Flask application with debug logging
CMD ["flask", "--debug", "run", "--host", "0.0.0.0", "--port", "8080"]

# Download Vosk model
RUN mkdir -p models && \
    cd models && \
    wget https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip && \
    unzip vosk-model-small-en-us-0.15.zip && \
    mv vosk-model-small-en-us-0.15 vosk-model-small-en-us-0.15 && \
    rm vosk-model-small-en-us-0.15.zip