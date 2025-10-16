import { Component, HostListener } from '@angular/core';
import { Store } from '@ngrx/store';
import * as ChatActions from '../../store/chat.actions';
import { AuthService } from '../../services/auth.service';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ChatAreaComponent } from '../chat-area/chat-area.component';
import { MessageInputComponent } from '../message-input/message-input.component';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, SidebarComponent, ChatAreaComponent, MessageInputComponent, ThemeToggleComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent {
  sidebarWidth = 280;
  isResizing = false;
  isCollapsed = false;
  isMobileHistoryOpen = false;

  constructor(private store: Store, private authService: AuthService) {}

  onToggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }

  onMouseDown() {
    this.isResizing = true;
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.isResizing) {
      const newWidth = event.clientX;
      if (newWidth >= 200 && newWidth <= 500) {
        this.sidebarWidth = newWidth;
      }
    }
  }

  @HostListener('document:mouseup')
  onMouseUp() {
    this.isResizing = false;
  }

  createNewChatMobile() {
    this.store.dispatch(ChatActions.createChat());
    this.isMobileHistoryOpen = false;
  }

  logoutMobile() {
    this.authService.logout();
  }
} 