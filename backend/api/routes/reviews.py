from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from app.review_engine.orchestrator import ReviewEngine
from app.review_engine.prompt import PROMPT
from app.services.storage import (
    create_job, update_job_status, get_job,
    save_markdown, load_markdown
)
from app.services.converters.pdf import convert_pdf_bytes_to_markdown
from pydantic import BaseModel

router = APIRouter()

# Initialize the review engine with our prompt
review_engine = ReviewEngine(PROMPT)

class PaperTextRequest(BaseModel):
    paper_text: str

async def process_pdf_in_background(job_id: str, content: bytes):
    """Background task to process PDF and store results"""
    try:
        # Convert PDF to markdown
        markdown_text, images = convert_pdf_bytes_to_markdown(content)
        
        # Save markdown to file
        file_path = save_markdown(job_id, markdown_text)
        
        # Update job status
        update_job_status(
            job_id, 
            "completed", 
            markdown_path=file_path,
            image_count=len(images) if images else 0
        )
    except Exception as e:
        # Handle errors
        update_job_status(job_id, "failed", error=str(e))

@router.post("/upload-pdf")
async def upload_pdf(
    background_tasks: BackgroundTasks,
    pdf_file: UploadFile = File(...)
):
    """
    Upload a PDF file and process it in the background.
    
    Args:
        background_tasks: FastAPI background tasks
        pdf_file: The uploaded PDF file
        
    Returns:
        Dictionary with job ID and status
    """
    # Validate file type
    if not pdf_file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be a PDF")
    
    # Read PDF content
    try:
        content = await pdf_file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read PDF: {str(e)}")
    
    # Create a job to track the processing
    job_id = create_job(pdf_file.filename)
    
    # Add processing to background tasks
    background_tasks.add_task(process_pdf_in_background, job_id, content)
    
    # Return job ID for status checking
    return {"job_id": job_id, "status": "processing"}

@router.post("/upload-markdown")
async def upload_markdown(request: PaperTextRequest):
    """
    Upload markdown/text directly for later review.
    
    Args:
        request: JSON request containing paper_text
        
    Returns:
        Dictionary with job ID and ready status
    """
    if not request.paper_text:
        raise HTTPException(status_code=400, detail="Paper text is required")
    
    # Create a job (already completed since no processing needed)
    job_id = create_job("direct_text_input.md", job_type="markdown_upload")
    
    # Save the markdown
    file_path = save_markdown(job_id, request.paper_text)
    
    # Mark as completed immediately
    update_job_status(job_id, "completed", markdown_path=file_path)
    
    return {"job_id": job_id, "status": "completed"}

@router.get("/job-status/{job_id}")
async def check_job_status(job_id: str):
    """Check the status of a processing job"""
    job = get_job(job_id)
    if job.get("status") == "not_found":
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Return a simplified status response
    return {
        "job_id": job_id,
        "status": job.get("status"),
        "job_type": job.get("job_type", "unknown"),
        "filename": job.get("filename", ""),
        "error": job.get("error"),
        "created_at": job.get("created_at"),
        "completed_at": job.get("completed_at")
    }

@router.post("/review-document/{job_id}")
async def review_document(job_id: str):
    """Review a processed document (PDF or markdown)"""
    job = get_job(job_id)
    
    if job.get("status") == "not_found":
        raise HTTPException(status_code=404, detail="Job not found")
        
    if job.get("status") != "completed":
        raise HTTPException(
            status_code=400, 
            detail=f"Document processing not complete. Current status: {job.get('status')}"
        )
    
    try:
        # Load the markdown from file
        markdown_text = load_markdown(job_id)
        if not markdown_text:
            raise HTTPException(status_code=400, detail="Document content not found")
        
        # Process the markdown text through the review engine
        result = await review_engine.process_text(markdown_text)
        
        # Update job with review result status
        update_job_status(job_id, "reviewed")
        
        return result
    except Exception as e:
        update_job_status(job_id, "review_failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Review process failed: {str(e)}")

# Keep original endpoints for backward compatibility

@router.post("/upload-and-review")
async def upload_and_review(pdf_file: UploadFile = File(...)):
    """Upload a PDF file and get reviews synchronously (backward compatibility)"""
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
    """Submit paper text directly for review (backward compatibility)"""
    if not request.paper_text:
        raise HTTPException(status_code=400, detail="Paper text is required")
    
    try:
        # Process the text through the review engine
        result = await review_engine.process_text(request.paper_text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Review process failed: {str(e)}")