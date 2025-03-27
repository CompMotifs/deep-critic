# DeepCritic API Integration Guide

This document outlines the API integration points for DeepCritic, a document review platform leveraging multiple AI models.

## REST API Endpoints

### Submit Document for Review
- **Endpoint**: `POST /api/review`
- **Function**: Upload a document for AI analysis
- **Request**:
  - Format: `multipart/form-data`
  - Fields:
    - `file`: PDF document (required)
    - `prompt`: Review instructions (required)
    - `agents`: JSON string array of agent IDs (required)
- **Response**: 
  - `202 Accepted` with `{ jobId: string, message: string }`
  - `400 Bad Request` for invalid inputs

### Get Job Status
- **Endpoint**: `GET /api/review/:jobId`
- **Function**: Check the status of a submitted review job
- **Response**:
  - `200 OK` with JobStatus object
  - `404 Not Found` if job doesn't exist

### Get Analysis Results
- **Endpoint**: `GET /api/review/:jobId/results`
- **Function**: Retrieve results for a completed analysis
- **Response**:
  - `200 OK` with complete analysis results
  - `202 Accepted` if job is still processing
  - `404 Not Found` if job doesn't exist

## WebSocket API

### Job Status Updates
- **Path**: `/ws`
- **Function**: Real-time updates for job status
- **Messages**:
  - **Subscribe**: `{ type: "subscribe", jobId: string }`
  - **Unsubscribe**: `{ type: "unsubscribe", jobId: string }`
  - **Updates**: `{ type: "update", jobId: string, data: JobStatus }`

## AI Model Integration

DeepCritic supports integration with multiple AI providers. Each one follows a similar pattern:

### Available AI Providers
1. **Anthropic Claude**
   - Integration file: `server/services/anthropic-service.ts`
   - Models: Claude 3.7 Sonnet, Claude 3 Opus, Claude 3 Haiku
   - Environment variable: `ANTHROPIC_API_KEY`

2. **DeepSeek**
   - Integration file: `server/services/deepseek-service.ts`
   - Models: DeepSeek Lite, DeepSeek Coder
   - Environment variable: `DEEPSEEK_API_KEY`

3. **OpenAI** (mapped to Anthropic in demo)
   - Models: GPT-4o, GPT-4 Turbo, GPT-3.5 Turbo
   - Environment variable: `OPENAI_API_KEY`

4. **Mistral** (mapped to Anthropic in demo)
   - Models: Mistral Large, Mistral Medium

5. **Meta** (mapped to Anthropic in demo)
   - Models: Llama 3, Llama 2

### Adding a New AI Provider
To add a new AI provider:

1. Create a new service file in `server/services/`
2. Implement the `analyzeDocument` function with this signature:
   ```typescript
   async function analyzeDocument(options: {
     model: string;
     content: string; // base64 encoded document
     prompt: string;
   }): Promise<{
     feedback: string;
     confidence: number;
     keyPoints: string[];
     timestamp?: string;
   }>;
   ```
3. Add the provider to the agent configuration map in `pdf-service.ts`
4. Add the models to the agent list in `client/src/components/agent-selection.tsx`

## Database Integration

The application uses a PostgreSQL database for data persistence.

- Database schema defined in `shared/schema.ts`
- Connection managed in `server/db.ts`
- Storage interface in `server/storage.ts`

To modify or extend the database schema:
1. Update models in `shared/schema.ts`
2. Run `npm run db:push` to apply changes to the database