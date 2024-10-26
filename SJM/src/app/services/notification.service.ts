import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { BASE_URL } from '../constants';

export interface Notification {
    notif_id: number;
    header: string;
    message: string;
    status: string;
    createdAt: string;
}

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private unreadCountSubject = new BehaviorSubject<number>(0);
    unreadCount$ = this.unreadCountSubject.asObservable();

    constructor(private http: HttpClient) {
        this.refreshUnreadCount();
    }

    getAllNotifications(distributor_id: number): Observable<Notification[]> {
        return this.http.post<Notification[]>(`${BASE_URL}/distributor-notifications/get-all`, { distributor_id });
    }

    getUnreadNotifications(distributor_id: number): Observable<Notification[]> {
        return this.http.post<Notification[]>(`${BASE_URL}/distributor-notifications/get-unread`, { distributor_id });
    }

    getNotificationCount(distributor_id: number): Observable<{ count: number }> {
        return this.http.post<{ count: number }>(`${BASE_URL}/distributor-notifications/get-count`, { distributor_id });
    }

    markAsRead(distributor_id: number, notif_ids: number[]): Observable<any> {
        return this.http.post(`${BASE_URL}/distributor-notifications/mark-as-read`, { distributor_id, notif_ids });
    }

    markAllAsRead(distributor_id: number): Observable<any> {
        return this.http.post(`${BASE_URL}/distributor-notifications/mark-all-as-read`, { distributor_id });
    }

    deleteNotifications(distributor_id: number, notif_ids: number[]): Observable<any> {
        return this.http.post(`${BASE_URL}/distributor-notifications/delete`, { distributor_id, notif_ids });
    }

    deleteAllNotifications(distributor_id: number): Observable<any> {
        return this.http.post(`${BASE_URL}/distributor-notifications/delete-all`, { distributor_id });
    }

    refreshUnreadCount() {
        const distributor_id = Number(localStorage.getItem('distributor_id'));
        if (distributor_id) {
            this.getNotificationCount(distributor_id).subscribe(
                ({ count }) => this.unreadCountSubject.next(count)
            );
        }
    }
}