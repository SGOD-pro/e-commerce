from typing import List, Optional
from pydantic import BaseModel, Field
from bson import ObjectId


class ProductImage(BaseModel):
    thumb: Optional[str] = None
    large: Optional[str]=None
    variant: Optional[str] = None
    hi_res: Optional[str] = None


class Product(BaseModel):
    _id: Optional[ObjectId]
    title: str
    description: Optional[List[str]] = None
    features: Optional[List[str]] = None
    categories: List[str]
    main_category: Optional[str] = None
    store: Optional[str] = None
    brand: Optional[str] = None
    material: Optional[str] = None
    color: Optional[str] = None
    average_rating: Optional[float] = None
    rating_number: Optional[int] = None
    price: Optional[float] = None
    images: Optional[List[ProductImage]] = None
