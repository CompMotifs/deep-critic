import anthropic
import os
from dotenv import load_dotenv

load_dotenv()

anthropic_client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

def get_claude_review(paper_text, prompt):
    message = anthropic_client.messages.create(
        model="claude-3-haiku-20240307",
        max_tokens=1000,
        temperature=0.3,
        messages=[
            {"role": "user", "content": f"{prompt}\n\nPaper:\n{paper_text}"}
        ],
    )
    return message.content[0].text.strip()
