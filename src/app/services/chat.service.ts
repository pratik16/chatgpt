import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Chat } from '../store/chat.actions';

export interface ChatResponse {
  user_message: {
    id: string;
    role: string;
    content: string;
  };
  ai_response: {
    id: string;
    role: string;
    content: string;
  } | null;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) { }

  getChatHistory(): Observable<Chat[]> {
    return this.http.get<Chat[]>(`${this.apiUrl}/chat-history`);
  }

  getChat(chatId: string): Observable<Chat> {
    return this.http.get<Chat>(`${this.apiUrl}/chat/${chatId}`);
  }

  createChat(): Observable<Chat> {
    return this.http.post<Chat>(`${this.apiUrl}/chat`, {});
  }

  addMessage(chatId: string, role: string, content: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/chat/${chatId}/message`, { role, content });
  }

  sendMessageWithAI(chatId: string, message: string): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(`${this.apiUrl}/chat/${chatId}/send`, { message });
  }
} 