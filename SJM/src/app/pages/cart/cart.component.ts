import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { ShipmentService } from '../../services/shipment.service';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { AddressChangeComponent } from '../../components/address-change/address-change.component';
import { ToastrService } from '../../services/toastr.service';
import { ToastrComponent } from '../../shared/toastr/toastr.component';
import { OrderService } from '../../services/order.service';

interface ShipmentMethod {
  shipment_code: string;
  shipment_name: string;
  capacity: number;
}

interface AddressInfo {
  address?: string;
  addr_details?: string;
  city?: string;
  province?: string;
  zipcode?: string;
  district?: string;
  subdistrict?: string;
  phone?: string;
}

interface CartItem {
  product: {
    prod_id: number;
    prod_code: string;
    prod_name: string;
    prod_type_code: string;
    descr: string;
    is_active: boolean;
    createdAt: string;
    updatedAt: string;
    product_type_descr: string;
    imageUrl: string;
  };
  boxType: string;
  quantity: number;
  totalPrice: number;
  price: string;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, AddressChangeComponent, ToastrComponent],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cartItems: any[] = [];
  shippingMethods: ShipmentMethod[] = [];
  selectedShippingMethod: string = '';
  shippingAddress: AddressInfo = {};
  subtotal = 0;
  estimatedTax = 'N/A';
  total = 0;
  placeholderImage = 'assets/images/placeholder-image.png';
  totalQuantity = 0;
  showAddressChangePopup = false;

  constructor(
    private cartService: CartService,
    private shipmentService: ShipmentService,
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
    private orderService: OrderService
  ) { }

  ngOnInit() {
    this.loadCartItems();
    this.loadShippingMethods();

    const savedAddress = localStorage.getItem('shippingAddress');
    if (savedAddress) {
      this.shippingAddress = JSON.parse(savedAddress);
    }
    else {
      this.loadShippingAddress();
    }
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
      error: (error) => this.toastr.error('Error fetching shipment methods')
    });
  }

  loadShippingAddress() {
    const distributorId = this.authService.getDistributorId();
    if (distributorId) {
      this.userService.getAddress(distributorId).subscribe({
        next: (addressInfo: AddressInfo) => {
          this.shippingAddress = addressInfo;
          localStorage.setItem('shippingAddress', JSON.stringify(addressInfo));
        },
        error: (error: any) => this.toastr.error('Error fetching shipping address')
      });
    } else {
      this.toastr.error('No distributor ID found');
    }
  }

  updateCart() {
    this.subtotal = this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    this.total = this.subtotal;
    this.totalQuantity = this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
    this.cartService.updateCart(this.cartItems);
  }

  onQuantityChange(item: any) {
    if (item.quantity < 1) {
      item.quantity = 1;
    }
    this.updateCart();
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

  openAddressChangePopup() {
    this.showAddressChangePopup = true;
  }

  useDefaultAddress() {
    this.loadShippingAddress();
  }

  onAddressChanged(newAddress: string) {
    this.shippingAddress = JSON.parse(newAddress);
    localStorage.setItem('shippingAddress', newAddress);
    this.showAddressChangePopup = false;
  }

  onAddressChangeCancelled() {
    this.showAddressChangePopup = false;
  }

  proceedToCheckout() {
    if (this.isValidOrder()) {
      if (this.authService.isLoggedIn()) {
        this.createOrder();
      } else {
        this.toastr.error('User not logged in. Redirecting to login page.');
        localStorage.setItem('redirectUrl', this.router.url);
        this.router.navigate(['/login']);
      }
    } else {
      this.toastr.error('Invalid order');
    }
  }

  createOrder() {
    const orderData = {
      distributor_id: this.authService.getDistributorId(),
      order_dt: new Date().toISOString(),
      status: 'Pending',
      total_price: this.total,
      shipment_code: this.selectedShippingMethod,
      notes: '',
      orderItems: this.cartItems.map((item: CartItem) => ({
        product_id: item.product.prod_id,
        box_type_code: item.boxType,
        qty: item.quantity,
        total_item_price: item.totalPrice
      })),
      addresses: [{
        address: this.shippingAddress.address,
        addr_details: this.shippingAddress.addr_details,
        city: this.shippingAddress.city,
        province: this.shippingAddress.province,
        zipcode: this.shippingAddress.zipcode,
        district: this.shippingAddress.district,
        subdistrict: this.shippingAddress.subdistrict
      }]
    };

    this.orderService.createOrder(orderData).subscribe({
      next: (response) => {
        this.toastr.success('Order placed successfully');
        this.cartService.clearCart();
        this.router.navigate(['/post-checkout', response.order_number]);
      },
      error: (error) => {
        this.toastr.error('Error creating order: ' + error.message);
      }
    });
  }
}