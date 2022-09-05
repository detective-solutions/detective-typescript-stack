import { GetWhiteboardUserByIdGQL, IGetWhiteboardUserByIdGQLResponse } from '../../graphql';

import { Injectable } from '@angular/core';
import { map } from 'rxjs';

/* eslint-disable @typescript-eslint/no-explicit-any */

@Injectable()
export class WhiteboardUserService {
  constructor(private readonly getWhiteboardUserByIdGQL: GetWhiteboardUserByIdGQL) {}

  getWhiteboardUserById(id: string) {
    return this.getWhiteboardUserByIdGQL.watch({ id: id }).valueChanges.pipe(
      map((response: any) => response.data),
      map((response: IGetWhiteboardUserByIdGQLResponse) => response.getUser)
    );
  }
}
