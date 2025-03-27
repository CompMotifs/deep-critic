from pydantic import BaseModel


class Review(BaseModel):
    summary: str
    soundness: int
    presentation: int
    contribution: int
    strengths: str
    weaknesses: str
    questions: str
    limitations: str
    rating: int
    confidence: int
