import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  currentStep: number = 1;
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  password: string = '';
  acceptTerms: boolean = false;
  address: string = '';
  showPassword: boolean = false;

  nextStep() {
    if (this.currentStep < 2) {
      this.currentStep++;
    }
  }

  onSubmit() {
    // Handle signup logic here
    console.log('Signup submitted', this.firstName, this.lastName, this.email, this.password, this.address);
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}