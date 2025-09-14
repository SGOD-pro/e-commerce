import pymongo
from main.core.config import settings
client = pymongo.AsyncMongoClient(settings.MONGO_URI)
db = client[settings.MONGO_DB]
user_collection = db["users"]
products_collection = db["products"] 
interactions_collection = db["interactions"]
