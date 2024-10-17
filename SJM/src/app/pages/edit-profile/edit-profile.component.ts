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
import { of } from 'rxjs';

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
        this.loadProvinces();
    }

    setActiveTab(tab: 'personal' | 'address') {
        this.activeTab = tab;
    }

    loadUserData() {
        const distributorId = this.authService.getDistributorId();
        if (distributorId) {
            this.userService.getPersonalInfo(distributorId).subscribe(
                (personalInfo) => {
                    this.firstName = personalInfo.firstName;
                    this.lastName = personalInfo.lastName;
                    this.email = personalInfo.email;
                    this.phoneNumber = personalInfo.phone.replace('+62', '');
                },
                (error) => {
                    console.error('Error loading personal info:', error);
                }
            );

            this.userService.getAddress(distributorId).pipe(
                catchError((error: any) => {
                    this.toastr.error('Error loading address info: ' + error.message);
                    return of(null);
                }),
                filter(addressInfo => !!addressInfo),
            ).subscribe(
                (addressInfo) => {
                    this.addr_details = addressInfo?.addr_details ?? '';
                    this.selectedProvince = addressInfo?.province ?? '';
                    this.selectedCity = addressInfo?.city ?? '';
                    this.selectedDistrict = addressInfo?.district ?? '';
                    this.selectedSubdistrict = addressInfo?.subdistrict ?? '';
                    this.selectedZipcode = addressInfo?.zipcode ?? '';

                    if (this.selectedProvince) {
                        this.loadProvinces().then(() => {
                            if (this.selectedCity) {
                                this.onProvinceChange({ target: { value: this.selectedProvince } });
                            }
                        });
                    }
                }
            );
        } else {
            this.toastr.error('No distributor ID found');
        }
    }

    loadProvinces(): Promise<void> {
        return new Promise((resolve) => {
            this.http.get(`${this.addrApi}/provinsi/get/`)
                .subscribe((response: any) => {
                    this.provinces = response.result;
                    resolve();
                });
        });
    }
    onProvinceChange(event: any) {
        const provinceId = event.target.value;
        this.selectedProvince = provinceId;
        this.http.get(`${this.addrApi}/kabkota/get/?d_provinsi_id=${provinceId}`)
            .subscribe((response: any) => {
                this.cities = response.result;
                this.resetSelections(['district', 'subdistrict', 'zipcode']);

                if (this.selectedCity) {
                    const cityObject = this.cities.find(city => city.text === this.selectedCity);
                    if (cityObject) {
                        this.selectedCity = cityObject.id;
                        this.onCityChange({ target: { value: this.selectedCity } });
                    }
                }
            });
    }

    onCityChange(event: any) {
        const cityId = event.target.value;
        this.selectedCity = cityId;
        this.http.get(`${this.addrApi}/kecamatan/get/?d_kabkota_id=${cityId}`)
            .subscribe((response: any) => {
                this.districts = response.result;
                this.resetSelections(['subdistrict', 'zipcode']);

                if (this.selectedDistrict) {
                    const districtObject = this.districts.find(district => district.text === this.selectedDistrict);
                    if (districtObject) {
                        this.selectedDistrict = districtObject.id;
                        this.onDistrictChange({ target: { value: this.selectedDistrict } });
                    }
                }
            });
    }

    onDistrictChange(event: any) {
        const districtId = event.target.value;
        this.selectedDistrict = districtId;
        this.http.get(`${this.addrApi}/kelurahan/get/?d_kecamatan_id=${districtId}`)
            .subscribe((response: any) => {
                this.subdistricts = response.result;
                this.resetSelections(['zipcode']);

                if (this.selectedSubdistrict) {
                    const subdistrictObject = this.subdistricts.find(subdistrict => subdistrict.text === this.selectedSubdistrict);
                    if (subdistrictObject) {
                        this.selectedSubdistrict = subdistrictObject.id;
                        this.onSubdistrictChange({ target: { value: this.selectedSubdistrict } });
                    }
                }
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
            phone: '+62' + this.phoneNumber.replace(/\D/g, ''),
            currentPassword: this.currentPassword,
            newPassword: this.newPassword
        };

        const addressInfo = {
            addr_details: this.addr_details.trim(),
            city: this.cities.find(c => c.id === this.selectedCity)?.text || '',
            province: this.provinces.find(p => p.id === this.selectedProvince)?.text || '',
            zipcode: this.selectedZipcode,
            district: this.districts.find(d => d.id === this.selectedDistrict)?.text || '',
            subdistrict: this.subdistricts.find(s => s.id === this.selectedSubdistrict)?.text || ''
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