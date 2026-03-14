# Etapa 1: Construcción (Build)
FROM node:20-alpine AS builder

WORKDIR /app

# Copiamos los archivos de dependencias (soporta npm, yarn o pnpm)
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./

# Instalamos las dependencias
RUN npm install

# Copiamos el resto del código
COPY . .

# Construimos la aplicación para producción
RUN npm run build

# Etapa 2: Servidor Web (Nginx) para producción
FROM nginx:alpine

# Configuramos Nginx para usar el puerto 4531 y manejar el enrutamiento de React (SPA)
RUN echo "server { \
    listen 4531; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files \$uri \$uri/ /index.html; \
    } \
}" > /etc/nginx/conf.d/default.conf

# Copiamos los archivos estáticos construidos en la etapa anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponemos el puerto 4531
EXPOSE 4531

# Iniciamos Nginx
CMD ["nginx", "-g", "daemon off;"]
