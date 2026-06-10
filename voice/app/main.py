import base64
import logging
import os
import subprocess
import time
from contextlib import asynccontextmanager
from pathlib import Path

import httpx
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.tts import generate_speech

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] %(levelname)s: %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S%z",
)
logger = logging.getLogger(__name__)

AUDIO_DIR = Path(os.environ.get("AUDIO_DIR", "audio"))
BACKEND_URL = os.environ.get("BACKEND_URL", "http://backend:8080")
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/voice/health")
def health() -> dict[str, str]:
    return {"status": "healthy"}


@app.post("/tts")
def text_to_speech(payload: dict[str, str]) -> JSONResponse:
    text = payload.get("text", "")
    if not text:
        raise HTTPException(status_code=400, detail="Invalid request")

    logger.info("TTS received text: %s", text)
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    file_name = AUDIO_DIR / f"response_{time.time_ns()}.mp3"

    try:
        generate_speech(text, str(file_name))
        audio_data = file_name.read_bytes()
        logger.info("Generated MP3 file size: %d bytes", len(audio_data))
        if len(audio_data) > 16:
            logger.info("First 16 bytes: %s", audio_data[:16].hex())

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
                logger.info("Cleaned up file: %s", file_name)
            except OSError as exc:
                logger.error("Cleaning up file %s: %s", file_name, exc)


@app.post("/voice/convert-and-transcribe")
async def convert_and_transcribe(
    audio: UploadFile = File(...),
    context: str = Form(""),
) -> JSONResponse:
    logger.info("Received request to convert and transcribe audio")

    try:
        ogg_bytes = await audio.read()
        TEMP_OGG_PATH.write_bytes(ogg_bytes)
        logger.info("Saved uploaded audio file to: %s", TEMP_OGG_PATH)

        cmd = [
            "ffmpeg",
            "-y",
            "-i",
            str(TEMP_OGG_PATH),
            "-ar",
            "16000",
            str(TEMP_WAV_PATH),
        ]
        logger.info("Executing command: %s", " ".join(cmd))
        proc = subprocess.run(cmd, capture_output=True, text=True)
        if proc.returncode != 0:
            logger.error("ffmpeg stderr: %s", proc.stderr)
            raise HTTPException(status_code=500, detail="Failed to convert audio format")

        wav_data = TEMP_WAV_PATH.read_bytes()
        logger.info("Read WAV file of size: %d bytes", len(wav_data))

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{BACKEND_URL}/api/voice/transcribe",
                files={"audio": ("audio.wav", wav_data, "audio/wav")},
                data={"context": context},
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
