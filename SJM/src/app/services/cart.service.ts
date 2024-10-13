import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ProductService } from './product.service';

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private cartItems: any[] = [];
    private cartItemCount = new BehaviorSubject<number>(0);

    cartItemCount$ = this.cartItemCount.asObservable();

    constructor(private productService: ProductService) {
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
        this.productService.getPrice(item.product.prod_id, item.boxType).subscribe({
            next: (priceData) => {
                item.price = priceData.price;
                this.cartItems.push(item);
                this.saveCart();
            },
            error: (error) => console.error('Error fetching price:', error)
        });
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