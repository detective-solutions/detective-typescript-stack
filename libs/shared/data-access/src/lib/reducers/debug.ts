import { ActionReducer } from '@ngrx/store';

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export function debug(reducer: ActionReducer<any>): ActionReducer<any> {
  return (state, action) => {
    console.log('state', state);
    console.log('action', action);

    return reducer(state, action);
  };
}
