import { EventTypeTopicMapping, IWebSocketClient, WebSocketClientContext } from '../models';
import { InternalServerErrorException, Logger } from '@nestjs/common';
import { broadcastWebSocketContext, unicastWebSocketContext } from '../utils';

import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { WS } from 'jest-websocket-mock';
import { WebSocket } from 'ws';
import { WhiteboardProducer } from '../kafka/whiteboard.producer';
import { WhiteboardWebSocketGateway } from './whiteboard-websocket.gateway';
import { buildLogContext } from '@detective.solutions/backend/shared/utils';
import { v4 as uuidv4 } from 'uuid';

const mockWhiteboardProducer = {
  sendKafkaMessage: jest.fn(),
};

const mockJwtService = {};

describe('WhiteboardWebsocketGateway', () => {
  const webSocketUrl = 'ws://localhost:1234';
  const testEventType = 'TEST_EVENT';
  const testMessageBody = { test: 'test' };

  const context1 = {
    tenantId: uuidv4(),
    casefileId: uuidv4(),
    nodeId: uuidv4(),
    userId: uuidv4(),
    userRole: 'basic',
    eventType: testEventType,
    timestamp: 123,
  };
  const context2 = {
    tenantId: uuidv4(),
    casefileId: uuidv4(),
    nodeId: uuidv4(),
    userId: uuidv4(),
    userRole: 'basic',
    eventType: testEventType,
    timestamp: 123,
  };
  const context3 = {
    tenantId: uuidv4(),
    casefileId: uuidv4(),
    nodeId: uuidv4(),
    userId: uuidv4(),
    userRole: 'basic',
    eventType: testEventType,
    timestamp: 123,
  };

  let webSocketGateway: WhiteboardWebSocketGateway;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        WhiteboardWebSocketGateway,
        { provide: WhiteboardProducer, useValue: mockWhiteboardProducer },
        { provide: JwtService, useValue: mockJwtService },
        ConfigService,
      ],
    }).compile();

    webSocketGateway = moduleRef.get<WhiteboardWebSocketGateway>(WhiteboardWebSocketGateway);
    webSocketGateway.server = new WS(webSocketUrl) as any;
    webSocketGateway.server.clients = new Set();
  });

  afterEach(() => {
    webSocketGateway.server.close();
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(webSocketGateway).toBeDefined();
  });

  describe('OnQueryTableEvent', () => {
    it('should forward QUERY_TABLE events to the correct target topic', () => {
      const producerMock = jest.spyOn(mockWhiteboardProducer, 'sendKafkaMessage');
      const testMessage = { context: context1, body: { test: 'test' } };

      webSocketGateway.onQueryTableEvent(testMessage);

      expect(producerMock).toBeCalledTimes(1);
      expect(producerMock).toBeCalledWith(EventTypeTopicMapping.queryTable.targetTopic, testMessage);
    });

    it('should merge the eventType into the message context', () => {
      const producerMock = jest.spyOn(mockWhiteboardProducer, 'sendKafkaMessage');
      const context = context1;
      delete context['eventType'];

      expect(context).not.toHaveProperty('eventType');

      webSocketGateway.onQueryTableEvent({ context: context, body: {} });

      expect(producerMock).toBeCalledWith(EventTypeTopicMapping.queryTable.targetTopic, {
        context: { eventType: EventTypeTopicMapping.queryTable.eventType, ...context },
        body: {},
      });
    });
  });

  describe('sendMessageByContext', () => {
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
      const client1Context = { ...context1, userId: 'user1', userRole: 'basic' };
      const client1 = await _createWebSocketClient(client1Context);
      const client1Spy = jest.spyOn(client1, 'send').mockImplementation();

      const client2Context = { ...context1, userId: 'user2', userRole: 'admin' };
      const client2 = await _createWebSocketClient(client2Context);
      const client2Spy = jest.spyOn(client2, 'send').mockImplementation();

      const client3Context = { ...context2, userId: 'user3', userRole: 'basic' };
      const client3 = await _createWebSocketClient(client3Context);
      const client3Spy = jest.spyOn(client3, 'send').mockImplementation();

      const client4Context = { ...context2, userId: 'user4', userRole: 'basic' };
      const client4 = await _createWebSocketClient(client4Context);
      const client4Spy = jest.spyOn(client4, 'send').mockImplementation();

      const client5Context = { ...context2, userId: 'user4', userRole: 'admin' };
      const client5 = await _createWebSocketClient(client5Context);
      const client5Spy = jest.spyOn(client5, 'send').mockImplementation();

      const testMessage = {
        context: { ...context2, userId: 'user4', userRole: 'basic' },
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
});
