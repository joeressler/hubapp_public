from flask import Flask, jsonify, request, send_from_directory, g, session
from flask_cors import CORS
from flask_wtf.csrf import CSRFProtect, generate_csrf
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import os
from dotenv import load_dotenv
from functools import wraps
from modules.users import User
from modules.game_db import GameDB
from modules.chatbot import ChatBot
from datetime import datetime, timedelta
import requests
import base64
from vosk import Model, KaldiRecognizer
import wave
import json
import io
import subprocess
import logging

from utils.security import (
    is_production,
    safe_error_message,
    validate_chat_message,
    validate_email,
    validate_rating,
    validate_username,
    verify_recaptcha,
    MAX_AUDIO_BYTES,
)

load_dotenv()

logger = logging.getLogger(__name__)

if os.environ.get("SENTRY_DSN"):
    import sentry_sdk
    from sentry_sdk.integrations.flask import FlaskIntegration

    sentry_sdk.init(
        dsn=os.environ["SENTRY_DSN"],
        integrations=[FlaskIntegration()],
        traces_sample_rate=0.1,
        environment=os.environ.get("FLASK_ENV", "development"),
    )

app = Flask(__name__,
            static_folder='../frontend/build/static',
            static_url_path='/static')

secret_key = os.environ.get('FLASK_SECRET_KEY')
if not secret_key:
    if is_production():
        raise RuntimeError('FLASK_SECRET_KEY must be set to a strong value in production')
    secret_key = 'dev-only-insecure-key-do-not-use-in-production'
elif secret_key == 'change-me' and is_production():
    raise RuntimeError('FLASK_SECRET_KEY must be set to a strong value in production')

app.config['SECRET_KEY'] = secret_key
app.config['RECAPTCHA_PUBLIC_KEY'] = os.environ.get('RECAPTCHA_PUBLIC_KEY')
app.config['RECAPTCHA_PRIVATE_KEY'] = os.environ.get('RECAPTCHA_PRIVATE_KEY')
app.config['VERIFY_URL'] = os.environ.get('VERIFY_URL')
app.config['PASSWORD_PIN'] = os.environ.get('PASSWORD_PIN')
app.config['WTF_CSRF_TIME_LIMIT'] = None
app.config['WTF_CSRF_HEADERS'] = ['X-CSRFToken']
app.config['WTF_CSRF_SSL_STRICT'] = is_production()
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_SECURE'] = is_production()
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=24)

VOICE_SERVICE_URL = os.environ.get('VOICE_SERVICE_URL', 'http://voice:8081')
INTERNAL_SERVICE_KEY = os.environ.get('INTERNAL_SERVICE_KEY', '')

csrf = CSRFProtect(app)
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["300 per hour"],
    storage_uri="memory://",
)

CORS(app,
     supports_credentials=True,
     resources={
         r"/*": {
             "origins": [
                 "http://localhost:3000",
                 "http://frontend:3000",
                 "https://www.josepharessler.com",
                 "wss://www.josepharessler.com"
             ],
             "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
             "allow_headers": ["Content-Type", "Authorization", "X-CSRFToken"],
             "expose_headers": ["Content-Range", "X-Content-Range"],
             "supports_credentials": True
         }
     })


@app.after_request
def set_security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    response.headers['Permissions-Policy'] = 'camera=(), microphone=(self), geolocation=()'
    if is_production():
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    return response


def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if g.user is None:
            return jsonify({'error': 'Authentication required'}), 401
        return f(*args, **kwargs)
    return decorated_function


def voice_service_headers():
    headers = {}
    if INTERNAL_SERVICE_KEY:
        headers['X-Internal-Service-Key'] = INTERNAL_SERVICE_KEY
    return headers


@app.before_request
def load_logged_in_user():
    user_id = session.get('user_id')
    if user_id is None:
        g.user = None
    else:
        try:
            g.user = User.get_user(user_id)
        except Exception as e:
            logger.error("Error loading user: %s", e)
            g.user = None
            session.clear()


@app.route('/api/csrf-token', methods=['GET'])
def get_csrf_token():
    return jsonify({'csrf_token': generate_csrf()})


