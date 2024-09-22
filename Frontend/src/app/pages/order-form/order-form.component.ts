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
export class OrderFormComponent implements OnInit, OnDestroy {
  private apiUrl = BASE_URL;

  orderForm: FormGroup;
  filteredDistributors: { distributor_id: string, name: string }[] = [];
  shipmentMethods: any[] = [];
  products: any[] = [];
  boxTypes: any[] = [];
  statuses: string[] = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  showNotFound = false;
  isEditMode: boolean = false;
  distributorInfo: any = null;

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    public route: ActivatedRoute,
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
      order_notes: [''],
      orderItems: this.fb.array([])
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.queryParamMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.loadOrderData(id);
    } else {
      this.setupDistributorSearch();
    }

    this.loadDropdownData();
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
      if (searchTerm && typeof searchTerm === 'string') {
        this.searchSubject.next(searchTerm);
        this.orderForm.patchValue({ distributor_id: '' }, { emitEvent: false });
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
        this.toastr.error('Error searching distributors');
        this.filteredDistributors = [];
        this.showNotFound = true;
      }
    );

    this.orderForm.get('distributor_id')!.valueChanges.pipe(
      takeUntil(this.destroy$),
      distinctUntilChanged(),
    ).subscribe(distributorId => {
      if (distributorId) {
        this.loadDistributorInfo(distributorId);
      } else {
        this.distributorInfo = null;
      }
    });
  }

  searchDistributors(term: string) {
    return this.http.post<{ distributor_id: string, name: string }[]>(`${this.apiUrl}/distributor/search`, { term });
  }

  selectDistributor(distributor: { distributor_id: string, name: string }) {
    this.orderForm.patchValue({
      distributor_id: distributor.distributor_id,
      distributorSearch: distributor.name
    }, { emitEvent: false });

    this.filteredDistributors = [];
    this.loadDistributorInfo(distributor.distributor_id);
  }

  loadDistributorInfo(distributorId: string) {
    this.http.post<any>(`${this.apiUrl}/distributor/get-by-id`, { id: distributorId }).subscribe(
      info => {
        this.distributorInfo = info;
      },
      error => {
        this.toastr.error('Error loading distributor information');
        this.distributorInfo = null;
      }
    );
  }

  get orderItems() {
    return this.orderForm.get('orderItems') as FormArray;
  }

  addOrderItem() {
    const orderItem = this.fb.group({
      product_id: ['', Validators.required],
      box_type_code: ['', Validators.required],
      qty: [1, [Validators.required, Validators.min(1)]],
      price: [0, Validators.required],
      total_item_price: [0, Validators.required]
    });

    orderItem.get('product_id')?.valueChanges.subscribe(() => this.updateItemPrice(orderItem));
    orderItem.get('box_type_code')?.valueChanges.subscribe(() => this.updateItemPrice(orderItem));
    orderItem.get('qty')?.valueChanges.subscribe(() => this.updateItemPrice(orderItem));

    this.orderItems.push(orderItem);
  }

  updateItemPrice(orderItem: FormGroup) {
    const productId = orderItem.get('product_id')?.value;
    const boxTypeCode = orderItem.get('box_type_code')?.value;
    const qty = orderItem.get('qty')?.value;

    if (productId && boxTypeCode) {
      this.http.post<any>(`${this.apiUrl}/price/get-price`, { productId, boxTypeCode }).subscribe(
        response => {
          const price = response.price;
          orderItem.patchValue({
            price: price,
            total_item_price: price * qty
          });
          this.calculateTotalPrice();
        },
        error => {
          this.toastr.error('Error fetching price');
        }
      );
    }
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
    this.http.post<any[]>(`${this.apiUrl}/shipmentMethods/get-shipment-method-kvp`, {}).subscribe(data => {
      this.shipmentMethods = data.map(item => ({
        shipment_code: item.value,
        shipment_name: item.label
      }));
    });

    this.http.post<any[]>(`${this.apiUrl}/product/get-product-kvp`, {}).subscribe(data => {
      this.products = data.map(item => ({
        prod_id: item.value,
        prod_name: item.label
      }));
    });

    this.http.post<any[]>(`${this.apiUrl}/boxType/get-box-type-kvp`, {}).subscribe(data => {
      this.boxTypes = data.map(item => ({
        box_type_code: item.value,
        box_type_name: item.label
      }));
    });
  }

  loadOrderData(id: string) {
    this.http.post<any>(`${this.apiUrl}/orders/get-by-id`, { order_id: id }).subscribe(
      order => {
        this.orderForm.patchValue({
          distributor_id: order.distributor_id,
          distributorSearch: order.distributor_name,
          order_dt: order.order_dt,
          status: order.status,
          shipment_code: order.shipment_code,
          total_price: order.total_price,
          order_notes: order.order_notes
        });

        // Disable distributor and order date fields
        this.orderForm.get('distributorSearch')?.disable();
        this.orderForm.get('order_dt')?.disable();

        // Clear existing order items
        while (this.orderItems.length !== 0) {
          this.orderItems.removeAt(0);
        }

        // Add order items
        order.orderItems.forEach((item: any) => {
          const orderItem = this.fb.group({
            product_id: [item.product_id, Validators.required],
            product_name: [item.product_name],
            box_type_code: [item.box_type_code, Validators.required],
            box_type_display: [item.box_type_display],
            qty: [item.qty, [Validators.required, Validators.min(1)]],
            price: [item.total_item_price / item.qty, Validators.required],
            total_item_price: [item.total_item_price, Validators.required]
          });

          // Set up value change subscriptions
          orderItem.get('product_id')?.valueChanges.subscribe(() => this.updateItemPrice(orderItem));
          orderItem.get('box_type_code')?.valueChanges.subscribe(() => this.updateItemPrice(orderItem));
          orderItem.get('qty')?.valueChanges.subscribe(() => this.updateItemPrice(orderItem));

          this.orderItems.push(orderItem);
        });

        this.calculateTotalPrice();
        this.loadDistributorInfo(order.distributor_id);
      },
      error => {
        this.toastr.error('Error loading order data');
      }
    );
  }

  canProgressStatus(): boolean {
    const currentStatus = this.orderForm.get('status')?.value;
    const currentIndex = this.statuses.indexOf(currentStatus);
    return currentIndex < this.statuses.length - 2; // -2 because we don't progress from Delivered or Cancelled
  }

  progressStatus(): void {
    const currentStatus = this.orderForm.get('status')?.value;
    const currentIndex = this.statuses.indexOf(currentStatus);
    if (currentIndex < this.statuses.length - 2) {
      const nextStatus = this.statuses[currentIndex + 1];
      const confirmMessage = `Are you sure you want to update the status from ${currentStatus} to ${nextStatus}?`;

      if (confirm(confirmMessage)) {
        this.orderForm.patchValue({ status: nextStatus });
        this.onSubmit();
      }
    }
  }


  onSubmit() {
    if (this.orderForm.valid) {
      const formValue = this.orderForm.getRawValue();
      const id = this.route.snapshot.queryParamMap.get('id');
      const url = id ? `${this.apiUrl}/orders/update` : `${this.apiUrl}/orders/create`;

      // Prepare the order data
      const orderData: any = {
        status: formValue.status,
        total_price: formValue.total_price,
        shipment_code: formValue.shipment_code,
        order_notes: formValue.order_notes,
        orderItems: formValue.orderItems.map((item: any) => ({
          product_id: item.product_id,
          box_type_code: item.box_type_code,
          qty: item.qty,
          total_item_price: item.total_item_price
        }))
      };

      // Add fields only for create operation
      if (!id) {
        orderData.distributor_id = formValue.distributor_id;
        orderData.order_dt = formValue.order_dt;
      } else {
        orderData.order_id = id;
      }

      console.log('Sending order data:', orderData);

      this.http.post(url, orderData).subscribe(
        response => {
          this.toastr.success(`Order ${id ? 'updated' : 'created'} successfully`);
          this.router.navigate(['/order']);
        },
        error => {
          console.error('Error response:', error);
          this.toastr.error(`Error ${id ? 'updating' : 'creating'} order: ${error.error?.message || 'Unknown error'}`);
        }
      );
    } else {
      this.toastr.error('Please fill all required fields correctly');
      console.log('Form validation errors:', this.orderForm.errors);
    }
  }

  calculateTotalPrice() {
    const total = this.orderItems.controls.reduce((sum, item) => {
      return sum + (item.get('total_item_price')?.value || 0);
    }, 0);
    this.orderForm.patchValue({ total_price: total });
  }

  onCancel() {
    this.router.navigate(['/order']);
  }
}