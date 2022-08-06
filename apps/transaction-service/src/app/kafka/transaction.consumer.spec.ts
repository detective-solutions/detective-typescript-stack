import { IKafkaMessage, MessageEventType, UserRole } from '@detective.solutions/shared/data-access';

import { BadRequestException } from '@nestjs/common';
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

      transactionConsumer.consumeTransactionInput(testKafkaMessage);

      expect(coordinationServiceSpy).toBeCalledTimes(1);
      expect(coordinationServiceSpy).toBeCalledWith(testKafkaMessage.value.context.eventType, testKafkaMessage.value);
    });

    it('should thrown a BadRequestException if a consumed message is missing its context information', () => {
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

      expect(() => transactionConsumer.consumeTransactionInput(testKafkaMessage)).toThrow(BadRequestException);
      expect(coordinationServiceSpy).toBeCalledTimes(0);
    });

    it('should thrown a BadRequestException if a consumed message is missing an event type', () => {
      const testKafkaMessage: IKafkaMessage = {
        timestamp: '123456',
        offset: '212',
        key: 'testKey',
        value: {
          context: {
            eventType: undefined,
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

      expect(() => transactionConsumer.consumeTransactionInput(testKafkaMessage)).toThrow(BadRequestException);
      expect(coordinationServiceSpy).toBeCalledTimes(0);
    });
  });
});
