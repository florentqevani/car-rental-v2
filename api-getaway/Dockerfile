FROM node:20-alpine

WORKDIR /app

# Copy proto-contracts for runtime proto loading
COPY proto-contracts/ ./proto-contracts/

# Install dependencies (layer-cached before source copy)
COPY api-getaway/package*.json ./api-getaway/
RUN cd api-getaway && npm ci --omit=dev

# Copy service source
COPY api-getaway/ ./api-getaway/

WORKDIR /app/api-getaway

EXPOSE 3000

CMD ["node", "server.js"]
