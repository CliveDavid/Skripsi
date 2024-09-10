import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ToastMessage {
    text: string;
    type: 'success' | 'error';
}

@Injectable({
    providedIn: 'root'
})
export class ToastrService {
    private toastSubject = new BehaviorSubject<ToastMessage | null>(null);

    success(message: string = 'Operation successful'): void {
        this.showToast({ text: message, type: 'success' });
    }

    error(message: string = 'Something went wrong'): void {
        this.showToast({ text: message, type: 'error' });
    }

    private showToast(toast: ToastMessage): void {
        this.toastSubject.next(toast);
        // Automatically clear the toast after 5 seconds
        setTimeout(() => this.clearToast(), 5000);
    }

    getToast(): Observable<ToastMessage | null> {
        return this.toastSubject.asObservable();
    }

    clearToast(): void {
        this.toastSubject.next(null);
    }
}