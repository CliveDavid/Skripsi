import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../services/notification.service';
import { ToastrService } from '../../services/toastr.service';

@Component({
    selector: 'app-notification-panel',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './notification-panel.component.html',
    styleUrls: ['./notification-panel.component.css']
})
export class NotificationPanelComponent implements OnInit {
    @Input() isVisible: boolean = false;
    @Output() visibleChange = new EventEmitter<boolean>();

    notifications: Notification[] = [];
    hasUnread: boolean = false;
    distributor_id: number;
    filterType: 'unread' | 'all' = 'all';

    constructor(
        private notificationService: NotificationService,
        private toastr: ToastrService
    ) {
        this.distributor_id = Number(localStorage.getItem('distributor_id'));
    }

    ngOnInit() {
        this.loadNotifications();
    }

    loadNotifications() {
        if (this.distributor_id) {
            this.notificationService.getAllNotifications(this.distributor_id).subscribe({
                next: (notifications) => {
                    this.notifications = notifications;
                    this.hasUnread = notifications.some(n => n.status === 'unread');
                },
                error: (error) => {
                    console.error('Error loading notifications:', error);
                    this.toastr.error('Failed to load notifications');
                }
            });
        }
    }

    markAsRead(notif_ids: number[]) {
        this.notificationService.markAsRead(this.distributor_id, notif_ids).subscribe({
            next: () => {
                this.loadNotifications();
                this.notificationService.refreshUnreadCount();
            },
            error: (error) => {
                console.error('Error marking notifications as read:', error);
                this.toastr.error('Failed to mark notifications as read');
            }
        });
    }

    markAllAsRead() {
        this.notificationService.markAllAsRead(this.distributor_id).subscribe({
            next: () => {
                this.loadNotifications();
                this.notificationService.refreshUnreadCount();
                this.toastr.success('All notifications marked as read');
            },
            error: (error) => {
                console.error('Error marking all notifications as read:', error);
                this.toastr.error('Failed to mark all notifications as read');
            }
        });
    }

    get filteredNotifications() {
        return this.filterType === 'unread'
            ? this.notifications.filter(n => n.status === 'unread')
            : this.notifications;
    }

    formatTimeAgo(date: string): string {
        const now = new Date();
        const notifDate = new Date(date);
        const diffInHours = Math.floor((now.getTime() - notifDate.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) {
            const diffInMinutes = Math.floor((now.getTime() - notifDate.getTime()) / (1000 * 60));
            return `${diffInMinutes} minutes ago`;
        } else if (diffInHours < 24) {
            return `${diffInHours} hours ago`;
        } else {
            const diffInDays = Math.floor(diffInHours / 24);
            return `${diffInDays} days ago`;
        }
    }

    onNotificationClick(notification: Notification) {
        if (notification.status === 'unread') {
            this.markAsRead([notification.notif_id]);
        }
    }

    deleteNotification(event: Event, notif_id: number) {
        event.stopPropagation();
        this.notificationService.deleteNotifications(this.distributor_id, [notif_id]).subscribe({
            next: () => {
                this.loadNotifications();
                this.notificationService.refreshUnreadCount();
                this.toastr.success('Notification deleted');
            },
            error: (error) => {
                console.error('Error deleting notification:', error);
                this.toastr.error('Failed to delete notification');
            }
        });
    }

    deleteAll() {
        this.notificationService.deleteAllNotifications(this.distributor_id).subscribe({
            next: () => {
                this.loadNotifications();
                this.notificationService.refreshUnreadCount();
                // this.toastr.success('All notifications deleted');
            },
            error: (error) => {
                console.error('Error deleting all notifications:', error);
                this.toastr.error('Failed to delete all notifications');
            }
        });
    }

    close() {
        this.isVisible = false;
        this.visibleChange.emit(this.isVisible);
    }
}