import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from './services/auth.service'
import { AutoLogoutService } from './services/auto-logout-service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  pageTitle: string = '';
  showSidebar: boolean = true;
  username: string | null = '';

  constructor(
    private authService: AuthService, 
    private router: Router,
    private autoLogoutService: AutoLogoutService
  ) { 
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updatePageTitle();
      this.updateSidebarVisibility();
      this.username = this.authService.getUsername();
    });
  }

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
    }
    this.updateSidebarVisibility();
    this.username = this.authService.getUsername();
  }

  updatePageTitle() {
    const route = this.router.url;
    if (route.includes('dashboard')) {
      this.pageTitle = 'Dashboard';
    } else if (route.includes('organization')) {
      this.pageTitle = 'Organization';
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

  logout() {
    this.authService.logout();
  }
}
