import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ADDR_URL, BASE_URL } from '../../constants';
import { Router } from '@angular/router';

@Component({
    selector: 'app-edit-profile',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './edit-profile.component.html',
    styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent implements OnInit {
    addrApi = ADDR_URL;
    baseUrl = BASE_URL;

    activeTab: 'personal' | 'address' = 'personal';

    firstName: string = '';
    lastName: string = '';
    email: string = '';
    currentPassword: string = '';
    newPassword: string = '';
    confirmPassword: string = '';
    addr_details: string = '';
    phoneNumber: string = '';

    phoneError: string = '';

    // Dropdown data
    provinces: any[] = [];
    cities: any[] = [];
    districts: any[] = [];
    subdistricts: any[] = [];
    zipcodes: any[] = [];

    selectedProvince: string = '';
    selectedCity: string = '';
    selectedDistrict: string = '';
    selectedSubdistrict: string = '';
    selectedZipcode: string = '';

    constructor(
        private http: HttpClient,
        private router: Router
    ) { }

    ngOnInit() {
        this.loadUserData();
        this.loadProvinces();
    }

    setActiveTab(tab: 'personal' | 'address') {
        this.activeTab = tab;
    }

    loadUserData() {
        // TODO: Implement API call to load user data
        // For now, we'll use placeholder data
        this.firstName = 'John';
        this.lastName = 'Doe';
        this.email = 'john.doe@example.com';
        this.phoneNumber = '123-4567-8901';
        this.addr_details = '123 Main St';
    }

    loadProvinces() {
        this.http.get(`${this.addrApi}/provinsi/get/`)
            .subscribe((response: any) => {
                this.provinces = response.result;
            });
    }

    onProvinceChange(event: any) {
        const provinceId = event.target.value;
        this.selectedProvince = provinceId;
        this.http.get(`${this.addrApi}/kabkota/get/?d_provinsi_id=${provinceId}`)
            .subscribe((response: any) => {
                this.cities = response.result;
                this.resetSelections(['city', 'district', 'subdistrict', 'zipcode']);
            });
    }

    onCityChange(event: any) {
        const cityId = event.target.value;
        this.selectedCity = cityId;
        this.http.get(`${this.addrApi}/kecamatan/get/?d_kabkota_id=${cityId}`)
            .subscribe((response: any) => {
                this.districts = response.result;
                this.resetSelections(['district', 'subdistrict', 'zipcode']);
            });
    }

    onDistrictChange(event: any) {
        const districtId = event.target.value;
        this.selectedDistrict = districtId;
        this.http.get(`${this.addrApi}/kelurahan/get/?d_kecamatan_id=${districtId}`)
            .subscribe((response: any) => {
                this.subdistricts = response.result;
                this.resetSelections(['subdistrict', 'zipcode']);
            });
    }

    onSubdistrictChange(event: any) {
        const subdistrictId = event.target.value;
        this.selectedSubdistrict = subdistrictId;
        this.loadZipcodes();
    }

    loadZipcodes() {
        this.http.get(`${this.addrApi}/kodepos/get/?d_kabkota_id=${this.selectedCity}&d_kecamatan_id=${this.selectedDistrict}`)
            .subscribe((response: any) => {
                this.zipcodes = response.result;
                this.selectedZipcode = '';
            });
    }

    resetSelections(fields: string[]) {
        fields.forEach(field => {
            switch (field) {
                case 'city':
                    this.selectedCity = '';
                    this.cities = [];
                    break;
                case 'district':
                    this.selectedDistrict = '';
                    this.districts = [];
                    break;
                case 'subdistrict':
                    this.selectedSubdistrict = '';
                    this.subdistricts = [];
                    break;
                case 'zipcode':
                    this.selectedZipcode = '';
                    this.zipcodes = [];
                    break;
            }
        });
    }

    onPhoneInput(event: Event) {
        const input = event.target as HTMLInputElement;
        let value = input.value.replace(/\D/g, ''); // Remove non-digit characters

        // Format the phone number as XXX-XXXX-XXXX
        if (value.length > 3) {
            value = value.slice(0, 3) + '-' + value.slice(3);
        }
        if (value.length > 8) {
            value = value.slice(0, 8) + '-' + value.slice(8);
        }

        this.phoneNumber = value;
        this.validatePhone();
    }

    validatePhone() {
        const phoneRegex = /^(\+62|62)?[\s-]?0?8[1-9]{1}\d{1}[\s-]?\d{4}[\s-]?\d{2,5}$/;
        if (!phoneRegex.test(this.phoneNumber)) {
            this.phoneError = 'Please enter a valid Indonesian phone number';
        } else {
            this.phoneError = '';
        }
    }

    saveChanges() {
        if (this.newPassword !== this.confirmPassword) {
            alert('New passwords do not match!');
            return;
        }

        const provinceText = this.provinces.find(p => p.id === this.selectedProvince)?.text || '';
        const cityText = this.cities.find(c => c.id === this.selectedCity)?.text || '';
        const districtText = this.districts.find(d => d.id === this.selectedDistrict)?.text || '';
        const subdistrictText = this.subdistricts.find(s => s.id === this.selectedSubdistrict)?.text || '';

        const fullAddress = `${subdistrictText}, ${districtText}, ${cityText}, ${provinceText}, ${this.selectedZipcode}`;

        const userData = {
            name: `${this.firstName} ${this.lastName}`.trim(),
            email: this.email,
            currentPassword: this.currentPassword,
            newPassword: this.newPassword,
            phone: '+62' + this.phoneNumber.replace(/\D/g, ''),
            address: fullAddress,
            addr_details: this.addr_details.trim(),
            city: cityText,
            province: provinceText,
            zipcode: this.selectedZipcode
        };

        // TODO: Implement API call to update user data
        console.log('User data to be updated:', userData);
        alert('Profile updated successfully!');
    }

    cancel() {
        // Navigate back or to a specific route
        this.router.navigate(['/profile']); // Adjust the route as needed
    }

    deleteAccount() {
        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            // Implement account deletion logic here
            console.log('Account deletion requested');
            // After successful deletion, you might want to log the user out and redirect
            // this.router.navigate(['/login']);
        }
    }
}