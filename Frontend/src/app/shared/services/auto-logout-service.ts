import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AutoLogoutService {
  private autoLogoutTimer: any;

  constructor(private authService: AuthService, private router: Router) { }

  initTimer() {
    this.resetTimer();
    // Set up event listeners for user activity
    ['click', 'mousedown', 'keypress', 'scroll', 'touchstart'].forEach(evt =>
      document.addEventListener(evt, () => this.resetTimer(), false)
    );
  }

  resetTimer() {
    if (this.autoLogoutTimer) {
      clearTimeout(this.autoLogoutTimer);
    }
    this.autoLogoutTimer = setTimeout(() => this.autoLogout(), 30 * 60 * 1000); // 30 minutes
  }

  private autoLogout() {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}