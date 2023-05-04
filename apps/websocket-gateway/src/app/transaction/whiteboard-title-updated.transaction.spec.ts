import { CacheService, DatabaseService } from '../services';
import { IMessage, KafkaTopic, MessageEventType, UserRole } from '@detective.solutions/shared/data-access';

import { InternalServerErrorException } from '@nestjs/common';
import { KafkaEventProducer } from '../kafka';
import { Test } from '@nestjs/testing';
import { TransactionServiceRefs } from '../models';
import { WhiteboardTitleUpdatedTransaction } from './whiteboard-title-updated.transaction';
import { WhiteboardWebSocketGateway } from '../websocket';
import { v4 as uuidv4 } from 'uuid';

const updateCasefileTitleMethodName = 'updateCasefileTitle';
const getCasefileByIdMethodName = 'getCasefileById';
const cacheServiceMock = {
  [updateCasefileTitleMethodName]: jest.fn(),
  [getCasefileByIdMethodName]: jest.fn(),
};

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
  eventType: MessageEventType.WhiteboardTitleUpdated,
  tenantId: uuidv4(),
  casefileId: uuidv4(),
  userId: uuidv4(),
  userRole: UserRole.BASIC,
  timestamp: 123456,
};

const testMessagePayload: IMessage<string> = {
  context: testMessageContext,
  body: 'test title',
};

describe('WhiteboardTitleUpdatedTransaction', () => {
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
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  describe('execute', () => {
    it('should correctly execute transaction', async () => {
      const sendPropagatedBroadcastMessageSpy = jest.spyOn(
        whiteboardWebSocketGateway,
        sendPropagatedBroadcastMessageMethodName
      );

      const transaction = new WhiteboardTitleUpdatedTransaction(serviceRefs, testMessagePayload);
      transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run

      await transaction.execute();

      expect(sendPropagatedBroadcastMessageSpy).toBeCalledTimes(1);
      expect(sendPropagatedBroadcastMessageSpy).toBeCalledWith(testMessagePayload);
    });

    it('should throw an InternalServerException if the given message is missing a body', async () => {
      const transaction = new WhiteboardTitleUpdatedTransaction(serviceRefs, {
        ...testMessagePayload,
        body: undefined,
      });
      transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run

      await expect(transaction.execute()).rejects.toThrow(InternalServerErrorException);
    });

    it('should re-execute transaction if the first try fails', async () => {
      jest.spyOn(cacheService, updateCasefileTitleMethodName).mockImplementationOnce(() => {
        throw new Error();
      });
      const produceKafkaEventSpy = jest.spyOn(kafkaEventProducer, produceKafkaEventMethodName);
      const executionSpy = jest.spyOn(WhiteboardTitleUpdatedTransaction.prototype, 'execute');

      const transaction = new WhiteboardTitleUpdatedTransaction(serviceRefs, testMessagePayload);
      transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run

      await transaction.execute();

      expect(executionSpy).toHaveBeenCalledTimes(2);
      expect(produceKafkaEventSpy).toHaveBeenCalledWith(KafkaTopic.Error, {
        body: new Error(),
        context: testMessageContext,
      });
    });

    it('should rollback transaction if the second try fails', async () => {
      jest.spyOn(cacheService, updateCasefileTitleMethodName).mockImplementation(() => {
        throw new Error();
      });
      const produceKafkaEventSpy = jest.spyOn(kafkaEventProducer, produceKafkaEventMethodName);
      const sendPropagatedUnicastMessageSpy = jest.spyOn(
        whiteboardWebSocketGateway,
        sendPropagatedUnicastMessageMethodName
      );
      const executionSpy = jest.spyOn(WhiteboardTitleUpdatedTransaction.prototype, 'execute');

      const transaction = new WhiteboardTitleUpdatedTransaction(serviceRefs, testMessagePayload);
      transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run

      await transaction.execute();

      expect(produceKafkaEventSpy).toBeCalledWith(KafkaTopic.Error, {
        body: new Error(),
        context: testMessageContext,
      });
      expect(produceKafkaEventSpy).toBeCalledWith(KafkaTopic.Error, {
        body: new Error(),
        context: testMessageContext,
      });
      expect(executionSpy).toBeCalledTimes(2);
      expect(sendPropagatedUnicastMessageSpy).toBeCalledWith({
        context: { ...testMessageContext, eventType: MessageEventType.LoadWhiteboardData },
        body: undefined,
      });
    });
  });
});
