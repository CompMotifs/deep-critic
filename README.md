# Deep Critic Backend API

This document describes how to perform a quick test of the Deep Critic backend API.

## Setup

Install the required dependencies by running:

```bash
pip install -r requirements.txt
```

Ensure you have configured your .env file properly! See .env_template in the repo, copy it to .env, and fill it out. 

## Starting the Server

Start the FastAPI backend server using:

```bash
uvicorn api.main:app --reload
```

## Quick API Test

To verify the backend API is running correctly, send a POST request using the following `curl` command:

```bash
curl -X POST -H "Content-Type: application/json" \
-d '{"paper_text": "Sample paper text or abstract here..."}' \
http://localhost:8000/api/review
```

### Expected Response

A successful response returns structured JSON data containing reviews from the integrated Large Language Models (LLMs):

```json
{
  "openai": { "summary": "...", "strengths": [...], "weaknesses": [...], "scores": {...} },
  "claude": { "summary": "...", "strengths": [...], "weaknesses": [...], "scores": {...} },
  "mistral": { "summary": "...", "strengths": [...], "weaknesses": [...], "scores": {...} }
}
```

## Test pdf convert and LLM review
Replace the file path with a path to a small pdf locally. 

```bash
curl -X POST \
-F "pdf_file=@/Users/jgerold/coding/compute-for-science/short_paper.pdf" \
http://localhost:8000/api/upload-and-review
```

### Troubleshooting

If the response contains errors, ensure that:
- API keys are correctly defined in your `.env` file.
- The FastAPI backend server is running (`uvicorn api.main:app --reload`).
- The Python environment includes all required dependencies (`pip install -r requirements.txt`).

