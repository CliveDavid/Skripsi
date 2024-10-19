import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ADDR_URL, BASE_URL } from 'src/app/constants';
import { ToastrService } from 'src/app/shared/services/toastr.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface AddressItem {
  id: string;
  text: string;
}

@Component({
  selector: 'app-distributor-address-form',
  templateUrl: './distributor-address-form.component.html',
  styleUrls: ['./distributor-address-form.component.css']
})
export class DistributorAddressFormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  formTitle = 'Distributor Address Form';
  isEditMode = false;
  id: string | null = null;
  isLoading = false;

  formData: any = {
    distributor_id: '',
    address_details: '',
    province: '',
    city: '',
    district: '',
    subdistrict: '',
    zipcode: '',
    phone: ''
  };

  provinces: AddressItem[] = [];
  cities: AddressItem[] = [];
  districts: AddressItem[] = [];
  subdistricts: AddressItem[] = [];
  zipcodes: AddressItem[] = [];

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.id = params['id'];
        this.isEditMode = !!this.id;
        this.loadProvinces();
        if (this.id) {
          this.loadData();
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData() {
    if (this.isLoading) return;
    this.isLoading = true;

    this.http.post(`${BASE_URL}/distributor/get-address`, { id: this.id })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.formData = {
            ...response,
            province: '',
            city: '',
            district: '',
            subdistrict: '',
            zipcode: ''
          };

          this.http.get(`${ADDR_URL}/provinsi/get`).subscribe((provinceRes: any) => {
            this.provinces = provinceRes.result;
            const foundProvince = this.provinces.find(p => p.text === response.province);
            if (foundProvince) {
              this.formData.province = foundProvince.id;

              this.http.get(`${ADDR_URL}/kabkota/get/?d_provinsi_id=${foundProvince.id}`).subscribe((cityRes: any) => {
                this.cities = cityRes.result;
                const foundCity = this.cities.find(c => c.text === response.city);
                if (foundCity) {
                  this.formData.city = foundCity.id;

                  this.http.get(`${ADDR_URL}/kecamatan/get/?d_kabkota_id=${foundCity.id}`).subscribe((districtRes: any) => {
                    this.districts = districtRes.result;
                    const foundDistrict = this.districts.find(d => d.text === response.district);
                    if (foundDistrict) {
                      this.formData.district = foundDistrict.id;

                      this.http.get(`${ADDR_URL}/kelurahan/get/?d_kecamatan_id=${foundDistrict.id}`).subscribe((subdistrictRes: any) => {
                        this.subdistricts = subdistrictRes.result;
                        const foundSubdistrict = this.subdistricts.find(s => s.text === response.subdistrict);
                        if (foundSubdistrict) {
                          this.formData.subdistrict = foundSubdistrict.id;

                          this.http.get(`${ADDR_URL}/kodepos/get/?d_kabkota_id=${foundCity.id}&d_kecamatan_id=${foundDistrict.id}`)
                            .subscribe((zipcodeRes: any) => {
                              this.zipcodes = zipcodeRes.result;
                              const foundZipcode = this.zipcodes.find(z => z.text === response.zipcode);
                              if (foundZipcode) {
                                this.formData.zipcode = foundZipcode.id;
                              }
                              this.isLoading = false;
                            });
                        }
                      });
                    }
                  });
                }
              });
            }
          });
        },
        error: error => {
          this.toastr.error('Error loading data');
          this.isLoading = false;
        }
      });
  }

  loadProvinces() {
    this.http.get(`${ADDR_URL}/provinsi/get`).subscribe(
      (response: any) => this.provinces = response.result,
      error => this.toastr.error('Error loading provinces')
    );
  }

  onProvinceChange() {
    this.formData.city = '';
    this.formData.district = '';
    this.formData.subdistrict = '';
    this.formData.zipcode = '';
    this.loadCities();
  }

  loadCities() {
    if (!this.formData.province) return;
    this.http.get(`${ADDR_URL}/kabkota/get/?d_provinsi_id=${this.formData.province}`)
      .subscribe(
        (response: any) => this.cities = response.result,
        error => this.toastr.error('Error loading cities')
      );
  }

  onCityChange() {
    this.formData.district = '';
    this.formData.subdistrict = '';
    this.formData.zipcode = '';
    this.loadDistricts();
  }

  loadDistricts() {
    if (!this.formData.city) return;
    this.http.get(`${ADDR_URL}/kecamatan/get/?d_kabkota_id=${this.formData.city}`)
      .subscribe(
        (response: any) => this.districts = response.result,
        error => this.toastr.error('Error loading districts')
      );
  }

  onDistrictChange() {
    this.formData.subdistrict = '';
    this.formData.zipcode = '';
    this.loadSubdistricts();
  }

  loadSubdistricts() {
    if (!this.formData.district) return;
    this.http.get(`${ADDR_URL}/kelurahan/get/?d_kecamatan_id=${this.formData.district}`)
      .subscribe(
        (response: any) => this.subdistricts = response.result,
        error => this.toastr.error('Error loading subdistricts')
      );
  }

  onSubdistrictChange() {
    this.formData.zipcode = '';
    this.loadZipcodes();
  }

  loadZipcodes() {
    if (!this.formData.city || !this.formData.district) return;
    this.http.get(`${ADDR_URL}/kodepos/get/?d_kabkota_id=${this.formData.city}&d_kecamatan_id=${this.formData.district}`)
      .subscribe(
        (response: any) => this.zipcodes = response.result,
        error => this.toastr.error('Error loading zipcodes')
      );
  }

  onSubmit() {
    const url = this.isEditMode ? 'update' : 'add';
    this.http.post(`${BASE_URL}/distributor-address/${url}`, this.formData)
      .subscribe(
        () => {
          this.toastr.success(`Successfully ${this.isEditMode ? 'updated' : 'added'} distributor address`);
          this.router.navigate(['/distributor-address']);
        },
        error => this.toastr.error('Error saving data')
      );
  }

  onCancel() {
    this.router.navigate(['/distributor-address']);
  }
}