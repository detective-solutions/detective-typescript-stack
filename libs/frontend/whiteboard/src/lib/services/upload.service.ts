import { HttpClient, HttpHeaders } from '@angular/common/http';

import { AuthService } from '@detective.solutions/frontend/shared/auth';
import { Injectable } from '@angular/core';

/* eslint-disable @typescript-eslint/no-explicit-any */

@Injectable()
export class UploadService {
  files: any[] = [];

  constructor(private readonly httpClient: HttpClient, private readonly authService: AuthService) {}

  getHeader(): HttpHeaders {
    const token: string = this.authService.getAccessToken();
    const headers = new HttpHeaders().set('Authentication', token);
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Content-Type', 'multipart/form-data');
    return headers;
  }

  prepareFilesList(files: Array<any>) {
    for (const item of files) {
      this.files.push(item);
    }
  }

  fileUpload($event: any) {
    this.prepareFilesList($event);
    console.log(this.files);

    if (this.files) {
      console.log('file: ', this.files[0]);
      console.log('filename', this.files[0].file.name);
      const formData: FormData = new FormData();
      formData.append('file', this.files[0].file, this.files[0].file.name);
      // const now = formatDate(new Date());

      this.httpClient
        .post('http://localhost:3009/v1/upload/file', formData, { headers: this.getHeader() })
        .subscribe(() => {
          console.log('hello');
        });
    }
  }
}
