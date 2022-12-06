import { MessageEventType, UserRole } from '@detective.solutions/shared/data-access';

import { ClientKafka } from '@nestjs/microservices';
import { KafkaEventProducer } from './kafka-event.producer';
import { Test } from '@nestjs/testing';
import { kafkaClientInjectionToken } from '../utils';
import { v4 as uuidv4 } from 'uuid';

describe('KafkaEventProducer', () => {
  let whiteboardProducer: KafkaEventProducer;
  let client: ClientKafka;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        KafkaEventProducer,
        {
          provide: kafkaClientInjectionToken,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    whiteboardProducer = moduleRef.get<KafkaEventProducer>(KafkaEventProducer);
    client = moduleRef.get<ClientKafka>(kafkaClientInjectionToken);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(whiteboardProducer).toBeDefined();
  });

  describe('sendKafkaMessage', () => {
    it('should correctly forward the topic name and message payload to the client emit method', () => {
      const testTopicName = 'testTopic';
      const testMessage = {
        context: {
          tenantId: uuidv4(),
          casefileId: uuidv4(),
          eventType: MessageEventType.QueryTable,
          nodeId: uuidv4(),
          userId: uuidv4(),
          userRole: UserRole.ADMIN,
          timestamp: 123,
        },
        body: { test: '123' },
      };
      const emitSpy = jest.spyOn(client, 'emit');

      whiteboardProducer.produceKafkaEvent(testTopicName, testMessage);

      expect(emitSpy).toBeCalledTimes(1);
      expect(emitSpy).toBeCalledWith(testTopicName, testMessage);
    });
  });
});
