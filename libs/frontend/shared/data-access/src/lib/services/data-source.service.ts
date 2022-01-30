import { DataSource, IDataSource } from '@detective.solutions/shared/data-access';
import { Observable, catchError, delay, map, of, shareReplay, throwError } from 'rxjs';

import { DUMMY_DATASOURCE_DATA } from './dummy-data';
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class DataSourceService {
  dataSources$: Observable<IDataSource[]> = of(DUMMY_DATASOURCE_DATA).pipe(
    delay(1000),
    map((casefiles: IDataSource[]) => casefiles.map(DataSource.Build)),
    shareReplay(),
    catchError(this.transformError)
  );

  private transformError(error: HttpErrorResponse | string) {
    let errorMessage = 'An unknown error has occurred';
    if (typeof error === 'string') {
      errorMessage = error;
    } else if (error.error instanceof ErrorEvent) {
      errorMessage = `Error! ${error.error.message}`;
    } else if (error.status) {
      errorMessage = `Request failed with ${error.status} ${error.statusText}`;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    return throwError(() => new Error(errorMessage));
  }
}
