FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY server.js .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
USER nodejs

EXPOSE 8080

CMD ["npm", "start"]
