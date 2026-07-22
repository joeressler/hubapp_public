from flask import Blueprint, current_app, g, jsonify, request, session

from modules.users import User

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json(silent=True) or {}
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Missing username or password'}), 400

    try:
        if not User.authenticate(username, password):
            return jsonify({'error': 'Invalid username or password'}), 401

        user_id = User.id(username)
        session['user_id'] = user_id
        return jsonify({
            'message': 'Login successful',
            'user': {'id': user_id, 'username': username},
        }), 200
    except Exception:
        current_app.logger.exception('Login failed')
        return jsonify({'error': 'Internal server error'}), 500


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json(silent=True) or {}
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
    except Exception:
        current_app.logger.exception('Registration failed')
        return jsonify({'error': 'Registration failed'}), 500


@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'success': True})


@auth_bp.route('/check', methods=['GET'])
def check_auth():
    if g.user:
        return jsonify({
            'username': g.user['username'],
            'id': g.user['id'],
        })
    return jsonify(None), 401
