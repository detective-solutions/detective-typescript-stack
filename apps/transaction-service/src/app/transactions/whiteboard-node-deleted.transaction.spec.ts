import { CacheService, DatabaseService } from '../services';
import {
  IMessage,
  IWhiteboardNodeDeleteUpdate,
  MessageEventType,
  UserRole,
  WhiteboardNodeType,
} from '@detective.solutions/shared/data-access';

import { InternalServerErrorException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TransactionProducer } from '../kafka';
import { TransactionServiceRefs } from './factory';
import { WhiteboardNodeDeletedTransaction } from './whiteboard-node-deleted.transaction';
import { v4 as uuidv4 } from 'uuid';

const sendKafkaMessageMethodName = 'sendKafkaMessage';
const transactionProducerMock = {
  [sendKafkaMessageMethodName]: jest.fn(),
};

const cacheServiceMock = {};

const deleteNodeInCasefileMethodName = 'deleteNodeInCasefile';
const databaseServiceMock = {
  [deleteNodeInCasefileMethodName]: jest.fn(),
};

const testMessageContext = {
  eventType: MessageEventType.WhiteboardNodeDeleted,
  tenantId: uuidv4(),
  casefileId: uuidv4(),
  userId: uuidv4(),
  userRole: UserRole.BASIC,
  nodeId: uuidv4(),
  timestamp: 123456,
};

const testWhiteboardNode: IWhiteboardNodeDeleteUpdate = {
  id: testMessageContext.nodeId,
  type: WhiteboardNodeType.TABLE,
};

const testMessagePayload: IMessage<IWhiteboardNodeDeleteUpdate> = {
  context: testMessageContext,
  body: testWhiteboardNode,
};

describe('WhiteboardNodeDeletedTransaction', () => {
  let transactionProducer: TransactionProducer;
  let cacheService: CacheService;
  let databaseService: DatabaseService;
  let serviceRefs: TransactionServiceRefs;

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
    serviceRefs = {
      transactionProducer: transactionProducer,
      cacheService: cacheService,
      databaseService: databaseService,
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('execute', () => {
    it('should correctly execute transaction', async () => {
      const sendKafkaMessageSpy = jest.spyOn(transactionProducer, sendKafkaMessageMethodName);

      const deleteNodeInCasefileSpy = jest.spyOn(databaseService, deleteNodeInCasefileMethodName).mockResolvedValue({});

      const transaction = new WhiteboardNodeDeletedTransaction(serviceRefs, testMessagePayload);
      transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run

      await transaction.execute();

      expect(sendKafkaMessageSpy).toBeCalledTimes(1);
      expect(sendKafkaMessageSpy).toBeCalledWith(transaction.targetTopic, testMessagePayload);
      expect(deleteNodeInCasefileSpy).toBeCalledTimes(1);
      expect(deleteNodeInCasefileSpy).toBeCalledWith(testMessagePayload.context.nodeId, WhiteboardNodeType.TABLE);
    });

    it('should throw an InternalServerException if the given message is missing a body', async () => {
      jest.spyOn(databaseService, deleteNodeInCasefileMethodName).mockResolvedValue({});

      const transaction = new WhiteboardNodeDeletedTransaction(serviceRefs, { ...testMessagePayload, body: undefined });
      transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run

      await expect(transaction.execute()).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw an InternalServerException if any error occurs during the transaction', async () => {
      jest.spyOn(transactionProducer, sendKafkaMessageMethodName).mockImplementation(() => {
        throw new Error();
      });
      jest.spyOn(databaseService, deleteNodeInCasefileMethodName).mockResolvedValue({});

      const transaction = new WhiteboardNodeDeletedTransaction(serviceRefs, testMessagePayload);
      transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run

      await expect(transaction.execute()).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw an InternalServerErrorException if the given message body does not pass the DTO validation', async () => {
      const sendKafkaMessageSpy = jest.spyOn(transactionProducer, sendKafkaMessageMethodName);

      const deleteNodeInCasefileSpy = jest.spyOn(databaseService, deleteNodeInCasefileMethodName).mockResolvedValue({});

      const transaction = new WhiteboardNodeDeletedTransaction(serviceRefs, {
        context: testMessageContext,
        body: { ...testWhiteboardNode, type: undefined },
      });
      transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run

      await expect(transaction.execute()).rejects.toThrow(InternalServerErrorException);

      expect(sendKafkaMessageSpy).toBeCalledTimes(0);
      expect(deleteNodeInCasefileSpy).toBeCalledTimes(0);
    });

    it('should throw an InternalServerErrorException if the database response is invalid', async () => {
      const sendKafkaMessageSpy = jest.spyOn(transactionProducer, sendKafkaMessageMethodName);

      const deleteNodeInCasefileSpy = jest
        .spyOn(databaseService, deleteNodeInCasefileMethodName)
        .mockResolvedValue(null);

      const transaction = new WhiteboardNodeDeletedTransaction(serviceRefs, testMessagePayload);
      transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run

      await expect(transaction.execute()).rejects.toThrow(InternalServerErrorException);

      expect(sendKafkaMessageSpy).toBeCalledTimes(1);
      expect(sendKafkaMessageSpy).toBeCalledWith(transaction.targetTopic, testMessagePayload);
      expect(deleteNodeInCasefileSpy).toBeCalledTimes(1);
      expect(deleteNodeInCasefileSpy).toBeCalledWith(testMessagePayload.context.nodeId, WhiteboardNodeType.TABLE);
    });
  });
});
