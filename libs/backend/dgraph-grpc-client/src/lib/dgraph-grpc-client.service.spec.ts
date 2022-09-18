import { DgraphClient, DgraphClientStub, Mutation } from 'dgraph-js';

import { DGRAPH_MODULE_OPTIONS } from './models';
import { DGraphGrpcClientModule } from './dgraph-grpc-client.module';
import { DGraphGrpcClientService } from './dgraph-grpc-client.service';
import { Test } from '@nestjs/testing';

describe('DgraphGrpcClientService', () => {
  const options = { stubs: [{ address: 'test' }], debug: true };
  let clientService: DGraphGrpcClientService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [DGraphGrpcClientModule],
      providers: [DGraphGrpcClientService, { provide: DGRAPH_MODULE_OPTIONS, useValue: options }],
    }).compile();

    clientService = module.get(DGraphGrpcClientService);
  });

  afterEach(() => {
    clientService.close();
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(clientService).toBeTruthy();
  });

  describe('client getter', () => {
    it('should return current client if it is created already', () => {
      expect(clientService.client).toBeTruthy();
      expect(clientService.client).toBeInstanceOf(DgraphClient);
    });

    it('should return null if no client has been created yet', () => {
      clientService.close();

      expect(clientService.client).toBe(null);
    });
  });

  describe('stubs getter', () => {
    it('should return list of current stubs if available', () => {
      expect(clientService.stubs).toBeTruthy();
      expect(clientService.stubs?.length).toBeGreaterThan(0);
      clientService.stubs?.forEach((stub) => {
        expect(stub).toBeInstanceOf(DgraphClientStub);
      });
    });

    it('should return null if no stubs are available', () => {
      clientService.close();

      expect(clientService.stubs).toBe(null);
    });
  });

  describe('createClient', () => {
    it('should return a valid client object', () => {
      const client = clientService.createClient(options);

      expect(client).toBeTruthy();
      expect(client).toBeInstanceOf(DgraphClient);
    });
  });

  describe('create Mutation', () => {
    it('should return a valid mutation object', () => {
      const mutation = clientService.createMutation();

      expect(mutation).toBeTruthy();
      expect(mutation).toBeInstanceOf(Mutation);
    });
  });

  describe('close', () => {
    it('should correctly close connections and reset internal clients and stubs', () => {
      clientService.createClient(options);
      const stubCloseMethodSpies: jest.SpyInstance[] = [];
      clientService.stubs?.forEach((stub) => {
        stubCloseMethodSpies.push(jest.spyOn(stub, 'close'));
      });

      clientService.close();

      expect(clientService.client).toBeFalsy();
      expect(clientService.stubs).toBeFalsy();
      stubCloseMethodSpies.forEach((spy) => {
        expect(spy).toHaveBeenCalledTimes(1);
      });
    });
  });
});
