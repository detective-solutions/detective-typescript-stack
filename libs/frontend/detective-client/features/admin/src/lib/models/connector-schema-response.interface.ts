import { IConnectorPropertiesResponse } from './connector-properties-response.interface';

export interface IConnectorSchemaResponse {
  connectorType: string;
  properties: IConnectorPropertiesResponse[];
}
