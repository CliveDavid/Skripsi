import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, NgbDropdownModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  isLoggedIn$!: Observable<boolean>;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.authService.refreshAuthState();
    this.isLoggedIn$ = this.authService.authState$;
  }

  showNotifications() {
    // Implement notification display logic
    console.log('Show notifications');
  }

  showProfile() {
    // Implement profile display logic
    this.logout();
    console.log('Show profile');
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        console.log('Logged out successfully');
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Logout failed', error);
        // Handle logout error (show a message to the user, etc.)
      }
    });
  }
}