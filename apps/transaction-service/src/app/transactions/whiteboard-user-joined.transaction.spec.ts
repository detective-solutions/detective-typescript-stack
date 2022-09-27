import { CacheService, DatabaseService, TransactionCoordinationService } from '../services';
import { ICachedCasefileForWhiteboard, MessageEventType, UserRole } from '@detective.solutions/shared/data-access';

import { InternalServerErrorException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TransactionEventProducer } from '../events';
import { WhiteboardUserJoinedTransaction } from './whiteboard-user-joined.transaction';
import { v4 as uuidv4 } from 'uuid';

const sendKafkaMessageMethodName = 'sendKafkaMessage';
const transactionEventProducerMock = {
  [sendKafkaMessageMethodName]: jest.fn(),
};

const isCasefileCachedMethodName = 'isCasefileCached';
const getCachedCasefileByIdMethodName = 'getCasefileById';
const saveCasefileToCacheMethodName = 'saveCasefile';
const cacheServiceMock = {
  [isCasefileCachedMethodName]: jest.fn(),
  [getCachedCasefileByIdMethodName]: jest.fn(),
  [saveCasefileToCacheMethodName]: jest.fn(),
};

const getCasefileByIdMethodName = 'getCasefileById';
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

// TODO: Fix tests
xdescribe('WhiteboardUserJoinedTransaction', () => {
  let whiteboardUserJoinedTransaction: WhiteboardUserJoinedTransaction;
  let transactionEventProducer: TransactionEventProducer;
  let cacheService: CacheService;
  let databaseService: DatabaseService;
  let transactionCoordinationService: TransactionCoordinationService;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [
        { provide: TransactionEventProducer, useValue: transactionEventProducerMock },
        { provide: CacheService, useValue: cacheServiceMock },
        { provide: DatabaseService, useValue: databaseServiceMock },
        { provide: TransactionCoordinationService, useValue: {} }, // Needs to be mocked due to required serviceRefs
      ],
    }).compile();

    transactionEventProducer = app.get<TransactionEventProducer>(TransactionEventProducer);
    cacheService = app.get<CacheService>(CacheService);
    databaseService = app.get<DatabaseService>(DatabaseService);
    transactionCoordinationService = app.get<TransactionCoordinationService>(TransactionCoordinationService);
    whiteboardUserJoinedTransaction = new WhiteboardUserJoinedTransaction(
      {
        transactionEventProducer: transactionEventProducer,
        cacheService: cacheService,
        databaseService: databaseService,
        transactionCoordinationService: transactionCoordinationService,
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
    const getCasefileByIdResponse: ICachedCasefileForWhiteboard = {
      id: uuidv4(),
      title: 'testCasefile',
      tables: [],
      queries: [],
      embeddings: [],
      temporary: { activeUsers: [] },
    };

    it('should correctly load casefile data from database if no cache exists', async () => {
      const isCasefileCachedSpy = jest.spyOn(cacheService, isCasefileCachedMethodName).mockResolvedValue(0);
      const getCasfileByIdSpy = jest
        .spyOn(databaseService, getCasefileByIdMethodName)
        .mockResolvedValue(getCasefileByIdResponse);
      const saveCasefileToCacheSpy = jest.spyOn(cacheService, saveCasefileToCacheMethodName).mockResolvedValue('OK');
      const sendKafkaMessageSpy = jest.spyOn(transactionEventProducer, sendKafkaMessageMethodName);

      await whiteboardUserJoinedTransaction.execute();

      const modifiedPayload = { ...testMessagePayload };
      modifiedPayload.body = getCasefileByIdResponse;

      expect(isCasefileCachedSpy).toBeCalledTimes(1);
      expect(getCasfileByIdSpy).toBeCalledTimes(1);
      expect(getCasfileByIdSpy).toBeCalledWith(testMessagePayload.context.casefileId);
      expect(saveCasefileToCacheSpy).toHaveBeenCalledTimes(1);
      expect(sendKafkaMessageSpy).toBeCalledTimes(1);
      expect(sendKafkaMessageSpy).toBeCalledWith(whiteboardUserJoinedTransaction.targetTopic, modifiedPayload);
    });

    it('should correctly load casefile data from cache if it exists', async () => {
      const isCasefileCachedSpy = jest.spyOn(cacheService, isCasefileCachedMethodName).mockResolvedValue(1);
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
      jest.spyOn(cacheService, isCasefileCachedMethodName).mockImplementation(() => {
        throw new Error();
      });

      await expect(whiteboardUserJoinedTransaction.execute()).rejects.toThrow(InternalServerErrorException);
    });
  });
});
