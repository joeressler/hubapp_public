from flask import Blueprint, current_app, jsonify, request, session

from services.chat_service import ChatServiceError, answer_question

chat_bp = Blueprint('chat', __name__, url_prefix='/api')


@chat_bp.route('/chat', methods=['POST'])
def chat():
    data = request.get_json(silent=True) or {}
    question = data.get('message')
    context = data.get('context', 'wows')
    user_id = session.get('user_id')
    voice_response = bool(data.get('voice', False))

    if user_id is None:
        return jsonify({'error': 'Authentication required'}), 401

    if not question or not str(question).strip():
        return jsonify({'error': 'Missing message'}), 400

    try:
        payload = answer_question(
            question=str(question).strip(),
            context=context,
            user_id=user_id,
            with_voice=voice_response,
        )
        return jsonify(payload)
    except ChatServiceError as exc:
        return jsonify({'error': exc.message, 'code': exc.code}), exc.status_code
    except Exception:
        current_app.logger.exception('Chat request failed')
        return jsonify({'error': 'Internal server error', 'code': 'chat_error'}), 500
