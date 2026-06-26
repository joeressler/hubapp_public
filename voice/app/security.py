import os
import time
from collections import defaultdict
from typing import Callable

from fastapi import HTTPException, Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

MAX_TTS_TEXT_LENGTH = 5000
MAX_AUDIO_BYTES = 10 * 1024 * 1024
RATE_LIMIT_REQUESTS = 30
RATE_LIMIT_WINDOW_SECONDS = 60

ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.environ.get(
        "ALLOWED_ORIGINS",
        "http://localhost:3000,http://frontend:3000,https://www.josepharessler.com",
    ).split(",")
    if origin.strip()
]

_request_log: dict[str, list[float]] = defaultdict(list)


def _client_key(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    if request.client:
        return request.client.host
    return "unknown"


def check_rate_limit(request: Request) -> None:
    now = time.time()
    key = _client_key(request)
    window_start = now - RATE_LIMIT_WINDOW_SECONDS
    _request_log[key] = [ts for ts in _request_log[key] if ts > window_start]
    if len(_request_log[key]) >= RATE_LIMIT_REQUESTS:
        raise HTTPException(status_code=429, detail="Too many requests")
    _request_log[key].append(now)


class InternalServiceAuthMiddleware(BaseHTTPMiddleware):
    """Restrict voice endpoints to trusted internal callers."""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        if request.url.path == "/api/voice/health":
            return await call_next(request)

        expected_key = os.environ.get("INTERNAL_SERVICE_KEY", "")
        if not expected_key:
            if os.environ.get("VOICE_ALLOW_UNAUTHENTICATED", "").lower() == "true":
                return await call_next(request)
            raise HTTPException(status_code=503, detail="Service not configured")

        provided_key = request.headers.get("X-Internal-Service-Key", "")
        if provided_key != expected_key:
            raise HTTPException(status_code=403, detail="Forbidden")

        return await call_next(request)
