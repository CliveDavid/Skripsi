import { Pipe, PipeTransform } from '@angular/core';

interface Order {
    order_number: string;
    order_dt: string;
    status: 'Pending' | 'Processing' | 'Invoiced';
    total_price: string;
    shipment_code: 'FS' | 'CD';
}

@Pipe({
    name: 'filterByStatus'
})
export class StatusFilterPipe implements PipeTransform {
    transform(orders: Order[], status: string): Order[] {
        if (!orders || !status) return orders;
        return orders.filter(order => order.status === status);
    }
}