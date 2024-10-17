import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { BASE_URL } from '../constants';

interface Order {
    id: number;
    orderNumber: string;
    date: string;
    status: string;
    items: number;
    total: number;
}

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    constructor(private http: HttpClient) { }

    createOrder(orderData: any): Observable<any> {
        return this.http.post(`${BASE_URL}/orders/create`, orderData);
    }

    getOrderHistory(distributorId: number): Observable<{ upcomingOrders: Order[], historyOrders: Order[] }> {
        return this.http.post<{ upcomingOrders: Order[], historyOrders: Order[] }>(
            `${BASE_URL}/orders/get-for-history`,
            { distributor_id: distributorId }
        );
    }
}