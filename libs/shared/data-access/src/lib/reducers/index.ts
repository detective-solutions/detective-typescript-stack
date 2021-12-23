import { ActionReducerMap, MetaReducer } from '@ngrx/store';

import { debug } from './debug';
import { environment } from '@detective-frontend/shared/environments';

// eslint-disable-next-line  @typescript-eslint/no-empty-interface
export interface State {}

export const reducers: ActionReducerMap<State> = {};

export const metaReducers: MetaReducer<State>[] = !environment.production ? [debug] : [];
