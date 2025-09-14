from pydantic import BaseModel
from typing import Optional
from bson import ObjectId

class Interaction(BaseModel):
    id: Optional[ObjectId]
    user_id: str
    product_id: str
    action: str  # e.g., "view", "add_to_cart", "purchase"
    timestamp: Optional[str]
