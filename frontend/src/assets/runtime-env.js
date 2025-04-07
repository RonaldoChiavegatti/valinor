// Gerado automaticamente pelo build-env-config.js
// As configurações sensíveis serão carregadas em tempo de execução
window.ENV = {
  "production": false,
  "graphqlUrl": "https://kanban-deploy-fmfj.onrender.com/graphql"
};

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
})();