FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Create data directories
RUN mkdir -p data/uploads data/chunks data/results

# Expose port
EXPOSE 3001

# Start server
CMD ["npm", "run", "dev"]
