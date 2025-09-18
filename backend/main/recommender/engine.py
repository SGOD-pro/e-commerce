from main.db.mongo import products_collection,interactions_collection
from main.recommender.embeddings import qdrant_client,embeddings
from collections import defaultdict
from bson import ObjectId
from langchain_qdrant import QdrantVectorStore
from fastapi.encoders import jsonable_encoder
from typing import Optional,List
def build_text(product: dict):
    """Combine product fields into text and split into token-safe chunks"""
    return " ".join([
        product.get("title", ""),
        " ".join(product.get("description", []) or []),
        " ".join(product.get("features", []) or []),
        " ".join(product.get("categories", []) or []),
        product.get("brand") or "",
    ])

async def search_products(query: str, limit: int = 10):
    vector_store = QdrantVectorStore(
        client=qdrant_client,
        collection_name="products",
        embedding=embeddings,
    )
    # Over-fetch to compensate for duplicates
    docs_with_scores = await vector_store.asimilarity_search_with_score(
        query=query,
        k=limit * 2   
    )

    # Group scores by product ID
    scores = defaultdict(list)
    for doc, score in docs_with_scores:
        pid = doc.metadata["id"]
        scores[pid].append(score)

    # Rank by best score (lower score = more similar)
    ranked = sorted(scores.items(), key=lambda x: min(x[1]))

    # Take first 'limit' unique product IDs
    product_ids = [pid for pid, _ in ranked[:limit]]

    # Convert to ObjectId for Mongo query
    mongo_ids = [ObjectId(pid) for pid in product_ids]
    return mongo_ids


async def recommend_similar_products(product_id: str, limit: int = 10):
    # 1. Fetch product from Mongo
    product = await products_collection.find_one({"_id": ObjectId(product_id)})
    if not product:
        return []

    # 2. Build text and query embeddings
    vector_store = QdrantVectorStore(
        client=qdrant_client,
        collection_name="products",
        embedding=embeddings,
    )
    text = build_text(product)

    # 3. Over-fetch (get more than you need)
    # 3. Over-fetch with scores
    docs_with_scores = await vector_store.asimilarity_search_with_score(text, k=limit * 5)

    # 4. Deduplicate by product ID
    scores = defaultdict(list)
    for doc, score in docs_with_scores:
        pid = doc.metadata["id"]
        if pid != product_id:  # exclude self
            scores[pid].append(score)

    # 5. Rank by best score (lower = more similar in cosine)
    ranked = sorted(scores.items(), key=lambda x: min(x[1]))
    product_ids = [pid for pid, _ in ranked[:limit]]

    # 6. Fetch product details from Mongo
    pipeline = [
        {
            "$match": {
                "_id": {"$in": [ObjectId(pid) for pid in product_ids]},
                "price": {"$gt": 0}
            }
        },
        {
            "$project": {
                "id": "$_id",   # project _id as id
                "_id": 0,     # exclude original _id
                "title": 1,
                'categories':1,
                "images":1,
                "features": 1,
                "price":1,
                "averageRating": "$average_rating",
                "ratingNumber": "$rating_number",
            }
        }
    ]

    mongo_docs = await products_collection.aggregate(pipeline)
    mongo_docs = await mongo_docs.to_list(length=limit)
    print(len(mongo_docs))
    return jsonable_encoder(
        mongo_docs,
        custom_encoder={ObjectId: str}
    )


# TODO: implement after creating interactions collection
async def recommend_for_user(user_id: str, limit: int = 10):
    # Example: last 5 viewed products
    views = await interactions_collection.find(
        {"user_id": user_id, "action": "view"}
    ).sort("timestamp", -1).limit(5).to_list(length=7)

    if not views:
        return await products_collection.find(
            {}
        ).sort("average_rating", -1).limit(limit).to_list(length=limit)

    # Take product IDs and build a query vector
    viewed_products = await products_collection.find(
        {"_id": {"$in": [ObjectId(v["product_id"]) for v in views]}}
    ).to_list(length=len(views))

    # Merge their texts
    combined_text = " ".join([build_text(p) for p in viewed_products])
    vector_store = QdrantVectorStore(
        client=qdrant_client,
        collection_name="products",
        embedding=embeddings,
    )

    docs = await vector_store.asimilarity_search(combined_text, k=limit)

    product_ids = [doc.metadata["id"] for doc in docs]
    mongo_docs = await products_collection.find(
        {"_id": {"$in": [ObjectId(pid) for pid in product_ids]}}
    ).to_list(length=limit)

    return mongo_docs



import numpy as np
from collections import defaultdict

# Example: store user-item interactions in memory
# In production, you'd fetch from Mongo or Redis
# interactions = { user_id: {product_id: rating, ...}, ... }

# XXX: v2 user recomendation
from collections import defaultdict
import numpy as np

async def get_user_items(user_id: str):
    """
    Get all items a specific user interacted with.
    """
    cursor = await interactions_collection.find({"user_id": user_id}).to_list(None)
    items = {}
    weight = {"view": 1.0, "cart": 2.0, "favorite": 2.5, "purchase": 3.0}
    for row in cursor:
        rating = row.get("rating") or weight.get(row.get("action"), 1.0)
        items[str(row["product_id"])] = rating
    return items


async def build_item_user_matrix():
    """
    Build item -> users mapping for item-based CF.
    """
    cursor = await interactions_collection.find({}).to_list(None)
    item_users = defaultdict(dict)
    weight = {"view": 1.0, "cart": 2.0, "favorite": 2.5, "purchase": 3.0}

    for row in cursor:
        rating = row.get("rating") or weight.get(row.get("action"), 1.0)
        item_users[str(row["product_id"])][str(row["user_id"])] = rating
    return item_users


def cosine_similarity(vec1, vec2):
    if not vec1 or not vec2:
        return 0.0
    v1 = np.array(list(vec1.values()))
    v2 = np.array([vec2.get(k, 0) for k in vec1.keys()])
    denom = (np.linalg.norm(v1) * np.linalg.norm(v2))
    return float(np.dot(v1, v2) / denom) if denom else 0.0


async def recommend(user_id: Optional[str] = None, N: int = 10) -> List[str]:
    """
    Recommend item IDs only.
    - If user_id given and user has history → personalized CF.
    - Else → fallback to popular items.
    
    Returns: List of product IDs (strings)
    """
    if user_id:
        user_items = await get_user_items(user_id)  # e.g. dict {item_id: weight}
        if user_items:  # ✅ Personalized recommendation
            item_users = await build_item_user_matrix()  # e.g. {item_id: vector_of_users}
            scores = defaultdict(float)

            for item_id in user_items:
                for other_item, users in item_users.items():
                    if other_item == item_id or other_item in user_items:
                        continue
                    sim = cosine_similarity(item_users[item_id], users)
                    scores[other_item] += sim * user_items[item_id]

            ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)
            return [item_id for item_id, _ in ranked[:N]]

    # ❄ Cold start / no user_id / no history → popular item
    pipeline = [
        {"$match": {"product_id": {"$exists": True, "$ne": None}}},
        {"$group": {"_id": "$product_id", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": N}
    ]
    cursor =await interactions_collection.aggregate(pipeline)
    popular = await cursor.to_list(length=N)

    if not popular:
        return []

    return [str(doc["_id"]) for doc in popular if doc["_id"] is not None]