import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToastrService, ToastMessage } from '../../services/toastr.service';

@Component({
    selector: 'app-message',
    templateUrl: './message.component.html',
    styleUrls: ['./message.component.css']
})
export class MessageComponent implements OnInit, OnDestroy {
    message: ToastMessage | null = null;
    private toastSubscription: Subscription | null = null;

    constructor(private toastrService: ToastrService) { }

    ngOnInit() {
        this.toastSubscription = this.toastrService.getToast().subscribe(toast => {
            this.message = toast;
        });
    }

    ngOnDestroy() {
        if (this.toastSubscription) {
            this.toastSubscription.unsubscribe();
        }
    }

    closeMessage() {
        this.toastrService.clearToast();
    }
}