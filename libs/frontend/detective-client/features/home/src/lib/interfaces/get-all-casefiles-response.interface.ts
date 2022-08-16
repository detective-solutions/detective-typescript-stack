import { CasefileDTO } from '@detective.solutions/frontend/shared/data-access';

export interface IGetAllCasefilesResponse {
  casefiles: CasefileDTO[];
  totalElementsCount: number;
}
