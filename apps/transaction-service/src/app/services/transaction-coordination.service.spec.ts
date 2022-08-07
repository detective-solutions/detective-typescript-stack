import { MessageEventType, UserRole } from '@detective.solutions/shared/data-access';

import { DGraphGrpcClientModule } from '@detective.solutions/backend/dgraph-grpc-client';
import { Test } from '@nestjs/testing';
import { TransactionCoordinationService } from './transaction-coordination.service';
import { WhiteboardTransactionFactory } from '../transactions';
import { v4 as uuidv4 } from 'uuid';

const whiteboardTransactionFactoryMock = {
  createTransaction: jest.fn(),
};

describe('TransactionCoordinationService', () => {
  let coordinationService: TransactionCoordinationService;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      imports: [DGraphGrpcClientModule.register({ stubs: [{ address: 'test' }], debug: true })],
      providers: [
        TransactionCoordinationService,
        { provide: WhiteboardTransactionFactory, useValue: whiteboardTransactionFactoryMock },
      ],
    }).compile();

    coordinationService = app.get<TransactionCoordinationService>(TransactionCoordinationService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(coordinationService).toBeDefined();
  });

  describe('createTransactionByEventType', () => {
    it('should correctly forward incoming message data to the whiteboard transaction factory', () => {
      const testEventType = MessageEventType.LoadWhiteboardData;
      const testPayload = {
        context: {
          tenantId: uuidv4(),
          casefileId: uuidv4(),
          eventType: MessageEventType.LoadWhiteboardData,
          nodeId: uuidv4(),
          userId: uuidv4(),
          userRole: UserRole.ADMIN,
          timestamp: 123,
        },
        body: { test: '123' },
      };
      const whiteboardTransactionFactorySpy = jest.spyOn(whiteboardTransactionFactoryMock, 'createTransaction');

      coordinationService.createTransactionByEventType(testEventType, testPayload);

      expect(whiteboardTransactionFactorySpy).toHaveBeenCalledTimes(1);
      expect(whiteboardTransactionFactorySpy).toBeCalledWith(testEventType, testPayload);
    });
  });
});
