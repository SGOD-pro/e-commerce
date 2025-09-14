import fastapi
import uvicorn
from .core.exception import setup_exception_handlers
from .routes import auth, products, recommendation as recommend
from fastapi.middleware.cors import CORSMiddleware
# from .core.config import settings
from qdrant_client.http.exceptions import UnexpectedResponse
from .recommender.embeddings import index_categories

app=fastapi.FastAPI(title="E-commerce Recommender API")
setup_exception_handlers(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins; replace with specific origins in production
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)
# Routes
# app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(products.router, prefix="/products", tags=["products"])
# app.include_router(recommend.router, prefix="/recommend", tags=["recommend"])
# @app.on_event("startup")
# async def startup_event():
#     import asyncio
#     asyncio.create_task(index_categories())
#     print("Started background indexing...")
    # try:
    #     await index_products();
    # except UnexpectedResponse as e:
    #     print(f"Error connecting to Qdrant: {e}")
        

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)