FROM node:16-alpine

WORKDIR /app

# This is a placeholder Dockerfile for the frontend
# Once you have a frontend framework set up, you would:
# 1. Copy package.json and install dependencies
# 2. Copy the rest of the frontend code
# 3. Build the frontend (for production)
# 4. Serve using a lightweight server like nginx

# For now, we'll just create a simple placeholder
RUN mkdir -p /app/public
RUN echo '<html><body><h1>Deep Critic Frontend</h1><p>Frontend placeholder. Replace with your actual frontend implementation.</p></body></html>' > /app/public/index.html

# Install a simple server to serve the placeholder
RUN npm install -g http-server

EXPOSE 3000

CMD ["http-server", "/app/public", "-p", "3000"]