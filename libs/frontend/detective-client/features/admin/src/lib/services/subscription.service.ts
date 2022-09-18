import { GetAllUsersGQL, IGetUsersGQLResponse } from '../graphql/get-all-users.gql';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { IGetProductResponse, IInvoiceListResponse } from '../models/';
import { Observable, map } from 'rxjs';

import { IGetAllUsersResponse } from '../models/get-all-users-response.interface';
import { Injectable } from '@angular/core';
import { ProductDTO } from '@detective.solutions/frontend/shared/data-access';
import { QueryRef } from 'apollo-angular';
import { environment } from '@detective.solutions/frontend/shared/environments';

@Injectable()
export class SubscriptionService {
  private static provisioningBasePath = 'http://localhost:3004/';
  private getAllUsersWatchQuery!: QueryRef<Response>;
  invoice$!: Observable<IInvoiceListResponse>;
  GetAllUsersGQL: any;

  constructor(
    private readonly httpClient: HttpClient, // private readonly logger: LogService
    private readonly getAllUsersGQL: GetAllUsersGQL
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

  cancelSubscription(): Observable<{ status: boolean }> {
    const token: string = JSON.parse(localStorage.getItem('detective_access_token') || '');
    const headers = new HttpHeaders().set('Authentication', token);
    headers.set('Access-Control-Allow-Origin', '*');

    return this.httpClient.get<any>(SubscriptionService.provisioningBasePath + environment.provisioningCancelSubV1, {
      headers: headers,
    });
  }

  getProductDescription(): Observable<IGetProductResponse> {
    const token: string = JSON.parse(localStorage.getItem('detective_access_token') || '');
    const headers = new HttpHeaders().set('Authentication', token);
    headers.set('Access-Control-Allow-Origin', '*');

    return this.httpClient.get<IGetProductResponse>(
      SubscriptionService.provisioningBasePath + environment.productSubV1,
      {
        headers: headers,
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
