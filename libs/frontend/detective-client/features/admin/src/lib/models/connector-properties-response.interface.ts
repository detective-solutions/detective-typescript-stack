export interface IConnectorPropertiesResponse {
  propertyName: string;
  displayName: string;
  type: string;
  description: string;
  default: string | number | boolean;
  required: boolean;
}
