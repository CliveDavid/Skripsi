import { Component, OnInit } from '@angular/core';
import { DashboardService } from 'src/app/shared/services/dashboard-service';

interface DashboardStats {
  currentWeek: {
    totalDistributors: string;
    totalOrders: string;
    totalRevenue: string;
    deliveredOrders: string;
  };
  previousWeek: {
    totalDistributors: string;
    totalOrders: string;
    totalRevenue: string;
    deliveredOrders: string;
  };
  percentageChanges: {
    distributors: string;
    orders: string;
    revenue: string;
    delivered: string;
  };
}

interface Order {
  order_number: string;
  order_dt: string;
  status: 'Pending' | 'Processing' | 'Invoiced';
  total_price: string;
  shipment_code: 'FS' | 'CD';
}

interface Notification {
  notif_id: number;
  admin_id: string;
  message: string;
  status: 'read' | 'unread';
  createdAt: string;
  updatedAt: string;
  time?: string;
}

interface DisplayStats {
  shipments: { value: number; change: string };
  orders: { value: number; change: string };
  revenue: { value: number; change: string };
  delivered: { value: number; change: string };
}

type OrderStatus = 'All' | 'Pending' | 'Processing' | 'Invoiced';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  stats: DisplayStats = {
    shipments: { value: 0, change: '0%' },
    orders: { value: 0, change: '0%' },
    revenue: { value: 0, change: '0%' },
    delivered: { value: 0, change: '0%' }
  };
  topProducts: any[] = [];
  recentOrders: Order[] = [];
  notifications: Notification[] = [];
  unreadCount: number = 0;
  showNotifications: boolean = false;

  showStatusFilter = false;
  filteredStatus: OrderStatus = 'All';

  statusOptions: OrderStatus[] = ['All', 'Pending', 'Processing', 'Invoiced'];

  constructor(private dashboardService: DashboardService) { }

  ngOnInit() {
    this.loadDashboardData();
    this.loadNotifications();
  }

  loadDashboardData() {
    this.dashboardService.getStats().subscribe((data: DashboardStats) => {
      this.stats = {
        shipments: {
          value: parseInt(data.currentWeek.totalDistributors),
          change: data.percentageChanges.distributors
        },
        orders: {
          value: parseInt(data.currentWeek.totalOrders),
          change: data.percentageChanges.orders
        },
        revenue: {
          value: parseFloat(data.currentWeek.totalRevenue),
          change: data.percentageChanges.revenue
        },
        delivered: {
          value: parseInt(data.currentWeek.deliveredOrders),
          change: data.percentageChanges.delivered
        }
      };
    });

    this.dashboardService.getTopProducts().subscribe(data => {
      this.topProducts = data;
    });

    this.dashboardService.getRecentOrders().subscribe(data => {
      this.recentOrders = data;
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  filterOrders(status: 'Pending' | 'Processing' | 'Invoiced') {
    this.filteredStatus = status;
  }

  loadNotifications() {
    this.dashboardService.getNotificationCount().subscribe(data => {
      this.unreadCount = data.count;
    });

    this.dashboardService.getUnreadNotifications().subscribe(data => {
      this.notifications = data.map((notification: { createdAt: string } & Omit<Notification, 'time'>) => ({
        ...notification,
        time: this.formatTimeAgo(new Date(notification.createdAt))
      }));
    });
  }

  formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  }

  markAsRead(notifId: number) {
    this.dashboardService.markNotificationsAsRead([notifId]).subscribe(() => {
      this.loadNotifications();
    });
  }

  markAllAsRead() {
    this.dashboardService.markAllNotificationsAsRead().subscribe(() => {
      this.loadNotifications();
    });
  }

  deleteNotification(notifId: number) {
    this.dashboardService.deleteNotifications([notifId]).subscribe(() => {
      this.loadNotifications();
    });
  }

  deleteAllNotifications() {
    this.dashboardService.deleteAllNotifications().subscribe(() => {
      this.loadNotifications();
    });
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }

  formatCurrency(value: string | number): string {
    const numValue = typeof value === 'string' ? Number(value) : value;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numValue)
      .replace('IDR', 'Rp')
      .replace(/\s+/g, ' ');
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      delivered: 'text-green-500',
      pending: 'text-yellow-500',
      shipping: 'text-blue-500'
    };
    return colors[status.toLowerCase()] || 'text-gray-500';
  }


  toggleStatusFilter() {
    this.showStatusFilter = !this.showStatusFilter;
  }

  setStatus(status: OrderStatus) {
    this.filteredStatus = status;
    this.showStatusFilter = false;
  }
}