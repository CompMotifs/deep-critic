from fastapi import APIRouter, UploadFile, File, HTTPException, Body
from app.review_engine.orchestrator import ReviewEngine
from pydantic import BaseModel

# Import the review prompt
import sys
sys.path.append('.')  # Add root directory to path
from review_prompt import REVIEW_PROMPT

router = APIRouter()

# Initialize the review engine with our prompt
review_engine = ReviewEngine(REVIEW_PROMPT)

class PaperTextRequest(BaseModel):
    paper_text: str

@router.post("/upload-and-review")
async def upload_and_review(pdf_file: UploadFile = File(...)):
    """
    Upload a PDF file and get reviews from multiple LLMs with a consensus review.
    
    Args:
        pdf_file: The uploaded PDF file
        
    Returns:
        Dictionary with individual reviews and consensus review
    """
    # Validate file type
    if not pdf_file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be a PDF")
    
    # Read PDF content
    try:
        content = await pdf_file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read PDF: {str(e)}")
    
    try:
        # Process the PDF through the review engine
        result = await review_engine.process_pdf(content)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Review process failed: {str(e)}")

@router.post("/review")
async def review_text(request: PaperTextRequest):
    """
    Submit paper text directly for review.
    
    Args:
        request: JSON request containing paper_text
        
    Returns:
        Dictionary with individual reviews and consensus review
    """
    if not request.paper_text:
        raise HTTPException(status_code=400, detail="Paper text is required")
    
    try:
        # Process the text through the review engine
        result = await review_engine.process_text(request.paper_text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Review process failed: {str(e)}")