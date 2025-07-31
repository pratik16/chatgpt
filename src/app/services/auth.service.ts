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

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadUserFromStorage();
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          localStorage.setItem('access_token', response.access_token);
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
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    // Check if token is expired
    if (this.isTokenExpired()) {
      this.clearAuthData();
      return false;
    }
    
    return true;
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
    if (token) {
      // Check if token is expired first
      if (this.isTokenExpired()) {
        this.clearAuthData();
        return;
      }
      
      // Validate user with server to get real user data
      this.validateUser().subscribe({
        next: (user) => {
          // User is valid, data is already set in validateUser
        },
        error: (error) => {
          console.warn('Failed to validate user token:', error);
          this.clearAuthData();
        }
      });
    }
  }

  // Method to check if token is expired
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      // Add a small buffer (5 minutes) to prevent edge cases
      return payload.exp < (currentTime + 300);
    } catch {
      return true;
    }
  }
} 