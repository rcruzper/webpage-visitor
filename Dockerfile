FROM node:18-slim

# Instalar últimas actualizaciones y dependencias para Puppeteer
# Se añade dumb-init para manejar correctamente los procesos (evita zombies de Chrome)
RUN apt-get update && apt-get install -y \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    wget \
    xdg-utils \
    libxshmfence1 \
    dumb-init \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Configurar directorio de trabajo
WORKDIR /app

# Configurar directorio de caché de Puppeteer en una ruta accesible
ENV PUPPETEER_CACHE_DIR=/app/.cache

# Copiar solo package.json para evitar usar el lockfile local (con URLs privadas)
COPY package.json ./

# Instalar dependencias de Node.js
RUN npm install

# Copiar el resto del código
COPY . .

# Crear directorio para outputs
RUN mkdir -p output

# Cambiar permisos al usuario 'node'
RUN chown -R node:node /app

# Cambiar al usuario no-root
USER node

# Variable de entorno por defecto
ENV HEADLESS=true

# Usar dumb-init como entrypoint para manejar señales correctamente
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Comando de inicio
CMD [ "node", "index.js" ]