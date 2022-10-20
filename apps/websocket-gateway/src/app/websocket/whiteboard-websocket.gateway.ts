import { EventTypeTopicMapping, IPropagationMessage, IWebSocketClient, WebSocketClientContext } from '../models';
import {
  IJwtTokenPayload,
  IMessage,
  IMessageContext,
  MessageEventType,
  UserRole,
} from '@detective.solutions/shared/data-access';
import { InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import {
  MessageBody,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { buildLogContext, validateDto } from '@detective.solutions/backend/shared/utils';

import { AuthModuleEnvironment } from '@detective.solutions/backend/auth';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { MessageContextDTO } from '@detective.solutions/backend/shared/data-access';
import { MessagePropagationService } from '../services';
import { Server } from 'ws';
import { WebSocketInfo } from '../models/websocket-info.type';
import { WhiteboardEventProducer } from '../events/whiteboard-event.producer';
import { broadcastWebSocketContext } from '../utils';
import { v4 as uuidv4 } from 'uuid';

/* eslint-disable @typescript-eslint/no-explicit-any */

@WebSocketGateway(7777)
export class WhiteboardWebSocketGateway implements OnGatewayInit, OnGatewayDisconnect {
  private static cursorPropagationChannel = 'ws_gateway_cursor_propagation';
  private static propagationSourceId = uuidv4();

  readonly logger = new Logger(WhiteboardWebSocketGateway.name);

  @WebSocketServer()
  server: Server<IWebSocketClient>;

  constructor(
    private readonly whiteboardEventProducer: WhiteboardEventProducer,
    private readonly messagePropagationService: MessagePropagationService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService
  ) {}

  afterInit(server: Server) {
    // Setting server options afterwards to be able to call internal methods
    server.options = {
      verifyClient: async (info: WebSocketInfo, cb: (boolean, number, string) => void) =>
        this.handleNewClientConnection(server, info, cb),
    };

    // Subscribe to cursor message propagations from other websocket gateways
    this.messagePropagationService.subscribeToChannel(
      WhiteboardWebSocketGateway.cursorPropagationChannel,
      (message: string) => {
        const parsedMessage = JSON.parse(message) as IPropagationMessage;
        if (parsedMessage.propagationSourceId !== WhiteboardWebSocketGateway.propagationSourceId) {
          this.sendMessageByContext(parsedMessage, broadcastWebSocketContext);
        }
      }
    );
  }

  handleDisconnect(client: any) {
    this.logger.log(`${buildLogContext(client._socket.context)} Client has disconnected`);

    this.whiteboardEventProducer.sendKafkaMessage(EventTypeTopicMapping.whiteboardUserLeft.targetTopic, {
      context: {
        ...client._socket.context,
        eventType: MessageEventType.WhiteboardUserLeft,
        timestamp: new Date().getTime(),
      },
      body: null,
    });
  }

  @SubscribeMessage(MessageEventType.WhiteboardCursorMoved)
  async onWhiteboardCursorMovedEvent(@MessageBody() message: IMessage<any>) {
    // Propagate message to other websocket gateways that subscribed to the same channel
    this.messagePropagationService.propagateEvent(WhiteboardWebSocketGateway.cursorPropagationChannel, {
      ...message,
      propagationSourceId: WhiteboardWebSocketGateway.propagationSourceId,
    });
    this.sendMessageByContext(message, broadcastWebSocketContext);
  }

  @SubscribeMessage(EventTypeTopicMapping.loadWhiteboardData.eventType)
  async onLoadWhiteboardDataEvent(@MessageBody() message: IMessage<any>) {
    await this.validateMessageContext(message?.context);
    this.logger.verbose(
      `${buildLogContext(message.context)} Routing ${message.context.eventType} event to topic ${
        EventTypeTopicMapping.loadWhiteboardData.targetTopic
      }`
    );
    this.whiteboardEventProducer.sendKafkaMessage(EventTypeTopicMapping.loadWhiteboardData.targetTopic, message);
  }

  @SubscribeMessage(EventTypeTopicMapping.whiteboardNodeAdded.eventType)
  async onWhiteboardNodeAddedEvent(@MessageBody() message: IMessage<any>) {
    await this.validateMessageContext(message?.context);
    this.logger.verbose(
      `${buildLogContext(message.context)} Routing ${message.context.eventType} event to topic ${
        EventTypeTopicMapping.whiteboardNodeAdded.targetTopic
      }`
    );
    this.whiteboardEventProducer.sendKafkaMessage(EventTypeTopicMapping.whiteboardNodeAdded.targetTopic, message);
  }

  @SubscribeMessage(EventTypeTopicMapping.whiteboardNodeDeleted.eventType)
  async onWhiteboardNodeDeletedEvent(@MessageBody() message: IMessage<any>) {
    await this.validateMessageContext(message?.context);
    this.logger.verbose(
      `${buildLogContext(message.context)} Routing ${message.context.eventType} event to topic ${
        EventTypeTopicMapping.whiteboardNodeDeleted.targetTopic
      }`
    );
    this.whiteboardEventProducer.sendKafkaMessage(EventTypeTopicMapping.whiteboardNodeDeleted.targetTopic, message);
  }

  @SubscribeMessage(EventTypeTopicMapping.whiteboardNodeBlocked.eventType)
  async onWhiteboardNodeBlockedEvent(@MessageBody() message: IMessage<any>) {
    await this.validateMessageContext(message?.context);
    this.logger.verbose(
      `${buildLogContext(message.context)} Routing ${message.context.eventType} event to topic ${
        EventTypeTopicMapping.whiteboardNodeBlocked.targetTopic
      }`
    );
    this.whiteboardEventProducer.sendKafkaMessage(EventTypeTopicMapping.whiteboardNodeBlocked.targetTopic, message);
  }

  @SubscribeMessage(EventTypeTopicMapping.whiteboardNodeMoved.eventType)
  async onWhiteboardNodeMoved(@MessageBody() message: IMessage<any>) {
    await this.validateMessageContext(message?.context);
    this.logger.verbose(
      `${buildLogContext(message.context)} Routing ${message.context.eventType} event to topic ${
        EventTypeTopicMapping.whiteboardNodeMoved.targetTopic
      }`
    );
    this.whiteboardEventProducer.sendKafkaMessage(EventTypeTopicMapping.whiteboardNodeMoved.targetTopic, message);
  }

  @SubscribeMessage(EventTypeTopicMapping.queryTable.eventType)
  async onQueryTableEvent(@MessageBody() message: IMessage<any>) {
    await this.validateMessageContext(message?.context);
    this.logger.verbose(
      `${buildLogContext(message.context)} Routing ${message.context.eventType} event to topic ${
        EventTypeTopicMapping.queryTable.targetTopic
      }`
    );
    this.whiteboardEventProducer.sendKafkaMessage(EventTypeTopicMapping.queryTable.targetTopic, message);
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

  private async handleNewClientConnection(server: Server, info: WebSocketInfo, cb: (boolean, number, string) => void) {
    const requestUrl = info.req.url;
    this.logger.debug(`Incoming connection request on url ${requestUrl}`);

    const accessToken = this.extractAccessTokenFromUrl(requestUrl);
    if (!accessToken) {
      this.logger.warn(`Denied invalid connection. Cannot extract access token from url ${requestUrl}`);
      cb(false, 401, 'Unauthorized');
    }

    const decodedAccessToken = await this.verifyAndExtractAccessToken(accessToken, requestUrl);
    if (decodedAccessToken) {
      const clientContext = await this.buildClientContext(decodedAccessToken, requestUrl);
      if (!clientContext) {
        this.logger.warn(`Denied invalid connection. Cannot build client context from url ${requestUrl}`);
        cb(false, 401, 'Unauthorized');
      }
      (info.req as any).client.context = clientContext; // Assign context to client that requests to connect

      this.logger.verbose(
        `Accepted connection for user ${clientContext.userId} as ${clientContext.userRole} on casefile ${clientContext.casefileId} on tenant ${clientContext.tenantId}`
      );

      // Notify backend to start a WHITEBOARD_USER_JOINED transaction
      const message = {
        context: {
          ...clientContext,
          timestamp: new Date().getTime(),
          eventType: MessageEventType.WhiteboardUserJoined,
          userRole: clientContext.userRole as UserRole,
        },
        body: null,
      };
      this.whiteboardEventProducer.sendKafkaMessage(EventTypeTopicMapping.whiteboardUserJoined.targetTopic, message);

      this.logger.log(`Currently handling ${server.clients.size + 1} simultaneous client connections`);
      cb(true, 200, 'Verified');
    } else {
      this.logger.warn(`Denied invalid connection. Cannot verify access token ${accessToken}`);
      cb(false, 401, 'Unauthorized');
    }
  }

  private async verifyAndExtractAccessToken(accessToken: string, url: string): Promise<IJwtTokenPayload> | null {
    try {
      // Verify if token is valid (algorithm & expiry)
      const tokenPayload = await this.jwtService.verifyAsync(accessToken, {
        secret: this.config.get<string>(AuthModuleEnvironment.ACCESS_TOKEN_SECRET),
      });
      // Verify if token is valid for the requested tenantId
      const urlTenantId = this.extractUrlPathParameter(url, 'tenant');
      if (!urlTenantId) {
        this.logger.warn('Denied invalid connection. Could not extract tenant id from request url');
        throw new UnauthorizedException();
      }
      if (tokenPayload.tenantId !== urlTenantId) {
        this.logger.warn(`Denied invalid connection. Given token is not valid for requested tenant ${urlTenantId}`);
        throw new UnauthorizedException();
      }
      return tokenPayload;
    } catch (e) {
      this.logger.warn(`An error occurred while verifying access token ${accessToken}`);
      this.logger.warn(e);
      return null;
    }
  }

  private async buildClientContext(
    tokenPayload: IJwtTokenPayload,
    url: string
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

  private async validateMessageContext(context: IMessageContext): Promise<void> {
    if (!context) {
      throw new InternalServerErrorException('The incoming websocket message is missing mandatory context information');
    }
    await validateDto(MessageContextDTO, context, this.logger);
  }

  private isContextMatch(
    messageContext: IMessageContext,
    webSocketClientContext: WebSocketClientContext,
    contextKeysToCheck: string[]
  ): boolean {
    return contextKeysToCheck.every((contextKey) => messageContext[contextKey] === webSocketClientContext[contextKey]);
  }
}
