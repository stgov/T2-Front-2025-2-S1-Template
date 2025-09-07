# Dockerfile para el frontend (React/Vite)
FROM node:22-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración primero para aprovechar el cache de Docker
COPY package.json ./

# Instalar dependencias usando npm
RUN npm install

# Copiar el resto del código fuente
COPY . .

# Exponer el puerto
EXPOSE 8000

# Comando para ejecutar la aplicación en modo desarrollo
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "8000"]
