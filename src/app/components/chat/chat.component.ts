import { Component } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ChatAreaComponent } from '../chat-area/chat-area.component';
import { MessageInputComponent } from '../message-input/message-input.component';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [SidebarComponent, ChatAreaComponent, MessageInputComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent {
} 