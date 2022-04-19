import { createReducer } from '@ngrx/store';

export interface WhiteboardMetadataState {
  id: string;
  title: string;
  description: string;
}

export const initialWhiteboardMetadataState: WhiteboardMetadataState = {
  id: '',
  title: '',
  description: '',
};

export const whiteboardMetadataReducer = createReducer(initialWhiteboardMetadataState);
