# Production Dockerfile for User API
FROM node:20-alpine AS runner

WORKDIR /app

# Install native dependencies for better-sqlite3 build
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 3001
ENV NODE_ENV=production
ENV PORT=3001

CMD ["npx", "tsx", "src/server.ts"]
