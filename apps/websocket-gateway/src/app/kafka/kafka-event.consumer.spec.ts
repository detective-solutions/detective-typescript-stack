import { IKafkaMessage, MessageEventType, UserRole } from '@detective.solutions/shared/data-access';

import { KafkaEventConsumer } from './kafka-event.consumer';
import { Test } from '@nestjs/testing';
import { WhiteboardWebSocketGateway } from '../websocket/whiteboard-websocket.gateway';

const mockWebSocketGateway = {
  sendPropagatedBroadcastMessage: jest.fn(),
};

describe('KafkaEventConsumer', () => {
  let whiteboardEventConsumer: KafkaEventConsumer;
  let webSocketGateway: WhiteboardWebSocketGateway;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [KafkaEventConsumer],
      providers: [{ provide: WhiteboardWebSocketGateway, useValue: mockWebSocketGateway }],
    }).compile();

    whiteboardEventConsumer = moduleRef.get<KafkaEventConsumer>(KafkaEventConsumer);
    webSocketGateway = moduleRef.get<WhiteboardWebSocketGateway>(WhiteboardWebSocketGateway);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(whiteboardEventConsumer).toBeDefined();
  });

  describe('forwardQueryExecution', () => {
    it('should correctly forward the value property of an incoming Kafka message', () => {
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
            userRole: UserRole.ADMIN,
            nodeId: 'nodeId',
            timestamp: 123456,
          },
          body: {},
        },
        headers: {},
        topic: 'testTopic',
      };
      const broadcastSpy = jest.spyOn(webSocketGateway, 'sendPropagatedBroadcastMessage');

      whiteboardEventConsumer.forwardQueryExecution(testKafkaMessage);

      expect(broadcastSpy).toBeCalledTimes(1);
      expect(broadcastSpy).toBeCalledWith(testKafkaMessage.value);
    });
  });
});
