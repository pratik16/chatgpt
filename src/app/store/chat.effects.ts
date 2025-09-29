import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, switchMap, catchError, tap } from 'rxjs/operators';
import { ChatService } from '../services/chat.service';
import * as ChatActions from './chat.actions';

@Injectable()
export class ChatEffects {

  private actions$ = inject(Actions);
  private chatService = inject(ChatService);

  constructor(
    
  ) {
    console.log('ChatEffects constructor called');

  }

  loadChatHistory$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ChatActions.loadChatHistory),
      tap(() => console.log('Effect: loadChatHistory triggered')),
      switchMap(() => 
        this.chatService.getChatHistory().pipe(
          map(chats => {
            console.log('Effect: loadChatHistory success', chats);
            return ChatActions.loadChatHistorySuccess({ chats });
          }),
          catchError(error => {
            console.error('Effect: loadChatHistory error', error);
            return of(ChatActions.loadChatHistoryFailure({ error: error.message }));
          })
        )
      )
    );
  });

  loadChat$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ChatActions.loadChat),
      tap(({ chatId }) => console.log('Effect: loadChat triggered for', chatId)),
      switchMap(({ chatId }) => 
        this.chatService.getChat(chatId).pipe(
          map(chat => {
            console.log('Effect: loadChat success', chat);
            return ChatActions.loadChatSuccess({ chat });
          }),
          catchError(error => {
            console.error('Effect: loadChat error', error);
            return of(ChatActions.loadChatFailure({ error: error.message }));
          })
        )
      )
    );
  });

  createChat$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ChatActions.createChat),
      tap(() => console.log('Effect: createChat triggered')),
      switchMap(() => 
        this.chatService.createChat().pipe(
          map(chat => {
            console.log('Effect: createChat success', chat);
            return ChatActions.createChatSuccess({ chat });
          }),
          catchError(error => {
            console.error('Effect: createChat error', error);
            return of(ChatActions.createChatFailure({ error: error.message }));
          })
        )
      )
    );
  });

  sendMessageWithAI$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ChatActions.sendMessageWithAI),
      //tap(({ chatId, message }) => console.log('Effect: sendMessageWithAI triggered for chat', chatId, 'message:', message)),
      tap(action => console.log('Effect: sendMessageWithAI triggered', action)),
      switchMap(({ chatId, message }) => 
        this.chatService.sendMessageWithAI(chatId, message).pipe(
          map(response => {
            console.log('Effect: sendMessageWithAI success', response);
            return ChatActions.sendMessageWithAISuccess({
              chatId,
              userMessage: {
                role: response.user_message.role as 'user' | 'assistant',
                content: response.user_message.content
              },
              aiResponse: response.ai_response ? {
                role: response.ai_response.role as 'user' | 'assistant',
                content: response.ai_response.content
              } : null,
              error: response.error
            });
          }),
          catchError(error => {
            console.error('Effect: sendMessageWithAI error', error);
            return of(ChatActions.sendMessageWithAIFailure({ error: error.message }));
          })
        )
      )
    );
  });

  sendMessageWithAISuccess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ChatActions.sendMessageWithAISuccess),
      tap(() => console.log('Effect: sendMessageWithAISuccess triggered'))
    );
  }, { dispatch: false });

  sendMessageWithAIFailure$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ChatActions.sendMessageWithAIFailure),
      tap(() => console.log('Effect: sendMessageWithAIFailure triggered'))
    );
  }, { dispatch: false });
} 