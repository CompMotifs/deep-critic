from fastapi import APIRouter, UploadFile, File, HTTPException
import os
from api.converters.pdf_to_markdown import convert_pdf_to_markdown
from api.llms.openai_client import get_openai_review
from api.llms.claude_client import get_claude_review
from api.llms.mistral_client import get_mistral_review
from api.prompts.review_prompt import REVIEW_PROMPT
import json
import re

router = APIRouter()

def parse_json_response(response_text):
    # Strip markdown code block if present
    json_match = re.search(r"```json\n(.*?)\n```", response_text, re.DOTALL)
    if json_match:
        response_text = json_match.group(1)

    return json.loads(response_text)

@router.post("/upload-and-review")
async def upload_and_review(pdf_file: UploadFile = File(...)):
    #///handle request
    # Save uploaded PDF temporarily
    pdf_dir = "data/pdfs"
    os.makedirs(pdf_dir, exist_ok=True)
    pdf_path = os.path.join(pdf_dir, pdf_file.filename)
    
    content = await pdf_file.read()
    with open(pdf_path, "wb") as f:
        f.write(content)

    # Convert PDF to Markdown
    try:
        markdown_text, images = convert_pdf_to_markdown(pdf_path, output_dir="data/markdown")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF conversion failed: {str(e)}")

    # Call LLM APIs in parallel for fast response
    from concurrent.futures import ThreadPoolExecutor

    with ThreadPoolExecutor() as executor:
        futures = {
            "openai": executor.submit(get_openai_review, markdown_text, REVIEW_PROMPT),
            "claude": executor.submit(get_claude_review, markdown_text, REVIEW_PROMPT),
            "mistral": executor.submit(get_mistral_review, markdown_text, REVIEW_PROMPT),
        }

    # Gather and parse responses
    results = {}
    for name, future in futures.items():
        try:
            response_text = future.result()
            results[name] = parse_json_response(response_text)
        except json.JSONDecodeError:
            results[name] = {"error": "Invalid JSON response", "raw": response_text}
        except Exception as e:
            results[name] = {"error": str(e)}

    return results
