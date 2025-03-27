from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes.reviews import router as review_router
from app.config import APP_NAME, API_PREFIX, CORS_ORIGINS

# Create FastAPI application
app = FastAPI(
    title=APP_NAME,
    description="API for reviewing academic papers using multiple LLMs",
    version="0.1.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(review_router, prefix=API_PREFIX)

@app.get("/health")
async def health_check():
    return {"status": "healthy"}