FROM node:20-slim as build

WORKDIR /app

# Copy all source code first
COPY . .

# Use npm install instead of npm ci, which is more lenient with package.json format
RUN npm install

# Build the app
RUN npm run build

# Use nginx to serve the app
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
