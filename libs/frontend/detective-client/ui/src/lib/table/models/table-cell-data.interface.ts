export type TableCellData =
  | IAccessTableCell
  | IDateTableCell
  | IFavorizedTableCell
  | IIconButtonTableCell
  | IMultiTableCell
  | IStateTableCell
  | ITextTableCell
  | IUserAvatarListTableCell;

export enum TableCellTypes {
  ACCESS_TABLE_CELL = 'accessTableCell',
  DATE_TABLE_CELL = 'dateTableCell',
  FAVORIZED_TABLE_CELL = 'favorizedTableCell',
  ICON_BUTTON_TABLE_CELL = 'iconButtonTableCell',
  MULTI_TABLE_CELL = 'multiTableCell',
  STATE_TABLE_CELL = 'stateTableCell',
  TEXT_TABLE_CELL = 'textTableCell',
  USER_AVATAR_LIST_TABLE_CELL = 'userIconListTableCell',
}

export enum AccessState {
  ACCESS_GRANTED = 'granted',
  ACCESS_PENDING = 'pending',
  NO_ACCESS = 'noAccess',
}

// TODO: Move to source connection
export enum SourceConnectionState {
  INITIALIZING = 'init',
  READY = 'ready',
  ERROR = 'error',
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

export interface IIconButtonTableCell extends IBaseTableCell {
  type: TableCellTypes.ICON_BUTTON_TABLE_CELL;
  icon: string;
  buttons: { icon: string; tooltipText: string; clickEventKey: string; iconCssColor?: string }[];
}

export interface IMultiTableCell extends IBaseTableCell {
  type: TableCellTypes.MULTI_TABLE_CELL;
  thumbnailSrc: string;
  name: string;
  description: string;
}

export interface IStateTableCell extends IBaseTableCell {
  type: TableCellTypes.STATE_TABLE_CELL;
  state: SourceConnectionState;
  message?: string;
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
