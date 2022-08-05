import { IKafkaMessage, MessageEventType } from '@detective.solutions/shared/data-access';

import { Test } from '@nestjs/testing';
import { TransactionConsumer } from './transaction.consumer';
import { TransactionCoordinationService } from '../services';

const mockEventCoordinatorService = {
  handleTransactionByType: jest.fn(),
};

xdescribe('TransactionConsumer', () => {
  let transactionConsumer: TransactionConsumer;
  let eventCoordinatorService: TransactionCoordinationService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TransactionConsumer],
      providers: [{ provide: TransactionCoordinationService, useValue: mockEventCoordinatorService }],
    }).compile();

    transactionConsumer = moduleRef.get<TransactionConsumer>(TransactionConsumer);
    eventCoordinatorService = moduleRef.get<TransactionCoordinationService>(TransactionCoordinationService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(transactionConsumer).toBeDefined();
  });

  describe('consumeTransactionInput', () => {
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

      transactionConsumer.consumeTransactionInput(testKafkaMessage);

      expect(eventCoordinatorSpy).toBeCalledTimes(1);
      expect(eventCoordinatorSpy).toBeCalledWith(testKafkaMessage.value.context.eventType, testKafkaMessage.value);
    });
  });
});
