import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BASE_URL } from '../constants';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

interface LoginResponse {
  message: string;
  email: string;
  distributor_id: number;
  username?: string; // Optional, if you still want to include username
}

interface LogoutResponse {
  message: string;
}

interface AuthResult {
  success: boolean;
  email?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = BASE_URL;
  private authStateSubject = new BehaviorSubject<boolean>(this.isLoggedIn());
  authState$ = this.authStateSubject.asObservable();

  constructor(private router: Router, private http: HttpClient) { }

  login(email: string, password: string): Observable<AuthResult> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/distributor/login`, { email, password })
      .pipe(
        map((response: LoginResponse) => {
          if (response.message === 'Logged in successfully') {
            this.setSession(response);
            this.authStateSubject.next(true);
            return { success: true, email: response.email };
          }
          return { success: false };
        }),
        catchError(this.handleError)
      );
  }

  logout(): Observable<AuthResult> {
    return this.http.post<LogoutResponse>(`${this.apiUrl}/distributor/logout`, {}).pipe(
      tap(() => {
        this.clearSession();
        this.authStateSubject.next(false);
      }),
      map(() => ({ success: true })),
      catchError((error) => {
        console.error('Logout failed', error);
        // Clear session even if server-side logout fails
        this.clearSession();
        this.authStateSubject.next(false);
        return of({ success: false, error: error.message });
      })
    );
  }

  isLoggedIn(): boolean {
    const expiresAt = localStorage.getItem('expires_at');
    return !!expiresAt && new Date().getTime() < parseInt(expiresAt);
  }

  getEmail(): string | null {
    return localStorage.getItem('email');
  }

  private setSession(authResult: LoginResponse): void {
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('email', authResult.email);
    localStorage.setItem('distributor_id', authResult.distributor_id.toString());
    if (authResult.username) {
      localStorage.setItem('username', authResult.username);
    }
    // Set expiration time to 8 hours from now
    const expiresAt = new Date().getTime() + 8 * 60 * 60 * 1000;
    localStorage.setItem('expires_at', expiresAt.toString());
  }

  private clearSession(): void {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('email');
    localStorage.removeItem('distributor_id');
    localStorage.removeItem('username');
    localStorage.removeItem('expires_at');
  }

  private handleError(error: HttpErrorResponse): Observable<AuthResult> {
    console.error('An error occurred:', error);
    return of({
      success: false,
      error: error.error.message || 'An unknown error occurred'
    });
  }
}