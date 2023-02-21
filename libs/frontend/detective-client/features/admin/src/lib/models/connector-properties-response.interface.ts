export interface IConnectorPropertiesResponse {
  propertyName: string;
  displayName: string;
  type: string;
  description: string;
  default: string | number | boolean;
  options?: { key: string; value: string }[];
  required: boolean;
  disabled?: boolean;
}
