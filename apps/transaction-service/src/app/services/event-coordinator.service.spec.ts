import { DGraphGrpcClientModule } from '@detective.solutions/backend/dgraph-grpc-client';
import { DatabaseService } from './database.service';
import { EventCoordinatorService } from './event-coordinator.service';
import { Test } from '@nestjs/testing';
import { TransactionProducer } from '../kafka';

const databaseServiceMock = {};
const transactionProducerMock = {};

describe('AppService', () => {
  let service: EventCoordinatorService;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      imports: [DGraphGrpcClientModule.register({ stubs: [{ address: 'test' }], debug: true })],
      providers: [
        EventCoordinatorService,
        { provide: DatabaseService, useValue: databaseServiceMock },
        { provide: TransactionProducer, useValue: transactionProducerMock },
      ],
    }).compile();

    service = app.get<EventCoordinatorService>(EventCoordinatorService);
  });

  describe('getData', () => {
    it('should return "Welcome to transaction-service!"', () => {
      expect(service).toBeDefined();
    });
  });
});
