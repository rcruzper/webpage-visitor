# ==========================================
# Stage 1: Builder
# Install Node.js dependencies
# ==========================================
FROM node:18-alpine AS builder

# Prevent Chromium download during this stage (saves time and bandwidth)
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

WORKDIR /app

# Copy only package.json (ignoring lockfile due to private registry issues)
COPY package.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy source code
COPY . .

# ==========================================
# Stage 2: Runner
# Minimal final image for execution
# ==========================================
FROM node:18-alpine AS runner

# Install Chromium and system dependencies (runtime)
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    dumb-init

# Puppeteer configuration for Alpine
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

# Copy dependencies and code from builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/index.js ./

# Create output directory and set permissions
RUN mkdir -p output && chown -R node:node /app

# Security: use non-root user
USER node

# Default environment variables
ENV HEADLESS=true \
    NODE_ENV=production

# Entrypoint for process management
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

CMD ["node", "index.js"]
