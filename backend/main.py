from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import reviews
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
app.include_router(reviews.router, prefix=API_PREFIX)

@app.get("/health")
async def health_check():
    return {"status": "healthy"}


# backend/api/routes/reviews.py
from fastapi import APIRouter, UploadFile, File, HTTPException
import json

from app.review_engine.orchestrator import ReviewEngine

router = APIRouter()
review_engine = ReviewEngine()

@router.post("/upload-and-review")
async def upload_and_review(pdf_file: UploadFile = File(...)):
    """
    Upload a PDF file and get reviews from multiple LLMs with a consensus review.
    """
    # Validate file type
    if not pdf_file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be a PDF")
    
    # Read PDF content
    content = await pdf_file.read()
    
    try:
        # Process the PDF through the review engine
        result = await review_engine.process_paper(content)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Review process failed: {str(e)}")

@router.post("/review")
async def review_text(request: dict):
    """
    Submit paper text directly for review.
    This endpoint is useful for testing or when paper content is already available.
    """
    paper_text = request.get("paper_text")
    if not paper_text:
        raise HTTPException(status_code=400, detail="Paper text is required")
    
    try:
        # Skip the PDF conversion step and just process the text
        individual_reviews = await review_engine._get_all_reviews(paper_text)
        
        # For this simplified endpoint, just return the individual reviews
        return individual_reviews
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Review process failed: {str(e)}")