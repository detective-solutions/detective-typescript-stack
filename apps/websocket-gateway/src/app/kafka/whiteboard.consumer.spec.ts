import { IKafkaMessage, MessageEventType } from '@detective.solutions/shared/data-access';

import { Test } from '@nestjs/testing';
import { WhiteboardConsumer } from './whiteboard.consumer';
import { WhiteboardWebSocketGateway } from '../websocket/whiteboard-websocket.gateway';
import { broadcastWebSocketContext } from '../utils';

const mockWebSocketGateway = {
  sendMessageByContext: jest.fn(),
};

describe('WhiteboardConsumer', () => {
  let whiteboardConsumer: WhiteboardConsumer;
  let webSocketGateway: WhiteboardWebSocketGateway;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [WhiteboardConsumer],
      providers: [{ provide: WhiteboardWebSocketGateway, useValue: mockWebSocketGateway }],
    }).compile();

    whiteboardConsumer = moduleRef.get<WhiteboardConsumer>(WhiteboardConsumer);
    webSocketGateway = moduleRef.get<WhiteboardWebSocketGateway>(WhiteboardWebSocketGateway);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(whiteboardConsumer).toBeDefined();
  });

  describe('forwardQueryExecution', () => {
    it('should correctly forward the value property of an incoming Kafka message', async () => {
      const testKafkaMessage: IKafkaMessage = {
        timestamp: '123456',
        offset: '212',
        key: 'testKey',
        value: {
          context: {
            eventType: MessageEventType.QueryTable,
            tenantId: 'tenantId',
            casefileId: 'casefileId',
            userId: 'userId',
            userRole: 'admin',
            nodeId: 'nodeId',
            timestamp: 123456,
          },
          body: {},
        },
        headers: {},
        topic: 'testTopic',
      };

      const broadcastSpy = jest.spyOn(webSocketGateway, 'sendMessageByContext');

      expect(whiteboardConsumer.forwardQueryExecution(testKafkaMessage));

      expect(broadcastSpy).toBeCalledTimes(1);
      expect(broadcastSpy).toBeCalledWith(testKafkaMessage.value, broadcastWebSocketContext);
    });
  });
});
