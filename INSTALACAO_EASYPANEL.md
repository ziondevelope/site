# Guia de Instalação do Sistema ImobSite no EasyPanel

Este guia fornece instruções passo a passo para implantar o sistema ImobSite em um servidor usando EasyPanel.

## Pré-requisitos

1. Servidor com EasyPanel instalado e configurado
2. Acesso administrativo ao painel do EasyPanel
3. Domínio ou subdomínio configurado para o sistema (opcional, mas recomendado)

## Passo 1: Preparar o Código-Fonte

Duas opções para obter o código-fonte:

### Opção 1: Download direto do Replit
1. No Replit, clique em "Files" no painel lateral esquerdo
2. Selecione os três pontos (...) e escolha "Download as zip"
3. Salve o arquivo ZIP em seu computador

### Opção 2: Usar Git (se disponível)
```
git clone [URL-DO-REPOSITORIO]
cd [NOME-DO-PROJETO]
```

## Passo 2: Configurar o Projeto para o EasyPanel

Verifique se os arquivos `Dockerfile` e `docker-compose.yml` já estão incluídos no projeto. Caso não estejam, crie-os conforme as instruções abaixo:

### Dockerfile
```dockerfile
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
```

### docker-compose.yml
```yaml
version: '3'
services:
  imobsite:
    build: .
    container_name: imobsite-crm
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - VITE_FIREBASE_API_KEY=AIzaSyD5NShwJQyEN8znPckPr_KafH-C2MtL-zA
      - VITE_FIREBASE_PROJECT_ID=cadastro-web-fa5dd
      - VITE_FIREBASE_APP_ID=1:256771876237:web:299156662370a64c0f89c4
      - PORT=3000
      - SESSION_SECRET=imobsite-secret-key
      - NODE_ENV=production
```

## Passo 3: Implantar no EasyPanel

1. **Acesse o EasyPanel** navegando para o URL de administração (geralmente https://seu-servidor:3000).

2. **Faça login** com suas credenciais de administrador.

3. **Crie um novo serviço**:
   - Clique em "Adicionar Serviço" ou "Criar Novo Serviço"
   - Selecione "Criar a partir do Docker Compose" ou opção similar

4. **Configure o serviço**:
   - **Nome do Serviço**: ImobSite
   - **Domínio** (opcional): Insira o domínio ou subdomínio dedicado para o sistema
   - **Porta**: 3000
   - **Variáveis de Ambiente**: Preencha com as informações do Firebase:
     ```
     VITE_FIREBASE_API_KEY=AIzaSyD5NShwJQyEN8znPckPr_KafH-C2MtL-zA
     VITE_FIREBASE_PROJECT_ID=cadastro-web-fa5dd
     VITE_FIREBASE_APP_ID=1:256771876237:web:299156662370a64c0f89c4
     SESSION_SECRET=imobsite-secret-key
     NODE_ENV=production
     ```

5. **Faça upload do código**:
   - Selecione a opção para fazer upload de arquivos
   - Faça upload do arquivo ZIP do projeto ou forneça a URL do repositório Git

6. **Inicie o serviço**:
   - Clique em "Deploy" ou "Iniciar Serviço"
   - O EasyPanel irá construir a imagem Docker e iniciar o contêiner

7. **Verifique o status**:
   - Monitore os logs para garantir que o serviço tenha iniciado corretamente
   - Acesse o URL do serviço para verificar se o sistema está funcionando

## Passo 4: Configurar Proxy Reverso e HTTPS (Opcional, mas Recomendado)

Se você estiver usando um domínio personalizado, configure o proxy reverso e o HTTPS:

1. No EasyPanel, vá para a seção de "Configurações" ou "Proxy"
2. Configure o proxy reverso para redirecionar o tráfego para o serviço ImobSite
3. Ative o HTTPS usando Let's Encrypt ou um certificado personalizado

## Solução de Problemas

1. **O serviço não inicia:**
   - Verifique os logs do contêiner para identificar erros
   - Certifique-se de que as variáveis de ambiente estão configuradas corretamente

2. **Não é possível acessar o sistema:**
   - Verifique se a porta 3000 está aberta no firewall
   - Confirme se o proxy reverso está configurado corretamente

3. **Erro ao conectar ao Firebase:**
   - Verifique se as credenciais do Firebase estão corretas
   - Certifique-se de que as regras de segurança do Firebase permitem conexões do servidor

## Acesso ao Sistema

Após a instalação bem-sucedida, você pode acessar o sistema usando as credenciais padrão:

- **Usuário**: imobsite
- **Senha**: Admstation12345

Por razões de segurança, considere alterar essas credenciais após o primeiro acesso.

## Manutenção e Atualizações

Para atualizar o sistema no futuro:

1. Obtenha a versão mais recente do código-fonte
2. Reimplante o serviço no EasyPanel seguindo as etapas acima
3. O EasyPanel irá reconstruir a imagem Docker e reiniciar o contêiner automaticamente