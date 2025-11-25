# Usar la imagen oficial de Node.js
FROM node:22.13.1-alpine

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar archivos de definición de paquetes
COPY Formularios-dev/package*.json ./
COPY Formularios-dev/yarn.lock* ./

# Instalar dependencias
RUN yarn install --frozen-lockfile

# Copiar el resto del código
COPY Formularios-dev/ .

# ✅ CRÍTICO: Declarar ARG para capturar la variable en build-time
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

ARG NEXT_PUBLIC_KEYCLOAK_ISSUER
ENV NEXT_PUBLIC_KEYCLOAK_ISSUER=${NEXT_PUBLIC_KEYCLOAK_ISSUER}

# Debug: Verificar el valor
RUN echo "========================================="
RUN echo "🔍 NEXT_PUBLIC_API_URL: $NEXT_PUBLIC_API_URL"
RUN echo "========================================="

# Construir la aplicación (Next.js lee NEXT_PUBLIC_API_URL aquí)
RUN yarn build

# Exponer el puerto
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["yarn", "start"]