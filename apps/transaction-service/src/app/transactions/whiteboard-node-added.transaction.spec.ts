import {
  AnyWhiteboardNode,
  IEmbeddingWhiteboardNode,
  IMessage,
  ITable,
  ITableWhiteboardNode,
  IUser,
  IUserQuery,
  IUserQueryWhiteboardNode,
  MessageEventType,
  UserRole,
  WhiteboardNodeType,
} from '@detective.solutions/shared/data-access';
import { CacheService, DatabaseService } from '../services';

import { InternalServerErrorException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TransactionEventProducer } from '../events';
import { TransactionServiceRefs } from './factory';
import { WhiteboardNodeAddedTransaction } from './whiteboard-node-added.transaction';
import { formatDate } from '@detective.solutions/shared/utils';
import { v4 as uuidv4 } from 'uuid';

const sendKafkaMessageMethodName = 'sendKafkaMessage';
const transactionEventProducerMock = {
  [sendKafkaMessageMethodName]: jest.fn(),
};

const insertTableOccurrenceMethodName = 'insertTableOccurrenceToCasefile';
const insertUserQueryOccurrenceMethodName = 'insertUserQueryOccurrenceToCasefile';
const insertEmbeddingMethodName = 'insertEmbeddingToCasefile';
const databaseServiceMock = {
  [insertTableOccurrenceMethodName]: jest.fn(),
  [insertUserQueryOccurrenceMethodName]: jest.fn(),
  [insertEmbeddingMethodName]: jest.fn(),
};

const testMessageContext = {
  eventType: MessageEventType.WhiteboardNodeAdded,
  tenantId: uuidv4(),
  casefileId: uuidv4(),
  userId: uuidv4(),
  userRole: UserRole.BASIC,
  nodeId: uuidv4(),
  timestamp: 123456,
};

