import openai
import os.path
from llama_index.core import (
    VectorStoreIndex,
    SimpleDirectoryReader,
    StorageContext,
    load_index_from_storage,
    Document
)
import csv

import os
from dotenv import load_dotenv, find_dotenv

from utils.vconnection import VConnection, VCursor

load_dotenv(find_dotenv('.env'))
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
client = openai.OpenAI()



class ChatBot:
    @staticmethod
    def get_response(question, context):
        if context == "wows":
            PERSIST_DIR = "./storage/storage_wows"
            storage_context = StorageContext.from_defaults(persist_dir=PERSIST_DIR)
            index = load_index_from_storage(storage_context)

            query_engine = index.as_query_engine()
            response = query_engine.query(question)
        elif context == "warcraft":
            PERSIST_DIR = "./storage/storage_warcraft"
            storage_context = StorageContext.from_defaults(persist_dir=PERSIST_DIR)
            index = load_index_from_storage(storage_context)

            query_engine = index.as_query_engine()
            response = query_engine.query(question)
        elif context == "lol":
            PERSIST_DIR = "./storage/storage_lol"
            storage_context = StorageContext.from_defaults(persist_dir=PERSIST_DIR)
            index = load_index_from_storage(storage_context)

            query_engine = index.as_query_engine()
            response = query_engine.query(question)
        return response

    @staticmethod
    def log(context, question, answer, user_id):
        with VConnection() as connection, VCursor(connection) as cursor:
            sql = "INSERT INTO chatbot (context, query, answer, user_id) VALUES ('{context_str}', '{question_str}', '{answer_str}', {user_id})".format(
                context_str=str(context),
                question_str=str(question),
                answer_str=str(answer),
                user_id=user_id)
            print(sql)
            cursor.execute(sql)
            connection.commit()