import {
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

import { DatabaseService } from '../services';
import { InternalServerErrorException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TransactionProducer } from '../kafka';
import { TransactionServiceRefs } from './factory';
import { WhiteboardNodeAddedTransaction } from './whiteboard-node-added.transaction';
import { formatDate } from '@detective.solutions/shared/utils';
import { v4 as uuidv4 } from 'uuid';

const addTableOccurrenceMethodName = 'addTableOccurrenceToCasefile';
const addUserQueryOccurrenceMethodName = 'addUserQueryOccurrenceToCasefile';
const addEmbeddingMethodName = 'addEmbeddingToCasefile';
const databaseServiceMock = {
  [addTableOccurrenceMethodName]: jest.fn(),
  [addUserQueryOccurrenceMethodName]: jest.fn(),
  [addEmbeddingMethodName]: jest.fn(),
};

const sendKafkaMessageMethodName = 'sendKafkaMessage';
const transactionProducerMock = {
  [sendKafkaMessageMethodName]: jest.fn(),
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
  let databaseService: DatabaseService;
  let transactionProducer: TransactionProducer;
  let serviceRefs: TransactionServiceRefs;

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

      it('should correctly execute transaction for table node type', async () => {
        const sendKafkaMessageSpy = jest.spyOn(transactionProducer, sendKafkaMessageMethodName);

        const addTableOccurrenceToCasefileSpy = jest
          .spyOn(databaseService, addTableOccurrenceMethodName)
          .mockResolvedValue({});

        const addUserQueryOccurrenceToCasefileSpy = jest
          .spyOn(databaseService, addUserQueryOccurrenceMethodName)
          .mockResolvedValue({});

        const addEmbeddingToCasefileSpy = jest.spyOn(databaseService, addEmbeddingMethodName).mockResolvedValue({});

        const transaction = new WhiteboardNodeAddedTransaction(serviceRefs, testMessagePayload);
        transaction.logger.localInstance.setLogLevels([]);

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

      it('should throw an InternalServerErrorException if the given message body does not pass the table node DTO validation', async () => {
        const sendKafkaMessageSpy = jest.spyOn(transactionProducer, sendKafkaMessageMethodName);

        const addTableOccurrenceToCasefileSpy = jest
          .spyOn(databaseService, addTableOccurrenceMethodName)
          .mockResolvedValue({});

        const addUserQueryOccurrenceToCasefileSpy = jest
          .spyOn(databaseService, addUserQueryOccurrenceMethodName)
          .mockResolvedValue({});

        const addEmbeddingToCasefileSpy = jest.spyOn(databaseService, addEmbeddingMethodName).mockResolvedValue({});

        const transaction = new WhiteboardNodeAddedTransaction(serviceRefs, {
          context: testMessageContext,
          body: { ...testTableWhiteboardNode, entity: undefined },
        });
        transaction.logger.localInstance.setLogLevels([]);

        await expect(transaction.execute()).rejects.toThrow(InternalServerErrorException);

        expect(sendKafkaMessageSpy).toBeCalledTimes(0);
        expect(addTableOccurrenceToCasefileSpy).toBeCalledTimes(0);
        expect(addUserQueryOccurrenceToCasefileSpy).toBeCalledTimes(0);
        expect(addEmbeddingToCasefileSpy).toBeCalledTimes(0);
      });

      it('should throw an InternalServerErrorException if the database response is invalid', async () => {
        const sendKafkaMessageSpy = jest.spyOn(transactionProducer, sendKafkaMessageMethodName);

        const addTableOccurrenceToCasefileSpy = jest
          .spyOn(databaseService, addTableOccurrenceMethodName)
          .mockResolvedValue(null);

        const transaction = new WhiteboardNodeAddedTransaction(serviceRefs, testMessagePayload);
        transaction.logger.localInstance.setLogLevels([]);

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

      it('should correctly execute transaction for user query node type', async () => {
        const sendKafkaMessageSpy = jest.spyOn(transactionProducer, sendKafkaMessageMethodName);

        const addUserQueryOccurrenceToCasefileSpy = jest
          .spyOn(databaseService, addUserQueryOccurrenceMethodName)
          .mockResolvedValue({});

        const addTableOccurrenceToCasefileSpy = jest
          .spyOn(databaseService, addTableOccurrenceMethodName)
          .mockResolvedValue({});

        const addEmbeddingToCasefileSpy = jest.spyOn(databaseService, addEmbeddingMethodName).mockResolvedValue({});

        const transaction = new WhiteboardNodeAddedTransaction(serviceRefs, testMessagePayload);
        transaction.logger.localInstance.setLogLevels([]);

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

      it('should throw an InternalServerErrorException if the given message body does not pass the user query node DTO validation', async () => {
        const sendKafkaMessageSpy = jest.spyOn(transactionProducer, sendKafkaMessageMethodName);

        const addUserQueryOccurrenceToCasefileSpy = jest
          .spyOn(databaseService, addUserQueryOccurrenceMethodName)
          .mockResolvedValue({});

        const addTableOccurrenceToCasefileSpy = jest
          .spyOn(databaseService, addTableOccurrenceMethodName)
          .mockResolvedValue({});

        const addEmbeddingToCasefileSpy = jest.spyOn(databaseService, addEmbeddingMethodName).mockResolvedValue({});

        const transaction = new WhiteboardNodeAddedTransaction(serviceRefs, {
          context: testMessageContext,
          body: { ...testUserQueryWhiteboardNode, entity: undefined },
        });
        transaction.logger.localInstance.setLogLevels([]);

        await expect(transaction.execute()).rejects.toThrow(InternalServerErrorException);

        expect(sendKafkaMessageSpy).toBeCalledTimes(0);
        expect(addUserQueryOccurrenceToCasefileSpy).toBeCalledTimes(0);
        expect(addTableOccurrenceToCasefileSpy).toBeCalledTimes(0);
        expect(addEmbeddingToCasefileSpy).toBeCalledTimes(0);
      });

      it('should throw an InternalServerErrorException if the database response is invalid', async () => {
        const sendKafkaMessageSpy = jest.spyOn(transactionProducer, sendKafkaMessageMethodName);

        const addUserQueryOccurrenceToCasefileSpy = jest
          .spyOn(databaseService, addUserQueryOccurrenceMethodName)
          .mockResolvedValue(null);

        const transaction = new WhiteboardNodeAddedTransaction(serviceRefs, testMessagePayload);
        transaction.logger.localInstance.setLogLevels([]);

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

      it('should correctly execute transaction for embedding node type', async () => {
        const sendKafkaMessageSpy = jest.spyOn(transactionProducer, sendKafkaMessageMethodName);

        const addEmbeddingToCasefileSpy = jest.spyOn(databaseService, addEmbeddingMethodName).mockResolvedValue({});

        const addTableOccurrenceToCasefileSpy = jest
          .spyOn(databaseService, addTableOccurrenceMethodName)
          .mockResolvedValue({});

        const addUserQueryOccurrenceToCasefileSpy = jest
          .spyOn(databaseService, addUserQueryOccurrenceMethodName)
          .mockResolvedValue({});

        const transaction = new WhiteboardNodeAddedTransaction(serviceRefs, testMessagePayload);
        transaction.logger.localInstance.setLogLevels([]);

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

      it('should throw an InternalServerErrorException if the given message body does not pass the embedding node DTO validation', async () => {
        const sendKafkaMessageSpy = jest.spyOn(transactionProducer, sendKafkaMessageMethodName);

        const addEmbeddingToCasefileSpy = jest.spyOn(databaseService, addEmbeddingMethodName).mockResolvedValue({});

        const addTableOccurrenceToCasefileSpy = jest
          .spyOn(databaseService, addTableOccurrenceMethodName)
          .mockResolvedValue({});

        const addUserQueryOccurrenceToCasefileSpy = jest
          .spyOn(databaseService, addUserQueryOccurrenceMethodName)
          .mockResolvedValue({});

        const transaction = new WhiteboardNodeAddedTransaction(serviceRefs, {
          context: testMessageContext,
          body: { ...testEmbeddingWhiteboardNode, href: undefined },
        });
        transaction.logger.localInstance.setLogLevels([]);

        await expect(transaction.execute()).rejects.toThrow(InternalServerErrorException);

        expect(sendKafkaMessageSpy).toBeCalledTimes(0);
        expect(addEmbeddingToCasefileSpy).toBeCalledTimes(0);
        expect(addUserQueryOccurrenceToCasefileSpy).toBeCalledTimes(0);
        expect(addTableOccurrenceToCasefileSpy).toBeCalledTimes(0);
      });

      it('should throw an InternalServerErrorException if the database response is invalid', async () => {
        const sendKafkaMessageSpy = jest.spyOn(transactionProducer, sendKafkaMessageMethodName);

        const addEmbeddingToCasefileSpy = jest.spyOn(databaseService, addEmbeddingMethodName).mockResolvedValue(null);

        const transaction = new WhiteboardNodeAddedTransaction(serviceRefs, testMessagePayload);
        transaction.logger.localInstance.setLogLevels([]);

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
  });
});
