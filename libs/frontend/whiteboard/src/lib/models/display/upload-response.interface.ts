export interface UploadResponse {
  success: boolean;
  xid: string;
  setup: InitialSetup;
  nodeType: 'table' | 'display';
}

export interface InitialSetup {
  pageCount?: number;
  pages?: string[];
  exp?: string;
  query?: string;
}
