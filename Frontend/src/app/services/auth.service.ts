import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BASE_URL } from '../constants';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = BASE_URL;

  constructor(private router: Router, private http: HttpClient) { }

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/login`, { username, password })
      .pipe(
        map((response: any) => {
          if (response.message === 'Logged in successfully') {
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('username', response.username);
            localStorage.setItem('admin_id', response.admin_id.toString());
            return { success: true, username: response.username };
          }
          return { success: false };
        }),
        catchError(() => of({ success: false }))
      );
  }

  signup(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/create`, data)
      .pipe(
        map((response: any) => {
          return { success: true };
        }),
        catchError(() => of({ success: false }))
      );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/logout`, {}).pipe(
      tap(() => {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('username');
        localStorage.removeItem('admin_id');
        this.router.navigate(['/login']);
      }),
      catchError(() => {
        console.error('Logout failed');
        return of({ success: false });
      })
    );
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('isAuthenticated') === 'true';
  }

  getUsername(): string | null {
    return localStorage.getItem('username');
  }
}
