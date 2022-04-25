import { createAction, props } from '@ngrx/store';

import { INodeInput } from '../../../../../models';
import { ITableNode } from '../../model';
import { Update } from '@ngrx/entity';

export const tableNodeAdded = createAction(
  '[Whiteboard] Table element added',
  props<{ tableElementAdded: INodeInput }>()
);

export const tableDataReceived = createAction(
  '[Table Element] Received table data from backend',
  props<{ update: Update<ITableNode> }>()
);
