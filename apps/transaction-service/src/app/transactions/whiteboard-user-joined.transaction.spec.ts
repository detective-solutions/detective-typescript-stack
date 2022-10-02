import { CacheService, DatabaseService } from '../services';
import {
  ICachableCasefileForWhiteboard,
  IUserForWhiteboard,
  MessageEventType,
  UserRole,
} from '@detective.solutions/shared/data-access';

import { InternalServerErrorException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TransactionEventProducer } from '../events';
import { WhiteboardUserJoinedTransaction } from './whiteboard-user-joined.transaction';
import { v4 as uuidv4 } from 'uuid';

const sendKafkaMessageMethodName = 'sendKafkaMessage';
const transactionEventProducerMock = {
  [sendKafkaMessageMethodName]: jest.fn(),
};

const getCachedCasefileByIdMethodName = 'getCasefileById';
const saveCasefileToCacheMethodName = 'saveCasefile';
const addActiveWhiteboardUserMethodName = 'addActiveUser';
const cacheServiceMock = {
  [getCachedCasefileByIdMethodName]: jest.fn(),
  [saveCasefileToCacheMethodName]: jest.fn(),
  [addActiveWhiteboardUserMethodName]: jest.fn(),
};

const getCasefileByIdMethodName = 'getCachableCasefileById';
const databaseServiceMock = {
  [getCasefileByIdMethodName]: jest.fn(),
};

const testMessagePayload = {
  context: {
    eventType: MessageEventType.LoadWhiteboardData,
    tenantId: uuidv4(),
    casefileId: uuidv4(),
    userId: uuidv4(),
    userRole: UserRole.BASIC,
    nodeId: 'nodeId',
    timestamp: 123456,
  },
  body: undefined,
};

