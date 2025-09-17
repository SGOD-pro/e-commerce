from fastapi import APIRouter, Depends
from main.db.mongo import products_collection
from main.db.redis import redis_client
from main.schema.graphql import graphql_router  # import your GraphQL router
from main.recommender.engine import recommend_similar_products

router = APIRouter()

router.include_router(graphql_router, prefix="/graphql")

@router.get("/ping")
async def ping():
    return {"message": "pong"}

@router.get("/recommend-items/{product_id}")
async def recommend_items(product_id: str, limit: int = 10):
    res=await recommend_similar_products(product_id, limit)
    return {"products":res}
# @router.get("/recommend/hybrid/{user_id}/{product_id}")
# async def api_recommend_hybrid(user_id: str, product_id: str, limit: int = 10):
    # --- Step 1: Collaborative Filtering candidates ---
    # cf_candidates = recommend_cf(user_id, N=limit*3)  # [(pid, score)]

    # # --- Step 2: Semantic (embedding-based) candidates ---
    # prod = await products_collection.find_one({"_id": ObjectId(product_id)})
    # if not prod:
    #     raise HTTPException(status_code=404, detail="Product not found")

    # text = build_text(prod)
    # vector_store = QdrantVectorStore(
    #     client=qdrant_client,
    #     collection_name=settings.QDRANT_COLLECTION,
    #     embedding=embeddings,
    # )
    # sem_docs = await vector_store.asimilarity_search(query=text, k=limit*5)
    # sem_candidates = [(d.metadata["id"], d.score) for d in sem_docs]

    # # --- Step 3: Merge ---
    # ranked = merge_cf_semantic(cf_candidates, sem_candidates, alpha=0.7, beta=0.3)

    # # --- Step 4: Fetch products from Mongo ---
    # top_pids = [pid for pid, _ in ranked][:limit]
    # mongo_products = await products_collection.find({
    #     "_id": {"$in": [ObjectId(pid) for pid in top_pids]}
    # }).to_list(length=limit)

    # # Preserve ranking order
    # order = {pid: i for i, pid in enumerate(top_pids)}
    # mongo_products.sort(key=lambda d: order.get(str(d["_id"]), 999))

    # return {
    #     "user_id": user_id,
    #     "product_id": product_id,
    #     "recommendations": mongo_products,
    # }