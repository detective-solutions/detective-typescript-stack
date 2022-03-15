export type ITableCellData =
  | ITextTableCell
  | IHtmlTableCell
  | IAccessTableCell
  | IFavorizedTableCell
  | IUserAvatarListTableCell;

export enum TableCellTypes {
  TEXT_TABLE_CELL = 'textTableCell',
  HTML_TABLE_CELL = 'htmlTableCell',
  ACCESS_TABLE_CELL = 'accessTableCell',
  FAVORIZED_TABLE_CELL = 'favorizedTableCell',
  USER_AVATAR_LIST_TABLE_CELL = 'userIconListTableCell',
}

export interface ITextTableCell {
  type: TableCellTypes.TEXT_TABLE_CELL;
  text: string;
}

export interface IHtmlTableCell {
  type: TableCellTypes.HTML_TABLE_CELL;
  imageSrc: string;
  header: string;
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
