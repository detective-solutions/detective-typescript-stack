import { IMask } from '@detective.solutions/shared/data-access';

export interface IGetMaskingByIdResponse {
  id: string;
  name: string;
  description: string;
  groups: { id: string; name: string }[];
  table: { id: string; name: string };
  columns?: IMask[];
  rows?: IMask[];
}
