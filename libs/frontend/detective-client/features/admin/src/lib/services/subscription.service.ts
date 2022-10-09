import { GetAllUsersGQL, IGetUsersGQLResponse } from '../graphql/get-all-users.gql';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  IGetAllProductResponse,
  IGetChangePaymentResponse,
  IGetProductResponse,
  IGetSubscriptionPaymentResponse,
  IInvoiceListResponse,
} from '../models/';
import { Observable, map } from 'rxjs';

import { AuthService } from '@detective.solutions/frontend/shared/auth';
import { IGetAllUsersResponse } from '../models/get-all-users-response.interface';
import { Injectable } from '@angular/core';
import { QueryRef } from 'apollo-angular';
import { StatusResponse } from '@detective.solutions/frontend/shared/ui';
import { environment } from '@detective.solutions/frontend/shared/environments';

@Injectable()
export class SubscriptionService {
  private static provisioningBasePath = `${environment.baseApiPath}${environment.provisioningApiPathV1}`;
  private getAllUsersWatchQuery!: QueryRef<Response>;

  invoice$!: Observable<IInvoiceListResponse>;

  constructor(
    private readonly httpClient: HttpClient,
    private readonly getAllUsersGQL: GetAllUsersGQL,
    private readonly authService: AuthService
  ) {}

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
    if (invoiceId === 'null') {
      return 'Next';
    } else {
      return invoiceId;
    }
  }

  getHeader(): HttpHeaders {
    const token: string = this.authService.getAccessToken();
    const headers = new HttpHeaders().set('Authentication', token);
    headers.set('Access-Control-Allow-Origin', '*');
    return headers;
  }

  getInvoices(): Observable<IInvoiceListResponse> {
    return this.httpClient.get<IInvoiceListResponse>(
      SubscriptionService.provisioningBasePath + environment.provisioningListInvoicesV1,
      { headers: this.getHeader() }
    );
  }

  cancelSubscription(): Observable<StatusResponse> {
    return this.httpClient.get<StatusResponse>(
      SubscriptionService.provisioningBasePath + environment.provisioningCancelSubV1,
      {
        headers: this.getHeader(),
      }
    );
  }

  updateSubscription(planId: string): Observable<StatusResponse> {
    return this.httpClient.post<StatusResponse>(
      SubscriptionService.provisioningBasePath + environment.provisioningUpdateSubV1,
      { planId: planId },
      { headers: this.getHeader() }
    );
  }

  getSubscriptionPaymentMethod(): Observable<IGetSubscriptionPaymentResponse> {
    return this.httpClient.get<IGetSubscriptionPaymentResponse>(
      SubscriptionService.provisioningBasePath + environment.provisioningPaymentSubV1,
      {
        headers: this.getHeader(),
      }
    );
  }

  getProductDescription(): Observable<IGetProductResponse> {
    return this.httpClient.get<IGetProductResponse>(
      SubscriptionService.provisioningBasePath + environment.provisioningProductV1,
      {
        headers: this.getHeader(),
      }
    );
  }

  getAllProductPlan(): Observable<IGetAllProductResponse> {
    return this.httpClient.get<IGetAllProductResponse>(
      SubscriptionService.provisioningBasePath + environment.provisioningAllProductListV1,
      {
        headers: this.getHeader(),
      }
    );
  }

  getChangePaymentPortal(): Observable<IGetChangePaymentResponse> {
    return this.httpClient.get<IGetChangePaymentResponse>(
      SubscriptionService.provisioningBasePath + environment.provisioningChangePaymentV1,
      {
        headers: this.getHeader(),
      }
    );
  }

  getAllUsers(): Observable<IGetAllUsersResponse> {
    if (!this.getAllUsersWatchQuery) {
      this.getAllUsersWatchQuery = this.getAllUsersGQL.watch();
    }

    return this.getAllUsersWatchQuery.valueChanges.pipe(
      map((response: any) => response.data),
      map((response: IGetUsersGQLResponse) => {
        return {
          users: response.queryUser,
          totalElementsCount: response.aggregateUser.count,
        };
      })
    );
  }
}
