from typing import Dict, Any
import uuid
import time
import os
from pathlib import Path

# Create a directory for storing files
STORAGE_DIR = Path("./tmp_storage")
STORAGE_DIR.mkdir(exist_ok=True)

# In-memory storage for job tracking
processing_jobs = {}

def create_job(filename: str, job_type: str = "pdf_upload") -> str:
    """Create a new processing job and return its ID"""
    job_id = str(uuid.uuid4())
    processing_jobs[job_id] = {
        "filename": filename,
        "job_type": job_type,
        "status": "pending",
        "created_at": time.time(),
        "completed_at": None,
        "error": None
    }
    return job_id

def update_job_status(job_id: str, status: str, **kwargs) -> None:
    """Update job status and additional fields"""
    if job_id in processing_jobs:
        processing_jobs[job_id]["status"] = status
        
        if status == "completed":
            processing_jobs[job_id]["completed_at"] = time.time()
        
        # Update any additional fields
        for key, value in kwargs.items():
            processing_jobs[job_id][key] = value

def get_job(job_id: str) -> Dict[str, Any]:
    """Get job details by ID"""
    return processing_jobs.get(job_id, {"status": "not_found"})

def save_markdown(job_id: str, markdown_text: str) -> str:
    """Save markdown text to a file and return the file path"""
    filepath = STORAGE_DIR / f"{job_id}.md"
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(markdown_text)
    return str(filepath)

def load_markdown(job_id: str) -> str:
    """Load markdown text from a file"""
    filepath = STORAGE_DIR / f"{job_id}.md"
    if os.path.exists(filepath):
        with open(filepath, "r", encoding="utf-8") as f:
            return f.read()
    return ""