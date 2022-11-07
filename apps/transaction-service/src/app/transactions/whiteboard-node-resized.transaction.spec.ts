import { CacheService, DatabaseService } from '../services';
import {
  IMessage,
  IWhiteboardNodeSizeUpdate,
  MessageEventType,
  UserRole,
} from '@detective.solutions/shared/data-access';

import { InternalServerErrorException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TransactionEventProducer } from '../events';
import { TransactionServiceRefs } from './factory';
import { WhiteboardNodeResizedTransaction } from './whiteboard-node-resized.transaction';
import { v4 as uuidv4 } from 'uuid';

const sendKafkaMessageMethodName = 'sendKafkaMessage';
const transactionEventProducerMock = {
  [sendKafkaMessageMethodName]: jest.fn(),
};

const updateNodeSizeMethodName = 'updateNodeSize';
const cacheServiceMock = { [updateNodeSizeMethodName]: jest.fn() };

const testMessageContext = {
  eventType: MessageEventType.WhiteboardNodeResized,
  tenantId: uuidv4(),
  casefileId: uuidv4(),
  userId: uuidv4(),
  userRole: UserRole.BASIC,
  nodeId: uuidv4(),
  timestamp: 123456,
};

const testMessageBody = {
  width: 1,
  height: 1,
};

const testMessagePayload: IMessage<IWhiteboardNodeSizeUpdate> = {
  context: testMessageContext,
  body: testMessageBody,
};

describe('WhiteboardNodeResizedTransaction', () => {
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
    it('should correctly execute transaction', async () => {
      const sendKafkaMessageSpy = jest.spyOn(transactionEventProducer, sendKafkaMessageMethodName);
      const updateNodeSizeSpy = jest.spyOn(cacheService, updateNodeSizeMethodName).mockResolvedValue(true);

      const transaction = new WhiteboardNodeResizedTransaction(serviceRefs, testMessagePayload);
      transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run

      await transaction.execute();

      expect(updateNodeSizeSpy).toBeCalledTimes(1);
      expect(updateNodeSizeSpy).toBeCalledWith(
        testMessageContext.casefileId,
        testMessageContext.nodeId,
        testMessageContext.userId,
        testMessageBody
      );
      expect(sendKafkaMessageSpy).toBeCalledTimes(1);
      expect(sendKafkaMessageSpy).toBeCalledWith(transaction.targetTopic, testMessagePayload);
    });

    it('should not forward message if resized node is blocked by another user', async () => {
      const sendKafkaMessageSpy = jest.spyOn(transactionEventProducer, sendKafkaMessageMethodName);

      const transaction = new WhiteboardNodeResizedTransaction(serviceRefs, testMessagePayload);
      transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run

      await transaction.execute();

      expect(sendKafkaMessageSpy).toBeCalledTimes(0);
    });

    it('should throw an InternalServerException if the given message is missing a body', async () => {
      const transaction = new WhiteboardNodeResizedTransaction(serviceRefs, { ...testMessagePayload, body: undefined });
      transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run

      await expect(transaction.execute()).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw an InternalServerException if the given message context is missing a node id', async () => {
      const transaction = new WhiteboardNodeResizedTransaction(serviceRefs, {
        ...testMessagePayload,
        context: { ...testMessageContext, nodeId: undefined },
      });
      transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run

      await expect(transaction.execute()).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw an InternalServerError if the message body does not pass the DTO validation', async () => {
      const transaction = new WhiteboardNodeResizedTransaction(serviceRefs, {
        context: testMessagePayload.context,
        body: { ...testMessageBody, width: undefined },
      });
      transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run

      await expect(transaction.execute()).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw an InternalServerException if any error occurs during the transaction', async () => {
      jest.spyOn(cacheService, updateNodeSizeMethodName).mockImplementation(() => {
        throw new Error();
      });

      const transaction = new WhiteboardNodeResizedTransaction(serviceRefs, testMessagePayload);
      transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run

      await expect(transaction.execute()).rejects.toThrow(InternalServerErrorException);
    });
  });
});
