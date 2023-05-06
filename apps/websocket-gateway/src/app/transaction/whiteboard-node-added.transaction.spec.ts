import { CacheService, DatabaseService } from '../services';
import {
  IMessage,
  ITable,
  ITableWhiteboardNode,
  KafkaTopic,
  MessageEventType,
  UserRole,
  WhiteboardNodeType,
} from '@detective.solutions/shared/data-access';

import { InternalServerErrorException } from '@nestjs/common';
import { KafkaEventProducer } from '../kafka';
import { Test } from '@nestjs/testing';
import { TransactionServiceRefs } from '../models';
import { WhiteboardNodeAddedTransaction } from './whiteboard-node-added.transaction';
import { WhiteboardWebSocketGateway } from '../websocket';
import { v4 as uuidv4 } from 'uuid';

const addNodeMethodName = 'addNode';
const getCasefileByIdMethodName = 'getCasefileById';
const cacheServiceMock = {
  [addNodeMethodName]: jest.fn(),
  [getCasefileByIdMethodName]: jest.fn(),
};

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
  eventType: MessageEventType.WhiteboardNodeAdded,
  tenantId: uuidv4(),
  casefileId: uuidv4(),
  userId: uuidv4(),
  userRole: UserRole.BASIC,
  nodeId: uuidv4(),
  timestamp: 123456,
};

const testMessageBody: ITableWhiteboardNode = {
  id: uuidv4(),
  title: 'test',
  x: 1,
  y: 1,
  width: 1,
  height: 1,
  locked: false,
  lastUpdatedBy: uuidv4(),
  lastUpdated: new Date().toISOString(),
  created: new Date().toISOString(),
  entity: { id: uuidv4() } as ITable,
  type: WhiteboardNodeType.TABLE,
};

const testMessagePayload: IMessage<ITableWhiteboardNode> = {
  context: testMessageContext,
  body: testMessageBody,
};

describe('WhiteboardNodeAddedTransaction', () => {
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
      const addNodeSpy = jest.spyOn(cacheService, addNodeMethodName);

      const transaction = new WhiteboardNodeAddedTransaction(serviceRefs, testMessagePayload);
      transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run

      await transaction.execute();

      expect(sendPropagatedBroadcastMessageSpy).toBeCalledTimes(1);
      expect(sendPropagatedBroadcastMessageSpy).toBeCalledWith(testMessagePayload);
      expect(addNodeSpy).toBeCalledTimes(1);
      expect(addNodeSpy).toBeCalledWith(testMessagePayload.context.casefileId, testMessagePayload.body);
    });

    it('should throw an InternalServerErrorException if the given message is missing a body', async () => {
      const sendPropagatedBroadcastMessageSpy = jest.spyOn(
        whiteboardWebSocketGatewayMock,
        sendPropagatedBroadcastMessageMethodName
      );
      const addNodeSpy = jest.spyOn(cacheService, addNodeMethodName);

      const transaction = new WhiteboardNodeAddedTransaction(serviceRefs, {
        context: testMessageContext,
        body: undefined,
      });
      transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run

      await expect(transaction.execute()).rejects.toThrow(InternalServerErrorException);

      expect(sendPropagatedBroadcastMessageSpy).toBeCalledTimes(0);
      expect(addNodeSpy).toBeCalledTimes(0);
    });

    it('should re-execute transaction if the first try fails', async () => {
      jest.spyOn(cacheService, addNodeMethodName).mockImplementationOnce(() => {
        throw new Error();
      });
      const executionSpy = jest.spyOn(WhiteboardNodeAddedTransaction.prototype, 'execute');
      const transaction = new WhiteboardNodeAddedTransaction(serviceRefs, testMessagePayload);

      transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run
      await transaction.execute();

      expect(executionSpy).toBeCalledTimes(2);
    });

    // FIXME: Test works when executed separately, but breaks in composite execution
    xit('should rollback transaction if the second try fails', async () => {
      jest.spyOn(cacheService, addNodeMethodName).mockImplementation(() => {
        throw new Error();
      });
      jest.spyOn(cacheService, getCasefileByIdMethodName);
      const executionSpy = jest.spyOn(WhiteboardNodeAddedTransaction.prototype, 'execute');
      const sendPropagatedUnicastMessageSpy = jest.spyOn(
        whiteboardWebSocketGateway,
        sendPropagatedUnicastMessageMethodName
      );
      const produceKafkaEventSpy = jest.spyOn(kafkaEventProducer, produceKafkaEventMethodName);

      const transaction = new WhiteboardNodeAddedTransaction(serviceRefs, testMessagePayload);
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
