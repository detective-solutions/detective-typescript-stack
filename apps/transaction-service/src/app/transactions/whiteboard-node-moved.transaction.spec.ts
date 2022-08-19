import {
  IMessage,
  ITable,
  ITableWhiteboardNode,
  IUser,
  MessageEventType,
  UserRole,
  WhiteboardNodeType,
} from '@detective.solutions/shared/data-access';

import { DatabaseService } from '../services';
import { Test } from '@nestjs/testing';
import { TransactionProducer } from '../kafka';
import { TransactionServiceRefs } from './factory';
import { WhiteboardNodeMovedTransaction } from './whiteboard-node-moved.transaction';
import { formatDate } from '@detective.solutions/shared/utils';
import { v4 as uuidv4 } from 'uuid';

const updateNodePositionMethodName = 'updateNodePositionInCasefile';
const databaseServiceMock = {
  [updateNodePositionMethodName]: jest.fn(),
};

const sendKafkaMessageMethodName = 'sendKafkaMessage';
const transactionProducerMock = {
  [sendKafkaMessageMethodName]: jest.fn(),
};

const testMessagePayload: IMessage<ITableWhiteboardNode> = {
  context: {
    eventType: MessageEventType.WhiteboardNodeAdded,
    tenantId: uuidv4(),
    casefileId: uuidv4(),
    userId: uuidv4(),
    userRole: UserRole.BASIC,
    nodeId: uuidv4(),
    timestamp: 123456,
  },
  body: {
    id: uuidv4(),
    title: 'test',
    x: 1,
    y: 1,
    width: 1,
    height: 1,
    locked: false,
    lastUpdatedBy: { id: uuidv4() } as IUser,
    lastUpdated: formatDate(new Date()),
    created: formatDate(new Date()),
    entity: { id: uuidv4() } as ITable,
    type: WhiteboardNodeType.TABLE,
  },
};

describe('WhiteboardNodeMovedTransaction', () => {
  let databaseService: DatabaseService;
  let transactionProducer: TransactionProducer;
  let serviceRefs: TransactionServiceRefs;
  let whiteboardNodeMovedTransaction: WhiteboardNodeMovedTransaction;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [
        { provide: DatabaseService, useValue: databaseServiceMock },
        { provide: TransactionProducer, useValue: transactionProducerMock },
      ],
    }).compile();

    databaseService = app.get<DatabaseService>(DatabaseService);
    transactionProducer = app.get<TransactionProducer>(TransactionProducer);
    serviceRefs = { databaseService: databaseService, transactionProducer: transactionProducer };
    whiteboardNodeMovedTransaction = new WhiteboardNodeMovedTransaction(serviceRefs, testMessagePayload);

    // Disable logger for test runs
    whiteboardNodeMovedTransaction.logger.localInstance.setLogLevels([]);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(whiteboardNodeMovedTransaction).toBeDefined();
  });

  describe('execute', () => {
    it('should correctly execute transaction for table node type', async () => {
      const sendKafkaMessageSpy = jest.spyOn(transactionProducer, sendKafkaMessageMethodName);

      await whiteboardNodeMovedTransaction.execute();

      expect(sendKafkaMessageSpy).toBeCalledTimes(1);
      expect(sendKafkaMessageSpy).toBeCalledWith(whiteboardNodeMovedTransaction.targetTopic, testMessagePayload);
    });
  });
});
