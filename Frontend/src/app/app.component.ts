import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from './services/auth.service'
import { AutoLogoutService } from './services/auto-logout-service';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  pageTitle: string = '';
  showSidebar: boolean = true;
  username: string | null = '';
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router,
    private autoLogoutService: AutoLogoutService
  ) { }

  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.updatePageTitle();
      this.updateSidebarVisibility();
      this.updateUsername();
    });

    this.updateSidebarVisibility();
    this.updateUsername();

    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  updatePageTitle() {
    const route = this.router.url;
    if (route.includes('dashboard')) {
      this.pageTitle = 'Dashboard';
    } else if (route.includes('admin')) {
      this.pageTitle = 'Admin';
    }
    // add more conditions for other pages
  }

  getCurrentDate(): string {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return today.toLocaleDateString('en-US', options);
  }

  updateSidebarVisibility() {
    const route = this.router.url;
    this.showSidebar = !(route.includes('login') || route.includes('signup'));
  }

  updateUsername() {
    this.username = this.authService.getUsername();
  }

  logout() {
    this.authService.logout();
  }
}
