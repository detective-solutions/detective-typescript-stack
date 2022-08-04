import { IKafkaMessage, MessageEventType } from '@detective.solutions/shared/data-access';

import { EventCoordinatorService } from '../services';
import { Test } from '@nestjs/testing';
import { TransactionConsumer } from './transaction.consumer';

const mockEventCoordinatorService = {
  handleTransactionByType: jest.fn(),
};

describe('TransactionConsumer', () => {
  let transactionConsumer: TransactionConsumer;
  let eventCoordinatorService: EventCoordinatorService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TransactionConsumer],
      providers: [{ provide: EventCoordinatorService, useValue: mockEventCoordinatorService }],
    }).compile();

    transactionConsumer = moduleRef.get<TransactionConsumer>(TransactionConsumer);
    eventCoordinatorService = moduleRef.get<EventCoordinatorService>(EventCoordinatorService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(transactionConsumer).toBeDefined();
  });

  describe('consumeTransaction', () => {
    it('should correctly forward the value property of an incoming Kafka message', () => {
      const testKafkaMessage: IKafkaMessage = {
        timestamp: '123456',
        offset: '212',
        key: 'testKey',
        value: {
          context: {
            eventType: MessageEventType.LoadWhiteboardData,
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
      const eventCoordinatorSpy = jest.spyOn(eventCoordinatorService, 'handleTransactionByType');

      transactionConsumer.consumeTransaction(testKafkaMessage);

      expect(eventCoordinatorSpy).toBeCalledTimes(1);
      expect(eventCoordinatorSpy).toBeCalledWith(testKafkaMessage.value.context.eventType, testKafkaMessage.value);
    });
  });
});
