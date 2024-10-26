import { Component, OnInit } from '@angular/core';
import { DashboardService } from 'src/app/shared/services/dashboard-service';

@Component({
    selector: 'app-recent-orders',
    template: `
        <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold">Recent Orders</h2>
                <button class="text-blue-500 hover:text-blue-700">View All</button>
            </div>
            <div class="overflow-x-auto">
                <table class="min-w-full">
                    <thead>
                        <tr class="border-b">
                            <th class="text-left py-3">Order ID</th>
                            <th class="text-left py-3">Route</th>
                            <th class="text-right py-3">Weight</th>
                            <th class="text-right py-3">Fee</th>
                            <th class="text-center py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr *ngFor="let order of recentOrders" class="border-b">
                            <td class="py-3">{{order.order_id}}</td>
                            <td class="py-3">{{order.route_from}} → {{order.route_to}}</td>
                            <td class="text-right">{{order.weight}}kg</td>
                            <td class="text-right">{{ order.fee | currency }}</td>
                            <td class="text-center">
                                <span [class]="getStatusColor(order.status)" 
                                      class="px-2 py-1 rounded-full text-sm">
                                    {{order.status}}
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `
})
export class RecentOrdersComponent implements OnInit {
    recentOrders: any[] = [];

    constructor(private dashboardService: DashboardService) { }

    ngOnInit() {
        this.dashboardService.getRecentOrders().subscribe(
            (data) => {
                this.recentOrders = data;
            }
        );
    }

    getStatusColor(status: string): string {
        const colors: { [key: string]: string } = {
            delivered: 'text-green-500',
            pending: 'text-yellow-500',
            shipping: 'text-blue-500'
        };
        return colors[status.toLowerCase()] || 'text-gray-500';
    }
}
