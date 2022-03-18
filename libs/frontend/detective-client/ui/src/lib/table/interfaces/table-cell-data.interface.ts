export type TableCellData =
  | IAccessTableCell
  | IDateTableCell
  | IFavorizedTableCell
  | IMultiTableCell
  | ITextTableCell
  | IUserAvatarListTableCell;

export enum TableCellTypes {
  ACCESS_TABLE_CELL = 'accessTableCell',
  DATE_TABLE_CELL = 'dateTableCell',
  FAVORIZED_TABLE_CELL = 'favorizedTableCell',
  MULTI_TABLE_CELL = 'multiTableCell',
  TEXT_TABLE_CELL = 'textTableCell',
  USER_AVATAR_LIST_TABLE_CELL = 'userIconListTableCell',
}

export enum AccessState {
  ACCESS_GRANTED = 'granted',
  ACCESS_PENDING = 'pending',
  NO_ACCESS = 'noAccess',
}

interface IBaseTableCell {
  id: string;
}

export interface IAccessTableCell extends IBaseTableCell {
  type: TableCellTypes.ACCESS_TABLE_CELL;
  targetUrl: string;
  accessState: AccessState;
}

export interface IDateTableCell extends IBaseTableCell {
  type: TableCellTypes.DATE_TABLE_CELL;
  date: string;
}

export interface IFavorizedTableCell extends IBaseTableCell {
  type: TableCellTypes.FAVORIZED_TABLE_CELL;
  isFavorized: boolean;
}

export interface IMultiTableCell extends IBaseTableCell {
  type: TableCellTypes.MULTI_TABLE_CELL;
  thumbnailSrc: string;
  name: string;
  description: string;
}

export interface ITextTableCell extends IBaseTableCell {
  type: TableCellTypes.TEXT_TABLE_CELL;
  text: string;
}

export interface IUserAvatarListTableCell extends IBaseTableCell {
  type: TableCellTypes.USER_AVATAR_LIST_TABLE_CELL;
  userAvatars: IUserAvatar[];
}

export interface IUserAvatar extends IBaseTableCell {
  name: string;
  imageSrc: string;
}
