import { CacheService, DatabaseService } from '.';
import { MessageEventType, UserRole } from '@detective.solutions/shared/data-access';

import { InternalServerErrorException } from '@nestjs/common';
import { KafkaEventProducer } from '../kafka';
import { Test } from '@nestjs/testing';
import { WhiteboardTransactionFactory } from './whiteboard-transaction.factory';
import { WhiteboardUserJoinedTransaction } from '../transaction/whiteboard-user-joined.transaction';
import { WhiteboardWebSocketGateway } from '../websocket';

/* eslint-disable @typescript-eslint/no-explicit-any */

describe('TransactionCoordinationService', () => {
  let whiteboardTransactionFactory: WhiteboardTransactionFactory;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [
        WhiteboardTransactionFactory,
        { provide: CacheService, useValue: jest.fn() },
        { provide: DatabaseService, useValue: jest.fn() },
        { provide: WhiteboardWebSocketGateway, useValue: jest.fn() },
        { provide: KafkaEventProducer, useValue: jest.fn() },
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
        eventType: MessageEventType.WhiteboardUserJoined,
        tenantId: 'tenantId',
        casefileId: 'casefileId',
        userId: 'userId',
        userRole: UserRole.BASIC,
        nodeId: 'nodeId',
        timestamp: 123456,
      },
      body: {},
    };
    const transactionSpy = jest.spyOn(WhiteboardUserJoinedTransaction.prototype as any, 'execute').mockImplementation();

    it('should correctly create a new transaction instance if the given event type is part of the transaction map', () => {
      const transaction = whiteboardTransactionFactory.createTransactionByType(testMessagePayload);

      expect(transaction).toBeInstanceOf(WhiteboardUserJoinedTransaction);
      expect(transactionSpy).toBeCalledTimes(1);
    });

    it('should throw an InternalServerErrorException if the given event key is not part of the transaction map', () => {
      expect(() =>
        whiteboardTransactionFactory.createTransactionByType({
          ...testMessagePayload,
          context: { ...testMessagePayload.context, eventType: 'unknownEventType' as MessageEventType },
        })
      ).toThrow(InternalServerErrorException);
      expect(transactionSpy).toBeCalledTimes(0);
    });
  });
});
