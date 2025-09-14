from pydantic_settings import BaseSettings

class Settings(BaseSettings):
     PROJECT_NAME: str = "E-commerce Recommender"
     MONGO_URI: str
     MONGO_DB: str
     REDIS_URL: str
     JWT_SECRET: str
     JWT_ALGORITHM: str = "HS256"
     NIM_API: str
     QDRANT_URL: str
     QDRANT_KEY: str
     QDRANT_COLLECTION: str = "products"
     QDRANT_CATEGORY_COLLECTION: str = "categories"
     class Config:
          env_file = ".env"

settings = Settings() # type: ignore
