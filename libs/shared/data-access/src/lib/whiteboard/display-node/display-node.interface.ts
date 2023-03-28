import { IDisplayOccurrence } from '../../display';
import { IGeneralWhiteboardNodeTemporaryData } from '..';

export interface IDisplayNode extends IDisplayOccurrence {
  temporary?: IDisplayNodeTemporaryData;
}

export interface IDisplayNodeTemporaryData extends IGeneralWhiteboardNodeTemporaryData {
  file: File;
}
