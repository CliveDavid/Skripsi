import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { BASE_URL } from 'src/app/constants';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit {

  constructor(private http: HttpClient) { }

  ngOnInit() {
  }

  filterOptions = [
    { label: 'Active', value: ['Pending', 'Processing', 'Invoiced'], default: true },
    { label: 'Pending', value: 'Pending' },
    { label: 'Processing', value: 'Processing' },
    { label: 'Invoiced', value: 'Invoiced' },
    { label: 'Delivered', value: 'Delivered' },
    { label: 'Cancelled', value: 'Cancelled' }
  ];

  shouldShowActionButtons = (row: any) => {
    return !['Delivered', 'Cancelled'].includes(row.status);
  };

}
