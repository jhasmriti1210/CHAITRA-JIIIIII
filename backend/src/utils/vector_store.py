import os
from dotenv import load_dotenv
from src.components.preprocess import pdf_loader, text_chunking, hf_embeds
from pinecone import Pinecone, ServerlessSpec
from langchain_pinecone import PineconeVectorStore

# Load environment variables
load_dotenv()

# Fetch and validate Pinecone API key
PINECONE_API_KEY = os.getenv('PINECONE_DB_KEY')
if not PINECONE_API_KEY:
    raise ValueError("PINECONE_DB_KEY is not set in environment variables.")

# Initialize Pinecone
pc = Pinecone(api_key=PINECONE_API_KEY)

# Define index name and embedding dimension
INDEX_NAME = "arogyam"
DIMENSION = 768  # Ensure it matches the embedding model's output size

# Check if the index already exists
existing_indexes = pc.list_indexes()
if INDEX_NAME not in existing_indexes:
    print(f"Creating Pinecone index: {INDEX_NAME}")
    pc.create_index(
        name=INDEX_NAME,
        dimension=DIMENSION,
        metric='cosine',
        spec=ServerlessSpec(cloud='aws', region="us-east-1")
    )
else:
    print(f"Pinecone index '{INDEX_NAME}' already exists.")

# Load and process PDFs
extracted_docs = pdf_loader(pdf='data/raw/')
if not extracted_docs:
    raise ValueError("No PDF documents found. Ensure the directory has valid PDFs.")

chunks = text_chunking(extracted_docs)
embeddings = hf_embeds()

# Connect to the existing index
doc_search = PineconeVectorStore.from_documents(
    documents=chunks, 
    index_name=INDEX_NAME, 
    embedding=embeddings
)

print(f"Successfully stored {len(chunks)} document chunks in Pinecone index '{INDEX_NAME}'.")
