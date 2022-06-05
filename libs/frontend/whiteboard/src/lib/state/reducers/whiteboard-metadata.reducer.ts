import { IWhiteboardMetadataState } from '../interfaces';
import { createReducer } from '@ngrx/store';

export const initialWhiteboardMetadataState: IWhiteboardMetadataState = {
  id: '',
  title: '',
  description: '',
};

export const whiteboardMetadataReducer = createReducer(initialWhiteboardMetadataState);
