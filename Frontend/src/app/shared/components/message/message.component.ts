import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface MessageData {
    text: string;
    type: 'success' | 'error';
}

@Component({
    selector: 'app-message',
    templateUrl: './message.component.html',
    styleUrls: ['./message.component.css']
})
export class MessageComponent implements OnInit, OnDestroy {
    @Input() set message(value: MessageData | null) {
        if (value) {
            this.setMessage(value);
            this.show();
        }
    }

    @Input() duration: number = 5000; // Duration in milliseconds

    messageText: string = '';
    messageType: 'success' | 'error' = 'success';
    isVisible: boolean = false;
    private destroy$ = new Subject<void>();

    ngOnInit() { }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private setMessage(message: MessageData) {
        this.messageText = message.text;
        this.messageType = message.type;
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