import { Observable, of } from 'rxjs';
import { OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from '@nestjs/websockets';

import { AuthEnvironment } from '@detective.solutions/backend/auth';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Server } from 'ws';

/* eslint-disable @typescript-eslint/no-explicit-any */

@WebSocketGateway(7777)
export class KafkaAdapterGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  constructor(private readonly jwtService: JwtService, private readonly config: ConfigService) {}

  afterInit(server: Server) {
    // Handle authentication for incoming connection upgrade requests
    server.shouldHandle = (incomingUpgradeRequest) => this.extractAndVerifyAccessToken(incomingUpgradeRequest.url);
  }

  @SubscribeMessage('QUERY_TABLE')
  onEvent(_client: any, data: string): Observable<WsResponse<any>> {
    console.log('Received event with data:', data);
    return of({
      event: 'QUERY_TABLE',
      data: {
        id: data,
        colDefs: [
          { field: 'make', sortable: true, filter: true, suppressMovable: true },
          { field: 'model' },
          { field: 'price' },
          { field: 'make' },
          { field: 'model' },
          { field: 'price' },
        ],
        rowData: [
          { make: 'Toyota', model: 'Celica', price: 35000 },
          { make: 'Ford', model: 'Mondeo', price: 32000 },
          { make: 'Porsche', model: 'Boxter', price: 72000 },
          { make: 'Toyota', model: 'Celica', price: 35000 },
          { make: 'Toyota', model: 'Celica', price: 35000 },
          { make: 'Toyota', model: 'Celica', price: 35000 },
          { make: 'Toyota', model: 'Celica', price: 35000 },
          { make: 'Ford', model: 'Mondeo', price: 32000 },
          { make: 'Porsche', model: 'Boxter', price: 72000 },
          { make: 'Ford', model: 'Mondeo', price: 32000 },
          { make: 'Porsche', model: 'Boxter', price: 72000 },
          { make: 'Ford', model: 'Mondeo', price: 32000 },
          { make: 'Porsche', model: 'Boxter', price: 72000 },
          { make: 'Ford', model: 'Mondeo', price: 32000 },
          { make: 'Porsche', model: 'Boxter', price: 72000 },
        ],
      },
    });
  }

  extractAndVerifyAccessToken(connectionUrl: string): boolean {
    if (connectionUrl) {
      const accessToken = connectionUrl.split('token=')[1];
      if (
        accessToken &&
        this.jwtService.verify(accessToken, { secret: this.config.get<string>(AuthEnvironment.ACCESS_TOKEN_SECRET) })
      ) {
        return true;
      }
    }
    return false;
  }
}
