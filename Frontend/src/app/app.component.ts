import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from './shared/services/auth.service';
import { AutoLogoutService } from './shared/services/auto-logout-service';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
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

    // Check login state and redirect if necessary
    this.checkLoginState();

    // Start the auto logout service
    this.autoLogoutService.initTimer();

    // Subscribe to auth state changes
    this.authService.authState$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.updateUsername();
      this.updateSidebarVisibility();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  updatePageTitle(): void {
    const routeTitleMap: { [key: string]: string } = {
      'dashboard': 'Dashboard',
      'admin': 'Admin',
      'product': 'Product',
      'distributor-address': 'Distributor Address',
      'distributor': 'Distributor',
      'order': 'Order',
      'invoice': 'Invoice',
      'additional-settings': 'Additional Settings',
      // add more routes and titles here
    };

    const currentRoute = Object.keys(routeTitleMap).find(routeKey => this.router.url.includes(routeKey));
    this.pageTitle = currentRoute ? routeTitleMap[currentRoute] : 'Not Found'; // Set default title if no match found
  }

  getCurrentDate(): string {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return today.toLocaleDateString('en-US', options);
  }

  updateSidebarVisibility() {
    const route = this.router.url;
    this.showSidebar = this.authService.isLoggedIn() && !(route.includes('login') || route.includes('signup'));
  }

  updateUsername() {
    this.username = this.authService.getUsername();
  }

  logout() {
    this.authService.logout().subscribe(
      (result) => {
        if (result.success) {
          console.log('Logged out successfully');
          this.router.navigate(['/login']);
        } else {
          console.error('Logout failed:', result.error);
        }
      }
    );
  }

  private checkLoginState() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
    } else {
      // Verify token validity here if you're using tokens
      // If invalid, logout and redirect to login
    }
  }
}