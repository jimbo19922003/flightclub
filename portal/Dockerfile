FROM node:20-bookworm-slim

WORKDIR /app

# Install system dependencies required for Prisma and health checks
RUN apt-get update -y && apt-get install -y openssl netcat-openbsd procps && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json package-lock.json* ./

# Install ALL dependencies (including dev deps for Prisma CLI)
RUN npm ci

# Copy the rest of the application
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the Next.js application
RUN npm run build

# Expose port
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Copy startup script and make executable
COPY start.sh ./start.sh
RUN chmod +x ./start.sh

CMD ["./start.sh"]
