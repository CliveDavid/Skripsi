import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { BASE_URL } from 'src/app/constants';
import { DashboardService } from 'src/app/shared/services/dashboard-service';
import { ToastrService } from 'src/app/shared/services/toastr.service';

interface DashboardStats {
  currentPeriod: {
    totalDistributors: string;
    totalOrders: string;
    totalRevenue: string;
    deliveredOrders: string;
  };
  previousPeriod: {
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
  order_id: number;
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
type TimePeriod = 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';


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
  private apiUrl = BASE_URL;
  topProducts: any[] = [];
  recentOrders: Order[] = [];
  notifications: Notification[] = [];
  unreadCount: number = 0;
  showNotifications: boolean = false;

  showStatusFilter = false;
  showPeriodFilter = false;
  filteredStatus: OrderStatus = 'All';
  statusOptions: OrderStatus[] = ['All', 'Pending', 'Processing', 'Invoiced'];

  selectedPeriod: TimePeriod = 'WEEK';  // Default to 'WEEK'
  timePeriodOptions: TimePeriod[] = ['DAY', 'WEEK', 'MONTH', 'YEAR'];

  constructor(
    private http: HttpClient,
    private dashboardService: DashboardService,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.loadDashboardData();
    this.loadNotifications();
  }

  loadDashboardData() {
    this.dashboardService.getStats(this.selectedPeriod).subscribe((data: any) => {
      this.stats = {
        shipments: {
          value: parseInt(data.currentPeriod.totalDistributors),
          change: data.percentageChanges.distributors
        },
        orders: {
          value: parseInt(data.currentPeriod.totalOrders),
          change: data.percentageChanges.orders
        },
        revenue: {
          value: parseFloat(data.currentPeriod.totalRevenue),
          change: data.percentageChanges.revenue
        },
        delivered: {
          value: parseInt(data.currentPeriod.deliveredOrders),
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

  changePeriod() {
    this.loadDashboardData();
  }

  togglePeriodFilter() {
    this.showPeriodFilter = !this.showPeriodFilter;
  }

  setPeriod(period: TimePeriod) {
    this.selectedPeriod = period;
    this.showPeriodFilter = false;
    this.changePeriod();
  }

  printReport() {
    if (this.stats) {
      this.http.post(`${this.apiUrl}/dashboard/generate-pdf`,
        {
          period: this.selectedPeriod,
          stats: this.stats,
          orders: this.recentOrders,
          notifications: this.notifications
        },
        { responseType: 'blob' }
      ).subscribe(
        (response: Blob) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const arr = new Uint8Array(reader.result as ArrayBuffer).subarray(0, 5);
            const header = String.fromCharCode.apply(null, arr as any);
            if (header !== "%PDF-") {
              console.error('Invalid PDF header');
              this.toastr.error('Invalid PDF format');
              return;
            }
            this.proceedWithDownload(response);
          };
          reader.readAsArrayBuffer(response.slice(0, 5));
        },
        (error) => {
          this.toastr.error('Error downloading PDF');
        }
      );
    }
  }

  private proceedWithDownload(blob: Blob) {
    const url = window.URL.createObjectURL(blob);

    // Open the PDF in a new tab
    const newTab = window.open();
    if (newTab) {
      newTab.location.href = url;
    }

    // Download PDF
    const link = document.createElement('a');
    link.href = url;
    link.download = `dashboard-report-${this.selectedPeriod.toLowerCase()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the object URL after 100ms
    setTimeout(() => window.URL.revokeObjectURL(url), 100);

    this.toastr.success('PDF downloaded successfully');
  }
}