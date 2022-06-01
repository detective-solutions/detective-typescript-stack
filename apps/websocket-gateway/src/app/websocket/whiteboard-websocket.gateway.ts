import { EventType, KafkaTopic, Message, QueryMessage } from '../models';
import { OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';

import { AuthEnvironment } from '@detective.solutions/backend/auth';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';
import { WhiteboardProducer } from '../kafka/whiteboard.producer';

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
    server.options = {
      verifyClient: async (info: { origin: string; secure: boolean; req: any }, cb) => {
        if (await this.extractAndVerifyAccessToken(info.req.url)) {
          // TODO: Evaluate if it is possible to log when clients disconnect
          this.logger.log(`Accepted connection from ${info.origin} on url ${info.req.url}`);
          this.logger.log(`Currently handling ${server.clients.size + 1} simultaneous client connections`);
          cb(true, 200, 'you are verified');
        } else {
          this.logger.warn(`Denied invalid connection from ${info.origin} on url ${info.req.url}`);
          cb(false, 401, 'Unauthorized');
        }
      },
    };
  }

  // TODO: Distinguish messages & clients by context
  broadcastMessage(stringifiedMessage: string) {
    console.log('Broadcasting', stringifiedMessage);
    this.server.clients.forEach((client: WebSocket) => client.send(stringifiedMessage));
  }

  // TODO: Allow distinguishing client connections via server.clients property
  sendMessageToSingleClient() {}

  @SubscribeMessage(EventType.QUERY_TABLE)
  onEvent(_client: WebSocket, data: Message<QueryMessage>) {
    console.log('Received event with data:', data);
    this.whiteboardProducer.sendKafkaMessage(KafkaTopic.MASKING, data);
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
