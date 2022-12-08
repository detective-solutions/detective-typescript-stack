import { CacheService, DatabaseService } from '../services';
import {
  IMessage,
  IWhiteboardNodePropertiesUpdate,
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

const produceKafkaEventMethodName = 'produceKafkaEvent';
const kafkaEventProducerMock = {
  [produceKafkaEventMethodName]: jest.fn(),
};

const updateNodePropertiesMethodName = 'updateNodeProperties';
const cacheServiceMock = { [updateNodePropertiesMethodName]: jest.fn() };

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

// TODO: Reactivate me!
xdescribe('WhiteboardNodePropertiesUpdatedTransaction', () => {
  let whiteboardWebSocketGateway: WhiteboardWebSocketGateway;
  let cacheService: CacheService;
  let databaseService: DatabaseService;
  let kafkaEventProducer: KafkaEventProducer;
  let serviceRefs: TransactionServiceRefs;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [
        { provide: WhiteboardWebSocketGateway, useValue: {} }, // Needs to be mocked due to required serviceRefs
        { provide: CacheService, useValue: cacheServiceMock },
        { provide: DatabaseService, useValue: {} }, // Needs to be mocked due to required serviceRefs
        { provide: KafkaEventProducer, useValue: kafkaEventProducerMock },
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
      const produceKafkaEventSpy = jest.spyOn(kafkaEventProducer, produceKafkaEventMethodName);
      const updateNodePropertiesSpy = jest.spyOn(cacheService, updateNodePropertiesMethodName);

      const transaction = new WhiteboardNodePropertiesUpdatedTransaction(serviceRefs, testMessagePayload);
      transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run

      await transaction.execute();

      expect(updateNodePropertiesSpy).toBeCalledTimes(1);
      expect(updateNodePropertiesSpy).toBeCalledWith(
        testMessageContext.casefileId,
        testMessageContext.userId,
        testMessageBody[0].nodeId,
        testMessageBody[0]
      );
      expect(produceKafkaEventSpy).toBeCalledTimes(1);
      expect(produceKafkaEventSpy).toBeCalledWith(testMessagePayload);
    });

    it('should retry the cache update if it fails once', async () => {
      const produceKafkaEventSpy = jest.spyOn(kafkaEventProducer, produceKafkaEventMethodName);
      const updateNodePropertiesSpy = jest
        .spyOn(cacheService, updateNodePropertiesMethodName)
        .mockImplementationOnce(() => {
          throw new Error();
        });

      const transaction = new WhiteboardNodePropertiesUpdatedTransaction(serviceRefs, testMessagePayload);
      transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run

      await transaction.execute();

      expect(produceKafkaEventSpy).toBeCalledTimes(1);
      expect(produceKafkaEventSpy).toBeCalledWith(testMessagePayload);

      expect(updateNodePropertiesSpy).toBeCalledTimes(2);
      expect(updateNodePropertiesSpy).toHaveBeenNthCalledWith(
        1,
        testMessageContext.casefileId,
        testMessageContext.userId,
        testMessageBody[0].nodeId,
        testMessageBody[0]
      );
      expect(updateNodePropertiesSpy).toHaveBeenNthCalledWith(
        2,
        testMessageContext.casefileId,
        testMessageContext.userId,
        testMessageBody[0].nodeId,
        testMessageBody[0]
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
