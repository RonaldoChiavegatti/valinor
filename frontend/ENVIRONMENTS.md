# Configuração de Ambientes

Este documento explica a estrutura de configuração de ambientes no projeto Angular, com foco em segurança.

## Visão Geral

A configuração de ambientes foi implementada para garantir a segurança das credenciais:

1. `environment.ts` - Configuração para desenvolvimento (sem credenciais sensíveis)
2. `environment.prod.ts` - Configuração para produção (sem credenciais sensíveis)
3. `runtime-env.js` - Configurações básicas em tempo de execução (sem credenciais sensíveis)
4. `firebase-config.js` - Configurações sensíveis do Firebase (gerado dinamicamente, não incluído no controle de versão)

**IMPORTANTE**: As credenciais sensíveis (como chaves de API do Firebase) NÃO são mais incluídas nos arquivos de ambiente compilados. Em vez disso, são carregadas em tempo de execução a partir do arquivo `firebase-config.js`, que é gerado dinamicamente e não é incluído no controle de versão.

## Como Funciona

### 1. Configuração das Variáveis de Ambiente

As variáveis de ambiente são definidas no arquivo `.env` na raiz do projeto frontend:

```env
# Firebase Configuration
FIREBASE_API_KEY=your_api_key_here
FIREBASE_AUTH_DOMAIN=your_auth_domain_here
FIREBASE_PROJECT_ID=your_project_id_here
FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
FIREBASE_APP_ID=your_app_id_here
FIREBASE_MEASUREMENT_ID=your_measurement_id_here

# API URLs
GRAPHQL_URL=https://kanban-deploy-fmfj.onrender.com/graphql

# Environment
NODE_ENV=development
```

### 2. Processo de Build

1. Quando você executa `npm start` ou `npm run build`, o script `build-env-config.js` é executado primeiro
2. O script gera dinamicamente os arquivos `environment.ts` e `environment.prod.ts` com base nas variáveis de ambiente, mas NÃO inclui credenciais sensíveis
3. Também gera um arquivo `runtime-env.js` com configurações básicas (sem credenciais sensíveis)
4. Gera um arquivo `firebase-config.js` separado com as configurações sensíveis do Firebase

### 3. Carregamento em Tempo de Execução

1. O arquivo `runtime-env.js` é carregado no `index.html` antes da aplicação Angular
2. O `runtime-env.js` tenta carregar as configurações do Firebase do localStorage (se disponível)
3. Se não encontrar no localStorage, carrega dinamicamente o arquivo `firebase-config.js`
4. O `firebase-config.js` contém as credenciais sensíveis e as salva no localStorage para uso futuro
5. A aplicação Angular usa essas configurações em tempo de execução, em vez de usar valores hardcoded

## Segurança

Esta abordagem oferece várias camadas de segurança:

1. **Credenciais não expostas no código compilado**: As credenciais sensíveis não são incluídas nos arquivos JavaScript compilados
2. **Arquivo .env no .gitignore**: O arquivo `.env` está listado no `.gitignore` para garantir que não seja acidentalmente compartilhado
3. **Arquivo firebase-config.js no .gitignore**: O arquivo com as credenciais do Firebase também está listado no `.gitignore`
4. **Carregamento em tempo de execução**: As credenciais são carregadas apenas quando necessário, em tempo de execução
5. **Armazenamento no localStorage**: As credenciais são armazenadas no localStorage para uso futuro, evitando a necessidade de carregar o arquivo `firebase-config.js` repetidamente
6. **Validação de configurações**: A aplicação verifica se as configurações necessárias estão disponíveis antes de inicializar serviços sensíveis

## Variáveis de Ambiente Disponíveis

| Variável | Descrição |
|----------|-----------|
| `GRAPHQL_URL` | URL do GraphQL |
| `FIREBASE_*` | Configurações do Firebase |
| `NODE_ENV` | Ambiente atual (`development` ou `production`) |

## Executando o Projeto

1. Para desenvolvimento:
   ```bash
   npm start
   ```

2. Para build de produção:
   ```bash
   NODE_ENV=production npm run build
   ```

3. Para servir a aplicação após build:
   ```bash
   ./rebuild.sh
   npx angular-http-server --path dist/kanban-board
   ```

## Por que esta abordagem?

Esta abordagem foi adotada para:

1. **Melhorar a segurança**: Evitar a exposição de credenciais sensíveis no código compilado
2. **Facilitar a configuração**: Permitir a configuração de ambientes sem recompilar o código
3. **Garantir consistência**: Usar as mesmas configurações em todos os ambientes
4. **Facilitar testes**: Permitir que o desenvolvimento seja testado diretamente contra os dados de produção
5. **Otimizar o carregamento**: Armazenar as credenciais no localStorage para uso futuro, evitando carregamentos desnecessários 