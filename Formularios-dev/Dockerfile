# Usar la imagen oficial de Node.js
FROM node:22-alpine

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar archivos de definición de paquetes
COPY package*.json ./
COPY yarn.lock* ./

# Instalar dependencias
RUN yarn install --frozen-lockfile

# Copiar el resto del código
COPY . .

# Construir la aplicación
RUN yarn build

# Exponer el puerto
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["yarn", "start"]