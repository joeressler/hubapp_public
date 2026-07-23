"""Chat orchestration: RAG answer + optional TTS."""

import os

import requests

VECTOR_STORAGE_PATH = os.environ.get(
    'VECTOR_STORAGE_PATH',
    '/app/backend/utils/vector_db/storage',
)
TTS_URL = os.environ.get('TTS_URL', 'http://voice:8081/tts')


class ChatServiceError(Exception):
    def __init__(self, message, status_code=500, code='chat_error'):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.code = code


def answer_question(question, context, user_id, with_voice=False):
    # Lazy import keeps LlamaIndex/OpenAI out of app boot for non-chat routes.
    from modules.chatbot import ChatBot

    response = ChatBot.get_response(
        question,
        context,
        base_path=VECTOR_STORAGE_PATH,
    )

    if isinstance(response, dict) and response.get('error'):
        error_code = response.get('code', 'chat_error')
        status_code = 503 if error_code == 'rate_limit' else 500
        raise ChatServiceError(
            response['error'],
            status_code=status_code,
            code=error_code,
        )

    answer_text = str(response)

    if user_id is not None:
        ChatBot.log(context, question, answer_text, user_id)

    payload = {'response': answer_text}
    if with_voice:
        payload['audio'] = _synthesize_speech(answer_text)
    return payload


def _synthesize_speech(text):
    try:
        tts_response = requests.post(TTS_URL, json={'text': text}, timeout=60)
    except requests.RequestException as exc:
        raise ChatServiceError('TTS service unavailable', status_code=502, code='tts_error') from exc

    if tts_response.status_code != 200:
        raise ChatServiceError('TTS service error', status_code=502, code='tts_error')

    audio_data = tts_response.json().get('audio')
    if not audio_data:
        raise ChatServiceError(
            'No audio data received from TTS service',
            status_code=502,
            code='tts_error',
        )
    return audio_data
