import { CacheService, DatabaseService } from '../services';
import {
  IMessage,
  ITable,
  ITableWhiteboardNode,
  MessageEventType,
  UserRole,
  WhiteboardNodeType,
} from '@detective.solutions/shared/data-access';

import { InternalServerErrorException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TransactionEventProducer } from '../events';
import { TransactionServiceRefs } from './factory';
import { WhiteboardNodeMovedTransaction } from './whiteboard-node-moved.transaction';
import { formatDate } from '@detective.solutions/shared/utils';
import { v4 as uuidv4 } from 'uuid';

const sendKafkaMessageMethodName = 'sendKafkaMessage';
const transactionEventProducerMock = {
  [sendKafkaMessageMethodName]: jest.fn(),
};

const testMessagePayload: IMessage<ITableWhiteboardNode[]> = {
  context: {
    eventType: MessageEventType.WhiteboardNodeAdded,
    tenantId: uuidv4(),
    casefileId: uuidv4(),
    userId: uuidv4(),
    userRole: UserRole.BASIC,
    nodeId: uuidv4(),
    timestamp: 123456,
  },
  body: [
    {
      id: uuidv4(),
      title: 'test',
      x: 1,
      y: 1,
      width: 1,
      height: 1,
      locked: false,
      lastUpdatedBy: uuidv4(),
      lastUpdated: formatDate(new Date()),
      created: formatDate(new Date()),
      entity: { id: uuidv4() } as ITable,
      type: WhiteboardNodeType.TABLE,
    },
    {
      id: uuidv4(),
      title: 'test',
      x: 1,
      y: 1,
      width: 1,
      height: 1,
      locked: false,
      lastUpdatedBy: uuidv4(),
      lastUpdated: formatDate(new Date()),
      created: formatDate(new Date()),
      entity: { id: uuidv4() } as ITable,
      type: WhiteboardNodeType.TABLE,
    },
  ],
};

// TODO: Reactivate me
xdescribe('WhiteboardNodeMovedTransaction', () => {
  let transactionEventProducer: TransactionEventProducer;
  let cacheService: CacheService;
  let databaseService: DatabaseService;
  let serviceRefs: TransactionServiceRefs;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [
        { provide: TransactionEventProducer, useValue: transactionEventProducerMock },
        { provide: CacheService, useValue: {} }, // Needs to be mocked due to required serviceRefs
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

      const transaction = new WhiteboardNodeMovedTransaction(serviceRefs, testMessagePayload);
      transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run

      await transaction.execute();

      expect(sendKafkaMessageSpy).toBeCalledTimes(1);
      expect(sendKafkaMessageSpy).toBeCalledWith(transaction.targetTopic, testMessagePayload);
    });

    it('should throw an InternalServerException if the given message is missing a body', async () => {
      const transaction = new WhiteboardNodeMovedTransaction(serviceRefs, { ...testMessagePayload, body: undefined });
      transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run

      await expect(transaction.execute()).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw an InternalServerException if any error occurs during the transaction', async () => {
      jest.spyOn(transactionEventProducer, sendKafkaMessageMethodName).mockImplementation(() => {
        throw new Error();
      });

      const transaction = new WhiteboardNodeMovedTransaction(serviceRefs, testMessagePayload);
      transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run

      await expect(transaction.execute()).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw an InternalServerErrorException if the given message body does not pass the DTO validation', async () => {
      const sendKafkaMessageSpy = jest.spyOn(transactionEventProducer, sendKafkaMessageMethodName);

      const transaction = new WhiteboardNodeMovedTransaction(serviceRefs, {
        context: testMessagePayload.context,
        body: { ...testMessagePayload.body[0], type: undefined },
      });
      transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run

      await expect(transaction.execute()).rejects.toThrow(InternalServerErrorException);

      expect(sendKafkaMessageSpy).toBeCalledTimes(0);
    });

    it('should throw an InternalServerErrorException if the database response is invalid', async () => {
      const sendKafkaMessageSpy = jest.spyOn(transactionEventProducer, sendKafkaMessageMethodName);

      const transaction = new WhiteboardNodeMovedTransaction(serviceRefs, testMessagePayload);
      transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run

      await expect(transaction.execute()).rejects.toThrow(InternalServerErrorException);

      expect(sendKafkaMessageSpy).toBeCalledTimes(1);
      expect(sendKafkaMessageSpy).toBeCalledWith(transaction.targetTopic, testMessagePayload);
    });
  });
});
