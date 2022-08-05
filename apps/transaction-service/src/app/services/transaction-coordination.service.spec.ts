import { DGraphGrpcClientModule } from '@detective.solutions/backend/dgraph-grpc-client';
import { DatabaseService } from './database.service';
import { Test } from '@nestjs/testing';
import { TransactionCoordinationService } from './transaction-coordination.service';
import { TransactionProducer } from '../kafka';

const databaseServiceMock = {};
const transactionProducerMock = {};

describe('AppService', () => {
  let service: TransactionCoordinationService;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      imports: [DGraphGrpcClientModule.register({ stubs: [{ address: 'test' }], debug: true })],
      providers: [
        TransactionCoordinationService,
        { provide: DatabaseService, useValue: databaseServiceMock },
        { provide: TransactionProducer, useValue: transactionProducerMock },
      ],
    }).compile();

    service = app.get<TransactionCoordinationService>(TransactionCoordinationService);
  });

  describe('getData', () => {
    it('should return "Welcome to transaction-service!"', () => {
      expect(service).toBeDefined();
    });
  });
});
