import { IKafkaMessage, MessageEventType, UserRole } from '@detective.solutions/shared/data-access';

import { InternalServerErrorException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TransactionConsumer } from './transaction.consumer';
import { TransactionCoordinationService } from '../services';
import { coordinationServiceInjectionToken } from '../utils';

const mockEventCoordinatorService = {
  createTransactionByEventType: jest.fn(),
};

describe('TransactionConsumer', () => {
  let transactionConsumer: TransactionConsumer;
  let coordinationService: TransactionCoordinationService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TransactionConsumer],
      providers: [{ provide: coordinationServiceInjectionToken, useValue: mockEventCoordinatorService }],
    }).compile();

    transactionConsumer = moduleRef.get<TransactionConsumer>(TransactionConsumer);
    coordinationService = moduleRef.get<TransactionCoordinationService>(coordinationServiceInjectionToken);

    // Disable logger for test runs
    transactionConsumer.logger.localInstance.setLogLevels([]);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(transactionConsumer).toBeDefined();
  });

  describe('consumeTransactionInput', () => {
    it('should correctly forward the value property of an incoming Kafka message', async () => {
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
            userRole: UserRole.ADMIN,
            nodeId: 'nodeId',
            timestamp: 123456,
          },
          body: {},
        },
        headers: {},
        topic: 'testTopic',
      };
      const coordinationServiceSpy = jest.spyOn(coordinationService, 'createTransactionByEventType');

      await transactionConsumer.consumeTransactionInput(testKafkaMessage);

      expect(coordinationServiceSpy).toBeCalledTimes(1);
      expect(coordinationServiceSpy).toBeCalledWith(testKafkaMessage.value.context.eventType, testKafkaMessage.value);
    });

    it('should thrown an InternalServerErrorException if a consumed message is missing its context information', async () => {
      const testKafkaMessage: IKafkaMessage = {
        timestamp: '123456',
        offset: '212',
        key: 'testKey',
        value: {
          context: undefined,
          body: {},
        },
        headers: {},
        topic: 'testTopic',
      };
      const coordinationServiceSpy = jest.spyOn(coordinationService, 'createTransactionByEventType');

      const consumeTransactionInputPromise = transactionConsumer.consumeTransactionInput(testKafkaMessage);
      await expect(consumeTransactionInputPromise).rejects.toThrow(InternalServerErrorException);
      expect(coordinationServiceSpy).toBeCalledTimes(0);
    });

    it('should thrown an InternalServerErrorException if the context of a consumed message does not pass validation', async () => {
      const testKafkaMessage: IKafkaMessage = {
        timestamp: '123456',
        offset: '212',
        key: 'testKey',
        value: {
          context: {
            eventType: undefined, // eventType is mandatory
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
      const coordinationServiceSpy = jest.spyOn(coordinationService, 'createTransactionByEventType');

      const consumeTransactionInputPromise = transactionConsumer.consumeTransactionInput(testKafkaMessage);
      await expect(consumeTransactionInputPromise).rejects.toThrow(InternalServerErrorException);
      expect(coordinationServiceSpy).toBeCalledTimes(0);
    });
  });
});
