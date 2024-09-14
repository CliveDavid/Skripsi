import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs';
import { BASE_URL } from '../../constants';
import { ToastrService } from 'src/app/shared/services/toastr.service';

interface OrderItem {
  product_id: number;
  box_type_code: string;
  qty: number;
  total_item_price: number;
}

@Component({
  selector: 'app-order-form',
  templateUrl: './order-form.component.html',
  styleUrls: ['./order-form.component.css']
})
export class OrderFormComponent implements OnInit {
  private apiUrl = BASE_URL;

  orderForm: FormGroup;
  filteredDistributors: { id: string, name: string }[] = [];
  shipmentMethods: any[] = [];
  products: any[] = [];
  boxTypes: any[] = [];
  statuses: string[] = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  showNotFound = false;

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.orderForm = this.fb.group({
      distributor_id: ['', Validators.required],
      distributorSearch: [''],
      order_dt: [new Date().toISOString().split('T')[0], Validators.required],
      status: ['Pending', Validators.required],
      total_price: [0, Validators.required],
      shipment_code: ['', Validators.required],
      orderItems: this.fb.array([])
    });
  }

  ngOnInit() {
    this.setupDistributorSearch();
    this.loadDropdownData();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadOrderData(id);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setupDistributorSearch() {
    this.orderForm.get('distributorSearch')!.valueChanges.pipe(
      takeUntil(this.destroy$),
      debounceTime(300),
      distinctUntilChanged(),
    ).subscribe(searchTerm => {
      if (searchTerm) {
        this.searchSubject.next(searchTerm);
      } else {
        this.filteredDistributors = [];
        this.showNotFound = false;
      }
    });

    this.searchSubject.pipe(
      takeUntil(this.destroy$),
      switchMap(term => this.searchDistributors(term))
    ).subscribe(
      results => {
        this.filteredDistributors = results;
        this.showNotFound = results.length === 0;
      },
      error => {
        this.toastr.error('Error searching distributors')
        this.filteredDistributors = [];
        this.showNotFound = true;
      }
    );
  }

  searchDistributors(term: string) {
    return this.http.post<{ id: string, name: string }[]>(`${this.apiUrl}/distributor/search`, { term });
  }

  selectDistributor(distributor: { id: string, name: string }) {
    this.orderForm.patchValue({
      distributor_id: distributor.id,
      distributorSearch: distributor.name
    });
    this.filteredDistributors = [];
  }

  get orderItems() {
    return this.orderForm.get('orderItems') as FormArray;
  }

  addOrderItem() {
    const orderItem = this.fb.group({
      product_id: ['', Validators.required],
      box_type_code: ['', Validators.required],
      qty: [1, [Validators.required, Validators.min(1)]],
      total_item_price: [0, Validators.required]
    });
    this.orderItems.push(orderItem);
  }

  removeOrderItem(index: number) {
    this.orderItems.removeAt(index);
    this.calculateTotalPrice();
  }

  navigateToDistributorForm() {
    const url = this.router.serializeUrl(this.router.createUrlTree(['/distributor/form']));
    window.open(url, '_blank');
  }

  loadDropdownData() {
    // Load distributors, shipment methods, products, and box types
    // You'll need to implement these API calls
    this.http.get<any[]>('/api/shipment-methods').subscribe(data => this.shipmentMethods = data);
    this.http.get<any[]>('/api/products').subscribe(data => this.products = data);
    this.http.get<any[]>('/api/box-types').subscribe(data => this.boxTypes = data);
  }

  loadOrderData(id: string) {
    this.http.get<any>(`/api/orders/${id}`).subscribe(order => {
      this.orderForm.patchValue(order);
      order.orderItems.forEach((item: OrderItem) => {
        this.orderItems.push(this.fb.group(item));
      });
      this.calculateTotalPrice();
    });
  }

  onSubmit() {
    if (this.orderForm.valid) {
      const orderData = this.orderForm.value;
      this.http.post('/api/orders', orderData).subscribe(
        response => {
          this.toastr.success('Order saved successfully')
          this.router.navigate(['/orders']); // Navigate to orders list
        },
        error => {
          this.toastr.error('Error saving order')
        }
      );
    }
  }

  calculateTotalPrice() {
    const total = this.orderItems.controls.reduce((sum, item) => {
      const itemPrice = item.get('total_item_price');
      return sum + (itemPrice ? itemPrice.value : 0);
    }, 0);
    this.orderForm.patchValue({ total_price: total });
  }

  onCancel() {
    // Navigate back or to a specific route
    this.router.navigate(['/orders']); // Adjust this route as needed
  }
}