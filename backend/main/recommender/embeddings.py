from main.db.mongo import products_collection
from langchain_nvidia_ai_endpoints import NVIDIAEmbeddings
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
from main.core.config import settings
from qdrant_client.models import VectorParams, Distance

qdrant_client = QdrantClient(
    url=settings.QDRANT_URL,
    api_key=settings.QDRANT_KEY,
    timeout=300
)

embeddings = NVIDIAEmbeddings(
    model="nvidia/nv-embedqa-mistral-7b-v2",
    api_key=settings.NIM_API,
    truncate="NONE",
)

async def index_products():
    cursor =  await products_collection.find().sort("_id", -1).skip(9320).to_list()

    print("Indexing products...",len(cursor))
    if not qdrant_client.collection_exists(settings.QDRANT_COLLECTION):
        qdrant_client.create_collection(
            collection_name=settings.QDRANT_COLLECTION,
            vectors_config=VectorParams(size=4096, distance=Distance.COSINE)
        )


    vector_store = QdrantVectorStore(
        client=qdrant_client,
        collection_name=settings.QDRANT_COLLECTION,
        embedding=embeddings,
    )

    texts, metadatas = [], []
    # cursor=cursor[7948:]
    for product in cursor:
        #print(type(product))
        text = " ".join([
            product.get("title", ""),
            " ".join(product.get("description", []) or []),
            " ".join(product.get("features", []) or []),
        ]).strip()
        
        if not text:  
            continue
        texts.append(text[:512])
        metadatas.append({
            "id": str(product["_id"]),
            "title": product.get("title"),
            "categories": product.get("categories"),
            "average_rating": product.get("average_rating"),
            "store": product.get("store"),
            "price": product.get("price"),
        })
    #     if len(texts) >= 500:
    #         await vector_store.add_texts(texts=[text],metadatas=[metadatas])
    #         print(f"Indexed {len(metadatas)} products...")
    #         texts, metadatas = [], []
    # print(len(texts), len(metadatas))

    print("Final batch indexing...", len(texts))
    await vector_store.aadd_texts(texts=texts, metadatas=metadatas)
    
    print("Indexing completed.")


async def index_categories():
    # fetch distinct categories
    categories = await products_collection.distinct("categories")

    # clean + flatten (because some might be lists)
    flat_categories = []
    for c in categories:
        if isinstance(c, list):
            flat_categories.extend(c)
        elif c:
            flat_categories.append(c)

    # remove duplicates
    flat_categories = list(set(flat_categories))
    print(f"Indexing {len(flat_categories)} categories...")
    # create collection if not exists
    if not qdrant_client.collection_exists(settings.QDRANT_CATEGORY_COLLECTION):
        qdrant_client.create_collection(
            collection_name=settings.QDRANT_CATEGORY_COLLECTION,
            vectors_config=VectorParams(size=4096, distance=Distance.COSINE)
        )

    # vector store
    vector_store = QdrantVectorStore(
        client=qdrant_client,
        collection_name=settings.QDRANT_CATEGORY_COLLECTION,
        embedding=embeddings,
    )
    from time import sleep
    for i in range(0, len(flat_categories), 500):
        metadatas = [{"category": c} for c in flat_categories[i:i+500]]
        print(i)
        await vector_store.aadd_texts(flat_categories[i:i+500], metadatas=metadatas)
        print(sleep)
        sleep(2)
    
    print(i)
    # metadatas = [{"category": c} for c in flat_categories]
    # await vector_store.aadd_texts(flat_categories, metadatas=metadatas)

    print(f"✅ Complete")
