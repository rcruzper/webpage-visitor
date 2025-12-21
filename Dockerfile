# ==========================================
# Stage 1: Builder
# Instala dependencias de Node.js
# ==========================================
FROM node:18-alpine AS builder

# Evitar descarga de Chromium en esta etapa (ahorra tiempo y ancho de banda)
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

WORKDIR /app

# Copiar solo package.json (ignorando lockfile por el tema del registro privado)
COPY package.json ./

# Instalar solo dependencias de producción
RUN npm install --omit=dev

# Copiar el código fuente
COPY . .

# ==========================================
# Stage 2: Runner
# Imagen final minimalista para ejecución
# ==========================================
FROM node:18-alpine AS runner

# Instalar Chromium y dependencias de sistema (runtime)
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    dumb-init

# Configuración de Puppeteer para Alpine
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

# Copiar dependencias y código desde el stage 'builder'
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/index.js ./

# Crear directorio para outputs y ajustar permisos
RUN mkdir -p output && chown -R node:node /app

# Seguridad: usar usuario no-root
USER node

# Variables de entorno por defecto
ENV HEADLESS=true

# Entrypoint para manejo de procesos
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

CMD ["node", "index.js"]