import { CacheService, DatabaseService } from '../services';
import { IMessage, MessageEventType, UserRole } from '@detective.solutions/shared/data-access';

import { InternalServerErrorException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TransactionServiceRefs } from './factory';
import { WhiteboardEventProducer } from '../events';
import { WhiteboardNodeDeletedTransaction } from './whiteboard-node-deleted.transaction';
import { v4 as uuidv4 } from 'uuid';

const sendKafkaMessageMethodName = 'sendKafkaMessage';
const transactionEventProducerMock = {
  [sendKafkaMessageMethodName]: jest.fn(),
};

const deleteNodeMethodName = 'deleteNode';
const cacheServiceMock = { [deleteNodeMethodName]: jest.fn() };

const testMessageContext = {
  eventType: MessageEventType.WhiteboardNodeDeleted,
  tenantId: uuidv4(),
  casefileId: uuidv4(),
  userId: uuidv4(),
  userRole: UserRole.BASIC,
  nodeId: uuidv4(),
  timestamp: 123456,
};

const testMessagePayload: IMessage<void> = {
  context: testMessageContext,
  body: null,
};

describe('WhiteboardNodeDeletedTransaction', () => {
  let transactionEventProducer: WhiteboardEventProducer;
  let cacheService: CacheService;
  let databaseService: DatabaseService;
  let serviceRefs: TransactionServiceRefs;

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
    serviceRefs = {
      transactionEventProducer: transactionEventProducer,
      cacheService: cacheService,
      databaseService: databaseService,
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('execute', () => {
    it('should correctly execute transaction', async () => {
      const sendKafkaMessageSpy = jest.spyOn(transactionEventProducer, sendKafkaMessageMethodName);
      const deleteNodeSpy = jest.spyOn(cacheService, deleteNodeMethodName);

      const transaction = new WhiteboardNodeDeletedTransaction(serviceRefs, testMessagePayload);
      transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run

      await transaction.execute();

      expect(sendKafkaMessageSpy).toBeCalledTimes(1);
      expect(sendKafkaMessageSpy).toBeCalledWith(transaction.targetTopic, testMessagePayload);
      expect(deleteNodeSpy).toBeCalledTimes(1);
      expect(deleteNodeSpy).toBeCalledWith(testMessageContext.casefileId, testMessageContext.nodeId);
    });

    it('should throw an InternalServerException if the given message context is missing a nodeId', async () => {
      const transaction = new WhiteboardNodeDeletedTransaction(serviceRefs, {
        context: { ...testMessageContext, nodeId: undefined },
        body: null,
      });
      transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run

      await expect(transaction.execute()).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw an InternalServerException if any error occurs during the transaction', async () => {
      jest.spyOn(cacheService, deleteNodeMethodName).mockImplementation(() => {
        throw new Error();
      });

      const transaction = new WhiteboardNodeDeletedTransaction(serviceRefs, testMessagePayload);
      transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run

      await expect(transaction.execute()).rejects.toThrow(InternalServerErrorException);
    });
  });
});
