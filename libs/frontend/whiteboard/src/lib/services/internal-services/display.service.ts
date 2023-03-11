import { HttpClient, HttpHeaders } from '@angular/common/http';
import { IInitialSetup, IUploadResponse } from '../../models';

import { AuthService } from '@detective.solutions/frontend/shared/auth';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@detective.solutions/frontend/shared/environments';

@Injectable()
export class DisplayService {
  files: File[] = [];

  constructor(private readonly httpClient: HttpClient, private readonly authService: AuthService) {}

  getHeaders(): HttpHeaders {
    const headers = new HttpHeaders();
    headers.set('Access-Control-Allow-Origin', '*').set('Content-Type', 'multipart/form-data');
    return headers;
  }

  requestPresignedURL(xid: string, fileName: string): Observable<IInitialSetup> {
    return this.httpClient.post<IInitialSetup>(
      `${environment.baseApiPath}${environment.uploadApiPathV1}${environment.uploadApiAccessV1}`,
      { xid: xid, fileName: fileName },
      { headers: this.getHeaders() }
    );
  }

  fileUpload(file: File): Observable<IUploadResponse> {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    return this.httpClient.post<IUploadResponse>(
      `${environment.baseApiPath}${environment.uploadApiPathV1}${environment.uploadApiFileV1}`,
      formData,
      { headers: this.getHeaders() }
    );
  }
}
