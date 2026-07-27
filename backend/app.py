import logging
import os
from datetime import timedelta

from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS
from flask_wtf.csrf import CSRFError, generate_csrf
from werkzeug.exceptions import HTTPException

from authz import register_request_hooks
from blueprints import register_blueprints
from extensions import csrf, limiter
from utils.security import is_production, safe_error_message


def create_app():
    load_dotenv()

    if os.environ.get('SENTRY_DSN'):
        import sentry_sdk
        from sentry_sdk.integrations.flask import FlaskIntegration

        sentry_sdk.init(
            dsn=os.environ['SENTRY_DSN'],
            integrations=[FlaskIntegration()],
            traces_sample_rate=0.1,
            environment=os.environ.get('FLASK_ENV', 'development'),
        )

    app = Flask(
        __name__,
        static_folder='../frontend/build/static',
        static_url_path='/static',
    )

    secret_key = os.environ.get('FLASK_SECRET_KEY')
    if not secret_key:
        if is_production():
            raise RuntimeError(
                'FLASK_SECRET_KEY must be set to a strong value in production'
            )
        secret_key = 'dev-only-insecure-key-do-not-use-in-production'
    elif secret_key == 'change-me' and is_production():
        raise RuntimeError(
            'FLASK_SECRET_KEY must be set to a strong value in production'
        )

    app.config['SECRET_KEY'] = secret_key
    app.config['RECAPTCHA_PUBLIC_KEY'] = os.environ.get('RECAPTCHA_PUBLIC_KEY')
    app.config['RECAPTCHA_PRIVATE_KEY'] = os.environ.get('RECAPTCHA_PRIVATE_KEY')
    app.config['VERIFY_URL'] = os.environ.get('VERIFY_URL')
    app.config['PASSWORD_PIN'] = os.environ.get('PASSWORD_PIN')
    app.config['ENABLE_DEBUG_ROUTES'] = os.environ.get(
        'ENABLE_DEBUG_ROUTES',
        '0',
    ).lower() in {'1', 'true', 'yes'}
    app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024
    app.config['WTF_CSRF_TIME_LIMIT'] = None
    app.config['WTF_CSRF_HEADERS'] = ['X-CSRFToken']
    app.config['WTF_CSRF_SSL_STRICT'] = is_production()
    app.config['SESSION_COOKIE_HTTPONLY'] = True
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
    app.config['SESSION_COOKIE_SECURE'] = is_production()
    app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=24)
    app.config['VOICE_SERVICE_URL'] = os.environ.get(
        'VOICE_SERVICE_URL',
        'http://voice:8081',
    )
    app.config['INTERNAL_SERVICE_KEY'] = os.environ.get('INTERNAL_SERVICE_KEY', '')

    logging.basicConfig(level=logging.INFO)

    cors_origins = [
        origin.strip()
        for origin in os.environ.get(
            'CORS_ORIGINS',
            ','.join([
                'http://localhost:3000',
                'http://frontend:3000',
                'https://www.josepharessler.com',
                'https://aws.josepharessler.com',
            ]),
        ).split(',')
        if origin.strip()
    ]

    CORS(
        app,
        supports_credentials=True,
        resources={
            r'/*': {
                'origins': cors_origins,
                'methods': ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
                'allow_headers': ['Content-Type', 'Authorization', 'X-CSRFToken'],
                'expose_headers': ['Content-Range', 'X-Content-Range'],
                'supports_credentials': True,
            }
        },
    )

    csrf.init_app(app)
    limiter.init_app(app)
    register_request_hooks(app)
    register_blueprints(app)

    @app.after_request
    def set_security_headers(response):
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        response.headers['Permissions-Policy'] = (
            'camera=(), microphone=(self), geolocation=()'
        )
        if is_production():
            response.headers['Strict-Transport-Security'] = (
                'max-age=31536000; includeSubDomains'
            )
        return response

    @app.route('/api/csrf-token', methods=['GET'])
    def get_csrf_token():
        return jsonify({'csrf_token': generate_csrf()})

    @app.errorhandler(CSRFError)
    def handle_csrf_error(error):
        return jsonify({'error': 'CSRF token missing or invalid'}), 400

    @app.errorhandler(429)
    def ratelimit_handler(error):
        return jsonify({'error': 'Too many requests. Please try again later.'}), 429

    @app.errorhandler(500)
    def internal_error(error):
        app.logger.error('Server Error: %s', error)
        return jsonify({'error': safe_error_message()}), 500

    @app.errorhandler(Exception)
    def handle_exception(exc):
        if isinstance(exc, HTTPException):
            return exc
        app.logger.exception('Unhandled exception')
        return jsonify({'error': safe_error_message()}), 500

    return app


app = create_app()
