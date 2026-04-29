FROM node:20-alpine

WORKDIR /app

# Copy proto-contracts for runtime proto loading
COPY proto-contracts/ ./proto-contracts/

# Install dependencies (layer-cached before source copy)
COPY payment-service/package*.json ./payment-service/
RUN cd payment-service && npm ci --omit=dev

# Copy service source
COPY payment-service/ ./payment-service/

WORKDIR /app/payment-service

EXPOSE 50055

CMD ["node", "src/server.js"]
