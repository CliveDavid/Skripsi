import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs';
import { BASE_URL } from '../../constants';
import { ToastrService } from 'src/app/shared/services/toastr.service';

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
  statuses: string[] = ['Pending', 'Processing', 'Invoiced', 'Delivered', 'Cancelled'];
  showNotFound = false;
  isEditMode: boolean = false;
  addressInfo: any = null;
  distributorInfo: any = null;
  showAddressChangePopup = false;
  showStatusMenu = false;

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
      orderItems: this.fb.array([]),
      discount: [0],
      additional_fee: [0],
      invoice_dt: [new Date().toISOString().split('T')[0]],
      payment_status: ['Unpaid']
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

    this.orderForm.get('status')?.valueChanges.subscribe(status => {
      this.updateInvoiceFields(status);
      if (status === 'Invoiced' || status === 'Delivered') {
        this.loadInvoiceData();
      }
    });
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
        this.loadAddressInfo(distributorId);
      } else {
        this.addressInfo = null;
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
    this.loadAddressInfo(distributor.distributor_id);
    this.loadDistributorInfo(distributor.distributor_id);
  }

  loadAddressInfo(distributorId: string) {
    this.http.post<any>(`${this.apiUrl}/distributor/get-address`, { id: distributorId }).subscribe(
      info => {
        this.addressInfo = info;
      },
      error => {
        this.toastr.error('Error loading distributor information');
        this.addressInfo = null;
      }
    );
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

  editShippingAddress(): void {
    this.showAddressChangePopup = true;
  }

  onAddressChanged(addressInfoString: string): void {
    this.addressInfo = JSON.parse(addressInfoString);
    this.showAddressChangePopup = false;
  }

  onAddressChangeCancelled(): void {
    this.showAddressChangePopup = false;
  }

  loadOrderData(id: string) {
    this.http.post<any>(`${this.apiUrl}/orders/get-by-id`, { order_id: id }).subscribe(
      order => {
        this.http.post<any>(`${this.apiUrl}/distributor/get-by-id`, { id: order.distributor_id }).subscribe(
          distributor => {
            this.orderForm.patchValue({
              distributor_id: order.distributor_id,
              distributorSearch: distributor.name,
              order_dt: order.order_dt.split('T')[0],
              status: order.status,
              shipment_code: order.shipment_code,
              total_price: parseFloat(order.total_price),
              order_notes: order.notes
            });
          }
        );

        this.orderForm.get('distributorSearch')?.disable();
        this.orderForm.get('order_dt')?.disable();

        while (this.orderItems.length !== 0) {
          this.orderItems.removeAt(0);
        }

        order.order_items.forEach((item: any) => {
          const orderItem = this.fb.group({
            product_id: [item.product_id, Validators.required],
            product_name: [item.product.prod_name],
            box_type_code: [item.box_type_code, Validators.required],
            box_type_display: [item.box_type.box_capacity],
            qty: [item.qty, [Validators.required, Validators.min(1)]],
            price: [parseFloat(item.total_item_price) / item.qty, Validators.required],
            total_item_price: [parseFloat(item.total_item_price), Validators.required]
          });

          orderItem.get('product_id')?.valueChanges.subscribe(() => this.updateItemPrice(orderItem));
          orderItem.get('box_type_code')?.valueChanges.subscribe(() => this.updateItemPrice(orderItem));
          orderItem.get('qty')?.valueChanges.subscribe(() => this.updateItemPrice(orderItem));

          this.orderItems.push(orderItem);
        });

        if (order.addresses && order.addresses.length > 0) {
          this.addressInfo = {
            address: order.addresses[0].address,
            addr_details: order.addresses[0].addr_details,
            city: order.addresses[0].city,
            province: order.addresses[0].province,
            zipcode: order.addresses[0].zipcode,
            district: order.addresses[0].district,
            subdistrict: order.addresses[0].subdistrict
          };
        }

        this.loadDistributorInfo(order.distributor_id);
        this.calculateTotalPrice();
      },
      error => {
        this.toastr.error('Error loading order data');
      }
    );
  }

  loadInvoiceData() {
    const orderId = this.route.snapshot.queryParamMap.get('id');
    if (orderId) {
      this.http.post<any>(`${this.apiUrl}/invoices/get-by-order-id`, { order_id: orderId }).subscribe(
        invoice => {
          if (invoice && Object.keys(invoice).length > 0) {
            const formattedInvoiceDate = invoice.invoice_dt ? new Date(invoice.invoice_dt).toISOString().split('T')[0] : null;
            this.orderForm.patchValue({
              invoice_dt: formattedInvoiceDate,
              discount: invoice.discount,
              additional_fee: invoice.additional_fee,
              payment_status: invoice.payment_status
            });
          } else {
            // If no invoice data, set default values or clear the fields
            this.orderForm.patchValue({
              invoice_dt: new Date().toISOString().split('T')[0],
              discount: 0,
              additional_fee: 0,
              payment_status: 'Unpaid'
            });
          }
        },
        error => {
          console.error('Error loading invoice data:', error);
          this.toastr.error('Error loading invoice data');
        }
      );
    }
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

  toggleStatusMenu(): void {
    this.showStatusMenu = !this.showStatusMenu;
  }

  getAvailableStatusActions(): string[] {
    const currentStatus = this.orderForm.get('status')?.value;
    const currentIndex = this.statuses.indexOf(currentStatus);
    return this.statuses.slice(currentIndex + 1, -1);
  }

  canCancel(): boolean {
    const currentStatus = this.orderForm.get('status')?.value;
    return currentStatus !== 'Delivered' && currentStatus !== 'Cancelled';
  }

  handleStatusChange(newStatus: string): void {
    const confirmMessage = `Are you sure you want to mark this order as ${newStatus}?`;
    if (confirm(confirmMessage)) {
      this.orderForm.patchValue({ status: newStatus });
      this.onSubmit();
    }
    this.showStatusMenu = false;
  }

  updateInvoiceFields(status: string) {
    const invoiceFields = ['discount', 'additional_fee', 'invoice_dt', 'payment_status'];
    if (status === 'Invoiced' || status === 'Delivered') {
      invoiceFields.forEach(field => {
        this.orderForm.get(field)?.setValidators(Validators.required);
        this.orderForm.get(field)?.enable();
      });
    } else {
      invoiceFields.forEach(field => {
        this.orderForm.get(field)?.clearValidators();
        this.orderForm.get(field)?.disable();
      });
    }
    this.orderForm.get('discount')?.updateValueAndValidity();
    this.orderForm.get('additional_fee')?.updateValueAndValidity();
    this.orderForm.get('invoice_dt')?.updateValueAndValidity();
    this.orderForm.get('payment_status')?.updateValueAndValidity();
  }

  onSubmit() {
    if (this.orderForm.valid) {
      const formValue = this.orderForm.getRawValue();
      const id = this.route.snapshot.queryParamMap.get('id');
      const url = id ? `${this.apiUrl}/orders/update` : `${this.apiUrl}/orders/create`;

      const orderData: any = {
        distributor_id: formValue.distributor_id,
        order_dt: formValue.order_dt,
        total_price: formValue.total_price,
        shipment_code: formValue.shipment_code,
        notes: formValue.order_notes,
        orderItems: formValue.orderItems.map((item: any) => ({
          product_id: item.product_id,
          box_type_code: item.box_type_code,
          qty: item.qty,
          total_item_price: item.total_item_price
        })),
        addresses: [{
          address: this.addressInfo.address,
          addr_details: this.addressInfo.addr_details,
          city: this.addressInfo.city,
          province: this.addressInfo.province,
          zipcode: this.addressInfo.zipcode,
          district: this.addressInfo.district,
          subdistrict: this.addressInfo.subdistrict,
          phone: this.addressInfo.phone
        }]
      };

      if (id) {
        orderData.order_id = id;
      }

      this.http.post(url, orderData).subscribe(
        (response: any) => {
          this.toastr.success(`Order ${id ? 'updated' : 'created'} successfully`);

          if (formValue.status === 'Invoiced' || formValue.status === 'Delivered') {
            this.createInvoice(response.order_id || id, formValue);
          } else {
            this.router.navigate(['/order']);
          }
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

  createInvoice(orderId: string, formValue: any) {
    const invoiceData = {
      invoice_dt: formValue.invoice_dt,
      order_id: orderId,
      subtotal: formValue.total_price,
      discount: formValue.discount,
      additional_fee: formValue.additional_fee,
      payment_status: formValue.payment_status
    };

    this.http.post(`${this.apiUrl}/invoices/create`, invoiceData).subscribe(
      (response: any) => {
        this.toastr.success('Invoice created successfully');
        this.router.navigate(['/order']);
      },
      error => {
        console.error('Error creating invoice:', error);
        this.toastr.error(`Error creating invoice: ${error.error?.message || 'Unknown error'}`);
      }
    );
  }

  calculateTotalPrice() {
    const total = this.orderItems.controls.reduce((sum, item) => {
      const itemPrice = parseFloat(item.get('total_item_price')?.value || '0'); // Ensure it's a number
      return sum + itemPrice;
    }, 0);

    this.orderForm.patchValue({ total_price: total });
  }

  onCancel() {
    this.router.navigate(['/order']);
  }
}