import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { RouterModule, Router, ActivatedRoute } from '@angular/router'; // Import Router
import { ToastrComponent } from '../../shared/toastr/toastr.component';
import { ToastrService } from '../../services/toastr.service';
import { take } from 'rxjs';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ToastrComponent],
  providers: [AuthService],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;
  showPassword: boolean = false;
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    // Check if we're already logged in
    this.authService.authState$.pipe(take(1)).subscribe(isLoggedIn => {
      if (isLoggedIn) {
        this.handleRedirect();
      }
    });
  }

  private handleRedirect() {
    // First check sessionStorage
    const storedReturnUrl = sessionStorage.getItem('returnUrl');
    if (storedReturnUrl) {
      sessionStorage.removeItem('returnUrl');
      this.router.navigate([storedReturnUrl]);
      return;
    }

    // Then check query params
    const queryReturnUrl = this.route.snapshot.queryParams['returnUrl'];
    if (queryReturnUrl) {
      this.router.navigate([queryReturnUrl]);
      return;
    }

    // Default redirect
    this.router.navigate(['/']);
  }

  onSubmit() {
    this.authService.login(this.email, this.password).subscribe({
      next: (result) => {
        if (result.success) {
          this.handleRedirect();
        } else {
          this.errorMessage = result.message || 'Login failed. Please try again.';
          this.toastr.error(this.errorMessage);
        }
      },
      error: (error) => {
        console.error('Login error', error);
        this.errorMessage = error.error?.message || 'An unknown error occurred';
        this.toastr.error(this.errorMessage);
      }
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}