describe('WhiteboardUserJoinedTransaction', () => {
  let whiteboardUserJoinedTransaction: WhiteboardUserJoinedTransaction;
  let transactionEventProducer: TransactionEventProducer;
  let cacheService: CacheService;
  let databaseService: DatabaseService;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [
        { provide: TransactionEventProducer, useValue: transactionEventProducerMock },
        { provide: CacheService, useValue: cacheServiceMock },
        { provide: DatabaseService, useValue: databaseServiceMock },
      ],
    }).compile();

    transactionEventProducer = app.get<TransactionEventProducer>(TransactionEventProducer);
    cacheService = app.get<CacheService>(CacheService);
    databaseService = app.get<DatabaseService>(DatabaseService);
    whiteboardUserJoinedTransaction = new WhiteboardUserJoinedTransaction(
      {
        transactionEventProducer: transactionEventProducer,
        cacheService: cacheService,
        databaseService: databaseService,
      },
      testMessagePayload
    );

    // Disable logger for test runs
    whiteboardUserJoinedTransaction.logger.localInstance.setLogLevels([]);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(whiteboardUserJoinedTransaction).toBeDefined();
  });

  xdescribe('execute', () => {
    const getCasefileByIdResponse: ICachableCasefileForWhiteboard = {
      id: uuidv4(),
      title: 'testCasefile',
      nodes: [],
      temporary: { activeUsers: [] },
    };
    const testUserForWhiteboard: IUserForWhiteboard = {
      id: testMessagePayload.context.userId,
      email: 'test@test.com',
      firstname: 'John',
      lastname: 'Doe',
      title: 'Data Scientist',
      avatarUrl: 'http://localhost/testImage',
    };

    it('should correctly load casefile data from database if no cache exists', async () => {
      const getCachedCasefileByIdCacheSpy = jest
        .spyOn(cacheService, getCachedCasefileByIdMethodName)
        .mockResolvedValue(undefined);
      const getDatabaseCasefileByIdSpy = jest
        .spyOn(databaseService, getCasefileByIdMethodName)
        .mockResolvedValue(getCasefileByIdResponse);
      const saveCasefileToCacheSpy = jest.spyOn(cacheService, saveCasefileToCacheMethodName).mockResolvedValue('OK');
      const addActiveWhiteboardUserSpy = jest
        .spyOn(cacheService, addActiveWhiteboardUserMethodName)
        .mockResolvedValue(testUserForWhiteboard);
      const sendKafkaMessageSpy = jest.spyOn(transactionEventProducer, sendKafkaMessageMethodName);

      await whiteboardUserJoinedTransaction.execute();

      const modifiedPayload = { ...testMessagePayload };
      modifiedPayload.body = getCasefileByIdResponse;

      expect(getCachedCasefileByIdCacheSpy).toBeCalledTimes(1);
      expect(getCachedCasefileByIdCacheSpy).toBeCalledWith(testMessagePayload.context.casefileId);
      expect(getDatabaseCasefileByIdSpy).toBeCalledTimes(1);
      expect(getDatabaseCasefileByIdSpy).toBeCalledWith(testMessagePayload.context.casefileId);
      expect(saveCasefileToCacheSpy).toHaveBeenCalledTimes(1);
      expect(saveCasefileToCacheSpy).toBeCalledWith(getCasefileByIdResponse);
      expect(addActiveWhiteboardUserSpy).toBeCalledTimes(1);
      expect(addActiveWhiteboardUserSpy).toBeCalledWith(
        testMessagePayload.context.userId,
        testMessagePayload.context.casefileId
      );
      expect(sendKafkaMessageSpy).toBeCalledTimes(2);
      expect(sendKafkaMessageSpy).toBeCalledWith(whiteboardUserJoinedTransaction.targetTopic, {
        context: testMessagePayload.context,
        body: getCasefileByIdResponse,
      });
      expect(sendKafkaMessageSpy).toHaveBeenLastCalledWith(whiteboardUserJoinedTransaction.targetTopic, {
        context: testMessagePayload.context,
        body: testUserForWhiteboard,
      });
    });

    it('should correctly load casefile data from cache if it exists', async () => {
      const isCasefileCachedSpy = jest
        .spyOn(cacheService, getCachedCasefileByIdMethodName)
        .mockResolvedValue(getCasefileByIdResponse);
      const getCachedCasefileByIdSpy = jest
        .spyOn(cacheService, getCachedCasefileByIdMethodName)
        .mockResolvedValue(getCasefileByIdResponse);
      const getCasfileByIdSpy = jest.spyOn(databaseService, getCasefileByIdMethodName);
      const saveCasefileToCacheSpy = jest.spyOn(cacheService, saveCasefileToCacheMethodName);
      const sendKafkaMessageSpy = jest.spyOn(transactionEventProducer, sendKafkaMessageMethodName);

      await whiteboardUserJoinedTransaction.execute();

      const modifiedPayload = { ...testMessagePayload };
      modifiedPayload.body = getCasefileByIdResponse;

      expect(isCasefileCachedSpy).toHaveBeenCalledTimes(1);
      expect(getCachedCasefileByIdSpy).toHaveBeenCalledTimes(1);
      expect(getCachedCasefileByIdSpy).toBeCalledWith(testMessagePayload.context.casefileId);
      expect(getCasfileByIdSpy).toBeCalledTimes(0);
      expect(saveCasefileToCacheSpy).toBeCalledTimes(0);
      expect(sendKafkaMessageSpy).toBeCalledTimes(1);
      expect(sendKafkaMessageSpy).toBeCalledWith(whiteboardUserJoinedTransaction.targetTopic, modifiedPayload);
    });

    xit('should throw an InternalServerException if any error occurs during the transaction', async () => {
      jest.spyOn(cacheService, getCachedCasefileByIdMethodName).mockImplementation(() => {
        throw new Error();
      });

      await expect(whiteboardUserJoinedTransaction.execute()).rejects.toThrow(InternalServerErrorException);
    });
  });
});
