from openai import OpenAI
from outputparser.structure import Review


def call_conversion_llm(context: str, prompt: str) -> str:
    """
    Call an LLM to convert the aggregated feedback into an OpenReview style review.
    """
    client = OpenAI()

    completion = client.beta.chat.completions.parse(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": context},
            {"role": "user", "content": prompt},
        ],
        response_format=Review,
    )
    return completion.choices[0].message.parsed


def convert_to_openreview(aggregated_data: dict) -> str:
    """
    Convert aggregated feedback data into an OpenReview style review.
    aggregated_data should have keys:
      summary, soundness, presentation, contribution,
      strengths, weaknesses, questions, limitations, rating, confidence
    """
    # Create a prompt that includes all the aggregated details.
    context = (
        "Using the following aggregated feedback, produce a final OpenReview style review "
        "with the sections: Summary; Soundness, Presentation and Contribution (scores from 1 to 5); "
        "Strengths and Weaknesses; Questions; Limitations; Rating (score from 1 to 10); Confidence."
    )
    prompt = (
        f"Summary: {aggregated_data.get('summary')}\n"
        f"Soundness: {aggregated_data.get('soundness')}\n"
        f"Presentation: {aggregated_data.get('presentation')}\n"
        f"Contribution: {aggregated_data.get('contribution')}\n"
        f"Strengths: {aggregated_data.get('strengths')}\n"
        f"Weaknesses: {aggregated_data.get('weaknesses')}\n"
        f"Questions: {aggregated_data.get('questions')}\n"
        f"Limitations: {aggregated_data.get('limitations')}\n"
        f"Rating: {aggregated_data.get('rating')}\n"
        f"Confidence: {aggregated_data.get('confidence')}\n"
    )
    return call_conversion_llm(context, prompt)
