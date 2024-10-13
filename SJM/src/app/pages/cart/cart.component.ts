import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cartItems: any[] = [];
  shippingMethods = [
    { value: 'method1', label: 'Shipping Method 1 (Min 500 boxes)' },
    { value: 'method2', label: 'Shipping Method 2 (Min 500 boxes)' }
  ];
  selectedShippingMethod = 'method1';
  shippingAddress = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud';
  subtotal = 0;
  estimatedTax = 'N/A';
  total = 0;
  placeholderImage = 'assets/images/placeholder-image.png';

  constructor(private cartService: CartService) { }

  ngOnInit() {
    this.cartItems = this.cartService.getCartItems();
    this.updateCart();
  }

  updateCart() {
    this.subtotal = this.cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
    this.total = this.subtotal; // Assuming no additional fees or taxes
    this.cartService.updateCart(this.cartItems);
  }

  proceedToCheckout() {
    // Implement checkout logic
    console.log('Proceeding to checkout');
  }
}