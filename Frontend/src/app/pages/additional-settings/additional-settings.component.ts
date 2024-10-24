import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BASE_URL } from '../../constants';
import { ToastrService } from 'src/app/shared/services/toastr.service';

interface EditableEntity {
    isEditing?: boolean;
    tempData?: any;
}

interface Company {
    company_name: string;
    phn1: string;
    phn2?: string;
    phn3?: string;
    email: string;
    address?: string;
}

interface ProductType extends EditableEntity {
    prod_type_id: number;
    prod_type_code: string;
    descr: string;
}

interface BoxType extends EditableEntity {
    box_type_id: number;
    box_type_code: string;
    box_capacity: number;
}

interface Price extends EditableEntity {
    price_id: number;
    box_type_code: string;
    prod_type_code: string;
    price: number;
}

interface ShipmentMethod extends EditableEntity {
    shipment_id: number;
    shipment_code: string;
    shipment_name: string;
    capacity: number;
}

@Component({
    selector: 'app-settings',
    templateUrl: './additional-settings.component.html',
    styleUrls: ['./additional-settings.component.css']
})
export class AdditionalSettingsComponent implements OnInit {
    private apiUrl = BASE_URL;
    activeTab = 'company';
    expandedSection = '';

    // Form Models
    companyData: Company = {} as Company;
    productTypes: ProductType[] = [];
    boxTypes: BoxType[] = [];
    prices: Price[] = [];
    shipmentMethods: ShipmentMethod[] = [];

    // New Item Models
    newProductType: ProductType = {} as ProductType;
    newBoxType: BoxType = {} as BoxType;
    newPrice: Price = {} as Price;
    newShipmentMethod: ShipmentMethod = {} as ShipmentMethod;

    companyFields = [
        { field: 'company_name', header: 'Company Name', type: 'text', required: true },
        { field: 'phn1', header: 'Primary Phone', type: 'text', required: true },
        { field: 'phn2', header: 'Secondary Phone', type: 'text', required: false },
        { field: 'phn3', header: 'Alternative Phone', type: 'text', required: false },
        { field: 'email', header: 'Email', type: 'text', required: true },
        { field: 'address', header: 'Address', type: 'text', required: false, fullWidth: true }
    ];

    productTypeFields = [
        { field: 'prod_type_code', header: 'Product Type Code', type: 'text', required: true },
        { field: 'descr', header: 'Description', type: 'text', required: false }
    ];

    boxTypeFields = [
        { field: 'box_type_code', header: 'Box Type Code', type: 'text', required: true },
        { field: 'box_capacity', header: 'Box Capacity', type: 'number', required: true }
    ];

    priceFields = [
        { field: 'box_type_code', header: 'Box Type', type: 'dropdown', required: true },
        { field: 'prod_type_code', header: 'Product Type', type: 'dropdown', required: true },
        { field: 'price', header: 'Price', type: 'number', required: true }
    ];

    shipmentFields = [
        { field: 'shipment_code', header: 'Shipment Code', type: 'text', required: true },
        { field: 'shipment_name', header: 'Shipment Name', type: 'text', required: true },
        { field: 'capacity', header: 'Capacity', type: 'number', required: true }
    ];

    constructor(
        private http: HttpClient,
        private toastr: ToastrService
    ) { }

    ngOnInit(): void {
        this.loadInitialData();
    }

    loadInitialData() {
        this.getCompanyData();
        this.getProductTypes();
        this.getBoxTypes();
        this.getPrices();
        this.getShipmentMethods();
    }

    startEditing(item: EditableEntity, tempData: any = null) {
        this.resetAllEditing();
        item.isEditing = true;
        item.tempData = tempData || { ...item };
    }

    cancelEditing(item: EditableEntity) {
        if (item.tempData) {
            Object.assign(item, item.tempData);
        }
        item.isEditing = false;
        item.tempData = undefined;
    }

    private resetAllEditing() {
        [...this.productTypes, ...this.boxTypes, ...this.prices, ...this.shipmentMethods]
            .forEach(item => {
                if (item.isEditing) {
                    this.cancelEditing(item);
                }
            });
    }

    // Company Methods
    getCompanyData() {
        this.http.post<Company>(`${this.apiUrl}/company/get`, {}).subscribe({
            next: (response) => {
                this.companyData = response;
            },
            error: (error) => {
                this.toastr.error('Error loading company data');
                console.error('Error:', error);
            }
        });
    }

    updateCompanyData() {
        this.http.post<Company>(`${this.apiUrl}/company/update`, this.companyData).subscribe({
            next: (response) => {
                this.companyData = response;
                this.toastr.success('Company information updated successfully');
            },
            error: (error) => {
                this.toastr.error('Error updating company information');
                console.error('Error:', error);
            }
        });
    }

