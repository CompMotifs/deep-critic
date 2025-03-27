import numpy as np
import os
from openai import OpenAI
from dotenv import load_dotenv
from pydantic import BaseModel

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")


class Review(BaseModel):
    summary: str
    soundness: float
    presentation: float
    contribution: float
    strengths: str
    weaknesses: str
    questions: str
    limitations: str
    rating: float
    confidence: float


def aggregate_feedback(
    feedbacks: Review,
) -> dict:
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

    for i, fb in enumerate(feedbacks):
        soundness_scores.append(fb.get("soundness"))
        presentation_scores.append(fb.get("presentation"))
        contribution_scores.append(fb.get("contribution"))
        rating_scores.append(fb.get("rating"))

        summaries.append(f"LLM {i+1}: {fb.get('summary')}")
        strengths_list.append(f"LLM {i+1}: {fb.get('strengths')}")
        weaknesses_list.append(f"LLM {i+1}: {fb.get('weaknesses')}")
        questions_list.append(f"LLM {i+1}: {fb.get('questions')}")
        limitations_list.append(f"LLM {i+1}: {fb.get('limitations')}")

    # Compute averages
    aggregated = {}
    aggregated["soundness"] = (
        round(np.mean(soundness_scores), 2) if soundness_scores else None
    )
    print("soundness", aggregated["soundness"])
    aggregated["presentation"] = (
        round(np.mean(presentation_scores), 2) if presentation_scores else None
    )
    aggregated["contribution"] = (
        round(np.mean(contribution_scores), 2) if contribution_scores else None
    )
    aggregated["rating"] = round(np.mean(rating_scores), 2) if rating_scores else None

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


def get_llm_agreement(context: str, prompt: str) -> str:
    """
    Call an LLM to get the agreement between two reviewers.
    """
    client = OpenAI()

    completion = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": context},
            {"role": "user", "content": prompt},
        ],
    )

    return completion.choices[0].message.content


def get_agreement(reviewer1: dict, reviewer2: dict) -> str:
    """
    Get agreement between two reviewers.
    """
    context = (
        "Using the following aggregated feedback from two reviewers with the sections"
        "Summary; Soundness, Presentation and Contribution (scores from 1 to 5);"
        "Strengths and Weaknesses; Questions; Limitations; Rating (score from 1 to 10); Confidence,"
        "quantify the agreement between them as a decimal between 0 and 1. Only return the decimal, without any additional text."
    )
    prompt = (
        f"Reviewer 1:\n"
        f"Summary: {reviewer1.get('summary')}\n"
        f"Soundness: {reviewer1.get('soundness')}\n"
        f"Presentation: {reviewer1.get('presentation')}\n"
        f"Contribution: {reviewer1.get('contribution')}\n"
        f"Strengths: {reviewer1.get('strengths')}\n"
        f"Weaknesses: {reviewer1.get('weaknesses')}\n"
        f"Questions: {reviewer1.get('questions')}\n"
        f"Limitations: {reviewer1.get('limitations')}\n"
        f"Rating: {reviewer1.get('rating')}\n"
        f"Confidence: {reviewer1.get('confidence')}\n"
        f"\n"
        f"Reviewer 2:\n"
        f"Summary: {reviewer2.get('summary')}\n"
        f"Soundness: {reviewer2.get('soundness')}\n"
        f"Presentation: {reviewer2.get('presentation')}\n"
        f"Contribution: {reviewer2.get('contribution')}\n"
        f"Strengths: {reviewer2.get('strengths')}\n"
        f"Weaknesses: {reviewer2.get('weaknesses')}\n"
        f"Questions: {reviewer2.get('questions')}\n"
        f"Limitations: {reviewer2.get('limitations')}\n"
        f"Rating: {reviewer2.get('rating')}\n"
        f"Confidence: {reviewer2.get('confidence')}\n"
    )
    return get_llm_agreement(context, prompt)
