import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BASE_URL } from '../constants';

interface Address {
    id: number;
    name: string;
    address: string;
    addr_details: string;
}

@Injectable({
    providedIn: 'root'
})
export class AddressService {
    constructor(private http: HttpClient) { }

    getAllAddresses(): Observable<Address[]> {
        return this.http.post<Address[]>(`${BASE_URL}/distributor/get-address`, {});
    }
}