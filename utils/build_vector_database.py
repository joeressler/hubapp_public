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

client = openai.OpenAI(api_key=os.environ.get('OPENAI_API_KEY'))
openai.api_key = os.environ.get('OPENAI_API_KEY')

csvfolderpath = "../documents/"
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
PERSIST_DIR = "../storage"
index.storage_context.persist(persist_dir=PERSIST_DIR)

"""else:
    # load the existing index
    storage_context = StorageContext.from_defaults(persist_dir=PERSIST_DIR)
    index = load_index_from_storage(storage_context)"""

# Either way we can now query the index
# query_engine = index.as_query_engine()
# response = query_engine.query("What did the author do growing up?")
# print(response)
