import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    if (!this.authService.isAuthenticated() || this.authService.isTokenExpired()) {
      this.authService.logout();
      this.router.navigate(['/login']);
      return of(false);
    }

    // Validate user with server
    return this.authService.validateUser().pipe(
      map(() => true),
      catchError(() => {
        this.authService.logout();
        this.router.navigate(['/login']);
        return of(false);
      })
    );
  }
} 