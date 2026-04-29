FROM node:20-alpine

WORKDIR /app

# Copy proto-contracts for runtime proto loading
COPY proto-contracts/ ./proto-contracts/

# Install dependencies (layer-cached before source copy)
COPY user-service/package*.json ./user-service/
RUN cd user-service && npm ci --omit=dev

# Copy service source
COPY user-service/ ./user-service/

WORKDIR /app/user-service

EXPOSE 50051

CMD ["node", "src/server.js"]
