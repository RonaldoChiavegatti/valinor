declare module '@apollographql/apollo-tools' {
  import { GraphQLError } from 'graphql';
  
  // Adicionamos esta interface auxiliar para permitir a atribuição de unknown para GraphQLError
  interface GraphQLErrorExtended extends GraphQLError {
    // Propriedade arbitrária para permitir atribuição de unknown
    __allowUnknown?: unknown;
  }
  
  // Re-exportando o tipo de GraphQLError
  export type { GraphQLErrorExtended as GraphQLError };
} 