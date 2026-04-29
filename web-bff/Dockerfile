FROM node:20-alpine

WORKDIR /app

# Copy proto-contracts for runtime proto loading
COPY proto-contracts/ ./proto-contracts/

# Install dependencies (layer-cached before source copy)
COPY web-bff/package*.json ./web-bff/
RUN cd web-bff && npm ci --omit=dev

# Copy service source
COPY web-bff/ ./web-bff/

WORKDIR /app/web-bff

EXPOSE 4000

CMD ["node", "server.js"]
