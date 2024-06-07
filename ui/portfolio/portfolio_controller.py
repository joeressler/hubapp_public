import os

from flask import Blueprint, render_template, Response, request, session, redirect

from ui import portfolio

portfolio_blueprint = Blueprint('portfolio', __name__, template_folder='templates')


@portfolio_blueprint.route('/', methods=['GET'])
def portfolio_home():
    return render_template("portfolio.html")

