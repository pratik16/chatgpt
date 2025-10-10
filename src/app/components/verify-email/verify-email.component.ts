import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.scss'
})
export class VerifyEmailComponent implements OnInit {
  verificationKey = '';
  error = '';
  loading = false;
  success = false;
  email = '';
  resendLoading = false;
  resendMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Check if verification key is provided in URL params
    this.route.queryParams.subscribe(params => {
      if (params['key']) {
        this.verificationKey = params['key'];
        this.verifyEmail();
      }
    });

    // Check if email is provided for manual verification
    this.route.queryParams.subscribe(params => {
      if (params['email']) {
        this.email = params['email'];
      }
    });
  }

  onSubmit(): void {
    if (!this.verificationKey.trim()) {
      this.error = 'Please enter the verification key';
      return;
    }
    this.verifyEmail();
  }

  verifyEmail(): void {
    this.loading = true;
    this.error = '';

    this.authService.verifyEmail(this.verificationKey).subscribe({
      next: () => {
        this.success = true;
        this.loading = false;
        // Redirect to chat after successful verification
        setTimeout(() => {
          this.router.navigate(['/chat']);
        }, 2000);
      },
      error: (error) => {
        this.error = error.error?.detail || 'Email verification failed';
        this.loading = false;
      }
    });
  }

  resendEmail(): void {
    if (!this.email) {
      this.error = 'Email address is required to resend verification email';
      return;
    }
    
    this.resendLoading = true;
    this.resendMessage = '';
    this.error = '';
    
    this.authService.resendVerificationEmail(this.email).subscribe({
      next: () => {
        this.resendLoading = false;
        this.resendMessage = 'Verification email sent successfully!';
      },
      error: (error) => {
        this.resendLoading = false;
        this.resendMessage = error.error?.detail || 'Failed to resend verification email';
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
