export interface ICasefileDataApiResponse {
  casefileData: {
    id: string;
    title: string;
    tableObjects: {
      xid: string;
      name: string;
      layout: {
        x: number;
        y: number;
        width: number;
        height: number;
      };
    }[];
  };
}
