import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private cartItems: any[] = [];
    private cartItemCount = new BehaviorSubject<number>(0);

    cartItemCount$ = this.cartItemCount.asObservable();

    constructor() { }

    addToCart(item: any) {
        this.cartItems.push(item);
        this.cartItemCount.next(this.cartItems.length);
    }

    getCartItems() {
        return this.cartItems;
    }

    updateCart(items: any[]) {
        this.cartItems = items;
        this.cartItemCount.next(this.cartItems.length);
    }

    getCartItemCount() {
        return this.cartItemCount$;
    }
}