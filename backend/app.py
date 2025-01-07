from flask import Flask, jsonify, request, send_from_directory, g, session
from flask_cors import CORS
import os
from dotenv import load_dotenv
from werkzeug.security import check_password_hash
from functools import wraps
from modules.users import User
from modules.game_db import GameDB
from modules.chatbot import ChatBot
from datetime import datetime
import requests
import base64
from vosk import Model, KaldiRecognizer
import wave
import json
import io
import subprocess

# Load environment variables
load_dotenv()

# Initialize Flask app with correct static folder path
app = Flask(__name__, 
            static_folder='../frontend/build/static',
            static_url_path='/static')

app.config['SECRET_KEY'] = os.environ.get('FLASK_SECRET_KEY')
app.config['RECAPTCHA_PUBLIC_KEY'] = os.environ.get('RECAPTCHA_PUBLIC_KEY')
app.config['RECAPTCHA_PRIVATE_KEY'] = os.environ.get('RECAPTCHA_PRIVATE_KEY')
app.config['VERIFY_URL'] = os.environ.get('VERIFY_URL')
app.config['PASSWORD_PIN'] = os.environ.get('PASSWORD_PIN')

# Initialize CORS with credentials support
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
             "allow_headers": ["Content-Type", "Authorization"],
             "expose_headers": ["Content-Range", "X-Content-Range"],
             "supports_credentials": True
         }
     })

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if g.user is None:
            return jsonify({'error': 'Authentication required'}), 401
        return f(*args, **kwargs)
    return decorated_function

