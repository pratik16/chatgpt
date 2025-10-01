import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Chat } from '../../store/chat.actions';
import { selectAllChats, selectLoading } from '../../store/chat.selectors';
import * as ChatActions from '../../store/chat.actions';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {
  chats$: Observable<Chat[]>;
  loading$: Observable<boolean>;
  currentUser$: Observable<User | null>;

  constructor(
    private store: Store,
    private authService: AuthService
  ) {
    this.chats$ = this.store.select(selectAllChats);
    this.loading$ = this.store.select(selectLoading);
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit() {
    this.loadChatHistory();
  }

  loadChatHistory() {
    this.store.dispatch(ChatActions.loadChatHistory());
  }

  createNewChat() {
    this.store.dispatch(ChatActions.createChat());
  }

  selectChat(chatId: string) {
    this.store.dispatch(ChatActions.loadChat({ chatId }));
  }

  deleteChat(chatId: string, event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    this.store.dispatch(ChatActions.deleteChat({ chatId }));
  }

  logout() {
    this.authService.logout();
  }
} 