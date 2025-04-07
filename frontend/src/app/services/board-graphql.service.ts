import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { gql } from '@apollo/client/core';
import { Observable, map, catchError, throwError, of, tap } from 'rxjs';
import { Board, Card, Column } from '../models/board.model';
import { AuthService } from './auth.service';
import { MutationResult } from 'apollo-angular';

type ApolloMutationResult<T> = MutationResult<T> & {
  data?: T;
};

// Definição de queries GraphQL
const GET_BOARDS = gql`
  query GetBoards {
    boards {
      id
      title
      userId
      createdAt
      columns {
        id
        title
        color
        cardLimit
        cards {
          id
          title
          description
          order
          dueDate
          tags {
            id
            name
            color
          }
          attachments {
            id
            name
            url
            type
          }
        }
      }
    }
  }
`;

const GET_BOARD = gql`
  query GetBoard($id: String!) {
    board(id: $id) {
      id
      title
      userId
      createdAt
      columns {
        id
        title
        color
        cardLimit
        cards {
          id
          title
          description
          order
          dueDate
          tags {
            id
            name
            color
          }
          attachments {
            id
            name
            url
            type
          }
        }
      }
    }
  }
`;

const CREATE_BOARD = gql`
  mutation CreateBoard($input: BoardInput!) {
    createBoard(input: $input) {
      id
      title
      columns {
        id
        title
        color
        cardLimit
        cards {
          id
          title
          description
          order
        }
      }
    }
  }
`;

const UPDATE_BOARD = gql`
  mutation UpdateBoard($id: String!, $input: BoardInput!) {
    updateBoard(id: $id, input: $input) {
      id
      title
      userId
      createdAt
      columns {
        id
        title
        color
        cardLimit
        cards {
          id
          title
          description
          order
        }
      }
    }
  }
`;

const ADD_COLUMN = gql`
  mutation AddColumn($boardId: String!, $input: ColumnInput!) {
    addColumn(boardId: $boardId, input: $input) {
      id
      title
      columns {
        id
        title
        color
        cardLimit
        cards {
          id
          title
          description
          order
        }
      }
    }
  }
`;

const UPDATE_COLUMN = gql`
  mutation UpdateColumn($boardId: String!, $columnId: String!, $input: ColumnUpdateInput!) {
    updateColumn(boardId: $boardId, columnId: $columnId, input: $input) {
      id
      title
      columns {
        id
        title
        color
        cardLimit
        cards {
          id
          title
          description
          order
          dueDate
          tags {
            id
            name
            color
          }
          attachments {
            id
            name
            url
            type
          }
        }
      }
    }
  }
`;

const DELETE_COLUMN = gql`
  mutation DeleteColumn($boardId: String!, $columnId: String!) {
    deleteColumn(boardId: $boardId, columnId: $columnId) {
      id
      columns {
        id
        title
      }
    }
  }
`;

const ADD_CARD = gql`
  mutation AddCard($boardId: String!, $columnId: String!, $input: CardInput!) {
    addCard(boardId: $boardId, columnId: $columnId, input: $input) {
      id
      columns {
        id
        title
        cards {
          id
          title
          description
          order
          tags {
            id
            name
            color
          }
          attachments {
            id
            name
            url
            type
          }
        }
      }
    }
  }
`;

const UPDATE_CARD = gql`
  mutation UpdateCard($boardId: String!, $columnId: String!, $cardId: String!, $input: CardInput!) {
    updateCard(boardId: $boardId, columnId: $columnId, cardId: $cardId, input: $input) {
      id
      columns {
        id
        title
        color
        cardLimit
        cards {
          id
          title
          description
          order
          dueDate
          tags {
            id
            name
            color
          }
          attachments {
            id
            name
            url
            type
          }
        }
      }
    }
  }
`;

const DELETE_CARD = gql`
  mutation DeleteCard($boardId: String!, $columnId: String!, $cardId: String!) {
    deleteCard(boardId: $boardId, columnId: $columnId, cardId: $cardId) {
      id
      title
      columns {
        id
        title
        color
        cardLimit
        cards {
          id
          title
          description
          order
          dueDate
          tags {
            id
            name
            color
          }
          attachments {
            id
            name
            url
            type
          }
        }
      }
    }
  }
`;

