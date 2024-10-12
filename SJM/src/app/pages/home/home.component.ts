import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { ProductService, Product } from '../../services/product.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  pageTitle = 'Our Newest Additions to the Product Line';
  pageDescription = 'Explore our latest snack products, developed to enhance your offerings and meet the growing demand for quality and flavor.';
  products: Product[] = [];
  placeholderImage = 'assets/images/placeholder-image.png';

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    this.fetchProducts();
  }

  fetchProducts() {
    this.productService.getAllProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.products.forEach(product => this.fetchProductImage(product));
      },
      error: (error) => {
        console.error('Error fetching products:', error);
      }
    });
  }

  fetchProductImage(product: Product) {
    this.productService.getProductImage(product.prod_id).subscribe({
      next: (blob: Blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          product.imageUrl = reader.result as string;
        };
        reader.readAsDataURL(blob);
      },
      error: (error) => {
        console.error(`Error fetching image for product ${product.prod_id}:`, error);
        product.imageUrl = this.placeholderImage;
      }
    });
  }
}