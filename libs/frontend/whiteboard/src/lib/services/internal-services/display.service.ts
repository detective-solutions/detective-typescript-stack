import { HttpClient, HttpHeaders } from '@angular/common/http';
import { IDisplaySetupInformation, IUploadResponse } from '../../models';
import { Observable, of } from 'rxjs';

import { Injectable } from '@angular/core';
import { WhiteboardNodeType } from '@detective.solutions/shared/data-access';
import { environment } from '@detective.solutions/frontend/shared/environments';

@Injectable()
export class DisplayService {
  constructor(private readonly httpClient: HttpClient) {}

  getHeaders(): HttpHeaders {
    const headers = new HttpHeaders();
    headers.set('Access-Control-Allow-Origin', '*').set('Content-Type', 'multipart/form-data');
    return headers;
  }

  requestPresignedURL(xid: string, fileName: string): Observable<IDisplaySetupInformation> {
    return this.httpClient.post<IDisplaySetupInformation>(
      `${environment.baseApiPath}${environment.uploadApiPathV1}${environment.uploadApiAccessV1}`,
      { xid: xid, fileName: fileName },
      { headers: this.getHeaders() }
    );
  }

  fileUpload(file: File): Observable<IUploadResponse> {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    return of({
      success: true,
      xid: '123',
      setup: { query: 'SELECT * FROM "test"' },
      nodeType: WhiteboardNodeType.TABLE,
    } as IUploadResponse);
    return this.httpClient.post<IUploadResponse>(
      `${environment.baseApiPath}${environment.uploadApiPathV1}${environment.uploadApiFileV1}`,
      formData,
      { headers: this.getHeaders() }
    );
  }
}
