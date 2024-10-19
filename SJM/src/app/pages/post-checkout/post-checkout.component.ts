import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-post-checkout',
    templateUrl: './post-checkout.component.html',
    styleUrls: ['./post-checkout.component.css'],
    standalone: true,
    imports: [CommonModule]
})
export class PostCheckoutComponent implements OnInit {
    orderNumber: string = '';

    constructor(private router: Router, private route: ActivatedRoute) { }

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.orderNumber = params['order_number'];
        });
    }

    goHome() {
        this.router.navigate(['/']);
    }

    viewOrderDetails(orderNumber: string) {
        this.router.navigate(['/order-details', orderNumber]);
    }
}