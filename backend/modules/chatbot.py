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
from backend.utils.vconnection import VConnection, VCursor

class ChatBot:
    def __init__(self):
        # Load environment variables
        load_dotenv(find_dotenv('.env'))
        
        # Initialize OpenAI client
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            print("Warning: OPENAI_API_KEY not found in environment variables")
            self.client = None
        else:
            self.client = openai.OpenAI(api_key=api_key)

    @staticmethod
    def get_response(question, context):
        if context == "wows":
            PERSIST_DIR = "./storage/storage_wows"
        elif context == "warcraft":
            PERSIST_DIR = "./storage/storage_warcraft"
        elif context == "lol":
            PERSIST_DIR = "./storage/storage_lol"
        else:
            raise ValueError("Invalid context. Must be one of: wows, warcraft, lol")

        try:
            if not os.path.exists(PERSIST_DIR):
                return {"error": f"Storage directory {PERSIST_DIR} not found"}

            storage_context = StorageContext.from_defaults(persist_dir=PERSIST_DIR)
            index = load_index_from_storage(storage_context)
            query_engine = index.as_query_engine()
            response = query_engine.query(question)
            return response
        except Exception as e:
            print(f"Error in get_response: {e}")
            return {"error": str(e)}

    @staticmethod
    def log(context, question, answer, user_id):
        try:
            with VConnection() as connection, VCursor(connection) as cursor:
                sql = "INSERT INTO chatbot (context, query, answer, user_id) VALUES (%s, %s, %s, %s)"
                cursor.execute(sql, (context, question, str(answer), user_id))
                connection.commit()
        except Exception as e:
            print(f"Error logging chat: {e}")
            raise