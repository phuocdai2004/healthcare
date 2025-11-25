FROM node:18-alpine

WORKDIR /app

# Copy backend
COPY healthcare-backend /app

# Install dependencies
RUN npm install

# Expose port
EXPOSE 3000

# Start server
CMD ["npm", "start"]
