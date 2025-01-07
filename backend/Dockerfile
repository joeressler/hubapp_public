FROM python:3.11-slim-bullseye
WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        curl \
        pkg-config \
        default-libmysqlclient-dev \
        build-essential \
        python3-dev \
        wget \
        unzip \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# Download Vosk model
RUN mkdir -p models && \
    cd models && \
    wget https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip && \
    unzip vosk-model-small-en-us-0.15.zip && \
    rm vosk-model-small-en-us-0.15.zip

# Copy application code
COPY . .

ENV FLASK_APP=app.py \
    PYTHONPATH=/app/backend \
    FLASK_ENV=production \
    PYTHONUNBUFFERED=1

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/api/health || exit 1

CMD ["gunicorn", "-w", "3", "-b", "0.0.0.0:8080", "--timeout", "120", "app:app"] 