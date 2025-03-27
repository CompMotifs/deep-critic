import numpy as np
from outputparser.parser import parse_llm_feedback
from outputparser.converter import convert_to_openreview


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


def process_llm_feedbacks(raw_feedbacks: list) -> str:
    """
    Process raw feedback texts from multiple LLMs and produce the final OpenReview style review.
    """
    parsed_feedbacks = [parse_llm_feedback(text) for text in raw_feedbacks]
    aggregated_data = aggregate_feedback(parsed_feedbacks)
    final_review = convert_to_openreview(aggregated_data)
    return final_review
