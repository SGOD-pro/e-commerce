# schema/graphql.py
from typing import List, Optional, Dict, Any, Tuple
import strawberry
from strawberry.fastapi import GraphQLRouter
from strawberry.experimental.pydantic import type as pydantic_type
from graphql import GraphQLError
from strawberry.types import Info
from fastapi import HTTPException
from bson import ObjectId
from main.db.mongo import products_collection,interactions_collection
from main.models.products import Product as ProductModel, ProductImage as ProductImageModel
from main.recommender.engine import search_products
from main.models.interactions import InteractionCreate
import datetime
# ---------- GraphQL types ----------
@pydantic_type(model=ProductImageModel, all_fields=True)
class ProductImageType:
    pass

@pydantic_type(model=ProductModel, fields=["title","description","features","categories","store","brand","material","color","average_rating","rating_number","price","images"])
class ProductType:
    id: strawberry.ID

@strawberry.type
class CategoryType:
    name: str
    count: int
    image: str   # not List[str], pick just one image


# ---------- Helpers ----------
def doc_to_product(doc: Optional[Dict[str, Any]]) -> Optional[ProductType]:
    if not doc:
        return None

    oid = doc.get("_id")
    if not oid:
        return None

    # Always assign string id
    str_id = str(oid)

    # Use ProductModel to validate base fields
    pydantic_product = ProductModel(**doc)

    # Convert to dict
    pdata = pydantic_product.dict()
    pdata.pop("_id", None)

    # Convert images into ProductImageType objects
    images_data = pdata.get("images") or []
    image_objs = []
    for img in images_data:
        if not img:
            continue
        image_objs.append(
            ProductImageType(
                thumb=img.get("thumb"),
                large=img.get("large"),
                variant=img.get("variant"),
                hi_res=img.get("hi_res"),
            )
        )

    # Now build ProductType directly
    return ProductType(
        id=str_id,
        title=pdata.get("title"),
        description=pdata.get("description"),
        features=pdata.get("features"),
        categories=pdata.get("categories"),
        store=pdata.get("store"),
        brand=pdata.get("brand"),
        material=pdata.get("material"),
        color=pdata.get("color"),
        average_rating=pdata.get("average_rating"),
        rating_number=pdata.get("rating_number"),
        price=pdata.get("price"),
        images=image_objs,
    )


def build_filter(
    categories: Optional[List[str]] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    min_rating: Optional[float] = None,
    rating_number:Optional[int]=None
) -> dict:
    f = {}
    if categories:
        f["categories"] = {"$in": categories}
    price_q = {}
    if min_price is not None:
        price_q["$gte"] = min_price
    if max_price is not None:
        price_q["$lte"] = max_price
    if price_q:
        f["price"] = price_q
    if min_rating is not None:
        f["average_rating"] = {"$gte": min_rating}
    if rating_number is not None:
        f["rating_number"] = {"$gte": rating_number}
    # if search:
    #     # requires text index on title & description
    #     f["$text"] = {"$search": search}
    return f


def build_sort(sort_by: Optional[str], sort_dir: int) -> List[Tuple[str, int]]:
    allowed = {
        "id": ("_id", sort_dir),
        "price": ("price", sort_dir),
        "average_rating": ("average_rating", sort_dir),
        "title": ("title", sort_dir),
        "rating_number": ("rating_number", sort_dir),
    }
    if sort_by and sort_by in allowed:
        return [allowed[sort_by]]
    return [("_id", -1)]

def to_mongo_doc(interaction: InteractionCreate) -> dict:
    doc= {
        "user_id": ObjectId(interaction.user_id),
        "action": interaction.action,
        "timestamp": interaction.timestamp
    }
    if interaction.product_id:
        doc["product_id"] = ObjectId(interaction.product_id)
    return doc
# ---------- Selection projection helper (optional) ----------
def get_requested_fields(info: Info) -> List[str]:
    """
    Walk the GraphQL AST to extract top-level selected fields (non-nested).
    Use this to create a Mongo projection dict so mongo only returns requested fields.
    """
    fields = []
    field_nodes = info.field_nodes or []
    for node in field_nodes:
        sel_set = getattr(node, "selection_set", None)
        if not sel_set:
            continue
        for sel in sel_set.selections:
            name = getattr(sel, "name", None)
            if name is None:
                if hasattr(sel, "name") and hasattr(sel.name, "value"):
                    fields.append(sel.name.value)
            else:
                if hasattr(name, "value"):
                    fields.append(name.value)
                else:
                    fields.append(name)
    normalized = []
    for f in fields:
        if f == "id":
            normalized.append("_id")
        else:
            normalized.append(f)
    return normalized