    // Product Type Methods
    getProductTypes() {
        this.http.post<ProductType[]>(`${this.apiUrl}/productType/get-all`, {}).subscribe({
            next: (response) => {
                this.productTypes = response.map(pt => ({ ...pt, isEditing: false }));
            },
            error: (error) => {
                this.toastr.error('Error loading product types');
                console.error('Error:', error);
            }
        });
    }

    addProductType() {
        this.http.post<ProductType>(`${this.apiUrl}/productType/create`, this.newProductType).subscribe({
            next: (response) => {
                this.productTypes.push(response);
                this.newProductType = {} as ProductType;
                this.toastr.success('Product type added successfully');
            },
            error: (error) => {
                this.toastr.error('Error adding product type');
                console.error('Error:', error);
            }
        });
    }

    updateProductType(productType: ProductType) {
        this.http.post<ProductType>(`${this.apiUrl}/productType/update`, productType).subscribe({
            next: (response) => {
                const index = this.productTypes.findIndex(pt => pt.prod_type_id === response.prod_type_id);
                if (index !== -1) {
                    this.productTypes[index] = response;
                }
                this.toastr.success('Product type updated successfully');
            },
            error: (error) => {
                this.toastr.error('Error updating product type');
                console.error('Error:', error);
            }
        });
    }

    deleteProductType(id: number) {
        this.http.post(`${this.apiUrl}/productType/delete`, { prod_type_id: id }).subscribe({
            next: () => {
                this.productTypes = this.productTypes.filter(pt => pt.prod_type_id !== id);
                this.toastr.success('Product type deleted successfully');
            },
            error: (error) => {
                this.toastr.error('Error deleting product type');
                console.error('Error:', error);
            }
        });
    }

    // Box Type Methods
    getBoxTypes() {
        this.http.post<BoxType[]>(`${this.apiUrl}/boxType/get-all`, {}).subscribe({
            next: (response) => {
                this.boxTypes = response;
            },
            error: (error) => {
                this.toastr.error('Error loading box types');
                console.error('Error:', error);
            }
        });
    }

    addBoxType() {
        this.http.post<BoxType>(`${this.apiUrl}/boxType/create`, this.newBoxType).subscribe({
            next: (response) => {
                this.boxTypes.push(response);
                this.newBoxType = {} as BoxType;
                this.toastr.success('Box type added successfully');
            },
            error: (error) => {
                this.toastr.error('Error adding box type');
                console.error('Error:', error);
            }
        });
    }

    updateBoxType(boxType: BoxType) {
        this.http.post<BoxType>(`${this.apiUrl}/boxType/update`, boxType).subscribe({
            next: (response) => {
                const index = this.boxTypes.findIndex(bt => bt.box_type_id === response.box_type_id);
                if (index !== -1) {
                    this.boxTypes[index] = response;
                }
                this.toastr.success('Box type updated successfully');
            },
            error: (error) => {
                this.toastr.error('Error updating box type');
                console.error('Error:', error);
            }
        });
    }

    deleteBoxType(id: number) {
        this.http.post(`${this.apiUrl}/boxType/delete`, { box_type_id: id }).subscribe({
            next: () => {
                this.boxTypes = this.boxTypes.filter(bt => bt.box_type_id !== id);
                this.toastr.success('Box type deleted successfully');
            },
            error: (error) => {
                this.toastr.error('Error deleting box type');
                console.error('Error:', error);
            }
        });
    }

    // Price Methods
    getPrices() {
        this.http.post<Price[]>(`${this.apiUrl}/price/get-all`, {}).subscribe({
            next: (response) => {
                this.prices = response;
            },
            error: (error) => {
                this.toastr.error('Error loading prices');
                console.error('Error:', error);
            }
        });
    }

    addPrice() {
        this.http.post<Price>(`${this.apiUrl}/price/create`, this.newPrice).subscribe({
            next: (response) => {
                this.prices.push(response);
                this.newPrice = {} as Price;
                this.toastr.success('Price added successfully');
            },
            error: (error) => {
                this.toastr.error('Error adding price');
                console.error('Error:', error);
            }
        });
    }

    updatePrice(price: Price) {
        this.http.post<Price>(`${this.apiUrl}/price/update`, price).subscribe({
            next: (response) => {
                const index = this.prices.findIndex(p => p.price_id === response.price_id);
                if (index !== -1) {
                    this.prices[index] = { ...response, isEditing: false };
                }
                this.toastr.success('Price updated successfully');
            },
            error: (error) => {
                this.cancelEditing(price);
                this.toastr.error('Error updating price');
                console.error('Error:', error);
            }
        });
    }


