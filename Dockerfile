# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root and sub-project dependency manifests
COPY package.json package-lock.json ./
COPY server/package.json server/package-lock.json ./server/
COPY client/package.json client/package-lock.json ./client/

# Install all dependencies (including devDependencies)
RUN npm install

# Copy source code
COPY . .

# Build both server (dist/) and client (dist/)
RUN npm run build

# Stage 2: Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

# Copy root package.json for npm start script
COPY package.json ./
COPY server/package.json ./server/

# Install production dependencies for server
RUN npm install --prefix server --omit=dev

# Copy built server and client assets from builder stage
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/client/dist ./client/dist

EXPOSE 5000

CMD ["npm", "start"]
