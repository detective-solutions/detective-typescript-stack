import { CacheService, DatabaseService } from '../services';
import {
  ICachableCasefileForWhiteboard,
  IMessage,
  MessageEventType,
  UserRole,
} from '@detective.solutions/shared/data-access';

import { InternalServerErrorException } from '@nestjs/common';
import { KafkaEventProducer } from '../kafka';
import { Test } from '@nestjs/testing';
import { TransactionServiceRefs } from '../models';
import { WhiteboardSaveTransaction } from './whiteboard-save.transaction';
import { WhiteboardWebSocketGateway } from '../websocket';
import { v4 as uuidv4 } from 'uuid';

const getCasefileByIdMethodName = 'getCasefileById';
const cacheServiceMock = {
  [getCasefileByIdMethodName]: jest.fn(),
};

const saveCasefileMethodName = 'saveCasefile';
const databaseServiceMock = {
  [saveCasefileMethodName]: jest.fn(),
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

const testCachableCasefile: ICachableCasefileForWhiteboard = {
  id: uuidv4(),
  title: 'testCasefile',
  nodes: [],
  temporary: { activeUsers: [] },
};

xdescribe('WhiteboardSaveTransaction', () => {
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
        { provide: DatabaseService, useValue: databaseServiceMock },
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
      const getCasefileByIdSpy = jest
        .spyOn(cacheService, getCasefileByIdMethodName)
        .mockResolvedValue(testCachableCasefile);
      const saveCasefileSpy = jest.spyOn(databaseService, saveCasefileMethodName);

      const transaction = new WhiteboardSaveTransaction(serviceRefs, testMessagePayload);
      transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run

      await transaction.execute();

      expect(getCasefileByIdSpy).toBeCalledTimes(1);
      expect(getCasefileByIdSpy).toBeCalledWith(testMessageContext.casefileId);
      expect(saveCasefileSpy).toBeCalledTimes(1);
      expect(saveCasefileSpy).toHaveBeenCalledWith(testCachableCasefile);
    });

    it('should do nothing if no casefile id was returned from cache', async () => {
      const getCasefileByIdSpy = jest.spyOn(cacheService, getCasefileByIdMethodName).mockResolvedValue(null);
      const saveCasefileSpy = jest.spyOn(databaseService, saveCasefileMethodName);

      const transaction = new WhiteboardSaveTransaction(serviceRefs, testMessagePayload);
      transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run

      await transaction.execute();

      expect(getCasefileByIdSpy).toBeCalledTimes(1);
      expect(getCasefileByIdSpy).toBeCalledWith(testMessageContext.casefileId);
      expect(saveCasefileSpy).toBeCalledTimes(0);
    });

    it('should throw an InternalServerException if any error occurs during the transaction', async () => {
      jest.spyOn(cacheService, getCasefileByIdMethodName).mockImplementation(() => {
        throw new Error();
      });

      const transaction = new WhiteboardSaveTransaction(serviceRefs, testMessagePayload);
      transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run

      await expect(transaction.execute()).rejects.toThrow(InternalServerErrorException);
    });
  });
});
