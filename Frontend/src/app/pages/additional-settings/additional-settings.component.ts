import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-settings',
    templateUrl: './additional-settings.component.html',
    styleUrls: ['./additional-settings.component.css']
})
export class AdditionalSettingsComponent implements OnInit {
    ngOnInit(): void {
        throw new Error('Method not implemented.');
    }
    activeTab = 'company';
    expandedSection = '';

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

    toggleSection(section: string) {
        this.expandedSection = this.expandedSection === section ? '' : section;
    }

    setActiveTab(tab: string) {
        this.activeTab = tab;
    }

    onSubmit() {
        // This is just a placeholder - implement actual submission logic later
        console.log('Form submitted');
    }

}