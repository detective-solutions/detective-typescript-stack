import { HttpClient, HttpHeaders } from '@angular/common/http';
import { InitialSetup, UploadResponse } from '../../models';

import { AuthService } from '@detective.solutions/frontend/shared/auth';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@detective.solutions/frontend/shared/environments';

/* eslint-disable @typescript-eslint/no-explicit-any */

@Injectable()
export class DisplayService {
  files: any[] = [];

  constructor(private readonly httpClient: HttpClient, private readonly authService: AuthService) {}

  getHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    const headers = new HttpHeaders();

    headers
      .set('Authentication', token)
      .set('Access-Control-Allow-Origin', '*')
      .set('Content-Type', 'multipart/form-data');

    return headers;
  }

  requestPresignedURL(xid: string, fileName: string): Observable<InitialSetup> {
    return this.httpClient.post<InitialSetup>(
      `${environment.baseApiPath}${environment.uploadApiPathV1}${environment.uploadApiAccessV1}`,
      { xid: xid, fileName: fileName },
      { headers: this.getHeaders() }
    );
  }

  fileUpload(event: DragEvent): Observable<UploadResponse> {
    const formData: FormData = new FormData();

    if (event.dataTransfer !== null) {
      formData.append('file', event.dataTransfer.files[0], event.dataTransfer.files[0].name);
    }

    return this.httpClient.post<UploadResponse>(
      `${environment.baseApiPath}${environment.uploadApiPathV1}${environment.uploadApiFileV1}`,
      formData,
      {
        headers: this.getHeaders(),
      }
    );
  }
}
