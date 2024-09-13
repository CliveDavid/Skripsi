// src/app/signup/signup.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';
import { ToastrService } from '../shared/services/toastr.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup;
  passwordVisible: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.signupForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    return password && confirmPassword && password.value === confirmPassword.value
      ? null : { mismatch: true };
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  onSubmit(): void {
    if (this.signupForm.valid) {
      const { username, password } = this.signupForm.value;
      this.authService.signup({ username, password }).subscribe(
        response => {
          if (response.success) {
            this.toastr.success('Signup successful');
            setTimeout(() => this.router.navigate(['/login']), 1500);
          } else {
            this.toastr.error(response.error || 'Signup failed. Please try again.');
          }
        },
        error => {
          console.error('Signup error:', error);
          this.toastr.error(error.message || 'An unknown error occurred');
        }
      );
    } else {
      this.toastr.error('Please correct the errors in the form.');
      Object.keys(this.signupForm.controls).forEach(key => {
        const control = this.signupForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }


}