const MOVE_CARD = gql`
  mutation MoveCard(
    $boardId: String!
    $sourceColumnId: String!
    $targetColumnId: String!
    $cardId: String!
    $newOrder: Float!
  ) {
    moveCard(
      boardId: $boardId
      sourceColumnId: $sourceColumnId
      targetColumnId: $targetColumnId
      cardId: $cardId
      newOrder: $newOrder
    ) {
      id
      title
      columns {
        id
        title
        color
        cardLimit
        cards {
          id
          title
          description
          order
          dueDate
          tags {
            id
            name
            color
          }
          attachments {
            id
            name
            url
            type
          }
        }
      }
    }
  }
`;

const RESET_BOARD = gql`
  mutation ResetBoard($id: String!, $title: String!) {
    resetBoard(id: $id, title: $title) {
      id
      title
      userId
      createdAt
      columns {
        id
        title
        color
        cardLimit
        cards {
          id
          title
          description
          order
        }
      }
    }
  }
`;

@Injectable({
  providedIn: 'root'
})
export class BoardGraphqlService {
  constructor(
    private apollo: Apollo,
    private authService: AuthService
  ) {}

  private handleError(operation: string, result?: any) {
    return (error: any): Observable<any> => {
      console.error(`Erro em ${operation}:`, error);
      
      // Verificar se é um erro de autenticação
      if (error.message?.includes('unauthorized') || 
          error.message?.includes('Unauthorized') ||
          error.networkError?.status === 401) {
        console.warn('Erro de autenticação detectado. O usuário pode precisar fazer login novamente.');
      }
      
      // Se for fornecido um resultado padrão, retorná-lo
      if (result !== undefined) {
        return of(result);
      }
      
      // Caso contrário, propagar o erro
      return throwError(() => error);
    };
  }

  getBoards(): Observable<Board[]> {
    console.log('GraphQL: Solicitando boards do servidor...');
    
    // Log do token de autenticação
    const token = this.authService.getToken();
    console.log('GraphQL: Token disponível:', token ? 'Sim' : 'Não');
    
    return this.apollo.watchQuery<{ boards: Board[] }>({
      query: GET_BOARDS,
      fetchPolicy: 'network-only', // Importante: Forçar busca no servidor ignorando cache
      errorPolicy: 'all'
    })
    .valueChanges
    .pipe(
      tap(result => {
        console.log('GraphQL: Resposta do servidor:', 
          result.data ? 'Dados recebidos' : 'Sem dados', 
          result.error ? `Erro: ${result.error.message}` : 'Sem erros'
        );
        
        if (result.data?.boards) {
          console.log(`GraphQL: Processando ${result.data.boards.length} boards...`);
          
          // Log para cada board recebido
          result.data.boards.forEach((board, index) => {
            console.log(`GraphQL: Board ${index}: ID=${board.id}, UserId=${board.userId || 'N/A'}, Colunas=${board.columns?.length || 0}`);
          });
          
          // Inspecionar os dados para serialização
          result.data.boards.forEach((board, i) => {
            // Verificar createdAt
            if (board.createdAt) {
              console.log(`Board ${i} createdAt:`, typeof board.createdAt, board.createdAt);
              
              // Tentar converter para string ISO se for um objeto
              if (typeof board.createdAt === 'object') {
                try {
                  // Tentar converter diferentes formatos de objeto de data
                  if ('toDate' in board.createdAt && typeof (board.createdAt as any).toDate === 'function') {
                    board.createdAt = (board.createdAt as any).toDate().toISOString();
                  } else if ('seconds' in board.createdAt) {
                    board.createdAt = new Date((board.createdAt as any).seconds * 1000).toISOString();
                  } else {
                    board.createdAt = new Date().toISOString();
                  }
                } catch (error) {
                  console.error('Erro ao converter createdAt:', error);
                  board.createdAt = new Date().toISOString();
                }
              }
            }
            
            // Processar cards
            if (board.columns) {
              board.columns.forEach((column, colIndex) => {
                if (column.cards) {
                  column.cards.forEach((card, cardIndex) => {
                    if (card.dueDate) {
                      console.log(`Card ${cardIndex} em coluna ${colIndex} dueDate:`, typeof card.dueDate, card.dueDate);
                      
                      if (typeof card.dueDate === 'object') {
                        try {
                          // Tentar converter diferentes formatos de objeto de data
                          if ('toDate' in card.dueDate && typeof (card.dueDate as any).toDate === 'function') {
                            card.dueDate = (card.dueDate as any).toDate().toISOString();
                          } else if ('seconds' in card.dueDate) {
                            card.dueDate = new Date((card.dueDate as any).seconds * 1000).toISOString();
                          } else {
                            card.dueDate = new Date().toISOString();
                          }
                        } catch (error) {
                          console.error('Erro ao converter dueDate:', error);
                          card.dueDate = undefined;
                        }
                      }
                    }
                  });
                }
              });
            }
          });
        }
      }),
      map(result => {
        if (result.error) {
          console.error('GraphQL: Erro ao buscar boards:', result.error);
          throw new Error(`Erro ao buscar boards: ${result.error.message}`);
        }
        
        if (!result.data || !result.data.boards) {
          console.warn('GraphQL: Nenhum board encontrado');
          return [];
        }
        
        console.log('GraphQL: Boards recebidos com sucesso:', result.data.boards.length);
        return result.data.boards;
      }),
      catchError(error => {
        console.error('GraphQL: Erro ao buscar boards:', error);
        if (error.networkError) {
          console.error('GraphQL: Erro de rede:', error.networkError);
          if (error.networkError.status) {
            console.error(`GraphQL: Status HTTP: ${error.networkError.status}`);
          }
        }
        if (error.graphQLErrors) {
          console.error('GraphQL: Erros GraphQL:', error.graphQLErrors);
        }
        
        return throwError(() => error);
      })
    );
  }

