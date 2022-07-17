import { INodeInput } from '../../../../models';
import { ITableNodeTemporaryData } from '.';

export interface ITableNodeInput extends INodeInput {
  temporary?: ITableNodeTemporaryData;
}
