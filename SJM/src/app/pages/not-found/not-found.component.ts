import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-not-found',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <div class="container">
      <div class="row justify-content-center mt-5">
        <div class="col-md-6 text-center">
          <h1 class="display-1">404</h1>
          <h2 class="mb-4">Page Not Found</h2>
          <p class="lead mb-4">Oops! The page you're looking for doesn't exist.</p>
          <a routerLink="/" class="btn btn-primary">Go back to Home</a>
        </div>
      </div>
    </div>
  `,
    styles: [`
    :host {
      display: block;
      height: 100vh;
      background-color: #f8f9fa;
    }
    .container {
      padding-top: 10vh;
    }
    h1 {
      color: #dc3545;
      font-weight: bold;
    }
    h2 {
      color: #343a40;
    }
  `]
})
export class NotFoundComponent { }