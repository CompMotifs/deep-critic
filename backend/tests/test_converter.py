import unittest
from outputparser.converter import convert_to_openreview


class TestConverter(unittest.TestCase):
    def test_convert_to_openreview(self):
        aggregated_data = {
            "summary": "Combined summary from multiple LLMs.",
            "soundness": 4,
            "presentation": 3,
            "contribution": 5,
            "strengths": "Good methodology.",
            "weaknesses": "Limited experiments.",
            "questions": "How does it scale?",
            "limitations": "Small datasets.",
            "rating": 8,
            "confidence": 9.0,
        }
        result = convert_to_openreview(aggregated_data)
        self.assertIn("Summary", result)
        self.assertIn("Soundness", result)
        self.assertIn("Presentation", result)
        self.assertIn("Contribution", result)
        self.assertIn("Strengths", result)
        self.assertIn("Weaknesses", result)
        self.assertIn("Questions", result)
        self.assertIn("Limitations", result)
        self.assertIn("Rating", result)


if __name__ == "__main__":
    unittest.main()
