import os
from mistralai import Mistral
from dotenv import load_dotenv

load_dotenv()

MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
client = Mistral(api_key=MISTRAL_API_KEY)


def get_mistral_review(paper_text, prompt):
    """
    Get a review of a paper from the Mistral API.

    Args:
        paper_text: The text content of the paper
        prompt: The review prompt template

    Returns:
        The raw response from the Mistral API
    """
    # Correct format: messages should be a list of message objects
    messages = [{"role": "user", "content": f"{prompt}\n\nPaper:\n{paper_text}"}]

    chat_response = client.chat.complete(
        model="mistral-small-latest", messages=messages
    )

    return chat_response.choices[0].message.content.strip()


def get_updated_mistral_review(paper_text, prompt, review1, review2):
    """
    Get an updated review of a paper from the Mistral API.

    Args:
        paper_text: The text content of the paper
        prompt: The review prompt template
        review1: The first review
        review2: The second review

    Returns:
        The raw response from the Mistral API
    """
    messages = [
        {"role": "system", "content": prompt},
        {
            "role": "user",
            "content": f"Review 1:\n{review1}\n\nReview 2:\n{review2}\n\nPaper:\n{paper_text}",
        },
    ]

    chat_response = client.chat.complete(
        model="mistral-small-latest", messages=messages
    )

    return chat_response.choices[0].message.content.strip()
