// src/app/auto-logout.service.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AutoLogoutService {
  private timeoutId: any;

  constructor(private router: Router) {
    this.startTimer();
    this.setupListeners();
  }

  startTimer(): void {
    this.timeoutId = setTimeout(() => this.logout(), 30 * 60 * 1000); // 30 minutes
  }

  resetTimer(): void {
    clearTimeout(this.timeoutId);
    this.startTimer();
  }

  setupListeners(): void {
    document.addEventListener('mousemove', () => this.resetTimer());
    document.addEventListener('keypress', () => this.resetTimer());
  }

  logout(): void {
    localStorage.removeItem('username');
    this.router.navigate(['/login']);
  }
}
