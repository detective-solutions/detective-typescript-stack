import { DGraphGrpcClientModule } from '@detective.solutions/backend/dgraph-grpc-client';
import { DatabaseService } from './database.service';
import { EventCoordinatorService } from './event-coordinator.service';
import { Test } from '@nestjs/testing';

describe('AppService', () => {
  let service: EventCoordinatorService;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      imports: [DGraphGrpcClientModule.register({ stubs: [{ address: 'test' }], debug: true })],
      providers: [EventCoordinatorService, DatabaseService],
    }).compile();

    service = app.get<EventCoordinatorService>(EventCoordinatorService);
  });

  describe('getData', () => {
    it('should return "Welcome to transaction-service!"', () => {
      expect(service).toBeDefined();
    });
  });
});
