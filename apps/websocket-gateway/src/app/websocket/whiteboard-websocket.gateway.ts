import { IMessage, IQueryMessage } from '@detective.solutions/shared/data-access';
import { OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';

import { AuthEnvironment } from '@detective.solutions/backend/auth';
import { ConfigService } from '@nestjs/config';
import { EventTypes } from '../models';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';
import { WhiteboardProducer } from '../kafka/whiteboard.producer';
import { buildLogContext } from '../utils';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */

@WebSocketGateway(Number(process.env.WEBSOCKET_PORT))
export class WhiteboardWebSocketGateway implements OnGatewayInit {
  private readonly logger = new Logger(WhiteboardWebSocketGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly whiteboardProducer: WhiteboardProducer,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService
  ) {}

  afterInit(server: Server) {
    // Setting options afterwards to be able to call internal methods
    // TODO: Evaluate if it is possible to log when clients disconnect
    server.options = {
      verifyClient: async (info: { origin: string; secure: boolean; req: any }, cb) => {
        if (await this.extractAndVerifyAccessToken(info.req.url)) {
          this.logger.verbose(`Accepted connection from ${info.origin} on url ${info.req.url}`);
          this.logger.log(`Currently handling ${server.clients.size + 1} simultaneous client connections`);
          cb(true, 200, 'Verified');
        } else {
          this.logger.warn(`Denied invalid connection from ${info.origin} on url ${info.req.url}`);
          cb(false, 401, 'Unauthorized');
        }
      },
    };
  }

  // TODO: Distinguish messages & clients by context
  broadcastMessage(data: string) {
    this.logger.debug(`Broadcasting message ${data}`);
    this.server.clients.forEach((client: WebSocket) => client.send(JSON.stringify(data)));
  }

  // TODO: Allow distinguishing client connections via server.clients property
  sendMessageToSingleClient() {}

  @SubscribeMessage(EventTypes.queryTable.type)
  onEvent(_client: WebSocket, data: IMessage<IQueryMessage>) {
    this.logger.log(`${buildLogContext(data.context)} - Received event of type: ${EventTypes.queryTable.type}`);
    this.logger.debug(data.body);

    this.whiteboardProducer.sendKafkaMessage(EventTypes.queryTable.targetTopic, data);
  }

  private async extractAndVerifyAccessToken(connectionUrl: string): Promise<boolean> {
    if (connectionUrl) {
      const accessToken = connectionUrl.split('token=')[1];
      try {
        if (
          accessToken &&
          (await this.jwtService.verifyAsync(accessToken, {
            secret: this.config.get<string>(AuthEnvironment.ACCESS_TOKEN_SECRET),
          }))
        ) {
          return true;
        }
      } catch (e) {
        return false;
      }
    }
    return false;
  }
}
