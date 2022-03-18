export interface IDataSource {
  id: string;
  name: string;
  db_type: string;
  description?: string;
  iconSrc?: string;
  lastUpdated?: Date | null | string;
}
