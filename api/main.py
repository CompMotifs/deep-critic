from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes.reviews import router as review_router

app = FastAPI()

# Allow cross-origin requests (adjust in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API route
app.include_router(review_router, prefix="/api")
