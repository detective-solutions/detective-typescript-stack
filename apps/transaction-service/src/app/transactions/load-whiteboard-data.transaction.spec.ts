import { CacheService, DatabaseService } from '../services';
import { MessageEventType, UserRole } from '@detective.solutions/shared/data-access';

import { LoadWhiteboardDataTransaction } from './load-whiteboard-data.transaction';
import { Test } from '@nestjs/testing';
import { TransactionProducer } from '../kafka';
import { v4 as uuidv4 } from 'uuid';

const sendKafkaMessageMethodName = 'sendKafkaMessage';
const transactionProducerMock = {
  [sendKafkaMessageMethodName]: jest.fn(),
};

const cacheServiceMock = {};

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

xdescribe('LoadWhiteboardDataTransaction', () => {
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
    const getCasefileByIdResponse = {
      id: uuidv4(),
      title: 'testCasefile',
      tables: [],
      queries: [],
      embeddings: [],
    };

    it('should correctly execute transaction', async () => {
      const getCasfileByIdSpy = jest
        .spyOn(databaseService, getCasefileByIdMethodName)
        .mockResolvedValue(getCasefileByIdResponse);
      const sendKafkaMessageSpy = jest.spyOn(transactionProducer, sendKafkaMessageMethodName);

      await loadWhiteboardDataTransaction.execute();

      const modifiedPayload = { ...testMessagePayload };
      modifiedPayload.body = getCasefileByIdResponse;

      expect(getCasfileByIdSpy).toBeCalledTimes(1);
      expect(getCasfileByIdSpy).toBeCalledWith(testMessagePayload.context.casefileId);
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
