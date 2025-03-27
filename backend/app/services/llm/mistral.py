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
    messages = [
        {
            'role': 'user',
            'content': f"{prompt}\n\nPaper:\n{paper_text}"
        }
    ]
    
    chat_response = client.chat.complete(
        model="mistral-small-latest",
        messages=messages
    )

    return chat_response.choices[0].message.content.strip()