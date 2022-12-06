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

const sendKafkaMessageMethodName = 'sendKafkaMessage';
const kafkaEventProducerMock = {
  [sendKafkaMessageMethodName]: jest.fn(),
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
      expect(sendKafkaMessageSpy).toBeCalledTimes(1);
      expect(sendKafkaMessageSpy).toBeCalledWith(testMessagePayload);
    });

    it('should retry the cache update if it fails once', async () => {
      const sendKafkaMessageSpy = jest.spyOn(kafkaEventProducer, sendKafkaMessageMethodName);
      const updateNodePropertiesSpy = jest
        .spyOn(cacheService, updateNodePropertiesMethodName)
        .mockImplementationOnce(() => {
          throw new Error();
        });

      const transaction = new WhiteboardNodePropertiesUpdatedTransaction(serviceRefs, testMessagePayload);
      transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run

      await transaction.execute();

      expect(sendKafkaMessageSpy).toBeCalledTimes(1);
      expect(sendKafkaMessageSpy).toBeCalledWith(testMessagePayload);

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
