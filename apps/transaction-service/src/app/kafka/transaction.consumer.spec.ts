import { Test, TestingModule } from '@nestjs/testing';

import { AppService } from '../app.service';
import { TransactionConsumer } from './transaction.consumer';

describe('TransactionConsumer', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [TransactionConsumer],
      providers: [AppService],
    }).compile();
  });

  describe('getData', () => {
    it('should return "Welcome to transaction-service!"', () => {
      const appController = app.get<TransactionConsumer>(TransactionConsumer);
      console.log(appController);
    });
  });
});
