import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../shared/services/dashboard-service';

@Component({
    selector: 'app-top-products',
    template: `
        <div class="bg-white p-6 rounded-lg shadow mb-8">
            <h2 class="text-xl font-bold mb-4">Top Products</h2>
            <div class="overflow-x-auto">
                <table class="min-w-full">
                    <thead>
                        <tr class="border-b">
                            <th class="text-left py-3">Product Name</th>
                            <th class="text-right py-3">Orders</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr *ngFor="let product of topProducts" class="border-b">
                            <td class="py-3">{{product.product_name}}</td>
                            <td class="text-right">{{product.order_count}}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `
})
export class TopProductsComponent implements OnInit {
    topProducts: any[] = [];

    constructor(private dashboardService: DashboardService) { }

    ngOnInit() {
        this.loadTopProducts();
    }

    loadTopProducts() {
        this.dashboardService.getTopProducts().subscribe(
            (data) => {
                this.topProducts = data;
            }
        );
    }
}
