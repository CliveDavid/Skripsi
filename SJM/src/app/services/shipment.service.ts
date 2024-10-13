import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BASE_URL } from '../constants';

interface ShipmentMethod {
    shipment_code: string;
    shipment_name: string;
    capacity: number;
}

@Injectable({
    providedIn: 'root'
})
export class ShipmentService {
    constructor(private http: HttpClient) { }

    getAllShipmentMethods(): Observable<ShipmentMethod[]> {
        return this.http.post<ShipmentMethod[]>(`${BASE_URL}/shipmentMethods/get-all`, {});
    }
}