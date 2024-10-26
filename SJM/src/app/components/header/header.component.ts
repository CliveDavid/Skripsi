import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { ProductTypeService } from '../../services/product-type.service';
import { AuthService } from '../../services/auth.service';
import { Observable, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BASE_URL } from '../../constants';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { ToastrComponent } from '../../shared/toastr/toastr.component';
import { ToastrService } from '../../services/toastr.service';
import { NotificationService } from '../../services/notification.service';

interface ProductType {
  value: string;
  label: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, NgbDropdownModule, CommonModule, FormsModule, ToastrComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @Output() showNotifications = new EventEmitter<void>();
  productTypes: ProductType[] = [];
  selectedType: string = 'All Products';
  searchTerm: string = '';
  cartItemCount: number = 0;
  unreadNotificationCount: number = 0;
  private cartSubscription!: Subscription;

  isLoggedIn$!: Observable<boolean>;
  baseUrl = BASE_URL;

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private productTypeService: ProductTypeService,
    private productService: ProductService,
    private cartService: CartService,
    private toastr: ToastrService,
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
    this.authService.refreshAuthState();
    this.isLoggedIn$ = this.authService.authState$;
    this.fetchProductTypes();

    this.cartSubscription = this.cartService.cartItemCount$.subscribe(
      count => this.cartItemCount = count
    );

    this.notificationService.unreadCount$.subscribe(
      count => this.unreadNotificationCount = count
    );
  }

  ngOnDestroy() {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  onNotificationClick(event: Event) {
    event.preventDefault();
    this.showNotifications.emit();
  }

  fetchProductTypes() {
    this.http.post<ProductType[]>(`${this.baseUrl}/productType/get-kvp`, {}
    ).subscribe(
      (data) => {
        this.productTypes = data;
      },
      (error) => {
        console.error('Error fetching product types:', error);
      }
    );
  }

  selectProductType(value: string, label: string) {
    this.selectedType = label;
    this.productTypeService.setSelectedType(value);
    this.router.navigate(['/']);
  }

  onSearch() {
    this.productService.setSearchTerm(this.searchTerm);
    if (this.router.url !== '/') {
      this.router.navigate(['/']);
    }
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.toastr.success('Logged out successfully');
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 3000);
      },
      error: (error) => {
        this.toastr.error('Logout failed: ' + error);
      }
    });
  }

}