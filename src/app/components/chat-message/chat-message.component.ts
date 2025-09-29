import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-message.component.html',
  styleUrl: './chat-message.component.scss'
})
export class ChatMessageComponent implements OnChanges {
  @Input() isUser: boolean = false;
  @Input() message: string = '';
  @Input() timestamp: string = '';

  segments: Array<{ type: 'text' | 'code'; content: string; lang?: string }> = [];

  ngOnChanges(changes: SimpleChanges): void {
    if ('message' in changes) {
      this.segments = this.parseMessageToSegments(this.message || '');
    }
  }

  private parseMessageToSegments(raw: string): Array<{ type: 'text' | 'code'; content: string; lang?: string }> {
    let text = (raw || '').replace(/\r\n/g, '\n');

    // Normalize single-backtick multi-line blocks like: `python\n...\n`
    text = text.replace(/(^|[\n])`(\w+)\s*\n([\s\S]*?)\n`(?=[\n]|$)/g, (
      _m,
      p1: string,
      lang: string,
      body: string
    ) => `${p1}\`\`\`${lang}\n${body}\n\`\`\``);

    // Normalize PHP tags to fenced code blocks
    text = text.replace(/<\?php([\s\S]*?)\?>/g, (_m, body: string) => {
      const inner = String(body || '').trim();
      return '```php\n' + inner + '\n```';
    });

    const segments: Array<{ type: 'text' | 'code'; content: string; lang?: string }> = [];
    let cursor = 0;
    const fenceRegex = /```(\w+)?\n([\s\S]*?)\n```/g;
    let match: RegExpExecArray | null;
    while ((match = fenceRegex.exec(text)) !== null) {
      const start = match.index;
      const end = fenceRegex.lastIndex;

      if (start > cursor) {
        const before = text.slice(cursor, start);
        if (before.trim().length > 0) {
          segments.push({ type: 'text', content: before });
        }
      }

      const lang = (match[1] || '').trim();
      const code = match[2] || '';
      segments.push({ type: 'code', content: code, lang: lang || undefined });

      cursor = end;
    }

    if (cursor < text.length) {
      const tail = text.slice(cursor);
      if (tail.trim().length > 0) {
        segments.push({ type: 'text', content: tail });
      }
    }

    // If no segments were found, return the whole text as a single text segment
    if (segments.length === 0 && text) {
      segments.push({ type: 'text', content: text });
    }

    return segments;
  }

  renderInline(text: string): string {
    const escaped = this.escapeHtml(text).replace(/\n/g, '<br>');
    return escaped.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
  }

  private escapeHtml(input: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return input.replace(/[&<>"']/g, (m) => map[m]);
  }
}
