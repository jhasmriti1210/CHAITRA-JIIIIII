from langchain.text_splitter import RecursiveCharacterTextSplitter 
from langchain_community.document_loaders import PyPDFLoader, DirectoryLoader
from langchain_community.embeddings import HuggingFaceEmbeddings

from typing import List
from langchain.docstore.document import Document
import os

# Load raw PDFs
def pdf_loader(pdf_path: str) -> List[Document]:
    """Loads all PDFs from a given directory using PyPDFLoader."""
    try:
        if not os.path.exists(pdf_path):
            raise FileNotFoundError(f"Directory {pdf_path} does not exist.")
        
        loader = DirectoryLoader(pdf_path, glob='*.pdf', loader_cls=PyPDFLoader)
        docs = loader.load()
        
        if not docs:
            raise ValueError("No PDF files found in the directory.")

        return docs

    except Exception as e:
        print(f"Error loading PDFs: {e}")
        return []

# Create text chunks
def text_chunking(extracted_docs: List[Document]) -> List[Document]:
    """Splits extracted documents into smaller chunks."""
    chunker = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=20)
    return chunker.split_documents(extracted_docs)

# Create vector embeddings
def hf_embeds() -> HuggingFaceEmbeddings:
    """Returns Hugging Face embeddings model."""
    return HuggingFaceEmbeddings(model_name='sentence-transformers/all-mpnet-base-v2')
