# Production Dockerfile for Dedicated Admin API
FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 3002
ENV NODE_ENV=production
ENV ADMIN_PORT=3002

CMD ["npx", "tsx", "src/server.ts"]
