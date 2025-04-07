#!/usr/bin/env node

/**
 * Script para gerar configurações de ambiente com variáveis de ambiente durante o build
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Verificar se é ambiente de produção
const isProd = process.env.NODE_ENV === 'production';
console.log(`Ambiente de build: ${isProd ? 'PRODUÇÃO' : 'DESENVOLVIMENTO'}`);
console.log('IMPORTANTE: Usando apenas a URL do GraphQL em produção para todos os ambientes.');

// Gerar conteúdo do arquivo de ambiente
function generateEnvironmentContent(isProd) {
  return `// Este arquivo foi gerado automaticamente pelo script build-env-config.js
// ${isProd ? 'AMBIENTE DE PRODUÇÃO' : 'AMBIENTE DE DESENVOLVIMENTO'}
// IMPORTANTE: As configurações sensíveis são carregadas em tempo de execução

export const environment = {
  production: ${isProd},
  useEmulators: false,
  graphqlUrl: '${process.env.GRAPHQL_URL || 'https://kanban-deploy-fmfj.onrender.com/graphql'}',
  // As configurações do Firebase serão carregadas em tempo de execução
  firebase: {
    // Estas são apenas referências, os valores reais serão carregados em tempo de execução
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: ""
  }
};`;
}

// Configurar caminhos
const environmentDir = path.join(__dirname, 'src', 'environments');

// Criar o diretório de ambientes se não existir
if (!fs.existsSync(environmentDir)) {
  fs.mkdirSync(environmentDir, { recursive: true });
}

// Gerar arquivos de ambiente
try {
  // Gerar environment.ts padrão para desenvolvimento (mas com URLs de produção)
  const envContent = generateEnvironmentContent(false);
  fs.writeFileSync(path.join(environmentDir, 'environment.ts'), envContent, 'utf8');
  console.log('Arquivo environment.ts gerado com sucesso.');
  
  // Gerar environment.prod.ts para produção
  const prodEnvContent = generateEnvironmentContent(true);
  fs.writeFileSync(path.join(environmentDir, 'environment.prod.ts'), prodEnvContent, 'utf8');
  console.log('Arquivo environment.prod.ts gerado com sucesso.');

  // Criar um arquivo de ambiente em tempo real para o runtime-env
  // Isso será usado no index.html para injetar variáveis em tempo de execução
  const runtimeEnv = {
    production: isProd,
    graphqlUrl: process.env.GRAPHQL_URL || 'https://kanban-deploy-fmfj.onrender.com/graphql',
    // Incluir as configurações do Firebase para serem carregadas em tempo de execução
    firebase: {
      apiKey: process.env.FIREBASE_API_KEY || '',
      authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
      projectId: process.env.FIREBASE_PROJECT_ID || '',
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
      appId: process.env.FIREBASE_APP_ID || '',
      measurementId: process.env.FIREBASE_MEASUREMENT_ID || ''
    }
  };
  
  // Criar diretório de assets se não existir
  const assetsDir = path.join(__dirname, 'src', 'assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }
  
  // Salvar o runtime-env.js
  const runtimeContent = `// Gerado automaticamente pelo build-env-config.js
window.ENV = ${JSON.stringify(runtimeEnv, null, 2)};`;
  fs.writeFileSync(path.join(assetsDir, 'runtime-env.js'), runtimeContent, 'utf8');
  console.log('Arquivo runtime-env.js gerado com sucesso.');
  
  console.log('Configuração de ambiente concluída!');
} catch (error) {
  console.error('Erro ao gerar arquivos de ambiente:', error);
  process.exit(1);
} 