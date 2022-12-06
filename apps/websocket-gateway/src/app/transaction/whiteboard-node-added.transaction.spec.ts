import { CacheService, DatabaseService } from '../services';
import {
  IMessage,
  ITable,
  ITableWhiteboardNode,
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
import { formatDate } from '@detective.solutions/shared/utils';
import { v4 as uuidv4 } from 'uuid';

const sendKafkaMessageMethodName = 'sendKafkaMessage';
const kafkaEventProducerMock = {
  [sendKafkaMessageMethodName]: jest.fn(),
};

const addNodeMethodName = 'addNode';
const cacheServiceMock = {
  [addNodeMethodName]: jest.fn(),
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
  lastUpdated: formatDate(new Date()),
  created: formatDate(new Date()),
  entity: { id: uuidv4() } as ITable,
  type: WhiteboardNodeType.TABLE,
};

const testMessagePayload: IMessage<ITableWhiteboardNode> = {
  context: testMessageContext,
  body: testMessageBody,
};

xdescribe('WhiteboardNodeAddedTransaction', () => {
  let cacheService: CacheService;
  let databaseService: DatabaseService;
  let kafkaEventProducer: KafkaEventProducer;
  let whiteboardWebSocketGateway: WhiteboardWebSocketGateway;
  let serviceRefs: TransactionServiceRefs;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [
        { provide: CacheService, useValue: cacheServiceMock },
        { provide: DatabaseService, useValue: {} }, // Needs to be mocked due to required serviceRefs
        { provide: KafkaEventProducer, useValue: kafkaEventProducerMock },
        { provide: WhiteboardWebSocketGateway, useValue: {} },
      ],
    }).compile();

    cacheService = app.get<CacheService>(CacheService);
    databaseService = app.get<DatabaseService>(DatabaseService);
    kafkaEventProducer = app.get<KafkaEventProducer>(KafkaEventProducer);
    whiteboardWebSocketGateway = app.get<WhiteboardWebSocketGateway>(WhiteboardWebSocketGateway);
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

  xdescribe('execute', () => {
    it('should correctly execute transaction', async () => {
      const sendKafkaMessageSpy = jest.spyOn(kafkaEventProducer, sendKafkaMessageMethodName);
      const addNodeSpy = jest.spyOn(cacheService, addNodeMethodName);

      const transaction = new WhiteboardNodeAddedTransaction(serviceRefs, testMessagePayload);
      transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run

      await transaction.execute();

      expect(sendKafkaMessageSpy).toBeCalledTimes(1);
      expect(sendKafkaMessageSpy).toBeCalledWith(testMessagePayload);
      expect(addNodeSpy).toBeCalledTimes(1);
      expect(addNodeSpy).toBeCalledWith(testMessagePayload.context.casefileId, testMessagePayload.body);
    });

    it('should throw an InternalServerErrorException if the given message is missing a body', async () => {
      const sendKafkaMessageSpy = jest.spyOn(kafkaEventProducer, sendKafkaMessageMethodName);
      const addNodeSpy = jest.spyOn(cacheService, addNodeMethodName);

      const transaction = new WhiteboardNodeAddedTransaction(serviceRefs, {
        context: testMessageContext,
        body: undefined,
      });
      transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run

      await expect(transaction.execute()).rejects.toThrow(InternalServerErrorException);

      expect(sendKafkaMessageSpy).toBeCalledTimes(0);
      expect(addNodeSpy).toBeCalledTimes(0);
    });

    it('should throw an InternalServerException if any error occurs during the transaction', async () => {
      jest.spyOn(cacheService, addNodeMethodName).mockImplementation(() => {
        throw new Error();
      });

      const transaction = new WhiteboardNodeAddedTransaction(serviceRefs, testMessagePayload);
      transaction.logger.localInstance.setLogLevels([]); // Disable logger for test run

      await expect(transaction.execute()).rejects.toThrow(InternalServerErrorException);
    });
  });
});
