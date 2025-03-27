import numpy as np
from outputparser.converter import convert_to_openreview
from outputparser.structure import Review


def aggregate_feedback(feedbacks: Review) -> dict:
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
        soundness_scores.append(fb.soundness)
        presentation_scores.append(fb.presentation)
        contribution_scores.append(fb.contribution)
        rating_scores.append(fb.rating)

        summaries.append(f"LLM {i+1}: {fb.summary}")
        strengths_list.append(f"LLM {i+1}: {fb.strengths}")
        weaknesses_list.append(f"LLM {i+1}: {fb.weaknesses}")
        questions_list.append(f"LLM {i+1}: {fb.questions}")
        limitations_list.append(f"LLM {i+1}: {fb.limitations}")

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


def process_llm_feedbacks(feedbacks: list) -> str:
    """
    Process raw feedback texts from multiple LLMs and produce the final OpenReview style review.
    """
    aggregated_data = aggregate_feedback(feedbacks)
    final_review = convert_to_openreview(aggregated_data)
    return final_review
