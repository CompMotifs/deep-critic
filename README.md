Deep Critic Backend API

This document describes how to perform a quick test of the Deep Critic backend API.

Setup

Install the required dependencies by running:

pip install -r requirements.txt

Starting the Server

Start the FastAPI backend server using:

uvicorn api.main:app --reload

Quick API Test

To verify the backend API is running correctly, send a POST request using the following curl command:

curl -X POST -H "Content-Type: application/json" \
-d '{"paper_text": "Sample paper text or abstract here..."}' \
http://localhost:8000/api/review

Expected Response

A successful response returns structured JSON data containing reviews from the integrated Large Language Models (LLMs):

{
  "openai": { "summary": "...", "strengths": [...], "weaknesses": [...], "scores": {...} },
  "claude": { "summary": "...", "strengths": [...], "weaknesses": [...], "scores": {...} },
  "mistral": { "summary": "...", "strengths": [...], "weaknesses": [...], "scores": {...} }
}

Troubleshooting

If the response contains errors, ensure that:

API keys are correctly defined in your .env file.

The FastAPI backend server is running (uvicorn api.main:app --reload).

The Python environment includes all required dependencies (pip install -r requirements.txt).
