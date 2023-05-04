import { CacheService, DatabaseService } from '../services';
import {
  IMessage,
  IWhiteboardNodePropertiesUpdate,
  KafkaTopic,
  MessageEventType,
  UserRole,
} from '@detective.solutions/shared/data-access';

import { InternalServerErrorException } from '@nestjs/common';
import { KafkaEventProducer } from '../kafka';
import { Test } from '@nestjs/testing';
import { TransactionServiceRefs } from '../models';
import { WhiteboardNodePropertiesUpdatedTransaction } from './whiteboard-node-properties-updated.transaction';
import { WhiteboardWebSocketGateway } from '../websocket';
import { v4 as uuidv4 } from 'uuid';

const updateNodePropertiesMethodName = 'updateNodeProperties';
const getCasefileByIdMethodName = 'getCasefileById';
const cacheServiceMock = { [updateNodePropertiesMethodName]: jest.fn(), [getCasefileByIdMethodName]: jest.fn() };

const sendPropagatedBroadcastMessageMethodName = 'sendPropagatedBroadcastMessage';
const sendPropagatedUnicastMessageMethodName = 'sendPropagatedUnicastMessage';
const mockWhiteboardWebSocketGateway = {
  [sendPropagatedBroadcastMessageMethodName]: jest.fn(),
  [sendPropagatedUnicastMessageMethodName]: jest.fn(),
};

const produceKafkaEventMethodName = 'produceKafkaEvent';
const kafkaEventProducerMock = {
  [produceKafkaEventMethodName]: jest.fn(),
};

const testMessageContext = {
  eventType: MessageEventType.WhiteboardNodePropertiesUpdated,
  tenantId: uuidv4(),
  casefileId: uuidv4(),
  userId: uuidv4(),
  userRole: UserRole.BASIC,
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

describe('WhiteboardNodePropertiesUpdatedTransaction', () => {
  let whiteboardWebSocketGateway: WhiteboardWebSocketGateway;
  let cacheService: CacheService;
  let databaseService: DatabaseService;
  let kafkaEventProducer: KafkaEventProducer;
  let serviceRefs: TransactionServiceRefs;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [
        { provide: CacheService, useValue: cacheServiceMock },
        { provide: WhiteboardWebSocketGateway, useValue: mockWhiteboardWebSocketGateway },
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
        mockWhiteboardWebSocketGateway,
        sendPropagatedBroadcastMessageMethodName
      );
      const updateNodePropertiesSpy = jest.spyOn(cacheService, updateNodePropertiesMethodName);

      const transaction = new WhiteboardNodePropertiesUpdatedTransaction(serviceRefs, testMessagePayload);
      transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run

      await transaction.execute();

      expect(updateNodePropertiesSpy).toBeCalledTimes(1);
      expect(updateNodePropertiesSpy).toBeCalledWith(
        testMessageContext.casefileId,
        testMessageContext.userId,
        testMessageBody
      );
      expect(sendPropagatedBroadcastMessageSpy).toBeCalledTimes(1);
      expect(sendPropagatedBroadcastMessageSpy).toBeCalledWith(testMessagePayload);
    });

    it('should throw an InternalServerException if the given message is missing a body', async () => {
      const transaction = new WhiteboardNodePropertiesUpdatedTransaction(serviceRefs, {
        context: testMessageContext,
        body: undefined,
      });
      transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run

      await expect(transaction.execute()).rejects.toThrow(InternalServerErrorException);
    });

    it('should retry the cache update if it fails once', async () => {
      const sendPropagatedBroadcastMessageSpy = jest.spyOn(
        mockWhiteboardWebSocketGateway,
        sendPropagatedBroadcastMessageMethodName
      );
      const updateNodePropertiesSpy = jest
        .spyOn(cacheService, updateNodePropertiesMethodName)
        .mockImplementationOnce(() => {
          throw new Error();
        });

      const transaction = new WhiteboardNodePropertiesUpdatedTransaction(serviceRefs, testMessagePayload);
      transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run

      await transaction.execute();

      expect(sendPropagatedBroadcastMessageSpy).toBeCalledTimes(1);
      expect(sendPropagatedBroadcastMessageSpy).toBeCalledWith(testMessagePayload);

      expect(updateNodePropertiesSpy).toBeCalledTimes(2);
      expect(updateNodePropertiesSpy).toHaveBeenNthCalledWith(
        1,
        testMessageContext.casefileId,
        testMessageContext.userId,
        testMessageBody
      );
      expect(updateNodePropertiesSpy).toHaveBeenNthCalledWith(
        2,
        testMessageContext.casefileId,
        testMessageContext.userId,
        testMessageBody
      );
    });

    it('should rollback transaction if the second try fails', async () => {
      const updateNodePropertiesSpy = jest
        .spyOn(cacheService, updateNodePropertiesMethodName)
        .mockImplementation(() => {
          throw new Error();
        });
      const sendPropagatedUnicastMessageSpy = jest.spyOn(
        mockWhiteboardWebSocketGateway,
        sendPropagatedUnicastMessageMethodName
      );
      const produceKafkaEventSpy = jest.spyOn(kafkaEventProducer, produceKafkaEventMethodName);

      const transaction = new WhiteboardNodePropertiesUpdatedTransaction(serviceRefs, testMessagePayload);
      transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run

      await transaction.execute();

      expect(updateNodePropertiesSpy).toHaveBeenCalledTimes(2);
      expect(sendPropagatedUnicastMessageSpy).toHaveBeenCalledWith({
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
