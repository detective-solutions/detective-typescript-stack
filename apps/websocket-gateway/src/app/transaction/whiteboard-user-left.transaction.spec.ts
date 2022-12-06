import { CacheService, DatabaseService } from '../services';
import { MessageEventType, UserRole } from '@detective.solutions/shared/data-access';

import { InternalServerErrorException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { WhiteboardEventProducer } from '../events';
import { WhiteboardUserLeftTransaction } from './whiteboard-user-left.transaction';
import { v4 as uuidv4 } from 'uuid';

const sendKafkaMessageMethodName = 'sendKafkaMessage';
const transactionEventProducerMock = {
  [sendKafkaMessageMethodName]: jest.fn(),
};

const removeActiveWhiteboardUserMethodName = 'removeActiveUser';
const cacheServiceMock = {
  [removeActiveWhiteboardUserMethodName]: jest.fn(),
};

const testMessageContext = {
  eventType: MessageEventType.WhiteboardUserLeft,
  tenantId: uuidv4(),
  casefileId: uuidv4(),
  userId: uuidv4(),
  userRole: UserRole.BASIC,
  nodeId: uuidv4(),
  timestamp: 123456,
};

const testMessagePayload = {
  context: testMessageContext,
  body: null,
};

describe('WhiteboardUserLeftTransaction', () => {
  let whiteboardUserLeftTransaction: WhiteboardUserLeftTransaction;
  let transactionEventProducer: WhiteboardEventProducer;
  let cacheService: CacheService;
  let databaseService: DatabaseService;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [
        { provide: WhiteboardEventProducer, useValue: transactionEventProducerMock },
        { provide: CacheService, useValue: cacheServiceMock },
        { provide: DatabaseService, useValue: {} }, // Needs to be mocked due to required serviceRefs
      ],
    }).compile();

    transactionEventProducer = app.get<WhiteboardEventProducer>(WhiteboardEventProducer);
    cacheService = app.get<CacheService>(CacheService);
    databaseService = app.get<DatabaseService>(DatabaseService);
    whiteboardUserLeftTransaction = new WhiteboardUserLeftTransaction(
      {
        transactionEventProducer: transactionEventProducer,
        cacheService: cacheService,
        databaseService: databaseService,
      },
      testMessagePayload
    );

    // Disable logger for test runs
    whiteboardUserLeftTransaction.logger.localInstance.setLogLevels([]);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(whiteboardUserLeftTransaction).toBeDefined();
  });

  xdescribe('execute', () => {
    it('should correctly load casefile data from database if no cache exists', async () => {
      const removeActiveWhiteboardUserSpy = jest.spyOn(cacheService, removeActiveWhiteboardUserMethodName);
      const sendKafkaMessageSpy = jest.spyOn(transactionEventProducer, sendKafkaMessageMethodName);

      await whiteboardUserLeftTransaction.execute();

      expect(removeActiveWhiteboardUserSpy).toBeCalledTimes(1);
      expect(removeActiveWhiteboardUserSpy).toBeCalledWith(testMessageContext.casefileId, testMessageContext.userId);

      expect(sendKafkaMessageSpy).toBeCalledTimes(1);
      expect(sendKafkaMessageSpy).toHaveBeenLastCalledWith(
        whiteboardUserLeftTransaction.targetTopic,
        testMessagePayload
      );
    });

    it('should throw an InternalServerException if any error occurs during the transaction', async () => {
      jest.spyOn(cacheService, removeActiveWhiteboardUserMethodName).mockImplementation(() => {
        throw new Error();
      });

      await expect(whiteboardUserLeftTransaction.execute()).rejects.toThrow(InternalServerErrorException);
    });
  });
});
