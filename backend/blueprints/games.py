from flask import Blueprint, current_app, jsonify, request, session

from authz import login_required
from modules.game_db import GameDB

games_bp = Blueprint('games', __name__, url_prefix='/api/games')


@games_bp.route('', methods=['GET'])
@games_bp.route('/', methods=['GET'])
def get_games():
    try:
        games = GameDB.listgames()
        if games is None:
            return jsonify({'error': 'No games found'}), 404
        return jsonify(games)
    except Exception:
        current_app.logger.exception('Failed to list games')
        return jsonify({'error': 'Internal server error'}), 500


@games_bp.route('/<int:game_id>', methods=['GET'])
def get_game_info(game_id):
    try:
        game_info = GameDB.listgames(game_id)
        if not game_info:
            return jsonify({'error': 'Game not found'}), 404
        return jsonify(game_info[0])
    except Exception:
        current_app.logger.exception('Failed to fetch game %s', game_id)
        return jsonify({'error': 'Internal server error'}), 500


@games_bp.route('/<int:game_id>/rate', methods=['POST'])
@login_required
def submit_rating(game_id):
    data = request.get_json(silent=True) or {}
    rating = data.get('rating')
    fullclear = data.get('fullclear', False)
    user_id = session['user_id']

    if rating is None:
        return jsonify({'error': 'Missing rating'}), 400

    try:
        existing_rating = GameDB.lookup_user_rating(game_id, user_id)
        GameDB.add_game_rating(
            game_id,
            rating,
            fullclear,
            user_id,
            update=existing_rating is not None,
        )
        return jsonify({'message': 'Rating submitted successfully'})
    except Exception:
        current_app.logger.exception('Failed to rate game %s', game_id)
        return jsonify({'error': 'Internal server error'}), 500
