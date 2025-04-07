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
    graphqlUrl: process.env.GRAPHQL_URL || 'https://kanban-deploy-fmfj.onrender.com/graphql'
  };
  
  // Criar diretório de assets se não existir
  const assetsDir = path.join(__dirname, 'src', 'assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }
  
  // Salvar o runtime-env.js - sem incluir credenciais sensíveis
  const runtimeContent = `// Gerado automaticamente pelo build-env-config.js
// As configurações sensíveis serão carregadas em tempo de execução
window.ENV = ${JSON.stringify(runtimeEnv, null, 2)};

// Função para carregar configurações sensíveis do Firebase
(function() {
  // Verificar se já existe um objeto de configuração do Firebase
  if (!window.ENV.firebase) {
    window.ENV.firebase = {};
  }
  
  // Carregar configurações do Firebase do localStorage (se disponível)
  try {
    const firebaseConfig = localStorage.getItem('firebaseConfig');
    if (firebaseConfig) {
      window.ENV.firebase = JSON.parse(firebaseConfig);
      console.log('Configurações do Firebase carregadas do localStorage');
      return;
    }
  } catch (e) {
    console.error('Erro ao carregar configurações do Firebase do localStorage:', e);
  }
  
  // Se não houver configurações no localStorage, carregar do arquivo .env.js
  // Este arquivo será gerado separadamente e não será incluído no controle de versão
  const script = document.createElement('script');
  script.src = 'assets/firebase-config.js';
  script.onerror = function() {
    console.error('Erro ao carregar firebase-config.js. Verifique se o arquivo existe.');
  };
  document.head.appendChild(script);
})();`;
  
  fs.writeFileSync(path.join(assetsDir, 'runtime-env.js'), runtimeContent, 'utf8');
  console.log('Arquivo runtime-env.js gerado com sucesso.');
  
  // Gerar um arquivo firebase-config.js separado com as configurações do Firebase
  // Este arquivo NÃO será incluído no controle de versão
  const firebaseConfigContent = `// Gerado automaticamente pelo build-env-config.js
// Este arquivo contém configurações sensíveis e NÃO deve ser incluído no controle de versão
window.ENV.firebase = ${JSON.stringify({
    apiKey: process.env.FIREBASE_API_KEY || '',
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.FIREBASE_APP_ID || '',
    measurementId: process.env.FIREBASE_MEASUREMENT_ID || ''
  }, null, 2)};

// Salvar no localStorage para uso futuro
try {
  localStorage.setItem('firebaseConfig', JSON.stringify(window.ENV.firebase));
  console.log('Configurações do Firebase salvas no localStorage');
} catch (e) {
  console.error('Erro ao salvar configurações do Firebase no localStorage:', e);
}`;
  
  fs.writeFileSync(path.join(assetsDir, 'firebase-config.js'), firebaseConfigContent, 'utf8');
  console.log('Arquivo firebase-config.js gerado com sucesso.');
  
  // Adicionar firebase-config.js ao .gitignore se ainda não estiver lá
  const gitignorePath = path.join(__dirname, '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    let gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    if (!gitignoreContent.includes('firebase-config.js')) {
      gitignoreContent += '\n# Arquivo de configuração do Firebase (contém credenciais sensíveis)\nfirebase-config.js\n';
      fs.writeFileSync(gitignorePath, gitignoreContent, 'utf8');
      console.log('firebase-config.js adicionado ao .gitignore');
    }
  }
  
  console.log('Configuração de ambiente concluída!');
} catch (error) {
  console.error('Erro ao gerar arquivos de ambiente:', error);
  process.exit(1);
} 