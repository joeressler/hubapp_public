import io
import json
import wave

from flask import Blueprint, current_app, jsonify, request
from vosk import KaldiRecognizer

voice_bp = Blueprint('voice', __name__, url_prefix='/api/voice')

_vosk_model = None


def _get_vosk_model():
    global _vosk_model
    if _vosk_model is None:
        from vosk import Model

        _vosk_model = Model('models/vosk-model-small-en-us-0.15')
    return _vosk_model


@voice_bp.route('/transcribe', methods=['POST'])
def transcribe_audio():
    try:
        audio_file = request.files.get('audio')
        if not audio_file:
            return jsonify({'error': 'No audio file received'}), 400

        audio_data = audio_file.read()
        audio_stream = io.BytesIO(audio_data)
        rec = KaldiRecognizer(_get_vosk_model(), 16000)
        wf = wave.open(audio_stream, 'rb')

        current_app.logger.info(
            'WAV file params: channels=%s width=%s rate=%s frames=%s',
            wf.getnchannels(),
            wf.getsampwidth(),
            wf.getframerate(),
            wf.getnframes(),
        )

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

        return jsonify({'text': text.strip()})
    except Exception:
        current_app.logger.exception('Transcription failed')
        return jsonify({'error': 'Transcription failed'}), 500
