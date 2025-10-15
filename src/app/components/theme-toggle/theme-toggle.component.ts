import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      class="theme-toggle"
      (click)="toggleTheme()"
      [title]="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'">
      <svg *ngIf="!isDarkMode" class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
      </svg>
      <svg *ngIf="isDarkMode" class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
      </svg>
      <span class="sr-only">Toggle theme</span>
    </button>
  `,
  styles: [`
    .theme-toggle {
      position: fixed;
      top: 16px;
      right: 16px;
      z-index: 1000;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 10px;
      border: 1px solid var(--border);
      background: #fff;
      color: var(--fg);
      box-shadow: var(--shadow);
      transition: box-shadow 0.2s ease, transform 0.05s ease, background-color 0.2s ease;
      cursor: pointer;
    }
    .theme-toggle:hover { box-shadow: 0 8px 20px rgba(0,0,0,0.15); }
    .theme-toggle:active { transform: translateY(1px); }
    [data-theme="dark"] .theme-toggle { background: var(--bg-elevated); }
    .icon { width: 18px; height: 18px; }
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
  `]
})
export class ThemeToggleComponent {
  @Input() isDarkMode = false;
  @Output() themeToggle = new EventEmitter<void>();

  toggleTheme() {
    this.themeToggle.emit();
  }
}
