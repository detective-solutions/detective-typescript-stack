import { IMask } from '@detective.solutions/shared/data-access';

export interface IGetMaskingByIdResponse {
  xid: string;
  name: string;
  description: string;
  groups: { xid: string; name: string }[];
  table: { xid: string; name: string };
  columns?: IMask[];
  rows?: IMask[];
}
