import { DataSource, IDataSource } from '@detective.solutions/shared/data-access';
import { Observable, catchError, delay, map, of, shareReplay } from 'rxjs';

import { DUMMY_DATASOURCE_DATA } from './dummy-data';
import { Injectable } from '@angular/core';
import { transformError } from '@detective.solutions/frontend/shared/utils';

@Injectable()
export class DataSourceService {
  dataSources$: Observable<IDataSource[]> = of(DUMMY_DATASOURCE_DATA).pipe(
    delay(1000),
    map((casefiles: IDataSource[]) => casefiles.map(DataSource.Build)),
    shareReplay(),
    catchError(transformError)
  );
}
