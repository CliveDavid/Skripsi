import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { ProductService, Product } from '../../services/product.service';
import { ProductTypeService } from '../../services/product-type.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

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
  filteredProducts: Product[] = [];
  products: Product[] = [];
  placeholderImage = 'assets/images/placeholder-image.png';
  private unsubscribe$ = new Subject<void>();

  constructor(
    private productService: ProductService,
    private productTypeService: ProductTypeService,
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.fetchProducts();
    this.listenToProductTypeChanges();
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  listenToProductTypeChanges() {
    this.productTypeService.selectedType$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(type => {
        this.filterProducts(type);
      });
  }

  fetchProducts() {
    this.productService.getAllActiveProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.filterProducts('all'); // Initial filter
        this.products.forEach(product => this.fetchProductImage(product));
      },
      error: (error) => {
        console.error('Error fetching products:', error);
      }
    });
  }

  filterProducts(type: string) {
    if (type === 'all') {
      this.filteredProducts = this.products;
    } else {
      this.filteredProducts = this.products.filter(product => product.prod_type_code === type);
    }

    this.changeDetectorRef.detectChanges();
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