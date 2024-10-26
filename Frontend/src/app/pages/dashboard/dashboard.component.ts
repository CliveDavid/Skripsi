import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BASE_URL } from '../../constants';
import { DashboardService } from 'src/app/shared/services/dashboard-service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  stats: any;
  topProducts: any[] = [];
  recentOrders: any[] = [];
  notifications: any[] = [];
  unreadCount: number = 0;
  showNotifications: boolean = false;

  constructor(private dashboardService: DashboardService) { }

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    // Load stats
    this.dashboardService.getStats().subscribe((data) => {
      this.stats = data;
    });

    // Load top products
    this.dashboardService.getTopProducts().subscribe((data) => {
      this.topProducts = data;
    });

    // Load recent orders
    this.dashboardService.getRecentOrders().subscribe((data) => {
      this.recentOrders = data;
    });

    // Load notifications
    this.dashboardService.getNotificationCount().subscribe((data) => {
      this.unreadCount = data.count;
    });

    this.dashboardService.getUnreadNotifications().subscribe((data) => {
      this.notifications = data;
    });
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }

  markAsRead(notifId: number) {
    this.dashboardService.markNotificationsAsRead([notifId]).subscribe(() => {
      this.loadDashboardData();
    });
  }

  markAllAsRead() {
    this.dashboardService.markAllNotificationsAsRead().subscribe(() => {
      this.loadDashboardData();
    });
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      delivered: 'text-green-500',
      pending: 'text-yellow-500',
      shipping: 'text-blue-500'
    };
    return colors[status.toLowerCase()] || 'text-gray-500';
  }
}
