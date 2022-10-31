import { CacheService, DatabaseService } from '../services';
import {
  IMessage,
  IWhiteboardNodeBlockUpdate,
  MessageEventType,
  UserRole,
} from '@detective.solutions/shared/data-access';

import { InternalServerErrorException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TransactionEventProducer } from '../events';
import { TransactionServiceRefs } from './factory';
import { WhiteboardNodeBlockedTransaction } from './whiteboard-node-blocked.transaction';
import { v4 as uuidv4 } from 'uuid';

const sendKafkaMessageMethodName = 'sendKafkaMessage';
const transactionEventProducerMock = {
  [sendKafkaMessageMethodName]: jest.fn(),
};

const updateNodeBlockMethodName = 'updateNodeBlock';
const cacheServiceMock = { [updateNodeBlockMethodName]: jest.fn() };

const testMessageContext = {
  eventType: MessageEventType.WhiteboardNodeDeleted,
  tenantId: uuidv4(),
  casefileId: uuidv4(),
  userId: uuidv4(),
  userRole: UserRole.BASIC,
  nodeId: uuidv4(),
  timestamp: 123456,
};

const testMessageBody: IWhiteboardNodeBlockUpdate = {
  temporary: { blockedBy: testMessageContext.userId },
};

const testMessagePayload: IMessage<IWhiteboardNodeBlockUpdate> = {
  context: testMessageContext,
  body: testMessageBody,
};

describe('WhiteboardNodeBlockedTransaction', () => {
  let transactionEventProducer: TransactionEventProducer;
  let cacheService: CacheService;
  let databaseService: DatabaseService;
  let serviceRefs: TransactionServiceRefs;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [
        { provide: TransactionEventProducer, useValue: transactionEventProducerMock },
        { provide: CacheService, useValue: cacheServiceMock },
        { provide: DatabaseService, useValue: {} }, // Needs to be mocked due to required serviceRefs
      ],
    }).compile();

    transactionEventProducer = app.get<TransactionEventProducer>(TransactionEventProducer);
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
    it('should correctly execute transaction if blocking was successful', async () => {
      const sendKafkaMessageSpy = jest.spyOn(transactionEventProducer, sendKafkaMessageMethodName);
      const updateNodeBlockSpy = jest.spyOn(cacheService, updateNodeBlockMethodName).mockResolvedValue(true);

      const transaction = new WhiteboardNodeBlockedTransaction(serviceRefs, testMessagePayload);
      transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run

      await transaction.execute();

      expect(updateNodeBlockSpy).toBeCalledTimes(1);
      expect(updateNodeBlockSpy).toBeCalledWith(
        testMessageContext.casefileId,
        testMessageBody.temporary.blockedBy,
        testMessageContext.nodeId
      );
      expect(sendKafkaMessageSpy).toBeCalledTimes(1);
      expect(sendKafkaMessageSpy).toBeCalledWith(transaction.targetTopic, testMessagePayload);
    });

    it('should skip transaction forwarding if blocking was not successful', async () => {
      const sendKafkaMessageSpy = jest.spyOn(transactionEventProducer, sendKafkaMessageMethodName);
      const updateNodeBlockSpy = jest.spyOn(cacheService, updateNodeBlockMethodName).mockResolvedValue(false);

      const transaction = new WhiteboardNodeBlockedTransaction(serviceRefs, testMessagePayload);
      transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run

      await transaction.execute();

      expect(updateNodeBlockSpy).toBeCalledTimes(1);
      expect(updateNodeBlockSpy).toBeCalledWith(
        testMessageContext.casefileId,
        testMessageBody.temporary.blockedBy,
        testMessageContext.nodeId
      );
      expect(sendKafkaMessageSpy).toBeCalledTimes(0);
    });

    it('should throw an InternalServerException if the given message context is missing a nodeId', async () => {
      const transaction = new WhiteboardNodeBlockedTransaction(serviceRefs, {
        context: { ...testMessageContext, nodeId: undefined },
        body: testMessageBody,
      });
      transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run

      await expect(transaction.execute()).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw an InternalServerException if the given message is missing a body', async () => {
      const transaction = new WhiteboardNodeBlockedTransaction(serviceRefs, { ...testMessagePayload, body: undefined });
      transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run

      await expect(transaction.execute()).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw an InternalServerException if any error occurs during the transaction', async () => {
      jest.spyOn(cacheService, updateNodeBlockMethodName).mockImplementation(() => {
        throw new Error();
      });

      const transaction = new WhiteboardNodeBlockedTransaction(serviceRefs, testMessagePayload);
      transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run

      await expect(transaction.execute()).rejects.toThrow(InternalServerErrorException);
    });
  });
});
