export type ITableCellData =
  | ITextTableCell
  | IDateTableCell
  | IMultiTableCell
  | IAccessTableCell
  | IFavorizedTableCell
  | IUserAvatarListTableCell;

export enum TableCellTypes {
  TEXT_TABLE_CELL = 'textTableCell',
  DATE_TABLE_CELL = 'dateTableCell',
  MULTI_TABLE_CELL = 'multiTableCell',
  ACCESS_TABLE_CELL = 'accessTableCell',
  FAVORIZED_TABLE_CELL = 'favorizedTableCell',
  USER_AVATAR_LIST_TABLE_CELL = 'userIconListTableCell',
}

export interface ITextTableCell {
  type: TableCellTypes.TEXT_TABLE_CELL;
  text: string;
}

export interface IDateTableCell {
  type: TableCellTypes.DATE_TABLE_CELL;
  date: string;
}

export interface IMultiTableCell {
  type: TableCellTypes.MULTI_TABLE_CELL;
  thumbnailSrc: string;
  name: string;
  description: string;
}

export interface IAccessTableCell {
  type: TableCellTypes.ACCESS_TABLE_CELL;
  accessState: AccessState;
}

export enum AccessState {
  ACCESS_GRANTED = 'granted',
  ACCESS_PENDING = 'pending',
  NO_ACCESS = 'noAccess',
}

export interface IFavorizedTableCell {
  type: TableCellTypes.FAVORIZED_TABLE_CELL;
  favorized: boolean;
}

export interface IUserAvatarListTableCell {
  type: TableCellTypes.USER_AVATAR_LIST_TABLE_CELL;
  userAvatars: IUserAvatar[];
}

export interface IUserAvatar {
  name: string;
  imageSrc: string;
}
