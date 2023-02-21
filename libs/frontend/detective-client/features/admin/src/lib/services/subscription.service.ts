import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  IGetAllProductResponse,
  IGetChangePaymentResponse,
  IGetProductResponse,
  IGetSubscriptionPaymentResponse,
  IInvoiceListResponse,
} from '../models/';

import { AuthService } from '@detective.solutions/frontend/shared/auth';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StatusResponse } from '@detective.solutions/frontend/shared/ui';
import { environment } from '@detective.solutions/frontend/shared/environments';

@Injectable()
export class SubscriptionService {
  private static provisioningBasePath = `${environment.baseApiPath}${environment.provisioningApiPathV1}`;

  constructor(private readonly httpClient: HttpClient, private readonly authService: AuthService) {}

  static convertAmountToCurrencyString(amount: number, currency: string): string {
    switch (currency) {
      case 'eur': {
        return `${String((amount / 100).toFixed(2))}€`;
      }
      case 'usd': {
        return `$${String((amount / 100).toFixed(2))}`;
      }
      default: {
        throw new Error('Could not convert amount to currency string');
      }
    }
  }

  static checkInvoiceIdFallback(invoiceId: string): string {
    return invoiceId === 'null' ? 'Next' : invoiceId;
  }

  getInvoices(): Observable<IInvoiceListResponse> {
    return this.httpClient.get<IInvoiceListResponse>(
      SubscriptionService.provisioningBasePath + environment.provisioningListInvoicesV1,
      this.createDefaultHeaders()
    );
  }

  cancelSubscription(): Observable<StatusResponse> {
    return this.httpClient.get<StatusResponse>(
      SubscriptionService.provisioningBasePath + environment.provisioningCancelSubV1,
      this.createDefaultHeaders()
    );
  }

  updateSubscription(planId: string): Observable<StatusResponse> {
    return this.httpClient.post<StatusResponse>(
      SubscriptionService.provisioningBasePath + environment.provisioningUpdateSubV1,
      { planId: planId },
      this.createDefaultHeaders()
    );
  }

  getSubscriptionPaymentMethod(): Observable<IGetSubscriptionPaymentResponse> {
    return this.httpClient.get<IGetSubscriptionPaymentResponse>(
      SubscriptionService.provisioningBasePath + environment.provisioningPaymentSubV1,
      this.createDefaultHeaders()
    );
  }

  getProductDescription(): Observable<IGetProductResponse> {
    return this.httpClient.get<IGetProductResponse>(
      SubscriptionService.provisioningBasePath + environment.provisioningProductV1,
      this.createDefaultHeaders()
    );
  }

  getAllProductPlan(): Observable<IGetAllProductResponse> {
    return this.httpClient.get<IGetAllProductResponse>(
      SubscriptionService.provisioningBasePath + environment.provisioningAllProductListV1,
      this.createDefaultHeaders()
    );
  }

  getChangePaymentPortal(): Observable<IGetChangePaymentResponse> {
    return this.httpClient.get<IGetChangePaymentResponse>(
      SubscriptionService.provisioningBasePath + environment.provisioningChangePaymentV1,
      this.createDefaultHeaders()
    );
  }

  private createDefaultHeaders(): { headers: HttpHeaders } {
    return {
      headers: new HttpHeaders()
        .set('Authentication', this.authService.getAccessToken())
        .set('Access-Control-Allow-Origin', '*'),
    };
  }
}
