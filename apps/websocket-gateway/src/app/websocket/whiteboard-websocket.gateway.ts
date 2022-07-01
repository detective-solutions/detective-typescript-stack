import { EventTypeTopicMapping, IWebSocketClient, WebSocketClientContext } from '../models';
import { IJwtTokenPayload, IMessage, IMessageContext } from '@detective.solutions/shared/data-access';
import { InternalServerErrorException, Logger } from '@nestjs/common';
import { MessageBody, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';

import { AuthEnvironment } from '@detective.solutions/backend/auth';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Server } from 'ws';
import { WebSocketInfo } from '../models/websocket-info.type';
import { WhiteboardProducer } from '../kafka/whiteboard.producer';
import { buildLogContext } from '@detective.solutions/backend/shared/utils';

/* eslint-disable @typescript-eslint/no-explicit-any */

@WebSocketGateway(Number(process.env.WEBSOCKET_PORT))
export class WhiteboardWebSocketGateway implements OnGatewayInit {
  private readonly logger = new Logger(WhiteboardWebSocketGateway.name);

  @WebSocketServer()
  server: Server<IWebSocketClient>;

  constructor(
    private readonly whiteboardProducer: WhiteboardProducer,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService
  ) {}

  // TODO: Evaluate if it is possible to log when clients disconnect
  afterInit(server: Server) {
    console.log(server);
    // Setting server options afterwards to be able to call internal methods
    server.options = {
      // TODO: Investigate objects & define interfaces
      verifyClient: async (info: WebSocketInfo, cb: (boolean, number, string) => any) => {
        await this.handleNewClientConnection(server, info, cb);
      },
    };
  }

  @SubscribeMessage(EventTypeTopicMapping.queryTable.eventType)
  onEvent(@MessageBody() message: IMessage<any>) {
    message.context = this.mergeEventTypeIntoMessageContext(
      EventTypeTopicMapping.queryTable.eventType,
      message.context
    );
    this.logger.verbose(
      `${buildLogContext(message.context)} Routing ${message.context.eventType} event to topic ${
        EventTypeTopicMapping.queryTable.targetTopic
      }`
    );
    this.whiteboardProducer.sendKafkaMessage(EventTypeTopicMapping.queryTable.targetTopic, message);
    // TODO: Return acknowledgement to sending client for robust collaboration
  }

  sendMessageByContext(message: IMessage<any>, contextMatchKeys: string[]) {
    this.server.clients.forEach((client: IWebSocketClient) => {
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

  private async handleNewClientConnection(server: Server, info: WebSocketInfo, cb: (boolean, number, string) => any) {
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
      (info.req as any).client.context = clientContext; // Assign context to client that requests to connect

      this.logger.verbose(
        `Accepted connection for user ${clientContext.userId} as ${clientContext.userRole} on casefile ${clientContext.casefileId} on tenant ${clientContext.tenantId}`
      );
      this.logger.log(`Currently handling ${server.clients.size + 1} simultaneous client connections`);
      cb(true, 200, 'Verified');
    } else {
      this.logger.warn(`Denied invalid connection. Cannot verify access token ${accessToken}`);
      cb(false, 401, 'Unauthorized');
    }
  }

  private async verifyAndExtractAccessToken(accessToken: string): Promise<IJwtTokenPayload> | null {
    try {
      return this.jwtService.verifyAsync(accessToken, {
        secret: this.config.get<string>(AuthEnvironment.ACCESS_TOKEN_SECRET),
      });
    } catch (e) {
      this.logger.warn(`An error occurred while verifying access token ${accessToken}`);
      this.logger.warn(e);
      return null;
    }
  }

  private async buildClientContext(
    url: string,
    tokenPayload: IJwtTokenPayload
  ): Promise<WebSocketClientContext | null> {
    return new Promise((resolve, reject) => {
      const tenantId = this.extractUrlPathParameter(url, 'tenant');
      const casefileId = this.extractUrlPathParameter(url, 'casefile');
      tokenPayload?.sub && tenantId && casefileId
        ? resolve({
            tenantId: tenantId,
            casefileId: casefileId,
            userId: tokenPayload.sub,
            userRole: tokenPayload.role,
          })
        : reject(null);
    });
  }

  private extractAccessTokenFromUrl(connectionUrl: string): string | null {
    try {
      return connectionUrl.split('token=')[1];
    } catch {
      return null;
    }
  }

  private extractUrlPathParameter(url: string, parameterName: string): string | null {
    const splittedUrl = url.split('?')[0].split('/'); // Remove possible query parameter and split by slashes
    const parameterTitleIndex = splittedUrl.findIndex((part) => part === parameterName);

    // Return value after path parameter title
    return parameterTitleIndex ? splittedUrl[parameterTitleIndex + 1] : null;
  }

  private isContextMatch(
    messageContext: IMessageContext,
    webSocketClientContext: WebSocketClientContext,
    contextKeysToCheck: string[]
  ): boolean {
    return contextKeysToCheck.every((contextKey) => messageContext[contextKey] === webSocketClientContext[contextKey]);
  }

  private mergeEventTypeIntoMessageContext(eventType: string, messageContext: IMessageContext): IMessageContext {
    return { eventType, ...messageContext };
  }
}
