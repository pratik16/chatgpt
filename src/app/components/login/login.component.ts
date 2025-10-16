import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ThemeToggleComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  credentials = {
    email: '',
    password: ''
  };
  error = '';
  loading = false;
  errors: Record<string, string> = {};
  googleClientId: string | null = null;
  gsiReady = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.loading = true;
    this.error = '';

    // Map email to username for the auth service
    const loginRequest = {
      username: this.credentials.email,
      password: this.credentials.password
    };

    this.authService.login(loginRequest).subscribe({
      next: (response) => {
        if (response.emailVerified === false) {
          // Redirect to email verification page
          this.router.navigate(['/verify-email'], { 
            queryParams: { email: this.credentials.email } 
          });
        } else {
          this.router.navigate(['/chat']);
        }
      },
      error: (error) => {
        if (error.error?.detail?.email_verified === false) {
          // Email not verified error
          this.router.navigate(['/verify-email'], { 
            queryParams: { email: this.credentials.email } 
          });
        } else {
          this.error = error.error?.detail?.message || error.error?.detail || 'Login failed';
        }
        this.loading = false;
      }
    });
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  ngOnInit(): void {
    this.authService.fetchAuthConfig().subscribe({
      next: (config) => {
        this.googleClientId = config.googleClientId || null;
        if (this.googleClientId) {
          // Initialize Google One Tap callback
          (window as any).handleCredentialResponse = (response: any) => {
            const idToken = response.credential;
            if (!idToken) return;
            this.loading = true;
            this.error = '';
            this.authService.loginWithGoogleIdToken(idToken).subscribe({
              next: () => {
                this.router.navigate(['/chat']);
              },
              error: (err) => {
                this.error = err.error?.detail || 'Google login failed';
                this.loading = false;
              }
            });
          };
          this.waitForGsiAndInit();
        }
      }
    });
  }

  private waitForGsiAndInit(attempt: number = 0): void {
    const google = (window as any).google;
    if (google?.accounts?.id && this.googleClientId) {
      this.gsiReady = true;
      google.accounts.id.initialize({
        client_id: this.googleClientId,
        callback: (window as any).handleCredentialResponse,
        use_fedcm_for_prompt: false,
        cancel_on_tap_outside: false,
      });
      this.tryRenderGoogleButton();
      return;
    }

    if (attempt > 50) {
      return;
    }
    setTimeout(() => this.waitForGsiAndInit(attempt + 1), 200);
  }

  private tryRenderGoogleButton(attempt: number = 0): void {
    const google = (window as any).google;
    const buttonContainer = document.querySelector('.g_id_signin') as HTMLElement | null;
    if (buttonContainer && google?.accounts?.id) {
      buttonContainer.innerHTML = '';
      google.accounts.id.renderButton(buttonContainer, { theme: 'outline', size: 'large' });
      return;
    }
    if (attempt > 20) return;
    setTimeout(() => this.tryRenderGoogleButton(attempt + 1), 100);
  }
} 