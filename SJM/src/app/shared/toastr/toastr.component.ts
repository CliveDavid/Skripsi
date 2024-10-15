import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToastMessage, ToastrService } from '../../services/toastr.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-toastr',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './toastr.component.html',
    styleUrls: ['./toastr.component.css']
})
export class ToastrComponent implements OnInit, OnDestroy {
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