from flask import Blueprint, jsonify, render_template, Response, request, session, redirect

from ui import chatbot
from ui.chatbot.botform import BotForm
from modules.game_db import GameDB
from openai import OpenAI
from modules.chatbot import ChatBot

chat_blueprint = Blueprint('chat', __name__, template_folder='templates')


@chat_blueprint.route('/chat/home', methods=['GET'])
def chat_home():  # put application's code here
    form = BotForm()
    return render_template("chatbot.html", form=form)


@chat_blueprint.route('/chat/submit', methods=['POST'])
def chat_submit():
    augment = request.form.get("augment")
    question = request.form.get("question")
    form = BotForm()
    answer = ChatBot.get_response(question, augment)
    user_id = session.get('user_id')
    if not user_id:
        if request.environ.get('HTTP_X_FORWARDED_FOR') is None:
            user_id = request.environ['REMOTE_ADDR']
        else:
            user_id = request.environ['HTTP_X_FORWARDED_FOR']
    ChatBot.log(augment, question, answer, user_id)
    return render_template("chatbot.html", form=form, answer=answer)

