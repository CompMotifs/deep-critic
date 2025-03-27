FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies 
RUN npm ci

# Copy application code
COPY . .

# Expose the application port
EXPOSE 5000

# Default command - will be overridden by docker-compose
CMD ["npm", "run", "dev"]