@app.route('/api/auth/login', methods=['POST'])
@limiter.limit("10 per minute")
def login():
    try:
        data = request.json or {}
        username = data.get('username', '').strip()
        password = data.get('password', '')
        recaptcha_token = data.get('recaptcha_token')

        if not username or not password:
            return jsonify({'error': 'Missing username or password'}), 400

        if not validate_username(username):
            return jsonify({'error': 'Invalid username format'}), 400

        if not verify_recaptcha(recaptcha_token):
            return jsonify({'error': 'reCAPTCHA verification failed'}), 400

        if User.authenticate(username, password):
            user_id = User.id(username)
            session.permanent = True
            session['user_id'] = user_id
            return jsonify({
                'message': 'Login successful',
                'user': {'id': user_id, 'username': username}
            }), 200
        return jsonify({'error': 'Invalid username or password'}), 401
    except Exception as e:
        logger.error("Login error: %s", e)
        return jsonify({'error': safe_error_message()}), 500


@app.route('/api/auth/register', methods=['POST'])
@limiter.limit("5 per minute")
def register():
    try:
        data = request.json or {}
        username = data.get('username', '').strip()
        password = data.get('password', '')
        email = data.get('email', '').strip()
        recaptcha_token = data.get('recaptcha_token')

        if not username or not password or not email:
            return jsonify({'error': 'Missing required fields'}), 400

        if not validate_username(username):
            return jsonify({'error': 'Username must be 3-30 alphanumeric characters or underscores'}), 400

        if not validate_email(email):
            return jsonify({'error': 'Invalid email format'}), 400

        if not verify_recaptcha(recaptcha_token):
            return jsonify({'error': 'reCAPTCHA verification failed'}), 400

        if User.lookup(username):
            return jsonify({'error': 'Username already exists'}), 400

        if User.lookup_email(email):
            return jsonify({'error': 'Email already registered'}), 400

        if not User.validate_password(password):
            return jsonify({'error': 'Invalid password format'}), 400

        user = User(email, username, password)
        user.save()
        return jsonify({'message': 'Registration successful'}), 201
    except Exception as e:
        logger.error("Registration error: %s", e)
        return jsonify({'error': safe_error_message()}), 500


