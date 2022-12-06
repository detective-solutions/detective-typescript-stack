import { CacheService, DatabaseService } from '../services';
import {
  ICachableCasefileForWhiteboard,
  IUserForWhiteboard,
  MessageEventType,
  UserRole,
} from '@detective.solutions/shared/data-access';

import { InternalServerErrorException } from '@nestjs/common';
import { KafkaEventProducer } from '../kafka';
import { Test } from '@nestjs/testing';
import { WhiteboardUserJoinedTransaction } from './whiteboard-user-joined.transaction';
import { WhiteboardWebSocketGateway } from '../websocket';
import { v4 as uuidv4 } from 'uuid';

const produceKafkaEventMethodName = 'produceKafkaEvent';
const kafkaEventProducerMock = {
  [produceKafkaEventMethodName]: jest.fn(),
};

const getCachedCasefileByIdMethodName = 'getCasefileById';
const saveCasefileToCacheMethodName = 'saveCasefile';
const insertActiveUsersMethodName = 'insertActiveUsers';
const cacheServiceMock = {
  [getCachedCasefileByIdMethodName]: jest.fn(),
  [saveCasefileToCacheMethodName]: jest.fn(),
  [insertActiveUsersMethodName]: jest.fn(),
};

const getCasefileByIdMethodName = 'getCachableCasefileById';
const getWhiteboardUserByIdMethodName = 'getWhiteboardUserById';
const databaseServiceMock = {
  [getCasefileByIdMethodName]: jest.fn(),
  [getWhiteboardUserByIdMethodName]: jest.fn(),
};

const testMessageContext = {
  eventType: MessageEventType.LoadWhiteboardData,
  tenantId: uuidv4(),
  casefileId: uuidv4(),
  userId: uuidv4(),
  userRole: UserRole.BASIC,
  nodeId: 'nodeId',
  timestamp: 123456,
};

const testMessagePayload = {
  context: testMessageContext,
  body: null,
};

const testUserForWhiteboard: IUserForWhiteboard = {
  id: testMessageContext.userId,
  email: 'test@test.com',
  firstname: 'John',
  lastname: 'Doe',
  title: 'Data Scientist',
  avatarUrl: 'http://localhost/testImage',
};

