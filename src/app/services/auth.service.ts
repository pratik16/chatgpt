import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface AuthConfigResponse {
  googleClientId: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://chat.ai-potato-local/api';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadUserFromStorage();
  }

  fetchAuthConfig(): Observable<AuthConfigResponse> {
    return this.http.get<AuthConfigResponse>(`${this.apiUrl}/auth/config`);
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          localStorage.setItem('access_token', response.access_token);
          try {
            localStorage.setItem('user', JSON.stringify(response.user));
          } catch {}
          this.currentUserSubject.next(response.user);
        })
      );
  }

  logout(): void {
    // Call logout endpoint to invalidate token on server
    this.http.post(`${this.apiUrl}/auth/logout`, {}).subscribe({
      next: () => {
        this.clearAuthData();
      },
      error: (error) => {
        // Even if logout fails, clear local data
        console.warn('Logout API call failed, but clearing local data:', error);
        this.clearAuthData();
      }
    });
  }

  private clearAuthData(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Method to validate user with server (call this when needed)
  validateUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/auth/me`).pipe(
      tap(user => {
        this.currentUserSubject.next(user);
      })
    );
  }

  private loadUserFromStorage(): void {
    const token = this.getToken();
    if (!token) return;

    // Hydrate user from localStorage if available (best effort)
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const user: User = JSON.parse(raw);
        this.currentUserSubject.next(user);
      }
    } catch {}

    // Optionally validate in background; do not force logout on startup errors
    this.validateUser().subscribe({
      next: (user) => {
        // already set via tap; ensure cache is updated
        try { localStorage.setItem('user', JSON.stringify(user)); } catch {}
      },
      error: (error) => {
        console.warn('Startup token validation failed; deferring logout until next request:', error);
        // Do not clear token here; interceptor will handle on first 401
      }
    });
  }

  // Optional: keep method for compatibility if referenced elsewhere
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch {
      // If token cannot be decoded as JWT, treat as non-expired here; backend will validate
      return false;
    }
  }

  loginWithGoogleIdToken(idToken: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/google`, { id_token: idToken })
      .pipe(
        tap(response => {
          localStorage.setItem('access_token', response.access_token);
          try {
            localStorage.setItem('user', JSON.stringify(response.user));
          } catch {}
          this.currentUserSubject.next(response.user);
        })
      );
  }
} 