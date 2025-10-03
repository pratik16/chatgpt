import { createAction, props } from '@ngrx/store';

export interface Chat {
  id: string;
  title: string;
  timestamp: string;
  messages: Message[];
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  loading?: boolean;
}

// Load Chat History
export const loadChatHistory = createAction('[Chat] Load Chat History');
export const loadChatHistorySuccess = createAction(
  '[Chat] Load Chat History Success',
  props<{ chats: Chat[] }>()
);
export const loadChatHistoryFailure = createAction(
  '[Chat] Load Chat History Failure',
  props<{ error: string }>()
);

// Load Single Chat
export const loadChat = createAction(
  '[Chat] Load Chat',
  props<{ chatId: string }>()
);
export const loadChatSuccess = createAction(
  '[Chat] Load Chat Success',
  props<{ chat: Chat }>()
);
export const loadChatFailure = createAction(
  '[Chat] Load Chat Failure',
  props<{ error: string }>()
);

// Create New Chat
export const createChat = createAction('[Chat] Create Chat');
export const createChatSuccess = createAction(
  '[Chat] Create Chat Success',
  props<{ chat: Chat }>()
);
export const createChatFailure = createAction(
  '[Chat] Create Chat Failure',
  props<{ error: string }>()
);

// Add Message
export const addMessage = createAction(
  '[Chat] Add Message',
  props<{ chatId: string; message: Message }>()
);

// Send Message with AI Response
export const sendMessageWithAI = createAction(
  '[Chat] Send Message with AI',
  props<{ chatId: string; message: string; model?: string }>()
);

export const sendMessageWithAISuccess = createAction(
  '[Chat] Send Message with AI Success',
  props<{ chatId: string; userMessage: Message; aiResponse: Message | null; error?: string }>()
);
export const sendMessageWithAIFailure = createAction(
  '[Chat] Send Message with AI Failure',
  props<{ error: string }>()
);

// Streaming
export const sendMessageWithAIStream = createAction(
  '[Chat] Send Message with AI (Stream)',
  props<{ chatId: string; message: string; model?: string }>()
);

export const receiveAIStreamToken = createAction(
  '[Chat] Receive AI Stream Token',
  props<{ chatId: string; token: string }>()
);

export const completeAIStream = createAction(
  '[Chat] Complete AI Stream',
  props<{ chatId: string }>()
);

export const failAIStream = createAction(
  '[Chat] Fail AI Stream',
  props<{ error: string }>()
);

// Set Loading State
export const setLoading = createAction(
  '[Chat] Set Loading',
  props<{ loading: boolean }>()
); 

// Delete Chat
export const deleteChat = createAction(
  '[Chat] Delete Chat',
  props<{ chatId: string }>()
);

export const deleteChatSuccess = createAction(
  '[Chat] Delete Chat Success',
  props<{ chatId: string }>()
);

export const deleteChatFailure = createAction(
  '[Chat] Delete Chat Failure',
  props<{ error: string }>()
);

// Clear Error
export const clearChatError = createAction('[Chat] Clear Chat Error');