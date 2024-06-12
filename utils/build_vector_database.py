import openai
import os.path

from dotenv import find_dotenv, load_dotenv
from llama_index.core import (
    VectorStoreIndex,
    SimpleDirectoryReader,
    StorageContext,
    load_index_from_storage,
    Document
)
import csv

load_dotenv(find_dotenv('.env'))
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
client = openai.OpenAI()

key = "lol"



if key == "wows":
    csvfolderpath = "../documents/wows/"
    PERSIST_DIR = "../storage/storage_wows"
elif key == "warcraft":
    csvfolderpath = "../documents/warcraft/"
    PERSIST_DIR = "../storage/storage_warcraft"
elif key == "lol":
    csvfolderpath = "../documents/lol/"
    PERSIST_DIR = "../storage/storage_lol"
documents = []
for filename in os.listdir(csvfolderpath):
    csvpath = (csvfolderpath + filename)
    with open(csvpath, newline='', encoding='utf8') as csvfile:
        csvreader = csv.reader(csvfile, delimiter=',')
        for row in csvreader:
            text = ', '.join(row)
            document = Document(text=text)
            documents.append(document)

index = VectorStoreIndex.from_documents(documents)

index.storage_context.persist(persist_dir=PERSIST_DIR)

"""else:
    # load the existing index
    storage_context = StorageContext.from_defaults(persist_dir=PERSIST_DIR)
    index = load_index_from_storage(storage_context)"""

# Either way we can now query the index
# query_engine = index.as_query_engine()
# response = query_engine.query("What did the author do growing up?")
# print(response)
