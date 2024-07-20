import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    constructor(private router: Router) { }
    private username: string | null = null;

    login(username: string, password: string): boolean {
        if (username === 'test' && password === 'test') {
            this.username = username
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('username', username);
            return true;
        }
        return false;
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
