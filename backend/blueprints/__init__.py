from blueprints.auth import auth_bp
from blueprints.chat import chat_bp
from blueprints.games import games_bp
from blueprints.health import health_bp
from blueprints.spa import register_debug_routes, spa_bp
from blueprints.voice import voice_bp


def register_blueprints(app):
    app.register_blueprint(auth_bp)
    app.register_blueprint(games_bp)
    app.register_blueprint(chat_bp)
    app.register_blueprint(health_bp)
    app.register_blueprint(voice_bp)
    # SPA catch-all last so it does not shadow API routes.
    app.register_blueprint(spa_bp)

    if app.config.get('ENABLE_DEBUG_ROUTES'):
        register_debug_routes(app)
