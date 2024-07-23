import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BASE_URL } from '../constants';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
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
              if (response.message === 'Login successful') {
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('username', username);
                return { success: true };
              }
              return { success: false };
            }),
            catchError(() => of({ success: false }))
          );
    }

    signup(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/admin/signup`, data)
          .pipe(
            map((response: any) => {
              return { success: true };
            }),
            catchError(() => of({ success: false }))
          );
      }

    logout(): void {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('username');
        this.router.navigate(['/login']);
    }

    isLoggedIn(): boolean {
        return localStorage.getItem('isAuthenticated') === 'true';
    }

    getUsername(): string | null {
        return localStorage.getItem('username');
    }
}