    deletePrice(id: number) {
        this.http.post(`${this.apiUrl}/price/delete`, { price_id: id }).subscribe({
            next: () => {
                this.prices = this.prices.filter(p => p.price_id !== id);
                this.toastr.success('Price deleted successfully');
            },
            error: (error) => {
                this.toastr.error('Error deleting price');
                console.error('Error:', error);
            }
        });
    }

    getAvailableBoxTypes(): BoxType[] {
        if (!this.newPrice.prod_type_code) {
            return this.boxTypes.filter(bt => {
                return !this.prices.every(p =>
                    this.productTypes.every(pt =>
                        this.prices.some(price =>
                            price.box_type_code === bt.box_type_code &&
                            price.prod_type_code === pt.prod_type_code
                        )
                    )
                );
            });
        }

        return this.boxTypes.filter(bt =>
            !this.prices.some(p =>
                p.box_type_code === bt.box_type_code &&
                p.prod_type_code === this.newPrice.prod_type_code
            )
        );
    }

    getAvailableProductTypes(): ProductType[] {
        if (!this.newPrice.box_type_code) {
            return this.productTypes.filter(pt => {
                return !this.prices.every(p =>
                    this.boxTypes.every(bt =>
                        this.prices.some(price =>
                            price.prod_type_code === pt.prod_type_code &&
                            price.box_type_code === bt.box_type_code
                        )
                    )
                );
            });
        }

        return this.productTypes.filter(pt =>
            !this.prices.some(p =>
                p.prod_type_code === pt.prod_type_code &&
                p.box_type_code === this.newPrice.box_type_code
            )
        );
    }

    onPriceBoxTypeChange() {
        this.newPrice.prod_type_code = '';  // Reset product type when box type changes
    }

    // Update existing onPriceProductTypeChange
    onPriceProductTypeChange() {
        this.newPrice.box_type_code = '';  // Reset box type when product type changes
    }

    // Shipment Method Methods
    getShipmentMethods() {
        this.http.post<ShipmentMethod[]>(`${this.apiUrl}/shipmentMethods/get-all`, {}).subscribe({
            next: (response) => {
                this.shipmentMethods = response;
            },
            error: (error) => {
                this.toastr.error('Error loading shipment methods');
                console.error('Error:', error);
            }
        });
    }

    addShipmentMethod() {
        this.http.post<ShipmentMethod>(`${this.apiUrl}/shipmentMethods/create`, this.newShipmentMethod).subscribe({
            next: (response) => {
                this.shipmentMethods.push(response);
                this.newShipmentMethod = {} as ShipmentMethod;
                this.toastr.success('Shipment method added successfully');
            },
            error: (error) => {
                this.toastr.error('Error adding shipment method');
                console.error('Error:', error);
            }
        });
    }

    updateShipmentMethod(shipmentMethod: ShipmentMethod) {
        this.http.post<ShipmentMethod>(`${this.apiUrl}/shipmentMethod/update`, shipmentMethod).subscribe({
            next: (response) => {
                const index = this.shipmentMethods.findIndex(sm => sm.shipment_id === response.shipment_id);
                if (index !== -1) {
                    this.shipmentMethods[index] = { ...response, isEditing: false };
                }
                this.toastr.success('Shipment method updated successfully');
            },
            error: (error) => {
                this.cancelEditing(shipmentMethod);
                this.toastr.error('Error updating shipment method');
                console.error('Error:', error);
            }
        });
    }

    deleteShipmentMethod(id: number) {
        this.http.post(`${this.apiUrl}/shipmentMethods/delete`, { shipment_id: id }).subscribe({
            next: () => {
                this.shipmentMethods = this.shipmentMethods.filter(sm => sm.shipment_id !== id);
                this.toastr.success('Shipment method deleted successfully');
            },
            error: (error) => {
                this.toastr.error('Error deleting shipment method');
                console.error('Error:', error);
            }
        });
    }

    toggleSection(section: string) {
        this.expandedSection = this.expandedSection === section ? '' : section;
    }

    setActiveTab(tab: string) {
        this.activeTab = tab;
    }

    onSubmit() {
        switch (this.activeTab) {
            case 'company':
                this.updateCompanyData();
                break;
            case 'product':
                if (this.expandedSection === 'productTypes') {
                    this.addProductType();
                } else if (this.expandedSection === 'boxTypes') {
                    this.addBoxType();
                } else if (this.expandedSection === 'pricing') {
                    this.addPrice();
                }
                break;
            case 'shipment':
                this.addShipmentMethod();
                break;
        }
    }
}