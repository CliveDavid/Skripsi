import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-post-checkout',
    templateUrl: './post-checkout.component.html',
    styleUrls: ['./post-checkout.component.css'],
    standalone: true,
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
}