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
  step1Completed: boolean = false;
  step2Completed: boolean = false;

  get progressWidth(): string {
    return this.currentStep === 1 ? '50%' : '100%';
  }

  get isStep1Valid(): boolean {
    return (
      this.firstName.trim() !== '' &&
      this.lastName.trim() !== '' &&
      this.email.trim() !== '' &&
      this.password.trim() !== '' &&
      this.acceptTerms
    );
  }

  get isStep2Valid(): boolean {
    return this.address.trim() !== '';
  }

  nextStep() {
    if (this.currentStep === 1 && this.isStep1Valid) {
      this.step1Completed = true;
      this.currentStep = 2;
    }
  }

  onSubmit() {
    if (this.currentStep === 2 && this.isStep2Valid) {
      this.step2Completed = true;
      // Handle signup logic here
      console.log('Signup submitted', this.firstName, this.lastName, this.email, this.password, this.address);
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}