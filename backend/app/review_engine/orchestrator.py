import asyncio

from app.services.llm.openai import OpenAIService
from app.services.llm.claude import ClaudeService
from app.services.llm.mistral import MistralService
from app.services.converters.pdf import PDFConverter
from app.review_engine.parser import parse_llm_feedback
from app.review_engine.aggregator import aggregate_feedback, convert_to_openreview

class ReviewEngine:
    """Orchestrates the paper review process using multiple LLM services."""
    
    def __init__(self):
        self.pdf_converter = PDFConverter()
        self.llm_services = {
            "openai": OpenAIService(),
            "claude": ClaudeService(),
            "mistral": MistralService(),
        }
    
    async def process_paper(self, pdf_content):
        """Process a paper from PDF through the entire review pipeline."""
        # Convert PDF to text
        paper_text = await self.pdf_converter.convert(pdf_content)
        
        # Get reviews from all LLM services
        individual_reviews = await self._get_all_reviews(paper_text)
        
        # Parse and aggregate reviews
        raw_feedbacks = []
        for service_name, review_json in individual_reviews.items():
            # Convert to standard format for aggregation
            if "error" not in review_json:
                formatted_review = self._format_for_aggregation(review_json)
                if formatted_review:
                    raw_feedbacks.append(formatted_review)
        
        # Generate consensus review if we have valid inputs
        consensus_review = None
        if raw_feedbacks:
            parsed_feedbacks = [parse_llm_feedback(text) for text in raw_feedbacks]
            aggregated_data = aggregate_feedback(parsed_feedbacks)
            consensus_review = convert_to_openreview(aggregated_data)
        
        return {
            "individual_reviews": individual_reviews,
            "consensus_review": consensus_review
        }
    
    async def _get_all_reviews(self, paper_text):
        """Get reviews from all configured LLM services in parallel."""
        tasks = []
        for name, service in self.llm_services.items():
            tasks.append(self._get_review(name, service, paper_text))
        
        # Wait for all reviews to complete
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Process results
        reviews = {}
        for name, result in zip(self.llm_services.keys(), results):
            if isinstance(result, Exception):
                reviews[name] = {"error": str(result)}
            else:
                reviews[name] = result
                
        return reviews
    
    async def _get_review(self, name, service, paper_text):
        """Get review from a specific LLM service."""
        try:
            return await service.get_review(paper_text)
        except Exception as e:
            return {"error": f"Service {name} failed: {str(e)}"}
    
    def _format_for_aggregation(self, review_data):
        """Convert JSON review to text format needed for aggregation."""
        try:
            # Format the JSON into the expected text format for parser
            strengths = "\n".join(review_data.get("strengths", []))
            weaknesses = "\n".join(review_data.get("weaknesses", []))
            questions = "\n".join(review_data.get("questions", [])) if "questions" in review_data else ""
            limitations = "\n".join(review_data.get("limitations", [])) if "limitations" in review_data else ""
            
            # Map scores to the correct scale
            scores = review_data.get("scores", {})
            soundness = self._scale_score(scores.get("originality", 5))
            presentation = self._scale_score(scores.get("clarity", 5))
            contribution = self._scale_score(scores.get("impact", 5))
            rating = scores.get("overall", 5)
            
            formatted = f"""
            Summary: {review_data.get('summary', '')}
            Soundness: {soundness}
            Presentation: {presentation}
            Contribution: {contribution}
            Strengths: {strengths}
            Weaknesses: {weaknesses}
            Questions: {questions}
            Limitations: {limitations}
            Rating: {rating}
            """
            return formatted
        except Exception:
            return None
    
    def _scale_score(self, score, from_scale=(1, 10), to_scale=(1, 5)):
        """Scale a score from one range to another."""
        if score is None:
            return 3  # Default middle value
            
        # Simple linear mapping from 1-10 to 1-5
        from_min, from_max = from_scale
        to_min, to_max = to_scale
        scaled = ((score - from_min) / (from_max - from_min)) * (to_max - to_min) + to_min
        return round(scaled)


# backend/app/review_engine/parser.py
# This is moving your existing parser code with minimal changes
import re

def parse_llm_feedback(text):
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


# backend/app/review_engine/aggregator.py
# This is moving your existing aggregator code
import numpy as np

def aggregate_feedback(parsed_feedbacks):
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

    # Compute confidence based on agreement of numeric scores
    stds = []
    for scores in (soundness_scores, presentation_scores, contribution_scores):
        if scores:
            stds.append(np.std(scores))
    if stds:
        avg_std = np.mean(stds)
        # A lower std means higher confidence
        confidence = max(0, round((1 / (1 + avg_std)) * 10, 1))
    else:
        confidence = None
    aggregated["confidence"] = confidence

    return aggregated

def convert_to_openreview(aggregated_data):
    """
    Convert aggregated feedback data into an OpenReview style review.
    This is a simplified version that formats the review as a string
    instead of calling an external LLM.
    """
    # Format the review as a string
    review = f"""# Review Summary

{aggregated_data.get('summary', 'No summary provided.')}

## Soundness: {aggregated_data.get('soundness', 'N/A')}/5

## Presentation: {aggregated_data.get('presentation', 'N/A')}/5

## Contribution: {aggregated_data.get('contribution', 'N/A')}/5

## Strengths
{aggregated_data.get('strengths', 'No strengths provided.')}

## Weaknesses
{aggregated_data.get('weaknesses', 'No weaknesses provided.')}

## Questions
{aggregated_data.get('questions', 'No questions.')}

## Limitations
{aggregated_data.get('limitations', 'No limitations noted.')}

## Rating: {aggregated_data.get('rating', 'N/A')}/10

## Confidence: {aggregated_data.get('confidence', 'N/A')}/10
"""
    return review