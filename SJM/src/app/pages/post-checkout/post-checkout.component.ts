import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-post-checkout',
    templateUrl: './post-checkout.component.html',
    styleUrls: ['./post-checkout.component.css'],
    standalone: true,
})
export class PostCheckoutComponent {
    orderNumber: string = '7DVJGTZLSK';

    constructor(private router: Router) { }

    goHome() {
        this.router.navigate(['/']);
    }
}
