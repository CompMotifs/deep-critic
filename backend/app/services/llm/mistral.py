import os
from mistralai import Mistral
from dotenv import load_dotenv

load_dotenv()

MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
client = Mistral(api_key=MISTRAL_API_KEY)

def get_mistral_review(paper_text, prompt):
    messages = {
        'role': 'user',
        'content': f"{prompt}\n\nPaper:\n{paper_text}"
    }
    chat_response = client.chat.complete(
        model="mistral-small-latest",
        messages=messages
    )

    return chat_response.choices[0].message.content.strip()