xdescribe('WhiteboardUserJoinedTransaction', () => {
  let whiteboardUserJoinedTransaction: WhiteboardUserJoinedTransaction;
  let cacheService: CacheService;
  let databaseService: DatabaseService;
  let whiteboardWebSocketGateway: WhiteboardWebSocketGateway;
  let kafkaEventProducer: KafkaEventProducer;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [
        { provide: CacheService, useValue: cacheServiceMock },
        { provide: DatabaseService, useValue: databaseServiceMock },
        { provide: WhiteboardWebSocketGateway, useValue: {} }, // Needs to be mocked due to required serviceRefs
        { provide: KafkaEventProducer, useValue: kafkaEventProducerMock },
      ],
    }).compile();

    cacheService = app.get<CacheService>(CacheService);
    databaseService = app.get<DatabaseService>(DatabaseService);
    whiteboardWebSocketGateway = app.get<WhiteboardWebSocketGateway>(WhiteboardWebSocketGateway);
    kafkaEventProducer = app.get<KafkaEventProducer>(KafkaEventProducer);
    whiteboardUserJoinedTransaction = new WhiteboardUserJoinedTransaction(
      {
        cacheService: cacheService,
        databaseService: databaseService,
        whiteboardWebSocketGateway: whiteboardWebSocketGateway,
        kafkaEventProducer: kafkaEventProducer,
      },
      testMessagePayload
    );

    // Disable logger for test runs
    whiteboardUserJoinedTransaction.logger.localInstance.setLogLevels([]);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(whiteboardUserJoinedTransaction).toBeDefined();
  });

  describe('execute', () => {
    it('should correctly load casefile data from database if no cache exists', async () => {
      // Redefine object in every test case because it will be manipulated by the transaction
      const getCasefileByIdResponse: ICachableCasefileForWhiteboard = {
        id: testMessageContext.casefileId,
        title: 'testCasefile',
        nodes: [],
        temporary: { activeUsers: [] },
      };

      const getWhiteboardUserByIdSpy = jest
        .spyOn(databaseService, getWhiteboardUserByIdMethodName)
        .mockResolvedValue(testUserForWhiteboard);
      const getCachedCasefileByIdSpy = jest
        .spyOn(cacheService, getCachedCasefileByIdMethodName)
        .mockResolvedValue(undefined);
      const getDatabaseCasefileByIdSpy = jest
        .spyOn(databaseService, getCasefileByIdMethodName)
        .mockResolvedValue(getCasefileByIdResponse);
      const saveCasefileToCacheSpy = jest.spyOn(cacheService, saveCasefileToCacheMethodName).mockResolvedValue('OK');
      const produceKafkaEventSpy = jest.spyOn(kafkaEventProducer, produceKafkaEventMethodName);

      await whiteboardUserJoinedTransaction.execute();

      expect(getWhiteboardUserByIdSpy).toHaveBeenCalledTimes(1);
      expect(getWhiteboardUserByIdSpy).toBeCalledWith(testMessageContext.userId);

      expect(getCachedCasefileByIdSpy).toBeCalledTimes(1);
      expect(getCachedCasefileByIdSpy).toBeCalledWith(testMessageContext.casefileId);

      expect(getDatabaseCasefileByIdSpy).toBeCalledTimes(1);
      expect(getDatabaseCasefileByIdSpy).toBeCalledWith(testMessageContext.casefileId);

      expect(saveCasefileToCacheSpy).toHaveBeenCalledTimes(1);
      expect(saveCasefileToCacheSpy).toBeCalledWith(getCasefileByIdResponse);

      expect(produceKafkaEventSpy).toBeCalledTimes(2);
      expect(produceKafkaEventSpy).toBeCalledWith({
        context: { ...testMessageContext, eventType: MessageEventType.LoadWhiteboardData },
        body: getCasefileByIdResponse,
      });
      expect(produceKafkaEventSpy).toHaveBeenLastCalledWith({
        context: testMessageContext,
        body: testUserForWhiteboard,
      });
    });

    it('should correctly load casefile data from cache if it exists', async () => {
      // Redefine object in every test case because it will be manipulated by the transaction
      const getCasefileByIdResponse: ICachableCasefileForWhiteboard = {
        id: testMessageContext.casefileId,
        title: 'testCasefile',
        nodes: [],
        temporary: { activeUsers: [] },
      };

      const getWhiteboardUserByIdSpy = jest
        .spyOn(databaseService, getWhiteboardUserByIdMethodName)
        .mockResolvedValue(testUserForWhiteboard);
      const getCachedCasefileByIdSpy = jest
        .spyOn(cacheService, getCachedCasefileByIdMethodName)
        .mockResolvedValue(getCasefileByIdResponse);
      const getDatabaseCasefileByIdSpy = jest.spyOn(databaseService, getCasefileByIdMethodName);
      const saveCasefileToCacheSpy = jest.spyOn(cacheService, saveCasefileToCacheMethodName);
      const addActiveWhiteboardUsersSpy = jest.spyOn(cacheService, insertActiveUsersMethodName);
      const produceKafkaEventSpy = jest.spyOn(kafkaEventProducer, produceKafkaEventMethodName);

      await whiteboardUserJoinedTransaction.execute();

      expect(getWhiteboardUserByIdSpy).toHaveBeenCalledTimes(1);
      expect(getWhiteboardUserByIdSpy).toBeCalledWith(testMessageContext.userId);

      expect(getCachedCasefileByIdSpy).toHaveBeenCalledTimes(1);
      expect(getCachedCasefileByIdSpy).toBeCalledWith(testMessageContext.casefileId);

      expect(getDatabaseCasefileByIdSpy).toBeCalledTimes(0);
      expect(saveCasefileToCacheSpy).toBeCalledTimes(0);

      expect(addActiveWhiteboardUsersSpy).toBeCalledTimes(1);
      expect(addActiveWhiteboardUsersSpy).toBeCalledWith(testMessageContext.casefileId, [testUserForWhiteboard]);

      expect(produceKafkaEventSpy).toBeCalledTimes(2);
      expect(produceKafkaEventSpy).toBeCalledWith({
        context: { ...testMessageContext, eventType: MessageEventType.LoadWhiteboardData },
        body: getCasefileByIdResponse,
      });
      expect(produceKafkaEventSpy).toBeCalledWith({
        context: testMessageContext,
        body: testUserForWhiteboard,
      });
    });

    it('should not add a new active user if the joined user is already cached', async () => {
      // Redefine object in every test case because it will be manipulated by the transaction
      const getCasefileByIdResponse: ICachableCasefileForWhiteboard = {
        id: uuidv4(),
        title: 'testCasefile',
        nodes: [],
        temporary: {
          activeUsers: [testUserForWhiteboard],
        },
      };

      jest.spyOn(databaseService, getWhiteboardUserByIdMethodName).mockResolvedValue(testUserForWhiteboard);
      jest.spyOn(cacheService, getCachedCasefileByIdMethodName).mockResolvedValue(getCasefileByIdResponse);
      const insertActiveUsersSpy = jest.spyOn(cacheService, insertActiveUsersMethodName);
      const produceKafkaEventSpy = jest.spyOn(kafkaEventProducer, produceKafkaEventMethodName);

      await whiteboardUserJoinedTransaction.execute();

      expect(insertActiveUsersSpy).toBeCalledTimes(0);
      expect(produceKafkaEventSpy).toBeCalledTimes(2);
      expect(produceKafkaEventSpy).toBeCalledWith({
        context: { ...testMessageContext, eventType: MessageEventType.LoadWhiteboardData },
        body: getCasefileByIdResponse,
      });
      expect(produceKafkaEventSpy).toBeCalledWith({
        context: testMessageContext,
        body: testUserForWhiteboard,
      });
    });

    it('should throw an InternalServerException if any error occurs during the transaction', async () => {
      jest.spyOn(cacheService, getCachedCasefileByIdMethodName).mockImplementation(() => {
        throw new Error();
      });

      await expect(whiteboardUserJoinedTransaction.execute()).rejects.toThrow(InternalServerErrorException);
    });
  });
});
