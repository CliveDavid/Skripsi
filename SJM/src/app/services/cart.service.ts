import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private cartItems: any[] = [];
    private cartItemCount = new BehaviorSubject<number>(0);

    cartItemCount$ = this.cartItemCount.asObservable();

    constructor() {
        this.loadCart();
    }

    private loadCart() {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            this.cartItems = JSON.parse(savedCart);
            this.cartItemCount.next(this.cartItems.length);
        }
    }

    private saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cartItems));
        this.cartItemCount.next(this.cartItems.length);
    }

    addToCart(item: any) {
        this.cartItems.push(item);
        this.saveCart();
    }

    getCartItems() {
        return this.cartItems;
    }

    updateCart(items: any[]) {
        this.cartItems = items;
        this.saveCart();
    }

    getCartItemCount() {
        return this.cartItemCount$;
    }

    clearCart() {
        this.cartItems = [];
        this.saveCart();
    }
}