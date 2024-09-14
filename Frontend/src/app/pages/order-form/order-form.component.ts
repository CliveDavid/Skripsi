import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

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
  orderForm: FormGroup;
  distributors: any[] = [];
  filteredDistributors: any[] = [];
  shipmentMethods: any[] = [];
  products: any[] = [];
  boxTypes: any[] = [];
  statuses: string[] = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
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
    this.loadDropdownData();
    this.setupDistributorSearch();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadOrderData(id);
    }
  }

  setupDistributorSearch() {
    this.orderForm.get('distributorSearch')!.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => this.searchDistributors(value))
    ).subscribe(results => {
      this.filteredDistributors = results;
    });
  }

  searchDistributors(term: string) {
    // Implement the API call to search distributors
    return this.http.get<any[]>(`/api/distributors/search?term=${term}`);
  }

  selectDistributor(distributor: any) {
    this.orderForm.patchValue({
      distributor_id: distributor.id,
      distributorSearch: distributor.name
    });
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
    this.router.navigate(['/distributor-form']);
  }

  loadDropdownData() {
    // Load distributors, shipment methods, products, and box types
    // You'll need to implement these API calls
    this.http.get<any[]>('/api/distributors').subscribe(data => this.distributors = data);
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
          console.log('Order saved successfully', response);
          this.router.navigate(['/orders']); // Navigate to orders list
        },
        error => {
          console.error('Error saving order', error);
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