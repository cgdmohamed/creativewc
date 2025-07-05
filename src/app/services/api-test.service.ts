
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiTestService {
  private apiUrl = `https://${environment.storeUrl}/wp-json/wc/v3`;

  constructor(private http: HttpClient) {}

  testConnection(): Observable<any> {
    const params = new HttpParams()
      .set('consumer_key', environment.consumerKey)
      .set('consumer_secret', environment.consumerSecret)
      .set('per_page', '1');

    console.log('Testing WooCommerce API connection...');
    console.log('API URL:', this.apiUrl);
    console.log('Consumer Key:', environment.consumerKey);
    
    return this.http.get(`${this.apiUrl}/products`, { params });
  }
}
