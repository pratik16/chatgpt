import { createReducer, on } from '@ngrx/store';
import { Chat, Message } from './chat.actions';
import * as ChatActions from './chat.actions';

export interface ChatState {
  chats: Chat[];
  currentChat: Chat | null;
  loading: boolean;
  error: string | null;
}

export const initialState: ChatState = {
  chats: [],
  currentChat: null,
  loading: false,
  error: null
};

export const chatReducer = createReducer(
  initialState,
  
  // Load Chat History
  on(ChatActions.loadChatHistory, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(ChatActions.loadChatHistorySuccess, (state, { chats }) => ({
    ...state,
    chats,
    loading: false
  })),
  on(ChatActions.loadChatHistoryFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  })),

  // Load Single Chat
  on(ChatActions.loadChat, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(ChatActions.loadChatSuccess, (state, { chat }) => ({
    ...state,
    currentChat: chat,
    loading: false
  })),
  on(ChatActions.loadChatFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  })),

  // Create Chat
  on(ChatActions.createChat, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(ChatActions.createChatSuccess, (state, { chat }) => ({
    ...state,
    chats: [chat, ...state.chats],
    currentChat: chat,
    loading: false
  })),
  on(ChatActions.createChatFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  })),

  // Add Message
  on(ChatActions.addMessage, (state, { chatId, message }) => {
    const updatedChats = state.chats.map(chat => 
      chat.id === chatId 
        ? { ...chat, messages: [...chat.messages, message] }
        : chat
    );
    
    const updatedCurrentChat = state.currentChat?.id === chatId
      ? { ...state.currentChat, messages: [...state.currentChat.messages, message] }
      : state.currentChat;

    return {
      ...state,
      chats: updatedChats,
      currentChat: updatedCurrentChat
    };
  }),

  // Send Message with AI
  on(ChatActions.sendMessageWithAI, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(ChatActions.sendMessageWithAISuccess, (state, { chatId, userMessage, aiResponse, error }) => {
    const messages = [userMessage];
    if (aiResponse) {
      messages.push(aiResponse);
    }

    const updatedChats = state.chats.map(chat => 
      chat.id === chatId 
        ? { ...chat, messages: [...chat.messages, ...messages] }
        : chat
    );
    
    const updatedCurrentChat = state.currentChat?.id === chatId
      ? { ...state.currentChat, messages: [...state.currentChat.messages, ...messages] }
      : state.currentChat;

    return {
      ...state,
      chats: updatedChats,
      currentChat: updatedCurrentChat,
      loading: false,
      error: error || null
    };
  }),
  on(ChatActions.sendMessageWithAIFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  })),

  // Set Loading
  on(ChatActions.setLoading, (state, { loading }) => ({
    ...state,
    loading
  }))
); 