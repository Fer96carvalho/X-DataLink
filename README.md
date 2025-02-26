# X-DataLink

## Descrição
O **X-DataLink** é um sistema distribuído para armazenamento e compartilhamento de arquivos. Ele permite que os usuários realizem upload, download e compartilhem arquivos de forma segura e escalável. A autenticação é feita via Google OAuth 2.0, garantindo facilidade de acesso.

## Tecnologias Utilizadas

### Front-end:
- **Framework**: Next.js
- **Autenticação**: OAuth 2.0 com Google
- **Interface responsiva**

### Back-end:
- **Linguagem**: Node.js
- **Framework**: Express
- **Banco de Dados**: PostgreSQL com Supabase
- **Armazenamento de Arquivos**: Supabase Bucket ou armazenamento local
- **Mensageria**: RabbitMQ para processamento assíncrono

## Funcionalidades
- Autenticação social via Google
- Upload e download de arquivos
- Compartilhamento de arquivos com controle de permissões
- Registro de logs de atividades

## Arquitetura do Sistema
O sistema segue uma arquitetura distribuída composta pelos seguintes componentes:
- **Frontend**: Interface web desenvolvida em Next.js
- **Backend**: API REST em Node.js com Express
- **Banco de Dados**: PostgreSQL gerenciado pelo Supabase
- **Autenticação**: OAuth 2.0 via Google
- **Armazenamento**: Supabase ou solução local
- **Mensageria**: RabbitMQ para processamento assíncrono

## Requisitos
- Node.js 18+
- PostgreSQL
  
## Instalação e Execução

1. Clone o repositório:
   ```sh
   git clone https://github.com/seu-usuario/x-datalink.git
   cd x-datalink
   ```

2. Instale as dependências do backend:
   ```sh
   cd backend
   npm install
   ```

3. Configure as variáveis de ambiente do backend no arquivo `.env`:
   ```env
   SecretKey=
   NameAdmin=
   EmailAdmin=
   PasswordAdmin=
   ServerPort=
   SUPABASE_URL=
   SUPABASE_SERVICE_ROLE_KEY=
   GoogleID=
   GoogleKey=
  
   ```

4. Execute o backend:
   ```sh
   npm run dev
   ```

5. Instale as dependências do frontend:
   ```sh
   cd ../frontend
   npm install
   ```
7. Configure as variáveis de ambiente do frontend no arquivo `.env`:
   ```env
   GOOGLE_CLIENT_ID=
   GOOGLE_CLIENT_SECRET=
   NEXTAUTH_SECRET=
   NEXT_PUBLIC_API_URL=
  
   ```
6. Execute o frontend:
   ```sh
   npm run dev
   ```

## Contribuição
Sinta-se à vontade para abrir issues e pull requests para melhorias no projeto.

## Licença
Este projeto está sob a licença MIT.

