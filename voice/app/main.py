import base64
import logging
import os
import subprocess
import time
from contextlib import asynccontextmanager
from pathlib import Path

import httpx
from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.security import (
    ALLOWED_ORIGINS,
    MAX_AUDIO_BYTES,
    MAX_TTS_TEXT_LENGTH,
    InternalServiceAuthMiddleware,
    check_rate_limit,
)
from app.tts import generate_speech

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] %(levelname)s: %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S%z",
)
logger = logging.getLogger(__name__)

AUDIO_DIR = Path(os.environ.get("AUDIO_DIR", "audio"))
BACKEND_URL = os.environ.get("BACKEND_URL", "http://backend:8080")
INTERNAL_SERVICE_KEY = os.environ.get("INTERNAL_SERVICE_KEY", "")
FILE_RETENTION_SECONDS = 5 * 60

TEMP_OGG_PATH = Path("/tmp/audio.ogg")
TEMP_WAV_PATH = Path("/tmp/audio.wav")


def cleanup_old_files() -> None:
    if not AUDIO_DIR.exists():
        return
    cutoff = time.time() - FILE_RETENTION_SECONDS
    for path in AUDIO_DIR.iterdir():
        if path.is_file() and path.stat().st_mtime < cutoff:
            try:
                path.unlink()
            except OSError as exc:
                logger.error("Failed to remove %s: %s", path, exc)


@asynccontextmanager
async def lifespan(_: FastAPI):
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    cleanup_old_files()
    yield


app = FastAPI(title="Voice Service", lifespan=lifespan)

app.add_middleware(InternalServiceAuthMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "X-Internal-Service-Key"],
)


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response


@app.get("/api/voice/health")
def health() -> dict[str, str]:
    return {"status": "healthy"}


@app.post("/tts")
def text_to_speech(request: Request, payload: dict[str, str]) -> JSONResponse:
    check_rate_limit(request)

    text = payload.get("text", "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="Invalid request")
    if len(text) > MAX_TTS_TEXT_LENGTH:
        raise HTTPException(status_code=400, detail="Text exceeds maximum length")

    logger.info("TTS received text length: %d", len(text))
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    file_name = AUDIO_DIR / f"response_{time.time_ns()}.mp3"

    try:
        generate_speech(text, str(file_name))
        audio_data = file_name.read_bytes()
        logger.info("Generated MP3 file size: %d bytes", len(audio_data))

        base64_audio = (
            "data:audio/mp3;base64,"
            + base64.standard_b64encode(audio_data).decode("ascii")
        )
        return JSONResponse(content={"audio": base64_audio})
    except Exception as exc:
        logger.error("Generating speech: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to generate speech") from exc
    finally:
        if file_name.exists():
            try:
                file_name.unlink()
            except OSError as exc:
                logger.error("Cleaning up file %s: %s", file_name, exc)


@app.post("/voice/convert-and-transcribe")
async def convert_and_transcribe(
    request: Request,
    audio: UploadFile = File(...),
    context: str = Form(""),
) -> JSONResponse:
    check_rate_limit(request)
    logger.info("Received request to convert and transcribe audio")

    try:
        ogg_bytes = await audio.read()
        if len(ogg_bytes) > MAX_AUDIO_BYTES:
            raise HTTPException(status_code=400, detail="Audio file too large")

        TEMP_OGG_PATH.write_bytes(ogg_bytes)

        cmd = [
            "ffmpeg",
            "-y",
            "-i",
            str(TEMP_OGG_PATH),
            "-ar",
            "16000",
            str(TEMP_WAV_PATH),
        ]
        proc = subprocess.run(cmd, capture_output=True, text=True)
        if proc.returncode != 0:
            logger.error("ffmpeg stderr: %s", proc.stderr)
            raise HTTPException(status_code=500, detail="Failed to convert audio format")

        wav_data = TEMP_WAV_PATH.read_bytes()
        backend_headers = {}
        if INTERNAL_SERVICE_KEY:
            backend_headers["X-Internal-Service-Key"] = INTERNAL_SERVICE_KEY

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{BACKEND_URL}/api/internal/voice/transcribe",
                files={"audio": ("audio.wav", wav_data, "audio/wav")},
                data={"context": context},
                headers=backend_headers,
            )

        try:
            result_body = response.json()
        except ValueError as exc:
            logger.error("Parsing backend response: %s", exc)
            raise HTTPException(
                status_code=500, detail="Failed to parse backend response"
            ) from exc

        return JSONResponse(status_code=response.status_code, content=result_body)
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("convert-and-transcribe failed: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to process audio") from exc
    finally:
        for path in (TEMP_OGG_PATH, TEMP_WAV_PATH):
            if path.exists():
                path.unlink(missing_ok=True)
