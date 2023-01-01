export interface UploadResponse {
  success: boolean;
  xid: string;
  setup: InitialSetup | InitialSetupQuery;
  nodeType: 'table' | 'display';
}

export interface InitialSetup {
  pageCount: number;
  pages: string[];
  exp: string;
}

export interface InitialSetupQuery {
  query: string;
}
