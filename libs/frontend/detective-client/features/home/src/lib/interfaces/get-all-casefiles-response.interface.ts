import { Casefile } from '@detective.solutions/frontend/shared/data-access';

export interface IGetAllCasefilesResponse {
  casefiles: Casefile[];
  totalElementsCount: number;
}
