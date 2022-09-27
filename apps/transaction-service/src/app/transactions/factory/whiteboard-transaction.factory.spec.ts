import { CacheService, DatabaseService, TransactionCoordinationService } from '../../services';
import { MessageEventType, UserRole } from '@detective.solutions/shared/data-access';

import { InternalServerErrorException } from '@nestjs/common';
import { LoadWhiteboardDataTransaction } from '../load-whiteboard-data.transaction';
import { Test } from '@nestjs/testing';
import { TransactionEventProducer } from '../../events';
import { WhiteboardTransactionFactory } from './whiteboard-transaction.factory';

/* eslint-disable @typescript-eslint/no-explicit-any */

describe('TransactionCoordinationService', () => {
  let whiteboardTransactionFactory: WhiteboardTransactionFactory;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [
        WhiteboardTransactionFactory,
        { provide: TransactionEventProducer, useValue: jest.fn() },
        { provide: CacheService, useValue: jest.fn() },
        { provide: DatabaseService, useValue: jest.fn() },
      ],
    }).compile();

    whiteboardTransactionFactory = app.get<WhiteboardTransactionFactory>(WhiteboardTransactionFactory);

    // Disable logger for test runs
    whiteboardTransactionFactory.logger.localInstance.setLogLevels([]);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(whiteboardTransactionFactory).toBeDefined();
  });

  describe('createTransaction', () => {
    const testMessagePayload = {
      context: {
        eventType: MessageEventType.LoadWhiteboardData,
        tenantId: 'tenantId',
        casefileId: 'casefileId',
        userId: 'userId',
        userRole: UserRole.BASIC,
        nodeId: 'nodeId',
        timestamp: 123456,
      },
      body: {},
    };
    const transactionSpy = jest.spyOn(LoadWhiteboardDataTransaction.prototype as any, 'execute').mockImplementation();

    it('should correctly create a new transaction instance if the given event type is part of the transaction map', () => {
      const transaction = whiteboardTransactionFactory.createTransaction(
        MessageEventType.LoadWhiteboardData,
        testMessagePayload
      );

      expect(transaction).toBeInstanceOf(LoadWhiteboardDataTransaction);
      expect(transactionSpy).toBeCalledTimes(1);
    });

    it('should throw an InternalServerErrorException if the given event key is not part of the transaction map', () => {
      expect(() => whiteboardTransactionFactory.createTransaction(undefined, testMessagePayload)).toThrow(
        InternalServerErrorException
      );
      expect(transactionSpy).toBeCalledTimes(0);
    });
  });
});
