import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ADDR_URL, BASE_URL } from '../../constants';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { ToastrService } from '../../services/toastr.service';
import { AuthService } from '../../services/auth.service';
import { catchError, tap, filter } from 'rxjs/operators';
import { of, forkJoin } from 'rxjs';

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
        private router: Router,
        private userService: UserService,
        private toastr: ToastrService,
        private authService: AuthService
    ) { }

    ngOnInit() {
        this.loadUserData();
    }

    setActiveTab(tab: 'personal' | 'address') {
        this.activeTab = tab;
    }

    loadUserData() {
        const distributorId = this.authService.getDistributorId();
        if (distributorId) {
            forkJoin({
                personalInfo: this.userService.getPersonalInfo(distributorId),
                addressInfo: this.userService.getAddress(distributorId),
                provinces: this.http.get<any>(`${this.addrApi}/provinsi/get/`)
            }).subscribe({
                next: ({ personalInfo, addressInfo, provinces }) => {
                    // Set personal info
                    this.firstName = personalInfo.firstName;
                    this.lastName = personalInfo.lastName;
                    this.email = personalInfo.email;

                    // Set address info
                    this.addr_details = addressInfo?.addr_details ?? '';
                    this.provinces = provinces.result;
                    this.phoneNumber = addressInfo?.phone?.replace('+62', '') || '';

                    // Find and set the province
                    const provinceObj = this.provinces.find(p => p.text === addressInfo?.province);
                    if (provinceObj) {
                        this.selectedProvince = provinceObj.id;
                        this.loadCities(provinceObj.id, addressInfo);
                    }
                },
                error: (error) => {
                    this.toastr.error('Error loading user data');
                }
            });
        } else {
            this.toastr.error('No distributor ID found');
        }
    }

    loadCities(provinceId: string, addressInfo: any) {
        this.http.get<any>(`${this.addrApi}/kabkota/get/?d_provinsi_id=${provinceId}`)
            .subscribe({
                next: (response) => {
                    this.cities = response.result;
                    const cityObj = this.cities.find(c => c.text === addressInfo?.city);
                    if (cityObj) {
                        this.selectedCity = cityObj.id;
                        this.loadDistricts(cityObj.id, addressInfo);
                    }
                },
                error: (error) => this.toastr.error('Error loading cities')
            });
    }

    loadDistricts(cityId: string, addressInfo: any) {
        this.http.get<any>(`${this.addrApi}/kecamatan/get/?d_kabkota_id=${cityId}`)
            .subscribe({
                next: (response) => {
                    this.districts = response.result;
                    const districtObj = this.districts.find(d => d.text === addressInfo?.district);
                    if (districtObj) {
                        this.selectedDistrict = districtObj.id;
                        this.loadSubdistricts(districtObj.id, addressInfo);
                    }
                },
                error: (error) => this.toastr.error('Error loading districts')
            });
    }

    loadSubdistricts(districtId: string, addressInfo: any) {
        this.http.get<any>(`${this.addrApi}/kelurahan/get/?d_kecamatan_id=${districtId}`)
            .subscribe({
                next: (response) => {
                    this.subdistricts = response.result;
                    const subdistrictObj = this.subdistricts.find(s => s.text === addressInfo?.subdistrict);
                    if (subdistrictObj) {
                        this.selectedSubdistrict = subdistrictObj.id;
                        this.loadZipcodes(this.selectedCity, districtId, addressInfo?.zipcode);
                    }
                },
                error: (error) => this.toastr.error('Error loading subdistricts')
            });
    }

    loadZipcodes(cityId: string, districtId: string, selectedZipcode?: string) {
        this.http.get<any>(`${this.addrApi}/kodepos/get/?d_kabkota_id=${cityId}&d_kecamatan_id=${districtId}`)
            .subscribe({
                next: (response) => {
                    this.zipcodes = response.result;
                    if (selectedZipcode) {
                        const zipcodeObj = this.zipcodes.find(z => z.text === selectedZipcode);
                        if (zipcodeObj) {
                            this.selectedZipcode = zipcodeObj.text;
                        }
                    }
                },
                error: (error) => this.toastr.error('Error loading zipcodes')
            });
    }

    onProvinceChange(event: any) {
        const provinceId = event.target.value;
        this.selectedProvince = provinceId;
        this.loadCities(provinceId, null);
        this.resetSelections(['city', 'district', 'subdistrict', 'zipcode']);
    }

    onCityChange(event: any) {
        const cityId = event.target.value;
        this.selectedCity = cityId;
        this.loadDistricts(cityId, null);
        this.resetSelections(['district', 'subdistrict', 'zipcode']);
    }

    onDistrictChange(event: any) {
        const districtId = event.target.value;
        this.selectedDistrict = districtId;
        this.loadSubdistricts(districtId, null);
        this.resetSelections(['subdistrict', 'zipcode']);
    }

    onSubdistrictChange(event: any) {
        const subdistrictId = event.target.value;
        this.selectedSubdistrict = subdistrictId;
        this.loadZipcodes(this.selectedCity, this.selectedDistrict);
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
            this.toastr.error('New passwords do not match!');
            return;
        }

        const distributorId = this.authService.getDistributorId();
        if (!distributorId) {
            this.toastr.error('No distributor ID found');
            return;
        }

        const personalInfo = {
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
            currentPassword: this.currentPassword,
            newPassword: this.newPassword
        };

        const addressInfo = {
            addr_details: this.addr_details.trim(),
            city: this.cities.find(c => c.id === this.selectedCity)?.text || '',
            province: this.provinces.find(p => p.id === this.selectedProvince)?.text || '',
            zipcode: this.selectedZipcode,
            district: this.districts.find(d => d.id === this.selectedDistrict)?.text || '',
            subdistrict: this.subdistricts.find(s => s.id === this.selectedSubdistrict)?.text || '',
            phone: '+62' + this.phoneNumber.replace(/\D/g, ''),
        };

        this.userService.updatePersonalInfo(distributorId, personalInfo).subscribe(
            () => {
                this.toastr.success('Personal info updated successfully');
                this.userService.updateAddress(distributorId, addressInfo).subscribe(
                    () => {
                        this.toastr.success('Profile updated successfully!');
                    },
                    (error) => {
                        this.toastr.error('Failed to update address. Please try again.');
                    }
                );
            },
            (error) => {
                this.toastr.error('Failed to update personal info. Please try again.');
            }
        );
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