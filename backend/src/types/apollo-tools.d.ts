declare module '@apollographql/apollo-tools' {
  // Sobrescreve a função buildServiceDefinition para aceitar erro como unknown
  export function buildServiceDefinition(
    config: any,
    serviceDefs: any[],
    options?: any
  ): {
    typeDefs: any;
    resolvers?: any;
    schema?: any;
    errors?: unknown[];
  };
} 