describe('WhiteboardNodeAddedTransaction', () => {
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
    describe('TableOccurrence', () => {
      const testTableWhiteboardNode: ITableWhiteboardNode = {
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
      };

      const testMessagePayload: IMessage<ITableWhiteboardNode> = {
        context: testMessageContext,
        body: testTableWhiteboardNode,
      };

      it('should correctly execute transaction', async () => {
        const sendKafkaMessageSpy = jest.spyOn(transactionEventProducer, sendKafkaMessageMethodName);

        const addTableOccurrenceToCasefileSpy = jest
          .spyOn(databaseService, insertTableOccurrenceMethodName)
          .mockResolvedValue({});

        const addUserQueryOccurrenceToCasefileSpy = jest
          .spyOn(databaseService, insertUserQueryOccurrenceMethodName)
          .mockResolvedValue({});

        const addEmbeddingToCasefileSpy = jest.spyOn(databaseService, insertEmbeddingMethodName).mockResolvedValue({});

        const transaction = new WhiteboardNodeAddedTransaction(serviceRefs, testMessagePayload);
        transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run

        await transaction.execute();

        expect(sendKafkaMessageSpy).toBeCalledTimes(1);
        expect(sendKafkaMessageSpy).toBeCalledWith(transaction.targetTopic, testMessagePayload);
        expect(addTableOccurrenceToCasefileSpy).toBeCalledTimes(1);
        expect(addTableOccurrenceToCasefileSpy).toBeCalledWith(
          testMessagePayload.context.casefileId,
          testMessagePayload.body
        );

        expect(addUserQueryOccurrenceToCasefileSpy).toBeCalledTimes(0);
        expect(addEmbeddingToCasefileSpy).toBeCalledTimes(0);
      });

      it('should throw an InternalServerErrorException if the given message body does not pass the DTO validation', async () => {
        const sendKafkaMessageSpy = jest.spyOn(transactionEventProducer, sendKafkaMessageMethodName);

        const addTableOccurrenceToCasefileSpy = jest
          .spyOn(databaseService, insertTableOccurrenceMethodName)
          .mockResolvedValue({});

        const addUserQueryOccurrenceToCasefileSpy = jest
          .spyOn(databaseService, insertUserQueryOccurrenceMethodName)
          .mockResolvedValue({});

        const addEmbeddingToCasefileSpy = jest.spyOn(databaseService, insertEmbeddingMethodName).mockResolvedValue({});

        const transaction = new WhiteboardNodeAddedTransaction(serviceRefs, {
          context: testMessageContext,
          body: { ...testTableWhiteboardNode, entity: undefined },
        });
        transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run

        await expect(transaction.execute()).rejects.toThrow(InternalServerErrorException);

        expect(sendKafkaMessageSpy).toBeCalledTimes(0);
        expect(addTableOccurrenceToCasefileSpy).toBeCalledTimes(0);
        expect(addUserQueryOccurrenceToCasefileSpy).toBeCalledTimes(0);
        expect(addEmbeddingToCasefileSpy).toBeCalledTimes(0);
      });

      it('should throw an InternalServerErrorException if the database response is invalid', async () => {
        const sendKafkaMessageSpy = jest.spyOn(transactionEventProducer, sendKafkaMessageMethodName);

        const addTableOccurrenceToCasefileSpy = jest
          .spyOn(databaseService, insertTableOccurrenceMethodName)
          .mockResolvedValue(null);

        const transaction = new WhiteboardNodeAddedTransaction(serviceRefs, testMessagePayload);
        transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run

        await expect(transaction.execute()).rejects.toThrow(InternalServerErrorException);

        expect(sendKafkaMessageSpy).toBeCalledTimes(1);
        expect(sendKafkaMessageSpy).toBeCalledWith(transaction.targetTopic, testMessagePayload);
        expect(addTableOccurrenceToCasefileSpy).toBeCalledTimes(1);
        expect(addTableOccurrenceToCasefileSpy).toBeCalledWith(
          testMessagePayload.context.casefileId,
          testMessagePayload.body
        );
      });
    });

    describe('UserQueryOccurrence', () => {
      const testUserQueryWhiteboardNode: IUserQueryWhiteboardNode = {
        id: uuidv4(),
        title: 'test',
        x: 1,
        y: 1,
        width: 1,
        height: 1,
        locked: false,
        author: { id: uuidv4() } as IUser,
        editors: [{ id: uuidv4() }, { id: uuidv4() }] as IUser[],
        lastUpdatedBy: { id: uuidv4() } as IUser,
        lastUpdated: formatDate(new Date()),
        created: formatDate(new Date()),
        entity: { id: uuidv4() } as IUserQuery,
        type: WhiteboardNodeType.USER_QUERY,
      };

      const testMessagePayload: IMessage<IUserQueryWhiteboardNode> = {
        context: testMessageContext,
        body: testUserQueryWhiteboardNode,
      };

      it('should correctly execute transaction', async () => {
        const sendKafkaMessageSpy = jest.spyOn(transactionEventProducer, sendKafkaMessageMethodName);

        const addUserQueryOccurrenceToCasefileSpy = jest
          .spyOn(databaseService, insertUserQueryOccurrenceMethodName)
          .mockResolvedValue({});

        const addTableOccurrenceToCasefileSpy = jest
          .spyOn(databaseService, insertTableOccurrenceMethodName)
          .mockResolvedValue({});

        const addEmbeddingToCasefileSpy = jest.spyOn(databaseService, insertEmbeddingMethodName).mockResolvedValue({});

        const transaction = new WhiteboardNodeAddedTransaction(serviceRefs, testMessagePayload);
        transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run

        await transaction.execute();

        expect(sendKafkaMessageSpy).toBeCalledTimes(1);
        expect(sendKafkaMessageSpy).toBeCalledWith(transaction.targetTopic, testMessagePayload);
        expect(addUserQueryOccurrenceToCasefileSpy).toBeCalledTimes(1);
        expect(addUserQueryOccurrenceToCasefileSpy).toBeCalledWith(
          testMessagePayload.context.casefileId,
          testMessagePayload.body
        );

        expect(addTableOccurrenceToCasefileSpy).toBeCalledTimes(0);
        expect(addEmbeddingToCasefileSpy).toBeCalledTimes(0);
      });

      it('should throw an InternalServerErrorException if the given message body does not pass the DTO validation', async () => {
        const sendKafkaMessageSpy = jest.spyOn(transactionEventProducer, sendKafkaMessageMethodName);

        const addUserQueryOccurrenceToCasefileSpy = jest
          .spyOn(databaseService, insertUserQueryOccurrenceMethodName)
          .mockResolvedValue({});

        const addTableOccurrenceToCasefileSpy = jest
          .spyOn(databaseService, insertTableOccurrenceMethodName)
          .mockResolvedValue({});

        const addEmbeddingToCasefileSpy = jest.spyOn(databaseService, insertEmbeddingMethodName).mockResolvedValue({});

        const transaction = new WhiteboardNodeAddedTransaction(serviceRefs, {
          context: testMessageContext,
          body: { ...testUserQueryWhiteboardNode, entity: undefined },
        });
        transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run

        await expect(transaction.execute()).rejects.toThrow(InternalServerErrorException);

        expect(sendKafkaMessageSpy).toBeCalledTimes(0);
        expect(addUserQueryOccurrenceToCasefileSpy).toBeCalledTimes(0);
        expect(addTableOccurrenceToCasefileSpy).toBeCalledTimes(0);
        expect(addEmbeddingToCasefileSpy).toBeCalledTimes(0);
      });

      it('should throw an InternalServerErrorException if the database response is invalid', async () => {
        const sendKafkaMessageSpy = jest.spyOn(transactionEventProducer, sendKafkaMessageMethodName);

        const addUserQueryOccurrenceToCasefileSpy = jest
          .spyOn(databaseService, insertUserQueryOccurrenceMethodName)
          .mockResolvedValue(null);

        const transaction = new WhiteboardNodeAddedTransaction(serviceRefs, testMessagePayload);
        transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run

        await expect(transaction.execute()).rejects.toThrow(InternalServerErrorException);

        expect(sendKafkaMessageSpy).toBeCalledTimes(1);
        expect(sendKafkaMessageSpy).toBeCalledWith(transaction.targetTopic, testMessagePayload);
        expect(addUserQueryOccurrenceToCasefileSpy).toBeCalledTimes(1);
        expect(addUserQueryOccurrenceToCasefileSpy).toBeCalledWith(
          testMessagePayload.context.casefileId,
          testMessagePayload.body
        );
      });
    });

    describe('Embedding', () => {
      const testEmbeddingWhiteboardNode: IEmbeddingWhiteboardNode = {
        id: uuidv4(),
        title: 'test',
        href: 'detective.solutions',
        x: 1,
        y: 1,
        width: 1,
        height: 1,
        locked: false,
        author: { id: uuidv4() } as IUser,
        editors: [{ id: uuidv4() }, { id: uuidv4() }] as IUser[],
        lastUpdatedBy: { id: uuidv4() } as IUser,
        lastUpdated: formatDate(new Date()),
        created: formatDate(new Date()),
        type: WhiteboardNodeType.EMBEDDING,
      };

      const testMessagePayload: IMessage<IEmbeddingWhiteboardNode> = {
        context: testMessageContext,
        body: testEmbeddingWhiteboardNode,
      };

      it('should correctly execute transaction', async () => {
        const sendKafkaMessageSpy = jest.spyOn(transactionEventProducer, sendKafkaMessageMethodName);

        const addEmbeddingToCasefileSpy = jest.spyOn(databaseService, insertEmbeddingMethodName).mockResolvedValue({});

        const addTableOccurrenceToCasefileSpy = jest
          .spyOn(databaseService, insertTableOccurrenceMethodName)
          .mockResolvedValue({});

        const addUserQueryOccurrenceToCasefileSpy = jest
          .spyOn(databaseService, insertUserQueryOccurrenceMethodName)
          .mockResolvedValue({});

        const transaction = new WhiteboardNodeAddedTransaction(serviceRefs, testMessagePayload);
        transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run

        await transaction.execute();

        expect(sendKafkaMessageSpy).toBeCalledTimes(1);
        expect(sendKafkaMessageSpy).toBeCalledWith(transaction.targetTopic, testMessagePayload);
        expect(addEmbeddingToCasefileSpy).toBeCalledTimes(1);
        expect(addEmbeddingToCasefileSpy).toBeCalledWith(
          testMessagePayload.context.casefileId,
          testMessagePayload.body
        );

        expect(addTableOccurrenceToCasefileSpy).toBeCalledTimes(0);
        expect(addUserQueryOccurrenceToCasefileSpy).toBeCalledTimes(0);
      });

      it('should throw an InternalServerErrorException if the given message body does not pass the DTO validation', async () => {
        const sendKafkaMessageSpy = jest.spyOn(transactionEventProducer, sendKafkaMessageMethodName);

        const addEmbeddingToCasefileSpy = jest.spyOn(databaseService, insertEmbeddingMethodName).mockResolvedValue({});

        const addTableOccurrenceToCasefileSpy = jest
          .spyOn(databaseService, insertTableOccurrenceMethodName)
          .mockResolvedValue({});

        const addUserQueryOccurrenceToCasefileSpy = jest
          .spyOn(databaseService, insertUserQueryOccurrenceMethodName)
          .mockResolvedValue({});

        const transaction = new WhiteboardNodeAddedTransaction(serviceRefs, {
          context: testMessageContext,
          body: { ...testEmbeddingWhiteboardNode, href: undefined },
        });
        transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run

        await expect(transaction.execute()).rejects.toThrow(InternalServerErrorException);

        expect(sendKafkaMessageSpy).toBeCalledTimes(0);
        expect(addEmbeddingToCasefileSpy).toBeCalledTimes(0);
        expect(addUserQueryOccurrenceToCasefileSpy).toBeCalledTimes(0);
        expect(addTableOccurrenceToCasefileSpy).toBeCalledTimes(0);
      });

      it('should throw an InternalServerErrorException if the database response is invalid', async () => {
        const sendKafkaMessageSpy = jest.spyOn(transactionEventProducer, sendKafkaMessageMethodName);

        const addEmbeddingToCasefileSpy = jest
          .spyOn(databaseService, insertEmbeddingMethodName)
          .mockResolvedValue(null);

        const transaction = new WhiteboardNodeAddedTransaction(serviceRefs, testMessagePayload);
        transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run

        await expect(transaction.execute()).rejects.toThrow(InternalServerErrorException);

        expect(sendKafkaMessageSpy).toBeCalledTimes(1);
        expect(sendKafkaMessageSpy).toBeCalledWith(transaction.targetTopic, testMessagePayload);
        expect(addEmbeddingToCasefileSpy).toBeCalledTimes(1);
        expect(addEmbeddingToCasefileSpy).toBeCalledWith(
          testMessagePayload.context.casefileId,
          testMessagePayload.body
        );
      });
    });

    it('should throw an InternalServerException if any error occurs during the transaction', async () => {
      const testWhiteboardNode: AnyWhiteboardNode = {
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
      };

      const testMessagePayload: IMessage<ITableWhiteboardNode> = {
        context: testMessageContext,
        body: testWhiteboardNode,
      };

      jest.spyOn(transactionEventProducer, sendKafkaMessageMethodName).mockImplementation(() => {
        throw new Error();
      });
      jest.spyOn(databaseService, insertTableOccurrenceMethodName).mockResolvedValue({});
      jest.spyOn(databaseService, insertUserQueryOccurrenceMethodName).mockResolvedValue({});
      jest.spyOn(databaseService, insertEmbeddingMethodName).mockResolvedValue({});

      const transaction = new WhiteboardNodeAddedTransaction(serviceRefs, testMessagePayload);
      transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run

      await expect(transaction.execute()).rejects.toThrow(InternalServerErrorException);
    });
  });
});
