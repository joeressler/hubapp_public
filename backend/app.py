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
CORS(app, supports_credentials=True)

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
@login_required
def chat():
    data = request.json
    question = data.get('message')
    context = data.get('context', 'general')
    user_id = session['user_id']

    try:
        response = ChatBot.get_response(question, context)
        ChatBot.log(context, question, str(response), user_id)
        return jsonify({'response': str(response)})
    except Exception as e:
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

# Your API routes here...