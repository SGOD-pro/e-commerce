from pydantic import BaseModel,Field
from typing import Optional,Literal
from datetime import datetime 
# ✅ For requests (creating a new interaction)
class InteractionCreate(BaseModel):
    user_id: str   # ObjectId but as string in requests
    product_id: str
    action: Literal["favorite", "cart", "purchase", "view"] = "view"
    timestamp: datetime

# ✅ For responses (returning interaction with ID & timestamp)
class InteractionResponse(BaseModel):
    id: str = Field(alias="_id")
    user_id: str
    product_id: str
    action: str
    timestamp: datetime

