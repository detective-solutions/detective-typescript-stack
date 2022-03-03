import { Test, TestingModule } from '@nestjs/testing';

import { DGraphGrpcClientModule } from './dgraph-grpc-client.module';
import { DGraphGrpcClientService } from './dgraph-grpc-client.service';

describe('DGraphGrpcClientModule', () => {
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [DGraphGrpcClientModule.register({ stubs: [{ address: 'test' }], debug: true })],
    }).compile();
  });

  it('should compile the module', async () => {
    expect(moduleRef).toBeDefined();
    expect(moduleRef.get(DGraphGrpcClientService)).toBeInstanceOf(DGraphGrpcClientService);
  });

  it('should close all clients when function when the module is', async () => {
    const clientService = moduleRef.get(DGraphGrpcClientService);
    const destroySpy = jest.spyOn(clientService, 'close');

    await moduleRef.close();

    expect(destroySpy).toHaveBeenCalledTimes(1);
  });
});
