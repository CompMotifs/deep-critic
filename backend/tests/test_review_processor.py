import unittest
from outputparser.review_processor import process_llm_feedbacks
from outputparser.structure import Review


class TestReviewProcessor(unittest.TestCase):
    def test_process_llm_feedbacks(self):
        sample_feedback_1 = Review(
            summary="This work offers a novel perspective on XYZ.",
            soundness=4,
            presentation=3,
            contribution=5,
            strengths="Innovative idea.",
            weaknesses="Needs more experiments.",
            questions="What is the computational cost?",
            limitations="Not tested on large-scale data.",
            rating=8,
            confidence=8,
        )
        sample_feedback_2 = Review(
            summary="This work offers a perspective on XYZ.",
            soundness=2,
            presentation=2,
            contribution=1,
            strengths="Good idea.",
            weaknesses="Needs more experiments.",
            questions="What is the computational cost?",
            limitations="Not tested on large-scale data.",
            rating=7,
            confidence=6,
        )
        sample_feedback_3 = Review(
            summary="This work offers a novel perspective on XYZ.",
            soundness=3,
            presentation=4,
            contribution=3,
            strengths="Great idea.",
            weaknesses="Needs more experiments.",
            questions="What is the computational cost?",
            limitations="Not tested on large-scale data.",
            rating=9,
            confidence=7,
        )
        raw_feedbacks = [sample_feedback_1, sample_feedback_2, sample_feedback_3]
        final_review = process_llm_feedbacks(raw_feedbacks)
        self.assertIsInstance(final_review, Review)
        self.assertEqual(final_review.soundness, 3)
        self.assertEqual(final_review.presentation, 3)
        self.assertEqual(final_review.contribution, 3)
        self.assertEqual(final_review.rating, 8)


if __name__ == "__main__":
    unittest.main()
