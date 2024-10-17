import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { ToastrComponent } from '../../shared/toastr/toastr.component';
import { ToastrService } from '../../services/toastr.service';

interface Order {
  id: number;
  orderNumber: string;
  date: string;
  status: string;
  items: number;
  total: number;
}

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, ToastrComponent],
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css']
})
export class OrderHistoryComponent implements OnInit {
  activeTab: 'upcoming' | 'history' = 'history';
  upcomingOrders: Order[] = [];
  historyOrders: Order[] = [];

  constructor(
    private orderService: OrderService,
    private router: Router,
    private authService: AuthService,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    const distributorId = this.authService.getDistributorId();
    if (distributorId) {
      const distributorIdNumber = parseInt(distributorId, 10);
      this.orderService.getOrderHistory(distributorIdNumber).subscribe(data => {
        this.upcomingOrders = data.upcomingOrders;
        this.historyOrders = data.historyOrders;
      });
    } else {
      this.toastr.error('No distributor ID found');
    }
  }

  setActiveTab(tab: 'upcoming' | 'history') {
    this.activeTab = tab;
  }

  viewOrderDetails(orderId: number) {
    this.router.navigate(['/order-details', orderId]);
  }

  get displayedOrders(): Order[] {
    return this.activeTab === 'upcoming' ? this.upcomingOrders : this.historyOrders;
  }
}