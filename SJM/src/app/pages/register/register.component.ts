import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ADDR_URL, BASE_URL } from '../../constants';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  addrApi = ADDR_URL;
  baseUrl = BASE_URL;

  currentStep: number = 1;
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  password: string = '';
  acceptTerms: boolean = false;
  address: string = '';
  addr_details: string = '';
  city: string = '';
  province: string = '';
  zipcode: string = '';
  phoneNumber: string = '';
  showPassword: boolean = false;
  step1Completed: boolean = false;
  step2Completed: boolean = false;

  emailError: string = '';
  passwordError: string = '';
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

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit() {
    this.loadProvinces();
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
        this.districts = [];
        this.subdistricts = [];
        this.zipcodes = [];
        this.selectedCity = '';
        this.selectedDistrict = '';
        this.selectedSubdistrict = '';
        this.selectedZipcode = '';
      });
  }

  onCityChange(event: any) {
    const cityId = event.target.value;
    this.selectedCity = cityId;
    this.http.get(`${this.addrApi}/kecamatan/get/?d_kabkota_id=${cityId}`)
      .subscribe((response: any) => {
        this.districts = response.result;
        this.subdistricts = [];
        this.zipcodes = [];
        this.selectedDistrict = '';
        this.selectedSubdistrict = '';
        this.selectedZipcode = '';
      });
  }

  onDistrictChange(event: any) {
    const districtId = event.target.value;
    this.selectedDistrict = districtId;
    this.http.get(`${this.addrApi}/kelurahan/get/?d_kecamatan_id=${districtId}`)
      .subscribe((response: any) => {
        this.subdistricts = response.result;
        this.zipcodes = [];
        this.selectedSubdistrict = '';
        this.selectedZipcode = '';
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

  get progressWidth(): string {
    return this.currentStep === 1 ? '50%' : '100%';
  }

  get isStep1Valid(): boolean {
    return (
      this.firstName.trim() !== '' &&
      this.lastName.trim() !== '' &&
      this.isEmailValid() &&
      this.isPasswordValid() &&
      this.acceptTerms
    );
  }

  get isStep2Valid(): boolean {
    return (
      this.addr_details.trim() !== '' &&
      this.selectedProvince !== '' &&
      this.selectedCity !== '' &&
      this.selectedDistrict !== '' &&
      this.selectedSubdistrict !== '' &&
      this.selectedZipcode !== '' &&
      this.phoneNumber.trim() !== '' &&
      this.phoneError === ''
    );
  }

  isEmailValid(): boolean {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    const isValid = emailRegex.test(this.email);
    this.emailError = isValid ? '' : 'Please enter a valid email address.';
    return isValid;
  }

  isPasswordValid(): boolean {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    const isValid = passwordRegex.test(this.password);
    this.passwordError = isValid ? '' : 'Password must be at least 8 characters long and include letters, numbers, and symbols.';
    return isValid;
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

  nextStep() {
    if (this.currentStep === 1 && this.isStep1Valid) {
      this.step1Completed = true;
      this.currentStep = 2;
    }
  }

  onSubmit() {
    if (this.currentStep === 2 && this.isStep2Valid) {
      this.step2Completed = true;

      // Find the text representations of the selected IDs
      const provinceText = this.provinces.find(p => p.id === this.selectedProvince)?.text || '';
      const cityText = this.cities.find(c => c.id === this.selectedCity)?.text || '';
      const districtText = this.districts.find(d => d.id === this.selectedDistrict)?.text || '';
      const subdistrictText = this.subdistricts.find(s => s.id === this.selectedSubdistrict)?.text || '';

      // Construct the full address
      const fullAddress = `${provinceText}, ${cityText}, ${districtText}, ${subdistrictText}, ${this.selectedZipcode}`;

      const registrationData = {
        name: `${this.firstName} ${this.lastName}`.trim(),
        email: this.email,
        password: this.password,
        phone: '+62' + this.phoneNumber.replace(/\D/g, ''),
        address: fullAddress,
        addr_details: this.addr_details.trim(),
        city: cityText,
        province: provinceText,
        zipcode: this.selectedZipcode
      };

      this.http.post(`${this.baseUrl}/distributor/register`, registrationData)
        .subscribe({
          next: (response) => {
            console.log('Registration successful', response);
            this.router.navigate(['/login']);
          },
          error: (error) => {
            console.error('Registration failed', error);
            // Handle error (show error message to user)
          }
        });
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
