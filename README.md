# Deep Critic: Academic Paper Review System

Deep Critic is an API that leverages multiple Large Language Models (LLMs) to provide comprehensive reviews of academic papers. It uses OpenAI, Anthropic, and Mistral models to analyze papers and generate structured feedback similar to conference review processes.

## Features

- Multiple LLM integration (OpenAI, Claude, Mistral)
- PDF extraction and processing
- NeurIPS-style paper reviews
- Consensus review generation combining insights from all models

## Prerequisites

- Docker and Docker Compose
- API keys for OpenAI, Anthropic, and Mistral

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/deep-critic.git
cd deep-critic
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory by copying the template:

```bash
cp .env_template .env
```

Then edit the `.env` file to add your API keys:

```
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-claude-key
MISTRAL_API_KEY=your-mistral-key
```

### 3. Build and Start the Backend Service

Build the Docker container:

```bash
docker compose build backend
```

Start the backend service:

```bash
docker compose up backend
```

The API should now be running at `http://localhost:8000`.

## Testing the API

### Simple Text Review

You can test the API by sending a POST request with paper text:

```bash
curl -X POST -H "Content-Type: application/json" \
-d '{"paper_text": "This paper presents a novel approach to natural language processing using transformer architectures. We demonstrate state-of-the-art results on several benchmarks including GLUE and SuperGLUE."}' \
http://localhost:8000/api/review
```

### PDF Upload and Review

To test with a PDF file:

```bash
curl -X POST \
-F "pdf_file=@/path/to/your/paper.pdf" \
http://localhost:8000/api/upload-and-review
```


## Project Structure

- `backend/`: FastAPI backend application
  - `api/`: API routes and endpoints
  - `app/`: Core application logic
    - `review_engine/`: Paper review logic
    - `services/`: External services integration (LLMs, PDF processing)
- `frontend/`: Frontend placeholder (not implemented yet)

## Notes

- The frontend directory is currently just a placeholder. The UI implementation is planned for future development.
- For production deployment, you should configure proper CORS settings in `app/config.py`.
- Consider using environment-specific configuration for different deployment environments.
- A concrete list of TODOs, roughly in priority order:
  - Decide on local versus hosted deployment for front and backend and resolve related networking issues
  - Add richer API options and parameter handling in order to capture input from users (MVP could just be use all the models in some fixed set?)
  - Build and execute validation machinery (How to compare to NeurIPS reviews? How to easily batch analyses?)
  - Add more models
  - Add model-model communication
  - Improve performance of PDF OCR
- Before a real release, need to fix:
  - Keys, User management, Database, CI/CD

## Troubleshooting

If you encounter issues:

1. Verify your API keys are correctly set in the `.env` file
2. Check Docker logs: `docker compose logs backend`
3. Ensure all required ports are available
4. For PDF processing issues, verify the PDF is not corrupted and is readable
