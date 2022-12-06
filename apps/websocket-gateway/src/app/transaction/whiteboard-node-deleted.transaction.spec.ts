import { CacheService, DatabaseService } from '../services';
import { IMessage, MessageEventType, UserRole } from '@detective.solutions/shared/data-access';

import { InternalServerErrorException } from '@nestjs/common';
import { KafkaEventProducer } from '../kafka';
import { Test } from '@nestjs/testing';
import { TransactionServiceRefs } from '../models';
import { WhiteboardNodeDeletedTransaction } from './whiteboard-node-deleted.transaction';
import { WhiteboardWebSocketGateway } from '../websocket';
import { v4 as uuidv4 } from 'uuid';

const sendKafkaMessageMethodName = 'sendKafkaMessage';
const kafkaEventProducerMock = {
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

xdescribe('WhiteboardNodeDeletedTransaction', () => {
  let cacheService: CacheService;
  let databaseService: DatabaseService;
  let whiteboardWebSocketGateway: WhiteboardWebSocketGateway;
  let kafkaEventProducer: KafkaEventProducer;
  let serviceRefs: TransactionServiceRefs;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [
        { provide: CacheService, useValue: cacheServiceMock },
        { provide: DatabaseService, useValue: {} }, // Needs to be mocked due to required serviceRefs
        { provide: WhiteboardWebSocketGateway, useValue: {} }, // Needs to be mocked due to required serviceRefs
        { provide: KafkaEventProducer, useValue: kafkaEventProducerMock },
      ],
    }).compile();

    cacheService = app.get<CacheService>(CacheService);
    databaseService = app.get<DatabaseService>(DatabaseService);
    whiteboardWebSocketGateway = app.get<WhiteboardWebSocketGateway>(WhiteboardWebSocketGateway);
    kafkaEventProducer = app.get<KafkaEventProducer>(KafkaEventProducer);
    serviceRefs = {
      cacheService: cacheService,
      databaseService: databaseService,
      whiteboardWebSocketGateway: whiteboardWebSocketGateway,
      kafkaEventProducer: kafkaEventProducer,
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('execute', () => {
    it('should correctly execute transaction', async () => {
      const sendKafkaMessageSpy = jest.spyOn(kafkaEventProducer, sendKafkaMessageMethodName);
      const deleteNodeSpy = jest.spyOn(cacheService, deleteNodeMethodName);

      const transaction = new WhiteboardNodeDeletedTransaction(serviceRefs, testMessagePayload);
      transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run

      await transaction.execute();

      expect(sendKafkaMessageSpy).toBeCalledTimes(1);
      expect(sendKafkaMessageSpy).toBeCalledWith(testMessagePayload);
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
