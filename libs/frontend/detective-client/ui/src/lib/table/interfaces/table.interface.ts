// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IAbstractTableDef {}

export interface ITableInput {
  tableItems: IAbstractTableDef[];
  totalElementsCount: number;
}

export interface IMatColumnDef {
  id: string;
  name: string;
}
