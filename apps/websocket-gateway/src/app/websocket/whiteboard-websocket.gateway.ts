import { EventTypes, WebSocketClient, WebSocketClientContext } from '../models';
import { IJwtTokenPayload, IMessage, IMessageContext } from '@detective.solutions/shared/data-access';
import { InternalServerErrorException, Logger } from '@nestjs/common';
import { OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';

import { AuthEnvironment } from '@detective.solutions/backend/auth';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { WhiteboardProducer } from '../kafka/whiteboard.producer';
import { buildLogContext } from '../utils';

/* eslint-disable @typescript-eslint/no-explicit-any */

@WebSocketGateway(Number(process.env.WEBSOCKET_PORT))
export class WhiteboardWebSocketGateway implements OnGatewayInit {
  private readonly logger = new Logger(WhiteboardWebSocketGateway.name);

  @WebSocketServer()
  server: Server<WebSocketClient>;

  constructor(
    private readonly whiteboardProducer: WhiteboardProducer,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService
  ) {}

  // TODO: Evaluate if it is possible to log when clients disconnect
  afterInit(server: Server) {
    // Setting server options afterwards to be able to call internal methods
    server.options = {
      // TODO: Investigate objects & define interfaces
      verifyClient: async (info: { origin: string; secure: boolean; req: any }, cb) => {
        const requestUrl = info.req.url;
        this.logger.debug(`Incoming connection request on url ${requestUrl}`);

        const accessToken = this.extractAccessTokenFromUrl(requestUrl);
        if (!accessToken) {
          this.logger.warn(`Denied invalid connection. Cannot extract access token from url ${requestUrl}`);
          cb(false, 401, 'Unauthorized');
        }

        const decodedAccessToken = await this.verifyAndExtractAccessToken(accessToken);
        if (decodedAccessToken) {
          const clientContext = await this.buildClientContext(requestUrl, decodedAccessToken);
          if (!clientContext) {
            this.logger.warn(`Denied invalid connection. Cannot build client context from url ${requestUrl}`);
            cb(false, 401, 'Unauthorized');
          }
          info.req.client.context = clientContext; // Assign context to client that requests to connect

          this.logger.verbose(
            `Accepted connection for user ${clientContext.userId} as ${clientContext.userRole} on casefile ${clientContext.casefileId} on tenant ${clientContext.tenantId}`
          );
          this.logger.log(`Currently handling ${server.clients.size + 1} simultaneous client connections`);
          cb(true, 200, 'Verified');
        } else {
          this.logger.warn(`Denied invalid connection. Cannot verify access token ${accessToken}`);
          cb(false, 401, 'Unauthorized');
        }
      },
    };
  }

  @SubscribeMessage(EventTypes.queryTable.type)
  onEvent(_client: WebSocket, message: IMessage<any>) {
    this.checkEventTypeMatch(message.context, EventTypes.queryTable.type);
    this.logger.verbose(
      `${buildLogContext(message.context)} Routing ${EventTypes.queryTable.type} event to topic ${
        EventTypes.queryTable.targetTopic
      }`
    );
    this.whiteboardProducer.sendKafkaMessage(EventTypes.queryTable.targetTopic, message);
  }

  sendMessageByContext(message: IMessage<any>, contextMatchKeys: string[]) {
    this.server.clients.forEach((client: WebSocketClient) => {
      const clientContext = client._socket.context;
      if (!clientContext) {
        this.logger.error(
          `${buildLogContext(message.context)} Cannot route message, websocket client is missing its context`
        );
        throw new InternalServerErrorException();
      }

      if (this.isContextMatch(message.context, clientContext, contextMatchKeys)) {
        this.logger.verbose(
          `${buildLogContext(message.context)} Forwarding websocket message of event type ${message.context.eventType}`
        );
        client.send(JSON.stringify({ event: message.context.eventType, data: message }));
      }
    });
  }

  private extractAccessTokenFromUrl(connectionUrl: string): string | null {
    try {
      return connectionUrl.split('token=')[1];
    } catch {
      return null;
    }
  }

  private async verifyAndExtractAccessToken(accessToken: string): Promise<IJwtTokenPayload> | null {
    try {
      return await this.jwtService.verifyAsync(accessToken, {
        secret: this.config.get<string>(AuthEnvironment.ACCESS_TOKEN_SECRET),
      });
    } catch (e) {
      this.logger.warn(`An error occurred while verifying access token ${accessToken}`);
      this.logger.warn(e);
      return null;
    }
  }

  private extractUrlPathParameter(url: string, parameterName: string): string | null {
    const splittedUrl = url.split('?')[0].split('/'); // Remove possible query parameter and split by slashes
    const parameterTitleIndex = splittedUrl.findIndex((part) => part === parameterName);

    // Return value after path parameter title
    return parameterTitleIndex ? splittedUrl[parameterTitleIndex + 1] : null;
  }

  private async buildClientContext(
    url: string,
    tokenPayload: IJwtTokenPayload
  ): Promise<WebSocketClientContext | null> {
    const tenantId = this.extractUrlPathParameter(url, 'tenant');
    const casefileId = this.extractUrlPathParameter(url, 'casefile');

    return tokenPayload?.sub && tenantId && casefileId
      ? {
          tenantId: tenantId,
          casefileId: casefileId,
          userId: tokenPayload.sub,
          userRole: tokenPayload.role,
        }
      : null;
  }

  private isContextMatch(
    messageContext: IMessageContext,
    webSocketClientContext: WebSocketClientContext,
    contextKeysToCheck: string[]
  ): boolean {
    console.log(
      contextKeysToCheck.some((contextKey) => messageContext[contextKey] !== webSocketClientContext[contextKey])
    );
    return !contextKeysToCheck.some((contextKey) => messageContext[contextKey] !== webSocketClientContext[contextKey]);
  }

  private checkEventTypeMatch(messageContext: IMessageContext, targetEventType: string) {
    const receivedEventType = messageContext?.eventType;
    if (receivedEventType !== targetEventType) {
      this.logger.error(
        `${buildLogContext(
          messageContext
        )} Received event type ${receivedEventType} is not matching with channel event type ${targetEventType}`
      );
      throw new InternalServerErrorException();
    }
  }
}
