import { CacheService, DatabaseService } from '../services';
import { MessageEventType, UserRole } from '@detective.solutions/shared/data-access';

import { InternalServerErrorException } from '@nestjs/common';
import { KafkaEventProducer } from '../kafka';
import { Test } from '@nestjs/testing';
import { WhiteboardUserLeftTransaction } from './whiteboard-user-left.transaction';
import { WhiteboardWebSocketGateway } from '../websocket';
import { v4 as uuidv4 } from 'uuid';

const sendKafkaMessageMethodName = 'sendKafkaMessage';
const kafkaEventProducerMock = {
  [sendKafkaMessageMethodName]: jest.fn(),
};

const removeActiveWhiteboardUserMethodName = 'removeActiveUser';
const cacheServiceMock = {
  [removeActiveWhiteboardUserMethodName]: jest.fn(),
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
  let cacheService: CacheService;
  let databaseService: DatabaseService;
  let whiteboardWebSocketGateway: WhiteboardWebSocketGateway;
  let kafkaEventProducer: KafkaEventProducer;

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
    whiteboardUserLeftTransaction = new WhiteboardUserLeftTransaction(
      {
        cacheService: cacheService,
        databaseService: databaseService,
        whiteboardWebSocketGateway: whiteboardWebSocketGateway,
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

  xdescribe('execute', () => {
    it('should correctly load casefile data from database if no cache exists', async () => {
      const removeActiveWhiteboardUserSpy = jest.spyOn(cacheService, removeActiveWhiteboardUserMethodName);
      const sendKafkaMessageSpy = jest.spyOn(kafkaEventProducer, sendKafkaMessageMethodName);

      await whiteboardUserLeftTransaction.execute();

      expect(removeActiveWhiteboardUserSpy).toBeCalledTimes(1);
      expect(removeActiveWhiteboardUserSpy).toBeCalledWith(testMessageContext.casefileId, testMessageContext.userId);

      expect(sendKafkaMessageSpy).toBeCalledTimes(1);
      expect(sendKafkaMessageSpy).toHaveBeenLastCalledWith(testMessagePayload);
    });

    it('should throw an InternalServerException if any error occurs during the transaction', async () => {
      jest.spyOn(cacheService, removeActiveWhiteboardUserMethodName).mockImplementation(() => {
        throw new Error();
      });

      await expect(whiteboardUserLeftTransaction.execute()).rejects.toThrow(InternalServerErrorException);
    });
  });
});
