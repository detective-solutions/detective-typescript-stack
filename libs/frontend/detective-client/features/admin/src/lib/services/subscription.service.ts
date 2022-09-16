import { HttpClient, HttpHeaders } from '@angular/common/http';

import { IInvoiceListResponse } from '../models/';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@detective.solutions/frontend/shared/environments';

@Injectable()
export class SubscriptionService {
  private static provisioningBasePath = 'http://localhost:3004/';
  invoice$!: Observable<IInvoiceListResponse>;

  constructor(
    private readonly httpClient: HttpClient // private readonly logger: LogService
  ) {}

  static convertAmountToCurrencyString(Amount: number, Currency: string): string {
    let value = '';
    switch (Currency) {
      case 'eur':
        value = String(`${(Amount / 100).toFixed()}€`);
        break;
      case 'usd':
        value = String('$' + `${(Amount / 100).toFixed()}`);
        break;
    }
    return value;
  }

  static invoiceId(invoiceId: string): string {
    if (invoiceId === 'null') {
      return 'Next';
    } else {
      return invoiceId;
    }
  }

  getUserLimit() {
    return 0.4;
  }

  // 1. get tenant id for current user
  // 2. get invoice data
  getInvoices(): Observable<IInvoiceListResponse> {
    const token: string = JSON.parse(localStorage.getItem('detective_access_token') || '');
    const headers = new HttpHeaders().set('Authentication', token);
    headers.set('Access-Control-Allow-Origin', '*');

    return this.httpClient.get<IInvoiceListResponse>(
      SubscriptionService.provisioningBasePath + environment.provisioningListInvoicesV1,
      { headers: headers }
    );
  }

  cancelSubscription() {
    const token: string = JSON.parse(localStorage.getItem('detective_access_token') || '');
    const headers = new HttpHeaders().set('Authentication', token);
    headers.set('Access-Control-Allow-Origin', '*');

    return this.httpClient.get<any>(SubscriptionService.provisioningBasePath + environment.provisioningListInvoicesV1, {
      headers: headers,
    });
  }
}
