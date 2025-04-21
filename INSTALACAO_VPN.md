# Guia de Instalação para Ambiente VPN

Este documento fornece instruções detalhadas para implantar o sistema ImobSite em um ambiente VPN.

## Pré-requisitos

Antes de iniciar a instalação, verifique se você tem:

- Node.js 16+ instalado no servidor
- Acesso ao Firebase (para criar um novo projeto)
- Servidor com endereço IP estático ou nome de domínio configurado
- Permissões para configurar redirecionamento de portas no ambiente VPN

## Passo 1: Configurar o Firebase

1. Acesse [console.firebase.google.com](https://console.firebase.google.com) e crie um novo projeto
2. Na seção "Authentication", habilite o método de login por Email/Senha
3. Na seção "Firestore Database", crie um banco de dados em modo de produção
4. Na seção "Project Settings" > "General", role até a parte inferior e adicione um app da Web
   - Registre o nome do aplicativo como "ImobSite"
   - Após a criação, você receberá as credenciais do Firebase (apiKey, authDomain, etc.)

## Passo 2: Configurar o arquivo .env

1. Copie o arquivo `.env.example` para `.env`:
   ```
   cp .env.example .env
   ```

2. Edite o arquivo `.env` e preencha as informações do Firebase que você obteve no passo anterior:
   ```
   VITE_FIREBASE_API_KEY=sua-api-key
   VITE_FIREBASE_PROJECT_ID=seu-project-id
   VITE_FIREBASE_MESSAGING_SENDER_ID=seu-messaging-sender-id
   VITE_FIREBASE_APP_ID=seu-app-id
   ```

3. Configure as variáveis específicas do seu ambiente VPN:
   ```
   PORT=3000
   HOST=0.0.0.0
   VPN_DOMAIN=seu-dominio-ou-ip-vpn
   SESSION_SECRET=uma-senha-segura-para-sessao
   ```

## Passo 3: Instalar Dependências e Compilar o Projeto

1. Instale as dependências do projeto:
   ```
   npm install
   ```

2. Compile o projeto para produção:
   ```
   npm run build
   ```

## Passo 4: Executar o Servidor em Produção

1. Inicie o servidor usando um gerenciador de processos como PM2:
   ```
   npm install -g pm2
   pm2 start npm --name "imobsite" -- start
   ```

2. Configure o PM2 para iniciar automaticamente após reinicializações do servidor:
   ```
   pm2 startup
   pm2 save
   ```

## Passo 5: Configurar o Acesso via VPN

1. Configure o redirecionamento de portas na sua VPN para a porta 3000 do servidor onde o sistema está instalado.

2. Se você estiver usando um domínio para acessar o sistema, configure o DNS para apontar para o endereço IP da sua VPN.

3. Teste o acesso ao sistema através da URL configurada:
   ```
   http://seu-dominio-ou-ip-vpn:3000
   ```

## Considerações de Segurança

- Para maior segurança, considere configurar um proxy reverso como Nginx ou Apache para servir o aplicativo
- Implemente HTTPS usando Let's Encrypt para criptografar o tráfego
- Revise regularmente as regras de firewall para garantir que apenas as portas necessárias estejam abertas

## Solução de Problemas

### Verificando Logs

Para verificar os logs do aplicativo:
```
pm2 logs imobsite
```

### Reiniciando o Serviço

Se encontrar problemas, tente reiniciar o serviço:
```
pm2 restart imobsite
```

### Firebase

Se enfrentar problemas com o Firebase:
1. Verifique se as credenciais no arquivo `.env` estão corretas
2. Certifique-se de que o endereço IP do servidor está autorizado nas regras de segurança do Firebase
3. Verifique se o Firestore está configurado corretamente e com as regras de acesso adequadas

## Autenticação do Sistema

O sistema vem com as seguintes credenciais padrão:
- Usuário: imobsite
- Senha: Admstation12345

Por razões de segurança, considere alterar essas credenciais após a instalação.

## Suporte

Para obter suporte adicional ou reportar problemas, entre em contato conosco através do email suporte@imobsite.com