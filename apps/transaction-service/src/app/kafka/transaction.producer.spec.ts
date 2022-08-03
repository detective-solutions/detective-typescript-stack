import { ClientKafka } from '@nestjs/microservices';
import { Test } from '@nestjs/testing';
import { TransactionProducer } from './transaction.producer';
import { kafkaClientInjectionToken } from '../utils';
import { v4 as uuidv4 } from 'uuid';

describe('TransactionProducer', () => {
  let transactionProducer: TransactionProducer;
  let client: ClientKafka;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        TransactionProducer,
        {
          provide: kafkaClientInjectionToken,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    transactionProducer = moduleRef.get<TransactionProducer>(TransactionProducer);
    client = moduleRef.get<ClientKafka>(kafkaClientInjectionToken);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(transactionProducer).toBeDefined();
  });

  describe('sendKafkaMessage', () => {
    it('should correctly forward the topic name and message payload to the client emit method', () => {
      const testTopicName = 'testTopic';
      const testMessage = {
        context: {
          tenantId: uuidv4(),
          casefileId: uuidv4(),
          eventType: 'testEvent',
          nodeId: uuidv4(),
          userId: uuidv4(),
          userRole: 'admin',
          timestamp: 123,
        },
        body: { test: '123' },
      };
      const emitSpy = jest.spyOn(client, 'emit');

      transactionProducer.sendKafkaMessage(testTopicName, testMessage);

      expect(emitSpy).toBeCalledTimes(1);
      expect(emitSpy).toBeCalledWith(testTopicName, testMessage);
    });
  });
});
