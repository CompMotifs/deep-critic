# Deep Critic: Academic Paper Review System

Deep Critic is an integrated web application designed to provide comprehensive reviews of academic papers using multiple Large Language Models (LLMs). It combines models from OpenAI, Anthropic, and Mistral to generate structured, consensus-driven feedback resembling peer-review processes at conferences such as NeurIPS.

## Features

- Integration with multiple LLMs (OpenAI, Claude, Mistral)
- PDF upload, extraction, and processing
- Automatic generation of structured paper reviews
- Consensus reviews combining insights from multiple models
- User-friendly React frontend interface

## Prerequisites

- Docker and Docker Compose
- Node.js and npm (for frontend development)
- API keys for OpenAI, Anthropic, and Mistral

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/CompMotifs/deep-critic.git
cd deep-critic
```

### 2. Configure Environment Variables

Create a `.env` file from the provided template and add your API keys:

```bash
cp .env_template .env
```

Edit `.env` and populate your API keys:

```bash
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-claude-key
MISTRAL_API_KEY=your-mistral-key
```

### 3. Build and Run the Application

Build both frontend and backend services:

```bash
docker compose build
```

Start all services:

```bash
docker compose up
```

Once running, the frontend is accessible at [http://localhost:80](http://localhost:80), and the backend API is accessible at [http://localhost:8000](http://localhost:8000).

## Development Workflow

### Frontend Development

For frontend development with hot reloading, follow these steps:

```bash
cd frontend
npm install
npm start
```

The React application will run locally at [http://localhost:3000](http://localhost:3000) and automatically reload on source code changes.

### Backend Development

The backend is built using FastAPI. For local development with automatic reloading:

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

This will run the API locally at [http://localhost:8000](http://localhost:8000).

## Project Structure

```
deep-critic/
├── backend/
│   ├── api/               # API routes and endpoints
│   ├── app/
│   │   ├── review_engine/ # Paper review logic
│   │   └── services/      # Integration with external services (LLMs, PDF processing)
│   └── requirements.txt   # Python dependencies
│
├── frontend/
│   ├── public/            # Static files
│   │   └── index.html
│   ├── src/               # React components
│   │   ├── App.js
│   │   ├── DeepCriticApp.js
│   │   ├── DeepCriticApp.css
│   │   └── index.js
│   ├── package.json
│   ├── Dockerfile
│   └── Dockerfile.dev
│
├── docker-compose.yml
├── .env_template
└── README.md
```

## Current Development Goals

- Improve and extend API functionality
- Enhance frontend user experience
- Add automated validation and batch review analysis
- Improve PDF processing performance
- Incorporate additional language models and inter-model communication
- Set up robust user management, authentication, database integration, and CI/CD

## Troubleshooting

If you encounter issues:

1. Confirm that all API keys are correctly set in your `.env` file.
2. Check logs from Docker Compose:

```bash
docker compose logs backend
docker compose logs frontend
```

3. Verify port availability (default frontend: `80`, backend: `8000`).
4. Ensure uploaded PDFs are readable and not corrupted.

