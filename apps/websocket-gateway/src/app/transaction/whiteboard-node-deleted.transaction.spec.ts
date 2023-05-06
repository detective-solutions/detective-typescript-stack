import { CacheService, DatabaseService } from '../services';
import { IMessage, KafkaTopic, MessageEventType, UserRole } from '@detective.solutions/shared/data-access';

import { InternalServerErrorException } from '@nestjs/common';
import { KafkaEventProducer } from '../kafka';
import { Test } from '@nestjs/testing';
import { TransactionServiceRefs } from '../models';
import { WhiteboardNodeDeletedTransaction } from './whiteboard-node-deleted.transaction';
import { WhiteboardWebSocketGateway } from '../websocket';
import { v4 as uuidv4 } from 'uuid';

const deleteNodeMethodName = 'deleteNode';
const getCasefileByIdMethodName = 'getCasefileById';
const cacheServiceMock = { [deleteNodeMethodName]: jest.fn(), [getCasefileByIdMethodName]: jest.fn() };

const sendPropagatedBroadcastMessageMethodName = 'sendPropagatedBroadcastMessage';
const sendPropagatedUnicastMessageMethodName = 'sendPropagatedUnicastMessage';
const whiteboardWebSocketGatewayMock = {
  [sendPropagatedBroadcastMessageMethodName]: jest.fn(),
  [sendPropagatedUnicastMessageMethodName]: jest.fn(),
};

const produceKafkaEventMethodName = 'produceKafkaEvent';
const kafkaEventProducerMock = {
  [produceKafkaEventMethodName]: jest.fn(),
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
        { provide: CacheService, useValue: cacheServiceMock },
        { provide: WhiteboardWebSocketGateway, useValue: whiteboardWebSocketGatewayMock },
        { provide: KafkaEventProducer, useValue: kafkaEventProducerMock },
        { provide: DatabaseService, useValue: {} }, // Needs to be mocked due to required serviceRefs
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
        whiteboardWebSocketGatewayMock,
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

    it('should re-execute transaction if the first try fails', async () => {
      jest.spyOn(cacheService, deleteNodeMethodName).mockImplementationOnce(() => {
        throw new Error();
      });
      const executionSpy = jest.spyOn(WhiteboardNodeDeletedTransaction.prototype, 'execute');
      const transaction = new WhiteboardNodeDeletedTransaction(serviceRefs, testMessagePayload);

      transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run
      await transaction.execute();

      expect(executionSpy).toBeCalledTimes(2);
    });

    // FIXME: Test works when executed separately, but breaks in composite execution
    xit('should rollback transaction if the second try fails', async () => {
      jest.spyOn(cacheService, deleteNodeMethodName).mockImplementation(() => {
        throw new Error();
      });
      jest.spyOn(cacheService, getCasefileByIdMethodName);
      const executionSpy = jest.spyOn(WhiteboardNodeDeletedTransaction.prototype, 'execute');
      const sendPropagatedUnicastMessageSpy = jest.spyOn(
        whiteboardWebSocketGateway,
        sendPropagatedUnicastMessageMethodName
      );
      const produceKafkaEventSpy = jest.spyOn(kafkaEventProducer, produceKafkaEventMethodName);

      const transaction = new WhiteboardNodeDeletedTransaction(serviceRefs, testMessagePayload);
      transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run
      await transaction.execute();

      expect(executionSpy).toBeCalledTimes(2);
      expect(sendPropagatedUnicastMessageSpy).toBeCalledWith({
        context: { ...testMessageContext, eventType: MessageEventType.LoadWhiteboardData },
        body: undefined,
      });
      expect(produceKafkaEventSpy).toBeCalledWith(KafkaTopic.Error, {
        body: new Error(),
        context: testMessageContext,
      });
    });
  });
});
