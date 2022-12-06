import { IMessageContext, MessageEventType, UserRole } from '@detective.solutions/shared/data-access';
import { IWebSocketClient, WebSocketClientContext } from '../models';
import { InternalServerErrorException, Logger } from '@nestjs/common';
import { broadcastWebSocketContext, unicastWebSocketContext } from '../utils';

import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { KafkaEventProducer } from '../kafka';
import { MessagePropagationService } from '../services';
import { Test } from '@nestjs/testing';
import { WS } from 'jest-websocket-mock';
import { WebSocket } from 'ws';
import { WhiteboardWebSocketGateway } from './whiteboard-websocket.gateway';
import { buildLogContext } from '@detective.solutions/backend/shared/utils';
import { v4 as uuidv4 } from 'uuid';

/* eslint-disable @typescript-eslint/no-explicit-any */

const sendKafkaMessageMethodName = 'sendKafkaMessage';
const mockKafkaEventProducer = {
  [sendKafkaMessageMethodName]: jest.fn(),
};
const propagateMessageMethodName = 'propagateMessage';
const mockMessagePropagationService = {
  [propagateMessageMethodName]: jest.fn(),
};

xdescribe('WhiteboardWebsocketGateway', () => {
  const webSocketUrl = 'ws://localhost:1234';
  const testEventType = MessageEventType.QueryTable;
  const testMessageBody = { test: 'test' };

  let webSocketGateway: WhiteboardWebSocketGateway;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        WhiteboardWebSocketGateway,
        { provide: KafkaEventProducer, useValue: mockKafkaEventProducer },
        { provide: MessagePropagationService, useValue: mockMessagePropagationService },
        { provide: JwtService, useValue: {} },
        ConfigService,
      ],
    }).compile();

    webSocketGateway = moduleRef.get<WhiteboardWebSocketGateway>(WhiteboardWebSocketGateway);
    webSocketGateway.server = new WS(webSocketUrl) as any;
    webSocketGateway.server.clients = new Set();

    // Disable logger for test runs
    webSocketGateway.logger.localInstance.setLogLevels([]);
  });

  afterEach(() => {
    webSocketGateway.server.close();
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(webSocketGateway).toBeDefined();
  });

  describe('onWhiteboardCursorMovedEvent', () => {
    it('should correctly propagate and forward WHITEBOARD_CURSOR_MOVED events', async () => {
      const propagateMessageMock = jest.spyOn(mockMessagePropagationService, propagateMessageMethodName);
      const sendMessageByContextSpy = jest.spyOn(webSocketGateway, 'sendMessageByContext');
      const testMessage = { context: _createContext(MessageEventType.LoadWhiteboardData), body: testMessageBody };

      await webSocketGateway.onWhiteboardCursorMovedEvent(testMessage);

      expect(propagateMessageMock).toHaveBeenCalledTimes(1);
      expect(propagateMessageMock).toHaveBeenCalledWith(WhiteboardWebSocketGateway.cursorPropagationChannel, {
        ...testMessage,
        propagationSourceId: WhiteboardWebSocketGateway.propagationSourceId,
      });
      expect(sendMessageByContextSpy).toHaveBeenCalledTimes(1);
      expect(sendMessageByContextSpy).toHaveBeenCalledWith(testMessage, broadcastWebSocketContext);
    });
  });

  describe('onLoadWhiteboardDataEvent', () => {
    it('should forward LOAD_WHITEBOARD_DATA events to the correct target topic', async () => {
      const producerMock = jest.spyOn(mockKafkaEventProducer, sendKafkaMessageMethodName);
      const testMessage = { context: _createContext(MessageEventType.LoadWhiteboardData), body: testMessageBody };

      await webSocketGateway.onLoadWhiteboardDataEvent(testMessage);

      expect(producerMock).toBeCalledTimes(1);
      expect(producerMock).toBeCalledWith(testMessage);
    });

    it('should throw an InternalServerErrorException if the message context validation fails', async () => {
      const producerMock = jest.spyOn(mockKafkaEventProducer, sendKafkaMessageMethodName);
      const context = _createContext(MessageEventType.LoadWhiteboardData);
      delete context['tenantId']; // tenantId is required in the MessageContextDTO

      expect(webSocketGateway.onLoadWhiteboardDataEvent({ context: context, body: {} })).rejects.toThrow(
        InternalServerErrorException
      );
      expect(producerMock).toBeCalledTimes(0);
    });
  });

  describe('onWhiteboardNodeAddedEvent', () => {
    it('should forward WHITEBOARD_NODE_ADDED events to the correct target topic', async () => {
      const producerMock = jest.spyOn(mockKafkaEventProducer, sendKafkaMessageMethodName);
      const testMessage = { context: _createContext(MessageEventType.WhiteboardNodeAdded), body: testMessageBody };

      await webSocketGateway.onWhiteboardNodeAddedEvent(testMessage);

      expect(producerMock).toBeCalledTimes(1);
      expect(producerMock).toBeCalledWith(testMessage);
    });

    it('should throw an InternalServerErrorException if the message context validation fails', async () => {
      const producerMock = jest.spyOn(mockKafkaEventProducer, sendKafkaMessageMethodName);
      const context = _createContext(MessageEventType.WhiteboardNodeAdded);
      delete context['tenantId']; // tenantId is required in the MessageContextDTO

      expect(webSocketGateway.onWhiteboardNodeAddedEvent({ context: context, body: {} })).rejects.toThrow(
        InternalServerErrorException
      );
      expect(producerMock).toBeCalledTimes(0);
    });
  });

  describe('onWhiteboardNodeDeletedEvent', () => {
    it('should forward WHITEBOARD_NODE_DELETED events to the correct target topic', async () => {
      const producerMock = jest.spyOn(mockKafkaEventProducer, sendKafkaMessageMethodName);
      const testMessage = { context: _createContext(MessageEventType.WhiteboardNodeDeleted), body: testMessageBody };

      await webSocketGateway.onWhiteboardNodeDeletedEvent(testMessage);

      expect(producerMock).toBeCalledTimes(1);
      expect(producerMock).toBeCalledWith(testMessage);
    });

    it('should throw an InternalServerErrorException if the message context validation fails', async () => {
      const producerMock = jest.spyOn(mockKafkaEventProducer, sendKafkaMessageMethodName);
      const context = _createContext(MessageEventType.WhiteboardNodeDeleted);
      delete context['tenantId']; // tenantId is required in the MessageContextDTO

      expect(webSocketGateway.onWhiteboardNodeDeletedEvent({ context: context, body: {} })).rejects.toThrow(
        InternalServerErrorException
      );
      expect(producerMock).toBeCalledTimes(0);
    });
  });

  describe('onWhiteboardNodePropertiesUpdatedEvent', () => {
    it('should forward WHITEBOARD_NODE_TITLE_UPDATED events to the correct target topic', async () => {
      const producerMock = jest.spyOn(mockKafkaEventProducer, sendKafkaMessageMethodName);
      const testMessage = {
        context: _createContext(MessageEventType.WhiteboardNodePropertiesUpdated),
        body: testMessageBody,
      };

      await webSocketGateway.onWhiteboardNodePropertiesUpdated(testMessage);

      expect(producerMock).toBeCalledTimes(1);
      expect(producerMock).toBeCalledWith(testMessage);
    });

    it('should throw an InternalServerErrorException if the message context validation fails', async () => {
      const producerMock = jest.spyOn(mockKafkaEventProducer, sendKafkaMessageMethodName);
      const context = _createContext(MessageEventType.WhiteboardNodePropertiesUpdated);
      delete context['tenantId']; // tenantId is required in the MessageContextDTO

      expect(webSocketGateway.onWhiteboardNodePropertiesUpdated({ context: context, body: {} })).rejects.toThrow(
        InternalServerErrorException
      );
      expect(producerMock).toBeCalledTimes(0);
    });
  });

  describe('onWhiteboardTitleUpdatedEvent', () => {
    it('should forward WHITEBOARD_TITLE_UPDATED events to the correct target topic', async () => {
      const producerMock = jest.spyOn(mockKafkaEventProducer, sendKafkaMessageMethodName);
      const testMessage = { context: _createContext(MessageEventType.WhiteboardTitleUpdated), body: 'new title' };

      await webSocketGateway.onWhiteboardTitleUpdated(testMessage);

      expect(producerMock).toBeCalledTimes(1);
      expect(producerMock).toBeCalledWith(testMessage);
    });

    it('should throw an InternalServerErrorException if the message context validation fails', async () => {
      const producerMock = jest.spyOn(mockKafkaEventProducer, sendKafkaMessageMethodName);
      const context = _createContext(MessageEventType.WhiteboardTitleUpdated);
      delete context['tenantId']; // tenantId is required in the MessageContextDTO

      expect(webSocketGateway.onWhiteboardTitleUpdated({ context: context, body: '' })).rejects.toThrow(
        InternalServerErrorException
      );
      expect(producerMock).toBeCalledTimes(0);
    });
  });

  describe('OnQueryTableEvent', () => {
    it('should forward QUERY_TABLE events to the correct target topic', async () => {
      const producerMock = jest.spyOn(mockKafkaEventProducer, sendKafkaMessageMethodName);
      const testMessage = { context: _createContext(MessageEventType.QueryTable), body: testMessageBody };

      await webSocketGateway.onQueryTableEvent(testMessage);

      expect(producerMock).toBeCalledTimes(1);
      expect(producerMock).toBeCalledWith(testMessage);
    });

    it('should throw an InternalServerErrorException if the message context validation fails', async () => {
      const producerMock = jest.spyOn(mockKafkaEventProducer, sendKafkaMessageMethodName);
      const context = _createContext(MessageEventType.QueryTable);
      delete context['tenantId']; // tenantId is required in the MessageContextDTO

      expect(webSocketGateway.onQueryTableEvent({ context: context, body: {} })).rejects.toThrow(
        InternalServerErrorException
      );
      expect(producerMock).toBeCalledTimes(0);
    });
  });

  describe('saveActiveCasefiles', () => {
    it('should correctly forward SAVE_WHITEBOARD events for each active casefile', async () => {
      const producerMock = jest.spyOn(mockKafkaEventProducer, sendKafkaMessageMethodName);
      const context1 = _createContext(MessageEventType.SaveWhiteboard);
      const context2 = _createContext(MessageEventType.SaveWhiteboard);
      const context3 = _createContext(MessageEventType.SaveWhiteboard);
      await _createWebSocketClient(context1);
      await _createWebSocketClient(context2);
      await _createWebSocketClient(context3);

      webSocketGateway.saveActiveCasefiles();

      expect(producerMock).toBeCalledTimes(3);
    });
  });

  describe('sendMessageByContext', () => {
    const context1 = _createContext(MessageEventType.QueryTable);
    const context2 = _createContext(MessageEventType.QueryTable);
    const context3 = _createContext(MessageEventType.QueryTable);

    it('should only broadcast messages to clients with matching context', async () => {
      const client1 = await _createWebSocketClient(context1);
      const client1Spy = jest.spyOn(client1, 'send').mockImplementation();

      const client2 = await _createWebSocketClient(context2);
      const client2Spy = jest.spyOn(client2, 'send').mockImplementation();

      const client3 = await _createWebSocketClient(context2);
      const client3Spy = jest.spyOn(client3, 'send').mockImplementation();

      const client4 = await _createWebSocketClient(context2);
      const client4Spy = jest.spyOn(client4, 'send').mockImplementation();

      const client5 = await _createWebSocketClient(context3);
      const client5Spy = jest.spyOn(client5, 'send').mockImplementation();

      const testMessage = {
        context: context2,
        body: testMessageBody,
      };

      webSocketGateway.sendMessageByContext(testMessage, broadcastWebSocketContext);

      expect(client1Spy).toBeCalledTimes(0);
      expect(client2Spy).toBeCalledTimes(1);
      expect(client3Spy).toBeCalledTimes(1);
      expect(client4Spy).toBeCalledTimes(1);
      expect(client5Spy).toBeCalledTimes(0);

      const expectedMessage = JSON.stringify({ event: testEventType, data: testMessage });
      expect(client2Spy).toBeCalledWith(expectedMessage);
      expect(client3Spy).toBeCalledWith(expectedMessage);
      expect(client4Spy).toBeCalledWith(expectedMessage);
    });

    it('should only unicast messages to single clients with matching context', async () => {
      const client1Context = { ...context1, userId: 'user1', userRole: UserRole.BASIC };
      const client1 = await _createWebSocketClient(client1Context);
      const client1Spy = jest.spyOn(client1, 'send').mockImplementation();

      const client2Context = { ...context1, userId: 'user2', userRole: UserRole.ADMIN };
      const client2 = await _createWebSocketClient(client2Context);
      const client2Spy = jest.spyOn(client2, 'send').mockImplementation();

      const client3Context = { ...context2, userId: 'user3', userRole: UserRole.BASIC };
      const client3 = await _createWebSocketClient(client3Context);
      const client3Spy = jest.spyOn(client3, 'send').mockImplementation();

      const client4Context = { ...context2, userId: 'user4', userRole: UserRole.BASIC };
      const client4 = await _createWebSocketClient(client4Context);
      const client4Spy = jest.spyOn(client4, 'send').mockImplementation();

      const client5Context = { ...context2, userId: 'user4', userRole: UserRole.ADMIN };
      const client5 = await _createWebSocketClient(client5Context);
      const client5Spy = jest.spyOn(client5, 'send').mockImplementation();

      const testMessage = {
        context: { ...context2, userId: 'user4', userRole: UserRole.BASIC },
        body: testMessageBody,
      };

      webSocketGateway.sendMessageByContext(testMessage, unicastWebSocketContext);

      expect(client1Spy).toBeCalledTimes(0);
      expect(client2Spy).toBeCalledTimes(0);
      expect(client3Spy).toBeCalledTimes(0);
      expect(client4Spy).toBeCalledTimes(1);
      expect(client5Spy).toBeCalledTimes(0);

      expect(client4Spy).toBeCalledWith(JSON.stringify({ event: testEventType, data: testMessage }));
    });

    it('should throw an InternalErrorException when no context could be retrieved from a client connection', async () => {
      const loggerSpy = jest.spyOn(Logger.prototype, 'error');
      const client = await _createWebSocketClient(context1);
      client._socket.context = undefined;

      const testMessage = {
        context: context1,
        body: testMessageBody,
      };

      expect(() => webSocketGateway.sendMessageByContext(testMessage, unicastWebSocketContext)).toThrow(
        InternalServerErrorException
      );

      expect(loggerSpy).toBeCalledTimes(1);
      expect(loggerSpy).toBeCalledWith(
        `${buildLogContext(testMessage.context)} Cannot route message, websocket client is missing its context`
      );
    });
  });

  async function _createWebSocketClient(clientContext: WebSocketClientContext): Promise<IWebSocketClient> {
    const client = new WebSocket(webSocketUrl) as IWebSocketClient;
    client._socket = { context: clientContext };
    webSocketGateway.server.clients.add(client);
    await (webSocketGateway.server as any).connected;
    return client;
  }

  function _createContext(eventType: MessageEventType): IMessageContext {
    return {
      tenantId: uuidv4(),
      casefileId: uuidv4(),
      nodeId: uuidv4(),
      userId: uuidv4(),
      userRole: UserRole.BASIC,
      eventType: eventType,
      timestamp: 123,
    };
  }
});
