// customer-support-form.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from '../../services/toastr.service';
import { Router } from '@angular/router';
import { SupportService } from '../../services/support.service';

interface SupportMessage {
  email: string;
  subject: string;
  message: string;
}

@Component({
  selector: 'app-customer-support-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="support-container">
      <h1>Questions, Comments, or Concerns?</h1>
      <p class="office-hours">
        Use the form below to get in touch. Our office hours are Monday through Friday, 9 am to 5 pm, 
        and we attempt to respond to support requests within 1 business day.
      </p>

      <form (ngSubmit)="onSubmit()" #supportForm="ngForm">
        <div class="form-group">
          <label for="email">Email Address</label>
          <input 
            type="email" 
            class="form-control" 
            id="email" 
            [(ngModel)]="messageData.email" 
            name="email" 
            required 
            email>
        </div>

        <div class="form-group">
          <label for="subject">Subject</label>
          <input 
            type="text" 
            class="form-control" 
            id="subject" 
            [(ngModel)]="messageData.subject" 
            name="subject" 
            required>
        </div>

        <div class="form-group">
          <label for="message">Message</label>
          <textarea 
            class="form-control" 
            id="message" 
            [(ngModel)]="messageData.message" 
            name="message" 
            rows="6" 
            required></textarea>
        </div>

        <div class="form-buttons">
          <button type="submit" class="btn btn-primary" [disabled]="!supportForm.form.valid">Send Message</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .support-container {
      max-width: 600px;
      margin: 2rem auto;
      padding: 0 1rem;
    }

    h1 {
      font-size: 1.75rem;
      font-weight: 600;
      margin-bottom: 1rem;
      color: #333;
    }

    .office-hours {
      margin-bottom: 2rem;
      color: #666;
      line-height: 1.5;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #333;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ced4da;
      border-radius: 0.25rem;
      transition: border-color 0.15s ease-in-out;
      font-size: 1rem;
    }

    .form-control:focus {
      border-color: var(--primary-color);
      outline: 0;
      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
    }

    textarea.form-control {
      resize: vertical;
      min-height: 120px;
    }

    .form-buttons {
      display: flex;
      justify-content: flex-end;
      margin-top: 2rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 0.25rem;
      font-size: 1rem;
      font-weight: 500;
    }

    .btn-primary {
      background-color: var(--primary-color);
      border-color: var(--primary-color);
      color: white;
    }

    .btn:disabled {
      opacity: 0.65;
      cursor: not-allowed;
    }

    @media (max-width: 640px) {
      .support-container {
        margin: 1rem auto;
      }

      .form-buttons {
        margin-top: 1.5rem;
      }

      .btn {
        width: 100%;
      }
    }
  `]
})
export class CustomerSupportFormComponent {
  messageData: SupportMessage = {
    email: '',
    subject: '',
    message: ''
  };
  isSubmitting = false;

  constructor(
    private supportService: SupportService,
    private toastr: ToastrService,
    private router: Router
  ) { }

  onSubmit() {
    if (this.isSubmitting) return;

    this.isSubmitting = true;

    this.supportService.sendSupportMessage(this.messageData).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastr.success('Message sent successfully');
          this.router.navigate(['/']);
        } else {
          this.toastr.error(response.message || 'Failed to send message');
          this.isSubmitting = false;
        }
      },
      error: (error) => {
        console.error('Error sending message:', error);
        this.toastr.error(error.error?.message || 'Failed to send message. Please try again.');
        this.isSubmitting = false;
      }
    });
  }
}