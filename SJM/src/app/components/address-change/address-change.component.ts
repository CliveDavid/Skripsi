import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ADDR_URL } from '../../constants';

interface AddressItem {
  id: string;
  text: string;
}

@Component({
  selector: 'app-address-change',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './address-change.component.html',
  styleUrls: ['./address-change.component.css']
})
export class AddressChangeComponent implements OnInit {
  @Output() addressChanged = new EventEmitter<string>();
  @Output() cancelled = new EventEmitter<void>();

  addrApi = ADDR_URL;

  provinces: AddressItem[] = [];
  cities: AddressItem[] = [];
  districts: AddressItem[] = [];
  subdistricts: AddressItem[] = [];
  zipcodes: AddressItem[] = [];

  selectedProvince: string = '';
  selectedCity: string = '';
  selectedDistrict: string = '';
  selectedSubdistrict: string = '';
  selectedZipcode: string = '';
  addr_details: string = '';

  errorMessage: string = '';
  formattedAddress: string = '';

  isLoading: { [key: string]: boolean } = {
    province: false,
    city: false,
    district: false,
    subdistrict: false,
    zipcode: false
  };

  constructor(private http: HttpClient) { }

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


  resetSelections(from: 'city' | 'district' | 'subdistrict') {
    if (from === 'city' || from === 'district' || from === 'subdistrict') {
      this.districts = [];
      this.selectedDistrict = '';
    }
    if (from === 'city' || from === 'district') {
      this.subdistricts = [];
      this.selectedSubdistrict = '';
    }
    if (from === 'city') {
      this.selectedCity = '';
    }
    this.zipcodes = [];
    this.selectedZipcode = '';
  }

  handleError(error: HttpErrorResponse, type: string) {
    console.error('Error:', error);
    this.errorMessage = `Failed to load ${type} data. Please try again.`;
    this.isLoading[type] = false;
  }

  isAddressValid(): boolean {
    return (
      this.selectedProvince !== '' &&
      this.selectedCity !== '' &&
      this.selectedDistrict !== '' &&
      this.selectedSubdistrict !== '' &&
      this.selectedZipcode !== '' &&
      this.addr_details.trim() !== ''
    );
  }

  isAnyLoading(): boolean {
    return Object.values(this.isLoading).some(value => value);
  }

  updateFormattedAddress() {
    if (this.isAddressValid()) {
      const provinceText = this.provinces.find(p => p.id === this.selectedProvince)?.text || '';
      const cityText = this.cities.find(c => c.id === this.selectedCity)?.text || '';
      const districtText = this.districts.find(d => d.id === this.selectedDistrict)?.text || '';
      const subdistrictText = this.subdistricts.find(s => s.id === this.selectedSubdistrict)?.text || '';

      this.formattedAddress = `${this.addr_details}, ${subdistrictText}, ${districtText}, ${cityText}, ${provinceText}, ${this.selectedZipcode}`;
    } else {
      this.formattedAddress = '';
    }
  }

  useThisAddress() {
    this.updateFormattedAddress();
    if (this.formattedAddress) {
      this.addressChanged.emit(this.formattedAddress);
    }
  }

  cancel() {
    this.cancelled.emit();
  }

  onOverlayClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('address-change-overlay')) {
      this.cancel();
    }
  }
}