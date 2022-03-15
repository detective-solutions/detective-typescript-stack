export interface ICasefileEvent {
  readonly casefileId: string;
  readonly type: CasefileEventType;
  readonly value?: string | boolean;
}

export enum CasefileEventType {
  REQUEST_ACCESS = 'requestAccess',
  FAVORIZE = 'favorize',
}
