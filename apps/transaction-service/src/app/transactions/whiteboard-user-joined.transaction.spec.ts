import { CacheService, DatabaseService } from '../services';
import {
  ICachableCasefileForWhiteboard,
  IUserForWhiteboard,
  KafkaTopic,
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

const testMessageContext = {
  eventType: MessageEventType.LoadWhiteboardData,
  tenantId: uuidv4(),
  casefileId: uuidv4(),
  userId: uuidv4(),
  userRole: UserRole.BASIC,
  nodeId: 'nodeId',
  timestamp: 123456,
};

const testMessagePayload = {
  context: testMessageContext,
  body: null,
};

const testUserForWhiteboard: IUserForWhiteboard = {
  id: testMessageContext.userId,
  email: 'test@test.com',
  firstname: 'John',
  lastname: 'Doe',
  title: 'Data Scientist',
  avatarUrl: 'http://localhost/testImage',
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

  describe('execute', () => {
    it('should correctly load casefile data from database if no cache exists', async () => {
      // Redefine object in every test case because it will be manipulated by the transaction
      const getCasefileByIdResponse: ICachableCasefileForWhiteboard = {
        id: uuidv4(),
        title: 'testCasefile',
        nodes: [],
        temporary: { activeUsers: [] },
      };

      const getCachedCasefileByIdSpy = jest
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

      expect(getCachedCasefileByIdSpy).toBeCalledTimes(1);
      expect(getCachedCasefileByIdSpy).toBeCalledWith(testMessageContext.casefileId);

      expect(getDatabaseCasefileByIdSpy).toBeCalledTimes(1);
      expect(getDatabaseCasefileByIdSpy).toBeCalledWith(testMessageContext.casefileId);

      expect(saveCasefileToCacheSpy).toHaveBeenCalledTimes(1);
      expect(saveCasefileToCacheSpy).toBeCalledWith(getCasefileByIdResponse);

      expect(addActiveWhiteboardUserSpy).toBeCalledTimes(1);
      expect(addActiveWhiteboardUserSpy).toBeCalledWith(testMessageContext.casefileId, testMessageContext.userId);

      expect(sendKafkaMessageSpy).toBeCalledTimes(2);
      expect(sendKafkaMessageSpy).toBeCalledWith(KafkaTopic.TransactionOutputUnicast, {
        context: { ...testMessageContext, eventType: MessageEventType.LoadWhiteboardData },
        body: getCasefileByIdResponse,
      });
      expect(sendKafkaMessageSpy).toHaveBeenLastCalledWith(KafkaTopic.TransactionOutputBroadcast, {
        context: testMessageContext,
        body: testUserForWhiteboard,
      });
    });

    it('should correctly load casefile data from cache if it exists', async () => {
      // Redefine object in every test case because it will be manipulated by the transaction
      const getCasefileByIdResponse: ICachableCasefileForWhiteboard = {
        id: uuidv4(),
        title: 'testCasefile',
        nodes: [],
        temporary: { activeUsers: [] },
      };

      const getCachedCasefileByIdSpy = jest
        .spyOn(cacheService, getCachedCasefileByIdMethodName)
        .mockResolvedValue(getCasefileByIdResponse);
      const getDatabaseCasefileByIdSpy = jest.spyOn(databaseService, getCasefileByIdMethodName);
      const saveCasefileToCacheSpy = jest.spyOn(cacheService, saveCasefileToCacheMethodName);
      const addActiveWhiteboardUserSpy = jest
        .spyOn(cacheService, addActiveWhiteboardUserMethodName)
        .mockResolvedValue(testUserForWhiteboard);
      const sendKafkaMessageSpy = jest.spyOn(transactionEventProducer, sendKafkaMessageMethodName);

      await whiteboardUserJoinedTransaction.execute();

      expect(getCachedCasefileByIdSpy).toHaveBeenCalledTimes(1);
      expect(getCachedCasefileByIdSpy).toBeCalledWith(testMessageContext.casefileId);

      expect(getDatabaseCasefileByIdSpy).toBeCalledTimes(0);
      expect(saveCasefileToCacheSpy).toBeCalledTimes(0);

      expect(addActiveWhiteboardUserSpy).toBeCalledTimes(1);
      expect(addActiveWhiteboardUserSpy).toBeCalledWith(testMessageContext.casefileId, testMessageContext.userId);

      expect(sendKafkaMessageSpy).toBeCalledTimes(2);
      expect(sendKafkaMessageSpy).toBeCalledWith(KafkaTopic.TransactionOutputUnicast, {
        context: { ...testMessageContext, eventType: MessageEventType.LoadWhiteboardData },
        body: getCasefileByIdResponse,
      });
      expect(sendKafkaMessageSpy).toBeCalledWith(KafkaTopic.TransactionOutputBroadcast, {
        context: testMessageContext,
        body: testUserForWhiteboard,
      });
    });

    it('should not add a new active user if the joined user is already cached', async () => {
      // Redefine object in every test case because it will be manipulated by the transaction
      const getCasefileByIdResponse: ICachableCasefileForWhiteboard = {
        id: uuidv4(),
        title: 'testCasefile',
        nodes: [],
        temporary: {
          activeUsers: [
            { id: testMessageContext.userId, email: 'test', firstname: 'test', lastname: 'test', avatarUrl: 'test' },
          ],
        },
      };

      jest.spyOn(cacheService, getCachedCasefileByIdMethodName).mockResolvedValue(getCasefileByIdResponse);
      const addActiveWhiteboardUserSpy = jest
        .spyOn(cacheService, addActiveWhiteboardUserMethodName)
        .mockResolvedValue(testUserForWhiteboard);
      const sendKafkaMessageSpy = jest.spyOn(transactionEventProducer, sendKafkaMessageMethodName);

      await whiteboardUserJoinedTransaction.execute();

      expect(addActiveWhiteboardUserSpy).toBeCalledTimes(0);
      expect(sendKafkaMessageSpy).toBeCalledTimes(1);
      expect(sendKafkaMessageSpy).toBeCalledWith(KafkaTopic.TransactionOutputUnicast, {
        context: { ...testMessageContext, eventType: MessageEventType.LoadWhiteboardData },
        body: getCasefileByIdResponse,
      });
    });

    it('should throw an InternalServerException if any error occurs during the transaction', async () => {
      jest.spyOn(cacheService, getCachedCasefileByIdMethodName).mockImplementation(() => {
        throw new Error();
      });

      await expect(whiteboardUserJoinedTransaction.execute()).rejects.toThrow(InternalServerErrorException);
    });
  });
});
