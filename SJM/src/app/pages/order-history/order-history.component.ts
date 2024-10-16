import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Shipment {
  id: number;
  date: string;
  items: number;
  total: number;
  details: string[];
}

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css']
})
export class OrderHistoryComponent {
  activeTab: 'upcoming' | 'history' = 'history';
  selectedShipment: Shipment | null = null;
  shipments: Shipment[] = [
    { id: 1, date: 'May 15, 2020', items: 3, total: 65.26, details: ['Item 1', 'Item 2', 'Item 3'] },
    { id: 2, date: 'Mar 10, 2020', items: 3, total: 65.26, details: ['Item 4', 'Item 5', 'Item 6'] },
    { id: 3, date: 'Jan 1, 2020', items: 3, total: 65.26, details: ['Item 7', 'Item 8', 'Item 9'] }
  ];

  setActiveTab(tab: 'upcoming' | 'history') {
    this.activeTab = tab;
  }

  selectShipment(shipment: Shipment) {
    this.selectedShipment = shipment;
  }
}