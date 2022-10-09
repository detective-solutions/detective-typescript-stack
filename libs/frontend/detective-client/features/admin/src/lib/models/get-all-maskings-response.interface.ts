import { MaskingDTO } from '@detective.solutions/frontend/shared/data-access';

export interface IGetAllMaskingsResponse {
  maskings: MaskingDTO[];
  totalElementsCount: number;
}
