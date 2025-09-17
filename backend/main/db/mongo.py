import pymongo
from main.core.config import settings
client = pymongo.AsyncMongoClient("mongodb+srv://testing938212:Jarvis123@cluster0.df3gouo.mongodb.net/")
db = client["e-commerce"]
users_collection = db["users"]
products_collection = db["products"] 
interactions_collection = db["interactions"]
