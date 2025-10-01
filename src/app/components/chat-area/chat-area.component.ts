import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { ChatMessageComponent } from '../chat-message/chat-message.component';
import { selectCurrentChatMessages, selectCurrentChat, selectLoading } from '../../store/chat.selectors';
import { Message } from '../../store/chat.actions';
import * as ChatActions from '../../store/chat.actions';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-chat-area',
  standalone: true,
  imports: [CommonModule, ChatMessageComponent],
  templateUrl: './chat-area.component.html',
  styleUrl: './chat-area.component.scss'
})
export class ChatAreaComponent implements OnInit {
  messages$: Observable<Message[]>;
  currentChat$: Observable<any>;
  loading$: Observable<boolean>;

  constructor(
    private store: Store,
    private authService: AuthService
  ) {
    this.messages$ = this.store.select(selectCurrentChatMessages);
    this.currentChat$ = this.store.select(selectCurrentChat);
    this.loading$ = this.store.select(selectLoading);
  }

  ngOnInit() {
    console.log('ChatAreaComponent initialized');
    // Load chat history on component init
    this.store.dispatch(ChatActions.loadChatHistory());
  }

  sendMessage(content: string, model?: string) {
    console.log('=== sendMessage called with:', content, 'model:', model);
    console.log('Current user:', this.authService.getCurrentUser());
    console.log('Is authenticated:', this.authService.isAuthenticated());
    
    this.currentChat$.pipe(take(1)).subscribe(chat => {
      console.log('Current chat from store:', chat);
      
      if (chat && chat.id) {
        console.log('✅ Dispatching sendMessageWithAIStream for chat:', chat.id, 'model:', model);
        this.store.dispatch(ChatActions.sendMessageWithAIStream({ chatId: chat.id, message: content, model }));
      } else {
        console.log('❌ No current chat, creating new one first');
        // If no current chat, create one first
        this.store.dispatch(ChatActions.createChat());
        // Note: In a real app, you might want to wait for chat creation before sending message
        // For now, we'll just create the chat and the user can send the message again
      }
    });
  }

  logout() {
    this.authService.logout();
  }
}
