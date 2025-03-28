import asyncio
from typing import Dict, List, Any, Optional
import numpy as np

from app.services.llm.openai import get_openai_review, get_updated_openai_review
from app.services.llm.claude import get_claude_review, get_updated_claude_review
from app.services.llm.mistral import get_mistral_review, get_updated_mistral_review
from app.services.converters.pdf import convert_pdf_bytes_to_markdown
from app.review_engine.parser import parse_llm_feedback
from app.review_engine.aggregator import (
    aggregate_feedback,
    convert_to_openreview,
    get_agreement,
)
import json
import re


class ReviewEngine:
    """Orchestrates the paper review process using multiple LLM services."""

    def __init__(self, review_prompt: str, update_review_prompt: str):
        """
        Initialize the ReviewEngine with the prompt to use for reviews.

        Args:
            review_prompt: The prompt template to send to LLMs
        """
        self.review_prompt = review_prompt
        self.update_review_prompt = update_review_prompt

    async def process_pdf(self, pdf_bytes: bytes) -> Dict[str, Any]:
        """
        Process a paper from PDF through the entire review pipeline.

        Args:
            pdf_bytes: Raw bytes of the PDF file

        Returns:
            Dictionary containing individual reviews and a consensus review
        """
        # Convert PDF to text
        try:
            paper_text, _ = convert_pdf_bytes_to_markdown(pdf_bytes)
        except Exception as e:
            raise Exception(f"Failed to convert PDF: {str(e)}")

        # Get reviews using the text
        return await self.process_text(paper_text)

    async def process_text(self, paper_text: str) -> Dict[str, Any]:
        """
        Process paper text through the review pipeline.

        Args:
            paper_text: The text content of the paper

        Returns:
            Dictionary containing individual reviews, review similarities, updated individual reviews,
            updated review similarities, and a consensus review.
        """
        # Get reviews from all LLM services
        individual_reviews = await self._get_all_reviews(paper_text)

        # Parse the reviews to structured format for consensus generation
        parsed_reviews = self._parse_reviews(individual_reviews)

        # Get similarity between reviews
        original_similarities = np.ones((3, 3))
        original_similarities[0, 1] = get_agreement(
            individual_reviews["openai"], individual_reviews["claude"]
        )
        original_similarities[0, 2] = get_agreement(
            individual_reviews["openai"], individual_reviews["mistral"]
        )
        original_similarities[1, 2] = get_agreement(
            individual_reviews["claude"], individual_reviews["mistral"]
        )
        original_similarities[1, 0] = original_similarities[0, 1]
        original_similarities[2, 0] = original_similarities[0, 2]
        original_similarities[2, 1] = original_similarities[1, 2]

        # Get updated reviews from all LLM services
        updated_reviews = await self._get_all_updated_reviews(
            paper_text, individual_reviews
        )

        # Parse the reviews to structured format for consensus generation
        parsed_reviews = self._parse_reviews(updated_reviews)

        # updated similarities
        updated_similarities = np.ones((3, 3))
        updated_similarities[0, 1] = get_agreement(
            updated_reviews["openai"], updated_reviews["claude"]
        )
        updated_similarities[0, 2] = get_agreement(
            updated_reviews["openai"], updated_reviews["mistral"]
        )
        updated_similarities[1, 2] = get_agreement(
            updated_reviews["claude"], updated_reviews["mistral"]
        )
        updated_similarities[1, 0] = updated_similarities[0, 1]
        updated_similarities[2, 0] = updated_similarities[0, 2]
        updated_similarities[2, 1] = updated_similarities[1, 2]
        # Generate consensus review if we have valid parsed reviews
        consensus_review = None
        if parsed_reviews:
            try:
                aggregated_data = aggregate_feedback(parsed_reviews)
                consensus_review = convert_to_openreview(aggregated_data)
                # print("aggregated_data", aggregated_data)
                # print("consensus_review", consensus_review)
            except Exception as e:
                consensus_review = {"error": f"Failed to generate consensus: {str(e)}"}

        return {
            "individual_reviews": individual_reviews,
            # "original_similarities": original_similarities, # TODO: Needs to be JSON-parseable
            "updated_individual_reviews": updated_reviews,
            # "updated_similarities": updated_similarities,
            "consensus_review": consensus_review,
        }

    async def _get_all_reviews(self, paper_text: str) -> Dict[str, Any]:
        """
        Get reviews from all configured LLM services in parallel.

        Args:
            paper_text: The text content of the paper

        Returns:
            Dictionary mapping service names to their review results
        """
        tasks = [
            self._get_review_from_service("openai", paper_text),
            self._get_review_from_service("claude", paper_text),
            self._get_review_from_service("mistral", paper_text),
        ]

        # Wait for all reviews to complete
        results = await asyncio.gather(*tasks, return_exceptions=True)

        # Process results
        reviews = {}
        service_names = ["openai", "claude", "mistral"]
        for name, result in zip(service_names, results):
            if isinstance(result, Exception):
                reviews[name] = {"error": str(result)}
            else:
                try:
                    # Parse JSON if it's in JSON format
                    reviews[name] = self._parse_json_response(result)
                except json.JSONDecodeError:
                    reviews[name] = {"error": "Invalid JSON response", "raw": result}
                except Exception as e:
                    reviews[name] = {"error": str(e)}

        return reviews

    async def _get_all_updated_reviews(
        self, paper_text: str, reviews: dict[str]
    ) -> Dict[str, Any]:
        """
        Get updated reviews from all configured LLM services in parallel.

        Args:
            paper_text: The text content of the paper
            reviews: The reviews from the previous iteration

        Returns:
            Dictionary mapping service names to their review results
        """
        tasks = [
            self._get_updated_review_from_service(
                "openai", paper_text, reviews["claude"], reviews["mistral"]
            ),
            self._get_updated_review_from_service(
                "claude", paper_text, reviews["openai"], reviews["mistral"]
            ),
            self._get_updated_review_from_service(
                "mistral", paper_text, reviews["openai"], reviews["claude"]
            ),
        ]

        # Wait for all reviews to complete
        results = await asyncio.gather(*tasks, return_exceptions=True)

        # Process results
        reviews = {}
        service_names = ["openai", "claude", "mistral"]
        for name, result in zip(service_names, results):
            if isinstance(result, Exception):
                reviews[name] = {"error": str(result)}
            else:
                try:
                    # Parse JSON if it's in JSON format
                    reviews[name] = self._parse_json_response(result)
                except json.JSONDecodeError:
                    reviews[name] = {"error": "Invalid JSON response", "raw": result}
                except Exception as e:
                    reviews[name] = {"error": str(e)}

        return reviews

    async def _get_review_from_service(self, service_name: str, paper_text: str) -> str:
        """
        Get a review from a specific LLM service.

        Args:
            service_name: Name of the service to use ('openai', 'claude', 'mistral')
            paper_text: The text content of the paper

        Returns:
            Raw response from the LLM service
        """
        try:
            if service_name == "openai":
                return get_openai_review(paper_text, self.review_prompt)
            elif service_name == "claude":
                return get_claude_review(paper_text, self.review_prompt)
            elif service_name == "mistral":
                return get_mistral_review(paper_text, self.review_prompt)
            else:
                raise ValueError(f"Unknown service: {service_name}")
        except Exception as e:
            raise Exception(f"Service {service_name} failed: {str(e)}")

    async def _get_updated_review_from_service(
        self, service_name: str, paper_text: str, review1: dict[str], review2: dict[str]
    ) -> str:
        """
        Get an updated review from a specific LLM service.

        Args:
            service_name: Name of the service to use ('openai', 'claude', 'mistral')
            paper_text: The text content of the paper
            review1: The review from another service
            review2: The review from yet another service

        Returns:
            Raw response from the LLM service
        """
        try:
            print("update_review_prompt", self.update_review_prompt)
            if service_name == "openai":
                return get_updated_openai_review(
                    paper_text, self.update_review_prompt, review1, review2
                )
            elif service_name == "claude":
                return get_updated_claude_review(
                    paper_text, self.update_review_prompt, review1, review2
                )
            elif service_name == "mistral":
                return get_updated_mistral_review(
                    paper_text, self.update_review_prompt, review1, review2
                )
            else:
                raise ValueError(f"Unknown service: {service_name}")
        except Exception as e:
            raise Exception(f"Service {service_name} failed: {str(e)}")

    def _parse_json_response(self, response_text: str) -> Dict[str, Any]:
        """
        Parse JSON response from an LLM, handling markdown code blocks.

        Args:
            response_text: Raw response text from LLM

        Returns:
            Parsed JSON object
        """
        # Strip markdown code block if present
        json_match = re.search(r"```json\n(.*?)\n```", response_text, re.DOTALL)
        if json_match:
            response_text = json_match.group(1)

        return json.loads(response_text)

    def _parse_reviews(
        self, individual_reviews: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Convert raw reviews to a format suitable for aggregation.

        Args:
            individual_reviews: Dictionary of reviews from different services

        Returns:
            List of parsed review dictionaries ready for aggregation
        """
        parsed_reviews = []

        for service_name, review in individual_reviews.items():
            if "error" in review:
                continue  # Skip failed reviews

            try:
                # Format the review as text for the parser
                formatted_review = self._format_review_for_parser(review)
                if formatted_review:
                    parsed = parse_llm_feedback(formatted_review)
                    if parsed:
                        parsed_reviews.append(parsed)
            except Exception:
                continue  # Skip reviews that can't be parsed

        return parsed_reviews

    def _format_review_for_parser(self, review: Dict[str, Any]) -> Optional[str]:
        """
        Format a JSON review into text format for the parser.

        Args:
            review: Review data as a dictionary

        Returns:
            Formatted text string or None if formatting fails
        """
        try:
            # Extract and format different parts of the review
            summary = review.get("summary", "")

            strengths = "\n".join(review.get("strengths", []))
            weaknesses = "\n".join(review.get("weaknesses", []))

            # Handle optional fields (could be string or list)
            questions = review.get("questions", [])
            if isinstance(questions, list):
                questions = "\n".join(questions)

            limitations = review.get("limitations", "")
            if isinstance(limitations, list):
                limitations = "\n".join(limitations)

            # Use scores directly from provided fields
            soundness = review.get("soundness", 3)
            presentation = review.get("presentation", 3)
            contribution = review.get("contribution", 3)
            rating = review.get("rating", 5)

            # Create the formatted text
            formatted = f"""
            Summary: {summary}
            Soundness: {soundness}
            Presentation: {presentation}
            Contribution: {contribution}
            Strengths: {strengths}
            Weaknesses: {weaknesses}
            Questions: {questions}
            Limitations: {limitations}
            Rating: {rating}
            """.strip()
            return formatted

        except Exception as e:
            print(f"Error formatting review: {e}")
            return None