  getBoard(id: string): Observable<Board> {
    return this.apollo.watchQuery<{ board: Board }>({
      query: GET_BOARD,
      variables: { id },
      fetchPolicy: 'network-only', // Sempre buscar do servidor
      errorPolicy: 'all'
    })
    .valueChanges
    .pipe(
      map(result => {
        if (result.error) {
          console.error(`Erro ao buscar board ${id}:`, result.error);
          throw new Error(`Erro ao buscar board: ${result.error.message}`);
        }
        if (!result.data.board) {
          throw new Error(`Board ${id} não encontrado`);
        }
        return result.data.board;
      }),
      catchError(this.handleError('getBoard'))
    );
  }

  createBoard(title: string): Observable<Board> {
    return this.apollo.mutate<{ createBoard: Board }>({
      mutation: CREATE_BOARD,
      variables: {
        input: {
          title
        }
      }
    }).pipe(
      map((result: ApolloMutationResult<{ createBoard: Board }>) => {
        if (!result.data?.createBoard) {
          throw new Error('Erro ao criar board: Dados não retornados');
        }
        console.log('Board criado:', result.data.createBoard);
        return result.data.createBoard;
      }),
      catchError(error => {
        console.error('Erro ao criar board:', error);
        return throwError(() => error);
      })
    );
  }

