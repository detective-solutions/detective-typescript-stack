export interface ICasefileEvent {
  id: string;
  type: CasefileEventType;
  value?: string | boolean;
}

export enum CasefileEventType {
  REQUEST_ACCESS = 'requestAccess',
  FAVORIZE = 'favorize',
}
