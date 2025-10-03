import { Component, Input, Output, EventEmitter } from '@angular/core'; 
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-notification.component.html',
  styleUrl: './error-notification.component.scss'
})
export class ErrorNotificationComponent {
  @Input() message: string = '';
  @Input() type: 'error' | 'warning' | 'info' = 'error';
  @Input() closable: boolean = true;
  @Input() duration: number = 0; // 0 means no auto-hide
  
  @Output() closed = new EventEmitter<void>();

  ngOnInit() {
    if (this.duration > 0) {
      setTimeout(() => {
        this.close();
      }, this.duration);
    }
  }

  close() {
    this.closed.emit();
  }
}
