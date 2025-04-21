FROM node:20-alpine

WORKDIR /app

# Copiar arquivos de configuração
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./
COPY theme.json ./
COPY .env.example ./

# Instalar dependências
RUN npm install

# Copiar código-fonte
COPY client ./client
COPY server ./server
COPY shared ./shared

# Criar arquivo .env com as variáveis de ambiente
# Essas serão substituídas pelas variáveis de ambiente do EasyPanel
RUN echo "VITE_FIREBASE_API_KEY=\${VITE_FIREBASE_API_KEY}" > .env && \
    echo "VITE_FIREBASE_PROJECT_ID=\${VITE_FIREBASE_PROJECT_ID}" >> .env && \
    echo "VITE_FIREBASE_APP_ID=\${VITE_FIREBASE_APP_ID}" >> .env && \
    echo "PORT=\${PORT:-3000}" >> .env && \
    echo "HOST=0.0.0.0" >> .env && \
    echo "SESSION_SECRET=\${SESSION_SECRET:-imobsite-secret-key}" >> .env

# Construir o projeto para produção
RUN npm run build

# Expor a porta do servidor
EXPOSE 3000

# Iniciar o servidor
CMD ["npm", "start"]