FROM node:20-alpine

WORKDIR /app

# Copy proto-contracts first (needed for file: dependency + runtime proto loading)
COPY proto-contracts/ ./proto-contracts/

# Install dependencies (layer-cached before source copy)
COPY auth-service/package*.json ./auth-service/
RUN cd auth-service && npm ci --omit=dev

# Copy service source
COPY auth-service/ ./auth-service/

WORKDIR /app/auth-service

EXPOSE 50054

CMD ["node", "src/server.js"]
