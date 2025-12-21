FROM node:18-alpine

# Instalar Chromium y dependencias necesarias para Alpine
# No necesitamos instalar librerías extrañas, el paquete 'chromium' de Alpine ya trae lo necesario.
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    dumb-init

# Configurar variables de entorno CRÍTICAS para Alpine
# 1. Decirle a Puppeteer que NO descargue su propio Chrome (no funcionaría en Alpine)
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
# 2. Decirle a Puppeteer dónde está el Chromium de Alpine
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Configurar directorio de trabajo
WORKDIR /app

# Copiar solo package.json
COPY package.json ./

# Instalar dependencias de Node.js
RUN npm install

# Copiar el resto del código
COPY . .

# Crear directorio para outputs y ajustar permisos
RUN mkdir -p output && chown -R node:node /app

# Cambiar al usuario no-root
USER node

# Variable de entorno para la app
ENV HEADLESS=true

# Usar dumb-init como entrypoint
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Comando de inicio
CMD [ "node", "index.js" ]
