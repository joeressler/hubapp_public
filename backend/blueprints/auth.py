from flask import Blueprint, current_app, g, jsonify, request, session

from extensions import limiter
from modules.users import User
from utils.security import (
    safe_error_message,
    validate_email,
    validate_username,
    verify_recaptcha,
)

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


@auth_bp.route('/login', methods=['POST'])
@limiter.limit('10 per minute')
def login():
    data = request.get_json(silent=True) or {}
    username = (data.get('username') or '').strip()
    password = data.get('password') or ''
    recaptcha_token = data.get('recaptcha_token')

    if not username or not password:
        return jsonify({'error': 'Missing username or password'}), 400

    if not validate_username(username):
        return jsonify({'error': 'Invalid username format'}), 400

    if not verify_recaptcha(recaptcha_token):
        return jsonify({'error': 'reCAPTCHA verification failed'}), 400

    try:
        if not User.authenticate(username, password):
            return jsonify({'error': 'Invalid username or password'}), 401

        user_id = User.id(username)
        session.clear()
        session.permanent = True
        session['user_id'] = user_id
        return jsonify({
            'message': 'Login successful',
            'user': {'id': user_id, 'username': username},
        }), 200
    except Exception:
        current_app.logger.exception('Login failed')
        return jsonify({'error': safe_error_message()}), 500


@auth_bp.route('/register', methods=['POST'])
@limiter.limit('5 per minute')
def register():
    data = request.get_json(silent=True) or {}
    username = (data.get('username') or '').strip()
    password = data.get('password') or ''
    email = (data.get('email') or '').strip()
    recaptcha_token = data.get('recaptcha_token')

    if not username or not password or not email:
        return jsonify({'error': 'Missing required fields'}), 400

    if not validate_username(username):
        return jsonify({
            'error': 'Username must be 3-30 alphanumeric characters or underscores',
        }), 400

    if not validate_email(email):
        return jsonify({'error': 'Invalid email format'}), 400

    if not verify_recaptcha(recaptcha_token):
        return jsonify({'error': 'reCAPTCHA verification failed'}), 400

    if not User.validate_password(password):
        return jsonify({'error': 'Invalid password format'}), 400

    if User.lookup(username):
        return jsonify({'error': 'Unable to create account with those details'}), 400

    user = User(email, username, password)
    try:
        user.save()
        return jsonify({'message': 'Registration successful'}), 201
    except Exception:
        current_app.logger.exception('Registration failed')
        return jsonify({'error': 'Registration failed'}), 500


@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'success': True, 'message': 'Logged out'})


@auth_bp.route('/check', methods=['GET'])
def check_auth():
    if g.user:
        return jsonify({
            'username': g.user['username'],
            'id': g.user['id'],
        })
    return jsonify(None), 401
