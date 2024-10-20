// src/app/shared/components/confirm-dialog/confirm-dialog.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-confirm-dialog',
    template: `
    <div class="dialog-overlay" *ngIf="visible" (click)="onOverlayClick($event)">
      <div class="dialog-container">
        <h2>{{ title }}</h2>
        <p>{{ message }}</p>
        <div class="dialog-actions">
          <button class="btn btn-secondary" (click)="onCancel()">Cancel</button>
          <button class="btn btn-primary" (click)="onConfirm()">Continue</button>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .dialog-container {
      background: white;
      padding: 24px;
      border-radius: 8px;
      min-width: 320px;
      max-width: 90%;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 20px;
    }
    h2 {
      margin: 0 0 16px;
      font-size: 18px;
    }
    p {
      margin: 0;
      color: #666;
    }
  `]
})
export class ConfirmDialogComponent {
    @Input() visible = false;
    @Input() title = '';
    @Input() message = '';
    @Output() confirm = new EventEmitter<void>();
    @Output() cancel = new EventEmitter<void>();

    onOverlayClick(event: MouseEvent): void {
        if ((event.target as Element).className === 'dialog-overlay') {
            this.cancel.emit();
        }
    }

    onConfirm(): void {
        this.confirm.emit();
    }

    onCancel(): void {
        this.cancel.emit();
    }
}