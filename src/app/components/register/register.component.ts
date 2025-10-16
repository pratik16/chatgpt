import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  error = '';
  loading = false;
  success = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      username: ['', [Validators.minLength(3), Validators.maxLength(30), this.alphanumericValidator]],
      fullname: ['', [Validators.minLength(2), Validators.maxLength(60)]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Check if email is provided in query params (from resend email link)
    this.route.queryParams.subscribe(params => {
      if (params['email']) {
        this.registerForm.patchValue({ email: params['email'] });
      }
    });
  }

  alphanumericValidator(control: any) {
    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    if (control.value && !alphanumericRegex.test(control.value)) {
      return { alphanumeric: true };
    }
    return null;
  }

  nameValidator(control: any) {
    const nameRegex = /^[a-zA-Z]+$/;
    if (control.value && !nameRegex.test(control.value)) {
      return { nameOnly: true };
    }
    return null;
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      if (confirmPassword && confirmPassword.hasError('passwordMismatch')) {
        confirmPassword.setErrors(null);
      }
      return null;
    }
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;
    this.error = '';

    const { confirmPassword, ...raw } = this.registerForm.value;
    const payload: any = {
      email: raw.email,
      password: raw.password,
    };
    if (raw.username) payload.username = raw.username;
    if (raw.fullname) payload.fullName = raw.fullname; // API expects fullName

    this.authService.register(payload).subscribe({
      next: () => {
        this.success = true;
        this.loading = false;
      },
      error: (error) => {
        const backend = error?.error;
        const msg = backend?.message ?? backend?.detail?.message ?? backend?.detail ?? error?.message;
        this.error = typeof msg === 'string' ? msg : 'Registration failed';
        this.loading = false;
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['alphanumeric']) {
        return 'Username must contain only letters and numbers (no spaces or special characters)';
      }
      if (field.errors['minlength']) {
        const requiredLength = field.errors['minlength'].requiredLength;
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${requiredLength} characters`;
      }
      if (field.errors['maxlength']) {
        const requiredLength = field.errors['maxlength'].requiredLength;
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be no more than ${requiredLength} characters`;
      }
      if (field.errors['passwordMismatch']) {
        return 'Passwords do not match';
      }
    }
    return '';
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
