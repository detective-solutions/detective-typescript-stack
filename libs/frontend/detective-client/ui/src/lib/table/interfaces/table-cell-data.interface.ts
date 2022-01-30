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
  readonly type: TableCellTypes.TEXT_TABLE_CELL;
  readonly text: string;
}

export interface IHtmlTableCell {
  readonly type: TableCellTypes.HTML_TABLE_CELL;
  readonly imageSrc: string;
  readonly header: string;
  readonly description: string;
}

export interface IAccessTableCell {
  readonly type: TableCellTypes.ACCESS_TABLE_CELL;
  accessState: AccessState;
}

export enum AccessState {
  ACCESS_GRANTED = 'granted',
  ACCESS_PENDING = 'pending',
  NO_ACCESS = 'noAccess',
}

export interface IFavorizedTableCell {
  readonly type: TableCellTypes.FAVORIZED_TABLE_CELL;
  favorized: boolean;
}

export interface IUserAvatarListTableCell {
  readonly type: TableCellTypes.USER_AVATAR_LIST_TABLE_CELL;
  readonly userAvatars: IUserAvatar[];
}

export interface IUserAvatar {
  readonly name: string;
  readonly imageSrc: string;
}
