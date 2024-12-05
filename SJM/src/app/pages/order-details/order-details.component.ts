import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { CommonModule } from '@angular/common';
import { ToastrComponent } from '../../shared/toastr/toastr.component';
import { DomSanitizer } from '@angular/platform-browser';
import { ProductService } from '../../services/product.service';
import { ToastrService } from '../../services/toastr.service';

interface OrderStatus {
  status: string;
  changed_at: string;
}

interface OrderItem {
  prod_id: number;
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
  canCancelOrder: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private productService: ProductService,
    private sanitizer: DomSanitizer,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const orderNumber = params['orderNumber'];
      this.loadOrderDetails(orderNumber);
    });
  }

  loadOrderDetails(orderNumber: string): void {
    this.orderService.getOrderDetails(orderNumber).subscribe({
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

        this.canCancelOrder = this.orderStatusHistory.length > 0 &&
          this.orderStatusHistory[this.orderStatusHistory.length - 1].status === 'Pending';

        this.loadProductImages();
      },
      error: (error: any) => {
        this.toastr.error('Error fetching order details');
      }
    });
  }

  loadProductImages(): void {
    this.orderItems.forEach(item => {
      this.productService.getProductImage(item.prod_id).subscribe({
        next: (blob: Blob) => {
          const objectUrl = URL.createObjectURL(blob);
          item.imageUrl = this.sanitizer.bypassSecurityTrustUrl(objectUrl) as string;
        },
        error: (error: any) => {
          this.toastr.error(`Error fetching image for product ${item.prod_id}:`);
          item.imageUrl = this.placeholderImage;
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.orderItems.forEach(item => {
      if (item.imageUrl && item.imageUrl !== this.placeholderImage) {
        URL.revokeObjectURL(item.imageUrl);
      }
    });
  }

  cancelOrder(): void {
    if (confirm('Are you sure you want to cancel this order?')) {
      this.orderService.cancelOrder(this.orderNumber).subscribe({
        next: () => {
          this.toastr.success('Order cancelled successfully');
          this.loadOrderDetails(this.orderNumber);
        },
        error: (error: any) => {
          this.toastr.error('Error cancelling order');
        }
      });
    }
  }
}