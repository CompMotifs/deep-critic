import unittest
from outputparser.parser import parse_llm_feedback


class TestParser(unittest.TestCase):
    def test_parse_valid_feedback(self):
        text = (
            "Summary: A promising approach to ABC.\n"
            "Soundness: 3\n"
            "Presentation: 4\n"
            "Contribution: 5\n"
            "Strengths: Well-motivated.\n"
            "Weaknesses: Lacks real-world experiments.\n"
            "Questions: Can the method scale?\n"
            "Limitations: Small sample size.\n"
            "Rating: 7\n"
        )
        result = parse_llm_feedback(text)
        self.assertEqual(result["soundness"], 3)
        self.assertEqual(result["presentation"], 4)
        self.assertEqual(result["contribution"], 5)
        self.assertEqual(result["rating"], 7)
        self.assertIn("A promising approach", result["summary"])


if __name__ == "__main__":
    unittest.main()
