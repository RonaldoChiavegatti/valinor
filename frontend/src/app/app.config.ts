import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { initializeApp } from 'firebase/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { provideFirebaseApp } from '@angular/fire/app';
import { getAnalytics } from 'firebase/analytics';
import { FIREBASE_OPTIONS } from '@angular/fire/compat';
import { Apollo } from 'apollo-angular';

import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { authInterceptor } from './services/auth.interceptor';
import { GraphQLModule } from './graphql.module';

// Função para inicializar o Firebase com as configurações disponíveis
function initializeFirebase() {
  // Obter a configuração do Firebase de window.ENV ou fallback para environment
  const firebaseConfig = (window as any).ENV?.firebase || environment.firebase;

  // Verificar se as configurações do Firebase estão disponíveis
  if (!firebaseConfig.apiKey) {
    console.error('ERRO: Configurações do Firebase não estão disponíveis. Verifique o arquivo .env e o runtime-env.js');
    // Retornar uma configuração vazia para evitar erros
    return initializeApp({});
  }

  // Configuração para desabilitar os avisos de Firebase API fora do contexto de injeção
  (window as any).firebase = {
    ...(window as any).firebase,
    FIREBASE_APPCHECK_DEBUG_TOKEN: true,
    // Desativar avisos de Zone
    USE_EMULATOR: environment.useEmulators || false,
    // Desabilitar logs do Firebase Zone
    logLevel: 'silent',
    // Suprimir console.log durante a inicialização do Firebase
    INTERNAL_SUPRESS_VERBOSE_LOGGING: true
  };

  // Desabilitar logs verbosos do SDK do Firebase
  // @ts-ignore - Acessar uma propriedade não documentada para suprimir logs
  window.FIREBASE_APPCHECK_DEBUG_TOKEN = true;

  // Inicializar o Firebase sem exibir credenciais no console
  return initializeApp(firebaseConfig);
}

// Inicializar o Firebase
const firebaseApp = initializeFirebase();

// Inicializar o Analytics apenas em produção ou se necessário
if (environment.production) {
  const analytics = getAnalytics(firebaseApp);
}

// Configuração da aplicação
export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideRouter(routes, withHashLocation()),
    // Firebase
    importProvidersFrom(
      provideFirebaseApp(() => firebaseApp),
      provideAuth(() => getAuth(firebaseApp)),
      provideFirestore(() => getFirestore(firebaseApp)),
      provideStorage(() => getStorage(firebaseApp))
    ),
    // Adicionar configuração para desabilitar logs
    {
      provide: FIREBASE_OPTIONS,
      useValue: {
        ...(window as any).ENV?.firebase || environment.firebase,
        logLevel: 'silent' // 'silent', 'error', 'warn', 'info', 'debug', 'verbose'
      }
    },
    // GraphQL
    importProvidersFrom(GraphQLModule),
    // Para permitir a injeção do Apollo
    Apollo
  ]
}; 