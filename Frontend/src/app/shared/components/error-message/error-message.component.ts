import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-error-message',
    templateUrl: './error-message.component.html',
    styleUrls: ['./error-message.component.css']
})
export class ErrorMessageComponent implements OnInit, OnDestroy {
    @Input() set error(value: any) {
        if (value) {
            this.setErrorMessage(value);
            this.show();
        }
    }

    @Input() duration: number = 5000; // Duration in milliseconds

    errorMessage: string = '';
    isVisible: boolean = false;
    private destroy$ = new Subject<void>();

    ngOnInit() { }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private setErrorMessage(error: any) {
        if (typeof error === 'string') {
            this.errorMessage = error;
        } else if (error.error && error.error.message) {
            this.errorMessage = error.error.message;
        } else if (error.message) {
            this.errorMessage = error.message;
        } else {
            this.errorMessage = 'An unknown error occurred';
        }
    }

    private show() {
        this.isVisible = true;
        timer(this.duration)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                this.isVisible = false;
            });
    }

    closeMessage() {
        this.isVisible = false;
    }
}