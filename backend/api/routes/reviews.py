from concurrent.futures import ThreadPoolExecutor
from fastapi import APIRouter, UploadFile, File, HTTPException
from api.llms.openai_client import get_openai_review
from api.llms.claude_client import get_claude_review
from api.llms.mistral_client import get_mistral_review
from review_prompt import REVIEW_PROMPT
from marker.converters.pdf import PdfConverter
from marker.models import create_model_dict
from marker.output import text_from_rendered
import json
import re
import tempfile

router = APIRouter()

def parse_json_response(response_text):
    # Strip markdown code block if present
    json_match = re.search(r"```json\n(.*?)\n```", response_text, re.DOTALL)
    if json_match:
        response_text = json_match.group(1)

    return json.loads(response_text)

def convert_pdf_bytes_to_markdown(pdf_bytes):
    with tempfile.NamedTemporaryFile(suffix=".pdf") as tmp_pdf:
        tmp_pdf.write(pdf_bytes)
        tmp_pdf.flush()

        converter = PdfConverter(artifact_dict=create_model_dict())

        # Run converter on the temporary PDF file path
        rendered = converter(tmp_pdf.name)

        # Get text (markdown), images, tables
        markdown_text, _, images = text_from_rendered(rendered)

    return markdown_text, images

@router.post("/upload-and-review")
async def upload_and_review(pdf_file: UploadFile = File(...)):
    # Read PDF content directly into memory
    content = await pdf_file.read()

    # Convert PDF to Markdown directly from memory
    try:
        markdown_text, images = convert_pdf_bytes_to_markdown(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF conversion failed: {str(e)}")

    # Call LLM APIs in parallel for fast response
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
