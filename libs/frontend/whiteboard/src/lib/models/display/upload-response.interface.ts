export interface IUploadResponse {
  success: boolean;
  xid: string;
  setup: IDisplaySetupInformation;
  nodeType: 'Display' | 'Table';
}

export interface IDisplaySetupInformation {
  pageCount?: number;
  pages?: string[];
  exp?: string;
  query?: string;
}
