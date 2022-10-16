import { SourceConnectionStatus } from '@detective.solutions/shared/data-access';

export type TableCellData =
  | IAccessTableCell
  | IDateTableCell
  | IFavorizedTableCell
  | IIconButtonTableCell
  | IMultiTableCell
  | IMultiTableCellWithoutIcon
  | IStateTableCell
  | ITextTableCell
  | ILinkTableCell
  | IUserAvatarListTableCell;

export enum TableCellTypes {
  ACCESS_TABLE_CELL = 'accessTableCell',
  DATE_TABLE_CELL = 'dateTableCell',
  FAVORIZED_TABLE_CELL = 'favorizedTableCell',
  ICON_BUTTON_TABLE_CELL = 'iconButtonTableCell',
  MULTI_TABLE_CELL = 'multiTableCell',
  MULTI_TABLE_CELL_WITHOUT_THUMBNAIL = 'multiTableCellWithoutIcon',
  STATUS_TABLE_CELL = 'statusTableCell',
  TEXT_TABLE_CELL = 'textTableCell',
  LINK_TABLE_CELL = 'linkTableCell',
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

export interface IIconButtonTableCell extends IBaseTableCell {
  type: TableCellTypes.ICON_BUTTON_TABLE_CELL;
  icon: string;
  buttons: { icon: string; tooltipText: string; clickEventKey: string; iconCssColor?: string }[];
}

export interface IMultiTableCell extends IBaseTableCell {
  type: TableCellTypes.MULTI_TABLE_CELL;
  thumbnail: string;
  name: string;
  description: string;
}

export interface IMultiTableCellWithoutIcon extends IBaseTableCell {
  type: TableCellTypes.MULTI_TABLE_CELL_WITHOUT_THUMBNAIL;
  name: string;
  description: string;
}

export interface IStateTableCell extends IBaseTableCell {
  type: TableCellTypes.STATUS_TABLE_CELL;
  status: SourceConnectionStatus;
  message?: string;
}

export interface ITextTableCell extends IBaseTableCell {
  type: TableCellTypes.TEXT_TABLE_CELL;
  text: string;
}

export interface ILinkTableCell extends IBaseTableCell {
  type: TableCellTypes.LINK_TABLE_CELL;
  text: string;
  link: string;
}

export interface IUserAvatarListTableCell extends IBaseTableCell {
  type: TableCellTypes.USER_AVATAR_LIST_TABLE_CELL;
  userAvatars: IUserAvatar[];
}

export interface IUserAvatar extends IBaseTableCell {
  name: string;
  imageSrc: string;
}
