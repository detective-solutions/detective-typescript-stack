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

const sendPropagatedBroadcastMessageMethodName = 'sendPropagatedBroadcastMessage';
const sendPropagatedUnicastMessageMethodName = 'sendPropagatedUnicastMessage';
const mockWhiteboardWebSocketGateway = {
  [sendPropagatedBroadcastMessageMethodName]: jest.fn(),
  [sendPropagatedUnicastMessageMethodName]: jest.fn(),
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

describe('WhiteboardUserJoinedTransaction', () => {
  let whiteboardUserJoinedTransaction: WhiteboardUserJoinedTransaction;
  let whiteboardWebSocketGateway: WhiteboardWebSocketGateway;
  let cacheService: CacheService;
  let databaseService: DatabaseService;
  let kafkaEventProducer: KafkaEventProducer;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [
        { provide: WhiteboardWebSocketGateway, useValue: mockWhiteboardWebSocketGateway },
        { provide: CacheService, useValue: cacheServiceMock },
        { provide: DatabaseService, useValue: databaseServiceMock },
        { provide: KafkaEventProducer, useValue: {} }, // Needs to be mocked due to required serviceRefs
      ],
    }).compile();

    whiteboardWebSocketGateway = app.get<WhiteboardWebSocketGateway>(WhiteboardWebSocketGateway);
    cacheService = app.get<CacheService>(CacheService);
    databaseService = app.get<DatabaseService>(DatabaseService);
    kafkaEventProducer = app.get<KafkaEventProducer>(KafkaEventProducer);
    whiteboardUserJoinedTransaction = new WhiteboardUserJoinedTransaction(
      {
        whiteboardWebSocketGateway: whiteboardWebSocketGateway,
        cacheService: cacheService,
        databaseService: databaseService,
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
      const sendPropagatedUnicastMessageSpy = jest.spyOn(
        mockWhiteboardWebSocketGateway,
        sendPropagatedUnicastMessageMethodName
      );
      const sendPropagatedBroadcastMessageSpy = jest.spyOn(
        mockWhiteboardWebSocketGateway,
        sendPropagatedBroadcastMessageMethodName
      );

      await whiteboardUserJoinedTransaction.execute();

      expect(getWhiteboardUserByIdSpy).toHaveBeenCalledTimes(1);
      expect(getWhiteboardUserByIdSpy).toBeCalledWith(testMessageContext.userId);

      expect(getCachedCasefileByIdSpy).toBeCalledTimes(1);
      expect(getCachedCasefileByIdSpy).toBeCalledWith(testMessageContext.casefileId);

      expect(getDatabaseCasefileByIdSpy).toBeCalledTimes(1);
      expect(getDatabaseCasefileByIdSpy).toBeCalledWith(testMessageContext.casefileId);

      expect(saveCasefileToCacheSpy).toHaveBeenCalledTimes(1);
      expect(saveCasefileToCacheSpy).toBeCalledWith(getCasefileByIdResponse);

      expect(sendPropagatedUnicastMessageSpy).toBeCalledTimes(1);
      expect(sendPropagatedUnicastMessageSpy).toBeCalledWith({
        context: { ...testMessageContext, eventType: MessageEventType.LoadWhiteboardData },
        body: getCasefileByIdResponse,
      });

      expect(sendPropagatedBroadcastMessageSpy).toBeCalledTimes(1);
      expect(sendPropagatedBroadcastMessageSpy).toHaveBeenLastCalledWith({
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
      const sendPropagatedUnicastMessageSpy = jest.spyOn(
        mockWhiteboardWebSocketGateway,
        sendPropagatedUnicastMessageMethodName
      );
      const sendPropagatedBroadcastMessageSpy = jest.spyOn(
        mockWhiteboardWebSocketGateway,
        sendPropagatedBroadcastMessageMethodName
      );

      await whiteboardUserJoinedTransaction.execute();

      expect(getWhiteboardUserByIdSpy).toHaveBeenCalledTimes(1);
      expect(getWhiteboardUserByIdSpy).toBeCalledWith(testMessageContext.userId);

      expect(getCachedCasefileByIdSpy).toHaveBeenCalledTimes(1);
      expect(getCachedCasefileByIdSpy).toBeCalledWith(testMessageContext.casefileId);

      expect(getDatabaseCasefileByIdSpy).toBeCalledTimes(0);
      expect(saveCasefileToCacheSpy).toBeCalledTimes(0);

      expect(addActiveWhiteboardUsersSpy).toBeCalledTimes(1);
      expect(addActiveWhiteboardUsersSpy).toBeCalledWith(testMessageContext.casefileId, [testUserForWhiteboard]);

      expect(sendPropagatedUnicastMessageSpy).toBeCalledTimes(1);
      expect(sendPropagatedUnicastMessageSpy).toBeCalledWith({
        context: { ...testMessageContext, eventType: MessageEventType.LoadWhiteboardData },
        body: getCasefileByIdResponse,
      });

      expect(sendPropagatedBroadcastMessageSpy).toBeCalledTimes(1);
      expect(sendPropagatedBroadcastMessageSpy).toBeCalledWith({
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
      const sendPropagatedUnicastMessageSpy = jest.spyOn(
        mockWhiteboardWebSocketGateway,
        sendPropagatedUnicastMessageMethodName
      );
      const sendPropagatedBroadcastMessageSpy = jest.spyOn(
        mockWhiteboardWebSocketGateway,
        sendPropagatedBroadcastMessageMethodName
      );

      await whiteboardUserJoinedTransaction.execute();

      expect(insertActiveUsersSpy).toBeCalledTimes(0);

      expect(sendPropagatedUnicastMessageSpy).toBeCalledTimes(1);
      expect(sendPropagatedUnicastMessageSpy).toBeCalledWith({
        context: { ...testMessageContext, eventType: MessageEventType.LoadWhiteboardData },
        body: getCasefileByIdResponse,
      });

      expect(sendPropagatedBroadcastMessageSpy).toBeCalledTimes(1);
      expect(sendPropagatedBroadcastMessageSpy).toBeCalledWith({
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
