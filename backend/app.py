import logging
import os

from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS
from werkzeug.exceptions import HTTPException

from authz import register_request_hooks
from blueprints import register_blueprints


def create_app():
    load_dotenv()

    app = Flask(
        __name__,
        static_folder='../frontend/build/static',
        static_url_path='/static',
    )

    app.config['SECRET_KEY'] = os.environ.get('FLASK_SECRET_KEY')
    app.config['RECAPTCHA_PUBLIC_KEY'] = os.environ.get('RECAPTCHA_PUBLIC_KEY')
    app.config['RECAPTCHA_PRIVATE_KEY'] = os.environ.get('RECAPTCHA_PRIVATE_KEY')
    app.config['VERIFY_URL'] = os.environ.get('VERIFY_URL')
    app.config['PASSWORD_PIN'] = os.environ.get('PASSWORD_PIN')
    app.config['ENABLE_DEBUG_ROUTES'] = os.environ.get(
        'ENABLE_DEBUG_ROUTES',
        '0',
    ).lower() in {'1', 'true', 'yes'}

    logging.basicConfig(level=logging.INFO)

    CORS(
        app,
        supports_credentials=True,
        resources={
            r'/*': {
                'origins': [
                    'http://localhost:3000',
                    'http://frontend:3000',
                    'https://www.josepharessler.com',
                    'https://aws.josepharessler.com',
                    'wss://www.josepharessler.com',
                ],
                'methods': ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
                'allow_headers': ['Content-Type', 'Authorization'],
                'expose_headers': ['Content-Range', 'X-Content-Range'],
                'supports_credentials': True,
            }
        },
    )

    register_request_hooks(app)
    register_blueprints(app)

    @app.errorhandler(500)
    def internal_error(error):
        app.logger.error('Server Error: %s', error)
        return jsonify({'error': 'Internal server error'}), 500

    @app.errorhandler(Exception)
    def handle_exception(exc):
        if isinstance(exc, HTTPException):
            return exc
        app.logger.exception('Unhandled exception')
        return jsonify({'error': 'Internal server error'}), 500

    return app


app = create_app()
