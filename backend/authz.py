"""Shared auth helpers for API blueprints."""

from functools import wraps

from flask import g, jsonify, session

from modules.users import User


def login_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        if g.user is None:
            return jsonify({'error': 'Authentication required'}), 401
        return view(*args, **kwargs)

    return wrapped


def register_request_hooks(app):
    @app.before_request
    def load_logged_in_user():
        user_id = session.get('user_id')
        if user_id is None:
            g.user = None
            return

        try:
            g.user = User.get_user(user_id)
        except Exception:
            app.logger.exception('Failed to load session user %s', user_id)
            g.user = None
            session.clear()
