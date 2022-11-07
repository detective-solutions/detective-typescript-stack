import { CacheService, DatabaseService } from '../services';
import {
  IMessage,
  IWhiteboardNodePositionUpdate,
  MessageEventType,
  UserRole,
} from '@detective.solutions/shared/data-access';

import { InternalServerErrorException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TransactionEventProducer } from '../events';
import { TransactionServiceRefs } from './factory';
import { WhiteboardNodeMovedTransaction } from './whiteboard-node-moved.transaction';
import { v4 as uuidv4 } from 'uuid';

const sendKafkaMessageMethodName = 'sendKafkaMessage';
const transactionEventProducerMock = {
  [sendKafkaMessageMethodName]: jest.fn(),
};

const updateNodePositionsMethodName = 'updateNodePositions';
const cacheServiceMock = { [updateNodePositionsMethodName]: jest.fn() };

const testMessageContext = {
  eventType: MessageEventType.WhiteboardNodeMoved,
  tenantId: uuidv4(),
  casefileId: uuidv4(),
  userId: uuidv4(),
  userRole: UserRole.BASIC,
  nodeId: uuidv4(),
  timestamp: 123456,
};

const testMessageBody = [
  {
    id: uuidv4(),
    x: 1,
    y: 1,
  },
  {
    id: uuidv4(),
    x: 2,
    y: 2,
  },
  {
    id: uuidv4(),
    x: 3,
    y: 3,
  },
];

const testMessagePayload: IMessage<IWhiteboardNodePositionUpdate[]> = {
  context: testMessageContext,
  body: testMessageBody,
};

describe('WhiteboardNodeMovedTransaction', () => {
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
      const updateNodePositionsSpy = jest.spyOn(cacheService, updateNodePositionsMethodName);

      const transaction = new WhiteboardNodeMovedTransaction(serviceRefs, testMessagePayload);
      transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run

      await transaction.execute();

      expect(updateNodePositionsSpy).toBeCalledTimes(1);
      expect(updateNodePositionsSpy).toBeCalledWith(
        testMessageContext.casefileId,
        testMessageContext.userId,
        testMessageBody
      );
      expect(sendKafkaMessageSpy).toBeCalledTimes(1);
      expect(sendKafkaMessageSpy).toBeCalledWith(transaction.targetTopic, testMessagePayload);
    });

    it('should throw an InternalServerException if the given message is missing a body', async () => {
      const transaction = new WhiteboardNodeMovedTransaction(serviceRefs, { ...testMessagePayload, body: undefined });
      transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run

      await expect(transaction.execute()).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw an InternalServerException if the given message body is not any array', async () => {
      const transaction = new WhiteboardNodeMovedTransaction(serviceRefs, { ...testMessagePayload, body: {} });
      transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run

      await expect(transaction.execute()).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw an InternalServerException if any error occurs during the transaction', async () => {
      jest.spyOn(cacheService, updateNodePositionsMethodName).mockImplementation(() => {
        throw new Error();
      });

      const transaction = new WhiteboardNodeMovedTransaction(serviceRefs, testMessagePayload);
      transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run

      await expect(transaction.execute()).rejects.toThrow(InternalServerErrorException);
    });

    it('should remove invalid position updates from message body if they do not pass the DTO validation', async () => {
      const sendKafkaMessageSpy = jest.spyOn(transactionEventProducer, sendKafkaMessageMethodName);
      const updateNodePositionsSpy = jest.spyOn(cacheService, updateNodePositionsMethodName);

      const transaction = new WhiteboardNodeMovedTransaction(serviceRefs, {
        context: testMessagePayload.context,
        body: [testMessageBody[0], { ...testMessageBody[1], x: undefined }, testMessageBody[2]],
      });
      transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run

      await transaction.execute();

      expect(updateNodePositionsSpy).toBeCalledTimes(1);
      expect(updateNodePositionsSpy).toHaveBeenCalledWith(testMessageContext.casefileId, testMessageContext.userId, [
        testMessageBody[0],
        testMessageBody[2],
      ]);
      expect(sendKafkaMessageSpy).toBeCalledTimes(1);
    });
  });
});
