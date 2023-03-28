import {
  IConnectionsAddEditResponse,
  IConnectionsDeleteResponse,
  IConnectorPropertiesResponse,
  IConnectorSchemaResponse,
  IConnectorTypesResponse,
} from '../models';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SourceConnectionDTO } from '@detective.solutions/frontend/shared/data-access';
import { environment } from '@detective.solutions/frontend/shared/environments';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private static catalogServiceBasePath = `${environment.baseApiPath}${environment.catalogApiPathV1}`;

  constructor(private readonly httpClient: HttpClient) {}

  getAvailableConnectorTypes(): Observable<IConnectorTypesResponse[]> {
    return this.httpClient.get<IConnectorTypesResponse[]>(`${CatalogService.catalogServiceBasePath}/connector/list`);
  }

  getConnectorProperties(connectorType: string): Observable<{ properties: IConnectorPropertiesResponse[] }> {
    return this.httpClient.get<{ properties: IConnectorPropertiesResponse[] }>(
      `${CatalogService.catalogServiceBasePath}/connector/schema/${connectorType}`
    );
  }

  getExistingConnectorPropertiesById(connectionId: string): Observable<IConnectorSchemaResponse> {
    return this.httpClient.get<IConnectorSchemaResponse>(
      `${CatalogService.catalogServiceBasePath}/schema/${connectionId}`
    );
  }

  addConnection(
    connectionType: string,
    payload: { [key: string]: string | number }
  ): Observable<IConnectionsAddEditResponse> {
    return this.httpClient.post<IConnectionsAddEditResponse>(
      `${CatalogService.catalogServiceBasePath}/${connectionType}/insert`,
      payload
    );
  }

  updateConnection(
    connectionType: string,
    connectionId: string,
    payload: { [key: string]: string | number }
  ): Observable<IConnectionsAddEditResponse> {
    return this.httpClient.post<IConnectionsAddEditResponse>(
      `${CatalogService.catalogServiceBasePath}/${connectionType}/update/${connectionId}`,
      payload
    );
  }

  deleteConnection(connection: SourceConnectionDTO): Observable<IConnectionsDeleteResponse> {
    return this.httpClient.post<IConnectionsDeleteResponse>(`${CatalogService.catalogServiceBasePath}/delete`, {
      source_connection_xid: connection.id,
      source_connection_name: connection.name,
    });
  }
}
