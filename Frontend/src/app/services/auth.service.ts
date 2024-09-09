import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BASE_URL } from '../constants';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

interface LoginResponse {
  message: string;
  username: string;
  admin_id: number;
}

interface LogoutResponse {
  message: string;
}

interface AuthResult {
  success: boolean;
  username?: string;
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

  login(username: string, password: string): Observable<AuthResult> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/admin/login`, { username, password })
      .pipe(
        map((response: LoginResponse) => {
          if (response.message === 'Logged in successfully') {
            this.setSession(response);
            this.authStateSubject.next(true);
            return { success: true, username: response.username };
          }
          return { success: false };
        }),
        catchError(this.handleError)
      );
  }

  logout(): Observable<AuthResult> {
    return this.http.post<LogoutResponse>(`${this.apiUrl}/admin/logout`, {}).pipe(
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

  signup(data: any): Observable<AuthResult> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/admin/create`, data)
      .pipe(
        map((response) => ({ success: true })),
        catchError(this.handleError)
      );
  }

  isLoggedIn(): boolean {
    const expiresAt = localStorage.getItem('expires_at');
    return !!expiresAt && new Date().getTime() < parseInt(expiresAt);
  }

  getUsername(): string | null {
    return localStorage.getItem('username');
  }

  private setSession(authResult: LoginResponse): void {
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('username', authResult.username);
    localStorage.setItem('admin_id', authResult.admin_id.toString());
    // Set expiration time to 8 hours from now
    const expiresAt = new Date().getTime() + 8 * 60 * 60 * 1000;
    localStorage.setItem('expires_at', expiresAt.toString());
  }

  private clearSession(): void {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');
    localStorage.removeItem('admin_id');
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