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

    close() {
        this.isVisible = false;
        this.visibleChange.emit(this.isVisible);
    }
}