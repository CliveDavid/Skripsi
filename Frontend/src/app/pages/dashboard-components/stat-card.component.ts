import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-stats-card',
    template: `
        <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex justify-between items-center">
                <h3 class="text-gray-500">{{title}}</h3>
                <span *ngIf="percentageChange" 
                      [class]="getPercentageClass()">
                    {{percentageChange}}
                </span>
            </div>
            <p class="text-2xl font-bold mt-2">
                <ng-container *ngIf="isCurrency">$</ng-container>
                {{value | number:'1.0-0'}}
            </p>
            <p class="text-sm text-gray-500">{{subtitle}}</p>
        </div>
    `
})
export class StatsCardComponent {
    @Input() title!: string;
    @Input() value!: number;
    @Input() subtitle!: string;
    @Input() percentageChange?: string;
    @Input() isCurrency: boolean = false;

    getPercentageClass(): string {
        const value = parseFloat(this.percentageChange?.replace('%', '') || '0');
        return value >= 0 ? 'text-green-500' : 'text-red-500';
    }
}