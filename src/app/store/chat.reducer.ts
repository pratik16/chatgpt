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

  // Streaming: start
  on(ChatActions.sendMessageWithAIStream, (state, { chatId, message }) => {
    const userMsg: Message = { role: 'user', content: message };
    const assistantPlaceholder: Message = { role: 'assistant', content: '', loading: true };

    const updatedChats: Chat[] = state.chats.map((chat: Chat) => 
      chat.id === chatId 
        ? { ...chat, messages: [...chat.messages, userMsg, assistantPlaceholder] }
        : chat
    );

    const updatedCurrentChat: Chat | null = state.currentChat?.id === chatId
      ? { ...state.currentChat, messages: [...state.currentChat.messages, userMsg, assistantPlaceholder] }
      : state.currentChat;

    return {
      ...state,
      chats: updatedChats,
      currentChat: updatedCurrentChat,
      loading: true,
      error: null
    } as ChatState;
  }),

  // Streaming: token chunks
  on(ChatActions.receiveAIStreamToken, (state, { chatId, token }) => {
    const appendToken = (messages: Message[]) => {
      if (messages.length === 0) return messages;
      const lastIndex = messages.length - 1;
      const last = messages[lastIndex];
      if (last.role !== 'assistant') return messages;
      const updatedLast: Message = { ...last, content: (last.content || '') + token, loading: false };
      return [...messages.slice(0, lastIndex), updatedLast];
    };

    const updatedChats = state.chats.map(chat => 
      chat.id === chatId 
        ? { ...chat, messages: appendToken(chat.messages) }
        : chat
    );

    const updatedCurrentChat = state.currentChat?.id === chatId
      ? { ...state.currentChat, messages: appendToken(state.currentChat.messages) }
      : state.currentChat;

    return {
      ...state,
      chats: updatedChats,
      currentChat: updatedCurrentChat
    };
  }),

  // Streaming: complete
  on(ChatActions.completeAIStream, (state) => ({
    ...state,
    loading: false
  })),

  // Streaming: fail
  on(ChatActions.failAIStream, (state, { error }) => {
    const removeLoadingMessage = (messages: Message[]) => {
      if (messages.length === 0) return messages;
      const lastIndex = messages.length - 1;
      const last = messages[lastIndex];
      if (last.role === 'assistant' && last.loading) {
        return messages.slice(0, lastIndex);
      }
      return messages;
    };

    const updatedChats = state.chats.map(chat => ({ 
      ...chat, 
      messages: removeLoadingMessage(chat.messages) 
    }));

    const updatedCurrentChat = state.currentChat 
      ? { ...state.currentChat, messages: removeLoadingMessage(state.currentChat.messages) }
      : state.currentChat;

    return {
      ...state,
      chats: updatedChats,
      currentChat: updatedCurrentChat,
      error,
      loading: false
    };
  }),

  // Set Loading
  on(ChatActions.setLoading, (state, { loading }) => ({
    ...state,
    loading
  })),

  // Delete Chat
  on(ChatActions.deleteChat, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(ChatActions.deleteChatSuccess, (state, { chatId }) => {
    const filtered = state.chats.filter(c => c.id !== chatId);
    const isCurrentDeleted = state.currentChat?.id === chatId;
    return {
      ...state,
      chats: filtered,
      currentChat: isCurrentDeleted ? (filtered[0] ?? null) : state.currentChat,
      loading: false
    } as ChatState;
  }),
  on(ChatActions.deleteChatFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  })),

  // Clear Error
  on(ChatActions.clearChatError, (state) => ({
    ...state,
    error: null
  }))
); 