import { IDisplay } from '../../display';
import { IGeneralWhiteboardNodeTemporaryData } from '..';

/* eslint-disable @typescript-eslint/no-empty-interface */

export interface IDisplayNode extends IDisplay {
  temporary?: IDisplayNodeTemporaryData;
}

export interface IDisplayNodeTemporaryData extends IGeneralWhiteboardNodeTemporaryData {}
