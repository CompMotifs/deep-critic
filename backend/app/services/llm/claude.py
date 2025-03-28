import anthropic
import os
from dotenv import load_dotenv

load_dotenv()

anthropic_client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

append_str = """Respond **only** with JSON following this exact schema:
{
  "summary": "...",
  "soundness": 5,
  "presentation": 5,
  ...
}
Do not include any introductory text or explanations."""

def get_claude_review(paper_text, prompt):
    message = anthropic_client.messages.create(
        model="claude-3-5-haiku-latest",
        max_tokens=1000,
        temperature=0.3,
        messages=[{"role": "user", "content": f"{prompt}\n\nPaper:\n{paper_text}"}],
    )
    return message.content[0].text.strip()


def get_updated_claude_review(paper_text, prompt, review1, review2):
    message = anthropic_client.messages.create(
        model="claude-3-haiku-20240307",
        max_tokens=1000,
        temperature=0.3,
        messages=[
            {"role": "user", "content": f"{append_str}\n\n{prompt}\n\nPaper:\n{paper_text}"}
        ],
    )
    #print("prompt", {"role": "user", "content": f"{prompt}\n\nPaper:\n{paper_text}"})
    #print("message.content", message.content)
    return message.content[0].text.strip()
