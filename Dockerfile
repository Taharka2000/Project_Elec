# Base stage
FROM node:20 AS base

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --frozen-lockfile

# Build stage
FROM base AS builder

WORKDIR /app

COPY . .

#COPY .env.production ./

ENV NODE_ENV=production

RUN npm run build

# Runtime st
FROM node:20

# Set working directory for the runtime stage
WORKDIR /app

# Create a non-root user
RUN adduser --disabled-password devops

# Copy only the necessary files from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public

# Change ownership of the application files
RUN chown -R devops:devops /app

# Switch to the non-root user
USER devops

# Expose port 3000
EXPOSE 3000

# Start the Next.js server
CMD ["npm", "run", "start", "--", "-p", "3000"]