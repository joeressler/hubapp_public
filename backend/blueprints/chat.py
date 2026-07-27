from flask import Blueprint, current_app, jsonify, request, session

from extensions import limiter
from services.chat_service import ChatServiceError, answer_question
from utils.security import (
    ALLOWED_CHAT_CONTEXTS,
    safe_error_message,
    validate_chat_message,
)

chat_bp = Blueprint('chat', __name__, url_prefix='/api')


@chat_bp.route('/chat', methods=['POST'])
@limiter.limit('30 per minute')
def chat():
    data = request.get_json(silent=True) or {}
    question = data.get('message')
    context = data.get('context', 'wows')
    user_id = session.get('user_id')
    voice_response = bool(data.get('voice', False))

    if user_id is None:
        return jsonify({'error': 'Authentication required'}), 401

    validated_message = validate_chat_message(question)
    if not validated_message:
        return jsonify({'error': 'Invalid message'}), 400

    if context not in ALLOWED_CHAT_CONTEXTS:
        return jsonify({'error': 'Invalid context'}), 400

    try:
        payload = answer_question(
            question=validated_message,
            context=context,
            user_id=user_id,
            with_voice=voice_response,
        )
        return jsonify(payload)
    except ChatServiceError as exc:
        # Avoid leaking filesystem paths or raw provider errors to clients.
        public_message = (
            exc.message
            if exc.status_code < 500 and exc.code in {'rate_limit', 'tts_error'}
            else safe_error_message()
        )
        if exc.status_code >= 500:
            current_app.logger.error('Chat service error: %s', exc.message)
        return jsonify({'error': public_message, 'code': exc.code}), exc.status_code
    except Exception:
        current_app.logger.exception('Chat request failed')
        return jsonify({'error': safe_error_message(), 'code': 'chat_error'}), 500
