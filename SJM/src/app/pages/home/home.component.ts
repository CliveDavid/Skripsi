import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { ProductService, Product } from '../../services/product.service';
import { ProductTypeService } from '../../services/product-type.service';
import { takeUntil } from 'rxjs/operators';
import { combineLatest, Subject } from 'rxjs';
import { ProductDetailComponent } from '../../components/product-detail/product-detail.component';
import { ToastrService } from '../../services/toastr.service';
import { ToastrComponent } from '../../shared/toastr/toastr.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ProductCardComponent, ProductDetailComponent, ToastrComponent],
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
  selectedProduct: Product | null = null;

  constructor(
    private productService: ProductService,
    private productTypeService: ProductTypeService,
    private changeDetectorRef: ChangeDetectorRef,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.fetchProducts();
    this.listenToFilters();
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  listenToFilters() {
    combineLatest([
      this.productTypeService.selectedType$,
      this.productService.searchTerm$
    ])
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(([type, searchTerm]) => {
        this.filterProducts(type, searchTerm);
      });
  }

  fetchProducts() {
    this.productService.getAllActiveProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.filterProducts('all', '');
        this.products.forEach(product => this.fetchProductImage(product));
      },
      error: (error) => {
        this.toastr.error('Error fetching products');
      }
    });
  }

  filterProducts(type: string, searchTerm: string) {
    this.filteredProducts = this.products.filter(product => {
      const matchesType = type === 'all' || product.prod_type_code === type;
      const matchesSearch = product.prod_name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesType && matchesSearch;
    });

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
        product.imageUrl = this.placeholderImage;
      }
    });
  }

  openProductDetail(product: Product) {
    this.selectedProduct = product;
  }

  closeProductDetail() {
    this.selectedProduct = null;
  }
}