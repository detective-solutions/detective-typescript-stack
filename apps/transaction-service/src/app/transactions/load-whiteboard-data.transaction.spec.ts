import { CacheService, DatabaseService } from '../services';
import { ICachedCasefileForWhiteboard, MessageEventType, UserRole } from '@detective.solutions/shared/data-access';

import { InternalServerErrorException } from '@nestjs/common';
import { LoadWhiteboardDataTransaction } from './load-whiteboard-data.transaction';
import { Test } from '@nestjs/testing';
import { TransactionProducer } from '../kafka';
import { v4 as uuidv4 } from 'uuid';

const sendKafkaMessageMethodName = 'sendKafkaMessage';
const transactionProducerMock = {
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

describe('LoadWhiteboardDataTransaction', () => {
  let loadWhiteboardDataTransaction: LoadWhiteboardDataTransaction;
  let transactionProducer: TransactionProducer;
  let cacheService: CacheService;
  let databaseService: DatabaseService;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [
        { provide: TransactionProducer, useValue: transactionProducerMock },
        { provide: CacheService, useValue: cacheServiceMock },
        { provide: DatabaseService, useValue: databaseServiceMock },
      ],
    }).compile();

    transactionProducer = app.get<TransactionProducer>(TransactionProducer);
    cacheService = app.get<CacheService>(CacheService);
    databaseService = app.get<DatabaseService>(DatabaseService);
    loadWhiteboardDataTransaction = new LoadWhiteboardDataTransaction(
      {
        transactionProducer: transactionProducer,
        cacheService: cacheService,
        databaseService: databaseService,
      },
      testMessagePayload
    );

    // Disable logger for test runs
    loadWhiteboardDataTransaction.logger.localInstance.setLogLevels([]);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(loadWhiteboardDataTransaction).toBeDefined();
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
      const sendKafkaMessageSpy = jest.spyOn(transactionProducer, sendKafkaMessageMethodName);

      await loadWhiteboardDataTransaction.execute();

      const modifiedPayload = { ...testMessagePayload };
      modifiedPayload.body = getCasefileByIdResponse;

      expect(isCasefileCachedSpy).toBeCalledTimes(1);
      expect(getCasfileByIdSpy).toBeCalledTimes(1);
      expect(getCasfileByIdSpy).toBeCalledWith(testMessagePayload.context.casefileId);
      expect(saveCasefileToCacheSpy).toHaveBeenCalledTimes(1);
      expect(sendKafkaMessageSpy).toBeCalledTimes(1);
      expect(sendKafkaMessageSpy).toBeCalledWith(loadWhiteboardDataTransaction.targetTopic, modifiedPayload);
    });

    it('should correctly load casefile data from cache if it exists', async () => {
      const isCasefileCachedSpy = jest.spyOn(cacheService, isCasefileCachedMethodName).mockResolvedValue(1);
      const getCachedCasefileByIdSpy = jest
        .spyOn(cacheService, getCachedCasefileByIdMethodName)
        .mockResolvedValue(getCasefileByIdResponse);
      const getCasfileByIdSpy = jest.spyOn(databaseService, getCasefileByIdMethodName);
      const saveCasefileToCacheSpy = jest.spyOn(cacheService, saveCasefileToCacheMethodName);
      const sendKafkaMessageSpy = jest.spyOn(transactionProducer, sendKafkaMessageMethodName);

      await loadWhiteboardDataTransaction.execute();

      const modifiedPayload = { ...testMessagePayload };
      modifiedPayload.body = getCasefileByIdResponse;

      expect(isCasefileCachedSpy).toHaveBeenCalledTimes(1);
      expect(getCachedCasefileByIdSpy).toHaveBeenCalledTimes(1);
      expect(getCachedCasefileByIdSpy).toBeCalledWith(testMessagePayload.context.casefileId);
      expect(getCasfileByIdSpy).toBeCalledTimes(0);
      expect(saveCasefileToCacheSpy).toBeCalledTimes(0);
      expect(sendKafkaMessageSpy).toBeCalledTimes(1);
      expect(sendKafkaMessageSpy).toBeCalledWith(loadWhiteboardDataTransaction.targetTopic, modifiedPayload);
    });

    it('should retry query after a failed request', async () => {
      const getCasfileByIdSpy = jest.spyOn(databaseService, getCasefileByIdMethodName).mockResolvedValue(null);
      const sendKafkaMessageSpy = jest.spyOn(transactionProducer, sendKafkaMessageMethodName);

      await loadWhiteboardDataTransaction.execute();

      expect(getCasfileByIdSpy).toBeCalledTimes(loadWhiteboardDataTransaction.maxRetries + 1);
      expect(sendKafkaMessageSpy).toBeCalledTimes(0);
    });
  });
});