@app.route('/api/auth/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'success': True})


@app.route('/api/auth/check', methods=['GET'])
def check_auth():
    if g.user:
        return jsonify({
            'username': g.user['username'],
            'id': g.user['id']
        })
    return jsonify(None), 401


@app.route('/api/games')
def get_games():
    try:
        games = GameDB.listgames()
        if games is None:
            return jsonify({'error': 'No games found'}), 404
        return jsonify(games)
    except Exception as e:
        logger.error("Error fetching games: %s", e)
        return jsonify({'error': safe_error_message()}), 500


@app.route('/api/chat', methods=['POST'])
@limiter.limit("30 per minute")
def chat():
    data = request.json or {}
    question = data.get('message')
    context = data.get('context', 'wows')
    user_id = session.get('user_id')
    voice_response = data.get('voice', False)

    if user_id is None:
        return jsonify({'error': 'Authentication required'}), 401

    validated_message = validate_chat_message(question)
    if not validated_message:
        return jsonify({'error': 'Invalid message'}), 400

    allowed_contexts = {'wows', 'warcraft', 'lol', 'general'}
    if context not in allowed_contexts:
        return jsonify({'error': 'Invalid context'}), 400

    try:
        base_path = "/app/backend/utils/vector_db/storage"
        response = ChatBot.get_response(validated_message, context, base_path=base_path)

        if isinstance(response, dict) and response.get("error"):
            error_code = response.get("code", "chat_error")
            status_code = 503 if error_code == "rate_limit" else 500
            return jsonify({"error": response["error"], "code": error_code}), status_code

        ChatBot.log(context, validated_message, str(response), user_id)

        if voice_response:
            tts_url = f"{VOICE_SERVICE_URL}/tts"
            text_to_speak = str(response)
            tts_response = requests.post(
                tts_url,
                json={'text': text_to_speak},
                headers=voice_service_headers(),
                timeout=60,
            )

            if tts_response.status_code != 200:
                logger.error("TTS error: %s", tts_response.text)
                return jsonify({'error': 'TTS service error'}), 500

            audio_data = tts_response.json().get('audio')
            if not audio_data:
                return jsonify({'error': 'No audio data received from TTS service'}), 500

            return jsonify({
                'response': text_to_speak,
                'audio': audio_data
            })

        return jsonify({'response': str(response)})
    except Exception as e:
        logger.error("Chat error: %s", e)
        return jsonify({'error': safe_error_message()}), 500


@app.route('/api/games/<int:game_id>/rate', methods=['POST'])
@login_required
@limiter.limit("20 per minute")
def submit_rating(game_id):
    data = request.json or {}
    rating = validate_rating(data.get('rating'))
    fullclear = bool(data.get('fullclear', False))
    user_id = session['user_id']

    if rating is None:
        return jsonify({'error': 'Rating must be an integer between 1 and 10'}), 400

    existing_rating = GameDB.lookup_user_rating(game_id, user_id)
    GameDB.add_game_rating(game_id, rating, fullclear, user_id, update=existing_rating is not None)
    return jsonify({'message': 'Rating submitted successfully'})


@app.route('/api/games/<int:game_id>', methods=['GET'])
def get_game_info(game_id):
    game_info = GameDB.listgames(game_id)
    if not game_info:
        return jsonify({'error': 'Game not found'}), 404
    return jsonify(game_info[0])


@app.route('/api/health')
def health():
    return jsonify({'status': 'healthy'})


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path.startswith('api/'):
        return send_from_directory('../frontend/build', 'index.html')

    try:
        return send_from_directory('../frontend/build', path)
    except Exception:
        return send_from_directory('../frontend/build', 'index.html')


model = Model("models/vosk-model-small-en-us-0.15")


def _transcribe_wav_bytes(audio_data: bytes) -> str:
    if len(audio_data) > MAX_AUDIO_BYTES:
        raise ValueError('Audio file too large')

    audio_stream = io.BytesIO(audio_data)
    rec = KaldiRecognizer(model, 16000)
    wf = wave.open(audio_stream, "rb")

    text = ""
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


@app.errorhandler(500)
def internal_error(error):
    logger.error('Server Error: %s', error)
    return jsonify(error=safe_error_message()), 500


@app.errorhandler(Exception)
def handle_exception(e):
    logger.error('Unhandled Exception: %s', e)
    return jsonify(error=safe_error_message()), 500


@app.route('/api/voice/transcribe', methods=['POST'])
@login_required
@limiter.limit("15 per minute")
def transcribe_audio():
    try:
        audio_file = request.files.get('audio')
        if not audio_file:
            return jsonify({'error': 'No audio file received'}), 400

        text = _transcribe_wav_bytes(audio_file.read())
        return jsonify({'text': text})
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error("Transcription error: %s", e)
        return jsonify({'error': safe_error_message()}), 500


@app.route('/api/internal/voice/transcribe', methods=['POST'])
@csrf.exempt
@limiter.limit("30 per minute")
def internal_transcribe_audio():
    key = request.headers.get('X-Internal-Service-Key', '')
    if not INTERNAL_SERVICE_KEY or key != INTERNAL_SERVICE_KEY:
        return jsonify({'error': 'Forbidden'}), 403

    try:
        audio_file = request.files.get('audio')
        if not audio_file:
            return jsonify({'error': 'No audio file received'}), 400

        text = _transcribe_wav_bytes(audio_file.read())
        return jsonify({'text': text})
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error("Internal transcription error: %s", e)
        return jsonify({'error': safe_error_message()}), 500


@app.route('/api/voice/convert-and-transcribe', methods=['POST'])
@login_required
@limiter.limit("15 per minute")
def proxy_voice_transcribe():
    try:
        audio_file = request.files.get('audio')
        if not audio_file:
            return jsonify({'error': 'No audio file received'}), 400

        audio_data = audio_file.read()
        if len(audio_data) > MAX_AUDIO_BYTES:
            return jsonify({'error': 'Audio file too large'}), 400

        context = request.form.get('context', '')
        response = requests.post(
            f"{VOICE_SERVICE_URL}/voice/convert-and-transcribe",
            files={'audio': ('audio.ogg', audio_data, audio_file.content_type or 'audio/ogg')},
            data={'context': context},
            headers=voice_service_headers(),
            timeout=120,
        )
        try:
            body = response.json()
        except ValueError:
            return jsonify({'error': safe_error_message()}), 502
        return jsonify(body), response.status_code
    except requests.RequestException as e:
        logger.error("Voice proxy error: %s", e)
        return jsonify({'error': safe_error_message()}), 500
    except Exception as e:
        logger.error("Voice proxy error: %s", e)
        return jsonify({'error': safe_error_message()}), 500
