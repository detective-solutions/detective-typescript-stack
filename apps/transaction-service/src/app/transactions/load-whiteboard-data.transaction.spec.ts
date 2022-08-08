import { KafkaTopic, MessageEventType, UserRole } from '@detective.solutions/shared/data-access';

import { DatabaseService } from '../services';
import { LoadWhiteboardDataTransaction } from './load-whiteboard-data.transaction';
import { Test } from '@nestjs/testing';
import { TransactionProducer } from '../kafka';
import { v4 as uuidv4 } from 'uuid';

const databaseServiceMock = {
  getCasefileById: jest.fn(),
};

const transactionProducerMock = {
  sendKafkaMessage: jest.fn(),
};

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
  body: undefined,
};

describe('LoadWhiteboardDataTransaction', () => {
  let loadWhiteboardDataTransaction: LoadWhiteboardDataTransaction;
  let databaseService: DatabaseService;
  let transactionProducer: TransactionProducer;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [
        { provide: DatabaseService, useValue: databaseServiceMock },
        { provide: TransactionProducer, useValue: transactionProducerMock },
      ],
    }).compile();

    databaseService = app.get<DatabaseService>(DatabaseService);
    transactionProducer = app.get<TransactionProducer>(TransactionProducer);
    loadWhiteboardDataTransaction = new LoadWhiteboardDataTransaction(
      {
        databaseService: databaseService,
        transactionProducer: transactionProducer,
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
    };

    it('should correctly execute transaction', async () => {
      const getCasfileByIdSpy = jest
        .spyOn(databaseService, 'getCasefileById')
        .mockResolvedValue(getCasefileByIdResponse);
      const sendKafkaMessageSpy = jest.spyOn(transactionProducer, 'sendKafkaMessage');

      await loadWhiteboardDataTransaction.execute();

      const modifiedPayload = Object.assign({}, testMessagePayload);
      modifiedPayload.body = getCasefileByIdResponse;

      expect(getCasfileByIdSpy).toBeCalledTimes(1);
      expect(getCasfileByIdSpy).toBeCalledWith(testMessagePayload.context.casefileId);
      expect(sendKafkaMessageSpy).toBeCalledTimes(1);
      expect(sendKafkaMessageSpy).toBeCalledWith(KafkaTopic.TransactionOutputUnicast, modifiedPayload);
    });
  });
});
