import { Component, OnInit } from '@angular/core';
import { DashboardService } from 'src/app/shared/services/dashboard-service';

@Component({
    selector: 'app-notifications',
    template: `
        <div class="relative">
            <button class="p-2 rounded-full hover:bg-gray-100" (click)="toggleNotifications()">
                <span class="sr-only">Notifications</span>
                <i class="fas fa-bell"></i>
                <span *ngIf="unreadCount > 0" 
                      class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                    {{unreadCount}}
                </span>
            </button>

            <div *ngIf="showNotifications" 
                 class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg overflow-hidden z-50">
                <div class="p-4 border-b">
                    <div class="flex justify-between items-center">
                        <h3 class="font-semibold">Notifications</h3>
                        <button class="text-sm text-blue-500 hover:text-blue-700"
                                (click)="markAllAsRead()">
                            Mark all as read
                        </button>
                    </div>
                </div>
                <div class="max-h-96 overflow-y-auto">
                    <div *ngFor="let notif of notifications" 
                         class="p-4 border-b hover:bg-gray-50 cursor-pointer"
                         [class.bg-blue-50]="notif.status === 'unread'"
                         (click)="markAsRead(notif.notif_id)">
                        <p class="text-sm">{{notif.message}}</p>
                        <p class="text-xs text-gray-500 mt-1">
                            {{notif.createdAt | date:'short'}}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class NotificationsComponent implements OnInit {
    notifications: any[] = [];
    unreadCount: number = 0;
    showNotifications: boolean = false;

    constructor(private dashboardService: DashboardService) { }

    ngOnInit() {
        this.loadNotifications();
    }

    loadNotifications() {
        // Get unread notifications count
        this.dashboardService.getNotificationCount().subscribe(
            (data) => {
                this.unreadCount = data.count;
            }
        );

        // Get unread notifications
        this.dashboardService.getUnreadNotifications().subscribe(
            (data) => {
                this.notifications = data;
            }
        );
    }

    toggleNotifications() {
        this.showNotifications = !this.showNotifications;
    }

    markAsRead(notifId: number) {
        this.dashboardService.markNotificationsAsRead([notifId]).subscribe(
            () => {
                this.loadNotifications();
            }
        );
    }

    markAllAsRead() {
        this.dashboardService.markAllNotificationsAsRead().subscribe(
            () => {
                this.loadNotifications();
            }
        );
    }
}
