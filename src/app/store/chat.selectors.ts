import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ChatState } from './chat.reducer';

export const selectChatState = createFeatureSelector<ChatState>('chat');

export const selectAllChats = createSelector(
  selectChatState,
  (state: ChatState) => state.chats
);

export const selectCurrentChat = createSelector(
  selectChatState,
  (state: ChatState) => state.currentChat
);

export const selectLoading = createSelector(
  selectChatState,
  (state: ChatState) => state.loading
);

export const selectError = createSelector(
  selectChatState,
  (state: ChatState) => state.error
);

export const selectCurrentChatMessages = createSelector(
  selectCurrentChat,
  (chat) => chat?.messages || []
); 