import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductCardComponent } from '../../components/product-card/product-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  pageTitle = 'Bibendum amet at molestie mattis.';
  pageDescription = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...';

  products = [
    {
      id: 1,
      name: 'Product 1',
      price: 4599000,
      description: 'Description for product 1.',
      imageUrl: 'path-to-image1.jpg'
    },
    {
      id: 2,
      name: 'Product 2',
      price: 4000000,
      description: 'Description for product 2.',
      imageUrl: 'path-to-image2.jpg'
    },
    // Add more product objects as needed
  ];

  constructor() { }

  ngOnInit(): void {
  }
}
