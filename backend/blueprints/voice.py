import io
import json
import wave

import requests
from flask import Blueprint, current_app, jsonify, request
from vosk import KaldiRecognizer

from authz import login_required
from extensions import csrf, limiter
from utils.security import MAX_AUDIO_BYTES, safe_error_message

voice_bp = Blueprint('voice', __name__, url_prefix='/api')

_vosk_model = None


def _get_vosk_model():
    global _vosk_model
    if _vosk_model is None:
        import os

        from vosk import Model

        model_path = os.environ.get(
            'VOSK_MODEL_PATH',
            'models/vosk-model-small-en-us-0.15',
        )
        _vosk_model = Model(model_path)
    return _vosk_model


def _voice_service_headers():
    headers = {}
    key = current_app.config.get('INTERNAL_SERVICE_KEY') or ''
    if key:
        headers['X-Internal-Service-Key'] = key
    return headers


def _transcribe_wav_bytes(audio_data: bytes) -> str:
    if len(audio_data) > MAX_AUDIO_BYTES:
        raise ValueError('Audio file too large')

    audio_stream = io.BytesIO(audio_data)
    rec = KaldiRecognizer(_get_vosk_model(), 16000)
    wf = wave.open(audio_stream, 'rb')

    if wf.getnchannels() != 1 or wf.getsampwidth() != 2:
        raise ValueError('Audio must be mono 16-bit PCM WAV')

    # Cap duration (~5 minutes at 16 kHz mono 16-bit).
    max_frames = 16000 * 60 * 5
    if wf.getnframes() > max_frames:
        raise ValueError('Audio duration exceeds limit')

    text = ''
    while True:
        data = wf.readframes(4000)
        if len(data) == 0:
            break
        if rec.AcceptWaveform(data):
            result = json.loads(rec.Result())
            text += result.get('text', '') + ' '

    final_result = json.loads(rec.FinalResult())
    text += final_result.get('text', '')
    return text.strip()


def _require_internal_service_key():
    import secrets

    expected = current_app.config.get('INTERNAL_SERVICE_KEY') or ''
    provided = request.headers.get('X-Internal-Service-Key', '')
    if not expected or not provided:
        return False
    try:
        return secrets.compare_digest(provided, expected)
    except (TypeError, ValueError):
        return False


@voice_bp.route('/voice/transcribe', methods=['POST'])
@login_required
@limiter.limit('15 per minute')
def transcribe_audio():
    try:
        audio_file = request.files.get('audio')
        if not audio_file:
            return jsonify({'error': 'No audio file received'}), 400

        text = _transcribe_wav_bytes(audio_file.read())
        return jsonify({'text': text})
    except ValueError as exc:
        return jsonify({'error': str(exc)}), 400
    except Exception:
        current_app.logger.exception('Transcription failed')
        return jsonify({'error': safe_error_message()}), 500


@voice_bp.route('/internal/voice/transcribe', methods=['POST'])
@csrf.exempt
@limiter.limit('30 per minute')
def internal_transcribe_audio():
    if not _require_internal_service_key():
        return jsonify({'error': 'Forbidden'}), 403

    try:
        audio_file = request.files.get('audio')
        if not audio_file:
            return jsonify({'error': 'No audio file received'}), 400

        text = _transcribe_wav_bytes(audio_file.read())
        return jsonify({'text': text})
    except ValueError as exc:
        return jsonify({'error': str(exc)}), 400
    except Exception:
        current_app.logger.exception('Internal transcription failed')
        return jsonify({'error': safe_error_message()}), 500


@voice_bp.route('/voice/convert-and-transcribe', methods=['POST'])
@login_required
@limiter.limit('15 per minute')
def proxy_voice_transcribe():
    try:
        audio_file = request.files.get('audio')
        if not audio_file:
            return jsonify({'error': 'No audio file received'}), 400

        audio_data = audio_file.read()
        if len(audio_data) > MAX_AUDIO_BYTES:
            return jsonify({'error': 'Audio file too large'}), 400

        context = request.form.get('context', '')
        voice_url = current_app.config['VOICE_SERVICE_URL'].rstrip('/')
        response = requests.post(
            f'{voice_url}/voice/convert-and-transcribe',
            files={
                'audio': (
                    'audio.ogg',
                    audio_data,
                    audio_file.content_type or 'audio/ogg',
                ),
            },
            data={'context': context},
            headers=_voice_service_headers(),
            timeout=120,
        )
        try:
            body = response.json()
        except ValueError:
            return jsonify({'error': safe_error_message()}), 502
        return jsonify(body), response.status_code
    except requests.RequestException:
        current_app.logger.exception('Voice proxy request failed')
        return jsonify({'error': safe_error_message()}), 502
    except Exception:
        current_app.logger.exception('Voice proxy failed')
        return jsonify({'error': safe_error_message()}), 500
