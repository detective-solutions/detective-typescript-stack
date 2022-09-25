import { MessageEventType, UserRole } from '@detective.solutions/shared/data-access';

import { ClientKafka } from '@nestjs/microservices';
import { Test } from '@nestjs/testing';
import { TransactionEventProducer } from './transaction-event.producer';
import { kafkaClientInjectionToken } from '../utils';
import { v4 as uuidv4 } from 'uuid';

describe('TransactionEventProducer', () => {
  let transactionEventProducer: TransactionEventProducer;
  let client: ClientKafka;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        TransactionEventProducer,
        {
          provide: kafkaClientInjectionToken,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    transactionEventProducer = moduleRef.get<TransactionEventProducer>(TransactionEventProducer);
    client = moduleRef.get<ClientKafka>(kafkaClientInjectionToken);

    // Disable logger for test runs
    transactionEventProducer.logger.localInstance.setLogLevels([]);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(transactionEventProducer).toBeDefined();
  });

  describe('sendKafkaMessage', () => {
    it('should correctly forward the topic name and message payload to the client emit method', () => {
      const testTopicName = 'testTopic';
      const testPayload = {
        context: {
          tenantId: uuidv4(),
          casefileId: uuidv4(),
          eventType: MessageEventType.LoadWhiteboardData,
          nodeId: uuidv4(),
          userId: uuidv4(),
          userRole: UserRole.ADMIN,
          timestamp: 123,
        },
        body: { test: '123' },
      };
      const emitSpy = jest.spyOn(client, 'emit');

      transactionEventProducer.sendKafkaMessage(testTopicName, testPayload);

      expect(emitSpy).toBeCalledTimes(1);
      expect(emitSpy).toBeCalledWith(testTopicName, testPayload);
    });
  });
});
