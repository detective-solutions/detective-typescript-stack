import { Casefile, ICasefile } from '@detective.solutions/shared/data-access';
import { Observable, catchError, delay, map, of, shareReplay } from 'rxjs';

import { DUMMY_CASEFILE_DATA } from './dummy-data';
import { Injectable } from '@angular/core';
import { transformError } from '@detective.solutions/frontend/shared/error-handling';

@Injectable()
export class CasefileService {
  readonly casefiles$: Observable<ICasefile[]> = of(DUMMY_CASEFILE_DATA).pipe(
    delay(1000),
    map((casefiles: ICasefile[]) => casefiles.map(Casefile.Build)),
    shareReplay(),
    catchError(transformError)
  );
}
