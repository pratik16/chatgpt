import { Component, Input, ChangeDetectorRef, AfterViewInit, ChangeDetectionStrategy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SecurityContext } from '@angular/core';
import { marked } from 'marked';

@Component({
  selector: 'app-chat-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-message.component.html',
  styleUrl: './chat-message.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatMessageComponent implements AfterViewInit, OnChanges {
  @Input() isUser: boolean = false;
  @Input() message: string = '';
  @Input() timestamp: string = '';
  renderedHtml?: SafeHtml;

  constructor(
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) {
    marked.setOptions({
      gfm: true,
      breaks: true
    });
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges) {
    if ('message' in changes) {
      const text = this.message || '';
      const isHtml = text.includes('<') && (text.includes('<p>') || text.includes('<div>') || text.includes('<h') || text.includes('<ul>') || text.includes('<ol>'));
      const html = isHtml ? text : (marked.parse(text) as string);
      const sanitizedHtml = this.sanitizer.sanitize(SecurityContext.HTML, html) || '';
      this.renderedHtml = this.sanitizer.bypassSecurityTrustHtml(sanitizedHtml);
      this.cdr.markForCheck();
    }
  }
}
