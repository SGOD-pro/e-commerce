from main.db.mongo import products_collection
from langchain_nvidia_ai_endpoints import NVIDIAEmbeddings
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance
from langchain.schema import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from time import sleep
import asyncio
from main.core.config import settings
# Initialize Qdrant client
qdrant_client = QdrantClient(
    url=settings.QDRANT_URL,
    api_key=settings.QDRANT_KEY,
)

# Initialize embeddings
embeddings = NVIDIAEmbeddings(
    model="nvidia/nv-embed-v1",
    api_key=settings.NIM_API,
    truncate="NONE",
)

# Token-based splitter to avoid exceeding model limits
splitter = RecursiveCharacterTextSplitter.from_tiktoken_encoder(
    chunk_size=512,  # max tokens for NVIDIA embedding
    chunk_overlap=50
)

def build_text_chunks(product: dict):
    """Combine product fields into text and split into token-safe chunks"""
    text = " ".join([
        product.get("title", ""),
        " ".join(product.get("description", []) or []),
        " ".join(product.get("features", []) or []),
        " ".join(product.get("categories", []) or []),
        product.get("brand") or "",
    ])
    return splitter.split_text(text)

async def index_products():
    cursor = await products_collection.find().sort("_id").skip(10692).to_list()
    print("Indexing products...", len(cursor))

    # Create Qdrant collection if it doesn't exist
    if not qdrant_client.collection_exists("products"):
        qdrant_client.create_collection(
            collection_name="products",
            vectors_config=VectorParams(size=4096, distance=Distance.COSINE)
        )

    vector_store = QdrantVectorStore(
        client=qdrant_client,
        collection_name="products",
        embedding=embeddings,
    )

    # Prepare Documents
    all_docs = []
    for product in cursor:
        chunks = build_text_chunks(product)
        if not chunks:
            continue
        for chunk in chunks:
            doc = Document(
                page_content=chunk,
                metadata={
                    "id": str(product["_id"]),
                    "title": product.get("title"),
                    "categories": product.get("categories"),
                    "main_category": product.get("main_category"),
                    "average_rating": product.get("average_rating"),
                    "store": product.get("store"),
                    "price": product.get("price"),
                }
            )
            all_docs.append(doc)

    # Index in batches
    batch_size = 150
    for i in range(0, len(all_docs), batch_size):
        print(f"Indexing batch {i} - {i+batch_size}")
        await vector_store.aadd_documents(all_docs[i:i+batch_size])
        print(f"Indexing complete {i} - {i+batch_size}")
        sleep(1)
        print("Restarted")

    print("Indexing completed.")
    qdrant_client.close()

if __name__ == "__main__":
    try:
        asyncio.run(index_products())
    except Exception as e:
        print(e)
