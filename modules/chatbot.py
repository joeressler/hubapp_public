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
load_dotenv(find_dotenv('.env'))
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
client = openai.OpenAI()
# openai.api_key = api_key
PERSIST_DIR = "./storage"


class ChatBot:
    @staticmethod
    def get_response(question):
        storage_context = StorageContext.from_defaults(persist_dir=PERSIST_DIR)
        index = load_index_from_storage(storage_context)

        query_engine = index.as_query_engine()
        response = query_engine.query(question)
        return response
