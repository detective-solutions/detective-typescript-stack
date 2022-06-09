export interface IDataSource {
  id: string;
  name: string;
  connectorName: string;
  description?: string;
  iconSrc?: string;
  lastUpdated?: Date | null | string;
}
