FROM node:16-alpine

WORKDIR /app

# Definir variáveis de ambiente para evitar problemas de cache
ENV NODE_ENV=development

# Copiar package files
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar source code
COPY . .

# Criar diretório de cache com permissões adequadas
RUN mkdir -p node_modules/.cache && chmod -R 777 node_modules/.cache

EXPOSE 3000

# Usar a variável de ambiente para React
ENV CHOKIDAR_USEPOLLING=true

CMD ["npm", "start"]