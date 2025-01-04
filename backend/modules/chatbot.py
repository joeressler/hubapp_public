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
    def get_response(question, context, base_path=None):
        if base_path is None:
            # Use absolute path from app root
            base_path = "/app/backend/utils/vector_db/storage"  # Remove trailing slash
        
        print(f"Base path: {base_path}")  # Add debug logging
        
        if context == "wows":
            PERSIST_DIR = os.path.join(base_path, "storage_wows")
        elif context == "warcraft":
            PERSIST_DIR = os.path.join(base_path, "storage_warcraft")
        elif context == "lol":
            PERSIST_DIR = os.path.join(base_path, "storage_lol")
        else:
            raise ValueError("Invalid context. Must be one of: wows, warcraft, lol")

        try:
            print(f"Looking for storage directory at: {PERSIST_DIR}")
            print(f"Directory exists: {os.path.exists(PERSIST_DIR)}")
            print(f"Current working directory: {os.getcwd()}")  # Add debug logging
            print(f"Directory listing of base path: {os.listdir(base_path)}")  # Add debug logging
            
            if not os.path.exists(PERSIST_DIR):
                print(f"Storage directory not found: {PERSIST_DIR}")
                return {"error": f"Storage directory {PERSIST_DIR} not found"}

            required_files = [
                "default__vector_store.json",
                "docstore.json",
                "graph_store.json",
                "index_store.json"
            ]
            
            missing_files = [f for f in required_files if not os.path.exists(os.path.join(PERSIST_DIR, f))]
            if missing_files:
                print(f"Missing required files in {PERSIST_DIR}: {missing_files}")
                return {"error": f"Missing required files: {', '.join(missing_files)}"}

            try:
                storage_context = StorageContext.from_defaults(persist_dir=PERSIST_DIR)
                index = load_index_from_storage(storage_context)
                query_engine = index.as_query_engine()
                response = query_engine.query(question)
                return response
            except Exception as storage_error:
                print(f"Storage error: {str(storage_error)}")
                # Try to read one of the JSON files to check permissions
                try:
                    with open(os.path.join(PERSIST_DIR, "docstore.json"), 'r') as f:
                        f.read()
                except Exception as read_error:
                    print(f"File read error: {str(read_error)}")
                return {"error": f"Storage error: {str(storage_error)}"}

        except Exception as e:
            print(f"Error in get_response: {str(e)}")
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