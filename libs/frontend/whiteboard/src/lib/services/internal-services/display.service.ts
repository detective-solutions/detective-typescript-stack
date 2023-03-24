import { HttpClient, HttpHeaders } from '@angular/common/http';
import { IDisplaySetupInformation, IUploadResponse } from '../../models';

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@detective.solutions/frontend/shared/environments';

@Injectable()
export class DisplayService {
  constructor(private readonly httpClient: HttpClient) {}

  getHeaders(): HttpHeaders {
    const headers = new HttpHeaders();
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Content-Type', 'multipart/form-data');
    headers.set('Cache-Control', 'no-store');
    return headers;
  }

  requestNewPresignedUrl(id: string, fileName: string): Observable<IDisplaySetupInformation> {
    return this.httpClient.post<IDisplaySetupInformation>(
      `${environment.baseApiPath}${environment.uploadApiPathV1}${environment.uploadApiAccessV1}`,
      { xid: id, fileName: fileName },
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
