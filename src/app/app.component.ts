import { Component, HostBinding } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeToggleComponent } from './components/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ThemeToggleComponent],
  template: `
    <app-theme-toggle [isDarkMode]="isDarkMode" (themeToggle)="onToggleTheme()"></app-theme-toggle>
    <router-outlet></router-outlet>
  `,
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'chatgpt';
  @HostBinding('attr.data-theme') dataTheme: 'light' | 'dark' = 'light';

  isDarkMode = false;

  ngOnInit(): void {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark') {
      this.setTheme('dark');
    } else {
      this.setTheme('light');
    }
  }

  onToggleTheme(): void {
    this.setTheme(this.isDarkMode ? 'light' : 'dark');
  }

  private setTheme(theme: 'light' | 'dark'): void {
    this.isDarkMode = theme === 'dark';
    this.dataTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('theme', theme); } catch {}
  }
}
