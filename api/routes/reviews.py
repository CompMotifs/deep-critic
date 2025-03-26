from fastapi import APIRouter
from pydantic import BaseModel
from api.llms.openai_client import get_openai_review
from api.llms.claude_client import get_claude_review
from api.llms.mistral_client import get_mistral_review
from api.prompts.review_prompt import REVIEW_PROMPT
import re
import json

router = APIRouter()

class PaperRequest(BaseModel):
    paper_text: str

@router.post("/review")
async def review_paper(request: PaperRequest):
    paper_text = request.paper_text

    # Call LLMs in parallel for faster responses
    from concurrent.futures import ThreadPoolExecutor

    with ThreadPoolExecutor() as executor:
        futures = {
            "openai": executor.submit(get_openai_review, paper_text, REVIEW_PROMPT),
            "claude": executor.submit(get_claude_review, paper_text, REVIEW_PROMPT),
            "mistral": executor.submit(get_mistral_review, paper_text, REVIEW_PROMPT),
        }

    results = {}
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

def parse_json_response(response_text):
    json_match = re.search(r"```json\n(.*?)\n```", response_text, re.DOTALL)
    if json_match:
        response_text = json_match.group(1)

    return json.loads(response_text)
