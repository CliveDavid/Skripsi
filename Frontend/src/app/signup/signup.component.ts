// src/app/signup/signup.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MessageData } from '../shared/components/message/message.component';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup;
  passwordVisible: boolean = false;
  message: MessageData | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
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
            this.message = { text: 'Signup successful', type: 'success' };
            setTimeout(() => this.router.navigate(['/login']), 1000);
          } else {
            this.message = { text: response.error || 'Signup failed. Please try again.', type: 'error' };
          }
        },
        error => {
          console.error('Signup error:', error);
          this.message = { text: error.message || 'An unknown error occurred', type: 'error' };
        }
      );
    } else {
      this.message = { text: 'Please correct the errors in the form.', type: 'error' };
      Object.keys(this.signupForm.controls).forEach(key => {
        const control = this.signupForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }


}
