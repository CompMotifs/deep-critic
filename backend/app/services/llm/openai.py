from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=api_key)


def get_openai_review(paper_text, prompt):
    messages = [{"role": "user", "content": f"{prompt}\n\nPaper:\n{paper_text}"}]
    response = client.chat.completions.create(
        model=os.getenv("OPENAI_MODEL"),
        messages=messages,
        temperature=0.3,
    )
    return response.choices[0].message.content.strip()


def get_updated_openai_review(paper_text, prompt, review1, review2):
    messages = [
        {
            "role": "system",
            "content": str(prompt),
        },
        {
            "role": "user",
            "content": f"Review 1:\n{review1}\n\nReview 2:\n{review2}\n\nPaper:\n{paper_text}",
        },
    ]
    response = client.chat.completions.create(
        model=os.getenv("OPENAI_MODEL"),
        messages=messages,
        temperature=0.3,
    )
    return response.choices[0].message.content.strip()
