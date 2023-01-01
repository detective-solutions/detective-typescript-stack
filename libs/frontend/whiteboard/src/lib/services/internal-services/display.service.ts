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

  getHeader(): HttpHeaders {
    const token: string = this.authService.getAccessToken();
    const headers = new HttpHeaders().set('Authentication', token);
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Content-Type', 'multipart/form-data');
    return headers;
  }

  requestPresignedURL(xid: string, fileName: string): Observable<InitialSetup> {
    return this.httpClient.post<InitialSetup>(
      `${environment.baseApiPath}/v1/viewpoint/access`,
      { xid: xid, fileName: fileName },
      { headers: this.getHeader() }
    );
  }

  fileUpload($event: any): Observable<UploadResponse> {
    const formData: FormData = new FormData();
    if (this.files) {
      formData.append('file', $event.dataTransfer.files[0], $event.dataTransfer.files[0].name);
    }

    return this.httpClient.post<any>(`${environment.baseApiPath}/v1/upload/file`, formData, {
      headers: this.getHeader(),
    });
  }
}
