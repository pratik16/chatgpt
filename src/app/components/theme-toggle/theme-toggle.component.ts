import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../config/environment';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <button
      type="button"
      (click)="toggleTheme()"
      class="fixed top-4 right-4 z-50 h-9 w-9 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground flex items-center justify-center transition-colors">
      <svg class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
      </svg>
      <svg class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
      </svg>
      <span class="sr-only">Toggle theme</span>
    </button>

    <!-- Help button next to theme toggle -->
    <button
      type="button"
      (click)="openHelp()"
      class="fixed top-4 right-16 z-50 h-9 w-9 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground flex items-center justify-center transition-colors"
      *ngIf="isLoggedIn">
      <svg class="h-[1.2rem] w-[1.2rem]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10a4 4 0 118 0c0 2-2 3-2 3m-2 4h.01"></path>
      </svg>
      <span class="sr-only">Help</span>
    </button>

    <!-- Help modal -->
    <div *ngIf="showHelp && isLoggedIn" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/50" (click)="closeHelp()"></div>
      <div class="relative bg-card text-card-foreground rounded-lg shadow-xl w-full max-w-md mx-4 p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-base font-semibold">Need help?</h3>
          <button type="button" (click)="closeHelp()" class="h-8 w-8 rounded-md hover:bg-accent flex items-center justify-center">
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <form (ngSubmit)="submitHelp()" class="space-y-3">
          <div>
            <label class="block text-sm mb-1">Your message</label>
            <textarea [(ngModel)]="helpMessage" name="helpMessage" rows="4" placeholder="Describe your issue or question..." class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"></textarea>
          </div>
          <div class="flex items-center justify-end gap-2">
            <button type="button" (click)="closeHelp()" class="px-3 py-2 text-sm rounded-md border border-input">Cancel</button>
            <button type="submit" [disabled]="helpSubmitting || !helpMessage.trim()" class="px-3 py-2 text-sm rounded-md bg-primary text-primary-foreground disabled:opacity-50">{{ helpSubmitting ? 'Sending...' : 'Send' }}</button>
          </div>
          <p *ngIf="helpSuccess" class="text-green-600 text-sm">Sent. We'll get back to you soon.</p>
          <p *ngIf="helpError" class="text-red-600 text-sm">{{ helpError }}</p>
        </form>
      </div>
    </div>
  `
})
export class ThemeToggleComponent implements OnInit, OnDestroy {
  private mediaQuery: MediaQueryList | null = null;
  private authSub?: Subscription;
  showHelp = false;
  helpMessage = '';
  helpSubmitting = false;
  helpSuccess = false;
  helpError = '';
  isLoggedIn = false;

  

  ngOnDestroy() {
    if (this.mediaQuery) {
      this.mediaQuery.removeEventListener('change', this.handleSystemThemeChange);
    }
    this.authSub?.unsubscribe();
  }

  private handleSystemThemeChange = (e: MediaQueryListEvent) => {
    if (!localStorage.getItem('theme')) {
      this.setTheme(e.matches ? 'dark' : 'light');
    }
  };

  toggleTheme() {
    const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  }

  private setTheme(theme: 'light' | 'dark') {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  openHelp() {
    this.helpSuccess = false;
    this.helpError = '';
    this.showHelp = true;
  }

  closeHelp() {
    if (!this.helpSubmitting) {
      this.showHelp = false;
    }
  }

  constructor(private http: HttpClient, private auth: AuthService) {}

  submitHelp() {
    if (!this.helpMessage.trim()) return;
    this.helpSubmitting = true;
    this.helpError = '';
    this.helpSuccess = false;
    const url = `${environment.apiUrl}/support/send`;
    const body = { message: this.helpMessage };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.http.post(url, body, { headers, responseType: 'text' }).subscribe({
      next: () => {
        this.helpSubmitting = false;
        this.helpSuccess = true;
        this.helpMessage = '';
        setTimeout(() => { this.showHelp = false; }, 1200);
      },
      error: () => {
        this.helpSubmitting = false;
        this.helpError = 'Failed to send. Please try again later.';
      }
    });
  }

  ngOnInit() {
    // existing logic
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      this.setTheme(savedTheme as 'light' | 'dark');
    } else {
      this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.setTheme(this.mediaQuery.matches ? 'dark' : 'light');
      this.mediaQuery.addEventListener('change', this.handleSystemThemeChange);
    }

    this.authSub = this.auth.currentUser$.subscribe(u => {
      this.isLoggedIn = !!u;
      if (!this.isLoggedIn) this.showHelp = false;
    });
  }
}
