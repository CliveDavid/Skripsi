import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BASE_URL } from '../constants';

export interface SupportMessage {
    email: string;
    subject: string;
    message: string;
}

@Injectable({
    providedIn: 'root'
})
export class SupportService {
    private apiUrl = BASE_URL;

    constructor(private http: HttpClient) { }

    sendSupportMessage(messageData: SupportMessage): Observable<any> {
        return this.http.post(`${this.apiUrl}/support/send-email`, messageData);
    }
}