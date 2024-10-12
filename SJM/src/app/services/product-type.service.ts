import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ProductTypeService {
    private selectedTypeSubject = new BehaviorSubject<string>('all');
    selectedType$ = this.selectedTypeSubject.asObservable();

    setSelectedType(type: string) {
        this.selectedTypeSubject.next(type);
    }
}