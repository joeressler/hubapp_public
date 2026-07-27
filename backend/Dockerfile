FROM python:3.11-slim-bullseye AS builder
WORKDIR /build

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        pkg-config \
        default-libmysqlclient-dev \
        build-essential \
        python3-dev \
        wget \
        unzip \
        ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt gunicorn

RUN mkdir -p /models && \
    cd /models && \
    wget -q https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip && \
    unzip -q vosk-model-small-en-us-0.15.zip && \
    rm vosk-model-small-en-us-0.15.zip

FROM python:3.11-slim-bullseye
WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        curl \
        default-libmysqlclient-dev \
        ca-certificates \
    && rm -rf /var/lib/apt/lists/* && \
    groupadd --gid 1001 appgroup && \
    useradd --uid 1001 --gid appgroup --create-home --shell /usr/sbin/nologin appuser

COPY --from=builder /install /usr/local
COPY --from=builder /models /app/models
COPY --chown=appuser:appgroup . /app/backend

ENV FLASK_APP=app.py \
    PYTHONPATH=/app/backend \
    FLASK_ENV=production \
    PYTHONUNBUFFERED=1 \
    VOSK_MODEL_PATH=/app/models/vosk-model-small-en-us-0.15

USER appuser
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/api/health || exit 1

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8080", "--timeout", "120", "app:app"]
