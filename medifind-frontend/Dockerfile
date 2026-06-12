# Stage 1 — Build
# We use a full Node image to build the React app
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy all source files
COPY . .

# Build arguments — these become environment variables during build
ARG VITE_API_URL
ARG VITE_STORAGE_URL
ARG VITE_GOOGLE_MAPS_KEY

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_STORAGE_URL=$VITE_STORAGE_URL
ENV VITE_GOOGLE_MAPS_KEY=$VITE_GOOGLE_MAPS_KEY

# Build the React app — outputs to /app/dist
RUN npm run build

# Stage 2 — Serve
# We use a tiny nginx image just to serve the built files
# The full Node image is discarded — final image is much smaller
FROM nginx:alpine

# Copy built React files into nginx's web root
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config for React routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]