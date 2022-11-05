import { IAbstractTableDef, IColumnDef } from '@detective.solutions/frontend/detective-client/ui';
import { IDropDownValues, IDropDownValuesBoolean } from '@detective.solutions/shared/data-access';

export interface IMaskingTableDef extends IAbstractTableDef {
  maskingInfo: IColumnDef;
  table: IColumnDef;
  userGroups: IColumnDef;
  lastUpdatedBy: IColumnDef;
  lastUpdated: IColumnDef;
  actions: IColumnDef;
}

export interface IMaskSubTableDataDef {
  filterType: string;
  id: string;
  columnName: string;
  visible: boolean;
  valueName: string;
  replaceType: string;
  customReplaceType: string;
  isNew: boolean;
}

export interface IMaskSubTableDef {
  key: string;
  type: string;
  label: string;
}

export interface IMaskSubTableDataDropdown {
  columnName: IDropDownValues[];
  visible: IDropDownValues[];
  filterType: IDropDownValues[];
  replaceType: IDropDownValues[];
}
