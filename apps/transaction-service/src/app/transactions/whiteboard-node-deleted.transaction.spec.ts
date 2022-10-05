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
import { TransactionEventProducer } from '../events';
import { TransactionServiceRefs } from './factory';
import { WhiteboardNodeDeletedTransaction } from './whiteboard-node-deleted.transaction';
import { v4 as uuidv4 } from 'uuid';

const sendKafkaMessageMethodName = 'sendKafkaMessage';
const transactionEventProducerMock = {
  [sendKafkaMessageMethodName]: jest.fn(),
};

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
};

const testMessagePayload: IMessage<IWhiteboardNodeDeleteUpdate> = {
  context: testMessageContext,
  body: testWhiteboardNode,
};

// TODO: Reactivate me!
xdescribe('WhiteboardNodeDeletedTransaction', () => {
  let transactionEventProducer: TransactionEventProducer;
  let cacheService: CacheService;
  let databaseService: DatabaseService;
  let serviceRefs: TransactionServiceRefs;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [
        { provide: TransactionEventProducer, useValue: transactionEventProducerMock },
        { provide: CacheService, useValue: {} }, // Needs to be mocked due to required serviceRefs
        { provide: DatabaseService, useValue: databaseServiceMock },
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
      jest.spyOn(transactionEventProducer, sendKafkaMessageMethodName).mockImplementation(() => {
        throw new Error();
      });
      jest.spyOn(databaseService, deleteNodeInCasefileMethodName).mockResolvedValue({});

      const transaction = new WhiteboardNodeDeletedTransaction(serviceRefs, testMessagePayload);
      transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run

      await expect(transaction.execute()).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw an InternalServerErrorException if the given message body does not pass the DTO validation', async () => {
      const sendKafkaMessageSpy = jest.spyOn(transactionEventProducer, sendKafkaMessageMethodName);

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
      const sendKafkaMessageSpy = jest.spyOn(transactionEventProducer, sendKafkaMessageMethodName);

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
