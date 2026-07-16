FROM python:3.12-slim-bookworm

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    build-essential \
    cmake \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY manage.py .
COPY config ./config
COPY decomposer ./decomposer

ENV PYTHONUNBUFFERED=1
ENV HF_HOME=/app/models
ENV GRANITE_MODEL_REPO=ibm-granite/granite-4.1-3b-GGUF
ENV GRANITE_MODEL_FILE=*Q4_K_M.gguf
ENV GRANITE_N_CTX=4096
ENV GRANITE_N_GPU_LAYERS=0
ENV GRANITE_MAX_TOKENS=1024
ENV DJANGO_ALLOWED_HOSTS=*

RUN mkdir -p /app/models

EXPOSE 8082

CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8082", "--workers", "1", "--threads", "2", "--timeout", "300"]
