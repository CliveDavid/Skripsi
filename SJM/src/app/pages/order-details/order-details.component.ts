import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { CommonModule } from '@angular/common';
import { ToastrComponent } from '../../shared/toastr/toastr.component';

interface OrderStatus {
  status: string;
  date: Date;
}

interface OrderItem {
  name: string;
  imageUrl: string;
  color: string;
  quantity: number;
  price: number;
}

interface OrderSummary {
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  platformFee: number;
  creditCardCharge: number;
  eligible: number;
}


@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CommonModule, ToastrComponent],
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.css'
})

export class OrderDetailsComponent implements OnInit {
  orderNumber: string = '';
  customerName: string = '';
  customerEmail: string = '';
  customerPhone: string = '';
  deliveryAddress: { line1: string; line2: string; city: string; postcode: string } = {
    line1: '',
    line2: '',
    city: '',
    postcode: ''
  };
  orderStatuses: OrderStatus[] = [];
  orderItems: OrderItem[] = [];
  orderSummary: OrderSummary = {
    subtotal: 0,
    discount: 0,
    deliveryFee: 0,
    total: 0,
    platformFee: 0,
    creditCardCharge: 0,
    eligible: 0
  };

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const orderId = params['id'];
      this.loadOrderDetails(orderId);
    });
  }

  loadOrderDetails(orderId: string): void {
    this.orderService.getOrderDetails(orderId).subscribe({
      next: (orderDetails: any) => {
        this.orderNumber = orderDetails.orderNumber;
        this.customerName = orderDetails.customerName;
        this.customerEmail = orderDetails.customerEmail;
        this.customerPhone = orderDetails.customerPhone;
        this.deliveryAddress = orderDetails.deliveryAddress;
        this.orderStatuses = orderDetails.orderStatuses;
        this.orderItems = orderDetails.orderItems;
        this.orderSummary = orderDetails.orderSummary;
      },
      error: (error: any) => {
        console.error('Error fetching order details:', error);
        // Handle error (e.g., show error message to user)
      }
    });
  }
}