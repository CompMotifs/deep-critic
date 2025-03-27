import re


def parse_llm_feedback(text: str) -> dict:
    """
    Parse a single LLM feedback string into its component fields.
    Expected sections:
      Summary:
      Soundness:
      Presentation:
      Contribution:
      Strengths:
      Weaknesses:
      Questions:
      Limitations:
      Rating:

    Returns a dictionary with the parsed values.
    """
    # Define a regex pattern for each field.
    patterns = {
        "summary": r"Summary:\s*(.*?)(?=\n\S+?:|$)",
        "soundness": r"Soundness:\s*([0-5])",
        "presentation": r"Presentation:\s*([0-5])",
        "contribution": r"Contribution:\s*([0-5])",
        "strengths": r"Strengths:\s*(.*?)(?=\n\S+?:|$)",
        "weaknesses": r"Weaknesses:\s*(.*?)(?=\n\S+?:|$)",
        "questions": r"Questions:\s*(.*?)(?=\n\S+?:|$)",
        "limitations": r"Limitations:\s*(.*?)(?=\n\S+?:|$)",
        "rating": r"Rating:\s*([0-9]{1,2})",
    }

    feedback = {}
    for key, pattern in patterns.items():
        match = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
        if match:
            value = match.group(1).strip()
            if key in ["soundness", "presentation", "contribution"]:
                try:
                    feedback[key] = int(value)
                except ValueError:
                    feedback[key] = None
            elif key == "rating":
                try:
                    feedback[key] = int(value)
                except ValueError:
                    feedback[key] = None
            else:
                feedback[key] = value
        else:
            feedback[key] = None
    return feedback
