import { NgModule } from '@angular/core';
import { Apollo, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLink, HttpLinkHandler } from 'apollo-angular/http';
import { ApolloLink, InMemoryCache } from '@apollo/client/core';
import { onError } from '@apollo/client/link/error';
import { environment } from '../environments/environment';
import { setContext } from '@apollo/client/link/context';
import { AuthService } from './services/auth.service';
import { inject } from '@angular/core';

export function createApollo(httpLink: HttpLink, authService: AuthService) {
  console.log('Inicializando Apollo GraphQL...');
  
  // Obter a URL do GraphQL de window.ENV ou fallback para environment
  const graphqlUrl = (window as any).ENV?.graphqlUrl || environment.graphqlUrl;
  console.log('Usando GraphQL URL:', graphqlUrl);
  
  // Criar um link para a API GraphQL
  const http = httpLink.create({
    uri: graphqlUrl,
  });

  // Interceptação de erros
  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, locations, path }) => {
        console.error(
          `[GraphQL error]: ${message}`,
          path ? `Path: ${path}` : ''
        );
      });
    }
    if (networkError) {
      console.error(`[Network error]`);
    }
  });

  // Link de autenticação
  const authLink = setContext((_, { headers }) => {
    // Obter o token de autenticação
    const token = authService.getToken();
    
    // Log para depuração - sem informações sensíveis
    console.log('Status do token:', token ? 'Disponível' : 'Indisponível');
    
    // Adicionar o token ao headers
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
      },
    };
  });

  // Combinar os links
  const link = ApolloLink.from([authLink, errorLink, http]);

  // Configurar o cache
  const cache = new InMemoryCache({
    typePolicies: {
      Board: {
        fields: {
          columns: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
          // Política para createdAt
          createdAt: {
            read(createdAt) {
              if (typeof createdAt === 'object' && createdAt !== null) {
                try {
                  // Tentar converter diferentes formatos de objeto de data
                  if ('toDate' in createdAt && typeof createdAt.toDate === 'function') {
                    return createdAt.toDate().toISOString();
                  } else if ('seconds' in createdAt && typeof createdAt.seconds === 'number') {
                    return new Date(createdAt.seconds * 1000).toISOString();
                  }
                } catch (error) {
                  console.error('Erro ao converter createdAt no cache:', error);
                }
              }
              return createdAt;
            }
          }
        },
      },
      Column: {
        fields: {
          cards: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
        },
      },
      Card: {
        fields: {
          // Política para dueDate
          dueDate: {
            read(dueDate) {
              if (typeof dueDate === 'object' && dueDate !== null) {
                try {
                  // Tentar converter diferentes formatos de objeto de data
                  if ('toDate' in dueDate && typeof dueDate.toDate === 'function') {
                    return dueDate.toDate().toISOString();
                  } else if ('seconds' in dueDate && typeof dueDate.seconds === 'number') {
                    return new Date(dueDate.seconds * 1000).toISOString();
                  }
                } catch (error) {
                  console.error('Erro ao converter dueDate no cache:', error);
                }
              }
              return dueDate;
            }
          }
        }
      }
    },
  });

  return {
    link,
    cache,
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'network-only',
        errorPolicy: 'ignore',
      },
      query: {
        fetchPolicy: 'network-only',
        errorPolicy: 'all',
      },
    },
  };
}

@NgModule({
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: createApollo,
      deps: [HttpLink, AuthService],
    },
  ],
})
export class GraphQLModule {
  constructor() {
    console.debug('GraphQL Module inicializado');
  }
} 