import { CacheService, DatabaseService } from '../services';
import { KafkaTopic, MessageEventType, UserRole } from '@detective.solutions/shared/data-access';

import { KafkaEventProducer } from '../kafka';
import { Test } from '@nestjs/testing';
import { WhiteboardUserLeftTransaction } from './whiteboard-user-left.transaction';
import { WhiteboardWebSocketGateway } from '../websocket';
import { v4 as uuidv4 } from 'uuid';

const removeActiveWhiteboardUserMethodName = 'removeActiveUser';
const cacheServiceMock = {
  [removeActiveWhiteboardUserMethodName]: jest.fn(),
};

const sendPropagatedBroadcastMessageMethodName = 'sendPropagatedBroadcastMessage';
const mockWhiteboardWebSocketGateway = {
  [sendPropagatedBroadcastMessageMethodName]: jest.fn(),
};

const produceKafkaEventMethodName = 'produceKafkaEvent';
const kafkaEventProducerMock = {
  [produceKafkaEventMethodName]: jest.fn(),
};

const testMessageContext = {
  eventType: MessageEventType.WhiteboardUserLeft,
  tenantId: uuidv4(),
  casefileId: uuidv4(),
  userId: uuidv4(),
  userRole: UserRole.BASIC,
  nodeId: uuidv4(),
  timestamp: 123456,
};

const testMessagePayload = {
  context: testMessageContext,
  body: null,
};

describe('WhiteboardUserLeftTransaction', () => {
  let whiteboardUserLeftTransaction: WhiteboardUserLeftTransaction;
  let whiteboardWebSocketGateway: WhiteboardWebSocketGateway;
  let cacheService: CacheService;
  let databaseService: DatabaseService;
  let kafkaEventProducer: KafkaEventProducer;

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
    whiteboardUserLeftTransaction = new WhiteboardUserLeftTransaction(
      {
        whiteboardWebSocketGateway: whiteboardWebSocketGateway,
        cacheService: cacheService,
        databaseService: databaseService,
        kafkaEventProducer: kafkaEventProducer,
      },
      testMessagePayload
    );

    // Disable logger for test runs
    whiteboardUserLeftTransaction.logger.localInstance.setLogLevels([]);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(whiteboardUserLeftTransaction).toBeDefined();
  });

  describe('execute', () => {
    it('should correctly execute transaction', async () => {
      const removeActiveWhiteboardUserSpy = jest
        .spyOn(cacheService, removeActiveWhiteboardUserMethodName)
        .mockResolvedValue('OK');
      const sendPropagatedBroadcastMessageSpy = jest.spyOn(
        mockWhiteboardWebSocketGateway,
        sendPropagatedBroadcastMessageMethodName
      );

      await whiteboardUserLeftTransaction.execute();

      expect(removeActiveWhiteboardUserSpy).toBeCalledTimes(1);
      expect(removeActiveWhiteboardUserSpy).toBeCalledWith(testMessageContext.casefileId, testMessageContext.userId);

      expect(sendPropagatedBroadcastMessageSpy).toBeCalledTimes(1);
      expect(sendPropagatedBroadcastMessageSpy).toHaveBeenLastCalledWith(testMessagePayload);
    });

    it('should retry the cache update if it fails once', async () => {
      const executionSpy = jest.spyOn(WhiteboardUserLeftTransaction.prototype, 'execute');
      jest.spyOn(cacheService, removeActiveWhiteboardUserMethodName).mockImplementation(() => {
        throw new Error();
      });
      const produceKafkaEventSpy = jest.spyOn(kafkaEventProducer, produceKafkaEventMethodName);

      await whiteboardUserLeftTransaction.execute();

      expect(executionSpy).toHaveBeenCalledTimes(2);
      expect(produceKafkaEventSpy).toHaveBeenCalledWith(KafkaTopic.Error, {
        body: new Error(),
        context: testMessageContext,
      });
    });
  });
});
