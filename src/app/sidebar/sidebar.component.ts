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
    { label: 'Organization', icon: 'fa-building', route: '/organization' },
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
