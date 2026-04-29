FROM node:20-alpine

WORKDIR /app

# Copy proto-contracts first (needed for file: dependency + runtime proto loading)
COPY proto-contracts/ ./proto-contracts/

# Install dependencies (layer-cached before source copy)
COPY car-service/package*.json ./car-service/
RUN cd car-service && npm ci --omit=dev

# Copy service source
COPY car-service/ ./car-service/

WORKDIR /app/car-service

EXPOSE 50053

CMD ["node", "src/server.js"]