FIELD_MAP = {
    "averageRating": "average_rating",
    "ratingNumber": "rating_number",
    # add more mappings if needed
}

def make_projection(fields: List[str]) -> Optional[Dict[str, int]]:
    if not fields:
        return {"_id": 1}  # always keep id

    proj: Dict[str, int] = {"_id": 1}
    for f in fields:
        mongo_field = FIELD_MAP.get(f, f)  # fallback to same name if not mapped
        proj[mongo_field] = 1
    return proj



# ---------- GraphQL Query ----------
@strawberry.type
class Query:

    @strawberry.field
    async def product_by_id(
        self,
        id: strawberry.ID,
        info: Info,
    ) -> Optional[ProductType]:
        print("by id");
        try:
            oid = ObjectId(str(id))
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid id")
        
        projection = make_projection(get_requested_fields(info))
        doc = await products_collection.find_one({"_id": oid}, projection=projection)
        user = info.context.get("user")
        if user and doc:
            interaction = InteractionCreate(
                user_id=str(user),     # ensure string
                product_id=str(oid),   # ensure string
                action="view",
                timestamp=datetime.datetime.now()
            )

            mongo_doc = to_mongo_doc(interaction)
            await interactions_collection.insert_one(mongo_doc)
        if not doc:
            return None
        
        # fallback if _id not projected
        if "_id" not in doc and projection is not None:
            doc = await products_collection.find_one({"_id": oid})
        
        return doc_to_product(doc)


    @strawberry.field
    async def products(
        self,
        info: Info,
        categories: Optional[List[str]] = None,
        min_price: Optional[float] = 1,
        max_price: Optional[float] = None,
        min_rating: Optional[float] = 1,
        rating_number: Optional[int] = 0,
        search: Optional[str] = None,
        sort_by: Optional[str] = "id",
        sort_dir: int = -1,
        limit: int = 20,
        offset: int = 0,
    ) -> List[ProductType]:
        """
            Hybrid search:
            - If `search` is provided -> semantic search from Qdrant
            - Apply Mongo filters on final candidate set
            - Otherwise fallback to Mongo filter + sort
        """
        results: List[ProductType] = []

        mongo_ids: List[ObjectId] = []
        if search:
            try:
                mongo_ids = await search_products(search, limit)
            except Exception as e:  # catch ConnectError or any IO error
                # log server-side
                print("Search backend failed:", repr(e))
                # raise safe GraphQL error
                raise GraphQLError(
                    "Search service unavailable, please try again later",
                    original_error=e,
                    extensions={"code": "SEARCH_UNAVAILABLE"}
                )
            


        f = build_filter(categories, min_price, max_price, min_rating,rating_number) 
        if mongo_ids:
            f["_id"] = {"$in": mongo_ids}
        sort_spec = build_sort(sort_by, sort_dir) 
        requested = get_requested_fields(info) 
        projection = make_projection(requested)
        print(f)
        docs = await products_collection.find(f, projection=projection).sort(sort_spec).skip(offset).limit(limit).to_list(length=limit)
        
        print("docs",len(docs))
        for d in docs: 
            p = doc_to_product(d) 
            if p: 
                results.append(p) 
        
        return results
    
    @strawberry.field
    async def all_categories(self) -> List[CategoryType]:
            pipeline = [
            {
                "$group": {
                    "_id": "$main_category",
                    "count": {"$sum": 1},
                    "images": {"$first": "$images"} 
                }
            },
            {
                "$sort": {
                    "count": -1
                }
            },
            {
                "$project": {
                    "_id": 0,
                    "name": "$_id",
                    "count": 1,
                    # pick only the first thumb inside the images array
                    "image": {"$arrayElemAt": ["$images.large", 0]}
                }
            }
        ]

            cats_cursor = await products_collection.aggregate(pipeline)
            cats = await cats_cursor.to_list(length=7)
            
            return [CategoryType(**c) for c in cats]


from fastapi import Request
from main.auth.dependencies import auth_middleware
async def get_context(request: Request):
    user = None
    try:
        user = await auth_middleware(request)
        print(user)
    except HTTPException:
        pass
    return {"user": user["user_id"] if user else None}

schema = strawberry.Schema(query=Query)

graphql_router = GraphQLRouter(schema,context_getter=get_context)
