import { IColumn } from '@detective.solutions/shared/data-access';

export class ColumnDTO implements IColumn {
  constructor(
    public xid: string,
    public columnName: string,
    public columnType: string,
    public schemaTable: { xid: string }
  ) {}

  static Build(columnInput: IColumn) {
    return new ColumnDTO(columnInput.xid, columnInput.columnName, columnInput.columnType, columnInput.schemaTable);
  }
}
