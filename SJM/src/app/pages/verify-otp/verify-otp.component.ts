import { Component, ViewChildren, QueryList, ElementRef, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrComponent } from '../../shared/toastr/toastr.component';
import { ToastrService } from '../../services/toastr.service';

@Component({
    selector: 'app-verify-otp',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, ToastrComponent],
    templateUrl: './verify-otp.component.html',
    styleUrls: ['./verify-otp.component.css']
})
export class VerifyOtpComponent implements OnInit {
    @ViewChildren('otp1, otp2, otp3, otp4, otp5, otp6') otpInputs!: QueryList<ElementRef>;
    otp: string = '';
    email: string = '';
    isResendDisabled: boolean = false;
    resendCountdown: number = 0;

    constructor(private authService: AuthService, private toastr: ToastrService, private route: ActivatedRoute, private router: Router) { }

    ngOnInit() {
        this.email = this.route.snapshot.queryParamMap.get('email') || '';
        if (!this.email) {
            this.router.navigate(['/register']); // Redirect if no email is provided
        }
    }

    onOtpInput(event: any, index: number) {
        const input = event.target;
        const nextInput = this.otpInputs.get(index + 1);
        const prevInput = this.otpInputs.get(index - 1);

        if (input.value.length === 1) {
            if (nextInput) {
                nextInput.nativeElement.focus();
            } else {
                setTimeout(() => {
                    this.otp = this.otpInputs.map(input => input.nativeElement.value).join('');
                    if (this.otp.length === 6) {
                        this.onVerifyOtp();
                    }
                }, 100); // 100ms delay
            }
        } else if (input.value.length === 0 && prevInput) {
            prevInput.nativeElement.focus();
        }

        this.otp = this.otpInputs.map(input => input.nativeElement.value).join('');
    }

    onVerifyOtp() {
        this.otp = this.otpInputs.map(input => input.nativeElement.value).join('');
        if (this.otp.length !== 6) {
            this.toastr.error('Please enter a 6-digit OTP.');
            return;
        }

        this.authService.verifyOtp(this.email, this.otp).subscribe({
            next: (response) => {
                if (response.message === "Account verified successfully") {
                    this.toastr.success('Account verified successfully. You can now log in.');
                    this.router.navigate(['/login']);
                } else {
                    this.toastr.error('Invalid OTP, please try again.');
                }
            },
            error: (error) => {
                console.error('OTP verification failed', error);
                this.toastr.error(error.error.message || 'OTP verification failed. Please try again.');
            }
        });
    }

    resendCode(event: Event) {
        event.preventDefault();
        if (this.isResendDisabled) return;

        this.isResendDisabled = true;
        this.resendCountdown = 60; // 60 seconds cooldown

        this.authService.resendOtp(this.email).subscribe({
            next: (response) => {
                this.toastr.error(response.message);
                this.startResendCooldown();
            },
            error: (error) => {
                console.error('Failed to resend OTP', error);
                this.toastr.error(error.error.message || 'Failed to resend OTP. Please try again.');
                this.isResendDisabled = false;
            }
        });
    }

    private startResendCooldown() {
        const countdownInterval = setInterval(() => {
            this.resendCountdown--;
            if (this.resendCountdown <= 0) {
                this.isResendDisabled = false;
                clearInterval(countdownInterval);
            }
        }, 1000);
    }
}