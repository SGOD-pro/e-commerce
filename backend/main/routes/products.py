from fastapi import APIRouter, Depends
from main.db.mongo import products_collection
from main.db.redis import redis_client
from main.schema.graphql import graphql_router  # import your GraphQL router
import json

router = APIRouter()

router.include_router(graphql_router, prefix="/graphql")

@router.get("/ping")
async def ping():
    return {"message": "pong"}


@router.get("/")
async def get_products(limit: int = 10):
    cache_key = f"products:{limit}"

#     cached = await redis_client.get(cache_key)
#     if cached:
#         return json.loads(cached) 

    # cursor = products_collection.find().limit(limit)
    cursor = await products_collection.aggregate([
        {"$sample": {"size": limit}},
        {"$project": 
            {"_id": 1, "title": 1, "description": 1, "features": 1, "categories": 1, "average_rating": 1, "store": 1, "price": 1,"images": 1}
        }
        ])
    products = []
    async for p in cursor:
        p["_id"] = str(p["_id"])
        products.append(p)

#     await redis_client.setex(cache_key, 300, json.dumps(products))

    return products