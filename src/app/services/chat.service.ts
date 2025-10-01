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

  deleteChat(chatId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/chat/${chatId}`);
  }

  sendMessageWithAI(chatId: string, message: string, model?: string): Observable<ChatResponse> {
    const body: any = { message };
    if (model && model !== 'auto') {
      body.model = model;
    }
    return this.http.post<ChatResponse>(`${this.apiUrl}/chat/${chatId}/send`, body);
  }

  // Streaming via EventSource (SSE). Backend must support text/event-stream
  sendMessageWithAIStream(chatId: string, message: string, model?: string): Observable<string> {
    return new Observable<string>((observer) => {
      const url = `${this.apiUrl}/chat/${chatId}/send?stream=1`;
      const token = localStorage.getItem('access_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // Use fetch to initiate POST, then switch to ReadableStream for chunked text
      const controller = new AbortController();
      const signal = controller.signal;
      // No client-side abort timer; let the server control streaming lifecycle

      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          ...headers,
        },
        body: JSON.stringify(model && model !== 'auto' ? { message, model } : { message }),
        signal
      })
      .then(async (response) => {
        if (!response.ok || !response.body) {
          const text = await response.text().catch(() => '');
          throw new Error(text || `HTTP ${response.status}`);
        }
        const contentType = (response.headers.get('content-type') || '').toLowerCase();

        // If server returns JSON (non-stream), parse once and emit final content
        if (contentType.includes('application/json')) {
          try {
            const data: any = await response.json();
            const content =
              (typeof data === 'string' ? data : null) ??
              (data?.ai_response?.content ?? null) ??
              (data?.content ?? null) ??
              (data?.text ?? null) ??
              (data?.message ?? null);

            if (typeof content === 'string' && content.length > 0) {
              observer.next(content);
              observer.complete();
              return;
            }
            if (data?.error) {
              throw new Error(String(data.error));
            }
            // Fallback: emit stringified payload
            observer.next(JSON.stringify(data));
            observer.complete();
            return;
          } catch (e: any) {
            observer.error(e);
            return;
          }
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        const emitFromPayload = (payload: string) => {
          const rawPayload = payload ?? '';
          // Respect end marker but do NOT strip regular spaces from tokens
          if (rawPayload.trim() === '[DONE]') return;
          if (rawPayload === '') return;
          let tokenText: string | null = null;

          // Try JSON first
          if (rawPayload.startsWith('{') || rawPayload.startsWith('[')) {
            try {
              const data: any = JSON.parse(rawPayload);
              if (typeof data === 'string') {
                tokenText = data;
              } else if (typeof data.token === 'string') {
                tokenText = data.token;
              } else if (typeof data.content === 'string') {
                tokenText = data.content;
              } else if (typeof data.text === 'string') {
                tokenText = data.text;
              } else if (typeof data.delta === 'string') {
                tokenText = data.delta;
              } else if (data?.choices?.[0]?.delta?.content) {
                tokenText = data.choices[0].delta.content;
              } else if (data?.data?.content) {
                tokenText = data.data.content;
              }
            } catch {
              // Not valid JSON, fall back to plain text
            }
          }

          if (tokenText == null) {
            tokenText = rawPayload;
          }

          if (tokenText) {
            observer.next(tokenText);
          }
        };

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          // Prefer SSE parsing when we see data: lines
          if (buffer.indexOf('data:') !== -1) {
            const events = buffer.split('\n\n');
            for (let i = 0; i < events.length - 1; i++) {
              const event = events[i];
              const lines = event.split('\n');
              for (const line of lines) {
                if (line.startsWith('data:')) {
                  let data = line.slice(5);
                  if (data.startsWith(' ')) data = data.slice(1); // remove single leading space after colon if present
                  emitFromPayload(data);
                }
              }
            }
            buffer = events[events.length - 1];
          }

          // Also handle NDJSON style (one JSON per line) or raw text lines
          const lines = buffer.split('\n');
          for (let i = 0; i < lines.length - 1; i++) {
            const line = lines[i];
            emitFromPayload(line);
          }
          buffer = lines[lines.length - 1];
        }
        // Flush any remaining buffered payload
        const tail = buffer || '';
        if (tail !== '') {
          emitFromPayload(tail);
        }
        observer.complete();
      })
      .catch((err) => observer.error(err));

      return () => {
        try { controller.abort(); } catch {}
      };
    });
  }
} 