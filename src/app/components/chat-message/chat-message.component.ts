import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-message.component.html',
  styleUrl: './chat-message.component.scss'
})
export class ChatMessageComponent {
  @Input() isUser: boolean = false;
  @Input() message: string = '';
  @Input() timestamp: string = '';

  formatMessage(message: string): string {
    // Simple formatting for code blocks
    return message
      .replace(/\n/g, '<br>')
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="code-block"><code>$2</code></pre>')
      .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
  }
}
