import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  credentials = {
    username: '',
    password: ''
  };
  error = '';
  loading = false;
  googleClientId: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.loading = true;
    this.error = '';

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        if (response.emailVerified === false) {
          // Redirect to email verification page
          this.router.navigate(['/verify-email'], { 
            queryParams: { email: this.credentials.username } 
          });
        } else {
          this.router.navigate(['/chat']);
        }
      },
      error: (error) => {
        if (error.error?.detail?.email_verified === false) {
          // Email not verified error
          this.router.navigate(['/verify-email'], { 
            queryParams: { email: this.credentials.username } 
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

          // Configure GSI if script loaded
          const google = (window as any).google;
          if (google?.accounts?.id) {
            google.accounts.id.initialize({
              client_id: this.googleClientId,
              callback: (window as any).handleCredentialResponse,
              use_fedcm_for_prompt: false,
              cancel_on_tap_outside: false,
            });
            google.accounts.id.renderButton(
              document.querySelector('.g_id_signin'),
              { theme: 'outline', size: 'large' }
            );
          }
        }
      }
    });
  }
} 