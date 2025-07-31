import { Component, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-message-input',
  standalone: true,
  imports: [],
  templateUrl: './message-input.component.html',
  styleUrl: './message-input.component.scss'
})
export class MessageInputComponent {
  @ViewChild('messageInput') messageInput!: ElementRef<HTMLTextAreaElement>;
  @Output() messageSent = new EventEmitter<string>();
  
  message: string = '';

  onInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.message = target.value;
    this.adjustTextareaHeight();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  sendMessage(): void {
    console.log('MessageInput: sendMessage called, message:', this.message);
    if (this.message.trim()) {
      console.log('MessageInput: Emitting message:', this.message);
      this.messageSent.emit(this.message);
      this.message = '';
      if (this.messageInput) {
        this.messageInput.nativeElement.value = '';
        this.adjustTextareaHeight();
      }
    } else {
      console.log('MessageInput: Message is empty, not sending');
    }
  }

  private adjustTextareaHeight(): void {
    if (this.messageInput) {
      const textarea = this.messageInput.nativeElement;
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  }
}
