from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes.reviews import router as review_router

# Create FastAPI application
app = FastAPI(
    title="Deep Critic",
    description="API for reviewing academic papers using multiple LLMs",
    version="0.1.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(review_router, prefix="/api")

@app.get("/health")
async def health_check():
    return {"status": "healthy"}