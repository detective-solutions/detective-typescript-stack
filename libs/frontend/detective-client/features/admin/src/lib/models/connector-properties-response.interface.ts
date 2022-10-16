export interface IConnectorPropertiesResponse {
  propertyName: string;
  displayName: string;
  type: string;
  description: string;
  default: string | number | boolean;
  values: { key: string; value: string }[];
  required: boolean;
}
