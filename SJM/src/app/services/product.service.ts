import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { BASE_URL } from '../constants';

export interface Product {
    prod_id: number;
    prod_code: string;
    prod_name: string;
    descr: string;
    prod_type_code: string;
    product_type_descr: string;
    imageUrl?: string;
    price?: number;
}

interface BoxType {
    value: string;
    label: string;
}

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private apiUrl = BASE_URL;

    constructor(private http: HttpClient) { }

    getAllActiveProducts(): Observable<Product[]> {
        return this.http.post<Product[]>(`${this.apiUrl}/product/get-all-active`, {});
    }

    getProductImage(prodId: number): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/product/product-image/${prodId}`, { responseType: 'blob' });
    }

    private searchTermSubject = new BehaviorSubject<string>('');
    searchTerm$ = this.searchTermSubject.asObservable();

    setSearchTerm(term: string) {
        this.searchTermSubject.next(term);
    }

    getBoxTypes(): Observable<BoxType[]> {
        return this.http.post<BoxType[]>(`${BASE_URL}/boxType/get-box-type-kvp`, {});
    }

    getPrice(productId: number, boxTypeCode: string): Observable<{ price: number }> {
        return this.http.post<{ price: number }>(`${BASE_URL}/price/get-price`, { productId, boxTypeCode });
    }
}