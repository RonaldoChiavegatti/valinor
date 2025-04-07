declare module 'graphql-tag' {
  import { DocumentNode } from 'graphql';
  
  interface GraphQLTag {
    (template: TemplateStringsArray, ...substitutions: any[]): DocumentNode;
    default: GraphQLTag;
  }
  
  const gql: GraphQLTag;
  export default gql;
} 