@app.before_request
def load_logged_in_user():
    user_id = session.get('user_id')
    if user_id is None:
        g.user = None
    else:
        try:
            g.user = User.get_user(user_id)
        except Exception as e:
            print(f"Error loading user: {e}")
            g.user = None
            session.clear()

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.json
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return jsonify({'error': 'Missing username or password'}), 400

        if User.authenticate(username, password):
            user_id = User.id(username)
            session['user_id'] = user_id
            return jsonify({
                'message': 'Login successful',
                'user': {'id': user_id, 'username': username}
            }), 200
        return jsonify({'error': 'Invalid username or password'}), 401
    except Exception as e:
        print("Login error:", str(e))  # Add logging
        return jsonify({'error': 'Internal server error: ' + str(e)}), 500

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')

    if not username or not password or not email:
        return jsonify({'error': 'Missing required fields'}), 400

    if User.lookup(username):
        return jsonify({'error': 'Username already exists'}), 400

    if not User.validate_password(password):
        return jsonify({'error': 'Invalid password format'}), 400

    user = User(email, username, password)
    try:
        user.save()
        return jsonify({'message': 'Registration successful'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

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
@login_required
def get_games():
    try:
        games = GameDB.listgames()
        print("Games retrieved:", games)  # Debug print
        if games is None:
            return jsonify({'error': 'No games found'}), 404
        return jsonify(games)
    except Exception as e:
        print("Error fetching games:", str(e))  # Debug print
        return jsonify({'error': 'Internal server error: ' + str(e)}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    question = data.get('message')
    context = data.get('context', 'wows')
    user_id = session.get('user_id')
    voice_response = data.get('voice', False)

    print(f"Received chat request: question='{question}', context='{context}', user_id='{user_id}', voice_response='{voice_response}'")

    # Check if user is logged in
    if user_id is None:
        print("User not authenticated")
        return jsonify({'error': 'Authentication required'}), 401

    try:
        base_path = "/app/backend/utils/vector_db/storage"
        response = ChatBot.get_response(question, context, base_path=base_path)
        print(f"ChatBot response: {response}")
        
        # Only log if we have a valid user_id
        if user_id:
            ChatBot.log(context, question, str(response), user_id)
            print(f"Logged chat interaction for user_id='{user_id}'")
        
        if voice_response:
            TTS_URL = "http://voice:8081/tts"
            text_to_speak = str(response)
            print(f"Sending to TTS: {text_to_speak}")
            tts_response = requests.post(TTS_URL, json={'text': text_to_speak})
            
            if tts_response.status_code != 200:
                print(f"TTS error: {tts_response.text}")
                return jsonify({'error': 'TTS service error'}), 500
                
            # Get the base64 audio from the response
            audio_data = tts_response.json().get('audio')
            if not audio_data:
                print("No audio data received from TTS service")
                return jsonify({'error': 'No audio data received from TTS service'}), 500
                
            print("Returning response with audio data")
            return jsonify({
                'response': text_to_speak,
                'audio': audio_data
            })
            
        print("Returning text response")
        return jsonify({'response': str(response)})
    except Exception as e:
        print(f"Chat error: {str(e)}")  # Add error logging
        return jsonify({'error': str(e)}), 500

@app.route('/api/games/<int:game_id>/rate', methods=['POST'])
@login_required
def submit_rating():
    data = request.json
    game_id = data['gameId']
    rating = data['rating']
    fullclear = data.get('fullclear', False)
    user_id = session['user_id']

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

# Serve React App - all non-API routes will serve index.html
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    print(f"DEBUG: Serving path: {path}")  # Added debug logging
    
    if path.startswith('api/'):
        print(f"DEBUG: API request for {path}")  # Added debug logging
        return send_from_directory('../frontend/build', 'index.html')
    
    # First try to serve from the build root directory
    try:
        print(f"DEBUG: Attempting to serve file: {path}")  # Added debug logging
        return send_from_directory('../frontend/build', path)
    except:
        # If not found, serve index.html for client-side routing
        print(f"DEBUG: File not found, serving index.html")  # Added debug logging
        return send_from_directory('../frontend/build', 'index.html')

# Add a debug route to check static files
@app.route('/debug/static')
def debug_static():
    try:
        static_files = []
        for root, dirs, files in os.walk(app.static_folder):
            for file in files:
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, app.static_folder)
                static_files.append({
                    'path': rel_path,
                    'exists': os.path.exists(full_path),
                    'size': os.path.getsize(full_path) if os.path.exists(full_path) else 0
                })
        return jsonify({
            'static_folder': app.static_folder,
            'static_folder_exists': os.path.exists(app.static_folder),
            'files': static_files
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

model = Model("models/vosk-model-small-en-us-0.15")

@app.errorhandler(500)
def internal_error(error):
    app.logger.error(f'Server Error: {error}')
    return jsonify(error=str(error)), 500

@app.errorhandler(Exception)
def handle_exception(e):
    app.logger.error(f'Unhandled Exception: {e}')
    return jsonify(error=str(e)), 500

@app.route('/api/debug/storage')
def debug_storage():
    try:
        paths_to_check = [
            "/app/utils/vector_db/storage",
            "/app/backend/utils/vector_db/storage",
            "/utils/vector_db/storage"
        ]
        
        storage_info = {path: {
            'exists': os.path.exists(path),
            'is_dir': os.path.isdir(path) if os.path.exists(path) else False,
            'contents': os.listdir(path) if os.path.exists(path) and os.path.isdir(path) else [],
            'cwd': os.getcwd(),
            'absolute_path': os.path.abspath(path)
        } for path in paths_to_check}
        
        return jsonify(storage_info)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Add a new route for handling transcription requests
@app.route('/api/voice/transcribe', methods=['POST'])
def transcribe_audio():
    try:
        audio_file = request.files.get('audio')
        if not audio_file:
            return jsonify({'error': 'No audio file received'}), 400

        # Read the WAV file
        audio_data = audio_file.read()
        audio_stream = io.BytesIO(audio_data)
        rec = KaldiRecognizer(model, 16000)
        wf = wave.open(audio_stream, "rb")

        app.logger.info(f"WAV file params: channels={wf.getnchannels()}, " 
                       f"width={wf.getsampwidth()}, "
                       f"rate={wf.getframerate()}, "
                       f"frames={wf.getnframes()}")

        text = ""
        while True:
            data = wf.readframes(4000)
            if len(data) == 0:
                break
            if rec.AcceptWaveform(data):
                result = json.loads(rec.Result())
                app.logger.info(f"Partial transcription: {result.get('text', '')}")
                text += result.get('text', '') + ' '

        final_result = json.loads(rec.FinalResult())
        app.logger.info(f"Final transcription part: {final_result.get('text', '')}")
        text += final_result.get('text', '')

        return jsonify({'text': text.strip()})
    except Exception as e:
        app.logger.error(f"Transcription error: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Your API routes here...