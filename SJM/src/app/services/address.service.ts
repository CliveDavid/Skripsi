import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BASE_URL } from '../constants';

interface AddressResponse {
    address: string;
}

@Injectable({
    providedIn: 'root'
})
export class AddressService {
    constructor(private http: HttpClient) { }

    getAddress(distributorId: string): Observable<AddressResponse> {
        return this.http.post<AddressResponse>(`${BASE_URL}/distributor/get-address`, { distributor_id: distributorId });
    }
}