import numpy as np
import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

def aggregate_feedback(parsed_feedbacks: list) -> dict:
    """
    Aggregate parsed feedback from multiple LLM responses.
    For numeric scores, computes the average.
    For text sections, combines the text.
    Computes a confidence score based on the standard deviation of numeric scores.
    """
    # Initialize lists for numeric scores
    soundness_scores = []
    presentation_scores = []
    contribution_scores = []
    rating_scores = []

    summaries = []
    strengths_list = []
    weaknesses_list = []
    questions_list = []
    limitations_list = []

    for fb in parsed_feedbacks:
        if fb.get("soundness") is not None:
            soundness_scores.append(fb["soundness"])
        if fb.get("presentation") is not None:
            presentation_scores.append(fb["presentation"])
        if fb.get("contribution") is not None:
            contribution_scores.append(fb["contribution"])
        if fb.get("rating") is not None:
            rating_scores.append(fb["rating"])

        if fb.get("summary"):
            summaries.append(fb["summary"])
        if fb.get("strengths"):
            strengths_list.append(fb["strengths"])
        if fb.get("weaknesses"):
            weaknesses_list.append(fb["weaknesses"])
        if fb.get("questions"):
            questions_list.append(fb["questions"])
        if fb.get("limitations"):
            limitations_list.append(fb["limitations"])

    # Compute averages
    aggregated = {}
    aggregated["soundness"] = (
        round(np.mean(soundness_scores)) if soundness_scores else None
    )
    aggregated["presentation"] = (
        round(np.mean(presentation_scores)) if presentation_scores else None
    )
    aggregated["contribution"] = (
        round(np.mean(contribution_scores)) if contribution_scores else None
    )
    aggregated["rating"] = round(np.mean(rating_scores)) if rating_scores else None

    # Combine text sections
    aggregated["summary"] = " ".join(summaries)
    aggregated["strengths"] = " ".join(strengths_list)
    aggregated["weaknesses"] = " ".join(weaknesses_list)
    aggregated["questions"] = " ".join(questions_list)
    aggregated["limitations"] = " ".join(limitations_list)

    # Compute confidence based on agreement of numeric scores.
    # Here we compute the mean standard deviation of the three scores.
    stds = []
    for scores in (soundness_scores, presentation_scores, contribution_scores):
        if scores:
            stds.append(np.std(scores))
    if stds:
        avg_std = np.mean(stds)
        # A lower std means higher confidence. Here we map average std to a confidence score out of 10.
        confidence = max(0, round((1 / (1 + avg_std)) * 10, 1))
    else:
        confidence = None
    aggregated["confidence"] = confidence

    return aggregated


def call_conversion_llm(prompt: str) -> str:
    """
    Call an LLM to convert the aggregated feedback into an OpenReview style review.
    """
    client = OpenAI(api_key=OPENAI_API_KEY)

    completion = client.chat.completions.create(
        model="gpt-4o-mini",  # You might want to make this configurable
        messages=[{"role": "user", "content": prompt}]
    )
    return completion.choices[0].message.content


def convert_to_openreview(aggregated_data: dict) -> str:
    """
    Convert aggregated feedback data into an OpenReview style review using an LLM.
    aggregated_data should have keys:
      summary, soundness, presentation, contribution,
      strengths, weaknesses, questions, limitations, rating, confidence
    """
    # Create a prompt that includes all the aggregated details
    prompt = (
        "Using the following aggregated feedback, produce a final OpenReview style review "
        "with the sections: Summary; Soundness, Presentation and Contribution (scores from 1 to 5); "
        "Strengths and Weaknesses; Questions; Limitations; Rating (score from 1 to 10); Confidence.\n\n"
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
    
    # Instead of calling OpenAI, just format the review as a string
    # This is a simplified version that prevents the need for an additional API call
    return format_review(aggregated_data)


def format_review(aggregated_data: dict) -> str:
    """
    Format the aggregated data into a structured review without calling an external API.
    """
    return f"""# Review Summary

{aggregated_data.get('summary', 'No summary provided.')}

## Soundness: {aggregated_data.get('soundness', 'N/A')}/5

## Presentation: {aggregated_data.get('presentation', 'N/A')}/5

## Contribution: {aggregated_data.get('contribution', 'N/A')}/5

## Strengths
{aggregated_data.get('strengths', 'No strengths provided.')}

## Weaknesses
{aggregated_data.get('weaknesses', 'No weaknesses provided.')}

## Questions
{aggregated_data.get('questions', 'No questions provided.')}

## Limitations
{aggregated_data.get('limitations', 'No limitations noted.')}

## Rating: {aggregated_data.get('rating', 'N/A')}/10

## Confidence: {aggregated_data.get('confidence', 'N/A')}/10
"""