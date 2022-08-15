import { MessageEventType, UserRole } from '@detective.solutions/shared/data-access';

import { DatabaseService } from '../services';
import { Test } from '@nestjs/testing';
import { TransactionProducer } from '../kafka';
import { WhiteboardNodeAddedTransaction } from './whiteboard-node-added.transaction';

const databaseServiceMock = {
  addWhiteboardNode: jest.fn(),
};

const transactionProducerMock = {
  sendKafkaMessage: jest.fn(),
};

const testMessagePayload = {
  context: {
    eventType: MessageEventType.WhiteboardNodeAdded,
    tenantId: 'tenantId',
    casefileId: 'casefileId',
    userId: 'userId',
    userRole: UserRole.BASIC,
    nodeId: 'nodeId',
    timestamp: 123456,
  },
  body: undefined,
};

describe('WhiteboardNodeAddedTransaction', () => {
  let whiteboardNodeAddedTransaction: WhiteboardNodeAddedTransaction;
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
    whiteboardNodeAddedTransaction = new WhiteboardNodeAddedTransaction(
      {
        databaseService: databaseService,
        transactionProducer: transactionProducer,
      },
      testMessagePayload
    );

    // Disable logger for test runs
    whiteboardNodeAddedTransaction.logger.localInstance.setLogLevels([]);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(whiteboardNodeAddedTransaction).toBeDefined();
  });

  xdescribe('execute', () => {
    it('should correctly execute transaction', async () => {
      const sendKafkaMessageSpy = jest.spyOn(transactionProducer, 'sendKafkaMessage');

      await whiteboardNodeAddedTransaction.execute();

      expect(sendKafkaMessageSpy).toBeCalledTimes(1);
    });
  });
});
