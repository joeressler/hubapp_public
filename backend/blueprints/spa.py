import os

from flask import Blueprint, current_app, jsonify, send_from_directory

spa_bp = Blueprint('spa', __name__)


@spa_bp.route('/', defaults={'path': ''})
@spa_bp.route('/<path:path>')
def serve(path):
    build_root = os.path.abspath(
        os.path.join(current_app.root_path, '../frontend/build')
    )

    if path.startswith('api/'):
        return jsonify({'error': 'Not found'}), 404

    candidate = os.path.join(build_root, path)
    if path and os.path.isfile(candidate):
        return send_from_directory(build_root, path)

    index_path = os.path.join(build_root, 'index.html')
    if os.path.isfile(index_path):
        return send_from_directory(build_root, 'index.html')

    return jsonify({'error': 'Frontend build not found'}), 404


def register_debug_routes(app):
    """Optional diagnostics; enabled when ENABLE_DEBUG_ROUTES=1."""

    @app.route('/debug/static')
    def debug_static():
        try:
            static_files = []
            static_folder = app.static_folder or ''
            for root, _dirs, files in os.walk(static_folder):
                for file_name in files:
                    full_path = os.path.join(root, file_name)
                    rel_path = os.path.relpath(full_path, static_folder)
                    static_files.append({
                        'path': rel_path,
                        'exists': os.path.exists(full_path),
                        'size': os.path.getsize(full_path) if os.path.exists(full_path) else 0,
                    })
            return jsonify({
                'static_folder': static_folder,
                'static_folder_exists': os.path.exists(static_folder),
                'files': static_files,
            })
        except Exception:
            app.logger.exception('debug_static failed')
            return jsonify({'error': 'Debug listing failed'}), 500

    @app.route('/api/debug/storage')
    def debug_storage():
        try:
            paths_to_check = [
                '/app/utils/vector_db/storage',
                '/app/backend/utils/vector_db/storage',
                '/utils/vector_db/storage',
            ]
            storage_info = {
                path: {
                    'exists': os.path.exists(path),
                    'is_dir': os.path.isdir(path) if os.path.exists(path) else False,
                    'contents': (
                        os.listdir(path)
                        if os.path.exists(path) and os.path.isdir(path)
                        else []
                    ),
                    'cwd': os.getcwd(),
                    'absolute_path': os.path.abspath(path),
                }
                for path in paths_to_check
            }
            return jsonify(storage_info)
        except Exception:
            app.logger.exception('debug_storage failed')
            return jsonify({'error': 'Debug listing failed'}), 500
