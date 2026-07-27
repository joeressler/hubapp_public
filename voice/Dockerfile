FROM python:3.12-slim-bookworm

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ffmpeg \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --gid 1001 appgroup \
    && useradd --uid 1001 --gid appgroup --create-home --shell /usr/sbin/nologin appuser \
    && mkdir -p /app/audio \
    && chown -R appuser:appgroup /app \
    && chmod 750 /app/audio

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY --chown=appuser:appgroup app ./app
COPY --chown=appuser:appgroup dictionary ./dictionary

ENV AUDIO_DIR=/app/audio \
    PYTHONUNBUFFERED=1 \
    VOICE_DISABLE_DOCS=true

USER appuser
EXPOSE 8081
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8081/api/voice/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8081"]
