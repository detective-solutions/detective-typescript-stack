import { CacheService, DatabaseService } from '../services';
import { IMessage, MessageEventType, UserRole } from '@detective.solutions/shared/data-access';

import { InternalServerErrorException } from '@nestjs/common';
import { KafkaEventProducer } from '../kafka';
import { Test } from '@nestjs/testing';
import { TransactionServiceRefs } from '../models';
import { WhiteboardNodeDeletedTransaction } from './whiteboard-node-deleted.transaction';
import { WhiteboardWebSocketGateway } from '../websocket';
import { v4 as uuidv4 } from 'uuid';

const sendPropagatedBroadcastMessageMethodName = 'sendPropagatedBroadcastMessage';
const mockWhiteboardWebSocketGateway = {
  [sendPropagatedBroadcastMessageMethodName]: jest.fn(),
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

describe('WhiteboardNodeDeletedTransaction', () => {
  let whiteboardWebSocketGateway: WhiteboardWebSocketGateway;
  let cacheService: CacheService;
  let databaseService: DatabaseService;
  let kafkaEventProducer: KafkaEventProducer;
  let serviceRefs: TransactionServiceRefs;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [
        { provide: WhiteboardWebSocketGateway, useValue: mockWhiteboardWebSocketGateway },
        { provide: CacheService, useValue: cacheServiceMock },
        { provide: DatabaseService, useValue: {} }, // Needs to be mocked due to required serviceRefs
        { provide: KafkaEventProducer, useValue: {} }, // Needs to be mocked due to required serviceRefs
      ],
    }).compile();

    whiteboardWebSocketGateway = app.get<WhiteboardWebSocketGateway>(WhiteboardWebSocketGateway);
    cacheService = app.get<CacheService>(CacheService);
    databaseService = app.get<DatabaseService>(DatabaseService);
    kafkaEventProducer = app.get<KafkaEventProducer>(KafkaEventProducer);
    serviceRefs = {
      whiteboardWebSocketGateway: whiteboardWebSocketGateway,
      cacheService: cacheService,
      databaseService: databaseService,
      kafkaEventProducer: kafkaEventProducer,
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('execute', () => {
    it('should correctly execute transaction', async () => {
      const sendPropagatedBroadcastMessageSpy = jest.spyOn(
        mockWhiteboardWebSocketGateway,
        sendPropagatedBroadcastMessageMethodName
      );
      const deleteNodeSpy = jest.spyOn(cacheService, deleteNodeMethodName);

      const transaction = new WhiteboardNodeDeletedTransaction(serviceRefs, testMessagePayload);
      transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run

      await transaction.execute();

      expect(sendPropagatedBroadcastMessageSpy).toBeCalledTimes(1);
      expect(sendPropagatedBroadcastMessageSpy).toBeCalledWith(testMessagePayload);
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
