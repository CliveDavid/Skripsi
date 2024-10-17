import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BASE_URL } from '../constants';

interface PersonalInfo {
    firstName: string;
    lastName: string;
    email: string;
}

interface AddressInfo {
    addr_details?: string;
    city?: string;
    province?: string;
    zipcode?: string;
    district?: string;
    subdistrict?: string;
    phone?: string;
}

@Injectable({
    providedIn: 'root'
})
export class UserService {
    constructor(private http: HttpClient) { }

    getPersonalInfo(distributorId: string): Observable<PersonalInfo> {
        return this.http.post<PersonalInfo>(`${BASE_URL}/distributor/get-personal-info`, { distributor_id: distributorId });
    }

    getAddress(distributorId: string): Observable<AddressInfo> {
        return this.http.post<AddressInfo>(`${BASE_URL}/distributor/get-address`, { distributor_id: distributorId });
    }

    updatePersonalInfo(distributorId: string, personalInfo: PersonalInfo): Observable<any> {
        return this.http.post(`${BASE_URL}/distributor/update-personal-info`, { distributor_id: distributorId, ...personalInfo });
    }

    updateAddress(distributorId: string, addressInfo: AddressInfo): Observable<any> {
        return this.http.post(`${BASE_URL}/distributor/update-address`, { distributor_id: distributorId, ...addressInfo });
    }

    deactivateDistributor(distributorId: string): Observable<any> {
        return this.http.post(`${BASE_URL}/distributor/deactivate-distributor`, { distributor_id: distributorId });
    }
}