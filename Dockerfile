# Use a lightweight Node.js image
FROM node:20-slim

# Set the working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install ALL dependencies (including tsx for running the server)
RUN npm install

# Copy the rest of the application
COPY . .

# Build the Vite frontend
RUN npm run build

# Cloud Run provides the PORT environment variable
ENV NODE_ENV=production
ENV PORT=8080

# Expose the default port (Cloud Run sets this dynamically, but 8080 is common)
EXPOSE 8080

# Start the server using the "start" script in package.json
CMD ["npm", "start"]
