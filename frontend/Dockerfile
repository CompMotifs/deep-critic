FROM node:16-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

# Do NOT call create-react-app here; use your own existing source files directly
COPY ./src ./src
COPY ./public ./public

RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html