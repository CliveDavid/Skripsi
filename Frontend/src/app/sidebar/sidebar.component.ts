import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { SidebarItem } from './sidebar-item';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  sidebarItems: SidebarItem[] = [
    { label: 'Dashboard', icon: 'fa-chart-line', route: '/dashboard' },
    { label: 'Admin', icon: 'fa-user', route: '/admin' },
    { label: 'Distributor', icon: 'fa-truck', route: '/distributor' }, // or user
    { label: 'Products', icon: 'fa-box', route: '/product' }, // cube or box
    { label: 'Orders', icon: 'fa-receipt', route: '/order' },
    // Add more items as needed
  ];

  currentRoute: string;

  constructor(private router: Router) {
    this.currentRoute = this.router.url;
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.currentRoute = this.router.url;
    });
  }

  ngOnInit(): void { }
}
