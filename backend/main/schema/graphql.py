# schema/graphql.py
from typing import List, Optional, Dict, Any, Tuple
import strawberry
from strawberry.fastapi import GraphQLRouter
from strawberry.experimental.pydantic import type as pydantic_type
# from graphql import Info
from strawberry.types import Info 
from fastapi import HTTPException
from bson import ObjectId

from main.db.mongo import products_collection  # -> from db.mongo import products_coll
# from models.products import ProductModel  # optionally for pydantic-based validations
from main.models.products import Product as ProductModel, ProductImage as ProductImageModel

# ---------- GraphQL types ----------
@pydantic_type(model=ProductImageModel, all_fields=True)
class ProductImageType:
    pass

@pydantic_type(model=ProductModel, fields=["title","description","features","categories","store","brand","material","color","average_rating","rating_number","price","images"])
class ProductType:
    id: strawberry.ID



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
    search: Optional[str] = None,
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
    if search:
        # requires text index on title & description
        f["$text"] = {"$search": search}
    return f


def build_sort(sort_by: Optional[str], sort_dir: int) -> List[Tuple[str, int]]:
    allowed = {
        "id": ("_id", sort_dir),
        "price": ("price", sort_dir),
        "rating": ("average_rating", sort_dir),
        "title": ("title", sort_dir),
        "rating_number": ("rating_number", sort_dir),
    }
    if sort_by and sort_by in allowed:
        return [allowed[sort_by]]
    return [("_id", -1)]


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
    async def product_by_id(self, id: strawberry.ID, info: Info) -> Optional[ProductType]:
        try:
            oid = ObjectId(str(id))
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid id")
        projection = make_projection(get_requested_fields(info))
        doc = await products_collection.find_one({"_id": oid}, projection=projection)
        if not doc:
            return None
        # ensure _id present for id
        if "_id" not in doc and projection is not None:
            # if projection omitted _id, fetch it
            doc = await products_collection.find_one({"_id": oid})
        return doc_to_product(doc)


    @strawberry.field
    async def products(
        self,
        info: Info,
        categories: Optional[List[str]] = None,
        min_price: Optional[float] = 10,
        max_price: Optional[float] = None,
        min_rating: Optional[float] = 1,
        search: Optional[str] = None,
        sort_by: Optional[str] = "id",
        sort_dir: int= -1,
        limit: int = 20,
        offset: int = 0,
    ) -> List[ProductType]:
            print("products")
            f = build_filter(categories, min_price, max_price, min_rating, search)
            print(f)
            sort_spec = build_sort(sort_by, sort_dir)
            requested = get_requested_fields(info)
            projection = make_projection(requested)
            # fetch documents with projection to reduce I/O
            cursor = products_collection.find(f, projection=projection).sort(sort_spec).skip(offset).limit(limit)
            docs = await cursor.to_list(length=limit)
        # if projection removed _id for id mapping, we should fetch original doc or set id manually (we ensure _id in projection)
        # doc_to_product expects _id present  results: List[ProductType] = []
            print("docs",docs[0])
            results: List[ProductType] = []
            for d in docs:
                p = doc_to_product(d)
                if p:
                        results.append(p)
            print(results[0])
            return results

    @strawberry.field
    async def products_count(
        self,
        categories: Optional[List[str]] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        min_rating: Optional[float] = None,
        search: Optional[str] = None,
    ) -> int:
        f = build_filter(categories, min_price, max_price, min_rating, search)
        return await products_collection.count_documents(f)

    @strawberry.field
    async def all_categories(self) -> List[str]:
        cats = await products_collection.aggregate([{
                                                       "$group": {
                                                            "_id": "$main_category",
                                                       }
                                                  }])
        cats=await cats.to_list()

        seen = set(cats)
        uniq = list(seen)
        return uniq

schema = strawberry.Schema(query=Query)

graphql_router = GraphQLRouter(schema)
