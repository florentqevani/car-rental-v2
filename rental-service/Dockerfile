FROM node:20-alpine

WORKDIR /app

# Copy proto-contracts for runtime proto loading
COPY proto-contracts/ ./proto-contracts/

# Install dependencies (layer-cached before source copy)
COPY rental-service/package*.json ./rental-service/
RUN cd rental-service && npm ci --omit=dev

# Copy service source
COPY rental-service/ ./rental-service/

WORKDIR /app/rental-service

EXPOSE 50052

CMD ["node", "src/server.js"]
