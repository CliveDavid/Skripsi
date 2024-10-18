import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { CommonModule } from '@angular/common';
import { ToastrComponent } from '../../shared/toastr/toastr.component';

interface OrderStatus {
  status: string;
  changed_at: string;
}

interface OrderItem {
  product_name: string;
  box_type_display: string;
  qty: number;
  total_item_price: number;
  imageUrl?: string;
}

interface Invoice {
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  payment_status: string;
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
  shippingDetails: { address: string; shipmentMethod: string } = {
    address: '',
    shipmentMethod: ''
  };
  orderStatusHistory: OrderStatus[] = [];
  orderItems: OrderItem[] = [];
  total_price: number = 0;
  invoice: Invoice | null = null;
  placeholderImage: string = 'assets/images/placeholder-image.png';

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
        this.orderNumber = orderDetails.order_number;

        this.shippingDetails = {
          address: orderDetails.address,
          shipmentMethod: orderDetails.shipment_name
        };
        this.orderStatusHistory = orderDetails.status_history;
        this.orderItems = orderDetails.items;
        this.total_price = orderDetails.total_price;
        this.invoice = orderDetails.invoice;
      },
      error: (error: any) => {
        console.error('Error fetching order details:', error);
        // Handle error (e.g., show error message to user)
      }
    });
  }
}