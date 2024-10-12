import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BASE_URL } from '../constants';

export interface Product {
    prod_id: number;
    prod_name: string;
    descr: string;
    product_type_descr: string;
    imageUrl?: string;
    price?: number;
}

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private apiUrl = BASE_URL;

    constructor(private http: HttpClient) { }

    getAllProducts(): Observable<Product[]> {
        return this.http.post<Product[]>(`${this.apiUrl}/product/get-all-active`, {});
    }

    getProductImage(prodId: number): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/product/product-image/${prodId}`, { responseType: 'blob' });
    }
}