  updateBoard(id: string, input: { title: string }): Observable<Board> {
    return this.apollo.mutate<{ updateBoard: Board }>({
      mutation: UPDATE_BOARD,
      variables: {
        id,
        input
      }
    }).pipe(
      map((result: ApolloMutationResult<{ updateBoard: Board }>) => {
        if (!result.data?.updateBoard) {
          throw new Error('Erro ao atualizar board: Dados não retornados');
        }
        console.log('Board atualizado:', result.data.updateBoard);
        return result.data.updateBoard;
      }),
      catchError(error => {
        console.error(`Erro ao atualizar board ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  addColumn(boardId: string, column: Omit<Column, 'id' | 'cards'>): Observable<Board> {
    return this.apollo.mutate<{ addColumn: Board }>({
      mutation: ADD_COLUMN,
      variables: {
        boardId,
        input: column
      }
    }).pipe(
      map((result: ApolloMutationResult<{ addColumn: Board }>) => {
        if (!result.data?.addColumn) {
          throw new Error('Erro ao adicionar coluna: Dados não retornados');
        }
        console.log('Coluna adicionada:', result.data.addColumn);
        return result.data.addColumn;
      }),
      catchError(error => {
        console.error(`Erro ao adicionar coluna ao board ${boardId}:`, error);
        return throwError(() => error);
      })
    );
  }

  updateColumn(boardId: string, columnId: string, column: Partial<Column>): Observable<Board> {
    return this.apollo.mutate<{ updateColumn: Board }>({
      mutation: UPDATE_COLUMN,
      variables: {
        boardId,
        columnId,
        input: column
      }
    }).pipe(
      map((result: ApolloMutationResult<{ updateColumn: Board }>) => {
        if (!result.data?.updateColumn) {
          throw new Error('Erro ao atualizar coluna: Dados não retornados');
        }
        console.log('Coluna atualizada:', result.data.updateColumn);
        return result.data.updateColumn;
      }),
      catchError(error => {
        console.error(`Erro ao atualizar coluna ${columnId}:`, error);
        return throwError(() => error);
      })
    );
  }

  deleteColumn(boardId: string, columnId: string): Observable<Board> {
    return this.apollo.mutate<{ deleteColumn: Board }>({
      mutation: DELETE_COLUMN,
      variables: {
        boardId,
        columnId
      }
    }).pipe(
      map((result: ApolloMutationResult<{ deleteColumn: Board }>) => {
        if (!result.data?.deleteColumn) {
          throw new Error('Erro ao excluir coluna: Dados não retornados');
        }
        console.log('Coluna excluída:', result.data.deleteColumn);
        return result.data.deleteColumn;
      }),
      catchError(error => {
        console.error(`Erro ao excluir coluna ${columnId}:`, error);
        return throwError(() => error);
      })
    );
  }

  private serializeCard(card: Partial<Card>): any {
    const serialized: any = {
      title: card.title,
      description: card.description,
      order: card.order || 0
    };
    
    // Processar tags
    if (card.tags && Array.isArray(card.tags)) {
      // Converter Tag para formato de input (sem ID)
      serialized.tags = card.tags.map(tag => ({
        name: tag.name,
        color: tag.color
      }));
    }
    
    // Garantir que a dueDate seja uma string ISO
    if (card.dueDate) {
      try {
        let dateString: string | undefined;
        
        // Se for um objeto Date, convertê-lo para string ISO
        if (card.dueDate instanceof Date) {
          dateString = card.dueDate.toISOString();
        } 
        // Se já for uma string, verificar se é uma data válida
        else if (typeof card.dueDate === 'string') {
          const dateObj = new Date(card.dueDate);
          if (!isNaN(dateObj.getTime())) {
            dateString = dateObj.toISOString();
          }
        } 
        // Se for um timestamp do Firebase ou outro objeto de data
        else if (typeof card.dueDate === 'object' && card.dueDate !== null) {
          // Timestamp do Firestore
          if ('toDate' in card.dueDate && typeof (card.dueDate as any).toDate === 'function') {
            dateString = (card.dueDate as any).toDate().toISOString();
          }
          // Timestamp com seconds
          else if ('seconds' in card.dueDate && typeof (card.dueDate as any).seconds === 'number') {
            dateString = new Date((card.dueDate as any).seconds * 1000).toISOString();
          }
          // Fallback para evitar problemas
          else {
            dateString = new Date().toISOString();
          }
        } 
        
        // Atualizar o valor ou remover se inválido
        if (dateString) {
          serialized.dueDate = dateString;
          console.log('Data serializada:', dateString);
        }
      } catch (error) {
        console.error('Erro ao serializar data:', error);
      }
    }
    
    // Processar anexos (se necessário)
    if (card.attachments && Array.isArray(card.attachments)) {
      // Converter Attachment para formato de input (sem ID)
      serialized.attachments = card.attachments.map(attachment => ({
        name: attachment.name,
        url: attachment.url,
        type: attachment.type
      }));
    }
    
    console.log('Card serializado para envio:', serialized);
    return serialized;
  }

  addCard(boardId: string, columnId: string, card: Omit<Card, 'id'>): Observable<Board> {
    return this.apollo.mutate<{ addCard: Board }>({
      mutation: ADD_CARD,
      variables: {
        boardId,
        columnId,
        input: this.serializeCard(card)
      }
    }).pipe(
      map((result: ApolloMutationResult<{ addCard: Board }>) => {
        if (!result.data?.addCard) {
          throw new Error('Erro ao adicionar card: Dados não retornados');
        }
        console.log('Card adicionado:', result.data.addCard);
        return result.data.addCard;
      }),
      catchError(error => {
        console.error(`Erro ao adicionar card na coluna ${columnId}:`, error);
        return throwError(() => error);
      })
    );
  }

  updateCard(boardId: string, columnId: string, cardId: string, card: Partial<Card>): Observable<Board> {
    return this.apollo.mutate<{ updateCard: Board }>({
      mutation: UPDATE_CARD,
      variables: {
        boardId,
        columnId,
        cardId,
        input: this.serializeCard(card)
      }
    }).pipe(
      map((result: ApolloMutationResult<{ updateCard: Board }>) => {
        if (!result.data?.updateCard) {
          throw new Error('Erro ao atualizar card: Dados não retornados');
        }
        console.log('Card atualizado:', result.data.updateCard);
        return result.data.updateCard;
      }),
      catchError(error => {
        console.error(`Erro ao atualizar card ${cardId}:`, error);
        return throwError(() => error);
      })
    );
  }

  deleteCard(boardId: string, columnId: string, cardId: string): Observable<Board> {
    return this.apollo.mutate<{ deleteCard: Board }>({
      mutation: DELETE_CARD,
      variables: {
        boardId,
        columnId,
        cardId
      }
    }).pipe(
      map((result: ApolloMutationResult<{ deleteCard: Board }>) => {
        if (!result.data?.deleteCard) {
          throw new Error('Erro ao excluir card: Dados não retornados');
        }
        console.log('Card excluído com sucesso. Board retornado:', result.data.deleteCard);
        return this.processDatesInBoard(result.data.deleteCard);
      }),
      catchError(error => {
        console.error(`Erro ao excluir card ${cardId}:`, error);
        return throwError(() => error);
      })
    );
  }

  moveCard(boardId: string, sourceColumnId: string, targetColumnId: string, cardId: string, newOrder: number): Observable<Board> {
    return this.apollo.mutate<{ moveCard: Board }>({
      mutation: MOVE_CARD,
      variables: {
        boardId,
        sourceColumnId,
        targetColumnId,
        cardId,
        newOrder
      }
    }).pipe(
      map((result: ApolloMutationResult<{ moveCard: Board }>) => {
        if (!result.data?.moveCard) {
          throw new Error('Erro ao mover card: Dados não retornados');
        }
        return this.processDatesInBoard(result.data.moveCard);
      }),
      catchError(error => {
        console.error(`Erro ao mover card ${cardId}:`, error);
        return throwError(() => error);
      })
    );
  }

  resetBoard(boardId: string, boardTitle: string): Observable<Board> {
    return this.apollo.mutate<{ resetBoard: Board }>({
      mutation: RESET_BOARD,
      variables: {
        boardId,
        boardTitle
      }
    }).pipe(
      map((result: ApolloMutationResult<{ resetBoard: Board }>) => {
        if (!result.data?.resetBoard) {
          throw new Error('Erro ao resetar board: Dados não retornados');
        }
        console.log('RESETBOARD: Resposta recebida com sucesso:', result.data.resetBoard);
        return this.processDatesInBoard(result.data.resetBoard);
      }),
      catchError(error => {
        console.error(`RESETBOARD: Erro ao resetar board ${boardId}:`, error);
        return throwError(() => error);
      })
    );
  }
  
  // Método auxiliar para processar datas no board
  private processDatesInBoard(board: Board): Board {
    // Clone o board para não modificar o original
    const processedBoard = JSON.parse(JSON.stringify(board)) as Board;
    
    // Processar datas em todas as colunas e cards
    if (processedBoard.columns) {
      processedBoard.columns.forEach(column => {
        if (column.cards) {
          column.cards.forEach(card => {
            // Converter objetos de data Firebase para string ISO
            if (card.dueDate) {
              // Verificar se é um objeto Firebase Timestamp
              if (typeof card.dueDate === 'object' && 
                  '_seconds' in (card.dueDate as any) && 
                  '_nanoseconds' in (card.dueDate as any)) {
                const seconds = (card.dueDate as any)._seconds;
                card.dueDate = new Date(seconds * 1000).toISOString();
              }
            }
          });
        }
      });
    }
    
    return processedBoard;
  }
}