import { IWhiteboardState } from '../interfaces';
import { WHITEBOARD_STORE_NAME } from '../state-constants';
import { createFeatureSelector } from '@ngrx/store';

export const selectWhiteboardState = createFeatureSelector<IWhiteboardState>(WHITEBOARD_STORE_NAME);
