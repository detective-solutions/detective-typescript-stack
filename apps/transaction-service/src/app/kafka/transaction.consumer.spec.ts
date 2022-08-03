import { IKafkaMessage, MessageEventType } from '@detective.solutions/shared/data-access';

import { AppService } from '../services';
import { Test } from '@nestjs/testing';
import { TransactionConsumer } from './transaction.consumer';

const mockAppService = {
  setData: jest.fn(),
};

describe('TransactionConsumer', () => {
  let transactionConsumer: TransactionConsumer;
  let appService: AppService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TransactionConsumer],
      providers: [{ provide: AppService, useValue: mockAppService }],
    }).compile();

    transactionConsumer = moduleRef.get<TransactionConsumer>(TransactionConsumer);
    appService = moduleRef.get<AppService>(AppService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(transactionConsumer).toBeDefined();
  });

  describe('forwardTransaction', () => {
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
            userRole: 'admin',
            nodeId: 'nodeId',
            timestamp: 123456,
          },
          body: {},
        },
        headers: {},
        topic: 'testTopic',
      };
      const appServiceSpy = jest.spyOn(appService, 'setData');

      transactionConsumer.forwardTransaction(testKafkaMessage);

      expect(appServiceSpy).toBeCalledTimes(1);
      expect(appServiceSpy).toBeCalledWith(testKafkaMessage.value);
    });
  });
});
