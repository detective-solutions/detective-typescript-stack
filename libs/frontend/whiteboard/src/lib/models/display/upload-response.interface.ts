import { WhiteboardNodeType } from '@detective.solutions/shared/data-access';

export interface IUploadResponse {
  success: boolean;
  xid: string;
  setup: IInitialSetup;
  nodeType: WhiteboardNodeType.TABLE | WhiteboardNodeType.DISPLAY;
}

export interface IInitialSetup {
  pageCount?: number;
  pages?: string[];
  exp?: string;
  query?: string;
}
