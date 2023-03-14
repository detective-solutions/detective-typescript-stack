import { WhiteboardNodeType } from '@detective.solutions/shared/data-access';

export interface IUploadResponse {
  success: boolean;
  xid: string;
  setup: IDisplaySetupInformation;
  nodeType: WhiteboardNodeType.TABLE | WhiteboardNodeType.DISPLAY;
}

export interface IDisplaySetupInformation {
  pageCount?: number;
  pages?: string[];
  exp?: string;
  query?: string;
}
