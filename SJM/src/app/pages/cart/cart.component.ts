import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { ShipmentService } from '../../services/shipment.service';
import { AddressService } from '../../services/address.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

interface ShipmentMethod {
  shipment_code: string;
  shipment_name: string;
  capacity: number;
}

interface AddressResponse {
  address: string;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cartItems: any[] = [];
  shippingMethods: ShipmentMethod[] = [];
  selectedShippingMethod: string = '';
  shippingAddress = '';
  subtotal = 0;
  estimatedTax = 'N/A';
  total = 0;
  placeholderImage = 'assets/images/placeholder-image.png';
  totalQuantity = 0;

  constructor(
    private cartService: CartService,
    private shipmentService: ShipmentService,
    private addressService: AddressService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadCartItems();
    this.loadShippingMethods();
    this.loadShippingAddress();
  }

  loadCartItems() {
    this.cartItems = this.cartService.getCartItems();
    this.updateCart();
  }

  loadShippingMethods() {
    this.shipmentService.getAllShipmentMethods().subscribe({
      next: (methods) => {
        this.shippingMethods = methods;
      },
      error: (error) => console.error('Error fetching shipment methods:', error)
    });
  }

  loadShippingAddress() {
    const distributorId = this.authService.getDistributorId();
    if (distributorId) {
      this.addressService.getAddress(distributorId).subscribe({
        next: (response: AddressResponse) => {
          this.shippingAddress = response.address;
        },
        error: (error: any) => console.error('Error fetching shipping address:', error)
      });
    } else {
      console.error('No distributor ID found');
    }
  }

  updateCart() {
    this.subtotal = this.cartItems.reduce((sum, item) => sum + (item.totalPrice * item.quantity), 0);
    this.total = this.subtotal;
    this.totalQuantity = this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
    this.cartService.updateCart(this.cartItems);
  }

  isValidOrder(): boolean {
    if (this.cartItems.length === 0) return false;
    if (!this.selectedShippingMethod) return false;

    const selectedMethod = this.shippingMethods.find(m => m.shipment_code === this.selectedShippingMethod);
    if (!selectedMethod) return false;

    return this.totalQuantity >= selectedMethod.capacity;
  }

  removeItem(item: any) {
    const index = this.cartItems.indexOf(item);
    if (index > -1) {
      this.cartItems.splice(index, 1);
      this.updateCart();
    }
  }

  proceedToCheckout() {
    if (this.isValidOrder()) {
      if (this.authService.isLoggedIn()) {
        console.log('Proceeding to checkout');
        // Add your checkout logic here
      } else {
        console.log('User not logged in. Redirecting to login page.');
        localStorage.setItem('redirectUrl', this.router.url);
        this.router.navigate(['/login']);
      }
    } else {
      console.log('Invalid order');
    }
  }
}