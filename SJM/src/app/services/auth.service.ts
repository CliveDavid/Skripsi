import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BASE_URL } from '../constants';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CartService } from './cart.service';

interface LoginResponse {
  message: string;
  email: string;
  distributor_id: number;
}

interface LogoutResponse {
  message: string;
}

interface VerifyOtpResponse {
  success: boolean;
  message: string;
}

interface AuthResult {
  success: boolean;
  email?: string;
  error?: string;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = BASE_URL;
  private authStateSubject = new BehaviorSubject<boolean>(this.isLoggedIn());
  authState$ = this.authStateSubject.asObservable();

  constructor(
    private router: Router,
    private http: HttpClient,
    private cartService: CartService
  ) { }

  login(email: string, password: string): Observable<AuthResult> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/distributor/login`, { email, password })
      .pipe(
        map((response: LoginResponse) => {
          if (response.message === 'Logged in successfully') {
            this.setSession(response);
            this.authStateSubject.next(true);
            return { success: true, email: response.email, message: response.message };
          }
          return { success: false, message: response.message };
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('An error occurred:', error);
          return of({
            success: false,
            message: error.error.message || 'An unknown error occurred'
          });
        })
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
        this.clearSession();
        this.authStateSubject.next(false);
        return of({ success: false, error: error.message });
      })
    );
  }

  verifyOtp(email: string, otp: string): Observable<VerifyOtpResponse> {
    return this.http.post<VerifyOtpResponse>(`${this.apiUrl}/distributor/verify-otp`, { email, otp }).pipe(
      map((response: VerifyOtpResponse) => {
        if (response.success) {
          return { success: true, message: response.message };
        }
        return { success: false, message: 'OTP verification failed' };
      }),
      catchError((error: HttpErrorResponse) => {
        return of({
          success: false,
          message: error.error.message || 'An unknown error occurred'
        });
      })
    );
  }

  resendOtp(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/distributor/resend-otp`, { email });
  }

  isLoggedIn(): boolean {
    const expiresAt = localStorage.getItem('expires_at');
    return !!expiresAt && new Date().getTime() < parseInt(expiresAt);
  }

  refreshAuthState(): void {
    // Check if the user is still logged in based on the stored session data
    const isLoggedIn = this.isLoggedIn();
    this.authStateSubject.next(isLoggedIn);
  }

  getEmail(): string | null {
    return localStorage.getItem('email');
  }

  getDistributorId(): string | null {
    return localStorage.getItem('distributor_id');
  }

  private setSession(authResult: LoginResponse): void {
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('email', authResult.email);
    localStorage.setItem('distributor_id', authResult.distributor_id.toString());

    // Set expiration time to 8 hours from now
    const expiresAt = new Date().getTime() + 8 * 60 * 60 * 1000;
    localStorage.setItem('expires_at', expiresAt.toString());
  }

  private clearSession(): void {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('email');
    localStorage.removeItem('distributor_id');
    localStorage.removeItem('expires_at');
    this.cartService.clearCart();
  }

  private handleError(error: HttpErrorResponse): Observable<AuthResult> {
    console.error('An error occurred:', error);
    return of({
      success: false,
      error: error.error.message || 'An unknown error occurred'
    });
  }
}