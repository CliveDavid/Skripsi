import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BASE_URL } from '../../constants';

interface DashboardStats {
    currentWeek: {
        totalOrders: string;
        totalRevenue: string;
        deliveredOrders: string;
    };
    previousWeek: {
        totalOrders: string;
        totalRevenue: string | null;
        deliveredOrders: string;
    };
    percentageChanges: {
        orders: string;
        revenue: string;
        delivered: string;
    };
    totalDistributors: number;
}

interface NotificationCount {
    count: number;
}

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private dashboardApi = `${BASE_URL}/dashboard`;
    private notificationApi = `${BASE_URL}/admin-notifications`;

    constructor(private http: HttpClient) { }

    private getAdminId() {
        return localStorage.getItem('admin_id') || '';
    }

    getStats(): Observable<DashboardStats> {
        return this.http.post<DashboardStats>(`${this.dashboardApi}/stats`, {});
    }

    getRecentOrders(): Observable<any> {
        return this.http.post(`${this.dashboardApi}/recent-orders`, {});
    }

    getTopProducts(): Observable<any> {
        return this.http.post(`${this.dashboardApi}/top-products`, {});
    }

    // Notification
    getAllNotifications(): Observable<any> {
        return this.http.post(`${this.notificationApi}/get-all`, { admin_id: this.getAdminId() });
    }

    getUnreadNotifications(): Observable<any> {
        return this.http.post(`${this.notificationApi}/get-unread`, { admin_id: this.getAdminId() });
    }

    getNotificationCount(): Observable<NotificationCount> {
        return this.http.post<NotificationCount>(`${this.notificationApi}/get-count`, { admin_id: this.getAdminId() });
    }

    markNotificationsAsRead(notifIds: number[]): Observable<any> {
        return this.http.post(`${this.notificationApi}/mark-as-read`, { admin_id: this.getAdminId(), notif_ids: notifIds });
    }

    markAllNotificationsAsRead(): Observable<any> {
        return this.http.post(`${this.notificationApi}/mark-all-as-read`, { admin_id: this.getAdminId() });
    }

    deleteNotifications(notifIds: number[]): Observable<any> {
        return this.http.post(`${this.notificationApi}/delete`, { admin_id: this.getAdminId(), notif_ids: notifIds });
    }

    deleteAllNotifications(): Observable<any> {
        return this.http.post(`${this.notificationApi}/delete-all`, { admin_id: this.getAdminId() });
    }
}