import { CacheService, DatabaseService } from '../services';
import {
  IMessage,
  IWhiteboardNodePropertiesUpdate,
  MessageEventType,
  UserRole,
} from '@detective.solutions/shared/data-access';

import { InternalServerErrorException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TransactionEventProducer } from '../events';
import { TransactionServiceRefs } from './factory';
import { WhiteboardNodePropertiesUpdatedTransaction } from './whiteboard-node-properties-updated.transaction';
import { v4 as uuidv4 } from 'uuid';

const sendKafkaMessageMethodName = 'sendKafkaMessage';
const transactionEventProducerMock = {
  [sendKafkaMessageMethodName]: jest.fn(),
};

const updateNodePropertiesMethodName = 'updateNodeProperties';
const cacheServiceMock = { [updateNodePropertiesMethodName]: jest.fn() };

const testMessageContext = {
  eventType: MessageEventType.WhiteboardNodeResized,
  tenantId: uuidv4(),
  casefileId: uuidv4(),
  userId: uuidv4(),
  userRole: UserRole.BASIC,
  nodeId: uuidv4(),
  timestamp: 123456,
};

const testMessageBody = [
  {
    nodeId: uuidv4(),
    title: 'testTitle',
    width: 100,
    y: 0,
  },
];

const testMessagePayload: IMessage<IWhiteboardNodePropertiesUpdate[]> = {
  context: testMessageContext,
  body: testMessageBody,
};

// TODO: Reactivate me!
xdescribe('WhiteboardNodePropertiesUpdatedTransaction', () => {
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
      const updateNodePropertiesSpy = jest.spyOn(cacheService, updateNodePropertiesMethodName);

      const transaction = new WhiteboardNodePropertiesUpdatedTransaction(serviceRefs, testMessagePayload);
      transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run

      await transaction.execute();

      expect(updateNodePropertiesSpy).toBeCalledTimes(1);
      expect(updateNodePropertiesSpy).toBeCalledWith(
        testMessageContext.casefileId,
        testMessageContext.nodeId,
        testMessageBody
      );
      expect(sendKafkaMessageSpy).toBeCalledTimes(1);
      expect(sendKafkaMessageSpy).toBeCalledWith(transaction.targetTopic, testMessagePayload);
    });

    it('should retry the cache update if it fails once', async () => {
      const sendKafkaMessageSpy = jest.spyOn(transactionEventProducer, sendKafkaMessageMethodName);
      const updateNodePropertiesSpy = jest
        .spyOn(cacheService, updateNodePropertiesMethodName)
        .mockImplementationOnce(() => {
          throw new Error();
        });

      const transaction = new WhiteboardNodePropertiesUpdatedTransaction(serviceRefs, testMessagePayload);
      transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run

      await transaction.execute();

      expect(sendKafkaMessageSpy).toBeCalledTimes(1);
      expect(sendKafkaMessageSpy).toBeCalledWith(transaction.targetTopic, testMessagePayload);

      expect(updateNodePropertiesSpy).toBeCalledTimes(2);
      expect(updateNodePropertiesSpy).toHaveBeenNthCalledWith(
        1,
        testMessageContext.casefileId,
        testMessageContext.nodeId,
        testMessageBody
      );
      expect(updateNodePropertiesSpy).toHaveBeenNthCalledWith(
        2,
        testMessageContext.casefileId,
        testMessageContext.nodeId,
        testMessageBody
      );
    });

    it('should throw an InternalServerException if the cache update fails at least twice', async () => {
      jest.spyOn(cacheService, updateNodePropertiesMethodName).mockImplementation(() => {
        throw new Error();
      });

      const transaction = new WhiteboardNodePropertiesUpdatedTransaction(serviceRefs, testMessagePayload);
      transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run

      await expect(transaction.execute()).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw an InternalServerException if the given message is missing a body', async () => {
      const transaction = new WhiteboardNodePropertiesUpdatedTransaction(serviceRefs, {
        ...testMessagePayload,
        body: undefined,
      });
      transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run

      await expect(transaction.execute()).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw an InternalServerException if the given message context is missing a node id', async () => {
      const transaction = new WhiteboardNodePropertiesUpdatedTransaction(serviceRefs, {
        ...testMessagePayload,
        context: { ...testMessageContext, nodeId: undefined },
      });
      transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run

      await expect(transaction.execute()).rejects.toThrow(InternalServerErrorException);
    });
  });
});
