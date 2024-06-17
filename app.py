from flask import Flask, url_for, flash
from flask_bootstrap import Bootstrap
import flask_wtf
from werkzeug.middleware.proxy_fix import ProxyFix
from flask_wtf.csrf import CSRFError, CSRFProtect
from logging import FileHandler, WARNING

import sentry_sdk
from sentry_sdk.integrations.flask import FlaskIntegration

import os
from dotenv import load_dotenv

load_dotenv()

from ui.game.game_controller import game_blueprint
from ui.chatbot.chat_controller import chat_blueprint
from ui.portfolio.portfolio_controller import portfolio_blueprint
from ui.auth.auth_controller import auth_blueprint

app = Flask(__name__)
app.register_blueprint(game_blueprint)
app.register_blueprint(chat_blueprint)
app.register_blueprint(portfolio_blueprint)
app.register_blueprint(auth_blueprint)

#"""
sentry_sdk.init(
    dsn=os.environ.get('SENTRY_DSN'),
    # Set traces_sample_rate to 1.0 to capture 100%
    # of transactions for performance monitoring.
    traces_sample_rate=0.5,
    # Set profiles_sample_rate to 1.0 to profile 100%
    # of sampled transactions.
    # We recommend adjusting this value in production.
    profiles_sample_rate=0.10,
)
#"""
file_handler = FileHandler('errorlog.txt')
file_handler.setLevel(WARNING)
csrf = CSRFProtect()
csrf.init_app(app)
app.config['SECRET_KEY'] = os.environ.get('FLASK_SECRET_KEY')
app.config['PREFERRED_URL_SCHEME'] = 'https'
app.config['RECAPTCHA_PUBLIC_KEY'] = os.environ.get('RECAPTCHA_PUBLIC_KEY')
app.config['RECAPTCHA_PRIVATE_KEY'] = os.environ.get('RECAPTCHA_PRIVATE_KEY')
app.config['RECAPTCHA_PARAMETERS'] = {'hl': 'zh', 'render': 'explicit'}
app.config['RECAPTCHA_OPTIONS'] = {'theme': 'dark'}
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)
Bootstrap(app)


@app.errorhandler(CSRFError)
def handle_csrf_error(e):
    flash(e.description), 400


def start(port=None, debug=False):
    """
    For use with __main__ and running the app on the console or debugging purposes.

    :param app:
    :type app: Flask
    :type port: int
    :param debug:
    :type debug: bool
    """

    if port is None:
        app.run(debug=debug)
    else:
        app.run(host='localhost', port=port, debug=debug)


with app.test_request_context():  # Ease of access for subdomains
    domain = 'http://localhost:5000'
    #print()  # leading newline
    #print("Index:")
    #print(domain + url_for('.index'))
    #print('\n' + "Individual pages:")
    #print(domain + url_for('.home'))
    #print(domain + url_for('.home_submit'))
    #print()  # trailing newline

if __name__ == '__main__':
    from argparse import ArgumentParser

    parser = ArgumentParser()
    parser.add_argument('--port', required=False, type=int, help='Specify port to run app.')
    parser.add_argument('--environment', required=False, help='Specify environment. See config/*.config')
    parser.add_argument('--database', required=False, help='Specify a database. See config/*.config')
    parser.add_argument('--debug', required=False, action='store_true',
                        help='Set the app debug parameter (default false)')
    parser.add_argument('--oauth_type', required=False,
                        help='Set to something so my local env doesn\'t try to authenticate')
    parser.set_defaults(debug=False)
    args = parser.parse_args()

    start(port=args.port, debug=args.debug)
