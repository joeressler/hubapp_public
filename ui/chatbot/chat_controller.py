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
    question = request.form.get("question")
    form = BotForm()
    answer = ChatBot.get_response(question)
    return render_template("chatbot.html", form=form, answer=answer)

