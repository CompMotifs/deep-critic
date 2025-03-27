import unittest
from outputparser.review_processor import process_llm_feedbacks


class TestReviewProcessor(unittest.TestCase):
    def test_process_llm_feedbacks(self):
        sample_feedback_1 = (
            "Summary: This work offers a novel perspective on XYZ.\n"
            "Soundness: 4\n"
            "Presentation: 3\n"
            "Contribution: 5\n"
            "Strengths: Innovative idea.\n"
            "Weaknesses: Needs more experiments.\n"
            "Questions: What is the computational cost?\n"
            "Limitations: Not tested on large-scale data.\n"
            "Rating: 8\n"
        )
        sample_feedback_2 = (
            "Summary: This work offers a perspective on XYZ.\n"
            "Soundness: 2\n"
            "Presentation: 2\n"
            "Contribution: 1\n"
            "Strengths: Good idea.\n"
            "Weaknesses: Needs more experiments.\n"
            "Questions: What is the computational cost?\n"
            "Limitations: Not tested on large-scale data.\n"
            "Rating: 7\n"
        )
        sample_feedback_3 = (
            "Summary: This work offers a novel perspective on XYZ.\n"
            "Soundness: 3\n"
            "Presentation: 4\n"
            "Contribution: 3\n"
            "Strengths: Great idea.\n"
            "Weaknesses: Needs more experiments.\n"
            "Questions: What is the computational cost?\n"
            "Limitations: Not tested on large-scale data.\n"
            "Rating: 9\n"
        )
        raw_feedbacks = [sample_feedback_1, sample_feedback_2, sample_feedback_3]
        final_review = process_llm_feedbacks(raw_feedbacks)
        self.assertIn("Summary", final_review)
        self.assertIn("Soundness", final_review)
        self.assertIn("Presentation", final_review)
        self.assertIn("Contribution", final_review)
        self.assertIn("Strengths", final_review)
        self.assertIn("Weaknesses", final_review)
        self.assertIn("Questions", final_review)
        self.assertIn("Limitations", final_review)
        self.assertIn("Rating", final_review)


if __name__ == "__main__":
    unittest.main()
