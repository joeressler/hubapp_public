import base64
import logging
import os
import subprocess
import tempfile
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
    validate_backend_url,
)
from app.tts import generate_speech

logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s: %(message)s',
    datefmt='%Y-%m-%dT%H:%M:%S%z',
)
logger = logging.getLogger(__name__)

AUDIO_DIR = Path(os.environ.get('AUDIO_DIR', 'audio'))
BACKEND_URL = os.environ.get('BACKEND_URL', 'http://backend:8080')
INTERNAL_SERVICE_KEY = os.environ.get('INTERNAL_SERVICE_KEY', '')
FILE_RETENTION_SECONDS = 5 * 60
FFMPEG_TIMEOUT_SECONDS = 60

if not validate_backend_url(BACKEND_URL):
    raise RuntimeError('BACKEND_URL must point to an allowed internal host')


def cleanup_old_files() -> None:
    if not AUDIO_DIR.exists():
        return
    cutoff = time.time() - FILE_RETENTION_SECONDS
    for path in AUDIO_DIR.iterdir():
        if path.is_file() and path.stat().st_mtime < cutoff:
            try:
                path.unlink()
            except OSError as exc:
                logger.error('Failed to remove %s: %s', path, exc)


@asynccontextmanager
async def lifespan(_: FastAPI):
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    cleanup_old_files()
    yield


docs_url = None if os.environ.get('FLASK_ENV', '').lower() == 'production' or os.environ.get('VOICE_DISABLE_DOCS', 'true').lower() == 'true' else '/docs'
redoc_url = None if docs_url is None else '/redoc'

app = FastAPI(
    title='Voice Service',
    lifespan=lifespan,
    docs_url=docs_url,
    redoc_url=redoc_url,
    openapi_url=None if docs_url is None else '/openapi.json',
)

app.add_middleware(InternalServiceAuthMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=['GET', 'POST', 'OPTIONS'],
    allow_headers=['Content-Type', 'X-Internal-Service-Key'],
)


@app.middleware('http')
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    response.headers['Permissions-Policy'] = 'camera=(), microphone=(), geolocation=()'
    return response


@app.get('/api/voice/health')
def health() -> dict[str, str]:
    return {'status': 'healthy'}


@app.post('/tts')
def text_to_speech(request: Request, payload: dict[str, str]) -> JSONResponse:
    check_rate_limit(request)

    text = (payload.get('text') or '').strip()
    if not text:
        raise HTTPException(status_code=400, detail='Invalid request')
    if len(text) > MAX_TTS_TEXT_LENGTH:
        raise HTTPException(status_code=400, detail='Text exceeds maximum length')

    logger.info('TTS received text length: %d', len(text))
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    file_name = AUDIO_DIR / f'response_{time.time_ns()}.mp3'

    try:
        generate_speech(text, str(file_name))
        audio_data = file_name.read_bytes()
        logger.info('Generated MP3 file size: %d bytes', len(audio_data))

        base64_audio = (
            'data:audio/mp3;base64,'
            + base64.standard_b64encode(audio_data).decode('ascii')
        )
        return JSONResponse(content={'audio': base64_audio})
    except Exception as exc:
        logger.error('Generating speech failed')
        raise HTTPException(status_code=500, detail='Failed to generate speech') from exc
    finally:
        if file_name.exists():
            try:
                file_name.unlink()
            except OSError as exc:
                logger.error('Cleaning up file %s: %s', file_name, exc)


@app.post('/voice/convert-and-transcribe')
async def convert_and_transcribe(
    request: Request,
    audio: UploadFile = File(...),
    context: str = Form(''),
) -> JSONResponse:
    check_rate_limit(request)
    logger.info('Received request to convert and transcribe audio')

    content_type = (audio.content_type or '').lower()
    if content_type and not any(
        allowed in content_type
        for allowed in ('audio/', 'application/octet-stream', 'video/webm')
    ):
        raise HTTPException(status_code=400, detail='Unsupported audio content type')

    temp_dir = None
    try:
        ogg_bytes = await audio.read(MAX_AUDIO_BYTES + 1)
        if len(ogg_bytes) > MAX_AUDIO_BYTES:
            raise HTTPException(status_code=400, detail='Audio file too large')
        if not ogg_bytes:
            raise HTTPException(status_code=400, detail='Empty audio upload')

        temp_dir = tempfile.mkdtemp(prefix='voice-')
        temp_ogg = Path(temp_dir) / 'audio.ogg'
        temp_wav = Path(temp_dir) / 'audio.wav'
        temp_ogg.write_bytes(ogg_bytes)

        cmd = [
            'ffmpeg',
            '-nostdin',
            '-hide_banner',
            '-loglevel',
            'error',
            '-y',
            '-i',
            str(temp_ogg),
            '-t',
            '300',
            '-ar',
            '16000',
            '-ac',
            '1',
            str(temp_wav),
        ]
        try:
            proc = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=FFMPEG_TIMEOUT_SECONDS,
                check=False,
            )
        except subprocess.TimeoutExpired as exc:
            raise HTTPException(status_code=408, detail='Audio conversion timed out') from exc

        if proc.returncode != 0:
            logger.error('ffmpeg failed with code %s', proc.returncode)
            raise HTTPException(status_code=500, detail='Failed to convert audio format')

        wav_data = temp_wav.read_bytes()
        if len(wav_data) > MAX_AUDIO_BYTES:
            raise HTTPException(status_code=400, detail='Converted audio too large')

        backend_headers = {}
        if INTERNAL_SERVICE_KEY:
            backend_headers['X-Internal-Service-Key'] = INTERNAL_SERVICE_KEY

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f'{BACKEND_URL.rstrip("/")}/api/internal/voice/transcribe',
                files={'audio': ('audio.wav', wav_data, 'audio/wav')},
                data={'context': context},
                headers=backend_headers,
            )

        if response.status_code >= 500:
            logger.error('Backend transcription returned %s', response.status_code)
            raise HTTPException(status_code=502, detail='Transcription service error')

        try:
            result_body = response.json()
        except ValueError as exc:
            logger.error('Parsing backend response failed')
            raise HTTPException(
                status_code=500,
                detail='Failed to parse backend response',
            ) from exc

        return JSONResponse(status_code=response.status_code, content=result_body)
    except HTTPException:
        raise
    except Exception as exc:
        logger.error('convert-and-transcribe failed')
        raise HTTPException(status_code=500, detail='Failed to process audio') from exc
    finally:
        if temp_dir:
            for path in Path(temp_dir).glob('*'):
                try:
                    path.unlink(missing_ok=True)
                except OSError:
                    pass
            try:
                Path(temp_dir).rmdir()
            except OSError:
                pass
