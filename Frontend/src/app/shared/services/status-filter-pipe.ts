import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'filterByStatus'
})
export class StatusFilterPipe implements PipeTransform {
    transform(orders: any[], status: string): any[] {
        if (!orders || !status || status === 'All') return orders;
        return orders.filter(order => order.status === status);
    }
}